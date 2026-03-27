const COLS = 7;
const SPROCKET_AREA_H = 30;
const SPROCKET_HOLE_W = 28;
const SPROCKET_HOLE_H = 22;
const IMAGE_BORDER = 2;
/** neutral-800 — matches FilmPlaceholder strip colour */
const FILM_COLOR = '#262626';
/** neutral-600/40 — matches FilmPlaceholder sprocket hole colour */
const HOLE_COLOR = 'rgba(82, 82, 82, 0.4)';

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

  const cellW = Math.floor(width / COLS);
  const cellH = cellW;
  const stripW = cellW * COLS;
  // Image inside the bordered cell
  const imgW = cellW - IMAGE_BORDER * 2;
  const imgH = cellH - IMAGE_BORDER * 2;

  const sprocketRow = (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        height: SPROCKET_AREA_H,
        alignItems: 'center',
        backgroundColor: FILM_COLOR,
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
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
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
                alignItems: 'center',
                justifyContent: 'center',
                border: `${IMAGE_BORDER}px solid ${FILM_COLOR}`,
              }}
            >
              {/* eslint-disable-next-line */}
              <img
                src={url}
                style={{
                  width: imgW,
                  height: imgH,
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
