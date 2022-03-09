import { EDNValue } from './utils';
export default function parse(str: string): string | number | boolean | EDNValue[] | {
    [key: string]: EDNValue;
} | null | undefined;
