#!/bin/bash

source .env

echo "Copying package to $DEPLOY_HOST"
scp dist/gek.tar.gz $DEPLOY_USER@$DEPLOY_HOST:$DEPLOY_TARGET/gek
echo "Done"
echo "Executing remote deploy script"
ssh $DEPLOY_USER@$DEPLOY_HOST "cd $DEPLOY_TARGET/scripts && ./deployGek.sh"