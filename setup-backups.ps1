# setup-backups.ps1
Write-Host "CONFIGURANDO SISTEMA DE BACKUPS PARA MERCADUCA" -ForegroundColor Green
Write-Host "================================================"

# Crear carpeta de backups si no existe
$backupPath = "C:\backups\mercaduca"
if (-not (Test-Path $backupPath)) {
    Write-Host "Creando carpeta de backups: $backupPath" -ForegroundColor Yellow
    New-Item -ItemType Directory -Path $backupPath -Force | Out-Null
    Write-Host "Carpeta creada exitosamente" -ForegroundColor Green
} else {
    Write-Host "Carpeta de backups ya existe: $backupPath" -ForegroundColor Green
}

# Crear carpetas para scripts
Write-Host "Creando carpetas para scripts..." -ForegroundColor Yellow
New-Item -ItemType Directory -Path ".\backup-scripts" -Force | Out-Null

# Crear script de backup manual
$manualBackup = @"
@echo off
echo Creando backup manual de Mercaduca...
setlocal enabledelayedexpansion
for /f "tokens=2 delims==" %%a in ('wmic OS Get localdatetime /value') do set "dt=%%a"
set "YYYY=!dt:~0,4!"
set "MM=!dt:~4,2!"
set "DD=!dt:~6,2!"
set "HH=!dt:~8,2!"
set "MIN=!dt:~10,2!"
set "SEC=!dt:~12,2!"

set "TIMESTAMP=!YYYY!!MM!!DD!_!HH!!MIN!!SEC!"
docker exec mercaduca_database pg_dump -U %DB_USER% %DB_NAME% --clean > "C:\backups\mercaduca\manual_%TIMESTAMP%.sql"
echo Backup completado: manual_%TIMESTAMP%.sql
"@
Set-Content -Path ".\backup-manual.bat" -Value $manualBackup

# Crear script de restauración rápida
$quickRestore = @"
@echo off
echo BUSCANDO ULTIMO BACKUP...
cd C:\backups\mercaduca
dir /b /od backup_*.sql.gz > temp.txt
set /p LATEST=<temp.txt
del temp.txt
echo Ultimo backup: %LATEST%
echo.
echo Restaurar este backup? (S/N)
set /p confirm=
if /i "%confirm%"=="S" (
    echo Activando modo mantenimiento...
    curl -X POST http://localhost:5000/api/maintenance/mode -H "Content-Type: application/json" -d "{\"mode\":true,\"message\":\"Sistema en restauracion\"}"
    
    echo Restaurando base de datos...
    type "C:\backups\mercaduca\%LATEST%" | docker exec -i mercaduca_database gunzip | docker exec -i mercaduca_database psql -U %DB_USER% -d %DB_NAME%
    
    echo Desactivando modo mantenimiento...
    curl -X POST http://localhost:5000/api/maintenance/mode -H "Content-Type: application/json" -d "{\"mode\":false}"
    
    echo Restauracion completada!
) else (
    echo Restauracion cancelada
)
"@
Set-Content -Path ".\restore-quick.bat" -Value $quickRestore

# Crear script de monitoreo
$monitorScript = @"
@echo off
echo ESTADO DEL SISTEMA DE BACKUPS
echo =================================
echo.
echo VERIFICANDO CONTENEDORES...
docker ps --filter "name=mercaduca" --format "table {{.Names}}\t{{.Status}}"
echo.
echo ULTIMOS BACKUPS:
dir C:\backups\mercaduca\backup_*.sql.gz /od /b 2>nul
echo.
echo MODO MANTENIMIENTO:
curl -s http://localhost:5000/api/maintenance/status
echo.
echo Para ver logs completos:
echo docker logs mercaduca_backup_scheduler
"@
Set-Content -Path ".\check-status.bat" -Value $monitorScript

Write-Host "`nScripts creados:" -ForegroundColor Green
Write-Host "  - backup-manual.bat (backup manual)"
Write-Host "  - restore-quick.bat (restaura ultimo backup)"
Write-Host "  - check-status.bat (verifica estado)"

Write-Host "`nIniciando servicios de backups..." -ForegroundColor Yellow
docker-compose -f docker-compose.backup.yml up -d

Write-Host "`nCONFIGURACION COMPLETADA" -ForegroundColor Green
Write-Host "================================================"
Write-Host "Backups guardados en: C:\backups\mercaduca"
Write-Host "Frecuencia: Todos los dias a las 2:00 AM"
Write-Host "Restauracion automatica: Activada"
Write-Host "Endpoints de mantenimiento:"
Write-Host "  GET  /api/maintenance/status"
Write-Host "  GET  /api/maintenance/backup-status"
Write-Host "  POST /api/maintenance/mode"
Write-Host "================================================"