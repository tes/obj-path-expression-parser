// start with "{", ends with "}". Need to escape {}
function customFragment(token, tokens) {
  let escaping = false;
  let fragment = '';
  token = tokens.shift(); // remove opened {
  while (true) {
    if (!token) {
      throw new Error('A custom fragment requires "}" to terminate');
    }
    if (escaping) {
      if (token === '}' || token === '{') {
        fragment += token;
      } else {
        fragment += `\\${token}`;
      }
      escaping = false;
    } else if (token === '\\') {
      escaping = true;
    } else if (token === '}') {
      break;
    } else {
      fragment += token;
    }
    token = tokens.shift();
  }
  return { _type: 'customFragment', fragment };
}

// start with "[", ends with "]". Need to escape []
function escapedFragment(token, tokens) {
  let escaping = false;
  let fragment = '';
  token = tokens.shift(); // remove opened [
  while (true) {
    if (!token) {
      throw new Error('An escaped fragment requires "]" to terminate');
    }
    if (escaping) {
      if (token === ']' || token === '[') {
        fragment += token;
      } else {
        fragment += `\\${token}`;
      }
      escaping = false;
    } else if (token === '\\') {
      escaping = true;
    } else if (token === ']') {
      break;
    } else {
      fragment += token;
    }
    token = tokens.shift();
  }
  return { _type: 'escapedFragment', fragment };
}

// start with any character that is not "[" or "{" or "("
// ends with: "end of string", ",", ".", "[", "(", "{"
// escape, spaces and parenthesis are not allowed
const spaceRe = /\s/;
function unescapedFragment(token, tokens) {
  let fragment = '';
  while (true) {
    if (!token || token === '.') {
      break;
    }
    if (token === '\\' || token === '}' || token === ']' || token === ')') {
      throw new Error(`An unescaped fragment can't contain "${token}"`);
    }
    if (spaceRe.test(token)) {
      throw new Error(`Spaces are not allowed in unescaped fragments`);
    }
    if (token === ',' || token === '{' || token === '[' || token === '(') {
      tokens.unshift(token);
      break;
    } else {
      fragment += token;
    }
    token = tokens.shift();
  }
  return { _type: 'unescapedFragment', fragment };
}

// ends with "," or with "end of string"
function pathExpression(token, tokens) {
  const expression = [];
  while (true) {
    if (!token) {
      break;
    }
    if (token === '}' || token === ']' || token === ')') {
      throw new Error(`A fragment can\'t start with "${token}"`);
    }

    if (token === ',') {
      break;
    }

    if (token === '[') {
      expression.push(escapedFragment(token, tokens));
    } else if (token === '(') {
      expression.push(pathExpressions(token, tokens));
    } else if (token === '{'){
      expression.push(customFragment(token, tokens));
    } else {
      expression.push(unescapedFragment(token, tokens));
    }
    token = tokens.shift();
  }
  return { _type: 'pathExpression', expression };
}

// can either start with "(" or anything else
// if it started with "(" it ends with ")"
// if it didn't start with "(" it ends with undefined
function pathExpressions(token, tokens) {
  const expressions = [];
  const wrappedInParenthesis = token === '(';
  if (wrappedInParenthesis) {
    token = tokens.shift();
  }
  while (true) {
    if (!wrappedInParenthesis && !token) {
      break;
    }
    if (!token) {
      throw new Error(`A path expression should end with ")"`);
    }
    if (wrappedInParenthesis && token === ')') {
      break;
    }
    expressions.push(pathExpression(token, tokens));
    token = tokens.shift();
  }
  return { _type: 'pathExpressions', expressions };
}

function parse(pathStr) {
  if (typeof pathStr !== 'string') {
    throw new Error('The path expression should be a string');
  }
  const tokens = pathStr.split('');
  const token = tokens.shift();
  return pathExpressions(token, tokens);
}

module.exports = parse;
