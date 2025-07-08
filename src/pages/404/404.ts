import { Block } from '../../core/block';
import template from './404.hbs?raw';
import { Link } from '../../components/link/link';

export class Page404 extends Block {
    constructor() {
        super();
    }

    init() {
        this.children.link = new Link({
            page: 'nav',
            position: 'center',
            style: 'primary',
            name: 'Назад к чатам'
        });
    }

    protected render(): DocumentFragment {
        return this.compile(template, this.props);
    }
}
