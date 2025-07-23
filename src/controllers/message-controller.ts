import { ChatMessagesAPI } from '../api/chat-message';
import { store } from '../core/store';
import { MessageData } from '../utils/types';

export class MessageController {
    private api: ChatMessagesAPI;
    private socket: WebSocket | null = null;
    private currentChatId: number | null = null;

    constructor() {
        this.api = new ChatMessagesAPI();
    }

    public async connect(chatId: number, token: string) {
        try {
            this.currentChatId = chatId;
            console.log(`Connecting to chat ${chatId} with token`, token);

            // Закрываем предыдущее соединение
            this.closeConnection();

            // Загружаем историю сообщений при подключении
            await this.loadInitialMessages(chatId.toString());
            const userId = store.getState().user?.id;
            if (!userId) return;

            this.socket = new WebSocket(`wss://ya-praktikum.tech/ws/chats/${userId}/${chatId}/${token}`);

            this.socket.addEventListener('open', () => {
                console.log('WebSocket connection established for chat', chatId);
                this.getOldMessages();
            });

            this.socket.addEventListener('close', (event) => {
                console.log(`WebSocket closed for chat ${chatId}`, event);
            });

            this.socket.addEventListener('message', (event) => {
                console.log('WebSocket message received:', event.data);
                const data = JSON.parse(event.data);
                if (Array.isArray(data)) {
                    this.handleOldMessages(chatId, data);
                } else if (data.type === 'message') {
                    this.handleNewMessage(chatId, data);
                }
            });

            this.socket.addEventListener('error', (event) => {
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
                this.handleOldMessages(Number(chatId), messages);
            }
        } catch (e) {
            console.error('Failed to load initial messages:', e);
        }
    }
    private getOldMessages() {
        if (this.socket) {
            console.log('Requesting old messages');
            this.socket.send(JSON.stringify({
                content: '0',
                type: 'get old'
            }));
        }
    }

    private handleOldMessages(chatId: number, messages: MessageData[]) {
        console.log(`Received ${messages.length} old messages for chat ${chatId}`, messages);
        const reversedMessages = [...messages].reverse();
        store.set({
            messages: {
                ...store.getState().messages,
                [chatId]: reversedMessages
            }
        });
    }

    private handleNewMessage(chatId: number, message: MessageData) {
        console.log('New message received:', message);
        const currentMessages = store.getState().messages[chatId] || [];
        store.set({
            messages: {
                ...store.getState().messages,
                [chatId]: [...currentMessages, message]
            }
        });
    }

    public sendMessage(content: string) {
        if (this.socket) {
            console.log('Sending message:', content);
            this.socket.send(JSON.stringify({
                content,
                type: 'message'
            }));
        }
    }

    public closeConnection() {
        if (this.socket) {
            console.log('Closing WebSocket connection for chat', this.currentChatId);
            this.socket.close();
            this.socket = null;
            this.currentChatId = null;
        }
    }
}

export const messageController = new MessageController();
