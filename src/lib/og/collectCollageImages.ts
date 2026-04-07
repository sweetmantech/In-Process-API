import getCollageImageData from './getCollageImageData';

const CONCURRENCY = 5;

export interface CollageImageEntry {
  url: string;
  createdAt: string;
}

/**
 * Fetches collage image data URLs using bounded concurrency.
 * inputs must be provided newest-first so recent images are prioritised.
 * Returns up to maxImages entries sorted oldest-first (by original index descending)
 * so the grid renders in chronological order.
 */
const collectCollageImages = async (
  inputs: { imageUrl: string; createdAt: string }[],
  maxImages: number,
  timeoutMs: number,
  concurrency = CONCURRENCY
): Promise<CollageImageEntry[]> => {
  if (inputs.length === 0 || maxImages === 0) return [];

  const collected: { index: number; url: string; createdAt: string }[] = [];

  // Always attempt index 0 first — no timeout, no abort
  try {
    const url = await getCollageImageData(inputs[0].imageUrl);
    if (url !== null) {
      collected.push({ index: 0, url, createdAt: inputs[0].createdAt });
    }
  } catch (e) {
    console.error(
      '[collectCollageImages] index 0 fetch failed:',
      inputs[0].imageUrl,
      e
    );
  }

  // Fill remaining slots from index 1 onwards
  const activeControllers = new Set<AbortController>();
  let nextIndex = 1;
  let stop = false;

  const worker = async () => {
    while (!stop && collected.length < maxImages) {
      const i = nextIndex++;
      if (i >= inputs.length) break;

      const controller = new AbortController();
      activeControllers.add(controller);
      const timer = setTimeout(() => controller.abort(), timeoutMs);

      try {
        if (stop) break;
        const url = await getCollageImageData(
          inputs[i].imageUrl,
          controller.signal
        );
        if (url !== null && collected.length < maxImages) {
          collected.push({ index: i, url, createdAt: inputs[i].createdAt });
          if (collected.length >= maxImages) {
            stop = true;
            activeControllers.forEach((c) => c.abort());
          }
        }
      } catch {
        // ignore fetch errors
      } finally {
        clearTimeout(timer);
        activeControllers.delete(controller);
      }
    }
  };

  if (inputs.length > 1 && collected.length < maxImages) {
    await Promise.all(
      Array.from({ length: Math.min(concurrency, inputs.length - 1) }, worker)
    );
  }

  activeControllers.forEach((c) => c.abort());

  // Sort by index descending: highest index = oldest in newest-first input
  collected.sort((a, b) => b.index - a.index);
  return collected.map((r) => ({ url: r.url, createdAt: r.createdAt }));
};

export default collectCollageImages;
