import { Block } from '../../core/block';
import template from './list.hbs?raw';
import { Link } from '../../components/link/link';
import { ChatHeader } from '../../components/chat-header/chat-header';
import { Dialog } from '../../components/dialog/dialog';
import { ChatBottom } from '../../components/chat-bottom/chat-bottom.ts';
import { RemoveDialog } from '../../components/remove-dialog/remove-dialog';
import { Input } from "../../components";
import { ValidationRule } from "../../utils/validation.ts";

export class ListPage extends Block {
    constructor(context: any = {}) {
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
            label: '',
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

        this.children.chatHeader = new ChatHeader({
            avatar: 'avatar.png',
            username: 'Вадим',
            showActionDialogUser: this.props.showActionDialogUser,
            events: {
                click: (e: Event) => {
                    const target = e.target as HTMLElement;
                    if (target.closest('.dots-button__settings')) {
                        this.toggleActions(e, 'User');
                    } else if (target.closest('.remove-button')) {
                        this.props.openRemoveDialog();
                    }
                }
            }
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

        this.children.chatBottom = new ChatBottom({
            showActionDialogMessage: this.props.showActionDialogMessage,
            onSend: (message: string) => {
                console.log("Кнопка нажата", message);
            }
        });

        // Исправлено: используем RemoveDialog напрямую
        this.children.removeDialog = new RemoveDialog({
            title: 'Удалить пользователя',
        });
    }

    toggleActions(e: Event, type: string) {
        e.stopPropagation();
        this.setProps({
            [`showActionDialog${type}`]: !this.props[`showActionDialog${type}`]
        });
    }

    protected componentDidUpdate(): boolean {
        (this.children.chatHeader as Block).setProps({
            showActionDialogUser: this.props.showActionDialogUser
        });

        (this.children.message as Block).setProps({
            showActionDialogMessage: this.props.showActionDialogMessage
        });

        return true;
    }

    protected render(): DocumentFragment {
        return this.compile(template, this.props);
    }
}
