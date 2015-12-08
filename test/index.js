import { expect, should } from 'chai'
import configureStore from 'redux-mock-store'
import thunkMiddleware from 'redux-thunk'
import jsdom from 'mocha-jsdom'
import _ from 'lodash'
import * as actions from '../lib/actions'
import * as loaders from '../lib/loaders'
import * as utils from '../lib/utils'
import reducer, { defaultStateTree } from '../lib/reducers'

const mockStore = configureStore([ thunkMiddleware ]);
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
      "AÑO": {
        "type": "Year",
        "title": "Year"
      },
      "ECONOMICO": {
        "type": "functional",
        "title": "Functional"
      },
      "PROGRAMA": {
        "type": "program",
        "title": "Program"
      }
    }
  },
  ui: {
    "selections": {
      "measures":  "projected" ,
      "dimensions": {
        "filters": { "AÑO": "2014",  "PROGRAMA": "15101"},
        "groups": [ "PROGRAMA" ]
      }
    }
  }
};

describe.skip('actions', () => {
  it('should create an action to set default data', () => {
    let data;
    let expectedAction = {
      type: actions.SET_DEFAULT_DATA,
      data: data
    };
    expect(actions.setDefaultData(data)).to.deep.equal(expectedAction)
  });

  it('should create an action to set default ui', () => {
    let data;
    let expectedAction = {
      type: actions.SET_DEFAULT_UI,
      ui: data
    };
    expect(actions.setDefaultUi(data)).to.deep.equal(expectedAction)
  });

  it('should create an action to select measure', () => {
    let measure;
    let expectedAction = {
      type: actions.SELECT_MEASURE,
      measure: measure
    };
    expect(actions.selectMeasure(measure)).to.deep.equal(expectedAction)
  });

  it('should create an action to select dimension', () => {
    let dimension;
    let expectedAction = {
      type: actions.SET_DIMENSION_FILTER,
      dimension: dimension
    };
    expect(actions.setDimensionFilter(dimension)).to.deep.equal(expectedAction)
  });

  it('should create an action to group fields', () => {
    let group;
    let expectedAction = {
      type: actions.SET_GROUP_FIELD,
      group: group
    };
    expect(actions.setGroupField(group)).to.deep.equal(expectedAction)
  })
});

