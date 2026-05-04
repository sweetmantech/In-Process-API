/** Max size of a single chunk (4 MiB). */
const chunkUploadMaxPartBytes = 4 * 1024 * 1024;

/** Max assembled file size for chunk uploads (444 MiB). */
export const chunkUploadMaxTotalBytes = 444 * 1024 * 1024;

export const chunkUploadMaxChunkCount = Math.ceil(
  chunkUploadMaxTotalBytes / chunkUploadMaxPartBytes
);

export default chunkUploadMaxPartBytes;
