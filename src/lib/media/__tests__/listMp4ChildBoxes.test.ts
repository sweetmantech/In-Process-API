import { describe, it, expect } from 'vitest';
import listMp4ChildBoxes from '../listMp4ChildBoxes';

const box = (type: string, payload: Buffer = Buffer.alloc(0)): Buffer => {
  const header = Buffer.alloc(8);
  header.writeUInt32BE(8 + payload.length, 0);
  header.write(type, 4, 'ascii');
  return Buffer.concat([header, payload]);
};

describe('listMp4ChildBoxes', () => {
  it('walks sibling boxes in order', () => {
    const buffer = Buffer.concat([
      box('ftyp', Buffer.from('qt  ')),
      box('free'),
      box('moov', Buffer.from('x')),
    ]);

    const boxes = listMp4ChildBoxes(buffer, 0, buffer.length);
    expect(boxes.map((b) => b.type)).toEqual(['ftyp', 'free', 'moov']);
  });

  it('scopes to the given [start, end) range', () => {
    const inner = Buffer.concat([box('keys'), box('ilst')]);
    const buffer = Buffer.concat([box('meta', inner)]);
    const meta = listMp4ChildBoxes(buffer, 0, buffer.length)[0];

    const children = listMp4ChildBoxes(
      buffer,
      meta.contentStart,
      meta.contentEnd
    );
    expect(children.map((b) => b.type)).toEqual(['keys', 'ilst']);
  });

  it('returns an empty array for an empty range', () => {
    expect(listMp4ChildBoxes(Buffer.alloc(0), 0, 0)).toEqual([]);
  });

  it('stops at the first malformed header instead of throwing', () => {
    const buffer = Buffer.concat([box('free'), Buffer.from('ab')]);

    expect(
      listMp4ChildBoxes(buffer, 0, buffer.length).map((b) => b.type)
    ).toEqual(['free']);
  });
});
