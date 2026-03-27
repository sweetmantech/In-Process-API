const COLS = 7;

const CollageGrid = ({
  imageDataUrls,
  artistName,
  totalMoments,
  backgroundUrl,
  size = 500,
}: {
  imageDataUrls: string[];
  artistName: string;
  totalMoments?: number;
  backgroundUrl?: string;
  size?: number;
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
          width: size,
          height: size,
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

  const cellW = Math.floor(size / COLS);
  const cellH = Math.round(size * 0.7);

  return (
    <div
      style={{
        width: size,
        height: size,
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
          flexDirection: 'row',
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
