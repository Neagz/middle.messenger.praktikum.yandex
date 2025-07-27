import { Block } from '../../core/block';
import template from './dots-button.hbs?raw';

interface DotsButtonProps {
    icon: string;
    name: string;
    className?: string;
    type?: 'button' | 'submit' | 'reset';
    onClick?: (_e: Event) => void;
    [key: string]: unknown;
}

export class DotsButton extends Block<DotsButtonProps> {
    constructor(props: DotsButtonProps) {
        super({
            ...props,
            type: props.type || 'button',
            className: props.className || '',
            events: {
                click: (e: Event) => {
                    e.preventDefault();
                    e.stopPropagation();
                    props.onClick?.(e);
                }
            }
        });
    }

    protected render(): DocumentFragment {
        return this.compile(template, this.props);
    }
}
