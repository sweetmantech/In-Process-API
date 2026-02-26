import { IN_PROCESS_LOGO_URL } from '@/lib/og/consts';

const ArtistInfo = ({ nickName }: { nickName: string }) => {
  return (
    <div
      style={{
        display: 'flex',
        width: '30%',
        flexDirection: 'column',
      }}
    >
      {/* eslint-disable-next-line */}
      <img src={IN_PROCESS_LOGO_URL} width="100%" />
      <p
        style={{
          fontFamily: 'Archivo',
          fontSize: 18,
        }}
      >
        {nickName}
      </p>
    </div>
  );
};

export default ArtistInfo;
