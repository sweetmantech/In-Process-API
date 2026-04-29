/** Larger first segment / fewer round-trips for video range requests. */
export const MEDIA_STREAM_MAX_CHUNK_BYTES = 16 * 1024 * 1024;

/**
 * Builds a single-byte-range `Range` header for the origin from the client's
 * `Range` header. Returns null when the client range is missing or unusable
 * (multi-range, malformed) so the origin receives a full-resource GET.
 */
const buildUpstreamRangeHeader = (
  rangeHeader: string | null
): string | null => {
  if (!rangeHeader || rangeHeader.includes(',')) return null;

  const match = rangeHeader.match(/^bytes=(\d+)-(\d*)$/);
  if (!match) return null;

  const start = parseInt(match[1], 10);
  if (isNaN(start) || start < 0) return null;

  const endStr = match[2];
  const endExplicit = endStr ? parseInt(endStr, 10) : undefined;
  if (
    endExplicit !== undefined &&
    (isNaN(endExplicit) || endExplicit < start)
  ) {
    return null;
  }

  const cappedEnd =
    endExplicit !== undefined
      ? Math.min(endExplicit, start + MEDIA_STREAM_MAX_CHUNK_BYTES - 1)
      : start + MEDIA_STREAM_MAX_CHUNK_BYTES - 1;

  return `bytes=${start}-${cappedEnd}`;
};

export default buildUpstreamRangeHeader;
