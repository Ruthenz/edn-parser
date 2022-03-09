"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function getIndentation(seperator, level) {
    if (seperator === void 0) { seperator = ''; }
    if (level === void 0) { level = 1; }
    return (seperator.length) ? "\n" + seperator.repeat(level) : '';
}
function notUndefined(value) {
    return value !== undefined;
}
function stringify(edn, _a) {
    var _b = _a === void 0 ? {
        spaces: 0
    } : _a, _c = _b.spaces, spaces = _c === void 0 ? 0 : _c;
    var seperator = ' '.repeat(spaces);
    function parse(edn, level) {
        if (level === void 0) { level = 1; }
        var type = typeof edn;
        if (edn === undefined)
            return undefined;
        if (edn === null)
            return 'nil';
        if (type === 'number' || type === 'boolean')
            return "" + edn;
        if (type === 'string')
            return "\"" + edn + "\"";
        var thisLevelIndentation = getIndentation(seperator, level);
        var lowerLevelIndentation = getIndentation(seperator, level - 1);
        var joinIndentation = spaces ? thisLevelIndentation : ' ';
        if (Array.isArray(edn)) {
            if (!edn.length)
                return '[]';
            var deeplyParsedArray = edn.filter(notUndefined).map(function (v) { return parse(v, level + 1); });
            return [
                '[',
                thisLevelIndentation,
                deeplyParsedArray.join(joinIndentation),
                lowerLevelIndentation,
                ']'
            ].join('');
        }
        var entries = Object.entries(edn);
        var EDNKeyValueFromEntries = entries.filter(function (_a) {
            var _ = _a[0], v = _a[1];
            return notUndefined(v);
        }).map(function (_a) {
            var k = _a[0], v = _a[1];
            return ":" + k + " " + parse(v, level + 1);
        });
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
exports.default = stringify;
