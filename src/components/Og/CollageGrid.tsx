const CollageGrid = ({
  imageDataUrls,
  artistName,
  size = 500,
}: {
  imageDataUrls: string[];
  artistName: string;
  size?: number;
}) => {
  const count = imageDataUrls.length;

  if (count === 0) {
    return (
      <div
        style={{
          width: size,
          height: size,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#E0DDD8',
          fontFamily: 'Archivo',
          fontSize: 24,
          color: '#605F5C',
        }}
      >
        No images
      </div>
    );
  }

  const cols = count <= 4 ? 2 : 3;
  const cellSize = Math.floor(size / cols);

  return (
    <div
      style={{
        width: size,
        height: size,
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        backgroundColor: '#E0DDD8',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          width: size,
          height: size,
        }}
      >
        {imageDataUrls.map((url, i) => (
          <div
            key={i}
            style={{
              width: cellSize,
              height: cellSize,
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {/* eslint-disable-next-line */}
            <img
              src={url}
              style={{
                width: cellSize,
                height: cellSize,
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
          backgroundColor: 'rgba(0,0,0,0.45)',
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
