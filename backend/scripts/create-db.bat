@echo off
REM Simple script to create database
REM Run from backend folder: scripts\create-db.bat

echo Creating database...
echo.

set PGPASSWORD=%1
set PSQL="C:\Program Files\PostgreSQL\18\bin\psql.exe"

echo Creating database: transcription_db
%PSQL% -U postgres -c "CREATE DATABASE transcription_db;"

echo Creating user: transcription_user
%PSQL% -U postgres -c "CREATE USER transcription_user WITH PASSWORD 'Transcription@2025';"

echo Granting privileges...
%PSQL% -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE transcription_db TO transcription_user;"

echo Connecting to database and granting schema privileges...
%PSQL% -U postgres -d transcription_db -c "GRANT ALL ON SCHEMA public TO transcription_user;"

echo.
echo ========================================
echo Database setup completed!
echo ========================================
echo.
echo Database: transcription_db
echo User: transcription_user
echo Password: Transcription@2025
echo.
echo Next: Update .env file and run npm run db:test
echo.

set PGPASSWORD=
