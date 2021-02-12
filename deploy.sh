#!/bin/bash -ex

# yarn run dist 
cp -R root/* dist/
# cp root/program.html dist/program.html

aws s3 sync ./dist s3://hotelfantastic.live

echo 'DONE!'
