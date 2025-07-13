import { Block } from '../../core/block';
import template from './profile.hbs?raw';
import { Input, Link  } from '../../components';
import Router from '../../utils/router';

interface ProfileProps {
    title?: string;
    label?: string;
    id?: string;
    name?: string;
    errors?: Record<string, string>;
}
export class ProfilePage extends Block {
    private router: Router;
    constructor(props: ProfileProps = {}) {
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

    init() {

        this.children.inputEmail = new Input({
            name: 'email',
            id: 'email',
            type: 'email',
            value: 'neagz@yandex.ru',
            placeholder: 'neagz@yandex.ru',
            autocomplete: 'email',
            readonly: true
        });

        this.children.inputLogin = new Input({
            name: 'login',
            id: 'login',
            type: 'text',
            value: 'neagz',
            placeholder: 'neagz',
            autocomplete: 'login',
            readonly: true
        });

        this.children.inputFirstName = new Input({
            name: 'firstName',
            id: 'firstName',
            type: 'text',
            value: 'Андрей',
            placeholder: 'Андрей',
            autocomplete: 'first_name',
            readonly: true
        });

        this.children.inputSecondName = new Input({
            name: 'secondName',
            id: 'secondName',
            type: 'text',
            value: 'Быстров',
            placeholder: 'Быстров',
            autocomplete: 'family_name',
            readonly: true
        });

        this.children.inputDisplayName = new Input({
            name: 'displayName',
            id: 'displayName',
            type: 'text',
            value: 'Андрей Б.',
            placeholder: 'Андрей Б.',
            autocomplete: 'name',
            readonly: true
        });

        this.children.inputPhone = new Input({
            name: 'phone',
            id: 'phone',
            type: 'text',
            value: '+7 (999) 668 02 50',
            placeholder: '+7 (999) 668 02 50',
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
                    const form = document.getElementById('profile-form') as HTMLFormElement;

                    if (form) {
                        const formData = new FormData(form);
                        const data = Object.fromEntries(formData.entries());
                        console.log('Данные формы:', data);
                    }
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
                    this.router.go('/');
                }
            }
        });
    }

    protected render(): DocumentFragment {
        return this.compile(template, this.props);
    }
}
