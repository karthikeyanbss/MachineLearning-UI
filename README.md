# NER API UI

React + Vite UI for testing a Named Entity Recognition (NER) API.

This repository contains a small React app that sends text to a remote NER API and displays highlighted entities.

Live API endpoint used in development:

- `https://ner-api.lemonbay-b25f13cd.eastus.azurecontainerapps.io/extract`

Deployment options included in this repo:

- Azure Blob Storage (Static Website) — recommended for this static site. See the `azure/` scripts and the GitHub Actions workflow `.github/workflows/azure-blob-static-deploy.yml`.
- (Removed) Docker/Container Apps workflow — this repo was switched to static blob hosting.

## Quick start (development)

Requirements:

- Node.js 18+ and npm

Install and run locally:

```bash
git clone https://github.com/karthikeyanbss/MachineLearning-UI.git
cd MachineLearning-UI
npm ci
npm run dev
```

Open `http://localhost:5173`.

## Build and deploy to Azure Blob Storage (one-shot)

Prerequisites:

- Azure CLI logged-in (via `az login`) and permissions to create resources or manage the target storage account.

Using the provided script (Linux/macOS):

```bash
./azure/create_storage_and_upload.sh <RESOURCE_GROUP> <LOCATION> <STORAGE_ACCOUNT_NAME> [SUBSCRIPTION_ID]
```

On Windows (PowerShell):

```powershell
.\azure\create_storage_and_upload.ps1 -ResourceGroup my-rg -Location eastus -StorageAccountName mystorageacct
```

CI/CD: push to `main` will trigger `.github/workflows/azure-blob-static-deploy.yml` which builds the site and uploads `./dist` to the storage account's `$web` container. Set these repo secrets:

- `AZURE_CREDENTIALS` (from `az ad sp create-for-rbac --sdk-auth`)
- `STORAGE_ACCOUNT_NAME`
- `RESOURCE_GROUP`

## API format

Single text POST to `/extract` with body:

```json
{ "text": "Your text here" }
```

Batch texts POST to `/extract/batch` with body:

```json
{ "texts": ["first text", "second text"] }
```

## Notes

- The repo includes `azure/` scripts for creating storage and uploading the built files.
- Docker and Container Apps CI were removed in favor of static blob hosting.

## License

MIT
