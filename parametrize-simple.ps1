$baseDir = "C:\Users\Carlos.Hernandez\Proyectos\claude-hexagonal-fsd-framework\core"

Get-ChildItem $baseDir -Recurse -File | Where-Object { $_.Extension -match '\.(md|json|sh)$' } | ForEach-Object {
    $content = Get-Content $_.FullName -Raw -Encoding UTF8
    $original = $content

    $content = $content -replace 'Gextiona Dashboard', '{{projectName}}'
    $content = $content -replace 'carlos@laorotava\.org', '{{userEmail}}'
    $content = $content -replace 'Chdezreyes76', '{{githubOwner}}'
    $content = $content -replace 'qa-bot@gextiona\.local', 'qa-bot@{{projectNameKebab}}.local'
    $content = $content -replace 'gextiona_dev', '{{dbName}}'

    if ($content -ne $original) {
        Set-Content $_.FullName -Value $content -Encoding UTF8 -NoNewline
        Write-Host "Updated: $($_.Name)" -ForegroundColor Green
    }
}

Write-Host "`nParametrization complete!" -ForegroundColor Cyan
