import Router from "./router";

export interface UserData {
    id: number;
    first_name: string;
    second_name: string;
    display_name: string;
    login: string;
    email: string;
    phone: string;
    avatar: string;
}

export interface UserResponse {
    id: number;
    first_name: string;
    second_name: string;
    display_name?: string;
    login: string;
    email: string;
    phone: string;
    avatar?: string;
}

export interface IProfileData {
    first_name: string;
    second_name: string;
    display_name: string;
    login: string;
    email: string;
    phone: string;
    [key: string]: unknown;
}

export interface IPasswordData {
    oldPassword: string;
    newPassword: string;
    [key: string]: unknown;
}

export interface ISignUpData {
    first_name: string;
    second_name: string;
    login: string;
    email: string;
    password: string;
    phone: string;
    [key: string]: unknown;
}

export interface ISignInData {
    login: string;
    password: string;
    [key: string]: unknown;
}

export interface ChatData {
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

export interface MessageData {
    id?: number;
    user_id?: number;
    chat_id?: number;
    time: string;
    content: string;
    is_read?: boolean;
    type?: 'message' | 'file' | 'image' | 'incoming' | 'outgoing';
    file?: {
        url: string;
        name: string;
        size: number;
    };
}

export interface TokenResponse {
    token: string;
}

export interface IChatsController {
    // Основные методы работы с чатами
    getChats(): Promise<ChatData[]>;
    createChat(_title: string): Promise<void>;
    deleteChat(_chatId: number): Promise<void>;

    // Методы работы с пользователями чата
    addUserToChat(_chatId: number, _userId: number): Promise<void>;
    removeUserFromChat(_chatId: number, _userId: number): Promise<void>;

    // Методы работы с WebSocket
    getToken(_chatId: number): Promise<string | null>;
    selectChat(_chat: ChatData): Promise<void>;

    // Настройки роутера
    setRouter(_router: Router): void;

    // Дополнительные методы
    searchUsers(_login: string): Promise<UserData[]>;
    updateChatAvatar(_chatId: number, _avatar: FormData): Promise<void>;
}
