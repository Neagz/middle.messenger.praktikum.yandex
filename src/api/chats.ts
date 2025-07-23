import { BaseAPI } from './base-api';

export class ChatsAPI extends BaseAPI {

    getChats() {
        return this.http.get('/chats');
    }

    createChat(title: string) {
        return this.http.post('/chats', { title });
    }

    addUser(data: { chatId: number, userId: number }) {
        return this.http.put('/users', { data });
    }

    deleteUser(data: { chatId: number, userId: number }) {
        return this.http.delete('/users', { data });
    }

    getToken(chatId: number) {
        return this.http.post(`/token/${chatId}`);
    }
}
