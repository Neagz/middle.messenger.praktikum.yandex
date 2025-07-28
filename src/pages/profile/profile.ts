import { Block } from '../../core/block';
import template from './profile.hbs?raw';
import { Input, Link } from '../../components';
import Router from '../../utils/router';
import { authController } from "../../controllers";
import { store } from "../../core/store";
import { API_V2_RESOURCES } from '../../config';

interface ProfileProps {
    title?: string;
    label?: string;
    id?: string;
    name?: string;
    errors?: Record<string, string>;
    currentAvatar?: string;
}

export class ProfilePage extends Block {
    private router: Router;

    constructor(props: ProfileProps = {}) {
        const user = store.getState().user;
        super({
            ...props,
            user: {
                ...user,
                display_name: user?.display_name || `${user?.first_name} ${user?.second_name}`.trim()
            },
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
            currentAvatar: user?.avatar || ''
        });

        this.router = new Router();
        store.on('changed', () => {
            const newUser = store.getState().user;
            if (newUser?.avatar !== this.props.currentAvatar) {
                this.setProps({ currentAvatar: newUser?.avatar });
                this.updateAvatarDisplay();
            }
        });
    }

    private updateAvatarDisplay() {
        const user = store.getState().user;
        const avatarElement = this._element?.querySelector('.avatar-input__default-icon') as HTMLElement;

        if (!avatarElement) return;

        // Очищаем стили и классы
        avatarElement.className = '';
        avatarElement.removeAttribute('style');

        // Добавляем базовый класс
        avatarElement.classList.add('avatar-input__default-icon');

        if (user?.avatar) {
            avatarElement.style.backgroundImage = `url("${API_V2_RESOURCES}${user.avatar}")`;
            avatarElement.style.backgroundSize = 'cover';
            avatarElement.style.borderRadius = '50%';
        } else {
            avatarElement.classList.add('avatar-default');
        }
    }

    componentDidMount() {
        this.updateAvatarDisplay();
    }

    init() {
        const user = store.getState().user;

        this.children.inputEmail = new Input({
            name: 'email',
            id: 'email',
            type: 'email',
            value: user?.email || '',
            placeholder: user?.email || 'Почта',
            autocomplete: 'email',
            readonly: true
        });

        this.children.inputLogin = new Input({
            name: 'login',
            id: 'login',
            type: 'text',
            value: user?.login || '',
            placeholder: user?.login || 'Логин',
            autocomplete: 'login',
            readonly: true
        });

        this.children.inputFirstName = new Input({
            name: 'firstName',
            id: 'firstName',
            type: 'text',
            value: user?.first_name || '',
            placeholder: user?.first_name || 'Имя',
            autocomplete: 'first_name',
            readonly: true
        });

        this.children.inputSecondName = new Input({
            name: 'secondName',
            id: 'secondName',
            type: 'text',
            value: user?.second_name || '',
            placeholder: user?.second_name || 'Фамилия',
            autocomplete: 'family_name',
            readonly: true
        });

        this.children.inputDisplayName = new Input({
            name: 'displayName',
            id: 'displayName',
            type: 'text',
            value: user?.display_name || '',
            placeholder: user?.display_name || 'Имя в чате',
            autocomplete: 'name',
            readonly: true
        });

        this.children.inputPhone = new Input({
            name: 'phone',
            id: 'phone',
            type: 'text',
            value: user?.phone || '',
            placeholder: user?.phone || 'Телефон',
            autocomplete: 'phone',
            readonly: true
        });

        this.children.linkEdit = new Link({
            position: 'left',
            type: 'submit',
            style: 'profile_primary',
            name: 'Изменить данные',
            events: {
                click: (e: Event) => {
                    e.preventDefault();
                    this.router.go('/settings-edit');
                }
            }
        });

        this.children.linkPassword = new Link({
            position: 'left',
            style: 'profile_primary',
            name: 'Изменить пароль',
            events: {
                click: (e: Event) => {
                    e.preventDefault();
                    this.router.go('/settings-password');
                }
            }
        });

        this.children.linkLogout = new Link({
            position: 'left',
            style: 'profile_secondary',
            name: 'Выйти',
            events: {
                click: (e: Event) => {
                    e.preventDefault();
                    authController.logout();
                }
            }
        });
    }

    protected render(): DocumentFragment {
        return this.compile(template, this.props);
    }
}
