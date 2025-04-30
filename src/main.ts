import Handlebars from 'handlebars';
import * as Components from './components';
import * as Pages from './pages';

//import cat1 from './assets/01.jpg'

import './style.css'

const pages: {[index:string]:any} = {
    'login': [ Pages.LoginPage ],
    'registration': [ Pages.RegistrationPage],
    'nav': [ Pages.NavigatePage ],
    '500': [ Pages.Page500 ],
    '404': [ Pages.Page404 ],
    'profile': [ Pages.ProfilePage ],
    'profile_edit' : [ Pages.ProfileEditPage ],
    'profile_password' : [ Pages.ProfilePasswordPage ],
    'list' : [ Pages.ListPage ]
};

Object.entries(Components).forEach(([ name, template]: any) => {

    Handlebars.registerPartial(name, template);
});

function navigate(page: string){
    const [ source, context ] = pages[page];
    const container = document.getElementById('app')!;

    const temlpatingFunction = Handlebars.compile(source);
    console.log('html', temlpatingFunction(context));
    container.innerHTML = temlpatingFunction (context);
}

function init() {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const page = urlParams.get('page');
    console.log(page);
    navigate(page ? page : 'nav');
}

document.addEventListener('DOMContentLoaded', init);

document.addEventListener('click', e => {
    //@ts-ignore
    const page = e.target.getAttribute('page');
    console.log(e.target);
    if (page) {
        navigate (page);

        e.preventDefault();
        e.stopImmediatePropagation();
    }
});
