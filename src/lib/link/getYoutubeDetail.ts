import { LinkPreview } from '@/types/link';
import youtubeParser from './youtubeParser';

const getYoutubeDetail = async (url: string): Promise<LinkPreview | null> => {
  const youtubeId = youtubeParser(url);
  if (!youtubeId) return null;
  const reqUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${youtubeId}&key=${process.env.YOUTUBE_API_KEY}`;
  const response = await fetch(reqUrl);
  const data = await response.json();

  if (data && data.items && data.items.length > 0) {
    const video = data.items[0];
    return {
      siteName: 'youtube',
      favicons: [],
      images: [video.snippet.thumbnails.default.url],
      title:
        video.snippet.title || video.snippet.channelTitle || 'Untitled Video',
      description:
        video.snippet.description || video.snippet.title || 'Untitled Video',
      url,
    };
  }

  return null;
};

export default getYoutubeDetail;
