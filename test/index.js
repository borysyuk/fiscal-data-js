import { expect, should } from 'chai'
import configureStore from 'redux-mock-store'
import thunkMiddleware from 'redux-thunk'
import jsdom from 'mocha-jsdom'
import _ from 'lodash'
import * as actions from '../lib/actions'
import * as loaders from '../lib/loaders'
import * as utils from '../lib/utils'
import reducer, { defaultStateTree } from '../lib/reducers'

const mockStore = configureStore([ thunkMiddleware ])
const dataSource = 'https://raw.githubusercontent.com/os-data/madrid-municipal-gastos/master/data/gastos_v40_2012-2015.csv'
const fdp = 'https://raw.githubusercontent.com/os-data/madrid-municipal-gastos/master/datapackage.json'

const options = {
  format: 'csv',
  model: {
    'measures': {
      'IMPORTE': {
        'currency': 'USD'
      }
    },
    'dimensions': {
      'AÑO': {
        'type': 'Year'
      },
      'ECONOMICO': {
        'type': 'functional'
      },
      'PROGRAMA': {
        'type': 'program'
      }
    }
  },
  ui: {
    'selections': {
      'measures':  'projected' ,
      'dimensions': {
        'filters': { 'AÑO': '2014',  'PROGRAMA': '15101'},
        'groups': [ 'PROGRAMA' ]
      }
    }
  }
}

describe('actions', () => {
  it('should create an action to set default data', () => {
    let stateTree
    let expectedAction = {
      type: actions.SET_DEFAULT_STATE,
      stateTree: stateTree
    }
    expect(actions.setDefaultState(stateTree)).to.deep.equal(expectedAction)
  })

  it('should create an action to select measure', () => {
    let measure
    let expectedAction = {
      type: actions.SELECT_MEASURE,
      measure: measure
    }
    expect(actions.selectMeasure(measure)).to.deep.equal(expectedAction)
  })

  it('should create an action to select dimension', () => {
    let dimension
    let expectedAction = {
      type: actions.SET_DIMENSION_FILTER,
      dimension: dimension
    }
    expect(actions.setDimensionFilter(dimension)).to.deep.equal(expectedAction)
  })

  it('should create an action to group fields', () => {
    let group
    let expectedAction = {
      type: actions.SET_GROUP_FIELD,
      group: group
    }
    expect(actions.setGroupField(group)).to.deep.equal(expectedAction)
  })
})

