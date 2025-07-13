import type { Indexed } from './types';

// isEqual
export function isEqual(a: unknown, b: unknown): boolean {
    // Сравнение примитивов и ссылок
    if (a === b) return true;

    // Проверка на null/undefined и typeof object
    if (a === null || b === null || a === undefined || b === undefined) {
        return false;
    }

    // Проверка что оба значения - объекты
    if (typeof a !== 'object' || typeof b !== 'object') {
        return false;
    }

    // Приведение типов после проверок
    const objA = a as Record<string, unknown>;
    const objB = b as Record<string, unknown>;

    // Проверка на разные конструкторы
    if (objA.constructor !== objB.constructor) {
        return false;
    }

    // Сравнение массивов
    if (Array.isArray(objA) && Array.isArray(objB)) {
        if (objA.length !== objB.length) return false;
        for (let i = 0; i < objA.length; i++) {
            if (!isEqual(objA[i], objB[i])) return false;
        }
        return true;
    }

    // Сравнение дат
    if (objA instanceof Date && objB instanceof Date) {
        return objA.getTime() === objB.getTime();
    }

    // Сравнение объектов
    const keysA = Object.keys(objA);
    const keysB = Object.keys(objB);

    if (keysA.length !== keysB.length) {
        return false;
    }

    for (const key of keysA) {
        if (!Object.prototype.hasOwnProperty.call(objB, key)) {
            return false;
        }
        if (!isEqual(objA[key], objB[key])) {
            return false;
        }
    }

    return true;
}

// merge
function isObject(item: unknown): item is Indexed {
    return item !== null && typeof item === 'object' && !Array.isArray(item);
}

export function merge(lhs: Indexed, rhs: Indexed): Indexed {
    const result: Indexed = { ...lhs };

    for (const key in rhs) {
        if (!Object.prototype.hasOwnProperty.call(rhs, key)) continue;

        try {
            if (isObject(rhs[key]) && isObject(lhs[key])) {
                result[key] = merge(lhs[key] as Indexed, rhs[key] as Indexed);
            } else {
                result[key] = rhs[key];
            }
        } catch {
            result[key] = rhs[key];
        }
    }

    return result;
}

// set
function isPlainObject(value: unknown): value is Indexed {
    return typeof value === 'object'
        && value !== null
        && value.constructor === Object
        && Object.prototype.toString.call(value) === '[object Object]';
}

export function set(object: Indexed | unknown, path: string, value: unknown): Indexed | unknown {
    // Если передан не объект, возвращаем как есть
    if (!isPlainObject(object)) {
        return object;
    }

    // Разбиваем путь на части
    const keys = path.split('.');
    const newObject = { ...object }; // Создаём копию объекта

    let current: Indexed = newObject;

    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];

        // Если это последний ключ - устанавливаем значение
        if (i === keys.length - 1) {
            current[key] = value;
        } else {
            // Если промежуточного ключа нет или он не объект - создаём новый объект
            if (!current[key] || !isPlainObject(current[key])) {
                current[key] = {};
            }
            // Переходим на следующий уровень вложенности
            current = current[key] as Indexed;
        }
    }

    return newObject;
}

// trim
export function trim(str: string, chars?: string): string {
    if (!chars) {
        // Удаляем стандартные пробельные символы (включая \xA0 — неразрывный пробел)
        return str.replace(/^[\s\xA0]+|[\s\xA0]+$/g, '');
    } else {
        // Экранируем специальные символы RegExp, чтобы они воспринимались как обычные
        const escapedChars = chars.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        // Создаём регулярное выражение для удаления chars с начала и конца строки
        const regex = new RegExp(`^[${escapedChars}]+|[${escapedChars}]+$`, 'g');
        return str.replace(regex, '');
    }
}

// cloneDeep
export function cloneDeep<T extends object = object>(obj: T): T {
    // Обработка примитивов (хотя тип T extends object, оставим для защиты)
    if (typeof obj !== 'object' || obj === null) {
        return obj;
    }

    // Обработка массивов
    if (Array.isArray(obj)) {
        return obj.map(item => cloneDeep(item)) as unknown as T;
    }

    // Обработка Date
    if (obj instanceof Date) {
        return new Date(obj.getTime()) as unknown as T;
    }

    // Обработка Set
    if (obj instanceof Set) {
        const clonedSet = new Set();
        obj.forEach(value => clonedSet.add(cloneDeep(value)));
        return clonedSet as unknown as T;
    }

    // Обработка Map
    if (obj instanceof Map) {
        const clonedMap = new Map();
        obj.forEach((value, key) => clonedMap.set(key, cloneDeep(value)));
        return clonedMap as unknown as T;
    }

    // Обработка обычных объектов
    const clonedObj: Record<string, unknown> = {};

    // Копируем все свойства, включая символы
    const props = [
        ...Object.getOwnPropertyNames(obj),
        ...Object.getOwnPropertySymbols(obj)
    ];

    for (const prop of props) {
        const descriptor = Object.getOwnPropertyDescriptor(obj, prop);
        if (descriptor) {
            if ('value' in descriptor) {
                // Копируем значение с рекурсивным клонированием
                descriptor.value = cloneDeep(descriptor.value);
            }
            Object.defineProperty(clonedObj, prop, descriptor);
        }
    }

    // Копируем прототип
    Object.setPrototypeOf(clonedObj, Object.getPrototypeOf(obj));

    return clonedObj as T;
}

// queryStringify
type StringIndexed = Record<string, any>;

export function queryStringify(data: StringIndexed): string | never {
    if (typeof data !== 'object' || data === null) {
        throw new Error('Input must be an object');
    }

    const pairs: string[] = [];

    const processValue = (currentKey: string, value: any): void => {
        if (value === null || value === undefined) {
            pairs.push(`${encodeURIComponent(currentKey)}=`);
            return;
        }

        if (Array.isArray(value)) {
            if (value.length === 0) {
                pairs.push(`${encodeURIComponent(currentKey)}[]=`);
            } else {
                value.forEach((item, index) => {
                    processValue(`${currentKey}[${index}]`, item);
                });
            }
        } else if (typeof value === 'object') {
            const keys = Object.keys(value);
            if (keys.length === 0) {
                pairs.push(`${encodeURIComponent(currentKey)}={}`);
            } else {
                keys.forEach(key => {
                    processValue(`${currentKey}[${encodeURIComponent(key)}]`, value[key]);
                });
            }
        } else {
            pairs.push(
                `${encodeURIComponent(currentKey)}=${encodeURIComponent(
                    typeof value === 'boolean' ? String(Number(value)) : String(value)
                )}`
            );
        }
    };

    Object.keys(data).forEach(key => {
        processValue(encodeURIComponent(key), data[key]);
    });

    return pairs.join('&');
}
