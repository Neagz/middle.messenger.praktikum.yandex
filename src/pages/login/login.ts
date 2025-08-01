import { Block, BaseBlockProps } from '../../core/block';
import template from './login.hbs?raw';
import { Input } from '../../components';
import { Button } from '../../components';
import { Link } from '../../components';
import { ValidationRule, validationRules } from '../../utils/validation';
import Router from '../../utils/router';
import { ISignInData } from "../../utils/types";
import { authController } from "../../controllers";

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
    private router: Router;

    constructor(props: LoginPageProps = {}) {
        super({
            ...props,
            errors: {},
            labelLogin: "Логин",
            idLogin: "login",
            labelPassword: "Пароль",
            idPassword: "password",
            handleSubmit: async (form: HTMLFormElement) => {
                if (this.isSubmitting) return;
                this.isSubmitting = true;

                try {
                    const formData = new FormData(form);
                    const data = {
                        login: formData.get('login') as string,
                        password: formData.get('password') as string
                    };

                    const errors: Record<string, string> = {};
                    let isValid = true;

                    if (!validationRules.login(data.login)) {
                        errors.login = 'Неверный логин';
                        isValid = false;
                    }

                    if (!validationRules.password(data.password)) {
                        errors.password = 'Неверный пароль';
                        isValid = false;
                    }

                    this.setProps({ errors });

                    if (isValid) {
                        console.log('Данные формы:', data);
                        await this.signIn(data);
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
            },
        });

        this.router = new Router();
    }

    async signIn(data: ISignInData) {
        try {
            await authController.signIn(data);
            // Переход будет выполнен в authController
        } catch (e) {
            console.error('SignIn error:', e);
            this.setProps({ errors: { form: 'Неверный логин или пароль' } });
        }
    }

    componentDidMount() {
        // Принудительно обновляем компонент после загрузки
        this.setProps({
            ...this.props,
            forceUpdate: Math.random()
        });
    }

    handleBlur = (fieldName: string, value: string, rule: ValidationRule | undefined, errorText: string) => {
        if (!rule || !this._element) return; // Проверяем, что элемент еще существует

        const isValid = validationRules[rule](value);
        const error = isValid ? '' : errorText;

        queueMicrotask(() => {
            this.setProps({ errors: { ...this.props.errors, [fieldName]: error } });
        });
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

        this.children.button = new Button({
            name: 'Авторизоваться',
            type: 'submit',
            style: 'primary'
        });

        this.children.link = new Link({
            position: 'center',
            style: 'primary',
            name: 'Нет аккаунта?',
            events: {
                click: (e: Event) => {
                    e.preventDefault();
                    this.router.go('/sign-up');
                }
            }
        });
    }

    protected render(): DocumentFragment {
        return this.compile(template, {
            ...this.props,
            errors: this.props.errors || {}
        });
    }
}
