import { AuthController } from './auth-controller';
import { UserController } from './user-controller';
import { ChatsController } from './chats-controller';
import { MessageController } from './message-controller';

export const authController = new AuthController();
export const userController = new UserController();
export const chatsController = new ChatsController();
export const messageController = new MessageController();

authController.setChatsController(chatsController);
