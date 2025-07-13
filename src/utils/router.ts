import Route from './route';

export default class Router {
    private static __instance: Router;
    private routes: Route[];
    private history: History;
    private _currentRoute: Route | null;
    private _rootQuery: string;

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

    use(pathname: string, block: any, props: { context?: Record<string, unknown> } = {}) {
        const route = new Route(pathname, block, {
            rootQuery: this._rootQuery,
            context: props.context
        });
        this.routes.push(route);
        return this;
    }

    start() {
        window.onpopstate = (event: PopStateEvent) => {
            const target = event.currentTarget as Window;
            this._onRoute(target.location.pathname);
        };

        this._onRoute(window.location.pathname);
    }

    private async _onRoute(pathname: string) {
        const route = this.getRoute(pathname);
        if (!route) {
            this.go('/404');
            return;
        }

        // Очищаем текущий роут
        if (this._currentRoute) {
            this._currentRoute.leave();
            await new Promise(resolve => setTimeout(resolve, 10)); // Микро-задержка
        }

        // Рендерим новый роут
        this._currentRoute = route;
        route.render();
    }

    go(pathname: string) {
        this.history.pushState({}, '', pathname);
        this._onRoute(pathname);
    }

    back() {
        this.history.back();
    }

    forward() {
        this.history.forward();
    }

    getRoute(pathname: string) {
        return this.routes.find(route => route.match(pathname));
    }
}
