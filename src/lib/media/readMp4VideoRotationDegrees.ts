import listMp4ChildBoxes from './listMp4ChildBoxes';
import readTkhdMatrix from './readTkhdMatrix';

/**
 * Reads the clockwise rotation (0/90/180/270) needed to display a video's
 * raw encoded frames correctly, from the video track's `tkhd` display
 * matrix (moov/trak/tkhd). iPhone videos recorded in portrait store the
 * frame as landscape pixels plus this matrix instead of rotating the
 * pixels themselves — Mux/native players apply it automatically, but a
 * thumbnail taken from the raw frame bytes needs it applied manually.
 *
 * Returns 0 when no rotation is needed, and undefined when no video track
 * (a `tkhd` with non-zero width/height) or matrix can be found — callers
 * should treat both the same way (skip correction).
 */
const readMp4VideoRotationDegrees = (buffer: Buffer): number | undefined => {
  const moov = listMp4ChildBoxes(buffer, 0, buffer.length).find(
    (box) => box.type === 'moov'
  );
  if (!moov) return undefined;

  const traks = listMp4ChildBoxes(
    buffer,
    moov.contentStart,
    moov.contentEnd
  ).filter((box) => box.type === 'trak');

  for (const trak of traks) {
    const tkhd = listMp4ChildBoxes(
      buffer,
      trak.contentStart,
      trak.contentEnd
    ).find((box) => box.type === 'tkhd');
    if (!tkhd) continue;

    const matrix = readTkhdMatrix(buffer, tkhd);
    if (!matrix || matrix.width <= 0 || matrix.height <= 0) continue;

    const degrees = Math.atan2(matrix.b, matrix.a) * (180 / Math.PI);
    return (((Math.round(degrees / 90) * 90) % 360) + 360) % 360;
  }

  return undefined;
};

export default readMp4VideoRotationDegrees;
