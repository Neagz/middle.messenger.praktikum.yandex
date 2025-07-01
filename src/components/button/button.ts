import { Block } from '../../core/block';
import template from './button.hbs?raw';

interface ButtonProps {
    name: string;
    type?: string;
    page?: string;
    style: string;
    events?: {
        click: (e: Event) => void;
    };
}

export class Button extends Block {
    constructor(props: ButtonProps) {
        super({
            ...props,
            events: {
                click: (e: Event) => {
                    // Для кнопок типа submit не выполняем переход
                    if (props.type !== 'submit' && props.page) {
                        window.navigate(props.page);
                        e.preventDefault();
                    }
                    props.events?.click?.(e);
                }
            }
        });
    }

    protected render(): DocumentFragment {
        return this.compile(template, this.props);
    }
}
