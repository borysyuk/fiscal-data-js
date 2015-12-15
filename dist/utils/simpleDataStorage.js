'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.simpleDataStorage = undefined;

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function createDataStorage() {
  this.storage = {};
  this.index = 0;

  this.set = function (data) {
    var key = 'key' + this.index++;
    this.storage[key] = data;
    return key;
  };

  this.get = function (key) {
    return this.storage[key];
  };
}

var simpleDataStorage = exports.simpleDataStorage = new createDataStorage();