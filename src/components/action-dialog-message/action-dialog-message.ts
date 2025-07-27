import { Block } from '../../core/block';
import template from './action-dialog-message.hbs?raw';

interface ActionDialogMessageProps {
    onSelectPhoto?: () => void;
    onSelectFile?: () => void;
    onSelectLocation?: () => void;
    [key: string]: unknown;
}

export class ActionDialogMessage extends Block<ActionDialogMessageProps> {
    constructor(props: ActionDialogMessageProps = {}) {
        super(props);
    }

    protected render(): DocumentFragment {
        return this.compile(template, this.props);
    }
}
