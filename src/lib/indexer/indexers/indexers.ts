import { catalogAdminsIndexer } from './catalogAdminsIndexer';
import { catalogCollectionsIndexer } from './catalogCollectionsIndexer';
import { catalogMomentsIndexer } from './catalogMomentsIndexer';
import { collectionsIndexer } from './collectionsIndexer';
import { momentsIndexer } from './momentsIndexer';
import { adminsIndexer } from './adminsIndexer';
import { commentsIndexer } from './commentsIndexer';
import { salesIndexer } from './salesIndexer';
import { paymentsIndexer } from './paymentsIndexer';
import { airdropsIndexer } from './airdropsIndexer';
import { collectorsIndexer } from './collectorsIndexer';
import { soundEditionsIndexer } from './soundEditionsIndexer';
import { soundMomentsIndexer } from './soundMomentsIndexer';
import { soundAdminsIndexer } from './soundAdminsIndexer';
import type { IndexConfig } from '@/types/indexerFactory';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const indexers: IndexConfig<any>[] = [
  // collections
  collectionsIndexer,
  catalogCollectionsIndexer,
  soundEditionsIndexer,
  // moments
  soundMomentsIndexer,
  momentsIndexer,
  catalogMomentsIndexer,
  // admins
  adminsIndexer,
  catalogAdminsIndexer,
  soundAdminsIndexer,

  commentsIndexer,
  salesIndexer,
  paymentsIndexer,
  airdropsIndexer,
  collectorsIndexer,
];
