#/bin/sh

# cd to script path, avoid janky errors
cd src/server/

# if word is provided, query for word, otherwise, run normally
if [ $# -eq 0 ]
  then
    python text.py
  else
    if [ $# -eq 1 ]
      then
      python text.py --word=$1
    else
      echo 'Invalid number of arguments'
    fi
fi
