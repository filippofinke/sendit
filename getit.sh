#!/bin/bash

if [[ -z "${SENDIT_API}" ]]; then
  echo "The SENDIT_API variable is not defined!"
  echo "Please define it with export SENDIT_API=http://your-api.com"
  exit
fi

if test "$#" -ne 1; then
    echo "Usage: ./getit.sh ID"
    exit
fi

ID=$1
echo "Downloading ID: $ID"
curl -O -J "$SENDIT_API/$ID"
echo "Done!"