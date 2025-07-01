import { Block } from '../../core/block';
import template from './input.hbs?raw';
import { ValidationRule, validationRules } from '../../utils/validation';

interface InputProps {
    label: string;
    name?: string;
    id: string;
    type: string;
    placeholder?: string;
    value?: string;
    error?: string;
    readonly?: boolean;
    validateRule?: ValidationRule;
    class?: string;
    modifier?: string;
    autocomplete?: string;
    errorText?: string;
}

export class Input extends Block {
    private inputRef: HTMLInputElement | null = null;
    private currentValue: string;

    constructor(props: InputProps) {
        super({
            ...props,
            // Отключаем перерисовку при изменении value
            shouldUpdate: (oldProps: any, newProps: any) => {
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
            // Используем кастомный текст ошибки если он задан, иначе дефолтный
            const errorMessage = this.props.errorText || 'Неверное значение';
            this.setProps({ error: errorMessage });
            return false;
        }

        this.setProps({ error: undefined });
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
