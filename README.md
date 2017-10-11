
<!-- SSI tags powered by npm://readme-ssi -->

Suppose a robot that can add sugar cubes to beverages.
It has several methods for determining how many sugars to add,
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

<!--#include file="sugars.js" start="  //§new-syntax" stop="  )"
  code="javascript" -->
<!--#verbatim lncnt="6" -->
```javascript
  (guessFromColor(bev)
    ?| queryHwdb(bev.idVendor, bev.idProduct)
    ?| (cfg || false).defaultSugars
    ?| surpriseMe(bev)
```
<!--/include-->

For `?|` with custom criteria, see the bottom of [sugars.js](sugars.js).



Q&amp;A
-------

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
  [ck-hz]: https://raw.githubusercontent.com/mk-pmb/misc/master/gfm-util/img/checkmark-has.gif "☑"
  [ck-up]: https://raw.githubusercontent.com/mk-pmb/misc/master/gfm-util/img/checkmark-up.gif "⟎"
  [ck-pt]: https://raw.githubusercontent.com/mk-pmb/misc/master/gfm-util/img/checkmark-partial.gif "◪"
  [ck-no]: https://raw.githubusercontent.com/mk-pmb/misc/master/gfm-util/img/checkmark-minus.gif "☐"

-----

License: ISC
