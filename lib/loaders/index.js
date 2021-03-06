import 'isomorphic-fetch'
import Promise from 'bluebird'
import Papa from 'papaparse'
import _ from 'lodash'
import * as utils from '../utils'
import { simpleDataStorage } from '../utils/simpleDataStorage'

const papaOptions = {
  header: true,
  skipEmptyLines: true,
  delimiter: ',',
  download: true,
  chunkSize: 2000000000
}

function makeModelStateTree(data, model) {
  _.forEach(_.keys(model.dimensions), (key) => {
    model.dimensions[ key ].values = (_.unique(_.pluck(data, key))).sort()
  })
  return model
}

function filterData(data, filters) {
  let filtered = _.cloneDeep(data)
  _.forEach(filters, (f) => {
    filtered = _.filter(filtered, f)
  })
  return filtered
}

function getFields(data, model) {
  let result = {}
  let csvColumnsTitle = _.keys(data[ 0 ])
  let allowedColumnsName = utils.getAllowedColumns(model)
  let i = 0

  _.forEach(model.schema, (fieldInfo, fieldName) => {
    if ( _.contains(allowedColumnsName, fieldName) ){
      result[ fieldName ] = {title: (fieldInfo.title ? fieldInfo.title : csvColumnsTitle[ i ]) }
      i++
    }
  })

  return result
}

function makeDataStateTree(data, model) {
  return {
    fields: getFields(data, model),
    values: data,
    model: makeModelStateTree(data, model)
  }
}

function makeDefaultUIFromDataState(dataState) {
  let filters = {}
  let measures = []
  let groups = []
  let dimensionKeys = _.keys(dataState.model.dimensions)
  let measureKeys = _.keys(dataState.model.measures)

  if (dimensionKeys.length) {
    //if (dataState.model.dimensions[dimensionKeys[0]].values.length) {
    //  filters[dimensionKeys[0]] = dataState.model.dimensions[dimensionKeys[0]].values[dataState.model.dimensions[dimensionKeys[0]].values.length - 1];
    //}
    var index = 0;
    while (dataState.model.dimensions[dimensionKeys[index]].values.length <= 1) {
      index++
    }
    groups.push(dimensionKeys[ index ])
  }

  if (measureKeys.length) {
    measures.push(measureKeys[ 0 ])
  }

  return {selections: {dimensions: {filters: filters, groups: groups}, measures: measures}}
}

function makeUIStateTree(dataState, ui) {
  return Object.assign({}, ui, makeDefaultUIFromDataState(dataState))
}

Papa.parsePromise = function (dataSource, allowedColumns = []) {
  let parsedData = []

  function stepper(row) {
    if (row.errors.length == 0) {
      parsedData.push(
        (allowedColumns.length > 0) ? _.pick(row.data[ 0 ], allowedColumns) : row.data[ 0 ]
      )
    }
  }

  return new Promise((resolve, reject) => {
    let papaHandlers = {step: stepper, complete: resolve}
    Papa.parse(dataSource, _.merge(papaOptions, papaHandlers))
  }).then((results) => {
    return parsedData
  })
}

function makeStateTree(data, model, ui) {
  let dataState = makeDataStateTree(data, model)
  let uiState = makeUIStateTree(dataState, ui)
  return {
    data: dataState,
    ui: uiState
  }
}

export function csv(dataSource, model, ui) {
  return Papa.parsePromise(dataSource, utils.getAllowedColumns(model))
    .then((data) => {
      return makeStateTree(data, model, ui)
    })
}

function getResourcesUrlsFromFDP(fpdJSON, fdpUrl){
  return _.map(
    fpdJSON.resources,
    (resource) => {
      let parts = fdpUrl.split('/')
      parts[ parts.length - 1 ] = resource.path
      return (resource.path) ? parts.join('/') : resource.url
    }
  )
}

function getUrl(url, options) {
  return (options.proxy)? options.proxy.replace('{url}', encodeURIComponent(url)): url
}

function getMetaInfo(dataSource, fpdJSON) {
  let resources = []
  _.forEach(fpdJSON.resources, (resource) => {
    resources.push({
      name: resource.name,
      path: resource.path,
      url: resource.url
    });
  })
  return {
    url: dataSource,
    title: fpdJSON.title,
    description: _.isEmpty(fpdJSON.description) ? '' : fpdJSON.description,
    resources: resources
  }
}

export function fdp(dataSource, ui, options = {}) {
  return fetch(getUrl(dataSource, options))
      .then( (response) => { return response.text() } )
    .then(function (text) {
      let fpdJSON = JSON.parse(text)
      let model = utils.getModelFromFDP(fpdJSON)
      let urls = getResourcesUrlsFromFDP(fpdJSON, dataSource)
      if (options.onMetaInfoLoaded) {
        options.onMetaInfoLoaded(getMetaInfo(dataSource, fpdJSON))
      }

      return csv(getUrl(urls[ 0 ], options), model, ui).then((data) => {
        data.data.meta = getMetaInfo(dataSource, fpdJSON)
        return data
      })
    })
}

export function getCurrentData(state){

  let values = simpleDataStorage.get(state.data.values)
  var result = _.filter(values, state.ui.selections.dimensions.filters)

  let groupFields = state.ui.selections.dimensions.groups
  if (groupFields.length) {
    let groupedResults = _.groupBy(result,
      (record) => { return JSON.stringify( _.pick(record, groupFields)  )  } )

    let measure = _.first(state.ui.selections.measures)
    return _.map(groupedResults, (records) => {
      let res = _.extend({}, _.first(records))
      res[ measure ] = _.sum(records, measure )
      return res
    })
  }
  return result
}
