export declare type EDNValue = undefined | null | boolean | string | number | EDNValue[] | {
    [key: string]: EDNValue;
};
export interface stringifyOptions {
    spaces: number;
}
export declare function assert(condition: any, { msg, action }: {
    msg?: string;
    action?: () => void;
}): asserts condition;
