import { combineReducers } from 'redux'
import undoable, { distinctState } from 'redux-undo'

import {
  SELECT_MEASURE,
  SET_DIMENSION_FILTER,
  SET_GROUP_FIELD,
  SET_DEFAULT_DATA,
  SET_DEFAULT_UI
} from './../actions'

const defaultUI = {
  "selections": {
    "measures": [],
    "dimensions": {
      "filters": {},
      "groups": []
    }
  }
};

const defaultData = {
  flags: {dataLoaded: false},
  fields: {},
  values: [],
  model: {
    measures: {} ,
    dimensions: {}
  }
};

function ui(state = defaultUI, action) {
  let nextState = Object.assign({}, state);
  switch (action.type) {
    case SET_DEFAULT_UI:
      return Object.assign({}, state, action.ui);

    case SELECT_MEASURE:
      let measures = _.keys(_.pick(action.measure, _.identity));
      if (measures.length) {
        nextState.selections.measures = measures.slice(0,1);
        return nextState;
      } else {
        return state;
      }
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
    case SET_DEFAULT_DATA:
      var result = Object.assign({}, state, action.data);
      result.flags.dataLoaded = true;
      return result;

    default:
      return state
  }
}

const reducers = combineReducers({
  ui,
  data
})

export default reducers
