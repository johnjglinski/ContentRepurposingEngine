@echo off
REM =============================================================================
REM Azure Functions Deployment Script for Content Repurposing Engine
REM =============================================================================
REM This script provisions an Azure Function App and deploys the backend API.
REM Prerequisites:
REM   - Azure CLI installed (az)
REM   - Azure Functions Core Tools installed (func)
REM   - Active Azure subscription with permissions to create resources
REM =============================================================================

setlocal enabledelayedexpansion

REM Configuration variables - EDIT THESE BEFORE RUNNING
set RESOURCE_GROUP=content-repurposing-rg
set LOCATION=eastus2
set FUNCTION_APP_NAME=content-repurposing-api-%RANDOM%
set STORAGE_ACCOUNT=cgreprodst%random%
set APP_INSIGHTS_NAME=content-repurposing-insights

echo.
echo ============================================================================
echo  Azure Functions Deployment - Content Repurposing Engine
echo ============================================================================
echo.
echo Resource Group: %RESOURCE_GROUP%
echo Location:       %LOCATION%
echo Function App:   %FUNCTION_APP_NAME%
echo Storage Account:%STORAGE_ACCOUNT%
echo.

REM Check if Azure CLI is installed
where az >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Azure CLI not found. Install from https://docs.microsoft.com/cli/azure/install-azure-cli
    exit /b 1
)

REM Check if Functions Core Tools are installed
where func >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Azure Functions Core Tools not found. Install with: npm i -g azure-functions-core-tools@4
    exit /b 1
)

REM Check if logged into Azure
az account show >nul 2>&1
if %errorlevel% neq 0 (
    echo [INFO] Not authenticated with Azure. Logging in...
    az login
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to authenticate with Azure. Please try again.
        exit /b 1
    )
)

echo.
echo ============================================================================
echo  Step 1: Creating Resource Group
echo ============================================================================
az group create --name %RESOURCE_GROUP% --location %LOCATION%
if %errorlevel% neq 0 (
    echo [ERROR] Failed to create resource group. Check if it already exists or permissions are correct.
    exit /b 1
)
echo [OK] Resource group created successfully.

echo.
echo ============================================================================
echo  Step 2: Creating Storage Account
echo ============================================================================
az storage account create ^
    --name %STORAGE_ACCOUNT% ^
    --resource-group %RESOURCE_GROUP% ^
    --location %LOCATION% ^
    --sku Standard_LRS ^
    --kind StorageV2 ^
    --access-tier Hot
if %errorlevel% neq 0 (
    echo [ERROR] Failed to create storage account. It may already exist.
    exit /b 1
)
echo [OK] Storage account created successfully.

echo.
echo ============================================================================
echo  Step 3: Creating Application Insights
echo ============================================================================
az monitor app-insights component create ^
    --app %APP_INSIGHTS_NAME% ^
    --resource-group %RESOURCE_GROUP% ^
    --location %LOCATION%
if %errorlevel% neq 0 (
    echo [WARNING] Failed to create Application Insights. Continuing without it.
)

echo.
echo ============================================================================
echo  Step 4: Creating Function App (Consumption Plan)
echo ============================================================================
az functionapp create ^
    --resource-group %RESOURCE_GROUP% ^
    --consumption-plan-location %LOCATION% ^
    --name %FUNCTION_APP_NAME% ^
    --storage-account %STORAGE_ACCOUNT% ^
    --functions-version 4 ^
    --runtime node ^
    --runtime-version 20 ^
    --os-type Windows ^
    --app-insights %APP_INSIGHTS_NAME%
if %errorlevel% neq 0 (
    echo [ERROR] Failed to create Function App. Check the name for uniqueness and permissions.
    exit /b 1
)
echo [OK] Function app created successfully.

echo.
echo ============================================================================
echo  Step 5: Configuring Application Settings
echo ============================================================================

REM Configure LM Studio settings
echo [INFO] Configuring LM Studio integration...
set /p LM_STUDIO_URL="Enter LM Studio URL (default: http://localhost:1234/v1): "
if "%LM_STUDIO_URL%"=="" (
    set LM_STUDIO_URL=http://localhost:1234/v1
    echo [INFO] Using default LM Studio URL: %LM_STUDIO_URL%
)

