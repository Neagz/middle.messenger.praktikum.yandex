import { AuthController } from './auth-controller';
import { UserController } from './user-controller';
import { ChatsController } from './chats-controller';
import { MessageController } from './message-controller';
import { IChatsController } from '../utils/types';

export const authController = new AuthController();
export const userController = new UserController();
export const chatsController: IChatsController = new ChatsController();
export const messageController = new MessageController();

authController.setChatsController(chatsController);
