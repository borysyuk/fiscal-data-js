'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getAllowedColumns = getAllowedColumns;
exports.getDimensions = getDimensions;
exports.getModelFromFDP = getModelFromFDP;

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function getDimensionsColumnName(state) {
  return _lodash2.default.keys(state.data.model.dimensions);
}

function getAllowedColumns(model) {
  return _lodash2.default.union(_lodash2.default.keys(model.dimensions), _lodash2.default.keys(model.measures));
}

function getDimensions(state) {
  var result = {};
  var columns = getDimensionsColumnName(state);

  _lodash2.default.forEach(columns, function (item) {
    result[item] = _lodash2.default.uniq(_lodash2.default.pluck(state.data.values, item)).sort();
  });

  return result;
}

function getModelFromFDP(fdp) {
  var result = { schema: {}, measures: {}, dimensions: {} };
  var schema = {};
  if (fdp.resources[0].schema.fields.length) {
    _lodash2.default.forEach(fdp.resources[0].schema.fields, function (field) {
      schema[field.name] = field;
    });
    result.schema = schema;
  }

  _lodash2.default.forEach(fdp.mapping.measures, function (measure) {
    result.measures[measure.source] = { 'currency': measure.currency };
  });

  _lodash2.default.forEach(fdp.mapping.dimensions, function (dimension) {
    _lodash2.default.forEach(dimension.attributes, function (attribute) {
      var field = _lodash2.default.first(_lodash2.default.values(attribute));
      result.dimensions[field] = { 'type': _lodash2.default.first(_lodash2.default.keys(attribute)) };
    });
  });

  return result;
}