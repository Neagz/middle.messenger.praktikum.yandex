import { BaseAPI } from './base-api';

export class ChatsAPI extends BaseAPI {

    getChats() {
        return this.http.get('/chats');
    }

    createChat(title: string) {
        return this.http.post('/chats', { title });
    }

    addUser(data: { chatId: number, userId: number }) {
        return this.http.put('/chats/users', {
            users: [data.userId],
            chatId: data.chatId
        });
    }

    deleteUser(data: { chatId: number, userId: number }) {
        return this.http.delete('/chats/users', {
            users: [data.userId],
            chatId: data.chatId
        });
    }

    getToken(chatId: number) {
        return this.http.post(`/chats/token/${chatId}`);
    }
}
