export const validationRules = {
    name: (value: string) => /^[A-ZА-ЯЁ][a-zа-яё-]*$/.test(value),
    login: (value: string) => /^(?=.*[a-zA-Z])[a-zA-Z0-9_-]{3,20}$/.test(value),
    email: (value: string) => /^[a-zA-Z0-9._-]+@[a-zA-Z]+\.[a-zA-Z]+$/.test(value),
    password: (value: string) => /^(?=.*[A-Z])(?=.*\d).{8,40}$/.test(value),
    phone: (value: string) => /^\+?\d{10,15}$/.test(value),
    message: (value: string) => value.trim().length > 0
};

export type ValidationRule = keyof typeof validationRules;
