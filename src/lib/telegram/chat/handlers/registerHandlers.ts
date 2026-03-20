import telegramChatBot from '../bot';
import { registerOnNewMention } from './onNewMention';
import { registerOnDirectMessage } from './onDirectMessage';

registerOnNewMention(telegramChatBot);
registerOnDirectMessage(telegramChatBot);
