import { UserAPI } from '../api/user';
import { store } from '../core/store';
import Router from '../utils/router';
import { UserData } from '../utils/types';

export class UserController {
    private api: UserAPI;
    private router: Router | null = null;

    constructor() {
        this.api = new UserAPI();
    }
    setRouter(router: Router) {
        this.router = router;
    }

    private checkRouter() {
        if (!this.router) {
            throw new Error('Router not initialized');
        }
    }
    async changeProfile(data: IProfileData) {
        try {
            const response = await this.api.changeProfile(data);

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

            store.set({ user, error: null });
            this.checkRouter();
            this.router!.go('/settings');
        } catch (e) {
            console.error('Change profile error:', e);
            store.set({ error: e.reason || 'Profile update failed' });
        }
    }

    async changeAvatar(data: FormData) {
        try {
            console.log('Uploading avatar...', data.get('avatar'));
            const response = await this.api.changeAvatar(data);
            console.log('Avatar upload response:', response);

            const user = store.getState().user;
            if (user && response.avatar)  {
                store.set({
                    user: {
                        ...user,
                        avatar: response.avatar
                    },
                    error: null
                });
            }
        } catch (e) {
            console.error('Change avatar error:', e);
            store.set({ error: e.reason || 'Avatar update failed' });
        }
    }

    async changePassword(data: IPasswordData) {
        try {
            await this.api.changePassword(data);
            store.set({ error: null });
            this.checkRouter();
            this.router!.go('/settings');
        } catch (e) {
            console.error('Change password error:', e);
            store.set({ error: e.reason || 'Password change failed' });
        }
    }

    async searchUser(login: string): Promise<UserData | null> {
        try {
            const users = await this.api.searchUser(login);
            if (users.length > 0) {
                const user = users[0];
                return {
                    id: user.id,
                    first_name: user.first_name,
                    second_name: user.second_name,
                    display_name: user.display_name || `${user.first_name} ${user.second_name}`,
                    login: user.login,
                    email: user.email,
                    phone: user.phone,
                    avatar: user.avatar || '' // Гарантируем string вместо string | undefined
                };
            }
            return null;
        } catch (e: any) {
            console.error('User search error:', e);
            store.set({ error: e.reason || 'User search failed' });
            return null;
        }
    }
}

export const userController = new UserController();

interface IProfileData {
    first_name: string;
    second_name: string;
    display_name: string;
    login: string;
    email: string;
    phone: string;
    [key: string]: unknown;
}

interface IPasswordData {
    oldPassword: string;
    newPassword: string;
    [key: string]: unknown;
}
