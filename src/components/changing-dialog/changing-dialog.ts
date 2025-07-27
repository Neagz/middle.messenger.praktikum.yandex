import { Block } from '../../core/block';
import template from './changing-dialog.hbs?raw';
import { Button } from '../button/button';
import { Input } from '../input/input';

interface ChangingDialogProps {
    dialogTitle: string;
    buttonText: string;
    onClose: () => void;
    onSubmit: (_login: string) => Promise<void>;
    [key: string]: unknown;
}

export class ChangingDialog extends Block<ChangingDialogProps> {
    constructor(props: ChangingDialogProps) {
        super({
            ...props,
            events: {
                click: (e: Event) => {
                    if ((e.target as HTMLElement).classList.contains('dialog-container')) {
                        props.onClose();
                    }
                }
            }
        });
    }

    init() {
        this.children.input = new Input({
            name: "login",
            id: "login",
            type: "text",
            modifier: "changing-dialog",
            autocomplete: 'off',
            placeholder: "Введите логин"
        });

        this.children.button = new Button({
            name: this.props.buttonText,
            type: 'submit',
            style: 'primary',
            events: {
                click: async (e: Event) => {
                    e.preventDefault();
                    const input = this.children.input as Input;
                    const login = input.getValue();

                    if (login && this.props.onSubmit) {
                        try {
                            await this.props.onSubmit(login);
                            input.setValue("");
                            this.props.onClose();
                        } catch (e) {
                            console.error('Error:', e);
                        }
                    }
                }
            }
        });
    }
    protected render(): DocumentFragment {
        (this.children.button as Button).setProps({
            name: this.props.buttonText
        });

        return this.compile(template, {
            ...this.props,
            title: this.props.dialogTitle
        });
    }
}
