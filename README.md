
Suppose a robot that can add sugar cubes to beverages.
It has several methods for determining how many sugars to add,
so there must be some code that determines the highest-priority answer.

In [sugars.js](sugars.js) I collect the approaches I could think of,
but they're all either rather bulky or won't work (as `||` won't stop
at `0`), so at the bottom I suggest a new fallback operator that stops
at the first defined (`!== undefined`) value, and one that stops at
the first acceptable value as decided by a custom function.


&nbsp;

License: ISC
