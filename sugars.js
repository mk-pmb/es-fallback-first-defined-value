/*jslint indent: 2, maxlen: 80, node: true */
/* -*- tab-width: ? -*- */
'use strict';

// Suppose a robot that can add sugar cubes to beverages.
// Let's mock some beverage scan result and config file data:

var bev = { icon: '\u2615', color: 'sandybrown', opacity: 0.1, temp: 'hot' },
  cfg = { defaultSugars: 0, sugarsByColor: { red: 2 } };

// Some utility functions

function fail(why) { throw new Error(why); }
function isDefined(x) { return (x !== undefined); }

// Methods for determining how many sugars to add, in order of priority:

function guessFromColor(bev) { return cfg.sugarsByColor[bev.color]; }
function queryHwdb() { return queryHwdb.errNotFound; }
function surpriseMe() { return ((Math.random() * 42) + 0.2); }

// Let's determine the highest-priority answer!


console.log("The clean but bulky way:", (function ifReturnCopypasta() {

  var n = guessFromColor(bev);
  if (n !== undefined) { return n; }

  n = queryHwdb(bev.idVendor, bev.idProduct);
  if (n !== undefined) { return n; }

  n = (cfg || false).defaultSugars;
  if (n !== undefined) { return n; }

  return surpriseMe(bev);

}()));


console.log("Can't just use ||:",
  (guessFromColor(bev)
    || queryHwdb(bev.idVendor, bev.idProduct)
    || ((cfg || false).defaultSugars)
    || surpriseMe(bev)
  )
  );


console.log("Wrapper object via helper function:", (function () {

  function wrapIfDefined(x) { return ((x !== undefined) && { wrapped: x }); }

  return (wrapIfDefined(guessFromColor(bev))
    || wrapIfDefined(queryHwdb(bev.idVendor, bev.idProduct))
    || wrapIfDefined((cfg || false).defaultSugars)
    || { wrapped: surpriseMe(bev) }).wrapped;

}()));


console.log("Cleaner looking wrapper function:", (function () {

  return [
    guessFromColor(bev),
    queryHwdb(bev.idVendor, bev.idProduct),
    (cfg || false).defaultSugars,
    surpriseMe(bev)
  ].find(isDefined);
  // ^-- Returns undefined if no items match, and since undefined is the
  //     only unacceptable value for a regular ?|, that's indistinguishable
  //     from returning the last item.

  // Problem: Always calculates all values, even if the first one is a match.
}()));


console.log("Use lots of functions:", (function () {

  function firstDefining() {
    var idx, currentValue;
    for (idx = 0; idx < arguments.length; idx += 1) {
      currentValue = arguments[idx]();
      if (currentValue !== undefined) { break; }
    }
    return currentValue;
  }

  return firstDefining(
    function () { return guessFromColor(bev); },
    function () { return queryHwdb(bev.idVendor, bev.idProduct); },
    function () { return (cfg || false).defaultSugars; },
    function () { return surpriseMe(bev); }
  );

  // Problem: Always calculates all values, even if the first one is a match.
}()));


console.log("New syntax to the rescue!",
  (guessFromColor(bev)
    ?| queryHwdb(bev.idVendor, bev.idProduct)
    ?| (cfg || false).defaultSugars
    ?| surpriseMe(bev)
  )
  );


// But what about libraries that prefer to return null?

queryHwdb.errNotFound = null;
function n2u(x) { return (x === null ? undefined : x); }

console.log("Still cleaner than the wrapper objects:",
  (guessFromColor(bev)
    ?| n2u(queryHwdb(bev.idVendor, bev.idProduct))
    ?| (cfg || false).defaultSugars
    ?| surpriseMe(bev)
  )
  );


// What if I totally need {undefined} in my set of acceptable values?

function isAcceptableValue(x) {
  if (x === undefined) { return true; }
  if ((typeof x === 'number') && (x !== +x)) { return true; }
  if (x === 23) { return true; }
  return false;
}

console.log("Custom decider function: reminds of ternary operator",
  ( ?| isAcceptableValue
    : guessFromColor(bev)
    : n2u(queryHwdb(bev.idVendor, bev.idProduct))
    : (cfg || false).defaultSugars
    : surpriseMe(bev)
    // Beware: If there was no acceptable value, you still get the last one!
    // So better append either a default or a last resort:
    : fail('No acceptable value!')
  )
  );







