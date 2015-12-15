'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.simpleDataStorage = exports.loaders = exports.store = exports.actions = undefined;

require('babel-polyfill');

var _store = require('./store');

var _actions = require('./actions');

var actions = _interopRequireWildcard(_actions);

var _loaders = require('./loaders');

var loaders = _interopRequireWildcard(_loaders);

var _simpleDataStorage = require('./utils/simpleDataStorage');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

var store = (0, _store.configureStore)();

exports.actions = actions;
exports.store = store;
exports.loaders = loaders;
exports.simpleDataStorage = _simpleDataStorage.simpleDataStorage;