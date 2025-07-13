import { Block } from '../../core/block';
import template from './500.hbs?raw';
import { Link } from '../../components';
import Router from '../../utils/router';

export class Page500 extends Block {
    private router: Router;

    constructor() {
        super();
        this.router = new Router();
    }

    componentDidMount() {
        // Принудительно обновляем компонент после загрузки
        setTimeout(() => {
            this.setProps({
                ...this.props,
                forceUpdate: Math.random() // Произвольное изменение для триггера
            });
        }, 100);
    }

    init() {
        this.children.link = new Link({
            position: 'center',
            style: 'primary',
            name: 'Назад к чатам',
            events: {
                click: (e: Event) => {
                    e.preventDefault();
                    this.router.go('/messenger');
                }
            }
        });
    }

    protected render(): DocumentFragment {
        return this.compile(template, this.props);
    }
}
