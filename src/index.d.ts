import { EDNValue, stringifyOptions } from './utils';
export default class EDN {
    static parse(ednString: string): string | number | boolean | EDNValue[] | {
        [key: string]: EDNValue;
    } | null | undefined;
    static stringify(edn: EDNValue, options?: stringifyOptions): string | undefined;
    static compress(ednString: string): string;
}
