import { Block } from '../../core/block';
import template from './dialog.hbs?raw';

interface DialogProps {
    type: 'incoming' | 'outgoing';
    content: string;
    time: string;
    Image?: boolean;
    Multiple?: boolean;
    Outgoing?: boolean;
    contentTwo?: string;
    [key: string]: unknown;
}

export class Dialog extends Block<DialogProps> {
    constructor(props: DialogProps) {
        super(props);
    }

    protected render(): DocumentFragment {
        return this.compile(template, this.props);
    }
}
