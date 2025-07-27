import { Block } from '../../core/block';
import template from './dots-select-button.hbs?raw';

interface DotsSelectButtonProps {
    onClick?: (e: Event) => void;
    [key: string]: unknown;
}

export class DotsSelectButton extends Block<DotsSelectButtonProps> {
    constructor(props: DotsSelectButtonProps = {}) {
        super({
            ...props,
            events: {
                click: (e: Event) => {
                    e.stopPropagation();
                    props.onClick?.(e);
                }
            }
        });
    }

    protected render(): DocumentFragment {
        return this.compile(template, this.props);
    }
}