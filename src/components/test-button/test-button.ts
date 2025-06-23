import Block from "../../core/block";

interface TestButtonProps {
    text: string;
    className?: string;
    events?: {
        click?: (e: Event) => void;
    };
}

export default class TestButton extends Block {
    constructor(props: TestButtonProps) {
        super({
            ...props,
            tagName: 'button',
            attr: {
                class: props.className || '',
                type: 'button'
            }
        });
    }

    render() {
        // Возвращаем только текст для кнопки
        return this.props.text;
    }
}
