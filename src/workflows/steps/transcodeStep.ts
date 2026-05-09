import { transcodeIfH265 } from '@/lib/video/transcodeIfH265';

export default async function transcodeStep(videoFile: File): Promise<File> {
  'use step';
  return transcodeIfH265(videoFile);
}
