@echo off
REM Firebase Rules Deployment Script for Windows
REM Deploys Firestore security rules and indexes

echo.
echo =======================================
echo Firebase Rules Deployment Script
echo =======================================
echo.

REM Check if Firebase CLI is installed
where firebase >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Firebase CLI not found!
    echo [INFO] Install it with: npm install -g firebase-tools
    exit /b 1
)

echo [OK] Firebase CLI found
echo.

REM Check if user is logged in
firebase projects:list >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Not logged into Firebase
    echo [INFO] Run: firebase login
    exit /b 1
)

echo [OK] Logged into Firebase
echo.

REM Show current project
echo Current Firebase project:
firebase use
echo.

REM Deploy Firestore rules
echo Deploying Firestore rules...
firebase deploy --only firestore:rules

if %ERRORLEVEL% EQU 0 (
    echo [OK] Firestore rules deployed successfully!
) else (
    echo [ERROR] Failed to deploy Firestore rules
    exit /b 1
)

echo.

REM Deploy Firestore indexes
echo Deploying Firestore indexes...
firebase deploy --only firestore:indexes

if %ERRORLEVEL% EQU 0 (
    echo [OK] Firestore indexes deployed successfully!
) else (
    echo [WARNING] Firestore indexes deployment had issues
    echo [INFO] You may need to create indexes manually via Firebase Console
)

echo.
echo =======================================
echo Deployment complete!
echo =======================================
echo.
echo Next steps:
echo 1. Clear your browser cache (Ctrl+Shift+Delete)
echo 2. Refresh your application
echo 3. Test chat functionality
echo 4. Check Firebase Console for index creation status
echo.
echo Monitor at: https://console.firebase.google.com/project/ataraxia-c150f/firestore
echo.
pause
