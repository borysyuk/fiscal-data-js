import 'isomorphic-fetch'
import * as loaders from '../loaders'

export const RESET_STATE_TREE = 'RESET_STATE_TREE';

export const SET_DEFAULT_DATA = 'SET_DEFAULT_DATA';
export const SET_DEFAULT_UI = 'SET_DEFAULT_UI';

export const SELECT_MEASURE = 'SELECT_MEASURE';
export const SET_DIMENSION_FILTER = 'SET_DIMENSION_FILTER';
export const SET_GROUP_FIELD = 'SET_GROUP_FIELD';

export function resetStateTree() {
  return {
    type: RESET_STATE_TREE
  }
}

export function selectMeasure(measure) {
  return {
    type: SELECT_MEASURE,
    measure: measure
  }
}

// dimentionFilter - {key: value/null}
export function setDimensionFilter(dimensionFilter) {
  return {
    type: SET_DIMENSION_FILTER,
    dimension: dimensionFilter
  }
}

// groupField - {key: 1/null}
export function setGroupField(groupField) {
  return {
    type: SET_GROUP_FIELD,
    group: groupField
  }
}

export function setDefaultData(data) {
  return {
    type: SET_DEFAULT_DATA,
    data: data
  }
}

export function setDefaultUi(ui) {
  return {
    type: SET_DEFAULT_UI,
    ui: ui
  }
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
