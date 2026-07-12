import telegramChatBot from '@/lib/telegram/chat/bot';
import { registerOnNewMention } from './onNewMention';
import { registerOnNudgePeriod } from './onNudgePeriod';
import { registerOnCollectionSelect } from './onCollectionSelect';
import { registerOnCollectionSelectionCancel } from './onCollectionSelectionCancel';
import { registerOnCollectionsLoadMore } from './onCollectionsLoadMore';

registerOnNewMention(telegramChatBot);
registerOnNudgePeriod(telegramChatBot);
registerOnCollectionSelect(telegramChatBot);
registerOnCollectionSelectionCancel(telegramChatBot);
registerOnCollectionsLoadMore(telegramChatBot);
