# ParkEasy Admin Panel - Setup Verification Script
# This script checks if all components are properly configured

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "ParkEasy Admin Panel - Setup Verification" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$allGood = $true

# Check 1: MongoDB Service
Write-Host "1. Checking MongoDB Service..." -ForegroundColor Yellow
try {
    $mongoService = Get-Service -Name MongoDB -ErrorAction Stop
    if ($mongoService.Status -eq "Running") {
        Write-Host "   ✅ MongoDB is running" -ForegroundColor Green
    } else {
        Write-Host "   ❌ MongoDB is not running" -ForegroundColor Red
        Write-Host "      Run: Start-Service MongoDB" -ForegroundColor Yellow
        $allGood = $false
    }
} catch {
    Write-Host "   ❌ MongoDB service not found" -ForegroundColor Red
    Write-Host "      Please install MongoDB" -ForegroundColor Yellow
    $allGood = $false
}
Write-Host ""

# Check 2: Backend Files
Write-Host "2. Checking Backend Files..." -ForegroundColor Yellow
$backendFiles = @(
    "backend\main.py",
    "backend\models.py",
    "backend\auth.py",
    "backend\database.py",
    "backend\config.py",
    "backend\seed_data.py",
    "backend\routers\admin_router.py",
    "backend\.env",
    "backend\requirements.txt"
)

$missingFiles = @()
foreach ($file in $backendFiles) {
    $fullPath = Join-Path "c:\college\dt\dt proj\project" $file
    if (Test-Path $fullPath) {
        Write-Host "   ✅ $file" -ForegroundColor Green
    } else {
        Write-Host "   ❌ $file (missing)" -ForegroundColor Red
        $missingFiles += $file
        $allGood = $false
    }
}
Write-Host ""

# Check 3: Frontend Files
Write-Host "3. Checking Frontend Files..." -ForegroundColor Yellow
$frontendFiles = @(
    "src\App.tsx",
    "src\lib\api.ts",
    "src\components\Navbar.tsx",
    "src\pages\admin\AdminDashboard.tsx",
    "src\pages\admin\UserManagement.tsx",
    "src\pages\admin\SlotManagement.tsx",
    "package.json"
)

foreach ($file in $frontendFiles) {
    $fullPath = Join-Path "c:\college\dt\dt proj\project" $file
    if (Test-Path $fullPath) {
        Write-Host "   ✅ $file" -ForegroundColor Green
    } else {
        Write-Host "   ❌ $file (missing)" -ForegroundColor Red
        $missingFiles += $file
        $allGood = $false
    }
}
Write-Host ""

# Check 4: Node Modules
Write-Host "4. Checking Node Modules..." -ForegroundColor Yellow
if (Test-Path "c:\college\dt\dt proj\project\node_modules") {
    Write-Host "   ✅ node_modules directory exists" -ForegroundColor Green
} else {
    Write-Host "   ❌ node_modules not found" -ForegroundColor Red
    Write-Host "      Run: npm install" -ForegroundColor Yellow
    $allGood = $false
}
Write-Host ""

# Check 5: Python Dependencies
Write-Host "5. Checking Python Dependencies..." -ForegroundColor Yellow
$pythonPackages = @("fastapi", "uvicorn", "pymongo", "motor", "bcrypt", "jose")
$missingPackages = @()

foreach ($package in $pythonPackages) {
    try {
        $result = python -c "import $package" 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "   ✅ $package installed" -ForegroundColor Green
        } else {
            Write-Host "   ❌ $package not installed" -ForegroundColor Red
            $missingPackages += $package
            $allGood = $false
        }
    } catch {
        Write-Host "   ❌ $package not installed" -ForegroundColor Red
        $missingPackages += $package
        $allGood = $false
    }
}

if ($missingPackages.Count -gt 0) {
    Write-Host "      Run: pip install -r backend\requirements.txt" -ForegroundColor Yellow
}
Write-Host ""

