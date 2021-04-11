#!/bin/bash
rm -Rf ./vue-scheduler/dist/* &&
cp ./dist/* ./vue-scheduler/dist
rm -f ./vue-scheduler/dist/demo.html
