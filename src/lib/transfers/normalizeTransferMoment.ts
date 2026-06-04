export default function normalizeTransferMoment(moment: any): any {
  if (!moment?.collection) return moment;
  const { creator, collection_artist, ...collectionRest } = moment.collection;
  return {
    ...moment,
    collection: {
      ...collectionRest,
      artist: {
        address: creator ?? null,
        username: collection_artist?.artist?.username ?? null,
      },
    },
  };
}
