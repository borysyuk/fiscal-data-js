import 'isomorphic-fetch'
import * as loaders from '../loaders'
export const SET_DEFAULT_STATE_TREE = 'SET_DEFAULT_STATE_TREE'
export const SET_VISIBILITY_FILTER = 'SET_VISIBILITY_FILTER';

// filter - {key: value}
export function setVisibilityFilter(filters) {
  return {
    type: SET_VISIBILITY_FILTER,
    filters: filters
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
