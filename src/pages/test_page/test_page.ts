import { Block } from '../../core/block';
import { TestButton } from '../../components/test-button/test-button';
import template from './test_page.hbs?raw';
import {Input, Message} from "../../components";
import {ValidationRule} from "../../utils/validation.ts";

interface TestPageProps {
    title?: string;
}

export class TestPage extends Block {
    constructor(props: TestPageProps = {}) {
        super({
            ...props,
            title: props.title || "Тестовая страница"
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

        this.children.inputLogin = new Input({
            label: 'Логин',
            name: 'login',
            id: 'login',
            type: 'text',
            autocomplete: 'login',
            validateRule: 'login' as ValidationRule,
            errorText: 'Неверный логин'
        });


        this.children.button1 = new TestButton({
            text: "Нажми меня",
            className: "my-button",
            page: "nav",
            events: {
                click: (e: Event) => {
                    e.preventDefault();
                    console.log("Клик сработал!");
                }
            }
        });

        this.children.button2 = new TestButton({
            text: "Наведи на меня",
            className: "my-button-two",
            events: {
                mouseover: (e: Event) => {
                    e.preventDefault();
                    console.log("Наведение сработало!");
                }
            }
        });
    }

    protected render(): DocumentFragment {
        return this.compile(template, this.props);
    }
}
