import { convertDatabaseSaleToApi } from '@/lib/sales/convertDatabaseSaleToApi';
import type { DatabaseSale } from '@/types/sale';

function normalizeCommentsCount(comments: unknown): number {
  if (typeof comments === 'number') return comments;
  if (Array.isArray(comments)) {
    const count = comments[0]?.count;
    return typeof count === 'number' ? count : 0;
  }
  return 0;
}

export default function normalizeTransferMoment(moment: any): any {
  if (!moment) return moment;

  const { sale, collection, comments, ...momentRest } = moment;
  const normalizedSale = sale
    ? convertDatabaseSaleToApi(sale as DatabaseSale)
    : null;
  const commentsCount = normalizeCommentsCount(comments);

  if (!collection) {
    return { ...momentRest, sale: normalizedSale, comments: commentsCount };
  }

  const { creator, collection_artist, ...collectionRest } = collection;
  return {
    ...momentRest,
    sale: normalizedSale,
    comments: commentsCount,
    collection: {
      ...collectionRest,
      artist: {
        address: creator ?? null,
        username: collection_artist?.artist?.username ?? null,
      },
    },
  };
}
