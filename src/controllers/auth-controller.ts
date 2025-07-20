import { AuthAPI } from '../api/auth';
import { store } from '../core/store';
import Router from '../utils/router';
import { UserData, ISignUpData, ISignInData } from '../utils/types';

export class AuthController {
    private api: AuthAPI;
    private router: Router | null = null;
    private chatsController?: any;

    setChatsController(controller: any) {
        this.chatsController = controller;
    }

    constructor() {
        this.api = new AuthAPI();
    }

    setRouter(router: Router) {
        this.router = router;
    }

    private checkRouter() {
        if (!this.router) {
            throw new Error('Router not initialized');
        }
    }

    async signUp(data: ISignUpData) {
        try {
            await this.api.signUp(data);
            const user = await this.signIn({
                login: data.login,
                password: data.password
            });

            if (user && this.chatsController) {
                await this.chatsController.getChats();
                this.checkRouter();
                this.router!.go('/messenger'); // Используем переданный router
            }
        } catch (e: any) {
            console.error('SignUp error:', e);
            store.set({ error: e.reason || 'Registration failed' });
        }
    }

    async signIn(data: ISignInData): Promise<UserData | null> {
        try {
            const response = await this.api.signIn(data);
            console.log("SignIn response:", response); // Добавьте логирование
            // Небольшая задержка перед запросом пользователя
            await new Promise(resolve => setTimeout(resolve, 100));
            const user = await this.fetchUser();

            if (user) {
                if (this.chatsController) {
                    await this.chatsController.getChats();
                }
                if (this.router) {
                    this.router.go('/messenger');
                }
                return user;
            }
            return null;
        } catch (e: any) {
            console.error('SignIn error:', e);
            store.set({ error: e.reason || 'Authorization failed' });
            return null;
        }
    }
    async logout() {
        try {
            await this.api.logout();
            store.set({ user: null, error: null });
            this.checkRouter();
            this.router!.go('/');
        } catch (e: any) {
            console.error('Logout error:', e);
            store.set({ error: e.reason || 'Logout failed' });
        }
    }

    async fetchUser() {
        try {
            const response = await this.api.getUser();
            if (!response) {
                store.set({ user: null });
                return null;
            }

            // Приводим тип к UserData
            const user: UserData = {
                id: response.id,
                first_name: response.first_name,
                second_name: response.second_name,
                display_name: response.display_name || `${response.first_name} ${response.second_name}`,
                login: response.login,
                email: response.email,
                phone: response.phone,
                avatar: response.avatar || ''
            };
            console.log("Данные пользователя:", user);
            store.set({ user, error: null });
            return user; // Возвращаем данные пользователя
        } catch (e: any) {
            if (e.message === 'Unauthorized') {
                store.set({ user: null });
            }
            throw e;
        }
    }
}

export const authController = new AuthController();
