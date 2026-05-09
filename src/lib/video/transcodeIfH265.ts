import { promises as fs } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { probeVideo } from './probeVideo';
import { transcodeToH264 } from './transcodeToH264';

export async function transcodeIfH265(videoFile: File): Promise<File> {
  const id = `${Date.now()}-${Math.random().toString(36).substring(7)}`;
  const inputPath = join(tmpdir(), `transcode-input-${id}.mp4`);
  const outputPath = join(tmpdir(), `transcode-output-${id}.mp4`);

  try {
    const buffer = Buffer.from(await videoFile.arrayBuffer());
    await fs.writeFile(inputPath, buffer);

    const probe = await probeVideo(inputPath);

    console.log('Video probe result', {
      fileName: videoFile.name,
      codec: probe.codec,
      needsReencode: probe.needsReencode,
      reason: probe.reason,
    });

    if (!probe.needsReencode) return videoFile;

    console.log('Transcoding to H.264', {
      fileName: videoFile.name,
      reason: probe.reason,
      fileSizeMB: (videoFile.size / (1024 * 1024)).toFixed(2),
    });

    const transcodeStart = Date.now();
    await transcodeToH264(inputPath, outputPath);
    const transcodeSeconds = ((Date.now() - transcodeStart) / 1000).toFixed(2);

    const transcodedBuffer = await fs.readFile(outputPath);
    const transcodedName = videoFile.name.replace(/\.[^.]+$/, '.mp4');
    const transcodedFile = new File([transcodedBuffer], transcodedName, {
      type: 'video/mp4',
    });

    console.log('Transcode completed', {
      fileName: videoFile.name,
      originalSizeMB: (videoFile.size / (1024 * 1024)).toFixed(2),
      transcodedSizeMB: (transcodedFile.size / (1024 * 1024)).toFixed(2),
      transcodeTimeSeconds: transcodeSeconds,
    });

    return transcodedFile;
  } finally {
    await fs.unlink(inputPath).catch(() => {});
    await fs.unlink(outputPath).catch(() => {});
  }
}
