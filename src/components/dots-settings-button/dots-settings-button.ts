import { Block } from '../../core/block';
import template from './dots-settings-button.hbs?raw';

interface DotsSettingsButtonProps {
    onClick?: (_e: Event) => void;
    [key: string]: unknown;
}

export class DotsSettingsButton extends Block<DotsSettingsButtonProps> {
    constructor(props: DotsSettingsButtonProps = {}) {
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
