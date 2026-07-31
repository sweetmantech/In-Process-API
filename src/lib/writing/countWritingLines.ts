const countWritingLines = (text: string): number => {
  let totalLines = 0;
  for (const paragraph of text.split('\n')) {
    totalLines += parseInt(Number(paragraph.length / 64).toFixed()) + 1;
  }
  return totalLines;
};

export default countWritingLines;
