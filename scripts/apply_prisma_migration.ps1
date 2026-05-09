# PowerShell helper to run prisma migrations (for local dev or CI agents)
# Usage: ./scripts/apply_prisma_migration.ps1

if (-not $env:DATABASE_URL) {
  Write-Host "ERROR: DATABASE_URL environment variable is not set" -ForegroundColor Red
  exit 1
}

Write-Host "Applying Prisma migrations (deploy)..." -ForegroundColor Green
npm ci
npx prisma migrate deploy

if ($LASTEXITCODE -ne 0) {
  Write-Host "Prisma migrate deploy failed" -ForegroundColor Red
  exit $LASTEXITCODE
}

Write-Host "Generating Prisma client..." -ForegroundColor Green
npx prisma generate
if ($LASTEXITCODE -ne 0) {
  Write-Host "Prisma generate failed" -ForegroundColor Red
  exit $LASTEXITCODE
}

Write-Host "Migrations applied and client generated." -ForegroundColor Green