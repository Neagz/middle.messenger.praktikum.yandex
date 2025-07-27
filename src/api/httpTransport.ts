import { store } from '../core/store';

type PlainObject = Record<string, unknown>;
type RequestData = PlainObject | FormData;

// Перечисление HTTP методов
/* eslint-disable no-unused-vars */
enum HTTPMethod {
    GET = 'GET',
    POST = 'POST',
    PUT = 'PUT',
    DELETE = 'DELETE'
}
/* eslint-enable no-unused-vars */

// Класс для выполнения HTTP-запросов
class HTTPTransport {
    private baseUrl: string = 'https://ya-praktikum.tech/api/v2'; // Базовый URL для всех запросов

    // Базовый метод для выполнения запросов
    private request<T>(
        method: HTTPMethod,
        url: string,
        data?: RequestData
    ): Promise<T> {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            const fullUrl = this.baseUrl + url;

            // 1. Сначала открываем соединение
            xhr.open(method, fullUrl);

            // 2. Затем устанавливаем заголовки
            xhr.withCredentials = true;

            xhr.responseType = 'json';

            if (method !== HTTPMethod.GET && data && !(data instanceof FormData)) {
                xhr.setRequestHeader('Content-Type', 'application/json');
            }

            // Обработчики событий
            xhr.onload = () => {
                if (xhr.status === 401) {
                    store.set({ user: null });
                    reject(new Error('Unauthorized'));
                    return;
                }
                if (xhr.status >= 200 && xhr.status < 300) {
                    resolve(xhr.response as T);
                } else {
                    reject(new Error(xhr.response?.reason || 'Request failed'));
                }
            };

            xhr.onerror = () => reject(new Error('Network error'));
            xhr.ontimeout = () => reject(new Error('Request timeout'));

            // 3. Отправляем данные
            if (method === HTTPMethod.GET || !data) {
                xhr.send();
            } else {
                xhr.send(data instanceof FormData ? data : JSON.stringify(data));
            }
        });
    }

    // Публичные методы для каждого HTTP-метода
    public get<T>(url: string, data?: RequestData): Promise<T> {
        return this.request<T>(HTTPMethod.GET, url, data);
    }

    public post<T>(url: string, data?: RequestData): Promise<T> {
        return this.request<T>(HTTPMethod.POST, url, data);
    }

    public put<T>(url: string, data?: RequestData): Promise<T> {
        return this.request<T>(HTTPMethod.PUT, url, data);
    }

    public delete<T>(url: string, data?: RequestData): Promise<T> {
        return this.request<T>(HTTPMethod.DELETE, url, data);
    }
}

export default HTTPTransport;