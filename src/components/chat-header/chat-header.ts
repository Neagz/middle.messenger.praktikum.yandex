import { Block } from '../../core/block';
import template from './chat-header.hbs?raw';

interface ChatHeaderProps {
    avatar: string;
    username: string;
    showActionDialogUser?: boolean;
    events?: {
        click: (e: Event) => void;
    };
}

export class ChatHeader extends Block {
    constructor(props: ChatHeaderProps) {
        super(props);
    }

    protected render(): DocumentFragment {
        return this.compile(template, {
            ...this.props,
            showActionDialogUser: this.props.showActionDialogUser
        });
    }
}