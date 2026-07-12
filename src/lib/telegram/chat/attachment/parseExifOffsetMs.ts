const EXIF_OFFSET_PATTERN = /^([+-])(\d{2}):(\d{2})$/;

/** Parses an EXIF offset string (e.g. "+09:00") into milliseconds. */
const parseExifOffsetMs = (raw: unknown): number | undefined => {
  if (typeof raw !== 'string') return undefined;
  const match = EXIF_OFFSET_PATTERN.exec(raw);
  if (!match) return undefined;
  const [, sign, hours, minutes] = match;
  const magnitudeMs = (Number(hours) * 60 + Number(minutes)) * 60_000;
  return sign === '-' ? -magnitudeMs : magnitudeMs;
};

export default parseExifOffsetMs;
