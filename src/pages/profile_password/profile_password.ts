import { Block } from '../../core/block';
import template from './profile_password.hbs?raw';
import { Input } from '../../components/input/input';
import { Button } from '../../components/button/button';
import {ValidationRule, validationRules} from '../../utils/validation';

export class ProfilePasswordPage extends Block {
    constructor() {
        super({
            validate: {
                password: (value: string) => validationRules.password(value),

            },
            onProfilePassword: (e: Event) => {
                e.preventDefault();

                // Валидируем конкретные поля
                const isOldPasswordValid = (this.children.inputOldPassword as Input).validate();
                const isNewPasswordValid = (this.children.inputNewPassword as Input).validate();
                const isRepeatNewPasswordValid = (this.children.inputRepeatPassword as Input).validate();

                if (isOldPasswordValid && isNewPasswordValid && isRepeatNewPasswordValid) {
                    // Получаем значения
                    const old_password = (this.children.inputOldPassword as Input).getValue();
                    const new_password = (this.children.inputNewPassword as Input).getValue();
                    const repeat_new_password = (this.children.inputRepeatPassword as Input).getValue();

                    console.log('Form data:', {old_password, new_password, repeat_new_password });
                    window.navigate('profile');
                }
            }
        });
    }

    init() {
        // Добавляем обработчик submit к форме
        this.setProps({
            events: {
                submit: this.props.onProfilePassword
            }
        });

        this.children.inputOldPassword = new Input({
            label: 'Старый пароль',
            name: 'oldPassword',
            id: 'password',
            type: 'password',
            value: 'Neagz111',
            placeholder: '••••••••',
            autocomplete: 'new-password',
            validateRule: 'password' as ValidationRule,
            errorText: 'Неверный пароль'
        });

        this.children.inputNewPassword = new Input({
            label: 'Новый пароль',
            name: 'newPassword',
            id: 'new-password',
            type: 'password',
            value: 'Neagz1111',
            placeholder: '••••••••••',
            autocomplete: 'new-password',
            validateRule: 'password' as ValidationRule,
            errorText: 'Неверный формат нового пароля'
        });

        this.children.inputRepeatPassword = new Input({
            label: 'Повторите новый пароль',
            name: 'repeat_newPassword',
            id: 'repeat_new-password',
            type: 'password',
            value: 'Neagz1111',
            placeholder: '••••••••••',
            autocomplete: 'new-password',
            validateRule: 'password' as ValidationRule,
            errorText: 'Пароли не совпадают'
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
