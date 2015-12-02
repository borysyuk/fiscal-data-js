import 'babel-polyfill'
import { configureStore } from './store'
import * as actions from './actions'
import * as loaders from './loaders'

const store = configureStore()

export { actions, store, loaders }
