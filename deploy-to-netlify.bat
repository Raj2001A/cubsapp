@echo off
echo Employee Management App - Netlify Deployment Script
echo ===================================================
echo.
echo This script will help you deploy the Employee Management App to Netlify.
echo.
echo Prerequisites:
echo - Node.js installed
echo - Netlify CLI installed (npm install -g netlify-cli)
echo - Netlify account
echo.
echo Press any key to continue...
pause > nul

echo.
echo Step 1: Building the application...
echo.
call npm run build
if %ERRORLEVEL% neq 0 (
  echo.
  echo Build failed. Please check the error messages above.
  echo.
  pause
  exit /b 1
)

echo.
echo Step 2: Logging in to Netlify...
echo.
call netlify login
if %ERRORLEVEL% neq 0 (
  echo.
  echo Login failed. Please check the error messages above.
  echo.
  pause
  exit /b 1
)

echo.
echo Step 3: Deploying to Netlify...
echo.
call netlify deploy --dir=dist --prod
if %ERRORLEVEL% neq 0 (
  echo.
  echo Deployment failed. Please check the error messages above.
  echo.
  pause
  exit /b 1
)

echo.
echo Deployment completed successfully!
echo.
echo Your application is now available at the URL shown above.
echo.
echo Press any key to exit...
pause > nul
