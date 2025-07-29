import Route from './route';
import { authController } from '../controllers/auth-controller';
import { store } from "../core/store";
import { Block } from '../core/block';

// Главный класс роутера (Singleton)
export default class Router {
    private static __instance: Router; // Единственный экземпляр
    private routes: Route[]; // Список маршрутов
    private history: History; // API History браузера
    private _currentRoute: Route | null; // Текущий маршрут
    private _rootQuery: string; // Селектор корневого элемента

    constructor(rootQuery: string = '#app') {
        if (Router.__instance) {
            return Router.__instance;
        }

        this.routes = [];
        this.history = window.history;
        this._currentRoute = null;
        this._rootQuery = rootQuery;

        Router.__instance = this;
    }

    // Регистрация маршрута
    use<P extends Record<string, unknown>>(
        pathname: string,
        block: new (_props: P) => Block<P>,
        props: { context?: P } = {}
    ) {
        const route = new Route(pathname, block, {
            rootQuery: this._rootQuery,
            context: props.context
        });
        this.routes.push(route);
        return this; // Для чейнинга
    }

    // Запуск роутера
    start() {
        // Обработка навигации по истории
        window.onpopstate = (event: PopStateEvent) => {
            const target = event.currentTarget as Window;
            this._onRoute(target.location.pathname);
        };

        this._onRoute(window.location.pathname); // Первоначальная загрузка
    }

    // Проверка авторизации
    private async checkAuth(): Promise<boolean> {
        try {
            const user = await authController.fetchUser();
            if (user) {
                store.set({ user }); // Обновляем store
                return true;
            }
            return false;
        } catch {
            return false;
        }
    }

    // Обработка перехода на маршрут
    private async _onRoute(pathname: string) {
        const isAuth = await this.checkAuth();

        // Редиректы для неавторизованных
        if (!isAuth && !['/', '/sign-up'].includes(pathname)) {
            this.go('/');
            return;
        }

        // Редиректы для авторизованных
        if (isAuth && ['/', '/sign-up'].includes(pathname)) {
            this.go('/messenger');
            return;
        }

        // Поиск маршрута
        const route = this.getRoute(pathname);
        if (!route) {
            this.go('/404');
            return;
        }

        // Переход на новый маршрут
        if (this._currentRoute) {
            this._currentRoute.leave();
        }
        this._currentRoute = route;
        route.render();
    }

    // Переход по пути
    go(pathname: string) {
        this.history.pushState({}, '', pathname);
        this._onRoute(pathname);
    }

    // Назад по истории
    back() {
        this.history.back();
    }

    // Вперед по истории
    forward() {
        this.history.forward();
    }

    // Поиск маршрута по пути
    getRoute(pathname: string) {
        return this.routes.find(route => route.match(pathname));
    }
}
