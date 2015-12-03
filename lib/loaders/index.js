import Promise from 'bluebird'
import Papa from 'papaparse'
import _ from 'lodash'
import * as utils from '../utils'
import fetch from "isomorphic-fetch"

const papaOptions = {
  header: true,
  delimiter: ',',
  download: true
}

function makeModelStateTree(data, model) {
  _.forEach(_.keys(model.dimensions), (key) => {
    model.dimensions[key].values = (_.unique(_.pluck(data, key))).sort();
  });
  return model
}

function filterData(data, filters) {
  let filtered = _.cloneDeep(data);
  _.forEach(filters, (f) => {
    filtered = _.filter(filtered, f)
  });
  return filtered
}

function groupData(data, model, selected) {
  let grouped = _.cloneDeep(data)
  let sums = {}
  _.forEach(selected.groups, (g) => {
    sums[g] = {}
    _.forEach(_.keys(model.measures), (m) => {
      sums[g][m] = _.sum(_.filter(grouped, g), (o) => {
        return parseInt(o[m])
      })
    })
  })
  // TODO: THIS FUNCTION IS NOT COMPLETE. WE NEED TO RETURN A MODIFIED GROUP
  return grouped
}

function makeCurrentState(data, model, selected) {
  return groupData(filterData(data, selected.filters), model, selected)
}

function makeDataStateTree(data, model) {
  if (!model.headers.length){
    model.headers = _.keys(data[0]);
  }
  return {
    headers: model.headers,
    values: data,
    model: makeModelStateTree(data, model)
  }
}

function makeDefaultUIFromDataState(dataState) {
  let filters = {};
  let measures = [];
  let dimensionKeys = _.keys(dataState.model.dimensions);
  let measureKeys = _.keys(dataState.model.measures);

  if (dimensionKeys.length) {
    if (dataState.model.dimensions[dimensionKeys[0]].values.length) {
      filters[dimensionKeys[0]] = dataState.model.dimensions[dimensionKeys[0]].values[dataState.model.dimensions[dimensionKeys[0]].values.length - 1];
    }
  }

  if (measureKeys.length) {
    measures.push(measureKeys[0]);
  }

  return {selections: {dimensions: {filters: filters, groups: []}, measures: measures}};
}

function makeUIStateTree(dataState, ui) {
  return Object.assign({}, ui, makeDefaultUIFromDataState(dataState));
}

Papa.parsePromise = function (dataSource, allowedColumns = []) {
  let parsedData = [];

  function stepper(row) {
    if (row.errors.length == 0) {
      parsedData.push(
        (allowedColumns.length > 0) ? _.pick(row.data[0], allowedColumns) : row.data[0]
      );
    }
  }

  return new Promise((resolve, reject) => {
    let papaHandlers = {step: stepper, complete: resolve};
    Papa.parse(dataSource, _.merge(papaOptions, papaHandlers));
  }).then((results) => {
    return parsedData
  });
};

function makeStateTree(data, model, ui) {
  let dataState = makeDataStateTree(data, model);
  let uiState = makeUIStateTree(dataState, ui);
  return {
    data: dataState,
    ui: uiState
  }
}

export function csv(dataSource, model, ui) {
  return Papa.parsePromise(dataSource, utils.getAllowedColumns(model))
    .then((data) => {
      return makeStateTree(data, model, ui);
    })
}

export function fdp(dataSource, ui) {
  return fetch(dataSource)
      .then( (response) => { return response.text() } ).
    then(function (text) {
      let fpdJSON = JSON.parse(text);
      let model = utils.getModelFromFDP(fpdJSON);
      return csv(fpdJSON.resources[0].url, model, ui);
    });
}

export function getCurrentData(state){
  var result = _.filter(state.data.values, state.ui.selections.dimensions.filters);

  let groupFields = state.ui.selections.dimensions.groups;
  if (groupFields.length) {
    let groupedResults = _.groupBy(result,
      (record) => { return JSON.stringify( _.pick(record, groupFields)  )  } );

    let measure = _.first(state.ui.selections.measures);
    return _.map(groupedResults, (records) => {
      // Aggregate
      // Extract fields
      // return Extracted Fields
      let res = _.extend({}, _.first(records));
      res[measure] = _.sum(records, measure );
      return res;
    });
  }
  return result;
}