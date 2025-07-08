import { Block } from '../../core/block';
import template from './avatar-input.hbs?raw';

interface AvatarInputProps {
    id?: string;
    currentAvatar?: string;
    name: string;
    events?: {
        change: (_e: Event) => void;
    };
    [key: string]: unknown;
}

export class AvatarInput extends Block<AvatarInputProps> {
    constructor(props: AvatarInputProps) {
        super({
            ...props,
            events: {
                change: (e: Event) => this.handleChange(e)
            }
        });
    }

    handleChange(e: Event) {
        const input = e.target as HTMLInputElement;
        if (input.files && input.files[0]) {
            const reader = new FileReader();
            reader.onload = (event) => {
                // Обновляем текущий аватар
                this.setProps({ currentAvatar: event.target?.result as string });
            };
            reader.readAsDataURL(input.files[0]);
        }
    }

    protected render(): DocumentFragment {
        return this.compile(template, this.props);
    }
}
