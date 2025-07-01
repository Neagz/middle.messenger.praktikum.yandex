import { Block } from "../../core/block";
import template from './test-button.hbs?raw'; // Импорт шаблона

interface TestButtonProps {
    text: string;
    page?: string;
    className?: string;
    events?: {
        click?: (e: Event) => void;
        mouseover?: (e: Event) => void;
    };
}

export class TestButton extends Block {
    constructor(props: TestButtonProps) {
        super({
            ...props,
            events: props.events || {}
        });
    }

    protected render(): DocumentFragment {
        return this.compile(template, this.props); // Используем импортированный шаблон
    }
}
