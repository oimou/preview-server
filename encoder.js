"use strict";

var encode = function (str) {
    return str.replace(/\//g, '..');
};
var decode = function (str) {
    return str.replace(/\.\./g, '/');
};

module.exports = {
    encode: encode,
    decode: decode
};
