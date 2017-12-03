const { pathExpressions } = require('./grammar')

function parse (pathStr) {
  if (typeof pathStr !== 'string') {
    throw new Error('The path expression should be a string')
  }
  const tokens = `(${pathStr})`.split('') // wrap in "()" keeps syntax cleaner
  const token = tokens.shift()
  return pathExpressions(token, tokens)
}

module.exports = parse
