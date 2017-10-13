#!/bin/bash
# -*- coding: utf-8, tab-width: 2 -*-


function transtest_all () {
  export LANG{,UAGE}=en_US.UTF-8
  local SELFPATH="$(readlink -m "$BASH_SOURCE"/..)"
  cd "$SELFPATH" || return $?
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

  local COLORIZE_DIFF=colordiff
  </dev/null "$COLORIZE_DIFF" &>/dev/null || COLORIZE_DIFF=

  cleanup_tmp
  "${LINTER[@]}" *.js || return $?

  local INPUT_JS=
  for INPUT_JS in ../*.js; do
    transtest_one "${INPUT_JS#*/}" || return $?
  done

  cleanup_tmp
  echo; echo '+OK all tests passed.'
  return 0
}


function cleanup_tmp () {
  rm -- tmp.* ../tmp.*.trans.js 2>/dev/null
}


function find_first_prog () {
  which "$@" 2>/dev/null | grep -Pe '^/' -m 1; return $?
}


function loudfail {
  run_with_log "$@"
  local RV=$?
  if [ -n "$ERR_LOG" ]; then
    if [ -s "$ERR_LOG" ]; then
      sed -re 's~^~E: ~' -- "$ERR_LOG" >&2
      [ "$RV" == 0 ] && RV=1
    else
      rm -- "$ERR_LOG"
    fi
  fi
  [ "$RV" == 0 ] && return 0
  echo "E: rv=$RV, output:" >&2
  [ -n "$LOGFN" ] && nl -ba "$LOGFN" >&2
  return "$RV"
}


function run_with_log () {
  ( # <-- parens: limit scope of our "exec"s
    [ -z "$LOGFN" ] || exec >"$LOGFN" || return $?
    if [ -n "$ERR_LOG" ]; then
      exec 2>"$ERR_LOG" || return $?
    else
      exec 2>&1 || return $?
    fi
    "$@"
    return $?
  )
  return $?
}


function colorize_diff () {
  if [ -n "$COLORIZE_DIFF" ]; then
    diff "$@" | "$COLORIZE_DIFF"
    return "${PIPESTATUS[0]}"
  fi
  diff "$@"
  return $?
}


function transtest_one {
  case "$1" in
    tmp.* ) return 0;;
  esac
  local SRC_JS="../$1"
  local JS_BFN="$(basename "$SRC_JS" .js)"
  local TMP_BFN="tmp.$JS_BFN.trans"
  local TMP_JS="$TMP_BFN.js"

  echo -n "$JS_BFN: transpile… "
  LOGFN="$TMP_JS" ERR_LOG="$TMP_BFN".err \
    loudfail nodejs "$TRANS_CLI" "$SRC_JS" || return $?
  diff -sU 1 -- "$SRC_JS" "$TMP_JS" >"$TMP_BFN".diff

  mv --target-directory=.. -- "$TMP_JS" || return $?
  TMP_JS="../$TMP_JS"

  echo -n 'lint… '
  loudfail "${LINTER[@]}" "$TMP_JS" || return $?
  echo -n 'run… '
  LOGFN="$TMP_BFN".log loudfail "$NODE_BIN" "$TMP_JS" || return $?
  # mv --target-directory=. -- "$TMP_JS" || return $?

  local EXPECT_LOG="expected.$JS_BFN.log"
  local EXPECT_CMD=( cat -- "$EXPECT_LOG" )
  if [ ! -f "$EXPECT_LOG" ]; then
    EXPECT_LOG="default.ok (no $EXPECT_LOG)"
    EXPECT_CMD=( echo '+OK test passed' )
  fi

  local DE_RAND='de-randomize.sed'
  echo -n 'compare output: '
  loudfail colorize_diff -sU 16 --label "$EXPECT_LOG" \
    --label "$DE_RAND( $TMP_BFN.log )" \
    -- <("${EXPECT_CMD[@]}"
      ) <(sed -rf "$DE_RAND" -- "$TMP_BFN".log) || return $?

  return 0
}









[ "$1" == --lib ] && return 0; transtest_all "$@"; exit $?
