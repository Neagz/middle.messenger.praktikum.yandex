type RequestData = Record<string, unknown> | FormData;

/* eslint-disable no-unused-vars */
enum HTTPMethod {
    GET = 'GET',
    POST = 'POST',
    PUT = 'PUT',
    DELETE = 'DELETE'
}
/* eslint-enable no-unused-vars */

/* eslint-disable no-unused-vars */
enum HttpStatus {
    OK = 200,
    Created = 201,
    Accepted = 202,
    NoContent = 204,
    BadRequest = 400,
    Unauthorized = 401,
    Forbidden = 403,
    NotFound = 404,
    InternalServerError = 500
}
/* eslint-enable no-unused-vars */

class HTTPTransport {
    private baseUrl: string;

    constructor(baseUrl: string = '') {
        this.baseUrl = baseUrl;
    }

    // Фабричный метод для создания HTTP-методов
    private createMethod(method: HTTPMethod) {
        return (url: string, data?: RequestData) => this.request(method, url, data);
    }

    // Методы HTTP, созданные через фабричный метод
    protected readonly get = this.createMethod(HTTPMethod.GET);
    protected readonly post = this.createMethod(HTTPMethod.POST);
    protected readonly put = this.createMethod(HTTPMethod.PUT);
    protected readonly delete = this.createMethod(HTTPMethod.DELETE);

    private request(
        method: HTTPMethod,
        url: string,
        data?: RequestData
    ): Promise<XMLHttpRequest> {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            const fullUrl = this.baseUrl + url;

            // Для GET-запросов добавляем параметры в URL
            if (method === HTTPMethod.GET && data) {
                const params = new URLSearchParams(data as Record<string, string>);
                xhr.open(method, `${fullUrl}?${params.toString()}`);
            } else {
                xhr.open(method, fullUrl);
            }

            xhr.onload = () => {
                // Проверка успешных статусов через enum
                if (
                    xhr.status === HttpStatus.OK ||
                    xhr.status === HttpStatus.Created ||
                    xhr.status === HttpStatus.Accepted ||
                    xhr.status === HttpStatus.NoContent ||
                    xhr.status === HttpStatus.BadRequest||
                    xhr.status === HttpStatus.Unauthorized||
                    xhr.status === HttpStatus.Forbidden||
                    xhr.status === HttpStatus.NotFound ||
                    xhr.status === HttpStatus.InternalServerError
                ) {
                    resolve(xhr);
                } else {
                    reject(xhr);
                }
            };

            // Обработка ошибок
            xhr.onabort = () => reject(xhr);
            xhr.onerror = () => reject(xhr);
            xhr.ontimeout = () => reject(xhr);

            // Для не-GET запросов отправляем данные в теле
            if (method !== HTTPMethod.GET && data) {
                // Если это FormData (например, файл)
                if (data instanceof FormData) {
                    xhr.send(data);
                }
                // Если обычные данные
                else {
                    xhr.setRequestHeader('Content-Type', 'application/json');
                    xhr.send(JSON.stringify(data));
                }
            } else {
                xhr.send();
            }
        });
    }
}

export default HTTPTransport;
