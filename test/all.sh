#!/bin/bash
# -*- coding: utf-8, tab-width: 2 -*-


function transtest_all () {
  export LANG{,UAGE}=en_US.UTF-8
  local SELFPATH="$(readlink -m "$BASH_SOURCE"/..)"
  cd "$SELFPATH" || return $?
  local BEST_DIFF="$(find_first_prog {color,}diff)"
  local NODE_BIN="$(find_first_prog node{js,})"

  [ -n "$TRANS_CLI" ] || local TRANS_CLI='transpile.cli.js'
  echo "I: Using transpiler '$TRANS_CLI'." \
    "You can set env var TRANS_CLI to try another one."

  local LINTER=(
    jsl
    elp
    jslint
    )
  LINTER=( "$(find_first_prog "${LINTER[@]}" true)" )
  case "$(basename "${LINTER[0]}" .js)" in
    jslint ) LINTER+=( --edition='2013-08-26' );;
  esac
  [ "${DEBUGLEVEL:-0}" -ge 4 ] && LINTER=( printf '<%s>\n' "${LINTER[@]}" )

  cleanup_tmp
  "${LINTER[@]}" *.js || return $?

  transtest_one 'sugars.js' || return $?

  # cleanup_tmp
  return 0
}


function cleanup_tmp () {
  rm -- tmp.* 2>/dev/null
}


function find_first_prog () {
  which "$@" 2>/dev/null | grep -Pe '^/' -m 1; return $?
}


function transtest_one {
  local SRC_JS="../$1"
  local JS_BFN="$(basename "$SRC_JS" .js)"
  local TMP_BFN="tmp.$JS_BFN.trans"
  nodejs "$TRANS_CLI" "$SRC_JS" >"$TMP_BFN".js || return $?
  diff -sU 1 -- "$SRC_JS" "$TMP_BFN".js >"$TMP_BFN".diff

  "${LINTER[@]}" "$TMP_BFN".js || return $?
  "$NODE_BIN" "$TMP_BFN".js >"$TMP_BFN".log 2>&1 || return $?

  local EXPECT_LOG="expected.$JS_BFN.log"
  local DE_RAND='de-randomize.sed'
  "$BEST_DIFF" -sU 16 --label "$EXPECT_LOG" \
    --label "$DE_RAND( $TMP_BFN.log )" \
    -- "$EXPECT_LOG" <(sed -rf "$DE_RAND" -- "$TMP_BFN".log) || return $?

  return 0
}









[ "$1" == --lib ] && return 0; transtest_all "$@"; exit $?
