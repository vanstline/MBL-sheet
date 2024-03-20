"use strict";

require("./utils/math");
var _core = require("./core");
var _polyfill = _interopRequireDefault(require("./utils/polyfill"));
function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {
    "default": obj
  };
}
// Prevent gulp warning: 'Use of eval is strongly discouraged, as it poses security risks and may cause issues with minification'
// window.evall = window.eval;
// polyfill event in firefox
if (window.addEventListener && navigator.userAgent.indexOf("Firefox") > 0) {
  (0, _polyfill["default"])();
}

// export default MBLsheet;

// use esbuild,bundle iife format
module.exports = _core.MBLsheet;