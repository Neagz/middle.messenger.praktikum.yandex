import { Block } from '../../core/block';
import { TestButton } from '../../components/test-button/test-button';
import template from './test_page.hbs?raw';
import { Input, Message } from "../../components";
import { ValidationRule, validationRules } from "../../utils/validation.ts";

interface TestPageProps {
    title?: string;
    label?: string;
    id?: string;
    name?: string;
    errors?: Record<string, string>;
}

export class TestPage extends Block {
    constructor(props: TestPageProps = {}) {
        super({
            ...props,
            errors: {}, // Инициализация состояния ошибок
            title: "Тестовая страница",
            label: "Логин",
            id: "username",
            label2: "Пароль",
            id2: "password",
        });
    }

    // Обработчик события blur для валидации
    handleBlur = (fieldName: string, value: string, rule: ValidationRule | undefined, errorText: string) => {
        if (!rule) return;

        const isValid = validationRules[rule](value);
        const error = isValid ? '' : errorText;

        this.setProps({
            errors: {
                ...this.props.errors,
                [fieldName]: error
            }
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
            name: 'login',
            id: 'username',
            type: 'text',
            autocomplete: 'login',
            validateRule: 'login' as ValidationRule,
            events: {
                blur: (e: Event) => {
                    const target = e.target as HTMLInputElement;
                    this.handleBlur(
                        target.name,
                        target.value,
                        'login' as ValidationRule,
                        'Неверный логин'
                    );
                }
            }
        });

        this.children.inputPassword = new Input({
            name: 'password',
            id: 'password',
            type: 'password',
            autocomplete: 'new-password',
            validateRule: 'password' as ValidationRule,
            events: {
                blur: (e: Event) => {
                    const target = e.target as HTMLInputElement;
                    this.handleBlur(
                        target.name,
                        target.value,
                        'password' as ValidationRule,
                        'Неверный пароль'
                    );
                }
            }
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
        return this.compile(template, {
            ...this.props,
            errors: this.props.errors || {}
        });
    }
}
