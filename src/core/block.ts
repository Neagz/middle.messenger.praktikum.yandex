import EventBus, { EventCallback } from './eventBus';
import Handlebars from 'handlebars';

interface BlockProps {
    [key: string]: any;
}

export default class Block {
    static EVENTS = {
        INIT: 'init',
        FLOW_CDM: 'flow:component-did-mount',
        FLOW_CDU: 'flow:component-did-update',
        FLOW_RENDER: 'flow:render',
    };

    protected _element: HTMLElement | null = null;
    protected _id: number = Math.floor(100000 + Math.random() * 900000);
    protected props: BlockProps;
    protected children: Record<string, Block>;
    protected lists: Record<string, any[]>;
    protected eventBus: () => EventBus;

    constructor(propsWithChildren: BlockProps = {}) {
        const eventBus = new EventBus();
        const { props, children, lists } = this._getChildrenPropsAndProps(propsWithChildren);

        this.props = this._makePropsProxy({
            tagName: 'div', // Значение по умолчанию
            ...props
        });

        this.children = children;
        this.lists = this._makePropsProxy({ ...lists });
        this.eventBus = () => eventBus;
        this._registerEvents(eventBus);
        eventBus.emit(Block.EVENTS.INIT);
    }

    protected init(): void {
        // Создаем элемент с указанным tagName
        this._element = document.createElement(this.props.tagName);
        this.eventBus().emit(Block.EVENTS.FLOW_RENDER);
    }

    private _render(): void {
        if (!this._element) return;

        const propsAndStubs = { ...this.props };
        const tmpId = Math.floor(100000 + Math.random() * 900000);

        // Подготовка children
        Object.entries(this.children).forEach(([key, child]) => {
            propsAndStubs[key] = `<div data-id="${child._id}"></div>`;
        });

        // Подготовка lists
        Object.entries(this.lists).forEach(([key]) => {
            propsAndStubs[key] = `<div data-id="__l_${tmpId}"></div>`;
        });

        // Рендеринг содержимого
        this._element.innerHTML = Handlebars.compile(this.render())(propsAndStubs);

        // Вставка children
        Object.values(this.children).forEach(child => {
            const stub = this._element?.querySelector(`[data-id="${child._id}"]`);
            if (stub) {
                stub.replaceWith(child.getContent());
            }
        });

        // Вставка lists
        Object.entries(this.lists).forEach(([, items]) => {
            const listCont = document.createElement('template');
            items.forEach(item => {
                if (item instanceof Block) {
                    listCont.content.append(item.getContent());
                } else {
                    listCont.content.append(`${item}`);
                }
            });

            const stub = this._element?.querySelector(`[data-id="__l_${tmpId}"]`);
            if (stub) {
                stub.replaceWith(listCont.content);
            }
        });

        this._addEvents();
        this.addAttributes();
    }

    // Все остальные методы остаются без изменений:
    private _addEvents(): void {
        const { events = {} } = this.props;
        Object.keys(events).forEach(eventName => {
            if (this._element) {
                this._element.addEventListener(eventName, events[eventName]);
            }
        });
    }

    private _registerEvents(eventBus: EventBus): void {
        eventBus.on(Block.EVENTS.INIT, this.init.bind(this) as EventCallback);
        eventBus.on(Block.EVENTS.FLOW_CDM, this._componentDidMount.bind(this) as EventCallback);
        eventBus.on(Block.EVENTS.FLOW_CDU, this._componentDidUpdate.bind(this) as EventCallback);
        eventBus.on(Block.EVENTS.FLOW_RENDER, this._render.bind(this) as EventCallback);
    }

    private _componentDidMount(): void {
        this.componentDidMount();
        Object.values(this.children).forEach(child => {
            child.dispatchComponentDidMount();
        });
    }

    protected componentDidMount(): void {}

    public dispatchComponentDidMount(): void {
        this.eventBus().emit(Block.EVENTS.FLOW_CDM);
    }

    private _componentDidUpdate(oldProps: BlockProps, newProps: BlockProps): void {
        const response = this.componentDidUpdate(oldProps, newProps);
        if (!response) {
            return;
        }
        this._render();
    }

    protected componentDidUpdate(oldProps: BlockProps, newProps: BlockProps): boolean {
        console.log(oldProps, newProps);
        return true;
    }

    private _getChildrenPropsAndProps(propsAndChildren: BlockProps): {
        children: Record<string, Block>,
        props: BlockProps,
        lists: Record<string, any[]>
    } {
        const children: Record<string, Block> = {};
        const props: BlockProps = {};
        const lists: Record<string, any[]> = {};

        Object.entries(propsAndChildren).forEach(([key, value]) => {
            if (value instanceof Block) {
                children[key] = value;
            } else if (Array.isArray(value)) {
                lists[key] = value;
            } else {
                props[key] = value;
            }
        });

        return { children, props, lists };
    }

    protected addAttributes(): void {
        const { attr = {} } = this.props;

        Object.entries(attr).forEach(([key, value]) => {
            if (this._element) {
                this._element.setAttribute(key, value as string);
            }
        });
    }

    public setProps = (nextProps: BlockProps): void => {
        if (!nextProps) {
            return;
        }
        Object.assign(this.props, nextProps);
    };

    public setLists = (nextList: Record<string, any[]>): void => {
        if (!nextList) {
            return;
        }
        Object.assign(this.lists, nextList);
    };

    get element(): HTMLElement | null {
        return this._element;
    }

    protected render(): string {
        return '';
    }

    public getContent(): HTMLElement {
        if (!this._element) {
            throw new Error(`Элемент не создан! Проверьте:
        1. Вызов super() в конструкторе
        2. Метод render() возвращает валидный HTML
        3. События инициализации в Block`);
        }
        return this._element;
    }

    private _makePropsProxy(props: any): any {
        const self = this;
        return new Proxy(props, {
            get(target: any, prop: string) {
                const value = target[prop];
                return typeof value === 'function' ? value.bind(target) : value;
            },
            set(target: any, prop: string, value: any) {
                const oldTarget = { ...target };
                target[prop] = value;
                self.eventBus().emit(Block.EVENTS.FLOW_CDU, oldTarget, target);
                return true;
            },
            deleteProperty() {
                throw new Error('No access');
            },
        });
    }

    public show(): void {
        const content = this.getContent();
        content.style.display = 'block';
    }

    public hide(): void {
        const content = this.getContent();
        content.style.display = 'none';
    }
}
