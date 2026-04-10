export type ProcessBatchFn<T> = (entities: T[]) => Promise<void>;

export type SelectMaxTimestampFn = () => Promise<number | null>;

export interface IndexConfig<T> {
  processBatchFn: ProcessBatchFn<T>;
  selectMaxTimestampFn: SelectMaxTimestampFn;
  indexName: string;
  dataPath: string;
  queryFragment: string;
}