set /p LM_STUDIO_MODEL="Enter LM Studio model name (default: local-model): "
if "%LM_STUDIO_MODEL%"=="" (
    set LM_STUDIO_MODEL=local-model
    echo [INFO] Using default model: %LM_STUDIO_MODEL%
)

az functionapp config appsettings set ^
    --name %FUNCTION_APP_NAME% ^
    --resource-group %RESOURCE_GROUP% ^
    --settings LM_STUDIO_URL=%LM_STUDIO_URL% LM_STUDIO_MODEL=%LM_STUDIO_MODEL%

REM Configure SendGrid with provided credentials
echo [INFO] Configuring SendGrid with provided credentials...
az functionapp config appsettings set ^
    --name %FUNCTION_APP_NAME% ^
    --resource-group %RESOURCE_GROUP% ^
    --settings SENDGRID_SID=%SENDGRID_SID% SENDGRID_SECRET=%SENDGRID_SECRET%

set /p FROM_EMAIL="Enter sender email address (default: noreply@contentrepurposing.com): "
if "%FROM_EMAIL%"=="" (
    set FROM_EMAIL=noreply@contentrepurposing.com
    echo [INFO] Using default sender: %FROM_EMAIL%
)
az functionapp config appsettings set ^
    --name %FUNCTION_APP_NAME% ^
    --resource-group %RESOURCE_GROUP% ^
    --settings FROM_EMAIL=%FROM_EMAIL%

REM Set CORS configuration
set /p FRONTEND_URL="Enter your frontend URL (e.g., https://yourusername.github.io/content-repurposing): "
if "%FRONTEND_URL%"=="" (
    set FRONTEND_URL=https://*.github.io
)
az functionapp cors add ^
    --name %FUNCTION_APP_NAME% ^
    --resource-group %RESOURCE_GROUP% ^
    --allowed-origins %FRONTEND_URL% http://localhost:3000

echo [OK] Application settings configured.

echo.
echo ============================================================================
echo  Step 6: Installing Dependencies and Deploying
echo ============================================================================

REM Change to the Azure Functions directory
cd /d "%~dp0"

REM Install npm dependencies
echo Installing npm dependencies...
call npm install --production
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install npm dependencies.
    exit /b 1
)

REM Deploy the function app
echo Deploying Azure Functions...
call func azure functionapp publish %FUNCTION_APP_NAME% --build local --nozip
if %errorlevel% neq 0 (
    echo [ERROR] Deployment failed. Check the error messages above.
    exit /b 1
)

echo.
echo ============================================================================
echo  DEPLOYMENT COMPLETE!
echo ============================================================================
echo.
echo Function App URL: https://%FUNCTION_APP_NAME%.azurewebsites.net
echo API Endpoint:     https://%FUNCTION_APP_NAME%.azurewebsites.net/api/generate-posts
echo Resource Group:   %RESOURCE_GROUP%
echo.
echo Configuration Summary:
echo   - LM Studio URL: %LM_STUDIO_URL%
echo   - LM Studio Model: %LM_STUDIO_MODEL%
echo   - SendGrid: Configured with provided credentials
echo   - From Email: %FROM_EMAIL%
echo.
echo Next Steps:
echo 1. Copy the API Endpoint URL above
echo 2. Set AZURE_FUNCTION_URL in your frontend environment variables
echo 3. Ensure LM Studio is running and accessible at: %LM_STUDIO_URL%
echo 4. Test the endpoint with:
echo    curl -X POST https://%FUNCTION_APP_NAME%.azurewebsites.net/api/generate-posts ^
echo      -H "Content-Type: application/json" ^
echo      -d "{\"content\":\"test blog post\"}"
echo.
echo IMPORTANT: For Azure deployment, LM Studio must be accessible via network.
echo   - Option 1: Run LM Studio on a VM with public IP
echo   - Option 2: Use Azure Virtual Network for private connectivity
echo   - Option 3: Consider cloud AI services for production
echo.
echo To get the function key for authentication:
echo   az functionapp keys list --name %FUNCTION_APP_NAME% --resource-group %RESOURCE_GROUP%
echo.
echo For detailed testing instructions, see TESTING_GUIDE.md
echo.

endlocal
