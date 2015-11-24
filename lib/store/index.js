import { compose, createStore, applyMiddleware } from 'redux'
import thunkMiddleware from 'redux-thunk'
import createLogger from 'redux-logger'
import rootReducer from '../reducers'

const createStoreWithMiddleware = compose(
  applyMiddleware(
    thunkMiddleware,
    createLogger()
  )
)(createStore)

function configureStore(initialState) {
  return createStoreWithMiddleware(rootReducer, initialState)
}

export { configureStore }
