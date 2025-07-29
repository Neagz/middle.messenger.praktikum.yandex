import EventBus from './eventBus';
import { cloneDeep } from '../utils/helpers';

// Определяем тип состояния
interface UserData {
    id: number;
    first_name: string;
    second_name: string;
    display_name: string;
    login: string;
    email: string;
    phone: string;
    avatar: string;
}

interface ChatData {
    id: number;
    title: string;
    avatar: string;
    unread_count: number;
    last_message?: {
        user: UserData;
        time: string;
        content: string;
    };
}

interface MessageData {
    id: number;
    user_id: number;
    chat_id: number;
    time: string;
    content: string;
    is_read: boolean;
}

interface AppState {
    user: UserData | null;
    chats: ChatData[];
    currentChat: ChatData | null;
    messages: Record<number, MessageData[]>;
    error: string | null;
}

type Dispatch<T = unknown> = (_nextStateOrAction: Partial<AppState> | Action<T>, _payload?: T) => void;
type Action<T = unknown> = (_dispatch: Dispatch<T>, _state: AppState, _payload: T) => void;

export class Store extends EventBus {
    private state: AppState;

    constructor(defaultState: AppState) {
        super();
        this.state = defaultState;
    }

    public getState(): AppState {
        return this.state;
    }

    public set(nextState: Partial<AppState>): void {
        const prevState = cloneDeep(this.state);
        this.state = { ...this.state, ...nextState };
        this.emit('changed', prevState, nextState);
    }

    dispatch<T>(nextStateOrAction: Partial<AppState> | Action<T>, payload?: T): void {
        if (typeof nextStateOrAction === 'function') {
            // Добавляем проверку на undefined и приводим тип
            const actionPayload = payload !== undefined ? payload : null as unknown as T;
            nextStateOrAction(this.dispatch.bind(this), this.state, actionPayload);
        } else {
            this.set({ ...this.state, ...nextStateOrAction });
        }
    }
}

// Инициализация хранилища
export const defaultState: AppState = {
    user: null,
    chats: [], // Инициализируем пустым массивом
    currentChat: null,
    messages: {},
    error: null
};

export const store = new Store(defaultState);
