# Script para parametrizar referencias hard-coded en el framework
# Ejecutar DESPUES de SETUP.ps1

Write-Host "Parametrizando framework..." -ForegroundColor Green
Write-Host "Este script reemplaza referencias especificas de Gextiona con variables template`n" -ForegroundColor Yellow

$baseDir = "."

# Define reemplazos
$replacements = @{
    # Proyecto
    "Gextiona Dashboard" = "{{projectName}}"
    "Gextiona" = "{{projectName}}"
    "gextiona_dashboard" = "{{projectNameSnake}}"
    "gextiona-dashboard" = "{{projectNameKebab}}"
    "gextiona_dev" = "{{dbName}}"
    "GextionaDashboard" = "{{githubRepo}}"

    # Usuario
    "carlos@laorotava.org" = "{{userEmail}}"
    "Carlos Hernandez" = "{{userName}}"
    "Chdezreyes76" = "{{githubOwner}}"
    "qa-bot@gextiona.local" = "qa-bot@{{projectNameKebab}}.local"

    # Puertos (solo en archivos de documentación/ejemplos, no en settings)
    "localhost:3000" = "localhost:{{frontendPort}}"
    "localhost:8000" = "localhost:{{backendPort}}"
    ":3307" = ":{{dbPort}}"

    # Dominios de ejemplo (solo en documentación)
    "usuarios, nominas, centros-coste, personal, redistribucion, contabilidad" = "{{#if domains}}{{#each domains.examples}}{{this}}{{#unless @last}}, {{/unless}}{{/each}}{{/if}}"
}

# Archivos a parametrizar (por prioridad)
$filesToParametrize = @(
    # Prioridad 1 - Critico
    "core\skills\qa-review-done\email-config.json.example",
    "core\commands\github\*.md",
    "core\commands\workflow\issue-complete.md",
    "core\skills\qa-review-done\SKILL.md",

    # Prioridad 2 - Importante
    "core\agents\code-reviewer.md",
    "core\agents\issue-planner.md",
    "core\skills\backend-implementer\SKILL.md",
    "core\skills\frontend-implementer\SKILL.md",
    "core\skills\github-workflow\SKILL.md",

    # Prioridad 3 - Documentación
    "core\skills\*\README.md"
)

Write-Host "Procesando archivos..." -ForegroundColor Cyan

$totalFiles = 0
$totalReplacements = 0

foreach ($pattern in $filesToParametrize) {
    $files = Get-ChildItem -Path $baseDir -Filter $pattern -Recurse -File -ErrorAction SilentlyContinue

    foreach ($file in $files) {
        if ($file.FullName -match "qa-reports") {
            # Skip QA reports
            continue
        }

        Write-Host "  Procesando: $($file.Name)" -ForegroundColor Gray

        $content = Get-Content $file.FullName -Raw -Encoding UTF8
        $originalContent = $content
        $fileReplacements = 0

        foreach ($key in $replacements.Keys) {
            $value = $replacements[$key]
            if ($content -match [regex]::Escape($key)) {
                $content = $content -replace [regex]::Escape($key), $value
                $fileReplacements++
            }
        }

        if ($fileReplacements -gt 0) {
            Set-Content $file.FullName -Value $content -Encoding UTF8 -NoNewline
            Write-Host "    ✓ $fileReplacements reemplazos" -ForegroundColor Green
            $totalFiles++
            $totalReplacements += $fileReplacements
        }
    }
}

# Renombrar archivos .tmpl si es necesario
Write-Host "`nRenombrando templates..." -ForegroundColor Cyan
Get-ChildItem -Path "$baseDir\core" -Filter "*.json" -Recurse | ForEach-Object {
    if ($_.Name -eq "email-config.json" -or $_.Name -eq "settings.json" -or $_.Name -eq "settings.local.json") {
        $newName = $_.FullName + ".tmpl"
        if (-not (Test-Path $newName)) {
            Rename-Item $_.FullName -NewName "$($_.Name).tmpl" -Force
            Write-Host "  ✓ Renombrado: $($_.Name) -> $($_.Name).tmpl" -ForegroundColor Green
        }
    }
}

Write-Host "`n✓ Parametrización completada!" -ForegroundColor Green
Write-Host "  Archivos modificados: $totalFiles" -ForegroundColor White
Write-Host "  Total de reemplazos: $totalReplacements" -ForegroundColor White

Write-Host "`nProximos pasos:" -ForegroundColor Cyan
Write-Host "1. Revisar cambios: git diff"
Write-Host "2. Verificar que no quedan referencias hardcoded"
Write-Host "3. Implementar CLI tool"
Write-Host "4. Probar con proyecto dummy"
