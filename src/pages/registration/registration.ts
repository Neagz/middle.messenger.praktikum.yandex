import { Block } from '../../core/block';
import template from './registration.hbs?raw';
import { Input, Button, Link } from '../../components';
import {ValidationRule, validationRules} from '../../utils/validation';
import Router from '../../utils/router';
import { ISignUpData } from "../../utils/types";
import { authController } from "../../controllers";

interface RegistrationPageProps {
    title?: string;
    label?: string;
    id?: string;
    name?: string;
    errors?: Record<string, string>;
    labelEmail?: string;
    labelLogin?: string;
    labelFirstName?: string;
    labelSecondName?: string;
    labelPhone?: string;
    labelPassword?: string;
    labelConfirmPassword?: string;
    idEmail?: string;
    idLogin?: string;
    idFirstName?: string;
    idSecondName?: string;
    idPhone?: string;
    idPassword?: string;
    idConfirmPassword?: string;
    handleSubmit?: (_form: HTMLFormElement) => void;
    handleKeyDown?: (_e: KeyboardEvent) => void;
    [key: string]: unknown;
}

export class RegistrationPage extends Block<RegistrationPageProps> {
    private isSubmitting = false;
    private router: Router;
    constructor(props: RegistrationPageProps = {}) {
        super({
            ...props,
            errors: {},
            labelEmail: "Почта",
            labelLogin: "Логин",
            labelFirstName: "Имя",
            labelSecondName: "Фамилия",
            labelPhone: "Телефон",
            labelPassword: "Пароль",
            labelConfirmPassword: "Пароль (еще раз)",
            idEmail: "email",
            idLogin: "login",
            idFirstName: "first_name",
            idSecondName: "second_name",
            idPhone: "phone",
            idPassword: "password",
            idConfirmPassword: "confirmPassword",

            handleSubmit: async (form: HTMLFormElement) => {
                if (this.isSubmitting) return;
                this.isSubmitting = true;

                try {
                    const formData = new FormData(form);
                    const data = Object.fromEntries(formData.entries()) as ISignUpData;
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

                    const firstNameValue = formData.get('first_name') as string;
                    if (!validationRules.name(firstNameValue)) {
                        errors.first_name = 'Неверное Имя';
                        isValid = false;
                    }

                    const secondNameValue = formData.get('second_name') as string;
                    if (!validationRules.name(secondNameValue)) {
                        errors.second_name = 'Неверная Фамилия';
                        isValid = false;
                    }

                    const phoneValue = formData.get('phone') as string;
                    if (!validationRules.phone(phoneValue)) {
                        errors.phone = 'Неверный телефон';
                        isValid = false;
                    }

                    const passwordValue = formData.get('password') as string;
                    if (!validationRules.password(passwordValue)) {
                        errors.password = 'Неверный пароль';
                        isValid = false;
                    }

                    const confirmPasswordValue = formData.get('confirmPassword') as string;
                    if (!validationRules.password(confirmPasswordValue)) {
                        errors.confirmPassword = 'Пароли не совпадают';
                        isValid = false;
                    }

                    this.setProps({ errors });

                    if (isValid) {
                        await authController.signUp({
                            first_name: data.first_name,
                            second_name: data.second_name,
                            login: data.login,
                            email: data.email,
                            phone: data.phone,
                            password: data.password
                        });
                        console.log('Данные формы:', data);
                        this.router.go('/messenger');
                    }
                }

                catch (error: any) {
                    console.error('Registration error:', error);
                    this.setProps({ errors: { form: error.reason || 'Ошибка регистрации' } });
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
        this.router = new Router();
    }

    componentDidMount() {
        // Принудительно обновляем компонент после загрузки
        setTimeout(() => {
            this.setProps({
                ...this.props,
                forceUpdate: Math.random() // Произвольное изменение для триггера
            });
        }, 100);
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

        this.children.inputEmail = new Input({
            name: 'email',
            id: 'email',
            type: 'email',
            autocomplete: 'email',
            validateRule: 'email' as ValidationRule,
            placeholder: 'Почта',
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
            autocomplete: 'login',
            validateRule: 'login' as ValidationRule,
            placeholder: 'Логин',
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
            name: 'first_name',
            id: 'first_name',
            type: 'text',
            autocomplete: 'first_name',
            validateRule: 'name' as ValidationRule,
            placeholder: 'Имя',
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
            name: 'second_name',
            id: 'second_name',
            type: 'text',
            autocomplete: 'family_name',
            validateRule: 'name' as ValidationRule,
            placeholder: 'Фамилия',
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

        this.children.inputPhone = new Input({
            name: 'phone',
            id: 'phone',
            type: 'text',
            autocomplete: 'phone',
            validateRule: 'phone' as ValidationRule,
            placeholder: 'Телефон',
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

        this.children.inputPassword = new Input({
            name: 'password',
            id: 'password',
            type: 'password',
            autocomplete: 'new-password',
            validateRule: 'password' as ValidationRule,
            placeholder: 'Пароль',
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

        this.children.inputConfirmPassword = new Input({
            name: 'confirmPassword',
            id: 'confirmPassword',
            type: 'password',
            autocomplete: 'new-password',
            validateRule: 'password' as ValidationRule,
            placeholder: 'Пароль (еще раз)',
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
            name: 'Зарегистрироваться',
            type: 'submit',
            style: 'primary',
            events: {
                submit: (e: Event) => {
                    e.preventDefault(); // Блокируем стандартную отправку формы
                    const form = e.target as HTMLFormElement;

                    if (form.method !== 'POST') { // Проверяем метод формы
                        console.error('Форма должна использовать POST!');
                        return;
                    }
                }
            }
        });

        this.children.link = new Link({
            position: 'center',
            style: 'primary',
            name: 'Войти',
            events: {
                click: (e: Event) => {
                    e.preventDefault();
                    this.router.go('/');
                }
            }
        });
    }

    protected render(): DocumentFragment {
        return this.compile(template, this.props);
    }
}
