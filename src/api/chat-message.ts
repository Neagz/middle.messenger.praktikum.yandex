import { BaseAPI } from './base-api';
import { MessageData } from '../utils/types';

export class ChatMessagesAPI extends BaseAPI {

    getMessages(chatId: string): Promise<MessageData[]> {
        return this.http.get<MessageData[]>(`/${chatId}`);
    }
}
