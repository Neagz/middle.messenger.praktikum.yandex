export type Indexed<T = unknown> = {
    [_key in string]: T;
};
