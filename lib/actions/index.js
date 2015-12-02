import 'isomorphic-fetch'
import * as loaders from '../loaders'
export const SET_DEFAULT_STATE_TREE = 'SET_DEFAULT_STATE_TREE'

export const SELECT_MEASURE = 'SELECT_MEASURE';
export const ADD_DIMENSION_FILTER = 'ADD_DIMENSION_FILTER';
export const ADD_GROUP_FIELD = 'ADD_GROUP_FIELD';

export function selectMeasure(measure) {
  return {
    type: SELECT_MEASURE,
    measure: measure
  }
}

// dimentionFilter - {key: value/null}
export function addDimensionFilter(dimensionFilter) {
  return {
    type: ADD_DIMENSION_FILTER,
    dimension: dimensionFilter
  }
}

// groupField - {key: 1/null}
export function addGroupField(groupField) {
  return {
    type: ADD_GROUP_FIELD,
    group: groupField
  }
}


export function setDefaultStateTree(data) {
  return {
    type: SET_DEFAULT_STATE_TREE,
    data: data
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
