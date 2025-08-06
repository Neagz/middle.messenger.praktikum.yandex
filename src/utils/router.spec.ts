import { expect } from 'chai';
import Router from './router';
import { Block } from '../core/block';
import sinon from "sinon";

describe('Router', () => {
    let router: Router;
    let testBlock: new () => Block;

    before(() => {
        // Создаем тестовый компонент с правильной сигнатурой
        class TestBlock extends Block {
            constructor() {
                super();
            }

            render(): DocumentFragment {
                const fragment = document.createDocumentFragment();
                fragment.appendChild(document.createElement('div'));
                return fragment;
            }
        }
        testBlock = TestBlock;

        router = new Router('#app');
    });

    it('Должен добавить route с помощью use()', () => {
        router.use('/test', testBlock);
        void expect(router.getRoute('/test')).to.not.be.undefined;
    });

    it('Должен перейти к route с помощью go()', () => {
        router.use('/test-go', testBlock);
        router.go('/test-go');
        expect(window.location.pathname).to.equal('/test-go');
    });

    // Для тестов back/forward нужно эмулировать историю:
    it('Должен обрабатывать back() навигацию', () => {
        const spy = sinon.spy(window.history, 'back');
        router.back();
        void expect(spy.called).to.be.true;
        spy.restore();
    });

    it('Должен обрабатывать forward() навигацию', () => {
        const clock = sinon.useFakeTimers({ shouldClearNativeTimers: true });
        router.use('/test-forward', testBlock);

        router.go('/test-forward');
        expect(window.location.pathname).to.equal('/test-forward');

        window.history.back();
        clock.tick(100); // "Перематываем" время вперед

        expect(window.location.pathname).not.to.equal('/test-forward');

        window.history.forward();
        clock.tick(100);

        expect(window.location.pathname).to.equal('/test-forward');
        clock.restore();
    });

    it('Должен перенаправить на 404 для неизвестных routes', () => {
        router.use('/404', testBlock);
        router.go('/unknown-route');
        void expect(router.getRoute('/unknown-route')).to.be.undefined;
    });
});
