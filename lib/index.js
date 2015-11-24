import 'babel-polyfill'
import { configureStore } from './store'
import * as actions from './actions'

const store = configureStore()

export { actions, store }
