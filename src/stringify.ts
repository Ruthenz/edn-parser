import { EDNValue, stringifyOptions } from './utils';

function getIndentation(seperator: string = '', level: number = 1) {
  return (seperator.length) ? `\n${seperator.repeat(level)}` : '';
}

function notUndefined(value: EDNValue) {
  return value !== undefined;
}

export default function stringify(edn: EDNValue, { 
  spaces = 0
}: stringifyOptions = {
  spaces: 0
}): string | undefined {
  const seperator = ' '.repeat(spaces);

  function parse(edn: EDNValue, level: number = 1): string | undefined {
    const type = typeof edn;
    
    if (edn === undefined) return undefined;
    if (edn === null) return 'nil';
    if (type === 'number' || type === 'boolean') return `${edn}`;
    if (type === 'string') return `"${edn}"`;

    const thisLevelIndentation = getIndentation(seperator, level);
    const lowerLevelIndentation = getIndentation(seperator, level-1);
    const joinIndentation = spaces ? thisLevelIndentation : ' ';

    if (Array.isArray(edn)) {
      const deeplyParsedArray = edn.filter(notUndefined).map((v) => parse(v, level+1));
      return [
        '[',
        thisLevelIndentation,
        deeplyParsedArray.join(joinIndentation),
        lowerLevelIndentation,
        ']'
      ].join('');
    }
    
    const entries = Object.entries(edn);
    const EDNKeyValueFromEntries = entries.filter(([_,v]) => notUndefined(v)).map(([k,v]) => `:${k} ${parse(v, level+1)}`);
    return [
      '{',
      thisLevelIndentation,
      EDNKeyValueFromEntries.join(joinIndentation),
      lowerLevelIndentation,
      '}'
    ].join('');
  }
  
  return parse(edn);
}
