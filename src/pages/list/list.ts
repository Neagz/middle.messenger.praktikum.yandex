import { Block } from '../../core/block';
import template from './list.hbs?raw';
import {
    Button,
    ButtonCallback,
    Input,
    Message,
    Link,
    Dialog,
    ChangingDialog,
    ActionDialogUser,
    ContactItem
} from '../../components';
import { ValidationRule } from '../../utils/validation';
import Router from '../../utils/router';
import { chatsController, userController } from '../../controllers';
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
            contacts: [],
            currentChat: null,
            showNoChatSelected: false,
            showNoMessages: false
        });
        this.router = new Router();
    }

    private handleChatClick = (chat: ChatData) => {
        console.log('Выбран чат:', chat.id, chat.title);
        chatsController.selectChat(chat);
    };

    private updateChatList(chats: ChatData[]) {
        const currentChatId = store.getState().currentChat?.id;
        const contacts = chats.map(chat => ({
            id: chat.id,
            avatar: chat.avatar || 'avatar.png',
            name: chat.title,
            preview: chat.last_message?.content || 'Нет сообщений',
            timestamp: chat.last_message?.time || '',
            unread: chat.unread_count > 0 ? String(chat.unread_count) : undefined,
            active: chat.id === currentChatId,
            onContactClick: () => {
                console.log('Вызов onContactClick по клику', chat.id);
                this.handleChatClick(chat);
            }
        }));
        this.setProps({ contacts });

        console.log('Component props updated:', {
            contacts: contacts.length,
            currentChat: !!currentChatId,
            showNoChatSelected: this.props.showNoChatSelected,
            showNoMessages: this.props.showNoMessages
        });
    }

    private handleDocumentClick = (e: Event) => {
        const target = e.target as HTMLElement;
        if (!target.closest('.chat-header__actions-dialog') && !target.closest('.dots-button__settings')) {
            this.setProps({ showActionDialogUser: false });
        }
        if (!target.closest('.message__actions-dialog') && !target.closest('.message-input__attach-btn')) {
            this.setProps({ showActionDialogMessage: false });
        }
        if (!target.closest('.dialog-container')) {
            this.setProps({ showDialog: false });
        }
    };

    private updateActiveChat(chat: ChatData) {
        console.log('Updating active chat:', chat.title);
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
        this.updateChatList(store.getState().chats || []);
    }

    componentDidMount() {
        document.addEventListener('click', this.handleDocumentClick);
        this.setProps({ showDialog: false });
        console.log('ListPage mounted');

        store.on('changed', () => {
            const state = store.getState();
            console.log('Store changed:', {
                chats: state.chats?.length,
                currentChat: state.currentChat,
                messages: Object.keys(state.messages || {}).length
            });
            if (state.chats) {
                this.updateChatList(state.chats);
            }
            if (state.currentChat) {
                this.updateActiveChat(state.currentChat);
            }
        });

        chatsController.getChats().then(() => {
            console.log('Initial chats loaded');
            const currentChat = store.getState().currentChat;
            if (currentChat) {
                console.log('Selecting initial chat:', currentChat.id);
                chatsController.selectChat(currentChat);
            }
        });
        setTimeout(() => {
            const contacts = this.getContent()?.querySelectorAll('[data-contact-id]');
            console.log('Found contact elements:', contacts);
            if (contacts) {
                contacts.forEach(contact => {
                    contact.addEventListener('click', (_e) => {
                        console.log('Ручной обработчик click по contacts сработал');
                    });
                });
            }
        }, 1000);
    }

    componentWillUnmount() {
        console.log('ListPage unmounted');
        document.removeEventListener('click', this.handleDocumentClick);
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
        return true;
    }

    private async handleUserAction(login: string, action: 'add' | 'remove') {
        const chatId = store.getState().currentChat?.id;
        if (!chatId) return;
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

    init() {
        // Создаём один экземпляр ContactItem как шаблон
        // Он будет использоваться Handlebars для рендера каждого элемента
        this.children.ContactItem = new ContactItem({
            // Можно передать пустые данные — они будут заменены при рендере
            id: 0,
            avatar: 'avatar.png',
            name: 'Загрузка...',
            preview: '...',
            timestamp: '',
            onContactClick: () => {}
        });

        // Остальные компоненты
        this.children.actionDialogUser = new ActionDialogUser({
            onAddUser: () => {
                this.setProps({
                    showDialog: true,
                    dialogType: 'add',
                    showActionDialogUser: false
                });
            },
            onRemoveUser: () => {
                this.setProps({
                    showDialog: true,
                    dialogType: 'remove',
                    showActionDialogUser: false
                });
            }
        });

        this.children.userActionDialog = new ChangingDialog({
            dialogTitle: 'Добавить пользователя',
            buttonText: 'Добавить',
            onClose: () => this.setProps({ showDialog: false }),
            onSubmit: async (login: string) => {
                if (this.props.dialogType) {
                    this.handleUserAction(login, this.props.dialogType);
                }
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
            name: 'Создать чат',
            type: 'button',
            style: 'primary',
            events: {
                click: (e: Event) => {
                    e.preventDefault();
                    const title = prompt('Введите название чата:');
                    if (title) {
                        chatsController.createChat(title)
                            .then(() => {
                                chatsController.getChats().then(chats => {
                                    const newChat = chats.find(chat => chat.title === title);
                                    if (newChat) {
                                        chatsController.selectChat(newChat);
                                    }
                                });
                            })
                            .catch(error => {
                                console.error('Ошибка при создании чата:', error);
                            });
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

        this.children.dialogIncoming1 = new Dialog({
            type: 'incoming',
            content: 'Привет! Смотри, тут всплыл интересный кусок лунной космической истории — НАСА в какой-то момент попросила Хассельблад адаптировать модель SWC для полетов на Луну. Сейчас мы все знаем что астронавты летали с моделью 500 EL — и к слову говоря, все тушки этих камер все еще находятся на поверхности Луны, так как астронавты с собой забрали только кассеты с пленкой.',
            time: '11:56'
        });

        this.children.dialogIncoming2 = new Dialog({
            type: 'incoming',
            content: 'Хассельблад в итоге адаптировал SWC для космоса, но что-то пошло не так и на ракету они так никогда и не попали. Всего их было произведено 25 штук, одну из них недавно продали на аукционе за 45000 евро.',
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

        this.children.inputMessage = new Message({
            id: 'message',
            placeholder: 'Сообщение',
            name: 'message',
            validateRule: 'message' as ValidationRule,
            errorText: 'Сообщение не должно быть пустым'
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
                    console.log('Кнопка отправки нажата');
                    e.preventDefault();
                    const messageComponent = this.children.inputMessage as Message;
                    const isValid = messageComponent.validate();
                    if (isValid) {
                        const message = messageComponent.getValue();
                        this.props.onSend?.(message);
                        messageComponent.setValue('');
                    }
                }
            }
        });

        // Общие события для всего компонента (настройки, прикрепить)
        this.setProps({
            events: {
                click: (e: Event) => {
                    const target = e.target as HTMLElement;
                    if (target.closest('.dots-button__settings')) {
                        this.setProps({
                            showActionDialogUser: !this.props.showActionDialogUser
                        });
                    }
                    if (target.closest('.message-input__attach-btn')) {
                        this.setProps({
                            showActionDialogMessage: !this.props.showActionDialogMessage
                        });
                    }
                }
            }
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
