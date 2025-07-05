import EventBus from './eventBus';
import Handlebars from "handlebars";

// Типы для событий и свойств
type BlockEvents = { [key: string]: (_e: Event) => void };
type BlockProps = { events?: BlockEvents; [key: string]: any };
type BlockChildren = Record<string, Block | Block[]>; // Тип для дочерних компонентов

export class Block {
    // События жизненного цикла
    static EVENTS = {
        INIT: "init",
        FLOW_CDM: "flow:component-did-mount",
        FLOW_CDU: "flow:component-did-update",
        FLOW_RENDER: "flow:render"
    };

    protected _element: HTMLElement | null = null;
    props: BlockProps;
    private _eventBus: EventBus;
    public children: BlockChildren = {}; // Дочерние компоненты

    constructor(propsAndChildren: BlockProps = {}) {
        this._eventBus = new EventBus();
        this.props = this._makePropsProxy(propsAndChildren); // Прокси для реактивности
        this._registerEvents(this._eventBus); // Регистрация обработчиков событий
        this._eventBus.emit(Block.EVENTS.INIT); // Инициирование инициализации
    }

    // Регистрация обработчиков событий жизненного цикла
    private _registerEvents(eventBus: EventBus) {
        eventBus.on(Block.EVENTS.INIT, this._init.bind(this));
        eventBus.on(Block.EVENTS.FLOW_CDM, this._componentDidMount.bind(this));
        eventBus.on(Block.EVENTS.FLOW_CDU, this._componentDidUpdate.bind(this));
        eventBus.on(Block.EVENTS.FLOW_RENDER, this._render.bind(this));
    }

    // Этап инициализации
    private _init() {
        this.init(); // Пользовательская логика
        this._eventBus.emit(Block.EVENTS.FLOW_RENDER); // Запуск рендеринга
    }

    protected init() {} // Переопределяется в дочерних классах

    // Этап монтирования
    private _componentDidMount() {
        this.componentDidMount();
    }

    protected componentDidMount() {} // Переопределяется

    public dispatchComponentDidMount() {
        this._eventBus.emit(Block.EVENTS.FLOW_CDM);
    }

    // Этап обновления
    private _componentDidUpdate() {
        if (this.componentDidUpdate()) this._eventBus.emit(Block.EVENTS.FLOW_RENDER);
    }

    protected componentDidUpdate() { return true; } // Логика обновления

    // Обновление свойств
    setProps = (nextProps: Partial<BlockProps>) => {
        Object.assign(this.props, nextProps);
    };

    // Рендеринг
    private _render() {
        const fragment = this.render();
        const newElement = fragment.firstElementChild as HTMLElement;

        // Сохраняем текущий активный элемент
        const activeElement = document.activeElement as HTMLElement;
        const activeElementId = activeElement?.id;

        if (this._element && this._element.parentNode) {
            this._element.replaceWith(newElement);
        }

        this._element = newElement;
        this._addEvents();

        // Восстанавливаем фокус
        if (activeElementId) {
            const newActiveElement = this._element.querySelector(`#${activeElementId}`);
            if (newActiveElement) {
                (newActiveElement as HTMLElement).focus();
            }
        }
    }

    protected render(): DocumentFragment {
        return new DocumentFragment(); // Переопределяется
    }

    // Компиляция Handlebars-шаблонов
    protected compile(template: string, context: any): DocumentFragment {
        const fragment = document.createElement('template');
        const componentContext = { ...context };

        // Обработка дочерних компонентов
        Object.entries(this.children).forEach(([key, child]) => {
            if (child instanceof Block) {
                componentContext[key] = `<div data-id="${key}"></div>`; // Заглушка
            }
        });

        fragment.innerHTML = Handlebars.compile(template)(componentContext);

        // Замена заглушек реальными компонентами
        Object.entries(this.children).forEach(([key, child]) => {
            const stub = fragment.content.querySelector(`[data-id="${key}"]`);
            if (stub && child instanceof Block) {
                stub.replaceWith(child.getContent()!);
            }
        });

        return fragment.content;
    }

    // Добавление событий из props
    private _addEvents() {
        const { events = {} } = this.props;

        // Удаляем старые обработчики
        if (this._element) {
            Object.entries(events).forEach(([event, listener]) => {
                this._element?.removeEventListener(event, listener as EventListener);
            });
        }

        // Добавляем новые обработчики
        Object.entries(events).forEach(([event, listener]) => {
            this._element?.addEventListener(event, listener as EventListener);
        });
    }


    // Прокси для отслеживания изменений props
    private _makePropsProxy(props: BlockProps) {
        return new Proxy(props, {
            set: (target, prop: string, value) => {
                if (target[prop] !== value) {
                    target[prop] = value;
                    this._eventBus.emit(Block.EVENTS.FLOW_CDU); // Триггер обновления
                }
                return true;
            },
            deleteProperty: () => { throw new Error('Нет доступа'); }
        });
    }

    // Гарантированно возвращает HTMLElement
    getContent() {
        return this._element || document.createElement('div');
    }
}
