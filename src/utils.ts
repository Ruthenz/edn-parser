export type EDNValue = undefined | 
                        null | 
                        boolean | 
                        string | 
                        number | 
                        EDNValue[] | 
                        { [key: string]: EDNValue };

export interface stringifyOptions {
  spaces: number
}

export function assert(condition: any, {
  msg,
  action
}: {
  msg?: string,
  action?: () => void
}): asserts condition {
  if (!condition) {
    if (action) action();
    else if (msg) throw new Error(msg);
  }
}
