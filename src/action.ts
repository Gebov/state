export interface Action<TData> {
    name: string,
    data?: TData
};
