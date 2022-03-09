"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var compress_1 = require("./compress");
var stringify_1 = require("./stringify");
var parse_1 = require("./parse");
var EDN = /** @class */ (function () {
    function EDN() {
    }
    EDN.parse = function (ednString) {
        return (0, parse_1.default)(ednString);
    };
    EDN.stringify = function (edn, options) {
        return (0, stringify_1.default)(edn, options);
    };
    EDN.compress = function (ednString) {
        return (0, compress_1.default)(ednString);
    };
    return EDN;
}());
exports.default = EDN;
