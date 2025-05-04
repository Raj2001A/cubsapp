Write-Host "Employee Management App - Netlify Deployment Script" -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "This script will help you deploy the Employee Management App to Netlify."
Write-Host ""
Write-Host "Prerequisites:" -ForegroundColor Yellow
Write-Host "- Node.js installed"
Write-Host "- Netlify CLI installed (npm install -g netlify-cli)"
Write-Host "- Netlify account"
Write-Host ""
Write-Host "Press any key to continue..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

Write-Host ""
Write-Host "Step 1: Building the application..." -ForegroundColor Green
Write-Host ""
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "Build failed. Please check the error messages above." -ForegroundColor Red
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "Step 2: Logging in to Netlify..." -ForegroundColor Green
Write-Host ""
netlify login
if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "Login failed. Please check the error messages above." -ForegroundColor Red
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "Step 3: Deploying to Netlify..." -ForegroundColor Green
Write-Host ""
netlify deploy --dir=dist --prod
if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "Deployment failed. Please check the error messages above." -ForegroundColor Red
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "Deployment completed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Your application is now available at the URL shown above."
Write-Host ""
Read-Host "Press Enter to exit"
