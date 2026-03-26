const PHOTO_W = 175;
const PHOTO_H = 165;

// Pre-defined scattered positions: [x, y, rotateDeg]
// x/y = top-left corner of each photo (before rotation)
const PHOTO_LAYOUTS: [number, number, number][] = [
  [168, 122, -7],
  [18, 27, 14],
  [313, 13, -9],
  [-12, 202, 6],
  [303, 178, -13],
  [88, 298, 8],
  [283, 303, -5],
  [183, 253, 11],
  [43, 153, -16],
];

const CollageGrid = ({
  imageDataUrls,
  artistName,
  size = 500,
}: {
  imageDataUrls: string[];
  artistName: string;
  size?: number;
}) => {
  if (imageDataUrls.length === 0) {
    return (
      <div
        style={{
          width: size,
          height: size,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#1a1a1a',
          fontFamily: 'Archivo',
          fontSize: 24,
          color: '#888',
        }}
      >
        No images
      </div>
    );
  }

  return (
    <div
      style={{
        width: size,
        height: size,
        display: 'flex',
        position: 'relative',
        backgroundColor: '#1a1a1a',
        overflow: 'hidden',
      }}
    >
      {imageDataUrls.map((url, i) => {
        const [x, y, rotate] = PHOTO_LAYOUTS[i % PHOTO_LAYOUTS.length];
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              width: PHOTO_W,
              height: PHOTO_H,
              padding: 8,
              backgroundColor: '#ffffff',
              boxShadow: '2px 4px 12px rgba(0,0,0,0.6)',
              transform: `rotate(${rotate}deg)`,
              display: 'flex',
            }}
          >
            {/* eslint-disable-next-line */}
            <img
              src={url}
              style={{
                width: PHOTO_W - 16,
                height: PHOTO_H - 16,
                objectFit: 'cover',
              }}
            />
          </div>
        );
      })}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '8px 12px',
          backgroundColor: 'rgba(0,0,0,0.6)',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <span
          style={{
            fontFamily: 'Archivo',
            fontSize: 16,
            color: '#ffffff',
          }}
        >
          {artistName}
        </span>
      </div>
    </div>
  );
};

export default CollageGrid;
