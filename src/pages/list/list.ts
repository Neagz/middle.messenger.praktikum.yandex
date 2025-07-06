import { Block } from '../../core/block';
import template from './list.hbs?raw';
import { ButtonCallback, Input, Message, Link, Dialog, RemoveDialog } from "../../components";
import { ValidationRule } from "../../utils/validation.ts";

interface ListPageProps {
    contacts?: unknown[];
    onSend?: (_message: string) => void;
    [key: string]: unknown;
}

export class ListPage extends Block<ListPageProps> {
    constructor(context: ListPageProps = {}) {
        super({
            ...context
        });
    }

    init() {
        this.children.link = new Link({
            page: 'profile',
            position: 'center',
            style: 'chats',
            name: 'Профиль >'
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

        this.setProps({
            contacts: this.props.contacts || []
        });

        this.children.dialogIncoming1 = new Dialog({
            type: 'incoming',
            content: 'Привет! Смотри, тут всплыл интересный кусок лунной космической истории — ' +
                'НАСА в какой-то момент попросила Хассельблад адаптировать модель SWC для полетов на Луну. ' +
                'Сейчас мы все знаем что астронавты летали с моделью 500 EL — и к слову говоря, ' +
                'все тушки этих камер все еще находятся на поверхности Луны, ' +
                'так как астронавты с собой забрали только кассеты с пленкой.',
            time: '11:56'
        });

        this.children.dialogIncoming2 = new Dialog({
            type: 'incoming',
            content: 'Хассельблад в итоге адаптировал SWC для космоса, но что-то пошло не так ' +
                'и на ракету они так никогда и не попали. Всего их было произведено 25 штук, ' +
                'одну из них недавно продали на аукционе за 45000 евро.',
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
                    console.log("Кнопка отправки нажата");
                    e.preventDefault();
                    const messageComponent = this.children.inputMessage as Message;

                    const isValid = messageComponent.validate();

                    if (isValid) {
                        const message = messageComponent.getValue();
                        this.props.onSend?.(message);
                        messageComponent.setValue("");
                    }
                }
            }
        });

        this.children.removeDialog = new RemoveDialog({
            title: 'Удалить пользователя',
        });
    }

    protected render(): DocumentFragment {
        return this.compile(template, this.props);
    }
}
