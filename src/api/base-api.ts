import HTTPTransport from "./httpTransport";

// Базовый класс для всех API модулей
export abstract class BaseAPI {
    protected readonly http = new HTTPTransport();

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
