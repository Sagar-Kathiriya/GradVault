param(
    [string]$ImageName = "gradvault-test"
)

$ErrorActionPreference = "Stop"

Write-Host "Building Docker image: $ImageName" -ForegroundColor Cyan

docker build -t $ImageName .

Write-Host "Running tests in Docker image: $ImageName" -ForegroundColor Cyan

docker run --rm $ImageName
