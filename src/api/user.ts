import { BaseAPI } from './base-api';
import { UserResponse, IProfileData, IPasswordData } from '../utils/types';

interface AvatarResponse {
    avatar: string;
    // avatarPath больше не используется в API
}
export class UserAPI extends BaseAPI {

    changeProfile(data: IProfileData): Promise<UserResponse> {
        return this.http.put<UserResponse>('/user/profile', data);
    }

    changeAvatar(data: FormData): Promise<AvatarResponse> {
        return this.http.put<AvatarResponse>('/user/profile/avatar', data);
    }

    changePassword(data: IPasswordData) {
        return this.http.put('/user/password', data);
    }
}
