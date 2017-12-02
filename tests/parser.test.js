/* eslint-env node, mocha */
const { assert } = require('chai');
const parse = require('../lib/parser');

describe('parse', () => {
  it('throws an exception if no string', () =>
    assert.throws(() => parse({}), /should be a string/));

  it('throws an exception if begins with parenthesis', () =>
    assert.throws(() => parse(']'), /can't contain/));

  it('throws an exception leaving open parenthesis', () => {
    assert.throws(() => parse('{1'), /requires "}"/);
    assert.throws(() => parse('[1'), /requires "]"/);
    assert.throws(() => parse('(1'), /should end with "\)"/);
  });

  it('throws an exception with spaces in unescaped fragments', () =>
    assert.throws(() => parse('hello world'), /Spaces are not allowed/));

  describe('unescapedFragment', () => {
    it('convert simple path', () => {
      const a = parse('hello.world');
      assert.deepEqual(a, {
        _type: 'pathExpressions',
        expressions: [
          {
            _type: 'pathExpression',
            expression: [
              { _type: 'unescapedFragment', fragment: 'hello' },
              { _type: 'unescapedFragment', fragment: 'world' }
            ]
          }
        ]
      });
    });

    it('convert simple path (single item)', () => {
      const a = parse('hello');
      assert.deepEqual(a, {
        _type: 'pathExpressions',
        expressions: [
          {
            _type: 'pathExpression',
            expression: [
              { _type: 'unescapedFragment', fragment: 'hello' }
            ]
          }
        ]
      });
    });

    it('convert 2 simple paths', () => {
      const a = parse('hello.world,1.2');
      assert.deepEqual(a, {
        _type: 'pathExpressions',
        expressions: [
          {
            _type: 'pathExpression',
            expression: [
              { _type: 'unescapedFragment', fragment: 'hello' },
              { _type: 'unescapedFragment', fragment: 'world' }
            ]
          },
          {
            _type: 'pathExpression',
            expression: [
              { _type: 'unescapedFragment', fragment: '1' },
              { _type: 'unescapedFragment', fragment: '2' }
            ]
          }
        ]
      });
    });
  });

  describe('escapedFragment', () => {
    it('parse escaped', () => {
      const a = parse('hello[world],[1]2');
      assert.deepEqual(a, {
        _type: 'pathExpressions',
        expressions: [
          {
            _type: 'pathExpression',
            expression: [
              { _type: 'unescapedFragment', fragment: 'hello' },
              { _type: 'escapedFragment', fragment: 'world' }
            ]
          },
          {
            _type: 'pathExpression',
            expression: [
              { _type: 'escapedFragment', fragment: '1' },
              { _type: 'unescapedFragment', fragment: '2' }
            ]
          }
        ]
      });
    });

    it('parse adjacent escaped', () => {
      const a = parse('[1 x][2][3]');
      assert.deepEqual(a, {
        _type: 'pathExpressions',
        expressions: [
          {
            _type: 'pathExpression',
            expression: [
              { _type: 'escapedFragment', fragment: '1 x' },
              { _type: 'escapedFragment', fragment: '2' },
              { _type: 'escapedFragment', fragment: '3' }
            ]
          }
        ]
      });
    });

    it('use escape', () => {
      const a = parse('[a\\[b\\]c]');
      assert.deepEqual(a, {
        _type: 'pathExpressions',
        expressions: [
          {
            _type: 'pathExpression',
            expression: [
              { _type: 'escapedFragment', fragment: 'a[b]c' }
            ]
          }
        ]
      });
    });

    it('use escape before regulard token', () => {
      const a = parse('[a\\b]');
      assert.deepEqual(a, {
        _type: 'pathExpressions',
        expressions: [
          {
            _type: 'pathExpression',
            expression: [
              { _type: 'escapedFragment', fragment: 'a\\b' }
            ]
          }
        ]
      });
    });

    it('use double escape', () => {
      const a = parse('[a\\\\]');
      assert.deepEqual(a, {
        _type: 'pathExpressions',
        expressions: [
          {
            _type: 'pathExpression',
            expression: [
              { _type: 'escapedFragment', fragment: 'a\\\\' }
            ]
          }
        ]
      });
    });
  });

  describe('customFragment', () => {
    it('parse escaped', () => {
      const a = parse('hello{world},{1}2[3]');
      assert.deepEqual(a, {
        _type: 'pathExpressions',
        expressions: [
          {
            _type: 'pathExpression',
            expression: [
              { _type: 'unescapedFragment', fragment: 'hello' },
              { _type: 'customFragment', fragment: 'world' }
            ]
          },
          {
            _type: 'pathExpression',
            expression: [
              { _type: 'customFragment', fragment: '1' },
              { _type: 'unescapedFragment', fragment: '2' },
              { _type: 'escapedFragment', fragment: '3' }
            ]
          }
        ]
      });
    });

    it('parse adjacent escaped', () => {
      const a = parse('{1 x}{2}{3}');
      assert.deepEqual(a, {
        _type: 'pathExpressions',
        expressions: [
          {
            _type: 'pathExpression',
            expression: [
              { _type: 'customFragment', fragment: '1 x' },
              { _type: 'customFragment', fragment: '2' },
              { _type: 'customFragment', fragment: '3' }
            ]
          }
        ]
      });
    });

    it('use escape', () => {
      const a = parse('{a\\{b\\}c}');
      assert.deepEqual(a, {
        _type: 'pathExpressions',
        expressions: [
          {
            _type: 'pathExpression',
            expression: [
              { _type: 'customFragment', fragment: 'a{b}c' }
            ]
          }
        ]
      });
    });

    it('use escape before regulard token', () => {
      const a = parse('{a\\b}');
      assert.deepEqual(a, {
        _type: 'pathExpressions',
        expressions: [
          {
            _type: 'pathExpression',
            expression: [
              { _type: 'customFragment', fragment: 'a\\b' }
            ]
          }
        ]
      });
    });

    it('use double escape', () => {
      const a = parse('{a\\\\}');
      assert.deepEqual(a, {
        _type: 'pathExpressions',
        expressions: [
          {
            _type: 'pathExpression',
            expression: [
              { _type: 'customFragment', fragment: 'a\\\\' }
            ]
          }
        ]
      });
    });

  });

  describe('recursive pathExpressions', () => {
    it('use path expressions as fragment', () => {
      const a = parse('a(b,c)');
      assert.deepEqual(a, {
        _type: 'pathExpressions',
        expressions: [
          {
            _type: 'pathExpression',
            expression: [
              { _type: 'unescapedFragment', fragment: 'a' },
              {
                _type: 'pathExpressions',
                expressions: [
                  {
                    _type: 'pathExpression',
                    expression: [
                      { _type: 'unescapedFragment', fragment: 'b' }
                    ]
                  },
                  {
                    _type: 'pathExpression',
                    expression: [
                      { _type: 'unescapedFragment', fragment: 'c' }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      });
    });

    it('use path expressions as fragment (2)', () => {
      const a = parse('a(b,c)d');
      assert.deepEqual(a, {
        _type: 'pathExpressions',
        expressions: [
          {
            _type: 'pathExpression',
            expression: [
              { _type: 'unescapedFragment', fragment: 'a' },
              {
                _type: 'pathExpressions',
                expressions: [
                  {
                    _type: 'pathExpression',
                    expression: [
                      { _type: 'unescapedFragment', fragment: 'b' }
                    ]
                  },
                  {
                    _type: 'pathExpression',
                    expression: [
                      { _type: 'unescapedFragment', fragment: 'c' }
                    ]
                  }
                ]
              },
              { _type: 'unescapedFragment', fragment: 'd' }
            ]
          }
        ]
      });
    });

    it('use path expressions as fragment (2) with escaped', () => {
      const a = parse('[a]([b],[c])[d]');
      assert.deepEqual(a, {
        _type: 'pathExpressions',
        expressions: [
          {
            _type: 'pathExpression',
            expression: [
              { _type: 'escapedFragment', fragment: 'a' },
              {
                _type: 'pathExpressions',
                expressions: [
                  {
                    _type: 'pathExpression',
                    expression: [
                      { _type: 'escapedFragment', fragment: 'b' }
                    ]
                  },
                  {
                    _type: 'pathExpression',
                    expression: [
                      { _type: 'escapedFragment', fragment: 'c' }
                    ]
                  }
                ]
              },
              { _type: 'escapedFragment', fragment: 'd' }
            ]
          }
        ]
      });
    });

    it('use path expressions as fragment (start)', () => {
      const a = parse('(b,c)d');
      assert.deepEqual(a, {
        _type: 'pathExpressions',
        expressions: [
          {
            _type: 'pathExpression',
            expression: [
              {
                _type: 'pathExpressions',
                expressions: [
                  {
                    _type: 'pathExpression',
                    expression: [
                      { _type: 'unescapedFragment', fragment: 'b' }
                    ]
                  },
                  {
                    _type: 'pathExpression',
                    expression: [
                      { _type: 'unescapedFragment', fragment: 'c' }
                    ]
                  }
                ]
              },
              { _type: 'unescapedFragment', fragment: 'd' }
            ]
          }
        ]
      });
    });
  });
});
