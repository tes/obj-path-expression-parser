//const toPath = require('lodash/toPath');
// const regexpExec = require('iter-tools/lib/regexp-exec');
// const map = require('iter-tools/lib/map');
//
//
// function* toPath(path) {
//   const pathRE = new RegExp(
//     '\\[' + // the open [
//     '([^\\]^\\[]*)' + // anything that is not a bracket
//     '\\]' + // closed ]
//     '|' + // or
//     '([^\\. \\[\\]]+)' // any non empty string without dots/brackets
//     , 'g')
//   yield* map((result) => result[1] || result[2], regexpExec(pathRE, path));
// }
//

const regexpExec = require('iter-tools/lib/regexp-exec');
const enumerate = require('iter-tools/lib/enumerate');

function getRuleFromMatch(grammar, result) {
  for (const [i, rule] of enumerate(grammar)) {
    if (result[i + 1] !== undefined) {
      return rule;
    }
  }
}

function* tokenize(grammar, str) {
  const tokenRE = new RegExp(grammar.map((rule) => `(${rule.re})`).join('|'), 'g');
  for (const result of regexpExec(tokenRE, str)) {
    const rule = getRuleFromMatch(grammar, result);
    yield {
      str: result[0],
      name: rule.name,
      index: result.index,
    }
  }
}

const grammar = [
  {
    name: 'text',
    re: '[^\\.\\[\\]]+',
  },
  {
    name: 'separator',
    re: '[\\.\\[\\]]',
  }
];

function* toPath2(path) {
  if (Array.isArray(path)) {
    yield* path;
    return;
  }

  if (path === undefined) {
    return;
  }
  let buffer = '';
  let numSquaresOpen = 0;
  for (const token of tokenize(grammar, path)) {
    console.log(token)
    if (numSquaresOpen) {
      if (token.str === '[') {
        numSquaresOpen++;
      } else if (token.str === ']') {
        numSquaresOpen--;
      }

      if (numSquaresOpen) {
        buffer += token.str;
      } else {
        yield buffer;
        buffer = '';
      }
    } else if (token.str === '.') {
      yield buffer;
      buffer = '';
    } else if (token.str === '[') {
      numSquaresOpen++;
      if (buffer) {
        yield buffer;
        buffer = '';
      }
    } else if (token.str === ']') {
      throw new Error('Unexpected closed bracket');
    } else {
      buffer += token.str;
    }
  }
  if (buffer) yield buffer;
}

function* toPath(path) {
  // if (Array.isArray(path)) {
  //   yield* path;
  //   return;
  // }
  //
  if (path === undefined) {
    return;
  }
  let buffer = '';
  let numSquaresOpen = 0;
  for (const letter of path) {
    if (numSquaresOpen) {
      if (letter === '[') {
        numSquaresOpen++;
      } else if (letter === ']') {
        numSquaresOpen--;
      }

      if (numSquaresOpen) {
        buffer += letter;
      } else {
        yield buffer;
        buffer = '';
      }
    } else if (letter === '.') {
      yield buffer;
      buffer = '';
    } else if (letter === '[') {
      numSquaresOpen++;
      if (buffer) {
        yield buffer;
        buffer = '';
      }
    } else if (letter === ']') {
      throw new Error('Unexpected closed bracket');
    } else {
      buffer += letter;
    }
  }
  if (buffer) yield buffer;
}


module.exports = toPath;
