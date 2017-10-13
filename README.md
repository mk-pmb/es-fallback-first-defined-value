
<!-- SSI tags powered by npm://readme-ssi -->

Suppose a robot that can add sugar cubes to beverages.
It has several methods for deciding how many sugars to add,
so there must be some code that determines the highest-priority answer.


The nonsolutions
----------------

Each of these have a code demo and comments about their problems
in [sugars.js](sugars.js):

| Strategy                  | nice code   | lazy eval   | correct result¹ |
|:------------------------- |:-----------:|:-----------:|:-----------:|
| temporary variable        | ![☐][ck-no] | ![☑][ck-hz] | ![☑][ck-hz] |
| just use &#124;&#124;     | ![☑][ck-hz] | ![☑][ck-pt] | ![☐][ck-no] |
| &#124;&#124; wrap(…)      | ![☐][ck-no] | ![☑][ck-hz] | ![☑][ck-hz] |
| [ …values ].find()        | ![☑][ck-hz] | ![☐][ck-no] | ![☑][ck-pt] |
| [ …functions ].reduce()   | ![☐][ck-no] | ![☑][ck-hz] | ![☑][ck-hz] |

¹ Without lazy eval, "correct result" can only be half because
gratuitous evaluation of the later expressions might have modified
the (meaning of the) result or might have thrown an Error.


New syntax to the rescue!
-------------------------

#### First defined value:

<!--#include file="sugars.js" start="  //§new-syntax" stop="  //§"
  code="javascript" -->
<!--#verbatim lncnt="7" -->
```javascript
  var n = (guessFromColor(bev)
    ?| queryHwdb(bev.idVendor, bev.idProduct)
    ?| (cfg || false).defaultSugars
    ?| surpriseMe(bev)
    );
```
<!--/include-->

  * Precedence like `||`
  * Picks the next value in the chain until it encounters a value
    that is defined (`!== undefined`).
  * Code from [sugars.js](sugars.js). More details there.


#### Custom decider function:

<!--#include file="sugars.js" start="  //§custom-decider-func" stop="  //§"
  code="javascript" -->
<!--#verbatim lncnt="11" -->
```javascript
  var n = ( ?| checkAcceptable
    : guessFromColor(bev)
    : n2u(queryHwdb(bev.idVendor, bev.idProduct))
    : (cfg || false).defaultSugars
    : surpriseMe(bev)
    // Beware: If there was no acceptable value, you still get the last one!
    // So better append either a default value, or a last resort:
    : test.fail('No acceptable value!')
    );
```
<!--/include-->

  * Precedence like `… ? … : …`
  * Picks the next value in the chain until it encounters a value
    for which the decider function returns a truthy value.
  * Code from [sugars.js](sugars.js). More details there.



Q&amp;A
-------

### Neat, where's the babel plugin?

I wish I had one.
For now the tests use a RegExp-based pseudo-transpiler.


### What if I want to accept `null` or `undefined` but not `false`?

Use a custom decider function.
If it's just about `null`, vote a thumbs-up emoji on
[issue #4](https://github.com/mk-pmb/es-fallback-first-defined-value/issues/4).

  * Update: The [Null Coalescing proposal][tc39-null-coal]
    seems to be just what you're looking for.


### Is this a [Safe Navigation Operator][safe-nav-op]?

No. I'd really like to have an SNO in JavaScript as well,
but SNO is for diving deep into an object, whereas this proposal
is about a decision chain with several unrelated values.

  * Update: [It's on the horizon.][tc39-opt-chain]


### I don't care about people who want 0 sugars.

Then instead let's calclulare the amount of damage your character takes,
or how many ads to show before a funny cat video.



Optional extensions
-------------------

Feature creep galore.

#### Individual criteria:

<!--#include file="flakes.js" start="  //§pseudo-method-if" stop="  //§"
  code="javascript" -->
<!--#verbatim lncnt="16" -->
```javascript
  (undefined        // <- redundant   // [1]
    ?|: pureWhite           cloud1()  // [2]
    ?|: colorful            cloud2()
    ?|: colorful            cloud3()
    ?|  undefined   // <- just to show you can mix them.
    ?|: (codepoint.odd)     cloud4()
    ?|: (codepoint.odd)     cloud5()
    ?|: (codepoint.even)    cloud6()
    ?|: ((Date.now() % 3) ? codepoint.odd : pureWhite)   cloud7()
    ?|: (codepoint.ascii)   cloud8()  // [3]
    ?|: dontBotherMe        cloud9()  // [4]
    ?|: colorful            auroraBorealis()
    ?|  { error: "Couldn't find any. :-(" }
  ),
```
<!--/include-->

  * Precedence of `|?:` is same as `|?`
  * `|?:` works mostly like `|?` but with a custom criterion
    for the (one) next candidate value.
    * If you want to avoid the above repetitions, just open a new
      level or parens for a chain with a custom decider function.
  * Code from [flakes.js](flakes.js). More details there.


#### Hindsight

  * Custom decider functions get the chain's previous value as 2nd argument.
    Details: [hindsight.js](hindsight.js)








&nbsp;

  [safe-nav-op]: https://en.wikipedia.org/wiki/Safe_navigation_operator
  [ck-hz]: https://raw.githubusercontent.com/mk-pmb/misc/master/gfm-util/img/checkmark-has.gif "☑"
  [ck-up]: https://raw.githubusercontent.com/mk-pmb/misc/master/gfm-util/img/checkmark-up.gif "⟎"
  [ck-pt]: https://raw.githubusercontent.com/mk-pmb/misc/master/gfm-util/img/checkmark-partial.gif "◪"
  [ck-no]: https://raw.githubusercontent.com/mk-pmb/misc/master/gfm-util/img/checkmark-minus.gif "☐"
  [tc39-null-coal]: https://github.com/gisenberg/proposal-null-coalescing
  [tc39-opt-chain]: https://github.com/TC39/proposal-optional-chaining

-----

License: ISC
