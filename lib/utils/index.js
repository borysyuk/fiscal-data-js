import _ from 'lodash'

function getDimensionsColumnName(state) {
  return _.keys(state.data.model.dimensions)
}

export function getAllowedColumns(model) {
  return _.union(
    _.keys(model.dimensions),
    _.keys(model.measures)
  )
}

export function getDimensions(state) {
  var result = {}
  let columns = getDimensionsColumnName(state)

  _.forEach(
    columns,
    (item) => {
      result[ item ] = (_.uniq(_.pluck(state.data.values, item))).sort()
    })

  return result
}

export function getModelFromFDP(fdp) {
  var result = {schema: {}, measures: {}, dimensions: {}}
  let schema = {}
  if (fdp.resources[ 0 ].schema.fields.length) {
    _.forEach(fdp.resources[ 0 ].schema.fields, (field) => {
      schema[ field.name ] = field
    })
    result.schema = schema
  }

  _.forEach(
    fdp.mapping.measures,
    (measure) => {
      result.measures[ measure.source ] = {'currency': measure.currency}
    }
  )

  _.forEach(
    fdp.mapping.dimensions,
    (dimension) => {
      _.forEach(
        dimension.attributes,
        (attribute) => {
          let field = _.first(_.values(attribute))
          result.dimensions[ field.source ] = {'type': _.first(_.keys(attribute))}
        }
      )
    }
  )

  return result
}