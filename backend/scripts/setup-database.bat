@echo off

rem -- ตรวจสอบ PostgreSQL
set PGBIN=
for /f "delims=" %%a in ('dir /b /ad "C:\Program Files\PostgreSQL" 2^>nul') do (
    if exist "C:\Program Files\PostgreSQL\%%a\bin\psql.exe" (
        set "PGBIN=C:\Program Files\PostgreSQL\%%a\bin"
    )
)

if "%PGBIN%"=="" (
    echo [ERROR] PostgreSQL not found!
    echo Please install PostgreSQL 15 or later
    pause
    exit /b 1
)

echo [INFO] Found PostgreSQL at: %PGBIN%
echo.

rem -- Ask for DB Name
set /p DB_NAME=Enter database name (e.g. transcription_db): 

rem -- Ask for DB User
set /p DB_USER=Enter database user (e.g. transcription_user): 

rem -- Ask for DB Password
set /p DB_PASS=Enter password for user %DB_USER%: 

echo.
echo [INFO] Starting setup...
echo.

rem -- Export password temporarily
set PGPASSWORD=%DB_PASS%

rem -- Run SQL
"C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -v dbname="%DB_NAME%" -v dbuser="%DB_USER%" -v dbpass="%DB_PASS%" -f setup-database.sql

rem -- Clear password from memory
set PGPASSWORD=

echo.
echo ========================================
echo   Database Setup Completed!
echo ========================================
echo.
echo Database: %DB_NAME%
echo User: %DB_USER%
echo Password: %DB_PASS%
echo.
echo Next Steps:
echo 1. Update your .env file
echo 2. Run: npm run prisma:push
echo 3. Run: npm run db:seed
echo.
pause
