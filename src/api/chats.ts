import { BaseAPI } from './base-api';
import {UserData} from "../utils/types";

export class ChatsAPI extends BaseAPI {

    getChats() {
        return this.http.get('/chats');
    }

    createChat(title: string) {
        return this.http.post('/chats', { title });
    }

    deleteChat(chatId: number) {
        return this.http.delete('/chats', { chatId });
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

    searchUser(login: string): Promise<UserData[]> {
        return this.http.post<UserData[]>('/user/search', { login });
    }
    updateChatAvatar(chatId: number, avatar: FormData): Promise<unknown> {
        return this.http.put(`/chats/${chatId}/avatar`, avatar);
    }
}
