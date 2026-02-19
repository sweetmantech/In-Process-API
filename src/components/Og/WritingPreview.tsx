const WritingPreview = ({
  writingText,
  totalLines,
  maxLines = 6,
  shortLines = 2,
  padding = 24,
}: {
  writingText: string;
  totalLines: number;
  maxLines?: number;
  shortLines?: number;
  padding?: number;
}) => {
  return (
    <div
      style={{
        display: 'flex',
        paddingTop: padding,
        paddingLeft: padding,
        paddingRight: padding,
        paddingBottom: totalLines > maxLines ? 0 : padding,
        width: '100%',
        height: '100%',
        position: 'relative',
      }}
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          overflow: 'hidden',
          display: 'flex',
          alignItems: totalLines > maxLines ? 'flex-start' : 'center',
          justifyContent: totalLines > 1 ? 'flex-start' : 'center',
        }}
      >
        <pre
          style={{
            wordWrap: 'break-word',
            whiteSpace: 'pre-wrap',
            fontFamily: 'Spectral',
            fontSize: totalLines <= shortLines ? 32 : 16,
          }}
        >
          {writingText}
        </pre>
      </div>
      {totalLines > maxLines && (
        <div
          style={{
            position: 'absolute',
            left: 32,
            bottom: 0,
            width: '100%',
            height: '50%',
            backgroundImage:
              'linear-gradient(180deg, rgba(224, 221, 216, 0) 0%, rgba(224, 221, 216, 1) 100%)',
          }}
        />
      )}
    </div>
  );
};

export default WritingPreview;
