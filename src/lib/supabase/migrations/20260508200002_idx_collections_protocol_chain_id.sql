CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_in_process_collections_protocol_chain_id
  ON public.in_process_collections (protocol, chain_id);
