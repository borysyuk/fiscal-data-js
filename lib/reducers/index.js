import { combineReducers } from 'redux'
import undoable, { distinctState } from 'redux-undo'

import {
  SET_VISIBILITY_FILTER,
  SET_DEFAULT_STATE_TREE
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
      console.log('****************************** UI REDUCE ****************************************');
      console.log(action);
      return Object.assign({}, state, action.data);

    case SET_VISIBILITY_FILTER:
      let filters = Object.assign({}, action.filters);
      return Object.assign({}, state, {'selections': {'dimensions': {'filters': filters}}});

    default:
      return state
  }
}

function data(state = defaultData, action) {
  switch (action.type) {
    case SET_DEFAULT_STATE_TREE:
      console.log('****************************** DATA REDUCE ****************************************');
      console.log(action);
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
