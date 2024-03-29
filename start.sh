#!/bin/bash
# $1: first parameter for building different part of the service as follow:
# $1 == 0 --> build only server
# $1 == 1 --> build only client
# $1 == 2 --> build the system

if [ "$1" = "0"  ] || [ "$1" = "2" ]; then
    cd ./server || exit
    if [ "$1" = "2" ]; then
        echo 'running server detached...'
        npx nodemon index.js &
    else
        echo 'running server...'
        npx nodemon index.js
    fi
fi

if [ "$1" = "1"  ] || [ "$1" = "2" ]; then
    cd ../client || exit
    echo 'running client...'
    npm run dev
fi