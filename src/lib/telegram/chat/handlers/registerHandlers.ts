import telegramChatBot from '../bot';
import { registerOnDirectMessage } from './onDirectMessage';
import { registerOnSubscribedMessage } from './onSubscribedMessage';

registerOnDirectMessage(telegramChatBot);
registerOnSubscribedMessage(telegramChatBot);
