import { Block } from '../../core/block';
import template from './registration.hbs?raw';
import { Input } from '../../components/input/input';
import { Button } from '../../components/button/button';
import { Link } from '../../components/link/link';
import {ValidationRule, validationRules} from '../../utils/validation';

export class RegistrationPage extends Block {
    constructor() {
        super({
            validate: {
                name: (value: string) => validationRules.name(value),
                login: (value: string) => validationRules.login(value),
                email: (value: string) => validationRules.email(value),
                password: (value: string) => validationRules.password(value),
                phone: (value: string) => validationRules.phone(value),

            },
            onRegister: (e: Event) => {
                e.preventDefault();

                // Валидируем конкретные поля
                const isEmailValid = (this.children.inputEmail as Input).validate();
                const isLoginValid = (this.children.inputLogin as Input).validate();
                const isFirstNameValid = (this.children.inputFirstName as Input).validate();
                const isSecondNameValid = (this.children.inputSecondName as Input).validate();
                const isPhoneValid = (this.children.inputPhone as Input).validate();
                const isPasswordValid = (this.children.inputPassword as Input).validate();
                const isConfirmPasswordValid = (this.children.inputConfirmPassword as Input).validate();

                if (isEmailValid && isLoginValid && isFirstNameValid && isSecondNameValid && isPhoneValid && isPasswordValid && isConfirmPasswordValid) {
                    // Получаем значения
                    const email = (this.children.inputEmail as Input).getValue();
                    const login = (this.children.inputLogin as Input).getValue();
                    const first_name = (this.children.inputFirstName as Input).getValue();
                    const second_name = (this.children.inputSecondName as Input).getValue();
                    const phone = (this.children.inputPhone as Input).getValue();
                    const password = (this.children.inputPassword as Input).getValue();
                    const confirm_password = (this.children.inputConfirmPassword as Input).getValue();

                    console.log('Form data:', {email, login, first_name, second_name, phone, password, confirm_password });
                    window.navigate('list');
                }
            }
        });
    }

    init() {
        // Добавляем обработчик submit к форме
        this.setProps({
            events: {
                submit: this.props.onRegister
            }
        });

        this.children.inputEmail = new Input({
            label: 'Почта',
            name: 'email',
            id: 'email',
            type: 'email',
            autocomplete: 'email',
            validateRule: 'email' as ValidationRule,
            errorText: 'Неверная почта'
        });

        this.children.inputLogin = new Input({
            label: 'Логин',
            name: 'login',
            id: 'login',
            type: 'text',
            //error: 'Не верный логин',
            autocomplete: 'login',
            validateRule: 'login' as ValidationRule,
            errorText: 'Неверный логин'
        });

        this.children.inputFirstName = new Input({
            label: 'Имя',
            name: 'first_name',
            id: 'first_name',
            type: 'text',
            autocomplete: 'first_name',
            validateRule: 'name' as ValidationRule,
            errorText: 'Неверное имя'
        });

        this.children.inputSecondName = new Input({
            label: 'Фамилия',
            name: 'second_name',
            id: 'second_name',
            type: 'text',
            autocomplete: 'family_name',
            validateRule: 'name' as ValidationRule,
            errorText: 'Неверная фамилия'
        });

        this.children.inputPhone = new Input({
            label: 'Телефон',
            name: 'phone',
            id: 'phone',
            type: 'text',
            autocomplete: 'phone',
            validateRule: 'phone' as ValidationRule,
            errorText: 'Неверный номер телефона'
        });

        this.children.inputPassword = new Input({
            label: 'Пароль',
            name: 'password',
            id: 'password',
            type: 'password',
            autocomplete: 'new-password',
            validateRule: 'password' as ValidationRule,
            errorText: 'Неверный пароль'
        });

        this.children.inputConfirmPassword = new Input({
            label: 'Пароль (еще раз)',
            name: 'confirm_password',
            id: 'confirm_password',
            type: 'password',
            //error: 'Пароли не совпадают',
            autocomplete: 'new-password',
            validateRule: 'password' as ValidationRule,
            errorText: 'Пароли не совпадают'
        });

        this.children.button = new Button({
            name: 'Зарегистрироваться',
            type: 'submit',
            style: 'primary',
        });

        this.children.link = new Link({
            page: 'login',
            position: 'center',
            style: 'primary',
            name: 'Войти'
        });
    }

    protected render(): DocumentFragment {
        return this.compile(template, this.props);
    }
}
