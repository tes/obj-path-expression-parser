const { includes } = require('./utils')

// start with "{", ends with "}". Need to escape {}
function customFragment (token, tokens) {
  let escaping = false
  let fragment = ''
  token = tokens.shift() // remove opened {
  while (true) {
    if (!token) {
      throw new Error('A custom fragment requires "}" to terminate')
    }
    if (escaping) {
      if (includes('{}', token)) {
        fragment += token
      } else {
        fragment += `\\${token}`
      }
      escaping = false
    } else if (token === '\\') {
      escaping = true
    } else if (token === '}') {
      break
    } else {
      fragment += token
    }
    token = tokens.shift()
  }
  return { _type: customFragment.name, fragment }
}

// start with "[", ends with "]". Need to escape []
function escapedFragment (token, tokens) {
  let escaping = false
  let fragment = ''
  token = tokens.shift() // remove opened [
  while (true) {
    if (!token) {
      throw new Error('An escaped fragment requires "]" to terminate')
    }
    if (escaping) {
      if (includes('[]', token)) {
        fragment += token
      } else {
        fragment += `\\${token}`
      }
      escaping = false
    } else if (token === '\\') {
      escaping = true
    } else if (token === ']') {
      break
    } else {
      fragment += token
    }
    token = tokens.shift()
  }
  return { _type: escapedFragment.name, fragment }
}

// start with any character that is not "[" or "{" or "("
// ends with: "end of string", ",", ".", "("
// escape, spaces and parenthesis are not allowed
const spaceRe = /\s/
function unescapedFragment (token, tokens) {
  let fragment = ''
  while (true) {
    if (!token || token === '.') {
      break
    }
    if (token === ')') {
      tokens.unshift(token)
      break
    }
    if (includes('\\}]', token)) {
      throw new Error(`An unescaped fragment can't contain "${token}"`)
    }
    if (spaceRe.test(token)) {
      throw new Error(`Spaces are not allowed in unescaped fragments`)
    }
    if (includes(',[{(', token)) {
      tokens.unshift(token)
      break
    } else {
      fragment += token
    }
    token = tokens.shift()
  }
  return { _type: unescapedFragment.name, fragment }
}

// ends with "," or with "end of string"
function pathExpression (token, tokens) {
  const expression = []
  while (true) {
    if (!token) {
      break
    }
    if (token === ')') {
      tokens.unshift(token)
      break
    }
    if (includes('}]', token)) {
      throw new Error(`A fragment can't contain "${token}"`)
    }

    if (token === ',') {
      break
    }

    if (token === '[') {
      expression.push(escapedFragment(token, tokens))
    } else if (token === '(') {
      expression.push(pathExpressions(token, tokens))
    } else if (token === '{') {
      expression.push(customFragment(token, tokens))
    } else {
      expression.push(unescapedFragment(token, tokens))
    }
    token = tokens.shift()
  }
  return { _type: pathExpression.name, expression }
}

// can either start with "(" or anything else
// if it started with "(" it ends with ")"
// if it didn't start with "(" it ends with undefined
function pathExpressions (token, tokens) {
  const expressions = []
  token = tokens.shift()
  while (true) {
    if (!token) {
      throw new Error(`A path expression should end with ")"`)
    }
    if (token === ')') {
      break
    }
    expressions.push(pathExpression(token, tokens))
    token = tokens.shift()
  }
  return { _type: pathExpressions.name, expressions }
}

module.exports = {
  customFragment,
  escapedFragment,
  pathExpression,
  pathExpressions,
  unescapedFragment
}
