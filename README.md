obj-path-expression-parser
==========================
A path expression is a string that matches a one or more values in an object.
This package exposes a generator "expressionParser" that with the given path expression and object, returns paths matching the expression.

Example:
```js
const expressionParser = require('obj-path-expression-parser');
const iter = expressionParser('hello.world', { hello: { world: 1 } });
Array.from(iter); // [['hello', 'world']]
```
The first argument "hello.world" is the path expression, the second is the object where the match happens. Only paths existing in the corresponding objects are returned!
```js
const iter = expressionParser('hello.world', {});
Array.from(iter); // [] no matches in the object!
```

Path expression syntax
======================
A path expression is formed by multiple path "fragments". A fragment is a string that tries to match an attribute:
```
hello.world
```
"hello" is a fragment matching the attribute "hello", and "world" matches the attribute "world" of the object inside "hello".
Fragments can be separated by dots of wrapped in square brackets. The following is equivalent to "hello.world":
```
[hello][world]
```
The difference is that between square brackets, you can use any character you need, including square brackets if escaped with "\".
You can mix the fragment of the 2 types:
```
[hello]world
```

Globbing
--------
Every fragment can use globbing to match attributes:
This matches any item contained in the "hello" or "world" attributes:
```
[hello|world][*]
```
The globbing library used is "micromatch". Check out for further details.
The library supports escaping using "\".


Slice syntax
------------
If the target item is an array, you can set a fragment to filter a specific slice of the array. If your object contains:
```
{ items: ['a', 'b', 'c', 'd'] }
```
You can specify the beginning and the end of the slice. It behaves in the same way as Array.prototype.slice:
```
items[:] // every item
```
Expands to:
* ['items', 0]
* ['items', 1]
* ['items', 2]
* ['items', 3]

```
items[1:] // every item except the first
```
Expands to:
* ['items', 1]
* ['items', 2]
* ['items', 3]

```
items[:2] // from the first to the second
```
Expands to:
* ['items', 0]
* ['items', 1]

```
items[:2] // from the first to the second
```
Expands to:
* ['items', 0]
* ['items', 1]

```
items[1:-1] // from the first to the one before the last one
```
Expands to:
* ['items', 1]
* ['items', 2]

Multiple expressions
--------------------
You can separate multiple path expressions with a comma:
```
a.b,x.y
```
returns the following paths (if they exist in the object):
```
[ ['a', 'b'], ['x', 'y']]
```

Nested Expression
-----------------
A nested expression is a path expression wrapped in round parenthesis, that is part of another path expression:
```
(products,services)items.prices
```
That expands to:
```
[
  ['products', 'items', 'prices'],
  ['services', 'items', 'prices']
]
```
Multiple levels of nesting are allowed:
```
(products.items,services(subscriptions,transactions))prices
```
That expands to:
```
[
  ['products', 'items', 'prices'],
  ['services', 'subscriptions', 'prices']
  ['services', 'transactions', 'prices']
]
```

Custom fragments
----------------
If you need to perform a more complex filtering you can use a custom fragment. A custom fragment is wrapped in curly braces and calls a custom function with an argument:
```
numbers[:]{mod 3}
```
In this case the function is "mod" and the argument is a string "3".
You need to pass the custom function to the expressionParser function:
```js
const customFunctions = {
  mod: (path, funcArgument, parent) => {
    const n = parseInt(funcArgument, 10)
    return parent % n === 0 ? [path] : []
  }
};

const iter = pathExpressionParser('numbers[:]{mod 3}',
  { numbers: [0, 1, 2, 3, 4, 5, 6, 7, 8] }, customFunctions);
```
The custom function takes as arguments:
* the current path being evaluated
* the argument ("3" in our example)
* the value where the current path is pointing

The function should return an iterable with the valid paths.
