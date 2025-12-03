# Script para sincronizar base de datos local al VPS
Write-Host "Sincronizando base de datos local al VPS" -ForegroundColor Green

# 1. Exportar base de datos local
Write-Host "1. Exportando base de datos local..." -ForegroundColor Yellow
docker exec -it lexalia-db mysqldump -uroot -proot lexalia > lexalia_local.sql

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error al exportar base de datos local" -ForegroundColor Red
    exit 1
}

Write-Host "Base de datos exportada" -ForegroundColor Green

# 2. Subir archivo al VPS
Write-Host "2. Subiendo archivo al VPS..." -ForegroundColor Yellow
scp lexalia_local.sql root@72.61.6.46:/root/lexalia_local.sql

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error al subir archivo al VPS" -ForegroundColor Red
    exit 1
}

Write-Host "Archivo subido" -ForegroundColor Green

# 3. Importar en el VPS
Write-Host "3. Importando en el VPS..." -ForegroundColor Yellow
ssh root@72.61.6.46 "mysql -uroot -proot lexalia < /root/lexalia_local.sql && rm /root/lexalia_local.sql"

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error al importar en el VPS" -ForegroundColor Red
    exit 1
}

Write-Host "Base de datos importada" -ForegroundColor Green

# 4. Limpiar archivo local
Remove-Item lexalia_local.sql -ErrorAction SilentlyContinue

Write-Host "Sincronizacion completada" -ForegroundColor Green
