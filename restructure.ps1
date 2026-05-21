# ============================================================
# RESTRUCTURE juaravibecoding → kawaltransaksi structure
# Jalankan dari folder: C:\Users\Achmad gozali\OneDrive\Desktop\juaravibecoding
# ============================================================

$base = "C:\Users\Achmad gozali\OneDrive\Desktop\juaravibecoding"
Set-Location $base

Write-Host "=== STEP 1: Hapus file/folder lama yang tidak ada di kawaltransaksi ===" -ForegroundColor Yellow

# --- BACKEND: Hapus struktur lama (src/lib, src/middleware, src/routes) ---
$toDelete = @(
    "backend\src\lib",
    "backend\src\middleware",
    "backend\src\routes",

    # --- FRONTEND: Hapus folder lama ---
    "frontend\lib",
    "frontend\app\admin\actions.ts",
    "frontend\app\admin\AdminShell.tsx",
    "frontend\app\admin\DailyChart.tsx",
    "frontend\app\admin\components",
    "frontend\app\admin\tabs",
    "frontend\app\admin\types.ts",
    "frontend\app\artikel",
    "frontend\app\auth\confirm",
    "frontend\app\cek-nomor",
    "frontend\app\cek-rekening",
    "frontend\app\check",
    "frontend\app\dashboard",
    "frontend\app\developer",
    "frontend\app\edukasi",
    "frontend\app\faq",
    "frontend\app\kebijakan-privasi",
    "frontend\app\kontak",
    "frontend\app\laporan-publik",
    "frontend\app\login",
    "frontend\app\lupa-kata-sandi",
    "frontend\app\offline",
    "frontend\app\register",
    "frontend\app\report",
    "frontend\app\reset-kata-sandi",
    "frontend\app\syarat-ketentuan",
    "frontend\components\AuthForm.tsx",
    "frontend\components\EditReportButton.tsx",
    "frontend\components\NomorSearchForm.tsx",
    "frontend\components\RekeningSearchForm.tsx",
    "frontend\components\ReportForm.tsx",
    "frontend\components\ReportLanding.tsx",
    "frontend\components\SiteShell.tsx",
    "frontend\components\WithdrawButton.tsx",
    "frontend\components\report",
    "frontend\components\steps",
    "frontend\components\ui"
)

