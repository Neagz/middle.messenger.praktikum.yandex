export { default as TestPage } from './test_page.hbs?raw';

import './test_page.css';
import TestButton from "../../components/test-button/test-button";
import Handlebars from 'handlebars';

Handlebars.registerPartial('TestButton', (props: any) => {
    return new TestButton({
        text: props.text || "Нажми меня",
        className: props.className || "my-button"
    }).getContent().outerHTML;
});

export function initTestPage() {
    console.log('Тестовая страница инициализирована');

    // Вешаем обработчик на родительский элемент
    document.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        if (target.closest('.my-button')) {
            console.log("Кнопка нажата через делегирование!", e);
            alert("Кнопка работает через делегирование!");
        }
    });
}
