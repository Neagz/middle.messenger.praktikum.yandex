import { Block } from '../../core/block';
import template from './message.hbs?raw';
import {ValidationRule, validationRules} from "../../utils/validation";

interface MessageProps {
    id: string;
    placeholder: string;
    name: string;
    value?: string;
    errorText?: string;
    validateRule?: ValidationRule;
    class?: string;
    onEnter?: () => void;
    [key: string]: unknown;
}

export class Message extends Block<MessageProps> {
    private inputRef: HTMLInputElement | null = null;
    public currentValue: string = '';
    private shouldPreserveFocus = false;

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
            },
        });

        this.currentValue = props.value || '';

    }
    init() {
        this.setProps({
            events: {
                input: this.handleInput.bind(this),
                blur: this.handleBlur.bind(this),
                keydown: this.handleKeyDown.bind(this)
            }
        });
    }

    public clear() {
        this.preserveFocus();
        // Отключаем временно события blur при очистке
        this.setProps({ events: {} });

        this.currentValue = '';
        if (this.inputRef) {
            this.inputRef.value = '';
        }

        // Восстанавливаем события после микротаска
        setTimeout(() => {
            this.setProps({
                events: {
                    blur: this.handleBlur.bind(this),
                    input: this.handleInput.bind(this),
                    keydown: this.handleKeyDown.bind(this)
                }
            });
        }, 0);
    }

    private handleKeyDown(e: Event) {
        const keyboardEvent = e as KeyboardEvent;
        if (keyboardEvent.key === 'Enter' && typeof this.props.onEnter === 'function') {
            keyboardEvent.preventDefault();
            if (typeof this.props.onEnter === 'function') {
                this.props.onEnter();
            }
        }
    }

    private handleInput(e: Event) {
        const target = e.target as HTMLInputElement;
        this.currentValue = target.value;

        // Сохраняем ссылку на DOM-элемент
        if (!this.inputRef) {
            this.inputRef = target;
        }
    }

    public preserveFocus() {
        this.shouldPreserveFocus = true;
        setTimeout(() => this.shouldPreserveFocus = false, 100);
    }

// В handleBlur:
    private handleBlur() {
        if (this.shouldPreserveFocus) {
            this.inputRef?.focus();
            return;
        }
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
