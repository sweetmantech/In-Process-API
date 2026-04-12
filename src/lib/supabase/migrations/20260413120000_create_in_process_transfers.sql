-- Envio unified `Transfers` mirror (InProcess, Catalog, Sound).
-- `id` matches Envio entity id (stable across InProcess two-step assembly).
-- collection/token_id/chain_id are omitted — resolvable via the `moment` FK.
CREATE TABLE public.in_process_transfers (
  id text NOT NULL PRIMARY KEY,
  recipient text NOT NULL,
  quantity text NOT NULL,
  payer text,
  value text,
  currency text,
  funds_recipient text,
  transaction_hash text NOT NULL,
  transferred_at timestamp with time zone NOT NULL,
  moment uuid REFERENCES public.in_process_moments (id) ON UPDATE CASCADE ON DELETE SET NULL
);

CREATE INDEX idx_in_process_transfers_transferred_at_desc
  ON public.in_process_transfers USING btree (transferred_at DESC);

CREATE INDEX idx_in_process_transfers_moment
  ON public.in_process_transfers USING btree (moment);

ALTER TABLE public.in_process_transfers ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE public.in_process_transfers IS 'Mint/transfer rows synced from Envio Transfers; moment FK links to in_process_moments.';
