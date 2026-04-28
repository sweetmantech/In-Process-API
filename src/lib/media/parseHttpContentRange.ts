export type ParsedContentRange = {
  start: number;
  end: number;
  total: number | null;
};

/**
 * Parses a single `Content-Range` response header (`bytes start-end/total` or `*`).
 */
const parseHttpContentRange = (
  header: string | null
): ParsedContentRange | null => {
  if (!header) return null;
  const m = header.trim().match(/^bytes (\d+)-(\d+)\/(\d+|\*)$/);
  if (!m) return null;
  return {
    start: parseInt(m[1], 10),
    end: parseInt(m[2], 10),
    total: m[3] === '*' ? null : parseInt(m[3], 10),
  };
};

export default parseHttpContentRange;
