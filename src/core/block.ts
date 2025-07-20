import EventBus from './eventBus';
import Handlebars from "handlebars";
import {avatarManager} from "../services/avatar-manager";

// Базовый тип для событий
type BlockEvents = { [key: string]: ((_e: Event) => void) | undefined };

// Базовый тип для пропсов
export type BaseBlockProps = {
    events?: BlockEvents;
    children?: BlockChildren;
    [key: string]: unknown;
};

// Тип для дочерних компонентов
type BlockChildren = Record<string, Block | Block[]>;

export class Block<P extends Record<string, unknown> = Record<string, unknown>> {
    static EVENTS = {
        INIT: "init",
        FLOW_CDM: "flow:component-did-mount",
        FLOW_CDU: "flow:component-did-update",
        FLOW_RENDER: "flow:render"
    } as const;

    protected _element: HTMLElement | null = null;
    props: P & BaseBlockProps; // Объединение специфичных и базовых пропсов
    private _eventBus: EventBus;
    public children: BlockChildren = {};

    constructor(props: P & BaseBlockProps = {} as P & BaseBlockProps) {
        this._eventBus = new EventBus();
        this.props = this._makePropsProxy({ ...props }) as P & BaseBlockProps;
        this._registerEvents(this._eventBus);
        this._eventBus.emit(Block.EVENTS.INIT);
    }

    hide() {
        if (this._element) {
            this._element.style.display = 'none';
        }
    }

    show() {
        if (this._element) {
            this._element.style.removeProperty('display');
        }
    }

    private _registerEvents(eventBus: EventBus) {
        eventBus.on(Block.EVENTS.INIT, this._init.bind(this));
        eventBus.on(Block.EVENTS.FLOW_CDM, this._componentDidMount.bind(this));
        eventBus.on(Block.EVENTS.FLOW_CDU, this._componentDidUpdate.bind(this));
        eventBus.on(Block.EVENTS.FLOW_RENDER, this._render.bind(this));
    }

    private _init() {
        this.init();
        this._eventBus.emit(Block.EVENTS.FLOW_RENDER);
    }

    protected init() {}

    private _componentDidMount() {
        this.componentDidMount();
    }

    protected componentDidMount() {}

    public dispatchComponentDidMount() {
        this._eventBus.emit(Block.EVENTS.FLOW_CDM);
    }

    private _componentDidUpdate() {
        if (this.componentDidUpdate()) {
            this._eventBus.emit(Block.EVENTS.FLOW_RENDER);
        }
    }

    protected componentDidUpdate() {
        return true;
    }

    setProps = (nextProps: Partial<P & BaseBlockProps>) => {
        Object.assign(this.props, nextProps);
    };

    private _render() {
        // Удаляем обработчики со старого элемента
        this._removeEvents();

        // Сохраняем состояние компонентов
        const states = Object.entries(this.children).map(([key, child]) => ({
            key,
            state: (child as any).saveState?.()
        }));

        const fragment = this.render();
        const newElement = fragment.firstElementChild as HTMLElement;

        const activeElement = document.activeElement as HTMLElement;
        const activeElementId = activeElement?.id;

        if (this._element && this._element.parentNode) {
            this._element.replaceWith(newElement);
        }

        this._element = newElement;

        // Восстанавливаем состояние
        states.forEach(({ key, state }) => {
            (this.children[key] as any)?.restoreState?.(state);
        });

        this._addEvents();
        avatarManager.clear();

        if (activeElementId) {
            const newActiveElement = this._element.querySelector(`#${activeElementId}`);
            if (newActiveElement) {
                (newActiveElement as HTMLElement).focus();
            }
        }
    }

    protected render(): DocumentFragment {
        return new DocumentFragment();
    }

    protected compile(template: string, context: Record<string, unknown>): DocumentFragment {
        const fragment = document.createElement('template');
        const componentContext = { ...context };

        Object.entries(this.children).forEach(([key, child]) => {
            if (child instanceof Block) {
                componentContext[key] = `<div data-id="${key}"></div>`;
            }
        });

        fragment.innerHTML = Handlebars.compile(template)(componentContext);

        Object.entries(this.children).forEach(([key, child]) => {
            const stub = fragment.content.querySelector(`[data-id="${key}"]`);
            if (stub && child instanceof Block) {
                stub.replaceWith(child.getContent()!);
            }
        });

        return fragment.content;
    }

    // Удаляем всех обработчиков событий
    private _removeEvents() {
        const { events = {} } = this.props;
        if (this._element) {
            Object.entries(events).forEach(([event, listener]) => {
                if (typeof listener === 'function') {
                    this._element!.removeEventListener(event, listener);
                }
            });
        }
    }
    private _addEvents() {
        const { events = {} } = this.props;
        // Добавляем обработчики с проверкой
        Object.entries(events).forEach(([event, listener]) => {
            if (typeof listener === 'function') {
                this._element?.addEventListener(event, listener);
            }
        });
    }

    private _makePropsProxy(props: P & BaseBlockProps) {
        return new Proxy(props as Record<string, unknown>, {
            set: (target, prop: string, value) => {
                if (target[prop] !== value) {
                    target[prop] = value;
                    this._eventBus.emit(Block.EVENTS.FLOW_CDU);
                }
                return true;
            },
            deleteProperty: () => { throw new Error('Нет доступа'); }
        }) as P & BaseBlockProps;
    }

    getContent() {
        return this._element || document.createElement('div');
    }

    // Метод для полной очистки
    public destroy() {
        this._removeEvents();
        if (this._element) {
            this._element.remove();
            this._element = null;
        }

        // Рекурсивно уничтожаем дочерние компоненты
        Object.values(this.children).forEach(child => {
            if (Array.isArray(child)) {
                child.forEach(c => c.destroy());
            } else {
                child.destroy();
            }
        });
    }
}
