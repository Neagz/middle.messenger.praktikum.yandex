import { Block } from '../../core/block';
import template from './action-dialog-user.hbs?raw';

export class ActionDialogUser extends Block {
    constructor() {
        super();
    }

    protected render(): DocumentFragment {
        return this.compile(template, {});
    }
}
