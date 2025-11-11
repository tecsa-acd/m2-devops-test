#!/bin/bash
set -e # Exit immediately if a command exits with a non-zero status.

APP_DIR=$1
TEMP_DIR=/tmp/deployment_temp
BACKUP_DIR=/tmp/deployment_backup

echo "--- Starting Deployment of WoF ---"

echo "1. Stopping the app service gracefully"
# Use 'sudo' as the deploy user to run systemctl without password (per sudoers config)
sudo systemctl stop wof.service || true

echo "2. Backup current production files from $APP_DIR to $BACKUP_DIR"
sudo rsync -av --delete $APP_DIR/ $BACKUP_DIR/ || true

echo "3. Extracting frontend and backend artifacts..."
sudo unzip -o $TEMP_DIR/artifacts/frontend-artifact.zip -d $APP_DIR/public
sudo unzip -o $TEMP_DIR/artifacts/backend-artifact.zip -d $APP_DIR/backend

echo "4. Apply correct ownership to app dir"
# $USER is the deploy user running the script via SSH.
sudo chown -R $USER:$USER $APP_DIR 

echo "5. Starting the app service"
sudo systemctl start wof.service

echo "6. Cleaning up temporary deployment files..."
# TEMP_DIR is assumed to exist from the scp-action setup.
#rm -rf $TEMP_DIR/*

echo "--- Deployment Complete! ---"