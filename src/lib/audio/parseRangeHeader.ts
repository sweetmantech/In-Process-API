interface StreamRange {
  start: number;
  end: number | undefined;
}

const parseRangeHeader = (
  rangeHeader: string | null,
  totalSize: number
): StreamRange | null => {
  if (!rangeHeader) return null;

  if (rangeHeader.includes(',')) return null;

  const match = rangeHeader.match(/^bytes=(\d+)-(\d*)$/);
  if (!match) return null;

  const start = parseInt(match[1], 10);
  const end = match[2] ? parseInt(match[2], 10) : undefined;

  if (isNaN(start) || start < 0 || start >= totalSize) {
    return null;
  }

  if (end !== undefined && (isNaN(end) || end < start || end >= totalSize)) {
    return null;
  }

  return { start, end };
};

export default parseRangeHeader;
