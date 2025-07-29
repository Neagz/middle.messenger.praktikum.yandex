import { Block } from "../core/block";
import { isEqual, render } from './helpers';

// Класс для управления отдельным маршрутом
export default class Route<P extends Record<string, unknown> = Record<string, unknown>> {
    private _pathname: string; // Путь маршрута
    private _blockClass: new (_props: P) => Block<P>; // Класс компонента для этого маршрута
    private _block: Block<P> | null = null; // Экземпляр компонента
    private _props: { rootQuery: string; context?: P }; // Свойства для рендеринга

    constructor(
        pathname: string,
        view: new (_props: P) => Block<P>,
        props: { rootQuery: string; context?: P }
    ) {
        this._pathname = pathname;
        this._blockClass = view;
        this._props = props;
    }

    // Переход на маршрут
    navigate(pathname: string) {
        if (this.match(pathname)) {
            this._pathname = pathname;
            this.render();
        }
    }

    // Уничтожение компонента маршрута
    leave() {
        if (this._block) {
            this._block.destroy();
            this._block = null;
        }
    }

    // Проверка соответствия маршрута
    match(pathname: string) {
        return isEqual(pathname, this._pathname);
    }

    // Рендер компонента маршрута
    render() {
        this.leave(); // Очистка предыдущего компонента

        // Создаем новый экземпляр компонента
        this._block = new this._blockClass(this._props.context || {} as P);

        const root = document.querySelector(this._props.rootQuery);
        if (!root) {
            throw new Error(`Root element not found: ${this._props.rootQuery}`);
        }

        root.innerHTML = ''; // Очищаем контейнер
        render(this._props.rootQuery, this._block); // Рендерим компонент
        this._block.dispatchComponentDidMount(); // Инициализируем компонент
    }
}
