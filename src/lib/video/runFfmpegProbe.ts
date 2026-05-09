import { execFile } from 'child_process';
import { promisify } from 'util';
import ffmpegPath from 'ffmpeg-static';

const execFileAsync = promisify(execFile);

export default async function runFfmpegProbe(
  filePath: string
): Promise<string> {
  try {
    // ffmpeg always writes stream info to stderr; stdout is empty with -f null
    const { stderr } = await execFileAsync(ffmpegPath as string, [
      '-hide_banner',
      '-i',
      filePath,
    ]);
    return stderr;
  } catch (err: any) {
    // ffmpeg exits non-zero when given -i with no output — stderr still has the info
    return err.stderr ?? '';
  }
}
