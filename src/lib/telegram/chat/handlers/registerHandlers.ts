import telegramChatBot from '../bot';
import { registerOnNewMention } from './onNewMention';
import { registerOnNudgePeriod } from './onNudgePeriod';
import { registerOnCollectionSelect } from './onCollectionSelect';
import { registerOnCollectionsLoadMore } from './onCollectionsLoadMore';

registerOnNewMention(telegramChatBot);
registerOnNudgePeriod(telegramChatBot);
registerOnCollectionSelect(telegramChatBot);
registerOnCollectionsLoadMore(telegramChatBot);
