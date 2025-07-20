import { Block } from '../../core/block';
import template from './profile_password.hbs?raw';
import {Input, Button} from '../../components';
import { ValidationRule, validationRules } from '../../utils/validation';
import Router from '../../utils/router';
import { userController } from "../../controllers";
import { store } from "../../core/store";

interface ProfilePasswordPageProps {
    currentAvatar?: string;
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
    private router: Router;
    constructor(props: ProfilePasswordPageProps = {}) {
        const user = store.getState().user;
        super({
            ...props,
            errors: {},
            currentAvatar: user?.avatar || '',
            labelOldPassword: "Старый пароль",
            labelNewPassword: "Новый пароль",
            labelRepeatPassword: "Повторите новый пароль",
            idOldPassword: "oldPassword",
            idNewPassword: "newPassword",
            idRepeatPassword: "repeatPassword",

            handleSubmit: async (form: HTMLFormElement) => {
                if (this.isSubmitting) return;
                this.isSubmitting = true;

                try {
                    const formData = new FormData(form);
                    const errors: Record<string, string> = {};
                    let isValid = true;

                    // Валидация полей
                    const validateField = (name: string, rule: ValidationRule, errorText: string) => {
                        const value = formData.get(name) as string;
                        if (!validationRules[rule](value)) {
                            errors[name] = errorText;
                            isValid = false;
                        }
                    };

                    validateField('oldPassword', 'password', 'Неверный пароль');
                    validateField('newPassword', 'password', 'Неверный пароль');

                    this.setProps({errors});

                    if (isValid) {
                        const passwordData = {
                            oldPassword: formData.get('oldPassword') as string,
                            newPassword: formData.get('newPassword') as string,
                        };

                        await userController.changePassword(passwordData);
                        this.router.go('/settings');
                    }
                } catch (e) {
                    console.error("Ошибка при сохранении:", e);
                    store.set({error: e instanceof Error ? e.message : "Ошибка обновления профиля"});
                } finally {
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

        this.router = new Router();
        store.on('changed', () => {
            this.updateAvatarFromStore();
        });
    }

    private updateAvatarFromStore() {
        const user = store.getState().user;
        if (user?.avatar !== this.props.currentAvatar) {
            this.setProps({ currentAvatar: user?.avatar });
            this.updateAvatarDisplay();
        }
    }

    private updateAvatarDisplay() {
        const user = store.getState().user;
        const avatarElement = this._element?.querySelector('.avatar-input__default-icon') as HTMLElement;

        if (!avatarElement) return;

        // Удаляем все классы и стили
        avatarElement.className = '';
        avatarElement.removeAttribute('style');

        // Создаём новый класс
        const newClass = user?.avatar ? 'avatar-custom' : 'avatar-default';
        avatarElement.classList.add('avatar-input__default-icon', newClass);

        if (user?.avatar) {
            avatarElement.style.backgroundImage = `url(https://ya-praktikum.tech/api/v2/resources${user.avatar})`;
            avatarElement.style.backgroundSize = 'cover';
        }
    }

    componentDidMount() {
        this.updateAvatarDisplay();
    }

    private handleBlur(e: Event, rule: ValidationRule, errorText: string) {
        const target = e.target as HTMLInputElement;
        const isValid = validationRules[rule](target.value);
        const error = isValid ? '' : errorText;

        queueMicrotask(() => ({
            errors: { ...this.props.errors, [target.name]: error }
        }));
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
            value: '',
            placeholder: 'Старый пароль',
            autocomplete: 'new-password',
            validateRule: 'password' as ValidationRule,
            events: {
                blur: (e: Event) => this.handleBlur(e, 'password', 'Неверный пароль')
            }
        });

        this.children.inputNewPassword = new Input({
            name: 'newPassword',
            id: 'newPassword',
            type: 'password',
            value: '',
            placeholder: 'Новый пароль',
            autocomplete: 'new-password',
            validateRule: 'password' as ValidationRule,
            events: {
                blur: (e: Event) => this.handleBlur(e, 'password', 'Неверный формат пароля')
            }
        });

        this.children.inputRepeatPassword = new Input({
            name: 'repeatPassword',
            id: 'repeatPassword',
            type: 'password',
            value: '',
            placeholder: 'Повторите новый пароль',
            autocomplete: 'new-password',
            validateRule: 'password' as ValidationRule,
            events: {
                blur: (e: Event) => this.handleBlur(e, 'password', 'Пароли не совпадают')
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
