#!/bin/bash
set -e # Exit immediately if a command exits with a non-zero status.

APP_DIR=$1
TEMP_DIR=/tmp/deployment_temp
BACKUP_DIR=/tmp/deployment_backup

echo "--- Starting Deployment of WoF ---"

# Ensure NVM is loaded so the 'npm' command is found.
# This assumes NVM is installed in the SSH_USER's home directory.
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion" # This loads nvm bash_completion
# ------------------------------------

echo "1. Stopping the app service gracefully"
# Use 'sudo' as the deploy user to run systemctl without password (per sudoers config)
sudo systemctl stop wof.service || true

echo "2. Backup current production files from $APP_DIR to $BACKUP_DIR"
sudo rsync -av --delete $APP_DIR/ $BACKUP_DIR/ || true

echo "3. Extracting frontend and backend artifacts..."
sudo unzip -o $TEMP_DIR/artifacts/frontend-artifact/frontend-artifact.zip -d $APP_DIR/public
sudo unzip -o $TEMP_DIR/artifacts/backend-artifact/backend-artifact.zip -d $APP_DIR/backend

echo "4. Apply correct ownership to app dir"
# $USER is the deploy user running the script via SSH.
sudo chown -R $USER:$USER $APP_DIR 
sudo chmod -R 755 $APP_DIR/public 

echo "4. Installing Production Dependencies"
# Crucial: Run install from the $APP_DIR root where package.json now resides
cd $APP_DIR/backend
npm install --production --prefer-offline 
cd - > /dev/null

#sudo chown -R $USER:$USER $APP_DIR 

echo "5. Starting the app service"
sudo systemctl start wof.service

echo "6. Cleaning up temporary deployment files..."
# TEMP_DIR is assumed to exist from the scp-action setup.
#rm -rf $TEMP_DIR/*

echo "--- Deployment Complete! ---"