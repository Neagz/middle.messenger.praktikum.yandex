declare module 'handlebars' {
    interface HelperOptions {
        hash: Record<string, unknown>;
    }
}
