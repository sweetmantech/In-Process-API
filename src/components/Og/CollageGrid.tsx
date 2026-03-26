import {
  COLLAGE_PHOTO_H,
  COLLAGE_PHOTO_LAYOUTS,
  COLLAGE_PHOTO_W,
} from '@/lib/og/consts';

const CollageGrid = ({
  imageDataUrls,
  artistName,
  backgroundUrl,
  size = 500,
}: {
  imageDataUrls: string[];
  artistName: string;
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

  return (
    <div
      style={{
        width: size,
        height: size,
        display: 'flex',
        position: 'relative',
        overflow: 'hidden',
        ...bgStyle,
      }}
    >
      {imageDataUrls.map((url, i) => {
        const [x, y, rotate] =
          COLLAGE_PHOTO_LAYOUTS[i % COLLAGE_PHOTO_LAYOUTS.length];
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              width: COLLAGE_PHOTO_W,
              height: COLLAGE_PHOTO_H,
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
                width: COLLAGE_PHOTO_W - 16,
                height: COLLAGE_PHOTO_H - 16,
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
