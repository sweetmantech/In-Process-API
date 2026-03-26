import telegramChatBot from '../bot';
import { registerOnNewMention } from './onNewMention';

registerOnNewMention(telegramChatBot);
