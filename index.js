const expandFromATS = require('./lib/expandFromATS');
const parse = require('./lib/parser');

module.exports = function expandPathExpressions(pathStr, obj) {
  const ats = parse(pathStr);
  return expandFromATS(ats, obj);
};
