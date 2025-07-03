type RequestData = Record<string, any> | FormData;

class HTTPTransport {
    private baseUrl: string;

    constructor(baseUrl: string = '') {
        this.baseUrl = baseUrl;
    }

    get(url: string, data?: RequestData): Promise<XMLHttpRequest> {
        return this.request('GET', url, data);
    }

    post(url: string, data?: RequestData): Promise<XMLHttpRequest> {
        return this.request('POST', url, data);
    }

    put(url: string, data?: RequestData): Promise<XMLHttpRequest> {
        return this.request('PUT', url, data);
    }

    delete(url: string, data?: RequestData): Promise<XMLHttpRequest> {
        return this.request('DELETE', url, data);
    }

    private request(
        method: string,
        url: string,
        data?: RequestData
    ): Promise<XMLHttpRequest> {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            const fullUrl = this.baseUrl + url;

            // Для GET-запросов добавляем параметры в URL
            if (method === 'GET' && data) {
                const params = new URLSearchParams(data as Record<string, string>);
                xhr.open(method, `${fullUrl}?${params.toString()}`);
            } else {
                xhr.open(method, fullUrl);
            }

            xhr.onload = () => {
                // Успешные статусы 200-299
                if (xhr.status >= 200 && xhr.status < 300) {
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
            if (method !== 'GET' && data) {
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