describe('reducers', () => {
  let data = {
    meta: {
      url: '',
      title: '',
      description: '',
      resources: []
    },
    fields: {},
    values: [
      {'id': 1, 'amount': 25.50, 'category': 'Education'},
      {'id': 1, 'amount': 61.10, 'category': 'Education'},
      {'id': 1, 'amount': 77.50, 'category': 'Arts'},
      {'id': 1, 'amount': 98.70, 'category': 'Arts'},
      {'id': 1, 'amount': 125.90, 'category': 'Science'}
    ],
    model: {
      measures: {} ,
      dimensions: {}
    }
  }

  let ui = {
    'selections': {
      'measures': [ 'field3' ],
      'dimensions': {
        'filters': { field2: 'value2', field4: 'value4' },
        'groups': [ 'field1', 'field2' ]
      }
    }
  }

  let stateTree = {
    data: data,
    ui: ui
  }

  it('should reset the data state to the default state', () => {
    let data
    let newStateTree = reducer(undefined, actions.setDefaultState(data))
    expect(newStateTree.app.present).to.deep.equal(defaultStateTree)
  })

  it('should update the store with new data', () => {
    let expectedStateTree = Object.assign({}, defaultStateTree, {stateTree: _.cloneDeep(stateTree)})
    let newStateTree = reducer(undefined, actions.setDefaultState(stateTree))

    expect(newStateTree.app.present.data.values).to.not.equal('')

    expectedStateTree.data.values = newStateTree.app.present.data.values

    expect(newStateTree.app.present.data).to.deep.equal(expectedStateTree.data)
  })


  it('should update the ui store with new measure', () => {
    let newStateTree = reducer(undefined, actions.selectMeasure({field1: 1}))
    expect(newStateTree.app.present.ui.selections.measures).to.deep.equal([ 'field1' ])
  })

  it('should replace old measure by new one', () => {
    let newStateTree = reducer(undefined, actions.selectMeasure({field1: 1}))
    let newStateTree2 = reducer(newStateTree, actions.selectMeasure({field2: 1}))
    expect(newStateTree2.app.present.ui.selections.measures).to.deep.equal([ 'field2' ])
  })

  it('should keep old measure if you want replace it by empty object', () => {
    let newStateTree = reducer(undefined, actions.selectMeasure({field1: 1}))
    let newStateTree2 = reducer(newStateTree, actions.selectMeasure({}))
    expect(newStateTree2.app.present.ui.selections.measures).to.deep.equal([ 'field1' ])
  })


  it('should update the ui store with new dimensions', () => {
    let newStateTree = reducer(undefined, actions.setDimensionFilter({field1: 1}))
    expect(newStateTree.app.present.ui.selections.dimensions.filters).to.deep.equal({field1:1})
  })

  it('should replace old value of current dimension filter by new one', () => {
    let newStateTree = reducer(undefined, actions.setDimensionFilter({field1: 1}))
    let newStateTree2 = reducer(newStateTree, actions.setDimensionFilter({field1: 3}))
    expect(newStateTree2.app.present.ui.selections.dimensions.filters).to.deep.equal({field1:3})
  })

  it('should add new dimension filter to existing one ', () => {
    let newStateTree = reducer(undefined, actions.setDimensionFilter({field1: 1}))
    let newStateTree2 = reducer(newStateTree, actions.setDimensionFilter({field2: 3}))
    expect(newStateTree2.app.present.ui.selections.dimensions.filters).to.deep.equal({field1:1, field2: 3})
  })

  it('should modify value of one dimension and do not modify another values', () => {
    let newStateTree = reducer(undefined, actions.setDimensionFilter({field1: 1}))
    let newStateTree2 = reducer(newStateTree, actions.setDimensionFilter({field2: 3}))
    let newStateTree3 = reducer(newStateTree2, actions.setDimensionFilter({field1: 3}))
    expect(newStateTree3.app.present.ui.selections.dimensions.filters).to.deep.equal({field1:3, field2: 3})
  })

  it('should delete one dimension filter  and do not modify another', () => {
    let newStateTree = reducer(undefined, actions.setDimensionFilter({field1: 1}))
    let newStateTree2 = reducer(newStateTree, actions.setDimensionFilter({field2: 3}))
    let newStateTree3 = reducer(newStateTree2, actions.setDimensionFilter({field1: null}))
    expect(newStateTree3.app.present.ui.selections.dimensions.filters).to.deep.equal({field2: 3})
  })

  it('should delete last dimension filter', () => {
    let newStateTree = reducer(undefined, actions.setDimensionFilter({field1: 1}))
    let newStateTree2 = reducer(newStateTree, actions.setDimensionFilter({field1: null}))
    expect(newStateTree2.app.present.ui.selections.dimensions.filters).to.deep.equal({})
  })



  it('should update the ui store with new dimension groups', () => {
    let newStateTree = reducer(undefined, actions.setGroupField({field1: 1}))
    expect(newStateTree.app.present.ui.selections.dimensions.groups).to.deep.equal([ 'field1' ])
  })

  it('should add new dimension group to existing one ', () => {
    let newStateTree = reducer(undefined, actions.setGroupField({field1: 1}))
    let newStateTree2 = reducer(newStateTree, actions.setGroupField({field2: 1}))
    expect(newStateTree2.app.present.ui.selections.dimensions.groups).to.deep.equal([ 'field1', 'field2' ])
  })

  it('should delete one dimension group  and do not modify another', () => {
    let newStateTree = reducer(undefined, actions.setGroupField({field1: 1}))
    let newStateTree2 = reducer(newStateTree, actions.setGroupField({field2: 1}))
    let newStateTree3 = reducer(newStateTree2, actions.setGroupField({field1: null}))
    expect(newStateTree3.app.present.ui.selections.dimensions.groups).to.deep.equal([ 'field2' ])
  })

  it.skip('should delete last dimension group', () => {
    let newStateTree = reducer(undefined, actions.setGroupField({field1: 1}))
    let newStateTree2 = reducer(newStateTree, actions.setGroupField({field1: null}))
    expect(newStateTree2.app.present.ui.selections.dimensions.groups).to.deep.equal([])
  })

  //it.skip('should reset current state tree to default one', () => {
  //  let clonedData = _.cloneDeep(stateTree);
  //
  //  let newStateTree = reducer(undefined, actions.setDefaultState(clonedData));
  //  clonedData.data.flags.isLoaded = true;
  //  clonedData.data.values = newStateTree.app.present.data.values;
  //
  //  expect(newStateTree.app.present.data).to.deep.equal(clonedData.data);
  //
  //  let newStateTree2 = reducer(newStateTree, actions.resetStateTree());
  //  expect(newStateTree2.app.present).to.deep.equal(defaultStateTree);
  //});
})

