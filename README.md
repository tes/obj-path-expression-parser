obj-path-expression-parser
==========================
A path expression is a string that expands to an array of arrays. Each array is a path to a value in an object.
For example:
```
"a.b,c.d"
```
expands to:
```
[['a', 'b'], ['c', 'd']]
```

Features:
=========

Multiple expressions
--------------------

Regular expression matching
---------------------------

Slice notation
--------------

Filter
------

Escaping
--------

Nested Expression
-----------------

Syntax and parser internals
===========================

Path Expression
---------------
It is a comma separated list of paths. Gets parsed into an iterator of iterators (paths).
Example:
```
"a.b.c,d.e,f.g" -> [['a', 'b', 'c'], ['d', 'e'], ['f', 'g']]
```

Path
----
It is a list of fragments. There are many types of fragments:
* string fragment
* reg exp fragment
* slice fragment
* custom fragment
* nested path expression

Glob fragment
-------------
It is separated by dots:
```
"a" -> StringFragment "a"
```
or
```
[a]
```

Slice fragment
--------------

Custom fragment
---------------
```
{equal(arg1, arg2)}
```

Nested path expression
----------------------
```
a(b,c(1.2,3)) -> [['a', 'b'], ['a', 'c', '1', '2'], ['a', 'c', '3']]
```

Escape rules
------------
