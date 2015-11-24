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

function makeDataStateTree(data) {
  return {
    headers: _.keys(data[0]),
    values: data,
    states: {
      past: [],
      current: [],
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
        data: makeDataStateTree(data),
        ui: makeUIStateTree(ui)
      }
    })
}
