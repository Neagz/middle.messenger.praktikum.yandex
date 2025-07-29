import { Block } from '../../core/block';
import template from './action-dialog-user.hbs?raw';
import { DotsButton } from '../dots-button/dots-button';

interface ActionDialogUserProps {
    onAddUser?: () => void;
    onRemoveUser?: () => void;
    [key: string]: unknown;
}

export class ActionDialogUser extends Block<ActionDialogUserProps> {
    constructor(props: ActionDialogUserProps = {}) {
        super(props);
    }

    init() {
        this.children.addButton = new DotsButton({
            icon: 'add',
            name: 'Добавить пользователя',
            onClick: () => this.props.onAddUser?.()
        });

        this.children.removeButton = new DotsButton({
            icon: 'remove',
            name: 'Удалить пользователя',
            onClick: () => this.props.onRemoveUser?.()
        });
    }

    protected render(): DocumentFragment {
        return this.compile(template, this.props);
    }
}
