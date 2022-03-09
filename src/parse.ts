import { EDNValue, assert } from './utils';

export default function parse(str: string) {
  let i = 0;

  const value = parseValue();
  expectEndOfInput();

  return value;

  function parseValue() {
    skipWhitespaces();
    const value =
      parseString() ??
      parseNumber() ??
      parseBoolean() ??
      parseArrayOrList() ??
      parseObject() ?? 
      parseNil(); // important at the end
    skipWhitespaces();

    return value;
  }

  function parseString() {
    if (str[i] === '"') {
      i++;
      let result = "";
      while (i < str.length && str[i] !== '"') {
        if (str[i] === "\\") {
          const char = str[i + 1];
          if (
            char === '"' ||
            char === "\\" ||
            char === "/" ||
            char === "b" ||
            char === "f" ||
            char === "n" ||
            char === "r" ||
            char === "t"
          ) {
            result += char;
            i++;
          } else if (char === "u") {
            if (
              isHexadecimal(str[i + 2]) &&
              isHexadecimal(str[i + 3]) &&
              isHexadecimal(str[i + 4]) &&
              isHexadecimal(str[i + 5])
            ) {
              result += String.fromCharCode(
                parseInt(str.slice(i + 2, i + 6), 16)
              );
              i += 5;
            } else {
              i += 2;
              expectEscapeUnicode(result);
            }
          } else {
            expectEscapeCharacter(result);
          }
        } else {
          result += str[i];
        }
        i++;
      }
      expectNotEndOfInput('"');
      i++;
      return result;
    }
  }

  function parseNumber() {
    const start = i;
    let fractionalBarPosition;
    if (str[i] === "-") {
      i++;
      expectDigit(str.slice(start, i));
    }
    if (str[i] === "0") {
      i++;
    } else if (str[i] >= "1" && str[i] <= "9") {
      i++;
      while (str[i] >= "0" && str[i] <= "9") {
        i++;
      }
    }
    if (str[i] === "/") { // take care of ratios
      fractionalBarPosition = i;
      i++;
      expectDigit(str.slice(start, i));
      while (str[i] >= "0" && str[i] <= "9") {
        i++;
      }
    } else if (str[i] === ".") {
      i++;
      expectDigit(str.slice(start, i));
      while (str[i] >= "0" && str[i] <= "9") {
        i++;
      }

      if (str[i] === "e" || str[i] === "E") {
        i++;
        if (str[i] === "-" || str[i] === "+") {
          i++;
        }
        expectDigit(str.slice(start, i));
        while (str[i] >= "0" && str[i] <= "9") {
          i++;
        }
      }
    }
    if (i > start) {
      if (fractionalBarPosition) {
        const numerator = Number(str.slice(start, fractionalBarPosition));
        const denominator = Number(str.slice(fractionalBarPosition+1, i));
        return numerator/denominator;
      } else {
        return Number(str.slice(start, i));
      }
    }
  }

  function parseBoolean() {
    if (str.slice(i, i + 4) === 'true') {
      i += 4;
      return true;
    } else if (str.slice(i, i + 5) === 'false') {
      i += 5;
      return false;
    }
  }

  function parseNil() {
    const nil = 'nil';
    if (str.slice(i, i + nil.length) === nil) {
      i += nil.length;
      return null;
    }
  }

  function parseArrayOrList() {
    const bracketsDict: { [key: string]: string } = {
      '[': ']',
      '(': ')'
    };
    const opener = str[i];
    const closer = bracketsDict[opener];

    if (closer) {
      i++;
      skipWhitespaces();

      const result: EDNValue[] = [];
      let initial = true;

      while (i < str.length && str[i] !== closer) {
        if (!initial) {
          skipWhitespaces();
        }
        const value = parseValue();
        result.push(value);
        initial = false;
      }

      expectNotEndOfInput(closer);
      i++;
      return result;
    }
  }

  function parseObject() {
    if (str[i] === "{") {
      i++;
      skipWhitespaces();

      const result: { [key: string]: EDNValue } = {};
      let initial = true;

      while (i < str.length && str[i] !== "}") {
        if (!initial) {
          skipWhitespaces();
        }
        const key = parseString() ?? parseKeyword();
        assert(key !== undefined, { action: expectObjectKey });
        skipWhitespaces();
        const value = parseValue();
        result[key] = value;
        initial = false;
      }
      expectNotEndOfInput("}");
      i++;

      return result;
    }
  }

  function parseKeyword() {
    if (str[i] === ':') {
      i++;
      let result = "";
      while (i < str.length && str[i] !== ' ') {
        result += str[i];
        i++;
      }
      expectNotEndOfInput(' ');
      i++;
      return result;
    }
  }

  function isHexadecimal(char: string) {
    return (
      (char >= "0" && char <= "9") ||
      (char.toLowerCase() >= "a" && char.toLowerCase() <= "f")
    );
  }

  function skipWhitespaces() {
    const whiteSpaces = [' ', ',', '\n', '\t', '\r'];
    while (whiteSpaces.includes(str[i])) i++;
  }

  // error handling
  function expectNotEndOfInput(expected: string) {
    if (i === str.length) {
      printCodeSnippet(`Expecting a \`${expected}\` here`);
      throw new SyntaxError("EDN_ERROR_0001 Unexpected End of Input");
    }
  }

  function expectEndOfInput() {
    if (i < str.length) {
      printCodeSnippet("Expecting to end here");
      throw new SyntaxError("EDN_ERROR_0002 Expected End of Input");
    }
  }

  function expectObjectKey(): void {
    printCodeSnippet(`Expecting object key here

For example:
{ "foo" "bar" }
{ :foo "bar" }
  ^^^^^`);
    throw new SyntaxError("EDN_ERROR_0003 Expecting EDN Key");
  }


  function expectDigit(numSoFar: string) {
    if (!(str[i] >= "0" && str[i] <= "9")) {
      printCodeSnippet(`EDN_ERROR_0004 Expecting a digit here

For example:
${numSoFar}5
${" ".repeat(numSoFar.length)}^`);
      throw new SyntaxError("EDN_ERROR_0005 Expecting a digit");
    }
  }

  function expectEscapeCharacter(strSoFar: string) {
    printCodeSnippet(`EDN_ERROR_0006 Expecting escape character

For example:
"${strSoFar}\\n"
${" ".repeat(strSoFar.length + 1)}^^
List of escape characters are: \\", \\\\, \\/, \\b, \\f, \\n, \\r, \\t, \\u`);
    throw new SyntaxError("EDN_ERROR_0007 Expecting an escape character");
  }

  function expectEscapeUnicode(strSoFar: string) {
    printCodeSnippet(`Expect escape unicode

For example:
"${strSoFar}\\u0123
${" ".repeat(strSoFar.length + 1)}^^^^^^`);
    throw new SyntaxError("EDN_ERROR_0008 Expecting an escape unicode");
  }

  // function expectCharacter(expected: string) {
  //   if (str[i] !== expected) {
  //     printCodeSnippet(`Expecting a \`${expected}\` here`);
  //     throw new SyntaxError("EDN_ERROR_0009 Unexpected token");
  //   }
  // }

  function printCodeSnippet(message: string) {
    const from = Math.max(0, i - 10);
    const trimmed = from > 0;
    const padding = (trimmed ? 4 : 0) + (i - from);
    const snippet = [
      (trimmed ? "... " : "") + str.slice(from, i + 1),
      " ".repeat(padding) + "^",
      " ".repeat(padding) + message
    ].join("\n");
    console.log(snippet);
  }
}
