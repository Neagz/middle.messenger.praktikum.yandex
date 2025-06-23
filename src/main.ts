import Handlebars from 'handlebars';
import './style.css';
import * as Components from './components';
import * as Pages from './pages';
import './pages/test_page/test_page';

// 1. Тип для конфигурации страницы
type PageConfig = {
  template: string;
  initFunction?: (context: any) => void;
  context?: any;
};

// 2. Конфигурация всех страниц
const pagesConfig: Record<string, PageConfig> = {
  test_page: {
    template: Pages.TestPage,
    initFunction: Pages.initTestPage,
    context: {
      title: "Тестовая страница с кнопкой",
    }
  },
  login: {
    template: Pages.LoginPage,
    context: {}
  },
  registration: {
    template: Pages.RegistrationPage,
    context: {}
  },
  nav: {
    template: Pages.NavigatePage,
    context: {}
  },
  '500': {
    template: Pages.Page500,
    context: {}
  },
  '404': {
    template: Pages.Page404,
    context: {}
  },
  profile: {
    template: Pages.ProfilePage,
    context: {}
  },
  profile_edit: {
    template: Pages.ProfileEditPage,
    context: {}
  },
  profile_password: {
    template: Pages.ProfilePasswordPage,
    context: {}
  },
  list: {
    template: Pages.ListPage,
    context: {
      contacts: [
        {avatar:'avatar.png', name:'Андрей', preview:'Изображение', timestamp: '10:49', unread: '2'},
        {avatar:'avatar.png', name:'Киноклуб', preview:'стикер', timestamp:'12:00', fromMe:true },
        {avatar:'avatar.png', name:'Илья', preview:'Друзья, у меня для вас особенный выпуск новостей!...', timestamp:'15:12', unread:'4'},
        {avatar:'avatar.png', name:'Вадим', preview:'Круто!', timestamp:'Пт', fromMe:true, active:true},
        {avatar:'avatar.png', name:'тет-а-теты', preview:'И Human Interface Guidelines и Material Design рекомендуют...', timestamp:'Ср'},
        {avatar:'avatar.png', name:'1, 2, 3', preview:'Миллионы россиян ежедневно проводят десятки часов свое...', timestamp:'Пн'},
        {avatar:'avatar.png', name:'Design Destroyer', preview:'В 2008 году художник Jon Rafman начал собирать...', timestamp:'Пн'},
        {avatar:'avatar.png', name:'Day.', preview:'Так увлёкся работой по курсу, что совсем забыл его анонсир...', timestamp:'1 мая 2020'},
        {avatar:'avatar.png', name:'Стас Рогозин', preview:'Можно или сегодня или завтра вечером.', timestamp:'12 апреля 2020'}
      ],
      showDialog: false,
      showActionDialogMessage: false,
      showActionDialogUser: false
    }
  }
};

// 3. Регистрация компонентов
Object.entries(Components).forEach(([name, component]) => {
  if (typeof component !== 'string') return;
  Handlebars.registerPartial(name, component);
});

// 4. Функция навигации
function navigate(page: string, additionalContext: any = {}) {
  // Получаем конфиг страницы или используем 404
  const config = pagesConfig[page] || pagesConfig['404'];

  // Объединяем контексты
  const context = {
    ...config.context,
    ...additionalContext
  };

  // Рендерим шаблон
  const container = document.getElementById('app');
  if (!container) {
    console.error('Контейнер #app не найден');
    return;
  }

  container.innerHTML = Handlebars.compile(config.template)(context);

  // Вызываем функцию инициализации, если она есть
  if (config.initFunction) {
    try {
      config.initFunction(context);
      console.log(`Страница ${page} успешно инициализирована`);
    } catch (e) {
      console.error(`Ошибка при инициализации страницы ${page}:`, e);
    }
  }
}

// 5. Инициализация приложения
function init() {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const page = urlParams.get('page') || 'nav'; // По умолчанию навигация

  navigate(page);
}

// 6. Обработчик кликов для навигации
function setupGlobalListeners() {
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    const page = target.getAttribute('page');
    if (page) {
      navigate(page);
      e.preventDefault();
      e.stopPropagation();
    }
  });
}

// 7. Запуск приложения
document.addEventListener('DOMContentLoaded', () => {
  init();
  setupGlobalListeners();
});

// 8. Экспорт для возможности ручного вызова навигации
export { navigate };
