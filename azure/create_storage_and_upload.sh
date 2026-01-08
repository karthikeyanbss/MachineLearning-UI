#!/usr/bin/env bash
set -euo pipefail

# Usage:
# ./create_storage_and_upload.sh <RESOURCE_GROUP> <LOCATION> <STORAGE_ACCOUNT_NAME> [<SUBSCRIPTION_ID>]
# Example:
# ./create_storage_and_upload.sh my-rg eastus mymlui2026

RESOURCE_GROUP=${1:-}
LOCATION=${2:-}
STORAGE_ACCOUNT=${3:-}
SUBSCRIPTION_ID=${4:-}

if [[ -z "$RESOURCE_GROUP" || -z "$LOCATION" || -z "$STORAGE_ACCOUNT" ]]; then
  echo "Usage: $0 <RESOURCE_GROUP> <LOCATION> <STORAGE_ACCOUNT_NAME> [SUBSCRIPTION_ID]"
  exit 2
fi

if [[ -n "$SUBSCRIPTION_ID" ]]; then
  echo "Setting subscription to $SUBSCRIPTION_ID"
  az account set --subscription "$SUBSCRIPTION_ID"
fi

echo "Creating resource group $RESOURCE_GROUP in $LOCATION"
az group create -n "$RESOURCE_GROUP" -l "$LOCATION"

echo "Creating storage account $STORAGE_ACCOUNT"
az storage account create \
  --name "$STORAGE_ACCOUNT" \
  --resource-group "$RESOURCE_GROUP" \
  --location "$LOCATION" \
  --sku Standard_LRS \
  --kind StorageV2 \
  --allow-blob-public-access true

echo "Enabling static website hosting (index.html + 404 -> index.html)"
az storage blob service-properties update \
  --account-name "$STORAGE_ACCOUNT" \
  --static-website \
  --index-document index.html \
  --404-document index.html

echo "Building the app (local)"
npm ci
npm run build

echo "Uploading ./dist to the \$web container"
if [[ -n "${AZURE_STORAGE_KEY:-}" ]]; then
  echo "Using AZURE_STORAGE_KEY for authentication"
  az storage blob upload-batch \
    --account-name "$STORAGE_ACCOUNT" \
    --account-key "$AZURE_STORAGE_KEY" \
    --source ./dist \
    --destination '
$web' \
    --overwrite
else
  az storage blob upload-batch \
    --account-name "$STORAGE_ACCOUNT" \
    --source ./dist \
    --destination '$web' \
    --overwrite \
    --auth-mode login
fi

# Get the web endpoint
ENDPOINT=$(az storage account show -n "$STORAGE_ACCOUNT" -g "$RESOURCE_GROUP" --query "primaryEndpoints.web" -o tsv)
echo "Deployment complete. Site URL: $ENDPOINT"
