import { expect, should } from 'chai'
import configureStore from 'redux-mock-store'
import thunkMiddleware from 'redux-thunk'
import jsdom from 'mocha-jsdom'
import _ from 'lodash'
import * as actions from '../lib/actions'
import * as loaders from '../lib/loaders'
import reducer, { defaultStateTree } from '../lib/reducers'

const mockStore = configureStore([ thunkMiddleware ])
const dataSource = 'https://raw.githubusercontent.com/os-data/madrid-municipal-gastos/master/data/gastos_v40_2012-2015.csv'
const options = {
  format: 'csv',
  model: {
    "measures": {
      "IMPORTE": {
        "currency": "USD"
      }
    },
    "dimensions": {
      "ECONOMICO": {
        "type": "functional"
      },
      "PROGRAMA": {
        "type": "program",
      }
    }
  },
  ui: {
    "selections": {
      "measures": ["projected"],
      "dimensions": {
        "filters": { "year": 2014 },
        "sum": ["category"]
      }
    }
  }
}

describe('actions', () => {
  it('should create an action to request a state tree update', () => {
    let payload
    let expectedAction = {
      type: actions.REQUEST_UPDATE_STATE_TREE,
      payload
    }
    expect(actions.requestUpdateStateTree(payload)).to.deep.equal(expectedAction)
  })
  it('should create an action to receive a state tree update', () => {
    let payload
    let expectedAction = {
      type: actions.RECEIVE_UPDATE_STATE_TREE,
      payload
    }
    expect(actions.receiveUpdateStateTree(payload)).to.deep.equal(expectedAction)
  })
  it('should create an action to set the default state tree', () => {
    let payload
    let expectedAction = {
      type: actions.SET_DEFAULT_STATE_TREE,
      payload
    }
    expect(actions.setDefaultStateTree(payload)).to.deep.equal(expectedAction)
  })
})

describe('reducers', () => {
  it('should reset the state tree to the default state', () => {
    let payload
    let newStateTree = reducer(undefined, actions.setDefaultStateTree(payload))
    expect(newStateTree).to.deep.equal(defaultStateTree)
  })
  it('should update the store with new data', () => {
    let payload = {
      isEmpty: false,
      values: [
        {'id': 1, 'amount': 25.50, 'category': 'Education'},
        {'id': 1, 'amount': 61.10, 'category': 'Education'},
        {'id': 1, 'amount': 77.50, 'category': 'Arts'},
        {'id': 1, 'amount': 98.70, 'category': 'Arts'},
        {'id': 1, 'amount': 125.90, 'category': 'Science'}
      ]
    }
    let expectedStateTree = Object.assign({}, defaultStateTree, {data: payload})
    let newStateTree = reducer({data: payload},
      actions.receiveUpdateStateTree(payload))
    expect(newStateTree).to.deep.equal(expectedStateTree)
  })
})

describe('dispatchers', () => {
  it('should dispatch an action to the store', (done) => {
    let payload
    let action = actions.setDefaultStateTree(payload)
    let expectedActions = [ action ]
    let store = mockStore(defaultStateTree, expectedActions, done)
    store.dispatch(action)
  })
})

describe('loaders', () => {

  // papaparse needs XMLHttpRequest, so jsdom
  jsdom()

  it('should parse csv to a json array', (done) => {
    let dataSource = 'https://raw.githubusercontent.com/os-data/madrid-municipal-gastos/master/data/gastos_v40_2012-2015.csv'
    let model = {
      "measures": {
        "IMPORTE": {
          "currency": "USD"
        }
      },
      "dimensions": {
        "ECONOMICO": {
          "type": "functional"
        },
        "PROGRAMA": {
          "type": "program",
        }
      }
    }
    let ui = {
      "selections": {
        "measures": ["projected"],
        "dimensions": {
          "filters": { "year": 2014 },
          "sum": ["category"]
        }
      }
    }
    loaders.csv(dataSource, model, ui)
      .then((result) => {
        expect(result).to.be.an('object')
        expect(result.data).to.be.an('object')
        expect(result.model).to.be.an('object')
        expect(result.ui).to.be.an('object')
        expect(result.data.headers).to.be.an('array')
        expect(result.data.values).to.be.an('array')
        expect(result.data.states).to.be.an('object')
        _.forEach(result.data.states, (state) => {
          expect(state).to.be.an('array')
        })
        _.forEach(result.model.dimensions, (dimension) => {
          expect(dimension.values).to.be.an('array')
        })
        expect(result.ui.selections).to.be.an('object')
        expect(result.ui.selections.measures).to.be.an('array')
        expect(result.ui.selections.dimensions).to.be.an('object')
        done()
      })
  })
})