describe('dispatchers', () => {
  it('should dispatch an action to the store', (done) => {
    let payload
    let action = actions.setDefaultState(payload)
    let expectedActions = [ action ]
    let store = mockStore(defaultStateTree, expectedActions, done)
    store.dispatch(action)
  })
})

describe('loaders', function () {
  // papaparse needs XMLHttpRequest, so jsdom
  jsdom()

  it('should parse csv to a json array', (done) => {
    loaders.csv(dataSource, options.model, options.ui)
      .then((result) => {
        expect(result).to.be.an('object')
        expect(result.data).to.be.an('object')
        expect(result.ui).to.be.an('object')
        expect(result.data.values).to.be.an('array')
        _.forEach(result.data.model.dimensions, (dimension) => {
          expect(dimension.values).to.be.an('array')
        })
        expect(result.ui.selections).to.be.an('object')
        expect(result.ui.selections.measures).to.be.an('array')
        expect(result.ui.selections.dimensions).to.be.an('object')
        expect(result.ui.selections.dimensions.filters).to.be.an('object')
        expect(result.ui.selections.dimensions.groups).to.be.an('array')
        done()
      })
  })

  this.timeout(20000)

  it('should parse fdp to a json array', (done) => {
    loaders.fdp(fdp)
      .then((result) => {

        expect(result).to.be.an('object')
        expect(result.data).to.be.an('object')

        expect(result.data.meta).to.be.an('object')
        expect(result.data.meta.url).to.be.equal(fdp)
        expect(result.data.meta.title).to.be.not.equal('')
        expect(result.data.meta.resources).to.be.an('array')
        _.forEach(result.data.meta.resources, (resource) => {
          expect(resource).to.be.an('object')
        })

        expect(result.data.fields).to.be.an('object')
        _.forEach(result.data.fields, (field) => {
          expect(field).to.be.an('object')
        })

        expect(result.ui).to.be.an('object')
        expect(result.data.values).to.be.an('array')
        _.forEach(result.data.model.dimensions, (dimension) => {
          expect(dimension.values).to.be.an('array')
        })
        expect(result.ui.selections).to.be.an('object')
        expect(result.ui.selections.measures).to.be.an('array')
        expect(result.ui.selections.dimensions).to.be.an('object')
        expect(result.ui.selections.dimensions.filters).to.be.an('object')
        expect(result.ui.selections.dimensions.groups).to.be.an('array')

        done()
      })
  })

//  it('should select not first group', (done) => {
////    loaders.fdp(fdp/*'http://datastore.openspending.org/__tests/boost-peru-national/datapackage.json'*/)
//    loaders.fdp('http://datastore.openspending.org/__tests/boost-peru-national/datapackage.json')
//      .then((result) => {
//        console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!1test');
//        done()
//      })
//  })



  it.skip('should works using cors proxy', (done) => { //proxy has been disabled
    loaders.fdp(fdp, undefined, {proxy: 'http://gobetween.oklabs.org/pipe/{url}'})
      .then((result) => {
        expect(result.data.packageUrl).to.be.equal(fdp)

        expect(result.data.fields).to.be.an('object')
        _.forEach(result.data.fields, (field) => {
          expect(field).to.be.an('object')
        })

        expect(result).to.be.an('object')
        expect(result.data).to.be.an('object')
        expect(result.ui).to.be.an('object')
        expect(result.data.values).to.be.an('array')
        _.forEach(result.data.model.dimensions, (dimension) => {
          expect(dimension.values).to.be.an('array')
        })
        expect(result.ui.selections).to.be.an('object')
        expect(result.ui.selections.measures).to.be.an('array')
        expect(result.ui.selections.dimensions).to.be.an('object')
        expect(result.ui.selections.dimensions.filters).to.be.an('object')
        expect(result.ui.selections.dimensions.groups).to.be.an('array')

        done()
      })
  })

})
