import _ from 'lodash'

function getDimensionsColumnName(state) {
  return _.keys(state.data.model.dimensions);
}

export function getAllowedColumns(model) {
  return _.union(
    _.keys(model.dimensions),
    _.keys(model.measures)
  );
}

//export function filterDataByColumns(data, model){
//  return _.map(data, (object) => {return _.pick(object, getAllowedColumns(model))});
//}

export function getDimensions(state){
  var result = {};
  let columns = getDimensionsColumnName(state);

  _.forEach(
    columns,
    (item) => { result[item] = (_.uniq(_.pluck(state.data.values, item))).sort() });

  return result;
}

export function getModelFromFDP(fdp) {
  var result = {headers: {}, measures: {} , dimensions: {} };
  let schema = [];
  if (fdp.resources[0].schema.fields.length){
    _.forEach(fdp.resources[0].schema.fields, (field) => {schema[field.name] = field } )
    result.headers = _.pick(schema, 'title');
  }

  if (fdp.mapping.measures.length){
    _.map(
      fdp.mapping.measures,
      (measure) => { result.measures[measure.source] = {'currency': measure.currency, 'title': schema[measure.source].title} }
    );
  }

  if (fdp.mapping.dimensions.length){
    _.forEach(
      fdp.mapping.dimensions,
      (dimension) => {
        _.forEach(
          dimension.fields,
          (field) => { result.dimensions[field.source] = {'type': field.name, 'title': schema[field.source].title } }
        )
      }
    );
  }

  return result;
}