#!/bin/bash

if [[ -z "${SENDIT_API}" ]]; then
  echo "The SENDIT_API variable is not defined!"
  echo "Please define it with export SENDIT_API=http://your-api.com"
  exit
fi

if test "$#" -ne 1; then
    echo "Usage: ./sendit.sh FILE"
    exit
fi

FILE_PATH=$1
FILE_NAME="$(basename -- $FILE_PATH)"
echo "Uploading $FILE_PATH as $FILE_NAME"

ID=$(curl -X POST --data-binary @$FILE_PATH "$SENDIT_API/$FILE_NAME")
echo "Done, ID: $ID"