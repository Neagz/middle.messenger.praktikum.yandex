/// <reference types="vite/client" />

declare module '*.module.css' {
    const classes: { [key: string]: string };
    export default classes;
}

declare module '*.hbs' {
    const template: string;
    export default template;
}
