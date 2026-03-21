# Verifies the public PHP API (e.g. after DB import on Hostinger).
# Usage: .\scripts\verify-hosting-api.ps1
#        .\scripts\verify-hosting-api.ps1 -BaseUrl "https://api.houmi.shop"

param(
    [string]$BaseUrl = "https://api.houmi.shop"
)

$BaseUrl = $BaseUrl.TrimEnd('/')
$urls = @(
    "$BaseUrl/get_categories.php",
    "$BaseUrl/get_products.php?limit=1"
)

foreach ($u in $urls) {
    Write-Host "`nGET $u" -ForegroundColor Cyan
    try {
        $r = Invoke-WebRequest -Uri $u -UseBasicParsing -Method GET
        Write-Host "Status: $($r.StatusCode)" -ForegroundColor Green
        $body = $r.Content
        if ($body.Length -gt 500) { $body = $body.Substring(0, 500) + "..." }
        Write-Host $body
    } catch {
        Write-Host "Failed: $_" -ForegroundColor Red
    }
}
