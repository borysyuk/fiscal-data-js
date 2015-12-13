import _ from 'lodash'
import { combineReducers } from 'redux'
import { simpleDataStorage } from '../utils/simpleDataStorage'
import undoable, { distinctState } from 'redux-undo'

import {
  RESET_STATE_TREE,
  SELECT_MEASURE,
  SET_DIMENSION_FILTER,
  SET_GROUP_FIELD,
  SET_DEFAULT_STATE,
  FDP_LOADING,
  FDP_META_INFO_LOADED,
  FDP_LOADED
} from './../actions'

const defaultUI = {
  "selections": {
    "measures": [],
    "dimensions": {
      "filters": {},
      "groups": []
    }
  }
}

const defaultData = {
  packageUrl: '',
  flags: {isLoaded: false},
  fields: {},
  values: '',
  model: {
    measures: {} ,
    dimensions: {}
  }
}

const defaultFlagsData = {
  isLoaded: false,
  fdpLoading: false,
  fdpMetaInfoLoaded: false,
  meta: {
    url: '',
    title: '',
    description: ''
  }
}

export const defaultStateTree = {
  ui: defaultUI,
  data: defaultData
}

function speedDeepClone(object) {
  if (_.isUndefined(object)) {
    return object
  }
  return JSON.parse(JSON.stringify(object))
}

function stateTree(state = defaultStateTree, action) {
  let nextState = speedDeepClone(Object.assign({}, state))

  switch (action.type) {
    //case RESET_STATE_TREE:
    //  return _.cloneDeep(defaultStateTree);

    case SET_DEFAULT_STATE:
      let result = state

      if (action.stateTree) {
        result = {}
        result.data = speedDeepClone(Object.assign({}, state.data, action.stateTree.data))
        result.ui = speedDeepClone(Object.assign({}, state.ui, action.stateTree.ui))

        result.data.values = simpleDataStorage.set(action.stateTree.data.values)
        result.data.flags.isLoaded = true
      }
      return result

    case SELECT_MEASURE:
      let measures = _.keys(_.pick(_.cloneDeep(action.measure), _.identity))
      if (measures.length) {
        nextState.ui.selections.measures = measures.slice(0, 1)
        return nextState
      } else {
        return state
      }

    case SET_DIMENSION_FILTER:
      let filters = speedDeepClone(Object.assign({}, state.ui.selections.dimensions.filters,  action.dimension))
      filters = _.pick(filters, _.identity)
      nextState.ui.selections.dimensions.filters = filters
      return nextState

    case SET_GROUP_FIELD:
      let oldGroups = {}
      _.forEach(state.ui.selections.dimensions.groups, (groupField) => {oldGroups[ groupField ] = 1} )
      let groups = speedDeepClone(Object.assign({}, oldGroups, action.group))
      groups = _.keys(_.pick(groups, _.identity))

      nextState.ui.selections.dimensions.groups = groups
      return nextState

    default:
      return state
  }
}

function flags(state = defaultFlagsData, action) {
  switch (action.type) {
    case RESET_STATE_TREE:
      return _.cloneDeep(defaultFlagsData)

    case FDP_LOADING:
      var res = Object.assign({}, _.cloneDeep(state))
      res.fdpLoading = true
      res.isLoaded = false
      return res

    case FDP_META_INFO_LOADED:
      var res = _.cloneDeep(Object.assign({}, state))
      res.fdpMetaInfoLoaded = true
      res.meta = Object.assign({}, action.meta)
      return res

    case FDP_LOADED:
      var res = Object.assign({}, _.cloneDeep(state))
      res.fdpLoading = false
      res.fdpMetaInfoLoaded = false
      res.isLoaded = true
      return res

    default:
      return state
  }
}

const reducers = combineReducers({
  app : undoable(stateTree, { filter: distinctState() }),
  flags: flags
})

export default reducers
