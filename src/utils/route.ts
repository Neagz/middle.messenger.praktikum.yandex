import { Block } from "../core/block";
import { isEqual, render } from './helpers';

export default class Route {
    private _pathname: string;
    private _blockClass: new (props: any) => Block;
    private _block: Block | null = null;
    private _props: { rootQuery: string; context?: Record<string, unknown> };

    constructor(
        pathname: string,
        view: new (props: any) => Block,
        props: { rootQuery: string; context?: Record<string, unknown> }
    ) {
        this._pathname = pathname;
        this._blockClass = view;
        this._props = props;
    }

    navigate(pathname: string) {
        if (this.match(pathname)) {
            this._pathname = pathname;
            this.render();
        }
    }

    leave() {
        if (this._block) {
            this._block.destroy(); // Полностью уничтожаем старый блок
            this._block = null;
        }
    }

    match(pathname: string) {
        return isEqual(pathname, this._pathname);
    }

    render() {
        // Полностью очищаем предыдущий блок
        this.leave();

        // Создаем новый экземпляр блока
        this._block = new this._blockClass(this._props.context || {});

        // Получаем root-элемент
        const root = document.querySelector(this._props.rootQuery);
        if (!root) {
            throw new Error(`Root element not found: ${this._props.rootQuery}`);
        }

        // Полностью очищаем root перед рендером
        root.innerHTML = '';

        // Рендерим новый блок
        render(this._props.rootQuery, this._block);
        this._block.dispatchComponentDidMount();
    }
}
