import { Block } from '../../core/block';
import template from './dots-button.hbs?raw';

interface DotsButtonProps {
    icon: string;
    name: string;
    className?: string;
    type?: 'button' | 'submit' | 'reset';
    events?: {
        click: (e: Event) => void;
    };
}

export class DotsButton extends Block {
    constructor(props: DotsButtonProps) {
        super({
            ...props,
            type: props.type || 'button',
            className: props.className || ''
        });
    }

    protected render(): DocumentFragment {
        return this.compile(template, this.props);
    }
}
