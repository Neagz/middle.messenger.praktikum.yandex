import { ChatsAPI } from '../api/chats';
import { store } from '../core/store';
import Router from '../utils/router';
import {ChatData, TokenResponse, UserData} from '../utils/types';
import { messageController } from "./index";

export class ChatsController {
    private api: ChatsAPI;
    private router: Router | null = null;

    constructor() {
        this.api = new ChatsAPI();
    }

    setRouter(router: Router): void {
        this.router = router;
    }

    private checkRouter(): void {
        if (!this.router) {
            throw new Error('Router not initialized');
        }
    }

    async getChats(): Promise<ChatData[]> {
        try {
            const chats = await this.api.getChats() as ChatData[];
            store.set({
                chats,
                error: null
            });
            return chats;
        } catch (e: unknown) {
            const errorMessage = e instanceof Error ? e.message : 'Failed to get chats';
            console.error('Get chats error:', errorMessage);
            store.set({
                error: errorMessage,
                chats: []
            });
            return [];
        }
    }

    async createChat(title: string): Promise<void> {
        try {
            await this.api.createChat(title);
            await this.getChats();
            this.checkRouter();
            this.router!.go('/messenger');
        } catch (e: unknown) {
            const errorMessage = e instanceof Error ? e.message : 'Failed to create chat';
            console.error('Create chat error:', errorMessage);
            store.set({ error: errorMessage });
        }
    }

    async deleteChat(chatId: number): Promise<void> {
        try {
            await this.api.deleteChat(chatId);
            await this.getChats();
            store.set({ error: null });
        } catch (e: unknown) {
            const errorMessage = e instanceof Error ? e.message : 'Failed to delete chat';
            console.error('Delete chat error:', errorMessage);
            store.set({ error: errorMessage });
            throw e;
        }
    }

    async addUserToChat(chatId: number, userId: number): Promise<void> {
        try {
            await this.api.addUser({ chatId, userId });
            store.set({ error: null });
        } catch (e: unknown) {
            const errorMessage = e instanceof Error ? e.message : 'Failed to add user to chat';
            console.error('Add user error:', errorMessage);
            store.set({ error: errorMessage });
        }
    }

    async removeUserFromChat(chatId: number, userId: number): Promise<void> {
        try {
            await this.api.deleteUser({ chatId, userId });
            store.set({ error: null });
        } catch (e: unknown) {
            const errorMessage = e instanceof Error ? e.message : 'Failed to remove user from chat';
            console.error('Remove user error:', errorMessage);
            store.set({ error: errorMessage });
        }
    }

    async getToken(chatId: number): Promise<string | null> {
        try {
            const response = await this.api.getToken(chatId) as TokenResponse;
            return response.token;
        } catch (e: unknown) {
            const errorMessage = e instanceof Error ? e.message : 'Failed to get chat token';
            console.error('Get token error:', errorMessage);
            store.set({ error: errorMessage });
            return null;
        }
    }

    async selectChat(chat: ChatData): Promise<void> {
        try {
            const updatedChats = store.getState().chats.map(c =>
                c.id === chat.id ? { ...c, unread_count: 0 } : c
            );

            store.set({
                currentChat: chat,
                chats: updatedChats,
                messages: store.getState().messages
            });

            const token = await this.getToken(chat.id);
            if (token) {
                messageController.connect(chat.id, token);
            }
        } catch (e: unknown) {
            const errorMessage = e instanceof Error ? e.message : 'Failed to select chat';
            console.error('Select chat error:', errorMessage);
            store.set({ error: errorMessage });
        }
    }

    async searchUsers(login: string): Promise<UserData[]> {
        try {
            return await this.api.searchUser(login) as UserData[];
        } catch (e: unknown) {
            const errorMessage = e instanceof Error ? e.message : 'Failed to search users';
            console.error('Search users error:', errorMessage);
            store.set({ error: errorMessage });
            return [];
        }
    }

    async updateChatAvatar(chatId: number, avatar: FormData): Promise<void> {
        try {
            await this.api.updateChatAvatar(chatId, avatar);
            await this.getChats();
        } catch (e: unknown) {
            const errorMessage = e instanceof Error ? e.message : 'Failed to update chat avatar';
            console.error('Update chat avatar error:', errorMessage);
            store.set({ error: errorMessage });
        }
    }
}

export const chatsController = new ChatsController();
