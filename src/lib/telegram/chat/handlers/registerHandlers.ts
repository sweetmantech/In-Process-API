import telegramChatBot from '../bot';
import { registerOnNewMention } from './onNewMention';
import { registerOnNudgePeriod } from './onNudgePeriod';

registerOnNewMention(telegramChatBot);
registerOnNudgePeriod(telegramChatBot);
