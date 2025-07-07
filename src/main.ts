import Handlebars from 'handlebars';
import './style.css';
import * as Pages from './pages'; // Страницы
import * as Components from './components'; // Компоненты
import { Block } from "./core/block"; // Базовый класс

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
      showActionDialogMessage: true,
      showActionDialogUser: true
    }
  }
};

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
});

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
