import { combineReducers } from 'redux'
import undoable, { distinctState } from 'redux-undo'

import {
  SELECT_MEASURE,
  SET_DIMENSION_FILTER,
  SET_GROUP_FIELD,
  SET_DEFAULT_STATE_TREE
} from './../actions'

const defaultUI = {
  "selections": {
    "measures": '',
    "dimensions": {
      "filters": {},
      "groups": []
    }
  }
};

const defaultData = {
  headers: [],
  values: [],
  model: {
    measures: {} ,
    dimensions: {}
  }
};

function ui(state = defaultUI, action) {
  let nextState = Object.assign({}, state);
  switch (action.type) {
    case SET_DEFAULT_STATE_TREE:
      return Object.assign({}, state, action.data);

    case SELECT_MEASURE:
      nextState.selections.measures = action.measure;
      return nextState;

    case SET_DIMENSION_FILTER:
      let filters = Object.assign({}, state.selections.dimensions.filters,  action.dimension);
      filters = _.pick(filters, _.identity);
      nextState.selections.dimensions.filters = filters;
      return nextState;

    case SET_GROUP_FIELD:
      let oldGroups = {};
      _.forEach(state.selections.dimensions.groups, (groupField) => {oldGroups[groupField] = 1} );
      let groups = Object.assign({}, oldGroups, action.group);
      groups = _.keys(_.pick(groups, _.identity));

      nextState.selections.dimensions.groups = groups;
      return nextState;

    default:
      return state
  }
}

function data(state = defaultData, action) {
  switch (action.type) {
    case SET_DEFAULT_STATE_TREE:
      return Object.assign({}, state, action.data);

    default:
      return state
  }
}

const todoApp = combineReducers({
  ui,
  data
})

export default todoApp
