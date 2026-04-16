import { catalogAdminsIndexer } from './catalogAdminsIndexer';
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
import { soundAdminsIndexer } from './soundAdminsIndexer';
import { zoraMomentsIndexer } from './zoraMomentsIndexer';
import { zoraAdminsIndexer } from './zoraAdminsIndexer';
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
  zoraMomentsIndexer,
  // admins
  adminsIndexer,
  catalogAdminsIndexer,
  soundAdminsIndexer,
  zoraAdminsIndexer,

  commentsIndexer,
  salesIndexer,
  transfersIndexer,
];
