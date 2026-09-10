#!/usr/bin/env pwsh
# Backup script (plan.md section 49).
# Runs pg_dump against the Neon PostgreSQL database via POSTGRES_URL
# and archives n8n workflows (exported via REST when n8n is reachable).
#
# Usage: pwsh infra/scripts/backup.ps1
# Schedule: daily via Task Scheduler or cron.

$ErrorActionPreference = 'Stop'

# Load .env from repo root
$repoRoot = Split-Path -Parent (Split-Path -Parent (Split-Path -Parent $PSCommandPath))
Get-Content (Join-Path $repoRoot '.env') | ForEach-Object {
    if ($_ -match '^\s*([^#=\s]+)\s*=\s*(.*)\s*$') {
        Set-Item -Path "Env:\$($Matches[1])" -Value $Matches[2]
    }
}

if (-not $env:POSTGRES_URL) {
    throw 'POSTGRES_URL is not set'
}

$backupRoot = Join-Path $repoRoot 'infra\backups'
$stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$dbDir = Join-Path $backupRoot $stamp
New-Item -ItemType Directory -Path $dbDir -Force | Out-Null

Write-Host "Backing up database to $dbDir"

# pg_dump must be on PATH. For Neon use: pg_dump "<POSTGRES_URL>" -F c -f file
$pgDump = Get-Command pg_dump -ErrorAction SilentlyContinue
if ($pgDump) {
    & pg_dump $env:POSTGRES_URL -F c -f (Join-Path $dbDir 'neondb.dump')
    if ($LASTEXITCODE -ne 0) { throw 'pg_dump failed' }
    Write-Host "Database dump written: $dbDir\neondb.dump"
} else {
    Write-Warning 'pg_dump not found on PATH — database backup skipped. Install PostgreSQL client tools.'
}

# n8n workflow export via REST API (requires n8n API key if activated)
$n8nBase = $env:N8N_BASE_URL_INTERNAL
if ($n8nBase -and $env:N8N_API_KEY) {
    try {
        $headers = @{ 'X-N8N-API-KEY' = $env:N8N_API_KEY }
        $workflows = Invoke-RestMethod -Uri "$n8nBase/api/v1/workflows" -Headers $headers
        $workflows | ConvertTo-Json -Depth 20 | Set-Content (Join-Path $dbDir 'n8n-workflows.json')
        Write-Host "n8n workflows exported: $dbDir\n8n-workflows.json"
    } catch {
        Write-Warning "n8n export failed: $($_.Exception.Message)"
    }
} else {
    Write-Host 'n8n API key/base URL not configured — workflow export skipped.'
}

# Retention: keep last 30 daily backups
$all = Get-ChildItem $backupRoot -Directory | Sort-Object Name -Descending
if ($all.Count -gt 30) {
    $all | Select-Object -Skip 30 | ForEach-Object {
        Write-Host "Removing old backup $($_.Name)"
        Remove-Item $_.FullName -Recurse -Force
    }
}

Write-Host 'Backup complete'
