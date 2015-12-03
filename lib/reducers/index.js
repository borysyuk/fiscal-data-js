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
  switch (action.type) {
    case SET_DEFAULT_STATE_TREE:
      return Object.assign({}, state, action.data);

    case SELECT_MEASURE:
      return Object.assign({}, state, {'selections': {'measures': action.measure }});

    case SET_DIMENSION_FILTER:
      let filters = Object.assign({}, state.selections.dimensions.filters,  action.dimension);
      filters = _.pick(filters, _.identity);
      return Object.assign({}, state, {'selections': {'dimensions': {'filters': filters}}});

    case SET_GROUP_FIELD:
      let groups = Object.assign({}, action.group);
      groups = _.keys(_.pick(groups, _.identity));
      return Object.assign({}, state, {'selections': {'dimensions': {'groups': groups}}});

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
