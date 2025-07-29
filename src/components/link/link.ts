import { Block } from '../../core/block';
import template from './link.hbs?raw';

interface LinkProps {
    page?: string;
    style: string;
    position: string;
    name: string;
    type?: string;
    events?: {
        click: (_e: Event) => void;
    };
}

export class Link extends Block {
    constructor(props: LinkProps) {
        // Объединяем системный обработчик с пользовательскими
        const events = {
            ...(props.events || {}),
            click: (e: Event) => {
                e.preventDefault();
                // Вызываем кастомный обработчик если он есть
                if (props.events?.click) {
                    props.events.click(e);
                }
                // Всегда выполняем навигацию
                // window.navigate(props.page);
            }
        };

        super({ ...props, events });
    }

    protected render(): DocumentFragment {
        return this.compile(template, this.props);
    }
}
