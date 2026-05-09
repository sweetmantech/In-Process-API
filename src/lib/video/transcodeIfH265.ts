import { promises as fs } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { probeVideo } from './probeVideo';
import { transcodeToH264 } from './transcodeToH264';

export interface TranscodeResult {
  file: File;
  codec: string | null;
  needsReencode: boolean;
  reason: string;
  transcodeTimeSeconds?: string;
  originalSizeMB: string;
  transcodedSizeMB?: string;
}

export async function transcodeIfH265(
  videoFile: File
): Promise<TranscodeResult> {
  const id = `${Date.now()}-${Math.random().toString(36).substring(7)}`;
  const inputPath = join(tmpdir(), `transcode-input-${id}.mp4`);
  const outputPath = join(tmpdir(), `transcode-output-${id}.mp4`);

  const originalSizeMB = (videoFile.size / (1024 * 1024)).toFixed(2);

  try {
    const buffer = Buffer.from(await videoFile.arrayBuffer());
    await fs.writeFile(inputPath, buffer);

    const probe = await probeVideo(inputPath);

    if (!probe.needsReencode) {
      return {
        file: videoFile,
        codec: probe.codec,
        needsReencode: false,
        reason: probe.reason,
        originalSizeMB,
      };
    }

    const transcodeStart = Date.now();
    await transcodeToH264(inputPath, outputPath);
    const transcodeTimeSeconds = ((Date.now() - transcodeStart) / 1000).toFixed(
      2
    );

    const transcodedBuffer = await fs.readFile(outputPath);
    const transcodedName = videoFile.name.replace(/\.[^.]+$/, '.mp4');
    const transcodedFile = new File([transcodedBuffer], transcodedName, {
      type: 'video/mp4',
    });

    return {
      file: transcodedFile,
      codec: probe.codec,
      needsReencode: true,
      reason: probe.reason,
      transcodeTimeSeconds,
      originalSizeMB,
      transcodedSizeMB: (transcodedFile.size / (1024 * 1024)).toFixed(2),
    };
  } finally {
    await fs.unlink(inputPath).catch(() => {});
    await fs.unlink(outputPath).catch(() => {});
  }
}
