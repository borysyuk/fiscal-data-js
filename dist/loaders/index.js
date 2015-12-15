'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.csv = csv;
exports.fdp = fdp;
exports.getCurrentData = getCurrentData;

require('isomorphic-fetch');

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _papaparse = require('papaparse');

var _papaparse2 = _interopRequireDefault(_papaparse);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _utils = require('../utils');

var utils = _interopRequireWildcard(_utils);

var _simpleDataStorage = require('../utils/simpleDataStorage');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _typeof(obj) { return obj && typeof Symbol !== "undefined" && obj.constructor === Symbol ? "symbol" : typeof obj; }

var papaOptions = {
  header: true,
  skipEmptyLines: true,
  delimiter: ',',
  download: true,
  chunkSize: 2000000000
};

function makeModelStateTree(data, model) {
  _lodash2.default.forEach(_lodash2.default.keys(model.dimensions), function (key) {
    model.dimensions[key].values = _lodash2.default.unique(_lodash2.default.pluck(data, key)).sort();
  });
  return model;
}

function filterData(data, filters) {
  var filtered = _lodash2.default.cloneDeep(data);
  _lodash2.default.forEach(filters, function (f) {
    filtered = _lodash2.default.filter(filtered, f);
  });
  return filtered;
}

function getFields(data, model) {
  var result = {};
  var csvColumnsTitle = _lodash2.default.keys(data[0]);
  var allowedColumnsName = utils.getAllowedColumns(model);
  var i = 0;

  _lodash2.default.forEach(model.schema, function (fieldInfo, fieldName) {
    if (_lodash2.default.contains(allowedColumnsName, fieldName)) {
      result[fieldName] = { title: fieldInfo.title ? fieldInfo.title : csvColumnsTitle[i] };
      i++;
    }
  });

  return result;
}

function makeDataStateTree(data, model) {
  return {
    fields: getFields(data, model),
    values: data,
    model: makeModelStateTree(data, model)
  };
}

function makeDefaultUIFromDataState(dataState) {
  var filters = {};
  var measures = [];
  var groups = [];
  var dimensionKeys = _lodash2.default.keys(dataState.model.dimensions);
  var measureKeys = _lodash2.default.keys(dataState.model.measures);

  if (dimensionKeys.length) {
    //if (dataState.model.dimensions[dimensionKeys[0]].values.length) {
    //  filters[dimensionKeys[0]] = dataState.model.dimensions[dimensionKeys[0]].values[dataState.model.dimensions[dimensionKeys[0]].values.length - 1];
    //}
    var index = 0;
    while (dataState.model.dimensions[dimensionKeys[index]].values.length <= 1) {
      index++;
    }
    groups.push(dimensionKeys[index]);
  }

  if (measureKeys.length) {
    measures.push(measureKeys[0]);
  }

  return { selections: { dimensions: { filters: filters, groups: groups }, measures: measures } };
}

function makeUIStateTree(dataState, ui) {
  return Object.assign({}, ui, makeDefaultUIFromDataState(dataState));
}

_papaparse2.default.parsePromise = function (dataSource) {
  var allowedColumns = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];

  var parsedData = [];

  function stepper(row) {
    if (row.errors.length == 0) {
      parsedData.push(allowedColumns.length > 0 ? _lodash2.default.pick(row.data[0], allowedColumns) : row.data[0]);
    }
  }

  return new _bluebird2.default(function (resolve, reject) {
    var papaHandlers = { step: stepper, complete: resolve };
    _papaparse2.default.parse(dataSource, _lodash2.default.merge(papaOptions, papaHandlers));
  }).then(function (results) {
    return parsedData;
  });
};

function makeStateTree(data, model, ui) {
  var dataState = makeDataStateTree(data, model);
  var uiState = makeUIStateTree(dataState, ui);
  return {
    data: dataState,
    ui: uiState
  };
}

function csv(dataSource, model, ui) {
  return _papaparse2.default.parsePromise(dataSource, utils.getAllowedColumns(model)).then(function (data) {
    return makeStateTree(data, model, ui);
  });
}

function getResourcesUrlsFromFDP(fpdJSON, fdpUrl) {
  return _lodash2.default.map(fpdJSON.resources, function (resource) {
    var parts = fdpUrl.split('/');
    parts[parts.length - 1] = resource.path;
    return resource.path ? parts.join('/') : resource.url;
  });
}

function getUrl(url, options) {
  return options.proxy ? options.proxy.replace('{url}', encodeURIComponent(url)) : url;
}

function getMetaInfo(dataSource, fpdJSON) {
  var resources = [];
  _lodash2.default.forEach(fpdJSON.resources, function (resource) {
    resources.push({
      name: resource.name,
      path: resource.path,
      url: resource.url
    });
  });
  return {
    url: dataSource,
    title: fpdJSON.title,
    description: _lodash2.default.isEmpty(fpdJSON.description) ? '' : fpdJSON.description,
    resources: resources
  };
}

function fdp(dataSource, ui) {
  var options = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

  return fetch(getUrl(dataSource, options)).then(function (response) {
    return response.text();
  }).then(function (text) {
    var fpdJSON = JSON.parse(text);
    var model = utils.getModelFromFDP(fpdJSON);
    var urls = getResourcesUrlsFromFDP(fpdJSON, dataSource);
    if (options.onMetaInfoLoaded) {
      options.onMetaInfoLoaded(getMetaInfo(dataSource, fpdJSON));
    }

    return csv(getUrl(urls[0], options), model, ui).then(function (data) {
      data.data.meta = getMetaInfo(dataSource, fpdJSON);
      return data;
    });
  });
}

function getCurrentData(state) {

  var values = _simpleDataStorage.simpleDataStorage.get(state.data.values);
  var result = _lodash2.default.filter(values, state.ui.selections.dimensions.filters);

  var groupFields = state.ui.selections.dimensions.groups;
  if (groupFields.length) {
    var _ret = (function () {
      var groupedResults = _lodash2.default.groupBy(result, function (record) {
        return JSON.stringify(_lodash2.default.pick(record, groupFields));
      });

      var measure = _lodash2.default.first(state.ui.selections.measures);
      return {
        v: _lodash2.default.map(groupedResults, function (records) {
          var res = _lodash2.default.extend({}, _lodash2.default.first(records));
          res[measure] = _lodash2.default.sum(records, measure);
          return res;
        })
      };
    })();

    if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
  }
  return result;
}