# ============================================================
# SYNC isi file dari kawaltransaksi → juaravibecoding
# Jalankan dari folder juaravibecoding
# ============================================================

$source = "C:\Users\Achmad gozali\OneDrive\Desktop\kawaltransaksi"
$dest   = "C:\Users\Achmad gozali\OneDrive\Desktop\juaravibecoding"

$skip = @("node_modules", ".next", ".git", ".wrangler")

$files = Get-ChildItem -Path $source -Recurse -File | Where-Object {
    $skip | ForEach-Object { $found = $false } { if ($_.FullName -match $_) { $found = $true } } { $found } | Where-Object { $_ -eq $true }
    $skip -notcontains ($_.FullName -split '\\' | Where-Object { $skip -contains $_ } | Select-Object -First 1)
} | Where-Object {
    $relative = $_.FullName.Substring($source.Length)
    ($skip | Where-Object { $relative -match [regex]::Escape("\$_\") -or $relative -match [regex]::Escape("\$_") }) -eq $null
}

$copied  = 0
$skipped = 0
$notfound = 0

Write-Host "=== SYNC: kawaltransaksi → juaravibecoding ===" -ForegroundColor Yellow
Write-Host ""

foreach ($file in $files) {
    # Path relatif dari source
    $relative = $file.FullName.Substring($source.Length + 1)

    # Skip folder tertentu
    $shouldSkip = $false
    foreach ($s in $skip) {
        if ($relative -like "$s\*" -or $relative -like "*\$s\*") {
            $shouldSkip = $true
            break
        }
    }
    if ($shouldSkip) { continue }

    # Path tujuan
    $destFile = Join-Path $dest $relative

    if (Test-Path $destFile) {
        Copy-Item -Path $file.FullName -Destination $destFile -Force
        Write-Host "  COPIED: $relative" -ForegroundColor Green
        $copied++
    } else {
        Write-Host "  NOT IN DEST: $relative" -ForegroundColor DarkYellow
        $notfound++
    }
}

Write-Host ""
Write-Host "=== SELESAI ===" -ForegroundColor Cyan
Write-Host "  Copied   : $copied file" -ForegroundColor Green
Write-Host "  Not found: $notfound file (ada di kawaltransaksi tapi tidak di juaravibecoding)" -ForegroundColor DarkYellow