# Check 6: Environment Configuration
Write-Host "6. Checking Environment Configuration..." -ForegroundColor Yellow
$envPath = "c:\college\dt\dt proj\project\backend\.env"
if (Test-Path $envPath) {
    $envContent = Get-Content $envPath -Raw
    
    # Check for required variables
    $requiredVars = @("MONGODB_URL", "SECRET_KEY", "DATABASE_NAME")
    foreach ($var in $requiredVars) {
        if ($envContent -match $var) {
            Write-Host "   ✅ $var configured" -ForegroundColor Green
        } else {
            Write-Host "   ❌ $var missing" -ForegroundColor Red
            $allGood = $false
        }
    }
} else {
    Write-Host "   ❌ .env file not found" -ForegroundColor Red
    $allGood = $false
}
Write-Host ""

# Check 7: Port Availability
Write-Host "7. Checking Port Availability..." -ForegroundColor Yellow

# Check port 8000 (Backend)
$port8000 = Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue
if ($port8000) {
    Write-Host "   ⚠️  Port 8000 is in use (Backend may already be running)" -ForegroundColor Yellow
} else {
    Write-Host "   ✅ Port 8000 is available" -ForegroundColor Green
}

# Check port 5173 (Frontend)
$port5173 = Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue
if ($port5173) {
    Write-Host "   ⚠️  Port 5173 is in use (Frontend may already be running)" -ForegroundColor Yellow
} else {
    Write-Host "   ✅ Port 5173 is available" -ForegroundColor Green
}
Write-Host ""

# Check 8: Documentation Files
Write-Host "8. Checking Documentation..." -ForegroundColor Yellow
$docFiles = @(
    "ADMIN_FEATURES_SUMMARY.md",
    "QUICK_START_GUIDE.md"
)

foreach ($file in $docFiles) {
    $fullPath = Join-Path "c:\college\dt\dt proj\project" $file
    if (Test-Path $fullPath) {
        Write-Host "   ✅ $file" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  $file (missing)" -ForegroundColor Yellow
    }
}
Write-Host ""

# Final Summary
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Verification Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

if ($allGood) {
    Write-Host "🎉 All checks passed! Your setup is ready." -ForegroundColor Green
    Write-Host ""
    Write-Host "Next Steps:" -ForegroundColor Cyan
    Write-Host "1. Seed the database (first time only):" -ForegroundColor White
    Write-Host "   cd backend" -ForegroundColor Gray
    Write-Host "   python seed_data.py" -ForegroundColor Gray
    Write-Host ""
    Write-Host "2. Start the backend:" -ForegroundColor White
    Write-Host "   cd backend" -ForegroundColor Gray
    Write-Host "   uvicorn main:app --reload --host 0.0.0.0 --port 8000" -ForegroundColor Gray
    Write-Host ""
    Write-Host "3. Start the frontend (in a new terminal):" -ForegroundColor White
    Write-Host "   npm run dev" -ForegroundColor Gray
    Write-Host ""
    Write-Host "4. Login as admin:" -ForegroundColor White
    Write-Host "   URL: http://localhost:5173" -ForegroundColor Gray
    Write-Host "   Email: admin@parkeasy.com" -ForegroundColor Gray
    Write-Host "   Password: admin123" -ForegroundColor Gray
    Write-Host ""
} else {
    Write-Host "❌ Some checks failed. Please fix the issues above." -ForegroundColor Red
    Write-Host ""
    Write-Host "Common Fixes:" -ForegroundColor Cyan
    Write-Host "- Install Python dependencies: pip install -r backend\requirements.txt" -ForegroundColor White
    Write-Host "- Install Node dependencies: npm install" -ForegroundColor White
    Write-Host "- Start MongoDB: Start-Service MongoDB" -ForegroundColor White
    Write-Host ""
}

Write-Host "For detailed documentation, see:" -ForegroundColor Cyan
Write-Host "- ADMIN_FEATURES_SUMMARY.md (Complete technical documentation)" -ForegroundColor White
Write-Host "- QUICK_START_GUIDE.md (Quick setup guide)" -ForegroundColor White
Write-Host ""