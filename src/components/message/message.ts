import { Block } from '../../core/block';
import template from './message.hbs?raw';
import {ValidationRule, validationRules} from "../../utils/validation.ts";

interface MessageProps {
    id: string;
    placeholder: string;
    name: string;
    value?: string;
    errorText?: string;
    validateRule?: ValidationRule;
    class?: string;
}

export class Message extends Block {
    private inputRef: HTMLInputElement | null = null;
    private currentValue: string;

    constructor(props: MessageProps) {
        super({
            ...props,
            // Отключаем перерисовку при изменении value
            shouldUpdate: (
                oldProps: Record<string, unknown>,
                newProps: Record<string, unknown>
            ) => {
                return oldProps.error !== newProps.error ||
                    oldProps.class !== newProps.class;
            }
        });

        this.currentValue = props.value || '';

    }
    init() {
        // Создаем обработчики один раз при инициализации
        this.setProps({
            events: {
                input: this.handleInput.bind(this),
                blur: this.handleBlur.bind(this)
            }
        });
    }

    private handleInput(e: Event) {
        const target = e.target as HTMLInputElement;
        this.currentValue = target.value;

        // Сохраняем ссылку на DOM-элемент
        if (!this.inputRef) {
            this.inputRef = target;
        }
    }

    private handleBlur() {
        this.validate();
    }

    validate(): boolean {
        if (!this.props.validateRule) return true;
        const rule = validationRules[this.props.validateRule as ValidationRule];
        const isValid = rule(this.currentValue);

        if (!isValid) {
            const errorMessage = this.props.errorText;
            this.setProps({
                error: errorMessage,
                class: 'message--error'
            });
            return false;
        }

        this.setProps({
            error: undefined,
            class: ''
        });
        return true;
    }

    public getValue(): string {
        return this.currentValue;
    }

    public setValue(value: string): void {
        this.currentValue = value;
        if (this.inputRef) {
            this.inputRef.value = value;
        }
    }

    protected render(): DocumentFragment {
        return this.compile(template, {
            ...this.props,
            value: this.currentValue
        });
    }
}
