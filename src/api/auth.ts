import { BaseAPI } from './base-api';
import { UserResponse, ISignUpData, ISignInData } from '../utils/types';

export class AuthAPI extends BaseAPI {
    signUp(data: ISignUpData) {
        return this.http.post('/auth/signup', data);
    }

    signIn(data: ISignInData) {
        return this.http.post('/auth/signin', data);
    }

    logout() {
        return this.http.post('/auth/logout');
    }

    getUser(): Promise<UserResponse | null> {
        return this.http.get<UserResponse | null>('/auth/user');
    }
}
