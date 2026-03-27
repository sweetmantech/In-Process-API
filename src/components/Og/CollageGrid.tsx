const COLS = 7;
const SPROCKET_AREA_H = 28;
const SPROCKET_HOLE_W = 16;
const SPROCKET_HOLE_H = 22;
const IMAGE_GAP = 3;
/** Dark warm brown — classic developed film base colour */
const FILM_COLOR = '#1a1710';
/** Amber-cream perforation colour, visible against the dark base */
const HOLE_COLOR = '#b09050';

const CollageGrid = ({
  imageDataUrls,
  artistName,
  totalMoments,
  backgroundUrl,
  width = 700,
  height = 350,
}: {
  imageDataUrls: string[];
  artistName: string;
  totalMoments?: number;
  backgroundUrl?: string;
  width?: number;
  height?: number;
}) => {
  const bgStyle = backgroundUrl
    ? {
        backgroundImage: `url('${backgroundUrl}')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }
    : { backgroundColor: '#e8e8e4' };

  if (imageDataUrls.length === 0) {
    return (
      <div
        style={{
          width,
          height,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'Archivo',
          fontSize: 24,
          color: '#605F5C',
          ...bgStyle,
        }}
      >
        No images
      </div>
    );
  }

  // Account for gaps so the strip fits within the canvas width
  const cellW = Math.floor((width - IMAGE_GAP * (COLS - 1)) / COLS);
  const cellH = cellW;
  const stripW = cellW * COLS + IMAGE_GAP * (COLS - 1);

  const sprocketRow = (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        height: SPROCKET_AREA_H,
        alignItems: 'center',
        backgroundColor: FILM_COLOR,
        gap: IMAGE_GAP,
      }}
    >
      {Array.from({ length: COLS }).map((_, i) => (
        <div
          key={i}
          style={{
            width: cellW,
            height: SPROCKET_AREA_H,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: FILM_COLOR,
          }}
        >
          <div
            style={{
              width: SPROCKET_HOLE_W,
              height: SPROCKET_HOLE_H,
              backgroundColor: HOLE_COLOR,
              borderRadius: 4,
            }}
          />
        </div>
      ))}
    </div>
  );

  return (
    <div
      style={{
        width,
        height,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        ...bgStyle,
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: stripW,
          backgroundColor: FILM_COLOR,
        }}
      >
        {sprocketRow}
        {/* 1px separator line between sprocket area and images */}
        <div style={{ height: 1, backgroundColor: '#0d0c08' }} />
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            gap: IMAGE_GAP,
            backgroundColor: FILM_COLOR,
          }}
        >
          {imageDataUrls.map((url, i) => (
            <div
              key={i}
              style={{
                width: cellW,
                height: cellH,
                display: 'flex',
              }}
            >
              {/* eslint-disable-next-line */}
              <img
                src={url}
                style={{
                  width: cellW,
                  height: cellH,
                  objectFit: 'cover',
                }}
              />
            </div>
          ))}
        </div>
        {/* 1px separator line between images and sprocket area */}
        <div style={{ height: 1, backgroundColor: '#0d0c08' }} />
        {sprocketRow}
      </div>
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '6px 12px',
          backgroundColor: 'rgba(0,0,0,0.45)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <span
          style={{
            fontFamily: 'Archivo',
            fontSize: 14,
            color: '#ffffff',
          }}
        >
          {artistName}
        </span>
        {totalMoments !== undefined && (
          <span
            style={{
              fontFamily: 'Archivo',
              fontSize: 14,
              color: '#ffffff',
            }}
          >
            +{totalMoments.toLocaleString()} moments
          </span>
        )}
      </div>
    </div>
  );
};

export default CollageGrid;
