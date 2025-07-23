import { Block } from '../../core/block';
import template from './contact-item.hbs?raw';

interface ContactItemProps {
    avatar: string;
    name: string;
    preview: string;
    timestamp: string;
    unread?: string;
    fromMe?: boolean;
    active?: boolean;
    onContactClick?: () => void;
    [key: string]: unknown;
}

export class ContactItem extends Block {
    constructor(props: ContactItemProps) {
        super({
            ...props,
            events: {
                click: (e: Event) => {
                    console.log('ContactItem click handler executed');
                    e.preventDefault();
                    e.stopPropagation();
                    props.onContactClick?.(); // Вызываем колбэк
                }
            }
        });

        // Явная привязка контекста
        this.handleClick = this.handleClick.bind(this);
    }

    private handleClick(e: Event) {
        const props = this.props as ContactItemProps;
        console.log('Bound click handler called');
        e.preventDefault();
        e.stopPropagation();
        props.onContactClick?.();
    }

    protected render(): DocumentFragment {
        return this.compile(template, this.props);
    }
}
