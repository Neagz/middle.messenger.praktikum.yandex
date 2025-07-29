import Handlebars from 'handlebars';
import './style.css';
import * as Components from './components';
import Router from './utils/router';
import {authController, chatsController, userController} from './controllers';
import {LoginPage, RegistrationPage, ProfilePage, ListPage, Page404, Page500, ProfileEditPage, ProfilePasswordPage} from './pages';
/* eslint-disable no-unused-vars */
export enum Routes {
  SignIn = '/',
  SignUp = '/sign-up',
  Messenger = '/messenger',
  Settings = '/settings',
  SettingsEdit = '/settings-edit',
  SettingsPassword = '/settings-password',
  Error404 = '/404',
  Error500 = '/500',
}
/* eslint-enable no-unused-vars */
interface HelperContext {
  name: string;
  value: number;
}

// Регистрация маршрутов
const router = new Router('#app');
// Инициализируем контроллеры с роутером
authController.setRouter(router);
userController.setRouter(router);
chatsController.setRouter(router);

// Настройка маршрутов
router
    .use(Routes.SignIn, LoginPage)
    .use(Routes.SignUp, RegistrationPage)
    .use(Routes.Settings, ProfilePage)
    .use(Routes.SettingsEdit, ProfileEditPage)
    .use(Routes.SettingsPassword, ProfilePasswordPage)
    .use(Routes.Messenger, ListPage)
    .use(Routes.Error404, Page404)
    .use(Routes.Error500, Page500)
    .start();

// Улучшенная регистрация хелперов с поддержкой вложенного контента
Object.entries(Components).forEach(([componentName, ComponentClass]) => {
  Handlebars.registerHelper(componentName, function (this: HelperContext, ...args: unknown[]) {
    const options = args.pop() as Handlebars.HelperOptions;
    const context = this || {};
    const props = { ...context, ...options.hash };

    // Поддержка вложенного контента
    if (options.fn) {
      props.content = options.fn(this);
    }

    const instance = new (ComponentClass)(props);
    return new Handlebars.SafeString(instance.getContent()?.outerHTML || '');
  });
  Handlebars.registerHelper('eq', function(a, b, options) {
    return a === b ? options.fn(this) : options.inverse(this);
  });
  Handlebars.registerHelper('formatTimeOrEmpty', function(timestamp) {
    // Если timestamp отсутствует, пустая строка или null/undefined
    if (!timestamp) return '';

    try {
      const date = new Date(timestamp);

      // Проверка, что дата валидна
      if (isNaN(date.getTime())) return '';

      // Форматирование в ЧЧ:ММ с ведущими нулями
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');

      return `${hours}:${minutes}`;
    } catch {
      return ''; // В случае ошибки возвращаем пустую строку
    }
  });
});
