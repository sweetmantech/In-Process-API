/** Max 2 chars: callback_data budget is exactly 64 bytes when paired with a 42-byte address value. */
export const COLLECTION_SELECT_ACTION_ID = 'sc';

/** Value is the next page number (integer string). */
export const COLLECTIONS_LOAD_MORE_ACTION_ID = 'load_more_collections';

/** In-memory state key (namespaced to the thread by the chat runtime). */
export const TELEGRAM_SELECTED_COLLECTION_KEY = 'selected_collection_address';
