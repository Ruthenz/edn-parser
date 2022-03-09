"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function compress(map) {
    return map
        .trim()
        .replaceAll('\n', '') // gets rid of new lines
        .replace(/\s\s+/g, ' ') // shrinks multiple spaces (including tabs) into one space
        .replace(/(\(|\))(?=([^"]*"[^"]*")*[^"]*$)/g, function (rep) { return rep === '(' ? '[' : ']'; }) // replaces (,) to [,] when not inside a string
        .replace(/({ | }|\[ | \])(?=([^"]*"[^"]*")*[^"]*$)/g, function (rep) { return rep.trim(); }); // trims spaces left over around brackets when not inside a string
}
exports.default = compress;
