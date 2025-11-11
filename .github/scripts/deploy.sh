#!/bin/bash
set -e # Exit immediately if a command exits with a non-zero status.

APP_DIR=$1
TEMP_DIR=/tmp/deployment_temp
BACKUP_DIR=/tmp/deployment_backup

echo "--- Starting Deployment of WoF ---"

echo "1. Stopping the app service gracefully"
sudo systemctl stop wof.service || true

echo "2. Backup current production files to $BACKUP_DIR"
mkdir -p $BACKUP_DIR
sudo rsync -av --delete $APP_DIR/ $BACKUP_DIR/ || true

echo "3. Extracting frontend and backend artifacts..."
sudo unzip -o $TEMP_DIR/frontend-artifact.zip -d $APP_DIR/public
sudo unzip -o $TEMP_DIR/backend-artifact.zip -d $APP_DIR/backend

echo "4. Apply correct ownership to app dir"
sudo chown -R $USER:www-data $APP_DIR 

echo "4. Starting the app service"
sudo systemctl start wof.service

echo "5. Cleaning up temporary deployment files..."
rm -rf $TEMP_DIR

echo "--- Deployment Complete! ---"