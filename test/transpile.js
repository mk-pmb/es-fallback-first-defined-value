/*jslint indent: 2, maxlen: 80 */
/* -*- tab-width: 2 -*- */
/*global define: true, module: true, require: true */
((typeof define === 'function') && define.amd ? define : function (factory) {
  'use strict';
  var m = ((typeof module === 'object') && module), e = (m && m.exports);
  if (e) { m.exports = (factory(require, e, m) || m.exports); }
//})(function (require) {
})(function () {
  'use strict';

  var EX, arMap = Array.prototype.map, obAss = Object.assign;
  EX = function (code) { return EX.makeTranspiler()(code); };

  EX.shim = function stopAtFirstAcceptable___TRANSPILE_SHIM(dfltChk, list) {
    function isDefined(x) { return (x !== undefined); }
    var idx, item, chk, val, prev;
    if (prev !== undefined) { throw new Error('very strange bug'); }
    for (idx = 0; idx < list.length; idx += 1) {
      item = list[idx];
      chk = null;
      if (item.ifExpr) { chk = item.ifExpr(); }
      if (chk === null) { chk = dfltChk; }
      if (chk === null) { chk = isDefined; }
      if (typeof chk !== 'function') {
        throw new TypeError('Criterion must be either null or a function.');
      }
      //if (item.ifExpr) { console.error({ ifExprFunc: chk.name }); }
      // calculate the value expression only if we can check it.
      val = item.calc();
      if (chk(val, prev)) { break; }
      prev = val;
    }
    return val;
  };

  function unindentFuncDef(func) {
    func = String(func);
    func.replace(/\n +(?=\}$)/, function (ind) {
      func = func.replace(new RegExp(ind, 'g'), '\n');
    });
    return func;
  }

  function errIncompat() { throw new Error('Incompatible platform'); }
  function ifLen(x) { return ((x || false).length && x); }
  function indent(i, s) { return i + s.replace(/(\n+)/g, '$1' + i); }
  function isStr(x, no) { return (((typeof x) === 'string') || no); }
  function arrAdd(arr, items) { arr.push.apply(arr, items); }
  function v0id() { return; }

  function quot(x) {
    if (!isStr(x)) { return String(x); }
    return ('«' + x.replace(/\n/g, '¶\n\t\t^') + '»');
  }
  quot.rxObj = function (o) {
    if (!o) { return quot(o); }
    function quotKey(k) { return k + ':' + quot(o[k]); }
    o = obAss([], o);
    delete o.index;
    delete o.input;
    delete o.before;
    //delete o.after;
    return Object.keys(o).sort().map(quotKey).join(', ');
  };

  function rxm(s, r, g) {
    var m = r.exec(s);
    if (!m) { return false; }
    g = (g || r.groupNames);
    if (g && g.forEach) {
      g.forEach(function (k, i) {
        if (!k) { return; }
        m[k] = m[i];
        delete m[i];
      });
    }
    m.before = s.slice(0, m.index);
    m.after = s.slice(m.index + m[0].length);
    return m;
  }

  EX.shimDef = unindentFuncDef(EX.shim);
  if (!EX.shimDef.match(/\n +return /)) { errIncompat(); }
  EX.shimName = (EX.shim.name
    || rxm(EX.shimDef, /\w+_\w+/)[0]
    || errIncompat());

  function expr2func(ex, maxW) {
    ex = ex.replace(EX.rgx.eolComment, '').trim();
    var nl = (isStr(maxW) ? maxW : (ex.length < (maxW || 42) ? '' : '\n'));
    return ('function () {' + nl + (nl && ' ') +
      ' return ' + ex + ';' + (nl || ' ') + '}');
  }

  function expr2iife(ex, maxW) { return '(' + expr2func(ex, maxW) + '())'; }

  function expr2container(ex, opt) {
    var code = '{ calc: ' + expr2func(ex);
    opt = (opt || false);
    if (opt.ifExpr) { code += ', ifExpr: ' + expr2func(opt.ifExpr, 1); }
    return code + ' },';
  }

  function maxRepeatRgx(h, m, t) {
    m = +m;
    return (m > 0 ? (h + '{0,' + m + '}' + (t || '')) : '');
  }


  EX.rgx = (function () {
    function rx(r, f, g) {
      r = new RegExp(rx[r] || r, (f || ''));
      if (g) { r.groupNames = g; }
      return r;
    }
    function wr(o, c) {
      return obAss(function (r) { return o + r + c; }, { o: o, c: c });
    }
    var grp = wr('(', ')'), par = wr('\\(', '\\)'), brk = wr('[', ']');
    par.deep = '…(?:<§>…)*';
    par.deep = par.deep.replace(/§/g, par.deep
      ).replace(/§/g, par.deep
      ).replace(/</g, par.o).replace(/>/g, par.c);

    rx.flatSimpleExpr = grp('?:'
      + brk('\\w'
          + " -'"
          + '\\*-\\.'
          + ':->'
          + '@-\\uFFFF')
      + '|\\/(?!\\/|\\*)'
      + '|\\?(?!\\|)'
      ) + '{0,128}';
    rx.simpleExpr = par.deep.replace(/…|§/g, rx.flatSimpleExpr);
    rx.fbOp = '\\?\\|(?=\\.([a-z]\\w*)|)';
    rx.fallbackExprLine = rx('^(\\s*)' +
      grp('(?!\\s)' + rx.simpleExpr + '|') +
      grp(par.o + ' *|') +
      rx.fbOp +
      '\\s*', null, ['', 'ind', 'stmt', 'paren', 'prop']);
    rx.fbProp_if = rx('^\\.if' + par(grp(rx.simpleExpr)) + '\\s*',
      null, ['', 'cond']);
    rx.eolComment = / {2,}\/{2} +(\S[\S\s]*|)$/;

    return rx;
  }());


  EX.makeTranspiler = function () {
    // Currently not caring about AST and real parsing techniques,
    // just a quick hack to run simple examples.
    var tr = {}, inLn = [];
    tr.mode = 'scan';
    tr.addShimDef = true;
    tr.output = [];
    tr.warnings = [];
    tr.warn = function () {
      var msg = tr.mode + '@' + inLn.cur;
      arMap.call(arguments, function (a) {
        if (a === undefined) { return; }
        if (a === '') { return; }
        msg += ' ' + String(a);
      });
      tr.warnings.push(msg);
    };

    tr.mthd = function (n) {
      if (!n) { return v0id; }
      if (tr[n]) { return tr[n]; }
      tr.warn('no such method: tr.' + n);
      return v0id;
    };

    tr.readLine = function (ln, idx) {
      inLn.cur = idx;
      var m = rxm(ln, /^\s*\/{2}(debug\w*)=/);
      if (m) {
        tr[m[1]] = JSON.parse(m.after);
        return ln;
      }
      tr.debug = false;
      if (tr.debugNextLine > 0) {
        tr.debug = 'nxLn:' + tr.debugNextLine;
        tr.debugNextLine -= 1;
      }
      ln = tr.mthd(tr.mode)(ln);
      tr.output.push(ln);
    };

    tr.peek = function (o, n) {
      o = inLn.cur + (+o || 1);
      n = (+n || 1);
      if (n === 1) { return inLn[o]; }
      return inLn.slice(o, o + n);
    };

    tr.logMatch = function (m, hint) {
      tr.warn(hint, quot(inLn[inLn.cur]), quot.rxObj(m));
    };

    tr.scan = function (ln, m) {
      if (tr.addShimDef && ln.match(/^\w/)) {
        tr.output.push(EX.shimDef);
        tr.addShimDef = false;
      }
      m = rxm(ln, EX.rgx.fallbackExprLine);
      tr.mthd(tr.debug && 'logMatch')(m, 'fbl?');
      if (m) { return tr.scanFallbackExprLine(m, ln); }
      return ln;
    };

    tr.scanFallbackExprLine = function (m) {
      m.untilMaxIndent = m.ind.length;
      (function findStartingParen() {
        if (m.paren) {
          if (m.prop) {
            m.expr1 = 'undefined';
            return;
          }
          if (tr.peek().match(/^\s+:/)) {
            m.customDeciderExpr = m.after;
            m.untilMaxIndent += 2;
          }
          return;
        }
        // paren isn't in this line => rewind
        tr.exprListScrollback(m);
        if (m.stmt) { tr.logMatch(m, 'unexpected stmt w/o paren'); }
        m.stmt = m.prevStmt;
        m.ind = m.prevInd;
        m.expr1 = m.prevArgs;
      }());
      tr.mthd(tr.debug && 'logMatch')(m, 'scan |?');
      return tr.beginExprList(m);
    };

    tr.exprListScrollback = function (d, prev) {
      while ((prev || '').match(/^\s*($|\/{2})/)) { prev = tr.output.pop(); }
      d.prevLn = prev;
      var m = rxm(prev, /^(\s*)(\w[\w\.= ]*|)\(/, ['', 'ind', 'stmt']);
      if (!m) { return d; }
      d.prevInd = m.ind;
      d.prevStmt = m.stmt;
      d.prevArgs = m.after;
      return d;
    };

    tr.beginExprList = function (m) {
      var eli = tr.exprListItem, ind = (m.ind || ''), deci, code;
      eli.hadStmt = !!m.stmt;
      eli.until = new RegExp('^' + maxRepeatRgx('\\s', m.untilMaxIndent
        ) + '\\)', '');

      deci = (m.customDeciderExpr || 'null');
      if (deci.length > 23) { deci = expr2iife(deci, '\n  '); }

      code = (ind + (m.stmt || '') + EX.shimName + '(' + deci + ', [');
      ind += '  ';
      function wr(c) { code += '\n' + indent(ind, c); }

      if (m.expr1) { wr(expr2container(m.expr1)); }
      if (m.prop) { wr(tr.renderFallbackExprLine(m)); }
      tr.mthd(tr.debug && 'warn')('EL(', quot(code));
      tr.mode = 'exprListItem';
      return code;
    };

    tr.exprListItem = function eli(ln, m) {
      m = ln.match(eli.until);
      tr.mthd(tr.debug && 'warn')('EL until:', !!m, eli.until);
      if (m) {
        tr.mode = 'scan';
        if (eli.hadStmt) { ln = ln.replace(/^ {2}/, ''); }
        return ln.replace(/(\S)/, ']$1');
      }

      m = rxm(ln, /^(\s+):\s*/, ['', 'ind']);
      tr.mthd(tr.debug && 'logMatch')(m, 'EL:…');
      if (m) {
        m = indent(m.ind, expr2container(m.after));
        tr.mthd(tr.debug && 'warn')('EL :code', quot(m));
        return m;
      }

      m = rxm(ln, EX.rgx.fallbackExprLine);
      tr.mthd(tr.debug && 'logMatch')(m, 'EL|?');
      if (m) { return indent(m.ind, tr.renderFallbackExprLine(m)); }

      tr.mthd(tr.debug && 'logMatch')(m, 'EL¬');
      return ln;
    };

    tr.renderFallbackExprLine = function (m) {
      var code;
      if (m.prop) {
        code = tr.mthd('exprListProp_' + m.prop)(m);
        if (code) { return code; }
      }
      //tr.logMatch(m, 'eli:no_prop');
      return expr2container(m.after);
    };

    tr.exprListProp_if = function (m) {
      var code = m.after;
      m = rxm(code, EX.rgx.fbProp_if);
      tr.mthd(tr.debug && 'warn')('.if:', quot(code), quot.rxObj(m));
      if (!m) { return; }
      return expr2container(m.after, { ifExpr: m.cond });
    };



    return function (code) {
      if (code.split) { code = code.split(/\n/); }
      arrAdd(inLn, code);
      inLn.forEach(tr.readLine);
      return { code: tr.output.join('\n'),
        warnings: ifLen(tr.warnings, false) };
    };
  };









  return EX;
});
