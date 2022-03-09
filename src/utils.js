"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assert = void 0;
function assert(condition, _a) {
    var msg = _a.msg, action = _a.action;
    if (!condition) {
        if (action)
            action();
        else if (msg)
            throw new Error(msg);
    }
}
exports.assert = assert;
