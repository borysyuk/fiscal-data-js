import 'isomorphic-fetch'
import R from 'ramda'
import * as loaders from '../loaders'

export const REQUEST_INITIAL_STATE_TREE = 'REQUEST_INITIAL_STATE_TREE'
export const RECEIVE_INITIAL_STATE_TREE = 'RECEIVE_INITIAL_STATE_TREE'
export const REQUEST_UPDATE_STATE_TREE = 'REQUEST_UPDATE_STATE_TREE'
export const RECEIVE_UPDATE_STATE_TREE = 'RECEIVE_UPDATE_STATE_TREE'
export const SET_DEFAULT_STATE_TREE = 'SET_DEFAULT_STATE_TREE'

export function requestInitialStateTree(payload) {
  return {
    type: REQUEST_INITIAL_STATE_TREE,
    payload: payload
  }
}

export function receiveInitialStateTree(payload) {
  return {
    type: RECEIVE_INITIAL_STATE_TREE,
    payload: payload
  }
}

export function requestUpdateStateTree(payload) {
  return {
    type: REQUEST_UPDATE_STATE_TREE,
    payload: payload
  }
}

export function receiveUpdateStateTree(payload) {
  return {
    type: RECEIVE_UPDATE_STATE_TREE,
    payload: payload
  }
}

export function setDefaultStateTree(payload) {
  return {
    type: SET_DEFAULT_STATE_TREE,
    payload: payload
  }
}

function initialiseStateTree(dataSource, options) {
  return (dispatch, getState) => {
    dispatch(requestInitialStateTree())
    let format = options.format || 'csv'
    return loaders[format](dataSource, options.model, options.ui).
      then((generatedStateTree) => {
        dispatch(receiveInitialStateTree(generatedStateTree))
        return getState()
      })
  }
}

function updateStateTree() {
  return (dispatch, getState) => {

  }
}

export function initialiseStateTreeIfNeeded(dataSource, options) {
  return (dispatch, getState) => {
    // can inspect existing state tree and see if we need to do anything at all.
    // const stateTree = getState()
    return dispatch(initialiseStateTree(dataSource, options))
  }
}

export function updateStateTreeIfNeeded() {
  return (dispatch, getState) => {
    // can inspect existing state tree and see if we need to do anything at all.
    // const stateTree = getState()
    return dispatch(updateStateTree())
  }
}
