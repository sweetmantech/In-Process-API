import telegramChatBot from '../bot';
import { registerOnDirectMessage } from './onDirectMessage';

registerOnDirectMessage(telegramChatBot);
