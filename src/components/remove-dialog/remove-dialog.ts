import { Block } from '../../core/block';
import template from './remove-dialog.hbs?raw';
import { Button } from '../button/button';
import { Input } from '../input/input';

interface RemoveDialogProps {
    title: string;
}

export class RemoveDialog extends Block {
    constructor(props: RemoveDialogProps) {
        super({
            ...props
        });
    }

    init() {
        this.children.input = new Input({
            name: "login",
            id: "login",
            type: "text",
            modifier: "remove-dialog",
            autocomplete: 'off',
            placeholder: "neagz"
        });

        this.children.button = new Button({
            name: 'Удалить',
            type: 'submit',
            style: 'primary',
            events: {
                click: (e: Event) => {
                    e.preventDefault();
                    console.log("Кнопка 'Удалить' нажата!");
                }
            }
        });
    }

    protected render(): DocumentFragment {
        return this.compile(template, this.props);
    }
}
