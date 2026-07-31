import { ImageResponse } from 'next/og';
import {
  OG_HEIGHT,
  OG_WIDTH,
  WRITING_MAX_LINES,
  WRITING_SHORT_LINES,
} from '@/lib/og/consts';
import getSpectralFont from '@/lib/og/getSpectralFont';
import WritingPreview from '@/components/Og/WritingPreview';
import countWritingLines from './countWritingLines';

const generateTextPreview = async (text: string): Promise<File> => {
  const writingText = text.trim();
  const totalLines = countWritingLines(writingText);
  const spectral = await getSpectralFont();

  const response = new ImageResponse(
    <div
      style={{
        display: 'flex',
        width: '100%',
        height: '100%',
        position: 'relative',
        alignItems: 'center',
        backgroundColor: '#E0DDD8',
      }}
    >
      <WritingPreview
        writingText={writingText}
        totalLines={totalLines}
        maxLines={WRITING_MAX_LINES}
        shortLines={WRITING_SHORT_LINES}
        padding={32}
      />
    </div>,
    {
      width: OG_WIDTH,
      height: OG_HEIGHT,
      fonts: [{ name: 'Spectral', data: spectral, weight: 400 }],
    }
  );

  const buffer = await response.arrayBuffer();
  return new File([buffer], 'text-preview.png', { type: 'image/png' });
};

export default generateTextPreview;
