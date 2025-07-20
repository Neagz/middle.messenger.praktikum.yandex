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
    id: number;
    user_id: number;
    chat_id: number;
    time: string;
    content: string;
    is_read: boolean;
    type?: 'message' | 'file' | 'image';
    file?: {
        url: string;
        name: string;
        size: number;
    };
}

export interface TokenResponse {
    token: string;
}
