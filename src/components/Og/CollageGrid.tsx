import type { CollageImageEntry } from '@/lib/og/collectCollageImages';

const COLS = 7;
const SPROCKET_AREA_H = 26;
const SPROCKET_HOLE_W = 28;
const SPROCKET_HOLE_H = 18;
const IMAGE_BORDER = 2;
const DATE_AREA_H = 18;
/** neutral-800 — matches FilmPlaceholder strip colour */
const FILM_COLOR = '#262626';
/** neutral-600/40 — matches FilmPlaceholder sprocket hole colour */
const HOLE_COLOR = 'rgba(82, 82, 82, 0.4)';

const formatDate = (iso: string): string => {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const CollageGrid = ({
  images,
  artistName,
  totalMoments,
  backgroundUrl,
  width = 700,
  height = 350,
}: {
  images: CollageImageEntry[];
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

  if (images.length === 0) {
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
  const imgH = cellH - IMAGE_BORDER * 2 - DATE_AREA_H;

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
          {images.map(({ url, createdAt }, i) => (
            <div
              key={i}
              style={{
                width: cellW,
                height: cellH,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                borderLeft: `${IMAGE_BORDER}px solid ${HOLE_COLOR}`,
                borderRight: `${IMAGE_BORDER}px solid ${HOLE_COLOR}`,
                borderTop: `${IMAGE_BORDER * 2}px solid ${HOLE_COLOR}`,
                borderBottom: `${IMAGE_BORDER * 2}px solid ${HOLE_COLOR}`,
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
              <div
                style={{
                  height: DATE_AREA_H,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: 'Archivo',
                  fontSize: 9,
                  color: '#a3a3a3',
                }}
              >
                {formatDate(createdAt)}
              </div>
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
