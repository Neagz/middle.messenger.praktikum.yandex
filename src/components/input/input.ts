import { Block } from '../../core/block';
import template from './input.hbs?raw';
import { ValidationRule } from '../../utils/validation';

interface InputProps {
    name?: string;
    type: string;
    placeholder?: string;
    value?: string;
    id?: string;
    readonly?: boolean;
    validateRule?: ValidationRule;
    class?: string;
    modifier?: string;
    autocomplete?: string;
    events?: {
        blur?: (_e: Event) => void;
    };
}

export class Input extends Block {
    constructor(props: InputProps) {
        super({
            ...props,
            events: {
                blur: (e: Event) => props.events?.blur?.(e)
            }
        });
    }

    public getValue(): string {
        const input = this.getContent() as HTMLInputElement;
        return input.value;
    }

    public setValue(value: string): void {
        const input = this.getContent() as HTMLInputElement;
        input.value = value;
    }

    protected render(): DocumentFragment {
        return this.compile(template, this.props); // Используем импортированный шаблон
    }
}
