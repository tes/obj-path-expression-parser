const grammar = require('./parser/grammar')
const get = require('lodash/get')
const isArray = require('lodash/isArray')
const isPlainObject = require('lodash/isPlainObject')
const micromatch = require('micromatch')
const range = require('iter-tools/lib/range')
const map = require('iter-tools/lib/map')

const chain = require('iter-tools/lib/chain')

const sliceRE = /([-0-9]*):([-0-9]*)/

function * iterFragment (iterPath, fragment, obj) {
  const expression = fragment.fragment
  const slices = sliceRE.exec(expression)
  for (const path of iterPath) {
    const parent = path.length ? get(obj, path) : obj
    // is it slice ?
    const parentIsArray = isArray(parent)
    const parentIsObject = isPlainObject(parent)
    if (parentIsArray && slices) {
      // uses slice syntax
      const len = parent.length
      let start = slices[1] === '' ? 0 : parseInt(slices[1], 10)
      let end = slices[2] === '' ? len : parseInt(slices[2], 10)
      start = start >= 0 ? start : len + start
      end = end > 0 ? end : len + end
      yield * map((n) => path.concat(n), range({ start, end }))
    } else if (parentIsObject || parentIsArray) {
      // uses globbing on keys/indexes
      const matchingKeys = micromatch(Object.keys(parent), expression)
      // .map(parentIsArray ? (m) => parseInt(m, 10) : (m) => m)
      yield * matchingKeys.map((alt) => path.concat(alt))
    }
  }
}

function * iterPathExpression (iterPath, pathExpression, obj) {
  let currentIterPath = iterPath
  for (const fragment of pathExpression.expression) {
    if (fragment._type === grammar.unescapedFragment.name || fragment._type === grammar.escapedFragment.name) {
      currentIterPath = iterFragment(currentIterPath, fragment, obj)
    // } else if (fragment._type === grammar.customFragment.name) {
    //   currentIterPath = iterCustomFragment(currentIterPath, fragment, obj)
    } else if (fragment._type === grammar.pathExpressions.name) {
      currentIterPath = iterPathExpressions(currentIterPath, fragment, obj)
    } else {
      throw new Error('A path expression can only contain a fragment or nested path expressions')
    }
  }
  yield * currentIterPath || []
}

function * iterPathExpressions (iterPath, pathExpressions, obj) {
  const paths = Array.from(iterPath)
  const iterables = pathExpressions.expressions.map((pathExpression) =>
    iterPathExpression(paths, pathExpression, obj))
  yield * chain(...iterables)
}

module.exports = iterPathExpressions
