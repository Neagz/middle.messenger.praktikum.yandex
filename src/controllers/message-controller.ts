import { ChatMessagesAPI } from '../api/chat-message';
import { store } from '../core/store';
import { MessageData } from '../utils/types';

export class MessageController {
    private api: ChatMessagesAPI;
    private socket: WebSocket | null = null;

    constructor() {
        this.api = new ChatMessagesAPI();
    }

    public async connect(chatId: number, token: string) {
        try {
            // Загружаем историю сообщений при подключении
            await this.loadInitialMessages(chatId.toString());
            const userId = store.getState().user?.id;
            if (!userId) {
                throw new Error('User not authorized');
            }

            this.socket = new WebSocket(`wss://ya-praktikum.tech/ws/chats/${userId}/${chatId}/${token}`);

            this.socket.addEventListener('open', () => {
                console.log('WebSocket connection established');
                this.getOldMessages();
            });

            this.socket.addEventListener('close', event => {
                if (event.wasClean) {
                    console.log('WebSocket connection closed cleanly');
                } else {
                    console.log('WebSocket connection died');
                }
            });

            this.socket.addEventListener('message', event => {
                const data = JSON.parse(event.data);
                if (Array.isArray(data)) {
                    // Старые сообщения
                    this.handleOldMessages(data);
                } else if (data.type === 'message') {
                    // Новое сообщение
                    this.handleNewMessage(data);
                }
            });

            this.socket.addEventListener('error', event => {
                console.error('WebSocket error:', event);
            });

        } catch (e: any) {
            console.error('WebSocket connect error:', e);
            store.set({ error: e.message || 'Failed to connect to chat' });
        }
    }

    private async loadInitialMessages(chatId: string) {
        try {
            const messages = await this.api.getMessages(chatId);
            if (messages && messages.length > 0) {
                this.handleOldMessages(messages);
            }
        } catch (e) {
            console.error('Failed to load initial messages:', e);
        }
    }
    private getOldMessages() {
        if (this.socket) {
            this.socket.send(JSON.stringify({
                content: '0',
                type: 'get old'
            }));
        }
    }

    private handleOldMessages(messages: MessageData[]) {
        const currentChatId = store.getState().currentChat?.id;
        if (!currentChatId) return;

        const reversedMessages = [...messages].reverse();
        store.set({
            messages: {
                ...store.getState().messages,
                [currentChatId]: reversedMessages
            }
        });
    }

    private handleNewMessage(message: MessageData) {
        const currentChatId = store.getState().currentChat?.id;
        if (!currentChatId) return;

        const currentMessages = store.getState().messages[currentChatId] || [];
        store.set({
            messages: {
                ...store.getState().messages,
                [currentChatId]: [...currentMessages, message]
            }
        });
    }

    sendMessage(content: string) {
        if (this.socket) {
            this.socket.send(JSON.stringify({
                content,
                type: 'message'
            }));
        }
    }

    closeConnection() {
        if (this.socket) {
            this.socket.close();
            this.socket = null;
        }
    }
}

export const messageController = new MessageController();
