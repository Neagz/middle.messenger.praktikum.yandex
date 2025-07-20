import EventBus from './eventBus';
import { cloneDeep } from '../utils/helpers';

// Определяем тип состояния
interface AppState {
    user: UserData | null;
    chats: ChatData[];
    currentChat: ChatData | null;
    messages: Record<number, MessageData[]>;
    error: string | null;
}

type Dispatch = (nextStateOrAction: Partial<AppState> | Action, payload?: any) => void;
type Action = (dispatch: Dispatch, state: AppState, payload: any) => void;

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

    dispatch(nextStateOrAction: Partial<AppState> | Action, payload?: any) {
        if (typeof nextStateOrAction === 'function') {
            nextStateOrAction(this.dispatch.bind(this), this.state, payload);
        } else {
            this.set({ ...this.state, ...nextStateOrAction });
        }
    }
}

// Интерфейсы для типизации состояния
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

interface AppState {
    user: UserData | null;
    chats: ChatData[]; // Убрали undefined, так как всегда инициализируем массивом
    currentChat: ChatData | null;
    messages: Record<number, MessageData[]>;
    error: string | null;
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

// Инициализация хранилища
export const defaultState: AppState = {
    user: null,
    chats: [], // Инициализируем пустым массивом
    currentChat: null,
    messages: {},
    error: null
};

export const store = new Store(defaultState);
