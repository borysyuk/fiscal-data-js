'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.FDP_LOADED = exports.FDP_META_INFO_LOADED = exports.FDP_LOADING = exports.SET_GROUP_FIELD = exports.SET_DIMENSION_FILTER = exports.SELECT_MEASURE = exports.SET_DEFAULT_STATE = exports.RESET_STATE_TREE = undefined;
exports.fdpLoading = fdpLoading;
exports.fdpMetaInfoLoaded = fdpMetaInfoLoaded;
exports.fdpLoaded = fdpLoaded;
exports.resetStateTree = resetStateTree;
exports.selectMeasure = selectMeasure;
exports.setDimensionFilter = setDimensionFilter;
exports.setGroupField = setGroupField;
exports.setDefaultState = setDefaultState;

require('isomorphic-fetch');

var _loaders = require('../loaders');

var loaders = _interopRequireWildcard(_loaders);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

var RESET_STATE_TREE = exports.RESET_STATE_TREE = 'RESET_STATE_TREE';
var SET_DEFAULT_STATE = exports.SET_DEFAULT_STATE = 'SET_DEFAULT_STATE';

var SELECT_MEASURE = exports.SELECT_MEASURE = 'SELECT_MEASURE';
var SET_DIMENSION_FILTER = exports.SET_DIMENSION_FILTER = 'SET_DIMENSION_FILTER';
var SET_GROUP_FIELD = exports.SET_GROUP_FIELD = 'SET_GROUP_FIELD';

var FDP_LOADING = exports.FDP_LOADING = 'FDP_LOADING';
var FDP_META_INFO_LOADED = exports.FDP_META_INFO_LOADED = 'FDP_META_INFO_LOADED';
var FDP_LOADED = exports.FDP_LOADED = 'FDP_LOADED';

function fdpLoading() {
  return {
    type: FDP_LOADING
  };
}

function fdpMetaInfoLoaded(metaInfo) {
  return {
    type: FDP_META_INFO_LOADED,
    meta: metaInfo
  };
}

function fdpLoaded() {
  return {
    type: FDP_LOADED
  };
}

function resetStateTree() {
  return {
    type: RESET_STATE_TREE
  };
}

function selectMeasure(measure) {
  return {
    type: SELECT_MEASURE,
    measure: measure
  };
}

// dimentionFilter - {key: value/null}
function setDimensionFilter(dimensionFilter) {
  return {
    type: SET_DIMENSION_FILTER,
    dimension: dimensionFilter
  };
}

// groupField - {key: 1/null}
function setGroupField(groupField) {
  return {
    type: SET_GROUP_FIELD,
    group: groupField
  };
}

function setDefaultState(stateTree) {
  return {
    type: SET_DEFAULT_STATE,
    stateTree: stateTree
  };
}

//function initialiseStateTree(dataSource, options) {
//  return (dispatch, getState) => {
//    dispatch(requestInitialStateTree());
//    let format = options.format || 'csv';
//    return loaders[format](dataSource, options.model, options.ui).
//    then((generatedStateTree) => {
//      dispatch(receiveInitialStateTree(generatedStateTree));
//      return getState()
//    })
//  }
//}