import { Block } from '../../core/block';
import template from './chat-bottom.hbs?raw';
import { Message } from "../message/message.ts";
import { ButtonCallback } from "../button-callback/button-callback.ts";
import { ValidationRule } from "../../utils/validation.ts";

interface ChatBottomProps {
    showActionDialogMessage?: boolean;
    onSend?: (message: string) => void; // Добавляем callback
}

export class ChatBottom extends Block {
    constructor(props: ChatBottomProps = {}) {
        super({
            ...props
        });
    }

    init() {
        this.children.inputMessage = new Message({
            id: 'message',
            placeholder: 'Сообщение',
            name: 'message',
            validateRule: 'message' as ValidationRule, // Добавляем правило валидации
            errorText: 'Сообщение не должно быть пустым' // Кастомный текст ошибки
        });

        this.children.sendButton = new ButtonCallback({
            class: 'message-input__send-btn',
            title: 'Отправить',
            type: 'button', // Меняем тип на button
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

                    // Проверяем валидность
                    const isValid = messageComponent.validate();

                    if (isValid) {
                        const message = messageComponent.getValue();
                        this.props.onSend?.(message);
                        messageComponent.setValue("");
                    }
                }
            }
        });
    }

    protected render(): DocumentFragment {
        return this.compile(template, {
            ...this.props,
            showActionDialogMessage: this.props.showActionDialogMessage
        });
    }
}