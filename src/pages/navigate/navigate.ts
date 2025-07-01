import { Block } from '../../core/block';
import template from './navigate.hbs?raw';

export class NavigatePage extends Block {
    constructor() {
        super();
    }

    init() {
    }

    protected render(): DocumentFragment {
        return this.compile(template, this.props);
    }
}
