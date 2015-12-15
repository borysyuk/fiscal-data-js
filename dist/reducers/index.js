'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.defaultStateTree = undefined;

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _redux = require('redux');

var _simpleDataStorage = require('../utils/simpleDataStorage');

var _reduxUndo = require('redux-undo');

var _reduxUndo2 = _interopRequireDefault(_reduxUndo);

var _actions = require('./../actions');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var defaultUI = {
  'selections': {
    'measures': [],
    'dimensions': {
      'filters': {},
      'groups': []
    }
  }
};

var defaultData = {
  meta: {
    url: '',
    title: '',
    description: '',
    resources: []

  },
  fields: {},
  values: '',
  model: {
    measures: {},
    dimensions: {}
  }
};

var defaultFlagsData = {
  isLoaded: false,
  fdpLoading: false,
  fdpMetaInfoLoaded: false,
  meta: {
    url: '',
    title: '',
    description: '',
    resources: []
  }
};

var defaultStateTree = exports.defaultStateTree = {
  ui: defaultUI,
  data: defaultData
};

function speedDeepClone(object) {
  if (_lodash2.default.isUndefined(object)) {
    return object;
  }
  return JSON.parse(JSON.stringify(object));
}

function stateTree() {
  var state = arguments.length <= 0 || arguments[0] === undefined ? defaultStateTree : arguments[0];
  var action = arguments[1];

  var nextState = speedDeepClone(Object.assign({}, state));

  switch (action.type) {
    //case RESET_STATE_TREE:
    //  return _.cloneDeep(defaultStateTree);

    case _actions.SET_DEFAULT_STATE:
      var result = state;

      if (action.stateTree) {
        result = {};
        result.data = speedDeepClone(Object.assign({}, state.data, action.stateTree.data));
        result.ui = speedDeepClone(Object.assign({}, state.ui, action.stateTree.ui));

        result.data.values = _simpleDataStorage.simpleDataStorage.set(action.stateTree.data.values);
      }
      return result;

    case _actions.SELECT_MEASURE:
      var measures = _lodash2.default.keys(_lodash2.default.pick(_lodash2.default.cloneDeep(action.measure), _lodash2.default.identity));
      if (measures.length) {
        nextState.ui.selections.measures = measures.slice(0, 1);
        return nextState;
      } else {
        return state;
      }

    case _actions.SET_DIMENSION_FILTER:
      var filters = speedDeepClone(Object.assign({}, state.ui.selections.dimensions.filters, action.dimension));
      filters = _lodash2.default.pick(filters, _lodash2.default.identity);
      nextState.ui.selections.dimensions.filters = filters;
      return nextState;

    case _actions.SET_GROUP_FIELD:
      var oldGroups = [];
      _lodash2.default.forEach(state.ui.selections.dimensions.groups, function (groupField) {
        oldGroups[groupField] = 1;
      });
      var groups = speedDeepClone(Object.assign({}, oldGroups, action.group));
      groups = _lodash2.default.keys(_lodash2.default.pick(groups, _lodash2.default.identity));

      if (groups.length == 0) {
        // we cannot unselect last field
        return state;
      }
      nextState.ui.selections.dimensions.groups = groups;
      return nextState;

    default:
      return state;
  }
}

function flags() {
  var state = arguments.length <= 0 || arguments[0] === undefined ? defaultFlagsData : arguments[0];
  var action = arguments[1];

  switch (action.type) {
    case _actions.RESET_STATE_TREE:
      return _lodash2.default.cloneDeep(defaultFlagsData);

    case _actions.FDP_LOADING:
      var res = Object.assign({}, _lodash2.default.cloneDeep(state));
      res.fdpLoading = true;
      res.isLoaded = false;
      return res;

    case _actions.FDP_META_INFO_LOADED:
      var res = _lodash2.default.cloneDeep(Object.assign({}, state));
      res.fdpMetaInfoLoaded = true;
      res.meta = speedDeepClone(Object.assign({}, action.meta));
      return res;

    case _actions.FDP_LOADED:
      var res = Object.assign({}, _lodash2.default.cloneDeep(state));
      res.fdpLoading = false;
      res.fdpMetaInfoLoaded = false;
      res.isLoaded = true;
      return res;

    default:
      return state;
  }
}

var reducers = (0, _redux.combineReducers)({
  app: (0, _reduxUndo2.default)(stateTree, { filter: (0, _reduxUndo.distinctState)() }),
  flags: flags
});

exports.default = reducers;