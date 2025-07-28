import { Block } from '../../core/block';
import template from './profile_edit.hbs?raw';
import { Input, Button, AvatarInput } from '../../components';
import { ValidationRule, validationRules } from '../../utils/validation';
import Router from '../../utils/router';
import { store } from "../../core/store";
import { userController } from "../../controllers";
import { API_V2_RESOURCES } from "../../config";

interface ProfileEditPageProps {
    errors?: Record<string, string>;
    labelEmail?: string;
    labelLogin?: string;
    labelFirstName?: string;
    labelSecondName?: string;
    labelDisplayName?: string;
    labelPhone?: string;
    idEmail?: string;
    idLogin?: string;
    idFirstName?: string;
    idSecondName?: string;
    idDisplayName?: string;
    idPhone?: string;
    idAvatar?: string;
    handleSubmit?: (_form: HTMLFormElement) => void;
    handleKeyDown?: (_e: KeyboardEvent) => void;
    [key: string]: unknown;
}

export class ProfileEditPage extends Block<ProfileEditPageProps> {
    private isSubmitting = false;
    private router: Router;

    constructor(props: ProfileEditPageProps = {}) {
        const user = store.getState().user;

        super({
            ...props,
            errors: {},
            labelEmail: "Почта",
            labelLogin: "Логин",
            labelFirstName: "Имя",
            labelSecondName: "Фамилия",
            labelDisplayName: "Имя в чате",
            labelPhone: "Телефон",
            idEmail: "email",
            idLogin: "login",
            idFirstName: "firstName",
            idSecondName: "secondName",
            idDisplayName: "displayName",
            idPhone: "phone",
            idAvatar: "avatar",
            emailValue: user?.email || '',
            loginValue: user?.login || '',
            firstNameValue: user?.first_name || '',
            secondNameValue: user?.second_name || '',
            displayNameValue: user?.display_name || '',
            phoneValue: user?.phone || '',
            currentAvatar: user?.avatar || '',

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

                    validateField('email', 'email', 'Неверная почта');
                    validateField('login', 'login', 'Неверный логин');
                    validateField('firstName', 'name', 'Неверное имя');
                    validateField('secondName', 'name', 'Неверная фамилия');
                    validateField('displayName', 'message', 'Неверное имя в чате');
                    validateField('phone', 'phone', 'Неверный телефон');

                    this.setProps({ errors });

                    // Получаем файл из AvatarInput
                    const avatarFile = (this.children.avatarInput as AvatarInput).getFile();

                    if (avatarFile) {
                        // Добавляем файл в FormData
                        formData.append('avatar', avatarFile);
                    }

                    // Отправляем аватар
                    if (avatarFile) {
                        await userController.changeAvatar(formData);
                    }

                    if (isValid) {
                        const profileData = {
                            first_name: formData.get('firstName') as string,
                            second_name: formData.get('secondName') as string,
                            display_name: formData.get('displayName') as string,
                            login: formData.get('login') as string,
                            email: formData.get('email') as string,
                            phone: formData.get('phone') as string
                        };

                        await userController.changeProfile(profileData);
                        this.router.go('/settings');
                    }
                } catch (e) {
                    console.error("Ошибка при сохранении:", e);
                    store.set({ error: e instanceof Error ? e.message : "Ошибка обновления профиля" });
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
            avatarElement.style.backgroundImage = `url(${API_V2_RESOURCES}${user.avatar})`;
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
        const user = store.getState().user;

        this.children.avatarInput = new AvatarInput({
            id: 'avatar',
            name: 'avatar',
            currentAvatar: user?.avatar
                ? `${API_V2_RESOURCES}${user.avatar})`
                : undefined
        });

        // Инициализация остальных полей...
        this.children.inputEmail = new Input({
            name: 'email',
            id: 'email',
            type: 'email',
            value: user?.email || '',
            placeholder: 'Почта',
            events: {
                blur: (e: Event) => this.handleBlur(e, 'email', 'Неверная почта')
            }
        });

        this.children.inputLogin = new Input({
            name: 'login',
            id: 'login',
            type: 'text',
            value: user?.login || '',
            placeholder: user?.login || 'Логин',
            autocomplete: 'login',
            events: {
                blur: (e: Event) => this.handleBlur(e, 'login', 'Неверный логин')
            }
        });

        this.children.inputFirstName = new Input({
            name: 'firstName',
            id: 'firstName',
            type: 'text',
            value: user?.first_name || '',
            placeholder: user?.first_name || 'Имя',
            autocomplete: 'first_name',
            events: {
                blur: (e: Event) => this.handleBlur(e, 'name', 'Неверное Имя')
            }
        });

        this.children.inputSecondName = new Input({
            name: 'secondName',
            id: 'secondName',
            type: 'text',
            value: user?.second_name || '',
            placeholder: user?.second_name || 'Фамилия',
            autocomplete: 'family_name',
            events: {
                blur: (e: Event) => this.handleBlur(e, 'name', 'Неверная Фамилия')
            }
        });

        this.children.inputDisplayName = new Input({
            name: 'displayName',
            id: 'displayName',
            type: 'text',
            value: user?.display_name || '',
            placeholder: user?.display_name || 'Имя в чате',
            autocomplete: 'name',
            events: {
                blur: (e: Event) => this.handleBlur(e, 'name', 'Неверное Имя в чате')
            }
        });

        this.children.inputPhone = new Input({
            name: 'phone',
            id: 'phone',
            type: 'text',
            value: user?.phone || '',
            placeholder: user?.phone || 'Телефон',
            autocomplete: 'phone',
            events: {
                blur: (e: Event) => this.handleBlur(e, 'phone', 'Неверный телефон')
            }
        });

        this.children.button = new Button({
            name: 'Сохранить',
            type: 'submit',
            style: 'primary',
        });

        this.setProps({
            events: {
                submit: (e: Event) => {
                    e.preventDefault();
                    this.props.handleSubmit?.(e.target as HTMLFormElement);
                },
                keydown: (e: Event) => {
                    this.props.handleKeyDown?.(e as KeyboardEvent);
                }
            }
        });
    }

    protected render(): DocumentFragment {
        return this.compile(template, this.props);
    }
}
