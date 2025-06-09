import Handlebars from 'handlebars';
import * as Components from './components/index.ts';
import * as Pages from './pages/index.ts';
import './style.css';

type PageEntry = [string, Record<string, unknown>];

const pages: Record<string, PageEntry> = {
  login: [Pages.LoginPage, {}],
  registration: [Pages.RegistrationPage, {}],
  nav: [Pages.NavigatePage, {}],
  500: [Pages.Page500, {}],
  404: [Pages.Page404, {}],
  profile: [Pages.ProfilePage, {}],
  profile_edit: [Pages.ProfileEditPage, {}],
  profile_password: [Pages.ProfilePasswordPage, {}],
  list: [Pages.ListPage, {
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
  }],
};

Object.entries(Components).forEach(([name, template]: [string, string]) => {
  Handlebars.registerPartial(name, template);
});

function navigate(page: string) {
  const [source, context] = pages[page];
  const container = document.getElementById('app')!;

  const templatingFunction = Handlebars.compile(source);
  container.innerHTML = templatingFunction(context);
}

function init() {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const page = urlParams.get('page');
  navigate(page || 'list');
}

document.addEventListener('DOMContentLoaded', init);

document.addEventListener('click', (e) => {
  const target = e.target as HTMLElement;
  const page = target.getAttribute('page');
  if (page) {
    navigate(page);

    e.preventDefault();
    e.stopImmediatePropagation();
  }
});
