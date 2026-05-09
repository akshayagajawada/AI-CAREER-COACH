# Career Recommendations Database Migration Script
# This script creates the necessary database migration for the Career Recommendations feature

Write-Host "Creating Career Recommendations database migration..." -ForegroundColor Cyan

# Check if Prisma is installed
$prismaInstalled = Get-Command npx -ErrorAction SilentlyContinue
if (-not $prismaInstalled) {
    Write-Host "Error: Node.js and npm are required but not found." -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# Check if .env file exists
if (-not (Test-Path ".env")) {
    Write-Host "Warning: .env file not found!" -ForegroundColor Yellow
    Write-Host "Please create a .env file with your database connection and O*NET credentials." -ForegroundColor Yellow
    Write-Host "You can copy .env.example to .env as a starting point." -ForegroundColor Yellow
    
    $continue = Read-Host "Continue anyway? (y/n)"
    if ($continue -ne "y") {
        exit 1
    }
}

# Check for O*NET credentials
Write-Host "`nChecking O*NET API credentials..." -ForegroundColor Cyan
$envContent = if (Test-Path ".env") { Get-Content ".env" -Raw } else { "" }

if ($envContent -notmatch "ONET_USERNAME" -or $envContent -notmatch "ONET_PASSWORD") {
    Write-Host "Warning: O*NET credentials not found in .env file!" -ForegroundColor Yellow
    Write-Host "The feature requires O*NET API credentials to function." -ForegroundColor Yellow
    Write-Host "`nTo get credentials:" -ForegroundColor Cyan
    Write-Host "1. Visit https://services.onetcenter.org/" -ForegroundColor White
    Write-Host "2. Create a free account" -ForegroundColor White
    Write-Host "3. Add your credentials to .env:" -ForegroundColor White
    Write-Host "   ONET_USERNAME=your_username" -ForegroundColor Gray
    Write-Host "   ONET_PASSWORD=your_password" -ForegroundColor Gray
    Write-Host ""
}

# Generate Prisma client
Write-Host "`nGenerating Prisma client..." -ForegroundColor Cyan
try {
    npx prisma generate
    Write-Host "✓ Prisma client generated successfully" -ForegroundColor Green
} catch {
    Write-Host "Error generating Prisma client: $_" -ForegroundColor Red
    exit 1
}

# Create migration
Write-Host "`nCreating database migration..." -ForegroundColor Cyan
$migrationName = "add_career_recommendations"

try {
    npx prisma migrate dev --name $migrationName
    Write-Host "✓ Migration created successfully" -ForegroundColor Green
} catch {
    Write-Host "Error creating migration: $_" -ForegroundColor Red
    Write-Host "`nIf you're in production, use:" -ForegroundColor Yellow
    Write-Host "npx prisma migrate deploy" -ForegroundColor Gray
    exit 1
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Career Recommendations Feature Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan

Write-Host "`nNext steps:" -ForegroundColor Cyan
Write-Host "1. Add O*NET credentials to your .env file (if not already done)" -ForegroundColor White
Write-Host "2. Start your development server: npm run dev" -ForegroundColor White
Write-Host "3. Navigate to the Career Match section in the app" -ForegroundColor White
Write-Host "4. Generate your first career recommendations!" -ForegroundColor White

Write-Host "`nDocumentation: See CAREER_RECOMMENDATIONS.md for detailed usage" -ForegroundColor Gray
Write-Host ""
