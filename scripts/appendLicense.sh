#!/bin/bash

LICENSE="../../scripts/copyright.js"
CORE="../src/core"
GEN="../src/generator"
PRO="../src/processor"

function appendLicense {
  pushd $1
  echo "Appending: " $1
  for i in *.js
  do
    if ! grep -q Copyright $i
    then
      echo $i
      cat $LICENSE $i > $i.new && mv $i.new $i
    fi
  done
  popd
}

appendLicense $CORE
appendLicense $GEN
appendLicense $PRO