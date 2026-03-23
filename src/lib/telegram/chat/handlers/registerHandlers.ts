import telegramChatBot from '../bot';
import { registerOnNewMention } from './onNewMention';
import { registerOnSubscribedMessage } from './onSubscribedMessage';

registerOnNewMention(telegramChatBot);
registerOnSubscribedMessage(telegramChatBot);
