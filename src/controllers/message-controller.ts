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
            console.log(`Подключение к чату ${chatId}, token:`, token);

            // Закрываем предыдущее соединение
            this.closeConnection();

            // Загружаем историю сообщений при подключении
            await this.loadInitialMessages(chatId.toString());
            const userId = store.getState().user?.id;
            if (!userId) return;

            this.socket = new WebSocket(`wss://ya-praktikum.tech/ws/chats/${userId}/${chatId}/${token}`);

            this.socket.addEventListener('open', () => {
                console.log('WebSocket соединение установлено с чатом:', chatId);
                this.getOldMessages();
            });

            this.socket.addEventListener('close', (event) => {
                console.log(`WebSocket выход из чата: ${chatId}`, event);
            });

            this.socket.addEventListener('message', (event) => {
                console.log('WebSocket получены сообщения:', event.data);
                const data = JSON.parse(event.data);
                if (Array.isArray(data)) {
                    this.handleOldMessages(chatId, data);
                } else if (data.type === 'message') {
                    this.handleNewMessage(chatId, data);
                }
            });

            this.socket.addEventListener('error', (event) => {
                console.error('WebSocket ошибка:', event);
            });

        } catch (e: any) {
            console.error('WebSocket ошибка подключения:', e);
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
            console.error('Не удалось загрузить исходные сообщения:', e);
        }
    }
    private getOldMessages() {
        if (this.socket) {
            console.log('Запрос старых сообщений');
            this.socket.send(JSON.stringify({
                content: '0',
                type: 'get old'
            }));
        }
    }

    private handleOldMessages(chatId: number, messages: MessageData[]) {
        console.log(`Получено ${messages.length} старых сообщений ${chatId}`, messages);

        // Преобразуем сообщения, гарантируя наличие обязательных полей
        const processedMessages = messages.map(msg => ({
            ...msg,
            id: msg.id || 0, // или другое значение по умолчанию
            user_id: msg.user_id || 0,
            chat_id: msg.chat_id || 0,
            is_read: msg.is_read || false
        }));

        const reversedMessages = [...processedMessages].reverse();

        store.set({
            messages: {
                ...store.getState().messages,
                [chatId]: reversedMessages
            }
        });
    }

    private handleNewMessage(chatId: number, message: MessageData) {
        console.log('Получено новое сообщение:', message);

        // Преобразуем новое сообщение
        const processedMessage = {
            ...message,
            id: message.id || Date.now(), // или другая генерация ID
            user_id: message.user_id || 0,
            chat_id: message.chat_id || chatId,
            is_read: message.is_read || false
        };

        const currentMessages = store.getState().messages[chatId] || [];

        store.set({
            messages: {
                ...store.getState().messages,
                [chatId]: [...currentMessages, processedMessage]
            }
        });

        this.updateChatLastMessage(chatId, processedMessage);
    }

    private async updateChatLastMessage(chatId: number, message: MessageData) {
        const chats = [...(store.getState().chats || [])];
        const chatIndex = chats.findIndex(c => c.id === chatId);

        if (chatIndex >= 0) {
            const user = store.getState().user; // Получаем текущего пользователя
            if (!user) return;

            const updatedChats = [...chats];
            updatedChats[chatIndex] = {
                ...updatedChats[chatIndex],
                last_message: {
                    user, // Добавляем пользователя
                    content: message.content,
                    time: message.time
                }
            };

            store.set({ chats: updatedChats });
        }
    }

    public sendMessage(content: string) {
        if (this.socket) {
            console.log('Отправка сообщения:', content);
            this.socket.send(JSON.stringify({
                content,
                type: 'message'
            }));
        }
    }

    public closeConnection() {
        if (this.socket) {
            console.log('Закрыто WebSocket соединение с чатом', this.currentChatId);
            this.socket.close();
            this.socket = null;
            this.currentChatId = null;
        }
    }
}

export const messageController = new MessageController();
