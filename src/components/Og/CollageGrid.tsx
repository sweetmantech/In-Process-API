const COLS = 7;
const SPROCKET_AREA_H = 22;
const SPROCKET_HOLE_W = 14;
const SPROCKET_HOLE_H = 16;

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
    : { backgroundColor: '#1a1a1a' };

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

  const cellW = Math.floor(width / COLS);
  const cellH = cellW;
  const stripW = cellW * COLS;

  const sprocketRow = (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        height: SPROCKET_AREA_H,
        alignItems: 'center',
        backgroundColor: '#1c1c1c',
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
          }}
        >
          <div
            style={{
              width: SPROCKET_HOLE_W,
              height: SPROCKET_HOLE_H,
              backgroundColor: '#0a0a0a',
              borderRadius: 3,
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
          backgroundColor: '#1c1c1c',
        }}
      >
        {sprocketRow}
        <div style={{ display: 'flex', flexDirection: 'row' }}>
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
        {sprocketRow}
      </div>
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
          justifyContent: 'space-between',
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
        {totalMoments !== undefined && (
          <span
            style={{
              fontFamily: 'Archivo',
              fontSize: 16,
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
