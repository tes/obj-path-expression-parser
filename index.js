const iterPathExpressions = require('./lib/iterPathExpressions')
const parse = require('./lib/parser')

module.exports = function * expandPathExpressions (pathStr, obj, customFunctions = {}) {
  const pathExpressions = parse(pathStr)
  yield * iterPathExpressions([[]], pathExpressions, obj, customFunctions)
}
