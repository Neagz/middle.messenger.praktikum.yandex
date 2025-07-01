import { Block } from '../../core/block';
import { TestButton } from '../../components/test-button/test-button';
import template from './test_page.hbs?raw';

interface TestPageProps {
    title?: string;
}

export class TestPage extends Block {
    constructor(props: TestPageProps = {}) {
        super({
            ...props,
            title: props.title || "Тестовая страница"
        });
    }

    init() {
        this.children.button1 = new TestButton({
            text: "Нажми меня",
            className: "my-button",
            page: "nav",
            events: {
                click: (e: Event) => {
                    e.preventDefault();
                    console.log("Клик сработал!");
                }
            }
        });

        this.children.button2 = new TestButton({
            text: "Наведи на меня",
            className: "my-button-two",
            events: {
                mouseover: (e: Event) => {
                    e.preventDefault();
                    console.log("Наведение сработало!");
                }
            }
        });
    }

    protected render(): DocumentFragment {
        return this.compile(template, this.props);
    }
}
