import { Block } from '../../core/block';
import template from './profile.hbs?raw';
import { Input } from '../../components/input/input';
import { Link } from '../../components/link/link';

export class ProfilePage extends Block {
    constructor() {
        super();
    }

    init() {
        this.children.inputEmail = new Input({
            label: 'Почта',
            name: 'email',
            id: 'email',
            type: 'email',
            value: 'neagz@yandex.ru',
            placeholder: 'neagz@yandex.ru',
            autocomplete: 'email',
            readonly: true
        });

        this.children.inputLogin = new Input({
            label: 'Логин',
            name: 'login',
            id: 'login',
            type: 'text',
            value: 'neagz',
            placeholder: 'neagz',
            autocomplete: 'login',
            readonly: true
        });

        this.children.inputFirstName = new Input({
            label: 'Имя',
            name: 'first_name',
            id: 'first_name',
            type: 'text',
            value: 'Андрей',
            placeholder: 'Андрей',
            autocomplete: 'first_name',
            readonly: true
        });

        this.children.inputSecondName = new Input({
            label: 'Фамилия',
            name: 'second_name',
            id: 'second_name',
            type: 'text',
            value: 'Быстров',
            placeholder: 'Быстров',
            autocomplete: 'family_name',
            readonly: true
        });

        this.children.inputDisplayName = new Input({
            label: 'Имя в чате',
            name: 'display_name',
            id: 'display_name',
            type: 'text',
            value: 'Андрей Б.',
            placeholder: 'Андрей Б.',
            autocomplete: 'name',
            readonly: true
        });

        this.children.inputPhone = new Input({
            label: 'Телефон',
            name: 'phone',
            id: 'phone',
            type: 'text',
            value: '+7 (999) 668 02 50',
            placeholder: '+7 (999) 668 02 50',
            autocomplete: 'phone',
            readonly: true
        });

        this.children.linkEdit = new Link({
            page: 'profile_edit',
            position: 'left',
            style: 'profile_primary',
            name: 'Изменить данные',
            events: {
                click: () => {
                    // Получаем значения
                    const email = (this.children.inputEmail as Input).getValue();
                    const login = (this.children.inputLogin as Input).getValue();
                    const first_name = (this.children.inputFirstName as Input).getValue();
                    const second_name = (this.children.inputSecondName as Input).getValue();
                    const display_name = (this.children.inputDisplayName as Input).getValue();
                    const phone = (this.children.inputPhone as Input).getValue();

                    console.log('Form data:', {email, login, first_name, second_name, display_name, phone });
                }
            }
        });

        this.children.linkPassword = new Link({
            page: 'profile_password',
            position: 'left',
            style: 'profile_primary',
            name: 'Изменить пароль',
            events: {
                click: () => {
                    // Получаем значения
                    const email = (this.children.inputEmail as Input).getValue();
                    const login = (this.children.inputLogin as Input).getValue();
                    const first_name = (this.children.inputFirstName as Input).getValue();
                    const second_name = (this.children.inputSecondName as Input).getValue();
                    const display_name = (this.children.inputDisplayName as Input).getValue();
                    const phone = (this.children.inputPhone as Input).getValue();

                    console.log('Form data:', {email, login, first_name, second_name, display_name, phone });
                }
            }
        });

        this.children.linkLogout = new Link({
            page: 'nav',
            position: 'left',
            style: 'profile_secondary',
            name: 'Выйти'
        });
    }

    protected render(): DocumentFragment {
        return this.compile(template, this.props);
    }
}
