Write-Host "Employee Management System - Excel Data Import" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

# Check if file path is provided
if ($args.Count -eq 0) {
    Write-Host "No Excel file specified." -ForegroundColor Yellow
    Write-Host "Usage: .\import-excel-data.ps1 path\to\your\excel\file.xlsx"
    Write-Host ""
    Write-Host "Looking for default file (employee-data.xlsx) in current directory..." -ForegroundColor Yellow
    
    if (Test-Path -Path "employee-data.xlsx") {
        Write-Host "Found employee-data.xlsx" -ForegroundColor Green
        $excelFile = "employee-data.xlsx"
    } else {
        Write-Host "Default file not found." -ForegroundColor Red
        Write-Host "Please specify the path to your Excel file:"
        Write-Host ".\import-excel-data.ps1 path\to\your\excel\file.xlsx"
        exit 1
    }
} else {
    $excelFile = $args[0]
}

Write-Host ""
Write-Host "Using Excel file: $excelFile" -ForegroundColor Green
Write-Host ""

# Navigate to backend directory
Set-Location -Path "employee-management-backend"

# Run the import script
Write-Host "Running import script..." -ForegroundColor Green
Write-Host ""
npm run import-excel -- "$excelFile"

Write-Host ""
Write-Host "Import process completed." -ForegroundColor Green
Write-Host ""
Read-Host "Press Enter to exit"
