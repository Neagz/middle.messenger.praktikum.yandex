import { Block } from '../../core/block';
import template from './profile_password.hbs?raw';
import { Input } from '../../components/input/input';
import { Button } from '../../components/button/button';
import {ValidationRule, validationRules} from '../../utils/validation';

interface ProfilePasswordPageProps {
    title?: string;
    label?: string;
    id?: string;
    name?: string;
    errors?: Record<string, string>;
    labelOldPassword?: string;
    labelNewPassword?: string;
    labelRepeatPassword?: string;
    idOldPassword?: string;
    idNewPassword?: string;
    idRepeatPassword?: string;
    handleSubmit?: (_form: HTMLFormElement) => void;
    handleKeyDown?: (_e: KeyboardEvent) => void;
    [key: string]: unknown;
}

export class ProfilePasswordPage extends Block<ProfilePasswordPageProps> {
    private isSubmitting = false;
    constructor(props: ProfilePasswordPageProps = {}) {
        super({
            ...props,
            errors: {},
            labelOldPassword: "Старый пароль",
            labelNewPassword: "Новый пароль",
            labelRepeatPassword: "Повторите новый пароль",
            idOldPassword: "oldPassword",
            idNewPassword: "newPassword",
            idRepeatPassword: "repeatPassword",

            handleSubmit: (form: HTMLFormElement) => {
                if (this.isSubmitting) return;
                this.isSubmitting = true;

                try {
                    const formData = new FormData(form);
                    const data = Object.fromEntries(formData.entries());
                    const errors: Record<string, string> = {};
                    let isValid = true;

                    const oldPasswordValue = formData.get('oldPassword') as string;
                    if (!validationRules.password(oldPasswordValue)) {
                        errors.oldPassword = 'Неверный пароль';
                        isValid = false;
                    }

                    const newPasswordValue = formData.get('newPassword') as string;
                    if (!validationRules.password(newPasswordValue)) {
                        errors.newPassword = 'Неверный формат пароля';
                        isValid = false;
                    }

                    const repeatPasswordValue = formData.get('repeatPassword') as string;
                    if (!validationRules.password(repeatPasswordValue)) {
                        errors.repeatPassword = 'Пароли не совпадают';
                        isValid = false;
                    }

                    this.setProps({ errors });

                    if (isValid) {
                        console.log('Данные формы:', data);
                        window.navigate('profile');
                    }
                }
                finally {
                    this.isSubmitting = false;
                }
            },

            handleKeyDown: (e: KeyboardEvent) => {
                if (e.key === 'Enter') {
                    const form = (e.target as HTMLElement).closest('form');
                    if (form) {
                        this.props.handleSubmit?.(form);
                    }
                }
            }
        });
    }

    handleBlur = (fieldName: string, value: string, rule: ValidationRule | undefined, errorText: string) => {
        if (!rule) return;

        const isValid = validationRules[rule](value);
        const error = isValid ? '' : errorText;

        setTimeout(() => {
            this.setProps({
                errors: {
                    ...this.props.errors,
                    [fieldName]: error
                }
            });
        }, 0);
    }

    init() {
        const keydownHandler = this.props.handleKeyDown
            ? (e: Event) => this.props.handleKeyDown!(e as KeyboardEvent)
            : undefined;

        this.setProps({
            events: {
                submit: (e: Event) => {
                    e.preventDefault();
                    this.props.handleSubmit?.(e.target as HTMLFormElement);
                },
                keydown: keydownHandler
            }
        });

        this.children.inputOldPassword = new Input({
            name: 'oldPassword',
            id: 'oldPassword',
            type: 'password',
            value: 'Neagz111',
            placeholder: '••••••••',
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

        this.children.inputNewPassword = new Input({
            name: 'newPassword',
            id: 'newPassword',
            type: 'password',
            value: 'Neagz1111',
            placeholder: '••••••••••',
            autocomplete: 'new-password',
            validateRule: 'password' as ValidationRule,
            events: {
                blur: (e: Event) => {
                    const target = e.target as HTMLInputElement;
                    this.handleBlur(
                        target.name,
                        target.value,
                        'password' as ValidationRule,
                        'Неверный формат пароля'
                    );
                }
            }
        });

        this.children.inputRepeatPassword = new Input({
            name: 'repeatPassword',
            id: 'repeatPassword',
            type: 'password',
            value: 'Neagz1111',
            placeholder: '••••••••••',
            autocomplete: 'new-password',
            validateRule: 'password' as ValidationRule,
            events: {
                blur: (e: Event) => {
                    const target = e.target as HTMLInputElement;
                    this.handleBlur(
                        target.name,
                        target.value,
                        'password' as ValidationRule,
                        'Пароли не совпадают'
                    );
                }
            }
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
