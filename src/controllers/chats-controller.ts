import { ChatsAPI } from '../api/chats';
import { store } from '../core/store';
import Router from '../utils/router';
import { ChatData, TokenResponse  } from '../utils/types';

export class ChatsController {
    private api: ChatsAPI;
    private router: Router | null = null;

    constructor() {
        this.api = new ChatsAPI();
    }

    setRouter(router: Router) {
        this.router = router;
    }

    private checkRouter() {
        if (!this.router) {
            throw new Error('Router not initialized');
        }
    }

    async getChats() {
        try {
            const chats = await this.api.getChats() as ChatData[]; // Явное приведение типа
            store.set({
                chats,
                error: null
            });
            return chats;
        } catch (e: any) {
            console.error('Get chats error:', e);
            store.set({
                error: e.reason || 'Failed to get chats',
                chats: [] // Устанавливаем пустой массив при ошибке
            });
            return [];
        }
    }
    async createChat(title: string) {
        try {
            await this.api.createChat(title);
            await this.getChats(); // Обновляем список чатов после создания
            this.checkRouter();
            this.router!.go('/messenger');
        } catch (e: any) {
            console.error('Create chat error:', e);
            store.set({ error: e.reason || 'Failed to create chat' });
        }
    }

    async addUserToChat(chatId: number, userId: number) {
        try {
            await this.api.addUser({ chatId, userId });
            store.set({ error: null });
        } catch (e: any) {
            console.error('Add user error:', e);
            store.set({ error: e.reason || 'Failed to add user to chat' });
        }
    }

    async removeUserFromChat(chatId: number, userId: number) {
        try {
            await this.api.deleteUser({ chatId, userId });
            store.set({ error: null });
        } catch (e: any) {
            console.error('Remove user error:', e);
            store.set({ error: e.reason || 'Failed to remove user from chat' });
        }
    }

    async getToken(chatId: number): Promise<string | null> {
        try {
            const response = await this.api.getToken(chatId) as TokenResponse;
            return response.token;
        } catch (e: any) {
            console.error('Get token error:', e);
            store.set({ error: e.reason || 'Failed to get chat token' });
            return null;
        }
    }

    selectChat(chat: ChatData) {
        store.set({
            currentChat: chat,
            messages: {} // Очищаем сообщения при смене чата
        });
    }
}

export const chatsController = new ChatsController();
