import { Block, BaseBlockProps } from '../../core/block';
import template from './login.hbs?raw';
import { Input } from '../../components/input/input';
import { Button } from '../../components/button/button';
import { Link } from '../../components/link/link';
import { ValidationRule, validationRules } from '../../utils/validation';

// Расширяем базовые пропсы специфичными для страницы
interface LoginPageProps extends BaseBlockProps {
    title?: string;
    errors?: Record<string, string>;
    labelLogin?: string;
    labelPassword?: string;
    idLogin?: string;
    idPassword?: string;
    handleSubmit?: (_form: HTMLFormElement) => void;
    handleKeyDown?: (_e: KeyboardEvent) => void;
}

export class LoginPage extends Block<LoginPageProps> {
    private isSubmitting = false;

    constructor(props: LoginPageProps = {}) {
        super({
            ...props,
            errors: {},
            labelLogin: "Логин",
            idLogin: "login",
            labelPassword: "Пароль",
            idPassword: "password",
            handleSubmit: (form: HTMLFormElement) => {
                if (this.isSubmitting) return;
                this.isSubmitting = true;

                try {
                    const formData = new FormData(form);
                    const data = Object.fromEntries(formData.entries());
                    const errors: Record<string, string> = {};
                    let isValid = true;

                    const loginValue = formData.get('login') as string;
                    if (!validationRules.login(loginValue)) {
                        errors.login = 'Неверный логин';
                        isValid = false;
                    }

                    const passwordValue = formData.get('password') as string;
                    if (!validationRules.password(passwordValue)) {
                        errors.password = 'Неверный пароль';
                        isValid = false;
                    }

                    this.setProps({ errors });

                    if (isValid) {
                        console.log('Данные формы:', data);
                        window.navigate('list');
                    }
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
        // Используем существующую функцию handleKeyDown
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

        this.children.button = new Button({
            name: 'Авторизоваться',
            type: 'submit',
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
        return this.compile(template, {
            ...this.props,
            errors: this.props.errors || {}
        });
    }
}
