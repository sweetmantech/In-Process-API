import readMp4BoxHeader, { type Mp4Box } from './readMp4BoxHeader';

/**
 * Walks sibling boxes in [start, end) and returns them in order. Stops on
 * the first malformed header rather than throwing, so callers can treat a
 * truncated/corrupt atom tree as "no metadata" instead of a hard failure.
 */
const listMp4ChildBoxes = (
  buffer: Buffer,
  start: number,
  end: number
): Mp4Box[] => {
  const boxes: Mp4Box[] = [];
  let offset = start;

  while (offset + 8 <= end) {
    const box = readMp4BoxHeader(buffer, offset);
    if (!box || box.contentEnd <= offset || box.contentEnd > end) break;
    boxes.push(box);
    offset = box.contentEnd;
  }

  return boxes;
};

export default listMp4ChildBoxes;
