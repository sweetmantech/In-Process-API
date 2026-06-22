import { catalogCollectionsIndexer } from './catalogCollectionsIndexer';
import { catalogMomentsIndexer } from './catalogMomentsIndexer';
import { collectionsIndexer } from './collectionsIndexer';
import { momentsIndexer } from './momentsIndexer';
import { adminsIndexer } from './adminsIndexer';
import { commentsIndexer } from './commentsIndexer';
import { salesIndexer } from './salesIndexer';
import { transfersIndexer } from './transfersIndexer';
import { soundEditionsIndexer } from './soundEditionsIndexer';
import { soundMomentsIndexer } from './soundMomentsIndexer';
import { zoraMomentsIndexer } from './zoraMomentsIndexer';
import { zoraCollectionsIndexer } from './zoraCollectionsIndexer';
import { zora1155MomentsIndexer } from './zora1155MomentsIndexer';
import type { IndexConfig } from '@/types/indexerFactory';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const indexers: IndexConfig<any>[] = [
  // collections
  collectionsIndexer,
  zoraCollectionsIndexer,
  catalogCollectionsIndexer,
  soundEditionsIndexer,
  // moments
  soundMomentsIndexer,
  momentsIndexer,
  catalogMomentsIndexer,
  zoraMomentsIndexer,
  zora1155MomentsIndexer,
  // admins
  adminsIndexer,

  commentsIndexer,
  salesIndexer,
  transfersIndexer,
];
