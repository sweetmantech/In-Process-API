const transferRowFields = `
    id,
    moment,
    quantity,
    currency,
    value,
    transaction_hash,
    transferred_at,
    recipient`;

const saleFields = `
      sale:in_process_sales(
        price_per_token,
        sale_start,
        sale_end,
        max_tokens_per_address,
        funds_recipient,
        currency
      )`;

const collectionFields = `
        address,
        chain_id,
        protocol,
        name,
        creator,
        collection_artist:in_process_wallets!creator(artist:in_process_artists(username))`;

const metadataFields = `
        name,
        description,
        external_url,
        image,
        animation_url,
        content`;

export const paymentTransfersQuery = `
    ${transferRowFields},
    collector:in_process_wallets!recipient(artist:in_process_artists(username)),
    moment:in_process_moments!inner(
      token_id,
      fee_recipients:in_process_moment_fee_recipients!inner(
        artist_address,
        percent_allocation
      ),
      collection:in_process_collections!inner(
        ${collectionFields}
      ),
      metadata:in_process_metadata!inner(
        ${metadataFields}
      ),
      ${saleFields}
    )
  `
  .replace(/\s+/g, ' ')
  .trim();

export const transfersQuery = `
    ${transferRowFields},
    collector:in_process_wallets!recipient(artist:in_process_artists(username)),
    moment:in_process_moments!inner(
      token_id,
      collection:in_process_collections!inner(
        ${collectionFields}
      ),
      metadata:in_process_metadata!inner(
        ${metadataFields}
      ),
      ${saleFields}
    )
  `
  .replace(/\s+/g, ' ')
  .trim();
