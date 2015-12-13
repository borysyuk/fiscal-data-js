import _ from 'lodash'

function createDataStorage() {
  this.storage = {}
  this.index = 0

  this.set = function (data) {
    var key = 'key' + this.index++
    this.storage[ key ] = data
    return key
  }

  this.get = function (key) {
    return this.storage[ key ]
  }
}

export const simpleDataStorage = new createDataStorage()