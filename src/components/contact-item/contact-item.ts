import { Block } from '../../core/block';
import template from './contact-item.hbs?raw';

interface ContactItemProps {
    id: number;
    avatar: string;
    name: string;
    preview: string;
    timestamp: string;
    unread?: string;
    fromMe?: boolean;
    active?: boolean;
    onContactClick?: () => void;
    [key: string]: unknown;
}

export class ContactItem extends Block<ContactItemProps> {
    private _prevProps: ContactItemProps;
    constructor(props: ContactItemProps) {
        super({
            ...props,
            events: {
                click: (e: Event) => {
                    e.preventDefault();
                    e.stopPropagation();
                    props.onContactClick?.();
                }
            }
        });
    }

    protected componentDidUpdate(): boolean {
        const oldProps = this._prevProps as ContactItemProps;
        const newProps = this.props as ContactItemProps;
        // Если изменилось только active или unread - обновляем вручную
        if (oldProps.active !== newProps.active || oldProps.unread !== newProps.unread) {
            const element = this.getContent();
            if (element) {
                // Обновляем класс активности
                element.classList.toggle('contact-item__active', !!newProps.active);

                // Обновляем счетчик непрочитанных
                const unreadEl = element.querySelector('.contact-item__unread-count');
                if (unreadEl) {
                    unreadEl.textContent = newProps.unread || '';
                }
            }
            return false; // Не делать полный перерендер
        }
        return true; // Сделать полный перерендер
    }


    protected render(): DocumentFragment {
        return this.compile(template, this.props);
    }
}
