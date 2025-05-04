@echo off
echo Employee Management System - Excel Data Import
echo =============================================
echo.

REM Check if file path is provided
if "%~1"=="" (
    echo No Excel file specified.
    echo Usage: import-excel-data.bat path\to\your\excel\file.xlsx
    echo.
    echo Looking for default file (employee-data.xlsx) in current directory...
    
    if exist employee-data.xlsx (
        echo Found employee-data.xlsx
        set EXCEL_FILE=employee-data.xlsx
    ) else (
        echo Default file not found.
        echo Please specify the path to your Excel file:
        echo import-excel-data.bat path\to\your\excel\file.xlsx
        exit /b 1
    )
) else (
    set EXCEL_FILE=%~1
)

echo.
echo Using Excel file: %EXCEL_FILE%
echo.

REM Navigate to backend directory
cd employee-management-backend

REM Run the import script
echo Running import script...
echo.
call npm run import-excel -- "%EXCEL_FILE%"

echo.
echo Import process completed.
echo.
pause
