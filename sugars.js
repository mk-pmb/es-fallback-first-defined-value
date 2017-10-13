/*jslint indent: 2, maxlen: 80, node: true */
/* -*- tab-width: ? -*- */
'use strict';

// Suppose a robot that can add sugar cubes to beverages.
// Let's mock some beverage scan result and config file data:

var test = require('./test/lib_test.js'),
  bev = { icon: '\u2615', color: 'sandybrown', opacity: 0.1, temp: 'hot' },
  cfg = { defaultSugars: 0, sugarsByColor: { red: 2 } };

// Methods for determining how many sugars to add, in order of priority:

function guessFromColor(bev) { return cfg.sugarsByColor[bev.color]; }
function queryHwdb() { return queryHwdb.errNotFound; }
function surpriseMe() { return test.random.real(0, 42, 0.001); }


// Let's determine the highest-priority answer!


test("Temporary variable: clean but bulky and not DRY.", function () {
  var n = (function () {
    var tmp = guessFromColor(bev);
    if (tmp !== undefined) { return tmp; }

    tmp = queryHwdb(bev.idVendor, bev.idProduct);
    if (tmp !== undefined) { return tmp; }

    tmp = (cfg || false).defaultSugars;
    if (tmp !== undefined) { return tmp; }

    return surpriseMe(bev);
  }());
  test.eq('correct?', n, 0);
  test.sideEffects.none();
});


test("Can't just use ||:", function () {
  var n = (guessFromColor(bev)
    || queryHwdb(bev.idVendor, bev.idProduct)
    || (cfg || false).defaultSugars
    || surpriseMe(bev)
    );
  test.notStrictEqual(n, 0);
  test.eq('correct?', n, test.random.prev());
  test.sideEffects.had({ randomnessPoolCost: 1 });
});


function wrapIfDefined(x) { return ((x !== undefined) && { wrapped: x }); }
function unwrap(x) { return (x || false).wrapped; }

test("Wrapper object via or-chained helper functions:", function () {
  var n = (wrapIfDefined(guessFromColor(bev))
    || wrapIfDefined(queryHwdb(bev.idVendor, bev.idProduct))
    || wrapIfDefined((cfg || false).defaultSugars)
    || { wrapped: surpriseMe(bev) }).wrapped;
  // This works but is quite verbose.
  test.eq('correct?', n, 0);
  test.sideEffects.none();
});


test("Array literal's .find:", function () {
  function isDefined(x) { return (x !== undefined); }
  var n = [
    guessFromColor(bev),
    queryHwdb(bev.idVendor, bev.idProduct),
    (cfg || false).defaultSugars,
    surpriseMe(bev)
  ].find(isDefined);
  // ^-- Returns undefined if no items match.
  // That's ok: Since undefined is the only unacceptable value for a
  // regular ?|, it's indistinguishable from returning the last item.

  test.eq('correct?', n, 0);
  test.sideEffects.had({ randomnessPoolCost: 1 });
});


test("Wrap each expression in a function:", function () {
  function wrap1stDef(keep, f) { return (keep || wrapIfDefined(f())); }
  function firstDefining(fns) { return unwrap(fns.reduce(wrap1stDef, false)); }

  // The problem: You need a function for each expression.
  // Arrow functions don't solve that, they just obfuscate better. ;-)
  var n = firstDefining([
    function () { return guessFromColor(bev); },
    function () { return queryHwdb(bev.idVendor, bev.idProduct); },
    function () { return (cfg || false).defaultSugars; },
    function () { return surpriseMe(bev); }
  ]);

  test.eq('correct?', n, 0);
  test.sideEffects.none();
});


test("New syntax to the rescue!", function () {
  //§new-syntax
  var n = (guessFromColor(bev)
    ?| queryHwdb(bev.idVendor, bev.idProduct)
    ?| (cfg || false).defaultSugars
    ?| surpriseMe(bev)
    );
  //§

  test.eq('correct?', n, 0);
  test.sideEffects.none();
});


// But what about libraries that prefer to return null?
// (To accept null in the entire chain, read below about custom deciders.)

function n2u(x) { return (x === null ? undefined : x); }
queryHwdb.errNotFound = null;

test("Still cleaner than the wrapper objects:", function () {
  var n = (guessFromColor(bev)
    ?| n2u(queryHwdb(bev.idVendor, bev.idProduct))
    ?| (cfg || false).defaultSugars
    ?| surpriseMe(bev)
    );
  test.eq('correct?', n, 0);
  test.sideEffects.none();
});


// What if I totally need {undefined} in my set of acceptable values?

test("Custom decider function: reminds of ternary operator.", function () {

  function checkAcceptable(x) {
    test.sideEffects.add('valuesChecked');
    if (x === undefined) { return true; }
    if ((typeof x === 'number') && (x !== +x)) { return true; }
    if (x === 23) { return true; }
    return false;
  }

  //§custom-decider-func
  var n = ( ?| checkAcceptable
    : guessFromColor(bev)
    : n2u(queryHwdb(bev.idVendor, bev.idProduct))
    : (cfg || false).defaultSugars
    : surpriseMe(bev)
    // Beware: If there was no acceptable value, you still get the last one!
    // So better append either a default value, or a last resort:
    : test.fail('No acceptable value!')
    );
  //§
  test.eq('correct?', n, undefined);
  test.sideEffects.had({ valuesChecked: 1 });   // instant match
});








test.done();
