CREATE UNIQUE INDEX in_process_collectors_collector_moment_transaction_idx
  ON public.in_process_collectors USING btree (collector, moment, transaction_hash);
