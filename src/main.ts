import Handlebars from 'handlebars';
import './style.css';
import * as Pages from './pages'; // Страницы
import * as Components from './components'; // Компоненты
import { Block } from "./core/block"; // Базовый класс
import Router from './utils/router';
import {authController, chatsController, userController} from './controllers';
import {LoginPage, RegistrationPage, ProfilePage, ListPage, Page404, Page500, ProfileEditPage, ProfilePasswordPage} from './pages';

interface HelperContext {
  name: string;
  value: number;
}
// Тип для конфигурации страницы
type PageConfig = {
  template: new (_props: Record<string, unknown>) => Block; // Упрощенный тип конструктора
  context?: Record<string, unknown>;
};

// Конфигурация страниц
const pagesConfig: Record<string, PageConfig> = {
  test_page: { template: Pages.TestPage },
  login: { template: Pages.LoginPage },
  registration: { template: Pages.RegistrationPage },
  nav: { template: Pages.NavigatePage },
  '500': { template: Pages.Page500 },
  '404': { template: Pages.Page404 },
  profile: { template: Pages.ProfilePage },
  profile_edit: { template: Pages.ProfileEditPage },
  profile_password: { template: Pages.ProfilePasswordPage },
  list: {
    template: Pages.ListPage,
    context: {
      contacts: [],
    }
  }
};

// Регистрация маршрутов
const router = new Router('#app');
// Инициализируем контроллеры с роутером
authController.setRouter(router);
userController.setRouter(router);
chatsController.setRouter(router);

router
    .use('/', LoginPage)
    .use('/sign-up', RegistrationPage)
    .use('/settings', ProfilePage)
    .use('/settings-edit', ProfileEditPage)
    .use('/settings-password', ProfilePasswordPage)
    .use('/messenger', ListPage, { context: pagesConfig.list.context })
    .use('/404', Page404)
    .use('/500', Page500)
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

// Глобальная навигация по кликам
// document.addEventListener('click', (e) => {
//   const target = e.target as HTMLElement;
//   const link = target.closest('a[href^="/"]');
//
//   if (link) {
//     e.preventDefault();
//     router.go(link.getAttribute('href')!);
//   }
// });

/**
// Навигация между страницами
function navigate(page: string) {
  const config = pagesConfig[page] || pagesConfig['404']; // Конфиг или 404
  const container = document.getElementById('app'); // Контейнер приложения

  if (!container) return console.error('Контейнер #app не найден');

  try {
    const pageInstance = new config.template(config.context || {}); // Создание страницы
    const content = pageInstance.getContent(); // Получение контента
    if (content) {
      container.innerHTML = '';
      container.appendChild(content); // Вставка в DOM
      pageInstance.dispatchComponentDidMount(); // Инициирование монтирования
    }
  } catch (e) {
    console.error(`Ошибка при рендеринге страницы ${page}:`, e);
    if (page !== '500') navigate('500'); // Переход на страницу ошибки
  }
}

// Инициализация приложения
function init() {
  const urlParams = new URLSearchParams(window.location.search);
  const page = urlParams.get('page') || 'nav'; // Страница из URL или nav
  navigate(page);
}

// Глобальная навигация по кликам
document.addEventListener('click', (e) => {
  // Проверяем, что цель события является HTMLElement
  if (!(e.target instanceof HTMLElement)) {
    return;
  }

  const target = e.target;

  // Ищем ближайший элемент с атрибутом 'page'
  const pageElement = target.closest('[page]');

  if (pageElement && pageElement instanceof HTMLElement) {
    const page = pageElement.getAttribute('page');

    if (page) {
      navigate(page); // Переход
      e.preventDefault(); // Отмена стандартного поведения
      e.stopPropagation(); // Остановка всплытия
    }
  }
});

// Запуск при загрузке DOM
document.addEventListener('DOMContentLoaded', init);

// Экспорт навигации в глобальную область
declare global { interface Window { navigate: (_page: string) => void; } }
window.navigate = navigate;
 */
