import { stat } from 'fs/promises';
import runFfmpegProbe from './runFfmpegProbe';
import parseCodec from './parseCodec';

export interface VideoProbeResult {
  codec: string | null;
  needsReencode: boolean;
  reason: string;
}

export async function probeVideo(filePath: string): Promise<VideoProbeResult> {
  const output = await runFfmpegProbe(filePath);
  const codec = parseCodec(output);

  if (!codec) {
    return { codec: null, needsReencode: false, reason: 'no video stream' };
  }

  if (codec === 'hevc') {
    return { codec, needsReencode: true, reason: 'H.265 codec' };
  }

  if (codec === 'h264') {
    const { size } = await stat(filePath);
    const fileSizeMB = size / (1024 * 1024);
    if (fileSizeMB > 50) {
      return {
        codec,
        needsReencode: true,
        reason: `large H.264 file (${fileSizeMB.toFixed(1)} MB)`,
      };
    }
    return {
      codec,
      needsReencode: false,
      reason: `H.264 OK (${fileSizeMB.toFixed(1)} MB)`,
    };
  }

  return { codec, needsReencode: false, reason: `codec ${codec} not targeted` };
}
