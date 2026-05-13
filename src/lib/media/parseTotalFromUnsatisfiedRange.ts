/** RFC 7233: unsatisfiable range may include total representation size (bytes asterisk-slash-length). */
const parseTotalFromUnsatisfiedRange = (
  header: string | null
): number | null => {
  if (!header) return null;
  const m = header.trim().match(new RegExp('^bytes \\*/(\\d+)$'));
  return m ? parseInt(m[1], 10) : null;
};

export default parseTotalFromUnsatisfiedRange;
