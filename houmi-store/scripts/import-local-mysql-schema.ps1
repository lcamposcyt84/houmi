# Importa all_tables_utf8.sql en MySQL local (XAMPP).
# Requisito: MySQL arrancado en XAMPP.
# Uso:
#   .\scripts\import-local-mysql-schema.ps1
#   .\scripts\import-local-mysql-schema.ps1 -Database "houmi_dev"

param(
    [string]$MysqlExe = $env:XAMPP_MYSQL_BIN,
    [string]$Database = "houmi_dev",
    [string]$User = "root",
    [string]$SqlPath = ""
)

if (-not $MysqlExe) {
    $MysqlExe = "C:\xampp\mysql\bin\mysql.exe"
}
if (-not (Test-Path $MysqlExe)) {
    Write-Error "No se encontró mysql.exe. Define XAMPP_MYSQL_BIN o instala XAMPP. Ruta probada: $MysqlExe"
    exit 1
}
if (-not $SqlPath) {
    $SqlPath = Join-Path (Join-Path $PSScriptRoot "..") "all_tables_utf8.sql"
}
$SqlPath = Resolve-Path $SqlPath

Write-Host "Importando $SqlPath -> base $Database ..." -ForegroundColor Cyan
Get-Content -LiteralPath $SqlPath -Raw -Encoding UTF8 | & $MysqlExe -u $User $Database
if ($LASTEXITCODE -ne 0) {
    Write-Error "mysql terminó con código $LASTEXITCODE (¿tablas ya existentes? Revisa el error arriba.)"
    exit $LASTEXITCODE
}
Write-Host "Listo. Prueba: $MysqlExe -u $User -e `"USE $Database; SHOW TABLES;`"" -ForegroundColor Green
