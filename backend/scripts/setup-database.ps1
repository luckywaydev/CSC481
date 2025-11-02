Write-Host "🗄️  Setting up PostgreSQL Database..." -ForegroundColor Cyan
Write-Host ""

# ค้นหา PostgreSQL ในเครื่อง
$pgVersions = Get-ChildItem "C:\Program Files\PostgreSQL\" -ErrorAction SilentlyContinue |
    Where-Object { $_.PSIsContainer } |
    Sort-Object Name -Descending

if ($pgVersions.Count -eq 0) {
    Write-Host "❌ PostgreSQL installation not found!" -ForegroundColor Red
    Write-Host "Please install PostgreSQL 15 or later" -ForegroundColor Yellow
    exit 1
}

$pgPath = $pgVersions[0].FullName
$psqlPath = Join-Path $pgPath "bin\psql.exe"

if (-not (Test-Path $psqlPath)) {
    Write-Host "❌ PostgreSQL not found at: $psqlPath" -ForegroundColor Red
    Write-Host "Please check your PostgreSQL installation path" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Found PostgreSQL at: $psqlPath" -ForegroundColor Green
Write-Host ""

# รับค่า input จาก user
$dbName = Read-Host "Enter database name (e.g. transcription_db)"
$dbUser = Read-Host "Enter database user (e.g. transcription_user)"
$dbPass = Read-Host "Enter password for user $dbUser" -AsSecureString
$plainPass = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [Runtime.InteropServices.Marshal]::SecureStringToBSTR($dbPass)
)

Write-Host ""
Write-Host "📝 Running SQL script..." -ForegroundColor Cyan
Write-Host "You will be prompted for the postgres user password" -ForegroundColor Yellow
Write-Host ""

# รัน SQL โดยส่งตัวแปรเข้าไป
$env:PGPASSWORD = Read-Host "Enter postgres password (to run setup)" -AsSecureString |
    ForEach-Object { [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($_)) }

& $psqlPath -U postgres `
    -v dbname="$dbName" `
    -v dbuser="$dbUser" `
    -v dbpass="$plainPass" `
    -f "setup-database.sql"

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Database setup completed successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📊 Database Information:" -ForegroundColor Cyan
    Write-Host "   Database: $dbName" -ForegroundColor White
    Write-Host "   User: $dbUser" -ForegroundColor White
    Write-Host "   Password: (hidden — but saved successfully)" -ForegroundColor White
    Write-Host ""
    Write-Host "⚠️  Next Steps:" -ForegroundColor Yellow
    Write-Host "   1. Update .env file with DATABASE_URL" -ForegroundColor White
    Write-Host "   2. Run: npm run prisma:push" -ForegroundColor White
    Write-Host "   3. Run: npm run db:seed" -ForegroundColor White
} else {
    Write-Host ""
    Write-Host "❌ Database setup failed!" -ForegroundColor Red
    Write-Host "Please check the error messages above" -ForegroundColor Yellow
}

# ล้าง password ชั่วคราวออกให้ปลอดภัย
Remove-Item Env:\PGPASSWORD -ErrorAction SilentlyContinue
