import 'babel-polyfill'
import { configureStore } from './store'
import * as actions from './actions'
import * as loaders from './loaders'
import { simpleDataStorage } from './utils/simpleDataStorage'

const store = configureStore()

export { actions, store, loaders, simpleDataStorage }
