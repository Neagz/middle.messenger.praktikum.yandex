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
    events?: {
        click: (e: Event) => void;
    };
}

export class ContactItem extends Block {
    constructor(props: ContactItemProps) {
        super(props);
    }

    protected render(): DocumentFragment {
        return this.compile(template, this.props);
    }
}
