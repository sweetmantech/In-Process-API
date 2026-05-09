export default function parseCodec(ffmpegOutput: string): string | null {
  const match = ffmpegOutput.match(/Video:\s+(\w+)/);
  return match ? match[1].toLowerCase() : null;
}
