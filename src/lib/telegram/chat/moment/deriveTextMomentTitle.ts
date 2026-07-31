const TITLE_MAX_LENGTH = 100;

const deriveTextMomentTitle = (content: string): string => {
  const firstLine =
    content
      .split('\n')
      .map((line) => line.trim())
      .find((line) => line.length > 0) ?? '';
  if (!firstLine) return '';
  if (firstLine.length <= TITLE_MAX_LENGTH) return firstLine;
  return `${firstLine.slice(0, TITLE_MAX_LENGTH - 1)}…`;
};

export default deriveTextMomentTitle;
