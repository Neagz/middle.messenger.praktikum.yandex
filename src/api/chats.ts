import { BaseAPI } from './base-api';

export class ChatsAPI extends BaseAPI {
    constructor() {
        super('/chats');
    }

    getChats() {
        return this.http.get('/');
    }

    createChat(title: string) {
        return this.http.post('/', { title });
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
