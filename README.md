
<!-- SSI tags powered by npm://readme-ssi -->

Suppose a robot that can add sugar cubes to beverages.
It has several methods for determining how many sugars to add,
so there must be some code that determines the highest-priority answer.

In [sugars.js](sugars.js) I collect the approaches I could think of,
but they're all either rather bulky or won't work (as `||` won't stop
at `0`), so at the bottom I suggest a new fallback operator that stops
at the first defined (`!== undefined`) value, and one that stops at
the first acceptable value as decided by a custom function.


Syntax Preview
--------------

<!--#include file="sugars.js" start="//§new-syntax" stop="  )"
  code="javascript" -->
<!--#verbatim lncnt="7" -->
```javascript
console.log("New syntax to the rescue!",
  (guessFromColor(bev)
    ?| queryHwdb(bev.idVendor, bev.idProduct)
    ?| (cfg || false).defaultSugars
    ?| surpriseMe(bev)
```
<!--/include-->

For `?|` with custom criteria, see the bottom of [sugars.js](sugars.js).



Q&amp;A
-------

### Why not use `||`?

<!--#include file="sugars.js" start="//§why-not-or" stop="  )"
  code="javascript" -->
<!--#verbatim lncnt="7" -->
```javascript
console.log("Can't just use ||:",
  (guessFromColor(bev)
    || queryHwdb(bev.idVendor, bev.idProduct)
    || ((cfg || false).defaultSugars)
    || surpriseMe(bev)
```
<!--/include-->

If `guessFromColor()` already determined to use 0 sugars,
it's useless to waste CPU cycles on `queryHwdb`.
Users might even end up with a random number of sugars (`surpriseMe`)
although three better methods all clearly decided for 0.


### What if I want to accept `null` or `undefined` but not `false`?

Use custom criteria, as shown at the bottom of [sugars.js](sugars.js).

If it's just about `null`, vote a thumbs-up emoji on
[issue #4](https://github.com/mk-pmb/es-fallback-first-defined-value/issues/4).


### Is this a [Safe Navigation Operator][safe-nav-op]?

No. I'd really like to have an SNO in JavaScript as well,
but SNO is for diving deep into an object, whereas this proposal
is about a decision chain with several unrelated values.


### I don't care about people who want 0 sugars.

Then instead let's calclulare the amount of damage your character takes,
or how many ads to show before a funny cat video.





&nbsp;

  [safe-nav-op]: https://en.wikipedia.org/wiki/Safe_navigation_operator

-----

License: ISC
