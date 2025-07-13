import { Block } from '../../core/block';
import template from './profile_edit.hbs?raw';
import { Input } from '../../components';
import { Button } from '../../components';
import { AvatarInput } from '../../components';
import {ValidationRule, validationRules} from '../../utils/validation';

interface ProfileEditPageProps {
    title?: string;
    label?: string;
    id?: string;
    name?: string;
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
    constructor(props: ProfileEditPageProps = {} ) {
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

            handleSubmit: (form: HTMLFormElement) => {
                if (this.isSubmitting) return;
                this.isSubmitting = true;

                try {
                    const formData = new FormData(form);
                    const data = Object.fromEntries(formData.entries());
                    const errors: Record<string, string> = {};
                    let isValid = true;

                    const emailValue = formData.get('email') as string;
                    if (!validationRules.email(emailValue)) {
                        errors.email = 'Неверная почта';
                        isValid = false;
                    }

                    const loginValue = formData.get('login') as string;
                    if (!validationRules.login(loginValue)) {
                        errors.login = 'Неверный логин';
                        isValid = false;
                    }

                    const firstNameValue = formData.get('firstName') as string;
                    if (!validationRules.name(firstNameValue)) {
                        errors.firstName = 'Неверное Имя';
                        isValid = false;
                    }

                    const secondNameValue = formData.get('secondName') as string;
                    if (!validationRules.name(secondNameValue)) {
                        errors.secondName = 'Неверная Фамилия';
                        isValid = false;
                    }

                    const displayNameValue = formData.get('displayName') as string;
                    if (!validationRules.message(displayNameValue)) {
                        errors.displayName = 'Неверное Имя в чате';
                        isValid = false;
                    }

                    const phoneValue = formData.get('phone') as string;
                    if (!validationRules.phone(phoneValue)) {
                        errors.phone = 'Неверный телефон';
                        isValid = false;
                    }

                    this.setProps({ errors });

                    if (isValid) {
                        // Получаем файл аватарки
                        const avatarFile = formData.get('avatar');

                        if (avatarFile instanceof File && avatarFile.size > 0) {
                            console.log('Аватар выбран:', avatarFile);
                            // Здесь будет логика загрузки на сервер
                        }

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

        queueMicrotask(() => {
            this.setProps({ errors: { ...this.props.errors, [fieldName]: error } });
        });
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

        this.children.avatarInput = new AvatarInput({
            name: 'avatar',
            currentAvatar: '/icon_profile.svg'
        });

        this.children.inputEmail = new Input({
            name: 'email',
            id: 'email',
            type: 'email',
            value: 'neagz@yandex.ru',
            placeholder: 'neagz@yandex.ru',
            autocomplete: 'email',
            events: {
                blur: (e: Event) => {
                    const target = e.target as HTMLInputElement;
                    this.handleBlur(
                        target.name,
                        target.value,
                        'email' as ValidationRule,
                        'Неверная почта'
                    );
                }
            }
        });

        this.children.inputLogin = new Input({
            name: 'login',
            id: 'login',
            type: 'text',
            value: 'neagz',
            placeholder: 'neagz',
            autocomplete: 'login',
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

        this.children.inputFirstName = new Input({
            name: 'firstName',
            id: 'firstName',
            type: 'text',
            value: 'Андрей',
            placeholder: 'Андрей',
            autocomplete: 'first_name',
            events: {
                blur: (e: Event) => {
                    const target = e.target as HTMLInputElement;
                    this.handleBlur(
                        target.name,
                        target.value,
                        'name' as ValidationRule,
                        'Неверное Имя'
                    );
                }
            }
        });

        this.children.inputSecondName = new Input({
            name: 'secondName',
            id: 'secondName',
            type: 'text',
            value: 'Быстров',
            placeholder: 'Быстров',
            autocomplete: 'family_name',
            events: {
                blur: (e: Event) => {
                    const target = e.target as HTMLInputElement;
                    this.handleBlur(
                        target.name,
                        target.value,
                        'name' as ValidationRule,
                        'Неверная Фамилия'
                    );
                }
            }
        });

        this.children.inputDisplayName = new Input({
            name: 'displayName',
            id: 'displayName',
            type: 'text',
            value: 'Андрей Б.',
            placeholder: 'Андрей Б.',
            autocomplete: 'name',
            events: {
                blur: (e: Event) => {
                    const target = e.target as HTMLInputElement;
                    this.handleBlur(
                        target.name,
                        target.value,
                        'name' as ValidationRule,
                        'Неверное Имя в чате'
                    );
                }
            }
        });

        this.children.inputPhone = new Input({
            name: 'phone',
            id: 'phone',
            type: 'text',
            value: '+79996680250',
            placeholder: '+7 (999) 668 02 50',
            autocomplete: 'phone',
            events: {
                blur: (e: Event) => {
                    const target = e.target as HTMLInputElement;
                    this.handleBlur(
                        target.name,
                        target.value,
                        'phone' as ValidationRule,
                        'Неверный телефон'
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
