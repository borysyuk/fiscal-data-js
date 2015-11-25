import Promise from 'bluebird'
import Papa from 'papaparse'
import _ from 'lodash'

const papaOptions = {
  header: true,
  delimiter: ',',
  download: true
}

function makeModelStateTree(model, data) {
  _.forEach(_.keys(model.dimensions), (key) => {
    model.dimensions[key].values = _.unique(data, key)
  })
  return model
}

function filterData(data, filters) {
  let filtered = _.cloneDeep(data)
  _.forEach(filters, (f) => { filtered = _.filter(filtered, f) })
  return filtered
}

function groupData(data, model, selected) {
  let grouped = _.cloneDeep(data)
  let sums = {}
  _.forEach(selected.groups, (g) => {
    sums[g] = {}
    _.forEach(_.keys(model.measures), (m) => {
      sums[g][m] = _.sum(_.filter(grouped, g), (o) => { return parseInt(o[m]) })
    })
  })
  // TODO: THIS FUNCTION IS NOT COMPLETE. WE NEED TO RETURN A MODIFIED GROUP
  return grouped
}

function makeCurrentState(data, model, selected) {
  return groupData(filterData(data, selected.filters), model, selected)
}

function makeDataStateTree(data, model, ui) {
  const selected = ui.selections.dimensions
  const current = makeCurrentState(data, model, selected)
  return {
    headers: _.keys(data[0]),
    values: data,
    states: {
      past: [],
      current: current,
      future: []
    }
  }
}

function makeUIStateTree(ui) {
  return ui
}

Papa.parsePromise = function(dataSource) {
  let parsedData = []
  function stepper(row) {
    parsedData.push(row.data[0])
  }
  return new Promise((resolve, reject) => {
    let papaHandlers = { step: stepper, complete: resolve }
    Papa.parse(dataSource, _.merge(papaOptions, papaHandlers));
  }).then((results) => {
    return parsedData
  });
};

export function csv(dataSource, model, ui) {
  return Papa.parsePromise(dataSource)
    .then((data) => {
      return {
        model: makeModelStateTree(model, data),
        data: makeDataStateTree(data, model, ui),
        ui: makeUIStateTree(ui)
      }
    })
}
