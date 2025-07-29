import { Block } from '../../core/block';
import template from './list.hbs?raw';
import {
    Button,
    ButtonCallback,
    Input,
    Message,
    Link,
    ChangingDialog,
    ContactItem, DotsSettingsButton, ActionDialogUser, DotsSelectButton, ActionDialogMessage
} from '../../components';
import { ValidationRule } from '../../utils/validation';
import Router from '../../utils/router';
import {chatsController, messageController, userController} from '../../controllers';
import { store } from '../../core/store';
import { ChatData, MessageData } from '../../utils/types';

interface ListPageProps {
    contacts?: Array<{
        id: number;
        avatar: string;
        name: string;
        preview: string;
        timestamp: string;
        unread?: string;
        active?: boolean;
        chatData?: ChatData;
        onContactClick?: () => void;
    }>;
    onSend?: (_message: string) => void;
    showDialog?: boolean;
    dialogType?: 'add' | 'remove';
    showActionDialogUser?: boolean;
    showActionDialogMessage?: boolean;
    currentChat?: ChatData | null;
    messages?: MessageData[];
    showNoChatSelected?: boolean;
    showNoMessages?: boolean;
    [key: string]: unknown;
}

export class ListPage extends Block<ListPageProps> {
    private router: Router;

    constructor(context: ListPageProps = {}) {
        super({
            ...context,
            showDialog: false,
            dialogType: undefined,
            showActionDialogUser: false,
            showActionDialogMessage: false,
            contacts: [],
            currentChat: null,
            showNoChatSelected: true,
            showNoMessages: false,
        });
        this.router = new Router();
    }

    private handleChatClick = (chat: ChatData) => {
        console.log('Выбран чат:', chat.id, chat.title);
        chatsController.selectChat(chat);
    };

    private async handleSubmit(e: Event) {
        e.preventDefault();
        await this.handleSendMessage();
    }

    private async handleSendMessage() {
        const messageInput = this.children.inputMessage as Message;
        if (!messageInput) return;

        const message = messageInput.getValue().trim();

        if (!message) {
            messageInput.setProps({
                error: "Сообщение не может быть пустым",
                class: "message--error"
            });
            return;
        }

        if (!store.getState().currentChat?.id) {
            console.error("Чат не выбран");
            return;
        }

        try {
            await messageController.sendMessage(message);
            messageInput.clear();
        } catch (error) {
            console.error("Ошибка отправки:", error);
        }
    }

    private updateChatList(chats: ChatData[]) {
        const currentChatId = store.getState().currentChat?.id;
        this.setProps({
            contacts: chats.map(chat => ({
                id: chat.id,
                avatar: chat.avatar || 'avatar.png',
                name: chat.title,
                preview: chat.last_message?.content || 'Нет сообщений',
                timestamp: chat.last_message?.time || '',
                unread: chat.unread_count > 0 ? String(chat.unread_count) : undefined,
                active: chat.id === currentChatId,
                chatData: chat
            }))
        });

        // Вызываем рендер списка после обновления пропсов
        this.renderContacts();
    }

    private updateActiveChat(chat: ChatData) {
        this.setProps({
            currentChat: chat,
            showNoChatSelected: false
        });
        const chatHeader = this.getContent()?.querySelector('.chat-header__username');
        if (chatHeader) {
            chatHeader.textContent = chat.title;
        }
        const chatAvatar = this.getContent()?.querySelector('.chat-header__avatar-image');
        if (chatAvatar) {
            chatAvatar.setAttribute('src', chat.avatar || 'avatar.png');
        }
        this.renderContacts();
    }

    private autoscroll() {
        requestAnimationFrame(() => {
            const container = this.getContent()?.querySelector('.chat__messages');
            if (!container) return;

            container.scrollTop = container.scrollHeight;
        });
    }

    private updateMessagesState() {
        const { currentChat, messages, user } = store.getState();
        const chatMessages = currentChat?.id ? messages?.[currentChat.id] : null;

        this.setProps({
            showNoMessages: !chatMessages || chatMessages.length === 0,
            messages: chatMessages?.map(msg => ({
                ...msg,
                type: msg.user_id === user?.id ? 'outgoing' : 'incoming'
            })) || []
        });

        this.autoscroll();
        this.renderContacts();
    }

