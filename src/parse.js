"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = require("./utils");
function parse(str) {
    var i = 0;
    var value = parseValue();
    expectEndOfInput();
    return value;
    function parseValue() {
        var _a, _b, _c, _d, _e;
        skipWhitespaces();
        var value = (_e = (_d = (_c = (_b = (_a = parseString()) !== null && _a !== void 0 ? _a : parseNumber()) !== null && _b !== void 0 ? _b : parseBoolean()) !== null && _c !== void 0 ? _c : parseArrayOrList()) !== null && _d !== void 0 ? _d : parseObject()) !== null && _e !== void 0 ? _e : parseNil(); // important at the end
        skipWhitespaces();
        return value;
    }
    function parseString() {
        if (str[i] === '"') {
            i++;
            var result = "";
            while (i < str.length && str[i] !== '"') {
                if (str[i] === "\\") {
                    var char = str[i + 1];
                    if (char === '"' ||
                        char === "\\" ||
                        char === "/" ||
                        char === "b" ||
                        char === "f" ||
                        char === "n" ||
                        char === "r" ||
                        char === "t") {
                        result += char;
                        i++;
                    }
                    else if (char === "u") {
                        if (isHexadecimal(str[i + 2]) &&
                            isHexadecimal(str[i + 3]) &&
                            isHexadecimal(str[i + 4]) &&
                            isHexadecimal(str[i + 5])) {
                            result += String.fromCharCode(parseInt(str.slice(i + 2, i + 6), 16));
                            i += 5;
                        }
                        else {
                            i += 2;
                            expectEscapeUnicode(result);
                        }
                    }
                    else {
                        expectEscapeCharacter(result);
                    }
                }
                else {
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
        var start = i;
        var fractionalBarPosition;
        if (str[i] === "-") {
            i++;
            expectDigit(str.slice(start, i));
        }
        if (str[i] === "0") {
            i++;
        }
        else if (str[i] >= "1" && str[i] <= "9") {
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
        }
        else if (str[i] === ".") {
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
                var numerator = Number(str.slice(start, fractionalBarPosition));
                var denominator = Number(str.slice(fractionalBarPosition + 1, i));
                return numerator / denominator;
            }
            else {
                return Number(str.slice(start, i));
            }
        }
    }
    function parseBoolean() {
        if (str.slice(i, i + 4) === 'true') {
            i += 4;
            return true;
        }
        else if (str.slice(i, i + 5) === 'false') {
            i += 5;
            return false;
        }
    }
    function parseNil() {
        var nil = 'nil';
        if (str.slice(i, i + nil.length) === nil) {
            i += nil.length;
            return null;
        }
    }
    function parseArrayOrList() {
        var bracketsDict = {
            '[': ']',
            '(': ')'
        };
        var opener = str[i];
        var closer = bracketsDict[opener];
        if (closer) {
            i++;
            skipWhitespaces();
            var result = [];
            var initial = true;
            while (i < str.length && str[i] !== closer) {
                if (!initial) {
                    skipWhitespaces();
                }
                var value_1 = parseValue();
                result.push(value_1);
                initial = false;
            }
            expectNotEndOfInput(closer);
            i++;
            return result;
        }
    }
    function parseObject() {
        var _a;
        if (str[i] === "{") {
            i++;
            skipWhitespaces();
            var result = {};
            var initial = true;
            while (i < str.length && str[i] !== "}") {
                if (!initial) {
                    skipWhitespaces();
                }
                var key = (_a = parseString()) !== null && _a !== void 0 ? _a : parseKeyword();
                (0, utils_1.assert)(key !== undefined, { action: expectObjectKey });
                skipWhitespaces();
                var value_2 = parseValue();
                result[key] = value_2;
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
            var result = "";
            while (i < str.length && str[i] !== ' ') {
                result += str[i];
                i++;
            }
            expectNotEndOfInput(' ');
            i++;
            return result;
        }
    }
    function isHexadecimal(char) {
        return ((char >= "0" && char <= "9") ||
            (char.toLowerCase() >= "a" && char.toLowerCase() <= "f"));
    }
    function skipWhitespaces() {
        var whiteSpaces = [' ', ',', '\n', '\t', '\r'];
        while (whiteSpaces.includes(str[i]))
            i++;
    }
    // error handling
    function expectNotEndOfInput(expected) {
        if (i === str.length) {
            printCodeSnippet("Expecting a `" + expected + "` here");
            throw new Error("EDN_ERROR_0001 Unexpected End of Input");
        }
    }
    function expectEndOfInput() {
        if (i < str.length) {
            printCodeSnippet("Expecting to end here");
            throw new Error("EDN_ERROR_0002 Expected End of Input");
        }
    }
    function expectObjectKey() {
        printCodeSnippet("Expecting object key here\n\nFor example:\n{ \"foo\" \"bar\" }\n{ :foo \"bar\" }\n  ^^^^^");
        throw new Error("EDN_ERROR_0003 Expecting EDN Key");
    }
    function expectDigit(numSoFar) {
        if (!(str[i] >= "0" && str[i] <= "9")) {
            printCodeSnippet("EDN_ERROR_0004 Expecting a digit here\n\nFor example:\n" + numSoFar + "5\n" + " ".repeat(numSoFar.length) + "^");
            throw new Error("EDN_ERROR_0005 Expecting a digit");
        }
    }
    function expectEscapeCharacter(strSoFar) {
        printCodeSnippet("EDN_ERROR_0006 Expecting escape character\n\nFor example:\n\"" + strSoFar + "\\n\"\n" + " ".repeat(strSoFar.length + 1) + "^^\nList of escape characters are: \\\", \\\\, \\/, \\b, \\f, \\n, \\r, \\t, \\u");
        throw new Error("EDN_ERROR_0007 Expecting an escape character");
    }
    function expectEscapeUnicode(strSoFar) {
        printCodeSnippet("Expect escape unicode\n\nFor example:\n\"" + strSoFar + "\\u0123\n" + " ".repeat(strSoFar.length + 1) + "^^^^^^");
        throw new Error("EDN_ERROR_0008 Expecting an escape unicode");
    }
    // function expectCharacter(expected: string) {
    //   if (str[i] !== expected) {
    //     printCodeSnippet(`Expecting a \`${expected}\` here`);
    //     throw new Error("EDN_ERROR_0009 Unexpected token");
    //   }
    // }
    function printCodeSnippet(message) {
        var from = Math.max(0, i - 10);
        var trimmed = from > 0;
        var padding = (trimmed ? 4 : 0) + (i - from);
        var snippet = [
            (trimmed ? "... " : "") + str.slice(from, i + 1),
            " ".repeat(padding) + "^",
            " ".repeat(padding) + message
        ].join("\n");
        console.log(snippet);
    }
}
exports.default = parse;
