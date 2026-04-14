/** Omit scalar `recipient` so the joined artist appears only as `collector`. */
const transferRowFields = `
    id,
    moment,
    quantity,
    currency,
    value,
    transaction_hash,
    transferred_at`;

export const paymentTransfersQuery = `
    ${transferRowFields},
    collector:in_process_artists!inner(address, username),
    moment:in_process_moments!inner(
      token_id,
      fee_recipients:in_process_moment_fee_recipients!inner(
        artist_address,
        percent_allocation
      ),
      collection:in_process_collections!inner(
        address,
        chain_id,
        protocol,
        artist:in_process_artists!creator(address, username)
      ),
      metadata:in_process_metadata!inner(
        name,
        description,
        external_url,
        image,
        animation_url,
        content
      )
    )
  `
  .replace(/\s+/g, ' ')
  .trim();

export const transfersQuery = `
    ${transferRowFields},
    collector:in_process_artists!inner(address, username),
    moment:in_process_moments!inner(
      token_id,
      collection:in_process_collections!inner(
        address,
        chain_id,
        protocol,
        artist:in_process_artists!creator(address, username)
      ),
      metadata:in_process_metadata!inner(
        name,
        description,
        external_url,
        image,
        animation_url,
        content
      )
    )
  `
  .replace(/\s+/g, ' ')
  .trim();
