const momentCollectionFields = `
  id,
  address,
  chain_id,
  creator,
  protocol
`;

const momentMetadataFields = `
  image,
  name,
  description,
  external_url,
  animation_url,
  content
`;

export const momentsWithCollectionQuery = `
  *,
  collection:in_process_collections!inner(
    ${momentCollectionFields}
  )
`
  .replace(/\s+/g, ' ')
  .trim();

export const momentsWithCollectionAndMetadataQuery = `
  *,
  collection:in_process_collections!inner(
    ${momentCollectionFields}
  ),
  metadata:in_process_metadata!inner(
    ${momentMetadataFields}
  )
`
  .replace(/\s+/g, ' ')
  .trim();
