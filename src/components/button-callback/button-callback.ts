import { Block } from '../../core/block';
import template from './button-callback.hbs?raw';

interface ButtonCallbackProps {
    name?: string;
    title?: string;
    type?: 'button' | 'submit' | 'reset';
    class: string;
    content?: string;
    events?: {
        click?: (_e: Event) => void;
    };
}

export class ButtonCallback extends Block {
    constructor(props: ButtonCallbackProps) {
        super({
            ...props,
            events: {
                click: (e: Event) => {
                    e.preventDefault();
                    e.stopPropagation();
                    props.events?.click?.(e);
                },
            },
        });
    }

    protected render(): DocumentFragment {
        return this.compile(template, this.props);
    }
}
