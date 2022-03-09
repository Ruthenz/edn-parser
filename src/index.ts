import compressEDN from './compress';
import stringifyEDN from './stringify';
import parseEDN from './parse';
import { EDNValue, stringifyOptions } from './utils';

class EDN {
  static parse(ednString: string) {
    return parseEDN(ednString);
  }

  static stringify(edn: EDNValue, options?: stringifyOptions) {
    return stringifyEDN(edn, options);
  }

  static compress(ednString: string) {
    return compressEDN(ednString);
  }
}

export default EDN;
export { EDN };
