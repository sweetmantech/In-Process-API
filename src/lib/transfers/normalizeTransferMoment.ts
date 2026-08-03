import { convertDatabaseSaleToApi } from '@/lib/sales/convertDatabaseSaleToApi';
import type { DatabaseSale } from '@/types/sale';

export default function normalizeTransferMoment(moment: any): any {
  if (!moment) return moment;

  const { sale, collection, ...momentRest } = moment;
  const normalizedSale = sale
    ? convertDatabaseSaleToApi(sale as DatabaseSale)
    : null;

  if (!collection) {
    return { ...momentRest, sale: normalizedSale };
  }

  const { creator, collection_artist, ...collectionRest } = collection;
  return {
    ...momentRest,
    sale: normalizedSale,
    collection: {
      ...collectionRest,
      artist: {
        address: creator ?? null,
        username: collection_artist?.artist?.username ?? null,
      },
    },
  };
}
