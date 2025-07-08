import { Block } from '../../core/block';
import template from './action-dialog-message.hbs?raw';

export class ActionDialogMessage extends Block {
    constructor() {
        super();
    }

    protected render(): DocumentFragment {
        return this.compile(template, {});
    }
}
