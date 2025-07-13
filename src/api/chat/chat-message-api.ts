import HTTP from '../httpTransport';
import { BaseAPI } from '../base/base-api';

const chatMessagesAPIInstance = new HTTP('api/v1/messages');

export class ChatMessagesAPI extends BaseAPI {
    request({id}) {
        return chatMessagesAPIInstance.get(`/${id}`);
    }
}
