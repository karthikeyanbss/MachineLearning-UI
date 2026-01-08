Param(
  [Parameter(Mandatory=$true)][string] $ResourceGroup,
  [Parameter(Mandatory=$true)][string] $Location,
  [Parameter(Mandatory=$true)][string] $StorageAccountName,
  [string] $SubscriptionId
)

if ($SubscriptionId) { az account set --subscription $SubscriptionId }

Write-Host "Creating resource group $ResourceGroup in $Location"
az group create -n $ResourceGroup -l $Location | Out-Null

Write-Host "Creating storage account $StorageAccountName"
az storage account create --name $StorageAccountName --resource-group $ResourceGroup --location $Location --sku Standard_LRS --kind StorageV2 --allow-blob-public-access true | Out-Null

Write-Host "Enable static website (index.html, 404 -> index.html)"
az storage blob service-properties update --account-name $StorageAccountName --static-website --index-document index.html --404-document index.html | Out-Null

Write-Host "Building app"
npm ci
npm run build

Write-Host "Uploading ./dist to $web"
az storage blob upload-batch --account-name $StorageAccountName --source ./dist --destination '$web' --overwrite --auth-mode login

$endpoint = az storage account show -n $StorageAccountName -g $ResourceGroup --query "primaryEndpoints.web" -o tsv
Write-Host "Deployment finished. Site URL: $endpoint"