describe('reducers', () => {
  let data = {
    flags: {},
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
  };

  let ui = {
    "selections": {
      "measures": ['field3'],
      "dimensions": {
        "filters": {field2: "value2", field4: 'value4'},
        "groups": ['field1', 'field2']
      }
    }
  };

  it('should reset the data state to the default state', () => {
    let data;
    let newStateTree = reducer(undefined, actions.setDefaultData(data));
    expect(newStateTree).to.deep.equal(defaultStateTree);
  });

  it('should update the store with new data and set flag "isLoaded" in true', () => {
    let expectedStateTree = Object.assign({}, defaultStateTree, {data: _.cloneDeep(data)});
    let newStateTree = reducer(undefined, actions.setDefaultData(data));

    expect(newStateTree.data.flags.isLoaded).to.equal(true);

    expectedStateTree.data.flags.isLoaded = true;
    expect(newStateTree).to.deep.equal(expectedStateTree);
  });


  it('should update the ui store with new measure', () => {
    let newStateTree = reducer(undefined, actions.selectMeasure({field1: 1}));
    expect(newStateTree.ui.selections.measures).to.deep.equal(['field1']);
  });

  it('should replace old measure by new one', () => {
    let newStateTree = reducer(undefined, actions.selectMeasure({field1: 1}));
    let newStateTree2 = reducer(newStateTree, actions.selectMeasure({field2: 1}));
    expect(newStateTree2.ui.selections.measures).to.deep.equal(['field2']);
  });

  it('should keep old measure if you want replace it by empty object', () => {
    let newStateTree = reducer(undefined, actions.selectMeasure({field1: 1}));
    let newStateTree2 = reducer(newStateTree, actions.selectMeasure({}));
    expect(newStateTree2.ui.selections.measures).to.deep.equal(['field1']);
  });


  it('should update the ui store with new dimensions', () => {
    let newStateTree = reducer(undefined, actions.setDimensionFilter({field1: 1}));
    expect(newStateTree.ui.selections.dimensions.filters).to.deep.equal({field1:1});
  });

  it('should replace old value of current dimension filter by new one', () => {
    let newStateTree = reducer(undefined, actions.setDimensionFilter({field1: 1}));
    let newStateTree2 = reducer(newStateTree, actions.setDimensionFilter({field1: 3}));
    expect(newStateTree2.ui.selections.dimensions.filters).to.deep.equal({field1:3});
  });

  it('should add new dimension filter to existing one ', () => {
    let newStateTree = reducer(undefined, actions.setDimensionFilter({field1: 1}));
    let newStateTree2 = reducer(newStateTree, actions.setDimensionFilter({field2: 3}));
    expect(newStateTree2.ui.selections.dimensions.filters).to.deep.equal({field1:1, field2: 3});
  });

  it('should modify value of one dimension and do not modify another values', () => {
    let newStateTree = reducer(undefined, actions.setDimensionFilter({field1: 1}));
    let newStateTree2 = reducer(newStateTree, actions.setDimensionFilter({field2: 3}));
    let newStateTree3 = reducer(newStateTree2, actions.setDimensionFilter({field1: 3}));
    expect(newStateTree3.ui.selections.dimensions.filters).to.deep.equal({field1:3, field2: 3});
  });

  it('should delete one dimension filter  and do not modify another', () => {
    let newStateTree = reducer(undefined, actions.setDimensionFilter({field1: 1}));
    let newStateTree2 = reducer(newStateTree, actions.setDimensionFilter({field2: 3}));
    let newStateTree3 = reducer(newStateTree2, actions.setDimensionFilter({field1: null}));
    expect(newStateTree3.ui.selections.dimensions.filters).to.deep.equal({field2: 3});
  });

  it('should delete last dimension filter', () => {
    let newStateTree = reducer(undefined, actions.setDimensionFilter({field1: 1}));
    let newStateTree2 = reducer(newStateTree, actions.setDimensionFilter({field1: null}));
    expect(newStateTree2.ui.selections.dimensions.filters).to.deep.equal({});
  });



  it('should update the ui store with new dimension groups', () => {
    let newStateTree = reducer(undefined, actions.setGroupField({field1: 1}));
    expect(newStateTree.ui.selections.dimensions.groups).to.deep.equal(['field1']);
  });

  it('should add new dimension group to existing one ', () => {
    let newStateTree = reducer(undefined, actions.setGroupField({field1: 1}));
    let newStateTree2 = reducer(newStateTree, actions.setGroupField({field2: 1}));
    expect(newStateTree2.ui.selections.dimensions.groups).to.deep.equal(['field1', 'field2']);
  });

  it('should delete one dimension group  and do not modify another', () => {
    let newStateTree = reducer(undefined, actions.setGroupField({field1: 1}));
    let newStateTree2 = reducer(newStateTree, actions.setGroupField({field2: 1}));
    let newStateTree3 = reducer(newStateTree2, actions.setGroupField({field1: null}));
    expect(newStateTree3.ui.selections.dimensions.groups).to.deep.equal(['field2']);
  });

  it('should delete last dimension group', () => {
    let newStateTree = reducer(undefined, actions.setGroupField({field1: 1}));
    let newStateTree2 = reducer(newStateTree, actions.setGroupField({field1: null}));
    expect(newStateTree2.ui.selections.dimensions.groups).to.deep.equal([]);
  });

  it('should reset current state tree to default one', () => {
    let clonedData = _.cloneDeep(data);

    let newStateTree = reducer(undefined, actions.setDefaultData(clonedData));
    let newStateTree2 = reducer(newStateTree, actions.setDefaultUi(ui));
    clonedData.flags.isLoaded = true;
    expect(newStateTree2.data).to.deep.equal(clonedData);
    expect(newStateTree2.ui).to.deep.equal(ui);
    let newStateTree3 = reducer(newStateTree2, actions.resetStateTree());

    expect(newStateTree3).to.deep.equal(defaultStateTree);
  });
});

describe.skip('dispatchers', () => {
  it('should dispatch an action to the store', (done) => {
    let payload;
    let action = actions.setDefaultStateTree(payload);
    let expectedActions = [ action ];
    let store = mockStore(defaultStateTree, expectedActions, done);
    store.dispatch(action)
  });

});

describe.skip('loaders', () => {
  // papaparse needs XMLHttpRequest, so jsdom
  jsdom()

  it('should parse csv to a json array', (done) => {
    loaders.csv(dataSource, options.model, options.ui)
      .then((result) => {
        console.log('----------------------------------------------------');
        console.log(utils.getDimensions(result));
        console.log('----------------------------------------------------');
        console.log(utils.getCurrentData(result));

        expect(result).to.be.an('object');
        expect(result.data).to.be.an('object');
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
});

describe.skip('loaders', () => {
  // papaparse needs XMLHttpRequest, so jsdom
  jsdom()

  it('should parse fdp to a json array', (done) => {

    loaders.fdp('http://localhost:8080/dist/fdp.json', options.ui)
      .then((result) => {
        console.log('----------------------------------------------------');
        //console.log(utils.getDimensions(result));
        //console.log('----------------------------------------------------');
        //console.log(utils.getCurrentData(result));
        console.log(result.data.headers);

        expect(result).to.be.an('object');
        expect(result.data).to.be.an('object');
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
});
