import { ARTIST_OG_IMAGE_WIDTH, rotation } from '@/lib/og/consts';
import { ImageMetadata } from '@/types/og';

const ImagePreview = ({
  imageMetadata,
  containerWidth = ARTIST_OG_IMAGE_WIDTH,
}: {
  imageMetadata: ImageMetadata | null;
  containerWidth?: number;
}) => {
  if (!imageMetadata)
    return (
      <div
        style={{
          fontFamily: 'Archivo',
          fontSize: 32,
          textAlign: 'center',
          color: '#605F5C',
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        No Preview.
      </div>
    );

  const {
    previewUrl,
    shouldRotate,
    originalHeight,
    originalWidth,
    orientation,
  } = imageMetadata;
  const paddingLeft =
    (Math.abs(
      (containerWidth / originalHeight) * originalWidth - containerWidth
    ) /
      2) *
    -1;
  const style: any = {
    transform: rotation[orientation],
    left: shouldRotate ? paddingLeft : 0,
  };
  if (shouldRotate)
    style.width = (containerWidth / originalHeight) * originalWidth;
  else style.width = '100%';
  return (
    // eslint-disable-next-line
    <img src={previewUrl} style={style} />
  );
};

export default ImagePreview;
