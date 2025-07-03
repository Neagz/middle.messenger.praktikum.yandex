import { Block } from '../../core/block';
import template from './login.hbs?raw';
import { Input } from '../../components/input/input';
import { Button } from '../../components/button/button';
import { Link } from '../../components/link/link';
import { ValidationRule, validationRules } from '../../utils/validation';
//import HTTPTransport from '../../core/httpTransport';
//const authAPI = new HTTPTransport('/auth');

export class LoginPage extends Block {
    constructor() {
        super({
            validate: {
                login: (value: string) => validationRules.login(value),
                password: (value: string) => validationRules.password(value),
            },
            onLogin: (e: Event) => {
                e.preventDefault();

                // Валидируем конкретные поля
                const isLoginValid = (this.children.inputLogin as Input).validate();
                const isPasswordValid = (this.children.inputPassword as Input).validate();

                if (isLoginValid && isPasswordValid) {
                    // Получаем значения
                    const login = (this.children.inputLogin as Input).getValue();
                    const password = (this.children.inputPassword as Input).getValue();
                    console.log('Form data:', { login, password });
                    window.navigate('list');
                }
            }
        });
    }

    init() {
        // Добавляем обработчик submit к форме
        this.setProps({
            events: {
                submit: this.props.onLogin
            }
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

        this.children.inputPassword = new Input({
            label: 'Пароль',
            name: 'password',
            id: 'password',
            type: 'password',
            //error: 'Ошибка',
            autocomplete: 'new-password',
            validateRule: 'password' as ValidationRule,
            errorText: 'Неверный пароль'
        });

        // Убираем обработчик click с кнопки
        this.children.button = new Button({
            name: 'Авторизоваться',
            type: 'submit', // Важно: type=submit
            style: 'primary'
        });

        this.children.link = new Link({
            page: 'registration',
            position: 'center',
            style: 'primary',
            name: 'Нет аккаунта?'
        });
    }

    protected render(): DocumentFragment {
        return this.compile(template, this.props);
    }
}
