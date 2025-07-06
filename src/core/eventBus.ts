type Handler = (..._args: unknown[]) => void; // Тип для обработчиков событий

export class EventBus {
    private listeners: Record<string, Handler[]> = {}; // Хранилище обработчиков

    // Подписка на событие
    on(event: string, callback: Handler) {
        if (!this.listeners[event]) this.listeners[event] = []; // Инициализация массива
        this.listeners[event].push(callback); // Добавление обработчика
    }

    // Отписка от события
    off(event: string, callback: Handler) {
        if (!this.listeners[event]) throw new Error(`Нет события: ${event}`);
        this.listeners[event] = this.listeners[event].filter(
            listener => listener !== callback // Фильтрация обработчиков
        );
    }

    // Инициирование события
    emit(event: string, ...args: unknown[]) {
        if (!this.listeners[event]) return; // Проверка наличия
        this.listeners[event].forEach(listener => listener(...args)); // Вызов обработчиков
    }
}

// Добавляем именованный экспорт
export default EventBus;
