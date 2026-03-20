import telegramChatBot from '../bot';
import { registerOnNewMention } from './onNewMention';
import { registerOnStart } from './onStart';
import { registerOnHelp } from './onHelp';
import { registerOnStatus } from './onStatus';

registerOnNewMention(telegramChatBot);
registerOnStart(telegramChatBot);
registerOnHelp(telegramChatBot);
registerOnStatus(telegramChatBot);
