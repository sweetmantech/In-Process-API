export default function chunkUploadBlobPathname(
  sessionId: string,
  chunkIndex: number
): string {
  return `in-process-chunk-uploads/${sessionId}/${chunkIndex}`;
}