foreach ($path in $toDelete) {
    $full = Join-Path $base $path
    if (Test-Path $full) {
        Remove-Item -Recurse -Force $full
        Write-Host "  DELETED: $path" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "=== STEP 2: Buat struktur baru sesuai kawaltransaksi ===" -ForegroundColor Yellow

$newFiles = @(
    # BACKEND - core
    "backend\src\core\abuse.ts",
    "backend\src\core\auth.middleware.ts",
    "backend\src\core\groq.ts",
    "backend\src\core\resend.ts",
    "backend\src\core\supabase.ts",
    "backend\src\core\turnstile.ts",

    # BACKEND - features
    "backend\src\features\admin\admin.route.ts",
    "backend\src\features\api-public\api-public.route.ts",
    "backend\src\features\articles\articles.route.ts",
    "backend\src\features\auth\auth.route.ts",
    "backend\src\features\developer\developer.route.ts",
    "backend\src\features\feedback\feedback.route.ts",
    "backend\src\features\reports\reports.route.ts",
    "backend\src\features\search\search.route.ts",
    "backend\src\features\upload\upload.route.ts",

    # FRONTEND - app routes dengan route groups
    "frontend\app\(auth)\layout.tsx",
    "frontend\app\(auth)\login\page.tsx",
    "frontend\app\(auth)\lupa-kata-sandi\page.tsx",
    "frontend\app\(auth)\register\page.tsx",
    "frontend\app\(auth)\reset-kata-sandi\page.tsx",

    "frontend\app\(protected)\dashboard\laporan\[id]\edit\EditReportForm.tsx",
    "frontend\app\(protected)\dashboard\laporan\[id]\edit\page.tsx",
    "frontend\app\(protected)\dashboard\laporan\page.tsx",
    "frontend\app\(protected)\dashboard\profil\EditNamaForm.tsx",
    "frontend\app\(protected)\dashboard\profil\GantiPasswordButton.tsx",
    "frontend\app\(protected)\dashboard\profil\page.tsx",
    "frontend\app\(protected)\laporan-publik\page.tsx",
    "frontend\app\(protected)\laporan-publik\SearchBar.tsx",
    "frontend\app\(protected)\laporan-publik\StatsChart.tsx",
    "frontend\app\(protected)\layout.tsx",
    "frontend\app\(protected)\report\page.tsx",

    "frontend\app\(public)\artikel\[slug]\page.tsx",
    "frontend\app\(public)\artikel\[slug]\SidebarArtikel.tsx",
    "frontend\app\(public)\artikel\page.tsx",
    "frontend\app\(public)\cek-nomor\cek-ewallet\[wallet]\EwalletPageClient.tsx",
    "frontend\app\(public)\cek-nomor\cek-ewallet\[wallet]\page.tsx",
    "frontend\app\(public)\cek-nomor\page.tsx",
    "frontend\app\(public)\cek-rekening\[bank]\BankPageClient.tsx",
    "frontend\app\(public)\cek-rekening\[bank]\page.tsx",
    "frontend\app\(public)\cek-rekening\page.tsx",
    "frontend\app\(public)\check\[slug]\loading.tsx",
    "frontend\app\(public)\check\[slug]\opengraph-image.tsx",
    "frontend\app\(public)\check\[slug]\page.tsx",
    "frontend\app\(public)\developer\page.tsx",
    "frontend\app\(public)\edukasi\page.tsx",
    "frontend\app\(public)\faq\page.tsx",
    "frontend\app\(public)\kebijakan-privasi\page.tsx",
    "frontend\app\(public)\kontak\page.tsx",
    "frontend\app\(public)\layout.tsx",
    "frontend\app\(public)\page.tsx",
    "frontend\app\(public)\syarat-ketentuan\page.tsx",

    # FRONTEND - app admin (lebih simpel di kawaltransaksi)
    "frontend\app\admin\AdminDashboard.tsx",
    "frontend\app\admin\layout.tsx",
    "frontend\app\admin\page.tsx",

    # FRONTEND - components (lebih sedikit, bersih)
    "frontend\components\FeedbackButton.tsx",
    "frontend\components\Footer.tsx",
    "frontend\components\Navbar.tsx",
    "frontend\components\ProtectedShell.tsx",

    # FRONTEND - core (menggantikan lib/)
    "frontend\core\storage\upload.ts",
    "frontend\core\supabase\browser.ts",
    "frontend\core\supabase\index.ts",
    "frontend\core\supabase\server.ts",
    "frontend\core\utils\index.ts",

    # FRONTEND - features
    "frontend\features\admin\actions.ts",
    "frontend\features\admin\AdminShell.tsx",
    "frontend\features\admin\components\SectionTitle.tsx",
    "frontend\features\admin\components\StatCard.tsx",
    "frontend\features\admin\components\UserRow.tsx",
    "frontend\features\admin\DailyChart.tsx",
    "frontend\features\admin\tabs\ApiKeysTab.tsx",
    "frontend\features\admin\tabs\ArtikelTab.tsx",
    "frontend\features\admin\tabs\BlacklistTab.tsx",
    "frontend\features\admin\tabs\DashboardTab.tsx",
    "frontend\features\admin\tabs\FeedbackTab.tsx",
    "frontend\features\admin\tabs\LaporanTab.tsx",
    "frontend\features\admin\tabs\PenggunaTab.tsx",
    "frontend\features\admin\tabs\StatistikTab.tsx",
    "frontend\features\admin\types.ts",

    "frontend\features\auth\AuthForm.tsx",

    "frontend\features\check\components\NumberCard.tsx",
    "frontend\features\check\components\ReportList.tsx",
    "frontend\features\check\NomorSearchForm.tsx",
    "frontend\features\check\RekeningSearchForm.tsx",
    "frontend\features\check\ShareButtons.tsx",

    "frontend\features\developer\components\CodeBlock.tsx",
    "frontend\features\developer\components\DocSection.tsx",
    "frontend\features\developer\components\KeyCard.tsx",
    "frontend\features\developer\components\KeyRevealModal.tsx",
    "frontend\features\developer\DeveloperClient.tsx",

    "frontend\features\report\constants.ts",
    "frontend\features\report\EditReportButton.tsx",
    "frontend\features\report\ReportForm.tsx",
    "frontend\features\report\ReportLanding.tsx",
    "frontend\features\report\steps\Step1DataPenipu.tsx",
    "frontend\features\report\steps\Step2Kronologi.tsx",
    "frontend\features\report\steps\Step3BuktiKirim.tsx",
    "frontend\features\report\types.ts",
    "frontend\features\report\ui\AnalysisResults.tsx",
    "frontend\features\report\ui\primitives.tsx",
    "frontend\features\report\ui\TargetEntryCard.tsx",
    "frontend\features\report\WithdrawButton.tsx",

    # ROOT - utility scripts
    "frontend\check_encoding.py",
    "frontend\deep_scan.py",
    "frontend\fix_encoding.py",
    "scan_advanced.py",
    "scan_project.py",
    "test-api.js",
    "test-api.mjs",
    "test-autoblock.mjs",
    "test-security.mjs"
)

foreach ($file in $newFiles) {
    $full = Join-Path $base $file
    if (-not (Test-Path $full)) {
        $dir = Split-Path $full -Parent
        if (-not (Test-Path $dir)) {
            New-Item -ItemType Directory -Force -Path $dir | Out-Null
        }
        New-Item -ItemType File -Force -Path $full | Out-Null
        Write-Host "  CREATED: $file" -ForegroundColor Green
    } else {
        Write-Host "  EXISTS:  $file" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "=== SELESAI! ===" -ForegroundColor Cyan
Write-Host "Sekarang salin isi code dari kawaltransaksi ke juaravibecoding." -ForegroundColor Cyan
Write-Host "File yang sudah ada (EXISTS) tidak diubah isinya." -ForegroundColor Cyan
