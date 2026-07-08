/** Max 2 chars: callback_data budget is exactly 64 bytes when paired with a 42-byte address value. */
export const COLLECTION_SELECT_ACTION_ID = 'sc';

/** Clears thread collection selection state (compact id for Telegram callback limits). */
export const COLLECTION_SELECTION_CANCEL_ACTION_ID = 'cx';

/** Value is the next page number (integer string). */
export const COLLECTIONS_LOAD_MORE_ACTION_ID = 'load_more_collections';

/** In-memory state key (namespaced to the thread by the chat runtime). */
export const TELEGRAM_SELECTED_COLLECTION_KEY = 'selected_collection_address';

/** Set while the bot is waiting for an unconnected Telegram user to reply with their In Process email. */
export const TELEGRAM_PENDING_EMAIL_KEY = 'pending_email';

/** How long a user has to reply with their email before the prompt expires. */
export const TELEGRAM_PENDING_EMAIL_TTL_MS = 10 * 60 * 1_000;

/** Debounce window for batching media (real Telegram albums and synthesized ungrouped bursts). */
export const MEDIA_GROUP_WINDOW_MS = 10_000;
