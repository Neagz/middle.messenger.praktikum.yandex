import { Block } from '../../core/block';
import template from './registration.hbs?raw';
import { Input } from '../../components/input/input';
import { Button } from '../../components/button/button';
import { Link } from '../../components/link/link';
import {ValidationRule, validationRules} from '../../utils/validation';

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
            idFirstName: "firstName",
            idSecondName: "secondName",
            idPhone: "phone",
            idPassword: "password",
            idConfirmPassword: "confirmPassword",

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
                        console.log('Данные формы:', data);
                        window.navigate('list');
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

        this.children.inputEmail = new Input({
            name: 'email',
            id: 'email',
            type: 'email',
            autocomplete: 'email',
            validateRule: 'email' as ValidationRule,
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
            autocomplete: 'first_name',
            validateRule: 'name' as ValidationRule,
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
            autocomplete: 'family_name',
            validateRule: 'name' as ValidationRule,
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
