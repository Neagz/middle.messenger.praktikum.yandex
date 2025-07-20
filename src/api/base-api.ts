import HTTPTransport from "./httpTransport";

// Базовый класс для всех API модулей
export class BaseAPI {
    protected http: HTTPTransport;

    constructor() {
        this.http = new HTTPTransport();
    }

    // Базовые CRUD методы (могут быть переопределены в дочерних классах)
    create(data: unknown): Promise<unknown> {
        return this.http.post('/', { data });
    }

    request(): Promise<unknown> {
        return this.http.get('/');
    }

    update(data: unknown): Promise<unknown> {
        return this.http.put('/', { data });
    }

    delete(): Promise<unknown> {
        return this.http.delete('/');
    }
}
