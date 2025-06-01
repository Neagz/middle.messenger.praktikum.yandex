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
    showDialog: true
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
