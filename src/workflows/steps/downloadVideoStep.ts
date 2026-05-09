import { downloadVideo } from '@/lib/mux/downloadVideo';

export default async function downloadVideoStep(
  downloadUrl: string
): Promise<File> {
  'use step';
  return downloadVideo(downloadUrl);
}
