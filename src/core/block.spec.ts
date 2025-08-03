import { expect } from 'chai';
import { Block } from './block.ts';

describe('Block', () => {
    class TestBlock extends Block {
        render() {
            return this.compile('<div>{{text}}</div>', { text: this.props.text });
        }
    }

    it('Должен запуститься render из props', () => {
        const block = new TestBlock({ text: 'Test' });
        expect(block.getContent().textContent).to.equal('Test');
    });

    it('Должен обновить props', () => {
        const block = new TestBlock({ text: 'Old' });
        block.setProps({ text: 'New' });
        expect(block.props.text).to.equal('New');
    });

    it('Должен обрабатывать events', () => {
        let clicked = false;
        const block = new TestBlock({
            events: {
                click: () => { clicked = true; }
            }
        });
        block.getContent().click();
        void expect(clicked).to.be.true;
    });

    it('should destroy and clean up', () => {
        const block = new TestBlock({});
        const element = block.getContent();
        block.destroy();
        void expect(element.parentNode).to.be.null;
    });
});
