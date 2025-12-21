# Script para copiar la estructura del framework desde Gextiona
# Ejecutar desde la raiz del repositorio claude-hexagonal-fsd-framework

$sourceDir = "C:\Users\Carlos.Hernandez\Proyectos\GextionaDashboard\.claude"
$targetDir = "."

Write-Host "Copiando estructura del framework..." -ForegroundColor Green

# Copiar agentes
Write-Host "Copiando agentes..." -ForegroundColor Yellow
Copy-Item "$sourceDir\agents\*" -Destination "$targetDir\core\agents\" -Recurse -Force

# Copiar comandos
Write-Host "Copiando comandos..." -ForegroundColor Yellow
Copy-Item "$sourceDir\commands\*" -Destination "$targetDir\core\commands\" -Recurse -Force

# Copiar skills
Write-Host "Copiando skills..." -ForegroundColor Yellow
Copy-Item "$sourceDir\skills\*" -Destination "$targetDir\core\skills\" -Recurse -Force

# Copiar templates
Write-Host "Copiando templates..." -ForegroundColor Yellow
Copy-Item "$sourceDir\lib\templates\backend\*" -Destination "$targetDir\templates\backend\" -Recurse -Force
Copy-Item "$sourceDir\lib\templates\frontend\*" -Destination "$targetDir\templates\frontend\" -Recurse -Force
Copy-Item "$sourceDir\lib\templates\issues\*" -Destination "$targetDir\templates\issues\" -Recurse -Force

# Copiar hooks
Write-Host "Copiando hooks..." -ForegroundColor Yellow
Copy-Item "$sourceDir\hooks\*" -Destination "$targetDir\core\hooks\" -Recurse -Force

# Copiar settings
Write-Host "Copiando settings..." -ForegroundColor Yellow
Copy-Item "$sourceDir\settings.json" -Destination "$targetDir\core\settings.json.tmpl" -Force
Copy-Item "$sourceDir\settings.local.json" -Destination "$targetDir\core\settings.local.json.tmpl" -Force

Write-Host "`nCopia completada!" -ForegroundColor Green
Write-Host "`nProximos pasos:" -ForegroundColor Cyan
Write-Host "1. Revisar archivos copiados"
Write-Host "2. Ejecutar script de parametrizacion (PARAMETRIZE.ps1)"
Write-Host "3. Configurar CLI tool"
Write-Host "4. Probar con proyecto dummy"
