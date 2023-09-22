#!/bin/bash
# This is a deploy script that will reside on the deployment host.
# It will create a backup of the current docker files for rollback,
# then build and start the containers.
echo ""
echo "~~~~~~ DEPLOYING GEK ~~~~~~"
echo ""
cd ../docker/gek-docker
echo "Bringing down the application..."
docker compose down
cd ../../gek
echo "Backing up docker files as ./gek/gek-rollback.tar.gz"
tar -czvf gek-rollback.tar.gz ../docker/gek-docker
echo "Deploying files..."
rm -rf ../docker/gek-docker
tar -xf gek.tar.gz -C ../docker/
cd ../docker/gek-docker
echo "Building docker containers..."
docker compose build
echo "Starting the docker containers..."
docker compose up -d
echo "Done."