    componentDidMount() {
        this.setProps({ showDialog: false });

        // Обработчик клика вне диалога
        document.addEventListener('click', this.handleOutsideClick);

        store.on('changed', () => {
            const state = store.getState();
            if (state.currentChat) {
                this.updateActiveChat(state.currentChat);
            }
            if (state.chats) {
                this.updateChatList(state.chats);
            }
            this.updateMessagesState();
        });

        this.updateMessagesState();

        chatsController.getChats().then(() => {
            const currentChat = store.getState().currentChat;
            if (currentChat) {
                chatsController.selectChat(currentChat);
            }
        });
    }

    private handleOutsideClick = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        const isButton = target.closest('.dots-button__settings') || target.closest('.message-input__attach-btn');
        const isDialog = target.closest('.chat-header__actions-dialog') || target.closest('.message__actions-dialog');

        if (!isButton && !isDialog) {
            this.setProps({ showActionDialogUser: false });
            this.setProps({ showActionDialogMessage: false });
        }
        this.autoscroll();
        this.renderContacts();
    };

    componentWillUnmount() {
        document.removeEventListener('click', this.handleOutsideClick.bind(this));
        store.off('changed', this.updateChatList);
    }

    protected componentDidUpdate(): boolean {
        if (!this.props.dialogType) return false;
        const dialogTitle = this.props.dialogType === 'add'
            ? 'Добавить пользователя'
            : 'Удалить пользователя';
        const buttonText = this.props.dialogType === 'add'
            ? 'Добавить'
            : 'Удалить';
        if (this.children.userActionDialog) {
            const dialog = this.children.userActionDialog as ChangingDialog;
            dialog.setProps({
                dialogTitle,
                buttonText
            });
        }
        this.autoscroll();
        this.renderContacts();
        return true;
    }

    private async handleUserAction(login: string, action: 'add' | 'remove') {
        const chatId = store.getState().currentChat?.id;
        if (!chatId) {
            alert('Чат не выбран');
            return;
        }
        // Поиск пользователя по логину
        const user = await userController.searchUser(login);
        if (user) {
            if (action === 'add') {
                await chatsController.addUserToChat(chatId, user.id);
                alert(`Пользователь ${user.login} добавлен в чат`);
            } else {
                await chatsController.removeUserFromChat(chatId, user.id);
                alert(`Пользователь ${user.login} удален из чата`);
            }
            this.setProps({ showDialog: false });
        } else {
            alert('Пользователь не найден');
        }
    }

    public renderContacts() {
        const contactsContainer = this.getContent()?.querySelector('.chat__contacts');
        if (!contactsContainer) return;

        contactsContainer.innerHTML = '';

        this.props.contacts?.forEach(contact => {
            const contactItem = new ContactItem({
                id: contact.id,
                avatar: contact.avatar,
                name: contact.name,
                preview: contact.preview,
                timestamp: contact.timestamp,
                unread: contact.unread,
                active: contact.active,
                onContactClick: () => {
                    if (contact.chatData) {
                        this.handleChatClick(contact.chatData);
                    }
                }
            });

            const content = contactItem.getContent();
            if (content) {
                contactsContainer.appendChild(content);
            }
        });
    }

    init() {

        this.children.dotsSettingsButton = new DotsSettingsButton({
            onClick: (e: Event) => {
                e.preventDefault();
                e.stopPropagation();
                this.setProps({ showActionDialogUser: !this.props.showActionDialogUser });
                this.autoscroll();
                this.renderContacts();
            }
        });

        this.children.selectButton = new DotsSelectButton({
            onClick: (e: Event) => {
                e.preventDefault();
                e.stopPropagation();
                this.setProps({ showActionDialogMessage: !this.props.showActionDialogMessage });
                this.autoscroll();
                this.renderContacts();
            }
        });

        this.children.actionDialogMessage = new ActionDialogMessage({
            onSelectPhoto: () => {
                console.log('Фото или видео выбрано');
                this.setProps({ showActionDialogMessage: false });
            },
            onSelectFile: () => {
                console.log('Файл выбран');
                this.setProps({ showActionDialogMessage: false });
            },
            onSelectLocation: () => {
                console.log('Локация выбрана');
                this.setProps({ showActionDialogMessage: false });
            }
        });

        this.children.actionDialogUser = new ActionDialogUser({
            onAddUser: () => {
                this.setProps({
                    showDialog: true,
                    dialogType: 'add',
                    showActionDialogUser: false
                });

                this.renderContacts();
            },
            onRemoveUser: () => {
                this.setProps({
                    showDialog: true,
                    dialogType: 'remove',
                    showActionDialogUser: false
                });
                this.renderContacts();
            }
        });

        this.children.userActionDialog = new ChangingDialog({
            dialogTitle: 'Добавить пользователя',
            buttonText: 'Добавить',
            onClose: () => {
                this.setProps({ showDialog: false })
                this.renderContacts();
            },
            onSubmit: async (login: string) => {
                if (this.props.dialogType) {
                    this.handleUserAction(login, this.props.dialogType);
                }
                this.renderContacts();
            }
        });

        this.children.link = new Link({
            position: 'center',
            style: 'chats',
            name: 'Профиль >',
            events: {
                click: (e: Event) => {
                    e.preventDefault();
                    this.router.go('/settings');
                }
            }
        });

        this.children.createChatButton = new Button({
            name: '+',
            type: 'button',
            style: 'action-add',
            events: {
                click: async (e: Event) => {
                    e.preventDefault();
                    const title = prompt('Введите название чата:');
                    if (title) {
                        try {
                            await chatsController.createChat(title);
                        } catch (error) {
                            console.error('Ошибка при создании чата:', error);
                        }
                    }
                }
            }
        });

        this.children.deleteChatButton = new Button({
            name: '-',
            type: 'button',
            style: 'action-remove',
            events: {
                click: async (e: Event) => {
                    e.preventDefault();
                    const currentChat = store.getState().currentChat;
                    if (!currentChat) {
                        alert('Выберите чат для удаления');
                        return;
                    }

                    if (confirm(`Вы уверены, что хотите удалить чат "${currentChat.title}"?`)) {
                        try {
                            await chatsController.deleteChat(currentChat.id);
                            await chatsController.getChats();
                            store.set({
                                currentChat: null
                            });
                            this.setProps({
                                showNoChatSelected: true
                            });
                        } catch (error) {
                            console.error('Ошибка при удалении чата:', error);
                            alert('Не удалось удалить чат');
                        }
                    }
                }
            }
        });

        this.children.inputSearch = new Input({
            class: '--search',
            name: 'search',
            id: 'search',
            type: 'text',
            placeholder: '🔍︎ Поиск',
            autocomplete: 'search',
            validateRule: 'search' as ValidationRule
        });

        /**
        this.children.dialogIncoming1 = new Dialog({
            type: 'incoming',
            content: 'Привет! Смотри, тут всплыл интересный кусок лунной космической истории — НАСА в какой-то момент
        попросила Хассельблад адаптировать модель SWC для полетов на Луну. Сейчас мы все знаем что астронавты летали
        с моделью 500 EL — и к слову говоря, все тушки этих камер все еще находятся на поверхности Луны,
        так как астронавты с собой забрали только кассеты с пленкой.',
            time: '11:56'
        });

        this.children.dialogIncoming2 = new Dialog({
            type: 'incoming',
            content: 'Хассельблад в итоге адаптировал SWC для космоса, но что-то пошло не так и на ракету
        они так никогда и не попали. Всего их было произведено 25 штук, одну из них недавно продали на аукционе за 45000 евро.',
            time: '11:56'
        });

        this.children.dialogIncomingImage = new Dialog({
            type: 'incoming',
            Image: true,
            content: 'camera.png',
            time: '11:56'
        });

        this.children.dialogOutgoing = new Dialog({
            type: 'outgoing',
            content: 'Круто!',
            time: '12:00'
        });
        **/

        this.children.inputMessage = new Message({
            id: 'message',
            placeholder: 'Сообщение',
            name: 'message',
            validateRule: 'message' as ValidationRule,
            errorText: 'Сообщение не должно быть пустым',
            onEnter: this.handleSendMessage.bind(this),
        });

        this.children.sendButton = new ButtonCallback({
            class: 'message-input__send-btn',
            title: 'Отправить',
            type: 'button',
            content: `
                <span class="message-input__send-icon">
                    <span class="message-input__send-icon-line-1"></span>
                    <span class="message-input__send-icon-line-2"></span>
                    <span class="message-input__send-icon-line-3"></span>
                </span>
            `,
            events: {
                click: (e: Event) => {
                    e.preventDefault();
                    this.handleSubmit(e);
                }
            },
        });
    }

    protected render(): DocumentFragment {
        return this.compile(template, {
            ...this.props,
            isAddDialog: this.props.dialogType === 'add',
            isRemoveDialog: this.props.dialogType === 'remove'
        });
    }
}
