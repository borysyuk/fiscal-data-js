import { combineReducers } from 'redux'
import {
  REQUEST_INITIAL_STATE_TREE,
  RECEIVE_INITIAL_STATE_TREE,
  REQUEST_UPDATE_STATE_TREE,
  RECEIVE_UPDATE_STATE_TREE,
  SET_DEFAULT_STATE_TREE
} from '../actions'

const defaultUI = { isEmpty: true }
const defaultModel = { isEmpty: true, measures: {} , dimensions: {} }
const defaultData = { isEmpty: true, headers: [], values: [], states: [] }
const emptyFalse = { isEmpty: false }
export const defaultStateTree = {
  ui: defaultUI,
  model: defaultModel,
  data: defaultData
}

function ui(state = defaultUI, action) {
  switch (action.type) {
    case SET_DEFAULT_STATE_TREE:
      return Object.assign({}, state)
    case REQUEST_INITIAL_STATE_TREE:
      return Object.assign({}, state)
    case RECEIVE_INITIAL_STATE_TREE:
      return Object.assign({}, state, action.payload.ui, emptyFalse)
    default:
      return state
  }
}

function model(state = defaultModel, action) {
  switch (action.type) {
    case SET_DEFAULT_STATE_TREE:
      return Object.assign({}, state)
    case REQUEST_INITIAL_STATE_TREE:
      return Object.assign({}, state)
    case RECEIVE_INITIAL_STATE_TREE:
      return Object.assign({}, state, action.payload.model, emptyFalse)
    default:
      return state
  }
}

function data(state = defaultData, action) {
  switch (action.type) {
    case SET_DEFAULT_STATE_TREE:
      return Object.assign({}, state)
    case REQUEST_INITIAL_STATE_TREE:
      return Object.assign({}, state)
    case RECEIVE_INITIAL_STATE_TREE:
      return Object.assign({}, state, action.payload.data, emptyFalse)
    case REQUEST_UPDATE_STATE_TREE:
      return Object.assign({}, state, action.payload.data, emptyFalse)
    case RECEIVE_UPDATE_STATE_TREE:
      return Object.assign({}, state, action.payload.data, emptyFalse)
    default:
      return state
  }
}

const rootReducer = combineReducers({ ui, model, data })

export default rootReducer
