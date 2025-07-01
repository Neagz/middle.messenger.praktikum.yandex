import { Block } from '../../core/block';
import template from './profile_edit.hbs?raw';
import { Input } from '../../components/input/input';
import { Button } from '../../components/button/button';
import {ValidationRule, validationRules} from '../../utils/validation';

export class ProfileEditPage extends Block {
    constructor() {
        super({
            validate: {
                name: (value: string) => validationRules.name(value),
                login: (value: string) => validationRules.login(value),
                email: (value: string) => validationRules.email(value),
                password: (value: string) => validationRules.password(value),
                phone: (value: string) => validationRules.phone(value),

            },
            onEditProfile: (e: Event) => {
                e.preventDefault();

                // Валидируем конкретные поля
                const isEmailValid = (this.children.inputEmail as Input).validate();
                const isLoginValid = (this.children.inputLogin as Input).validate();
                const isFirstNameValid = (this.children.inputFirstName as Input).validate();
                const isSecondNameValid = (this.children.inputSecondName as Input).validate();
                const isPhoneValid = (this.children.inputPhone as Input).validate();

                if (isEmailValid && isLoginValid && isFirstNameValid && isSecondNameValid && isPhoneValid) {
                    // Получаем значения
                    const email = (this.children.inputEmail as Input).getValue();
                    const login = (this.children.inputLogin as Input).getValue();
                    const first_name = (this.children.inputFirstName as Input).getValue();
                    const second_name = (this.children.inputSecondName as Input).getValue();
                    const display_name = (this.children.inputDisplayName as Input).getValue();
                    const phone = (this.children.inputPhone as Input).getValue();

                    console.log('Form data:', {email, login, first_name, second_name, display_name, phone });
                    window.navigate('profile');
                }
            }
        });
    }

    init() {
        // Добавляем обработчик submit к форме
        this.setProps({
            events: {
                submit: this.props.onEditProfile
            }
        });
        this.children.inputEmail = new Input({
            label: 'Почта',
            name: 'email',
            id: 'email',
            type: 'email',
            value: 'neagz@yandex.ru',
            placeholder: 'neagz@yandex.ru',
            autocomplete: 'email',
            validateRule: 'email' as ValidationRule,
            errorText: 'Неверная почта'
        });

        this.children.inputLogin = new Input({
            label: 'Логин',
            name: 'login',
            id: 'login',
            type: 'text',
            value: 'neagz',
            placeholder: 'neagz',
            autocomplete: 'login',
            validateRule: 'login' as ValidationRule,
            errorText: 'Неверный логин'
        });

        this.children.inputFirstName = new Input({
            label: 'Имя',
            name: 'first_name',
            id: 'first_name',
            type: 'text',
            value: 'Андрей',
            placeholder: 'Андрей',
            autocomplete: 'first_name',
            validateRule: 'name' as ValidationRule,
            errorText: 'Неверное имя'
        });

        this.children.inputSecondName = new Input({
            label: 'Фамилия',
            name: 'second_name',
            id: 'second_name',
            type: 'text',
            value: 'Быстров',
            placeholder: 'Быстров',
            autocomplete: 'family_name',
            validateRule: 'name' as ValidationRule,
            errorText: 'Неверная фамилия'
        });

        this.children.inputDisplayName = new Input({
            label: 'Имя в чате',
            name: 'display_name',
            id: 'display_name',
            type: 'text',
            value: 'Андрей Б.',
            placeholder: 'Андрей Б.',
            autocomplete: 'name',
            validateRule: 'name' as ValidationRule
        });

        this.children.inputPhone = new Input({
            label: 'Телефон',
            name: 'phone',
            id: 'phone',
            type: 'text',
            value: '+79996680250',
            placeholder: '+7 (999) 668 02 50',
            autocomplete: 'phone',
            validateRule: 'phone' as ValidationRule,
            errorText: 'Неверный формат номера телефона, убери пробелы и скобки'
        });

        this.children.button = new Button({
            name: 'Сохранить',
            type: 'submit',
            style: 'primary',
        });
    }

    protected render(): DocumentFragment {
        return this.compile(template, this.props);
    }
}
