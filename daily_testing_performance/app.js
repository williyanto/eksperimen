<!DOCTYPE html>
<html lang="id">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Daily Testing Performance Monitor - Final Test</title>
    <!-- Stylesheet -->
    <link rel="stylesheet" href="style.css">
    <!-- FontAwesome for Premium Icons -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <!-- Chart.js for Interactive Visual Analytics -->
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
</head>

<body>

    <!-- 1. AUTHENTICATION SCREEN -->
    <div id="authScreen" class="auth-container">
        <div class="auth-card">
            <div class="auth-header">
                <div class="auth-logo" style="flex-direction: column; gap: 8px; align-items: center;">
                    <img src="prysmian_logo.png" alt="Prysmian Logo" style="height: 60px;">
                    <span
                        style="font-size: 14px; font-weight: 700; color: var(--secondary); letter-spacing: 0; text-transform: uppercase;">PT
                        Prysmian Cables Indonesia</span>
                </div>
                <h2 style="margin-top: 15px;">Monitoring Performa Karyawan</h2>
                <p>Silakan masuk menggunakan akun Tester Anda</p>
            </div>

            <form id="loginForm" onsubmit="handleLogin(event)">
                <div class="form-group">
                    <label for="loginUsername">Username Karyawan</label>
                    <div class="input-wrapper">
                        <input type="text" id="loginUsername" class="form-control" placeholder="contoh: amar.saidin"
                            required autocomplete="username">
                        <i class="fas fa-user"></i>
                    </div>
                </div>

                <div class="form-group">
                    <label for="loginPassword">Password</label>
                    <div class="input-wrapper">
                        <input type="password" id="loginPassword" class="form-control" placeholder="••••••••" required
                            autocomplete="current-password">
                        <i class="fas fa-lock"></i>
                    </div>
                </div>

                <button type="submit" class="btn btn-primary">
                    <i class="fas fa-sign-in-alt"></i> Masuk ke Dashboard
                </button>
            </form>

            <!-- Credentials Info Box Helper -->
            <div class="accounts-info-box">
                <div class="accounts-header" onclick="toggleAccountsInfo()">
                    <span><i class="fas fa-info-circle"></i> Info Akun Karyawan (8 Akun)</span>
                    <i id="accountsToggleIcon" class="fas fa-chevron-down"></i>
                </div>
                <div id="accountsList" class="accounts-list" style="display: none;">
                    <!-- Auto-filled by JS -->
                </div>
            </div>
        </div>
    </div>

    <!-- 2. MAIN APPLICATION SCREEN -->
    <div id="appScreen" class="app-container" style="display: none;">
        <!-- Mobile Sidebar Overlay -->
        <div id="sidebarOverlay" class="sidebar-overlay" onclick="toggleMobileSidebar()"></div>

        <!-- Sidebar Navigation -->
        <aside>
            <div class="sidebar-logo"
                style="flex-direction: column; align-items: center; text-align: center; gap: 8px; padding: 20px 10px; border-bottom: 1px solid rgba(255, 255, 255, 0.08); position: relative;">
                <!-- Close Button for Mobile -->
                <button type="button" id="mobileCloseBtn" class="mobile-close-btn" onclick="toggleMobileSidebar()"
                    style="position: absolute; right: 15px; top: 15px; background: transparent; border: none; color: #fff; font-size: 20px; cursor: pointer; display: none;">
                    <i class="fas fa-times"></i>
                </button>
                <img src="prysmian_logo_white.png" alt="Prysmian Logo" style="height: 50px;">
                <span
                    style="font-size: 11px; font-weight: 700; color: #fff; letter-spacing: 0; text-transform: uppercase; line-height: 1.2;">PT
                    Prysmian Cables Indonesia</span>
            </div>

            <div class="sidebar-user">
                <div class="user-info">
                    <span class="user-role">Tester Utama</span>
                    <span id="loggedInUserName" class="user-name">Loading...</span>

                    <!-- Assistant selector (the shift partner) -->
                    <div style="margin-top: 10px;">
                        <label for="assistantSelect"
                            style="font-size: 11px; font-weight: 600; color: #8DA9C4; display: block; margin-bottom: 4px;">Pilih
                            Partner / Asisten Shift:</label>
                        <select id="assistantSelect" class="filter-select"
                            style="width: 100%; font-size: 12px; background-color: rgba(255,255,255,0.08); color: #fff; border: 1px solid rgba(255,255,255,0.15); border-radius: var(--radius-sm); padding: 6px 10px;">
                            <!-- Auto-filled by JS -->
                        </select>
                    </div>
                    <span id="currentAssistantName" class="assistant-name">Partner: Loading...</span>
                </div>
            </div>

            <nav>
                <a class="nav-link active" data-tab="dashboard" onclick="switchTab('dashboard')">
                    <i class="fas fa-chart-line"></i> Dashboard Analytics
                </a>
                <a class="nav-link" data-tab="monthly" onclick="switchTab('monthly')">
                    <i class="fas fa-calendar-alt"></i> Rekap Bulanan
                </a>
                <a class="nav-link" data-tab="yearly" onclick="switchTab('yearly')">
                    <i class="fas fa-business-time"></i> Rekap Tahunan
                </a>
                <a class="nav-link" data-tab="leaderboard" onclick="switchTab('leaderboard')">
                    <i class="fas fa-trophy"></i> Papan Kinerja
                </a>
                <a class="nav-link" data-tab="handover" onclick="switchTab('handover')">
                    <i class="fas fa-exchange-alt"></i> Peralihan Shift
                </a>
                <a class="nav-link" data-tab="users" onclick="switchTab('users')" id="navLinkUsers">
                    <i class="fas fa-users-cog"></i> Kelola User
                </a>
            </nav>

            <div class="sidebar-footer">
                <button type="button" class="btn-report-bug" onclick="openBugModal()"
                    style="width: 100%; margin-bottom: 10px; background: rgba(231, 111, 81, 0.1); border: 1px dashed rgba(231, 111, 81, 0.4); color: #E76F51; font-weight: 600; padding: 10px; border-radius: var(--radius-sm); cursor: pointer; font-size: 12px; display: flex; align-items: center; justify-content: center; gap: 8px; transition: var(--transition); border-style: dashed;">
                    <i class="fas fa-bug"></i> Laporkan Masalah / Bug
                </button>
                <button class="btn-logout" onclick="handleLogout()">
                    <i class="fas fa-sign-out-alt"></i> Keluar Akun
                </button>
                <div
                    style="text-align: center; font-size: 11px; margin-top: 15px; color: #8DA9C4; opacity: 0.8; font-weight: 500;">
                    Williyanto Adi 2026
                </div>
            </div>
        </aside>

        <!-- Main Content Area -->
        <main>
            <header>
                <div class="page-title" style="display: flex; align-items: center; gap: 12px;">
                    <button type="button" id="mobileMenuBtn" class="mobile-menu-btn" onclick="toggleMobileSidebar()"
                        style="background: transparent; border: none; color: var(--primary); font-size: 22px; cursor: pointer; display: none;">
                        <i class="fas fa-bars"></i>
                    </button>
                    <div>
                        <h1>Daily Testing Performance Monitor - Final Test</h1>
                    </div>
                </div>

                <div class="header-actions">
                    <button class="btn-action" id="btnOnlineUsers" onclick="openOnlineUsersModal()"
                        style="display: none; background-color: var(--secondary);">
                        <i class="fas fa-circle"
                            style="color: #4CAF50; font-size: 10px; animation: pulse 2s infinite;"></i> User Online
                    </button>
                    <button class="btn-action" id="btnAddNewReport">
                        <i class="fas fa-plus"></i> Input Hasil Testing
                    </button>
                </div>
            </header>

            <div class="content-body">

                <!-- Global Filters Panel (Available in content header) -->
                <div class="filters-bar">
                    <div class="filter-item">
                        <label for="filterMonth"><i class="fas fa-calendar-week"></i> Bulan:</label>
                        <select id="filterMonth" class="filter-select">
                            <option value="1">Januari</option>
                            <option value="2">Februari</option>
                            <option value="3">Maret</option>
                            <option value="4">April</option>
                            <option value="5">Mei</option>
                            <option value="6">Juni</option>
                            <option value="7" selected>Juli</option>
                            <option value="8">Agustus</option>
                            <option value="9">September</option>
                            <option value="10">Oktober</option>
                            <option value="11">November</option>
                            <option value="12">Desember</option>
                        </select>
                    </div>

                    <div class="filter-item">
                        <label for="filterYear"><i class="fas fa-calendar-alt"></i> Tahun:</label>
                        <select id="filterYear" class="filter-select">
                            <option value="2026" selected>2026</option>
                        </select>
                    </div>
                </div>

                <!-- TAB 1: DASHBOARD OVERVIEW -->
                <div id="dashboardTab" class="dashboard-tab active-tab">
                    <!-- KPI Cards Grid -->
                    <div class="metrics-grid">
                        <div class="metric-card">
                            <div class="metric-icon"><i class="fas fa-drum"></i></div>
                            <div class="metric-info">
                                <span class="label">Total Drum Diuji</span>
                                <span id="metricDrums" class="value">0</span>
                            </div>
                        </div>
                        <div class="metric-card info-card">
                            <div class="metric-icon"><i class="fas fa-calendar-day"></i></div>
                            <div class="metric-info">
                                <span class="label">Input Terakhir</span>
                                <span id="metricLastInput" class="value"
                                    style="font-size: 16px; font-weight: 700; color: var(--secondary); margin-top: 4px;">-</span>
                            </div>
                        </div>
                        <div class="metric-card success-card">
                            <div class="metric-icon"><i class="fas fa-dolly-flatbed"></i></div>
                            <div class="metric-info">
                                <span class="label">Total Output</span>
                                <span id="metricOutput" class="value">0</span>
                            </div>
                        </div>
                        <div class="metric-card accent-card">
                            <div class="metric-icon"><i class="fas fa-check-circle"></i></div>
                            <div class="metric-info">
                                <span class="label">Tingkat Kelulusan (OK)</span>
                                <span id="metricSuccess" class="value">0%</span>
                            </div>
                        </div>
                        <div class="metric-card danger-card">
                            <div class="metric-icon"><i class="fas fa-ban"></i></div>
                            <div class="metric-info">
                                <span class="label">Total Produk NCA</span>
                                <span id="metricReject" class="value">0</span>
                            </div>
                        </div>
                    </div>

                    <!-- Charts Grid -->
                    <div class="charts-grid">
                        <div class="dashboard-card">
                            <div class="card-header-flex">
                                <h3>Tren Hasil Testing Harian (Drum)</h3>
                                <p style="font-size: 11px; color: var(--text-muted);">Berdasarkan bulan terpilih</p>
                            </div>
                            <div class="chart-container">
                                <canvas id="dailyTrendChart"></canvas>
                            </div>
                        </div>

                        <div class="dashboard-card">
                            <div class="card-header-flex">
                                <h3>Status Hasil Pengujian</h3>
                                <p style="font-size: 11px; color: var(--text-muted);">Lulus vs Tidak Lulus</p>
                            </div>
                            <div class="chart-container">
                                <canvas id="statusBreakdownChart"></canvas>
                            </div>
                        </div>
                    </div>

                    <!-- Broadcast Sender Panel (Visible only to Supervisor/Manager/Super Admin) -->
                    <div id="broadcastSenderCard" class="dashboard-card" style="margin-top: 20px; display: none;">
                        <div class="card-header-flex">
                            <div>
                                <h3 style="display: flex; align-items: center; gap: 8px;"><i class="fas fa-bullhorn"
                                        style="color: var(--primary);"></i> Siarkan Instruksi / Pesan Cepat</h3>
                                <p style="font-size: 11px; color: var(--text-muted); margin-top: 4px;">Kirim pesan
                                    pop-up instan kepada semua operator yang sedang aktif</p>
                            </div>
                        </div>
                        <div style="padding: 20px; display: flex; gap: 12px; align-items: center; flex-wrap: wrap;">
                            <input type="text" id="broadcastInput" class="form-control"
                                placeholder="Ketik instruksi penting atau informasi cepat di sini..."
                                style="flex-grow: 1; padding-left: 15px; min-width: 250px;">
                            <button type="button" class="btn btn-primary" onclick="sendBroadcastMessage()"
                                style="padding: 12px 24px; min-height: 42px; display: inline-flex; align-items: center; gap: 8px; cursor: pointer; border-radius: var(--radius-sm); font-weight: 600; flex-shrink: 0;">
                                <i class="fas fa-paper-plane"></i> Siarkan Pesan
                            </button>
                        </div>

                        <!-- Broadcast History List -->
                        <div id="broadcastHistoryArea"
                            style="padding: 0 20px 20px 20px; border-top: 1px solid var(--border-color); margin-top: 5px;">
                            <h4
                                style="margin: 15px 0 10px 0; font-size: 13px; color: var(--secondary); display: flex; align-items: center; gap: 6px;">
                                <i class="fas fa-history" style="color: var(--primary);"></i> Riwayat Siaran & Status
                                Pembaca (Operator)
                            </h4>
                            <div class="table-responsive"
                                style="max-height: 200px; overflow-y: auto; border: 1px solid var(--border-color); border-radius: var(--radius-sm);">
                                <table class="table" style="font-size: 12px; margin-bottom: 0;">
                                    <thead>
                                        <tr style="background-color: var(--bg-main);">
                                            <th style="width: 22%;">Tanggal & Waktu</th>
                                            <th style="width: 15%;">Pengirim</th>
                                            <th style="width: 38%;">Pesan Siaran</th>
                                            <th style="width: 25%;">Status Pembaca (Acknowledge)</th>
                                        </tr>
                                    </thead>
                                    <tbody id="broadcastHistoryList">
                                        <!-- Will be rendered dynamically -->
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    <!-- Recent Activity Table -->
                    <div class="dashboard-card" style="margin-top: 20px;">
                        <div class="card-header-flex">
                            <h3>Aktivitas Input Testing Terakhir</h3>
                            <button class="btn-secondary btn" style="padding: 6px 12px; font-size: 12px;"
                                onclick="switchTab('monthly')">Lihat Semua</button>
                        </div>
                        <div class="table-responsive">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Hari & Tanggal</th>
                                        <th>Shift</th>
                                        <th>Tester Utama</th>
                                        <th>Asisten (Partner)</th>
                                        <th>Tipe Kabel (Hot Key)</th>
                                        <th>Panjang (m)</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody id="recentReportsTbody">
                                    <!-- Auto-filled by JS -->
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <!-- TAB 2: MONTHLY RECAP -->
                <div id="monthlyTab" class="dashboard-tab">
                    <div class="dashboard-card">
                        <div class="card-header-flex">
                            <h3>Rincian Pengujian & Rekap Bulanan</h3>
                        </div>

                        <!-- Summary details bar -->
                        <div id="monthlySummaryInfo">
                            <!-- Filled dynamically -->
                        </div>

                        <div class="table-responsive">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Hari & Tanggal</th>
                                        <th>Shift</th>
                                        <th>Tester</th>
                                        <th>Partner</th>

                                        <th>No. Produksi</th>
                                        <th>Tipe Kabel (Size)</th>
                                        <th>Panjang</th>
                                        <th>Status</th>
                                        <th style="width: 80px;">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody id="monthlyReportsTbody">
                                    <!-- Auto-filled by JS -->
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <!-- TAB 3: YEARLY RECAP -->
                <div id="yearlyTab" class="dashboard-tab">
                    <div class="metrics-grid" id="yearlyStatsGrid" style="grid-template-columns: repeat(4, 1fr);">
                        <!-- Dynamic content -->
                    </div>

                    <div class="charts-grid" style="grid-template-columns: 1fr; margin-top: 20px;">
                        <div class="dashboard-card">
                            <div class="card-header-flex">
                                <h3>Perbandingan Pengujian Bulanan Sepanjang Tahun</h3>
                            </div>
                            <div class="chart-container" style="min-height: 320px;">
                                <canvas id="yearlyTrendChart"></canvas>
                            </div>
                        </div>
                    </div>

                    <div class="dashboard-card" style="margin-top: 20px;">
                        <div class="card-header-flex">
                            <h3>Rekapitulasi Kumulatif Bulanan</h3>
                        </div>
                        <div class="table-responsive">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Bulan</th>
                                        <th>Jumlah Laporan</th>
                                        <th>Total Input (Drum)</th>
                                        <th>Total Output (Drum)</th>
                                        <th>Total Sisa Input (Drum)</th>
                                        <th>Total Panjang Kabel (m)</th>
                                        <th>Kelulusan OK (%)</th>
                                    </tr>
                                </thead>
                                <tbody id="yearlySummaryTbody">
                                    <!-- Auto-filled by JS -->
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <!-- TAB 4: LEADERBOARD -->
                <div id="leaderboardTab" class="dashboard-tab">
                    <div class="dashboard-card">
                        <div class="card-header-flex">
                            <div>
                                <h3 id="leaderboardTitle">Papan Peringkat Kinerja Tim</h3>
                                <p style="font-size: 12px; color: var(--text-muted); margin-top: 4px;">Kinerja dihitung
                                    berdasarkan total drum output yang dikerjakan pasangan tim (2 orang)</p>
                            </div>

                        </div>

                        <div class="table-responsive" style="margin-top: 15px;">
                            <table>
                                <thead>
                                    <tr>
                                        <th style="width: 70px;">Peringkat</th>
                                        <th id="leaderboardCol1">Pasangan Tim</th>
                                        <th id="leaderboardCol2">Peran</th>
                                        <th>Kontribusi Output</th>
                                        <th>Total Pengujian</th>
                                        <th>Panjang Kabel</th>
                                        <th>Rasio Kualitas OK</th>
                                    </tr>
                                </thead>
                                <tbody id="leaderboardTbody">
                                    <!-- Auto-filled by JS -->
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <!-- TAB 5: KELOLA USER -->
                <div id="usersTab" class="dashboard-tab">
                    <div class="dashboard-card">
                        <div class="card-header-flex">
                            <div>
                                <h3>Kelola Akun Karyawan</h3>
                                <p style="font-size: 12px; color: var(--text-muted); margin-top: 4px;">Super Admin,
                                    Manager, dan Supervisor dapat mengelola akun karyawan</p>
                            </div>
                            <div style="display: flex; gap: 10px; align-items: center;">
                                <div id="superAdminDataActions" style="display: none; gap: 10px; align-items: center;">
                                    <button type="button" class="btn btn-secondary" onclick="exportBackupData()"
                                        style="padding: 10px 14px; font-size: 13px; display: inline-flex; align-items: center; gap: 6px; border: 1px solid rgba(19, 154, 140, 0.2); background-color: #fff; color: var(--primary); font-weight: 600; cursor: pointer; border-radius: var(--radius-sm);">
                                        <i class="fas fa-file-download"></i> Ekspor Data
                                    </button>
                                    <button type="button" class="btn btn-secondary" onclick="triggerImport()"
                                        style="padding: 10px 14px; font-size: 13px; display: inline-flex; align-items: center; gap: 6px; border: 1px solid rgba(19, 154, 140, 0.2); background-color: #fff; color: var(--primary); font-weight: 600; cursor: pointer; border-radius: var(--radius-sm);">
                                        <i class="fas fa-file-upload"></i> Impor Data
                                    </button>
                                    <input type="file" id="importFile" onchange="importBackupData(event)"
                                        style="display: none;" accept=".json">
                                </div>
                                <button class="btn-action" onclick="openUserModal()">
                                    <i class="fas fa-user-plus"></i> Tambah Karyawan Baru
                                </button>
                            </div>
                        </div>

                        <div class="table-responsive" style="margin-top: 15px;">
                            <table>
                                <thead>
                                    <tr>
                                        <th style="width: 60px; text-align: center;">Sortir</th>
                                        <th>Nama Lengkap</th>
                                        <th>Username</th>
                                        <th>Password</th>
                                        <th>Role / Jabatan</th>
                                        <th>Grup</th>
                                        <th style="width: 150px;">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody id="usersTableTbody">
                                    <!-- Auto-filled by JS -->
                                </tbody>
                            </table>
                        </div>
                    </div>



                </div>

                <!-- TAB 6: PERALIHAN SHIFT (SHIFT HANDOVER) -->
                <div id="handoverTab" class="dashboard-tab">

                    <!-- Shift Selector Bar -->
                    <div class="dashboard-card"
                        style="margin-bottom: 20px; padding: 18px 24px; background-color: var(--secondary); border-radius: var(--radius); overflow: visible;">
                        <div
                            style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px;">
                            <div style="display: flex; align-items: center; gap: 12px;">
                                <i class="fas fa-exchange-alt" style="font-size: 22px; color: var(--primary);"></i>
                                <div>
                                    <h4 style="margin: 0; font-size: 15px; color: #fff;">Kirim Catatan Peralihan Shift
                                    </h4>
                                    <p style="margin: 4px 0 0 0; font-size: 11px; color: rgba(255,255,255,0.65);">Pilih
                                        shift asal dan shift tujuan, lalu tulis instruksi pekerjaan</p>
                                </div>
                            </div>
                            <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
                                <div style="display: flex; flex-direction: column; gap: 3px;">
                                    <label
                                        style="font-size: 10px; font-weight: 700; color: rgba(255,255,255,0.7); letter-spacing: 0.5px; text-transform: uppercase;">DARI
                                        SHIFT</label>
                                    <select id="fromShiftSelect" class="form-control" onchange="changeHandoverShift()"
                                        style="width: 120px; padding: 8px 12px; border-color: rgba(255,255,255,0.25); font-weight: 700; color: var(--secondary); background-color: #fff; height: 38px; border-radius: var(--radius-sm);">
                                        <option value="1">Shift 1</option>
                                        <option value="2">Shift 2</option>
                                        <option value="3">Shift 3</option>
                                    </select>
                                </div>
                                <div style="color: rgba(255,255,255,0.8); font-size: 18px; margin-top: 14px;">→</div>
                                <div style="display: flex; flex-direction: column; gap: 3px;">
                                    <label
                                        style="font-size: 10px; font-weight: 700; color: rgba(255,255,255,0.7); letter-spacing: 0.5px; text-transform: uppercase;">KE
                                        SHIFT</label>
                                    <select id="toShiftSelect" class="form-control" onchange="changeHandoverShift()"
                                        style="width: 120px; padding: 8px 12px; border-color: rgba(255,255,255,0.25); font-weight: 700; color: var(--secondary); background-color: #fff; height: 38px; border-radius: var(--radius-sm);">
                                        <option value="2">Shift 2</option>
                                        <option value="3">Shift 3</option>
                                        <option value="1">Shift 1</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;"
                        id="handoverGridContainer">

                        <!-- Left: Write Handover Note -->
                        <div class="dashboard-card" style="margin-bottom: 0;">
                            <div class="card-header-flex">
                                <h3><i class="fas fa-pen-fancy" style="color: var(--primary);"></i> Tulis Catatan Operan
                                </h3>
                            </div>
                            <div style="padding: 20px;">
                                <p id="handoverWriteHint"
                                    style="font-size: 12px; color: var(--text-muted); margin-bottom: 15px; line-height: 1.4; background-color: var(--primary-light); padding: 8px 12px; border-radius: var(--radius-sm); border-left: 3px solid var(--primary);">
                                    Tulis instruksi dari <strong>Shift 1</strong> untuk <strong>Shift 2</strong>.
                                </p>
                                <div class="form-group">
                                    <label for="handoverText" style="font-weight: 600;">Catatan / Instruksi
                                        Pekerjaan</label>
                                    <textarea id="handoverText" class="form-control" rows="6"
                                        placeholder="Ketik rincian pekerjaan, kondisi mesin, atau kendala di sini..."
                                        style="padding-top: 10px; line-height: 1.4;" required></textarea>
                                </div>
                                <button type="button" id="sendHandoverBtn" class="btn btn-primary"
                                    onclick="sendHandoverNote()"
                                    style="width: 100%; margin-top: 15px; padding: 12px; display: inline-flex; align-items: center; justify-content: center; gap: 8px; font-weight: 600; cursor: pointer; border-radius: var(--radius-sm);">
                                    <i class="fas fa-share-square"></i> Kirim dari Shift 1 ke Shift 2
                                </button>
                            </div>
                        </div>

                        <!-- Right: Inbox for target shift -->
                        <div class="dashboard-card" style="margin-bottom: 0;">
                            <div class="card-header-flex">
                                <h3 id="handoverInboxTitle"><i class="fas fa-envelope-open-text"
                                        style="color: var(--primary);"></i> Kotak Masuk Shift 2</h3>
                            </div>
                            <div style="padding: 20px; max-height: 380px; overflow-y: auto;" id="handoverInboxList">
                                <!-- Will be rendered dynamically -->
                            </div>
                        </div>

                    </div>

                    <!-- Bottom: Full Handover History (Visible only to Admin/Supervisor/Manager) -->
                    <div class="dashboard-card" id="handoverHistoryCard" style="display: none; margin-top: 20px;">
                        <div class="card-header-flex">
                            <div>
                                <h3><i class="fas fa-history" style="color: var(--primary);"></i> Riwayat Log Peralihan
                                    Shift (Semua Shift)</h3>
                                <p style="font-size: 11px; color: var(--text-muted); margin-top: 4px;">Supervisor,
                                    Manager, dan Super Admin dapat memantau seluruh riwayat log operan shift</p>
                            </div>
                        </div>
                        <div class="table-responsive"
                            style="padding: 0; max-height: 300px; overflow-y: auto; border: 1px solid var(--border-color); border-radius: var(--radius-sm); margin: 0 20px 20px 20px;">
                            <table class="table" style="font-size: 13px; margin-bottom: 0;">
                                <thead>
                                    <tr style="background-color: var(--bg-main);">
                                        <th style="width: 20%;">Tanggal & Waktu</th>
                                        <th style="width: 12%;">Shift Asal</th>
                                        <th style="width: 12%;">Shift Tujuan</th>
                                        <th style="width: 18%;">Pengirim</th>
                                        <th>Isi Catatan / Instruksi Pekerjaan</th>
                                    </tr>
                                </thead>
                                <tbody id="handoverHistoryTbody">
                                    <!-- Will be rendered dynamically -->
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <!-- WhatsApp Shift Report Generator -->
                    <div class="dashboard-card" id="waReportCard" style="margin-top: 20px;">
                        <div class="card-header-flex">
                            <div>
                                <h3 style="display:flex;align-items:center;gap:8px;">
                                    <i class="fab fa-whatsapp" style="color:#25D366;font-size:20px;"></i> Buat Laporan
                                    Shift ke Grup WhatsApp
                                </h3>
                                <p style="font-size:11px;color:var(--text-muted);margin-top:4px;">Rangkum hasil testing,
                                    petugas jaga, dan catatan tambahan — siap kirim ke grup WA</p>
                            </div>
                        </div>
                        <div style="padding: 20px; display: grid; grid-template-columns: 1fr 1fr; gap: 20px;"
                            id="waReportGrid">

                            <!-- Left: Parameters -->
                            <div>
                                <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:14px;">
                                    <div class="form-group" style="margin:0;">
                                        <label
                                            style="font-size:11px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;">Grup</label>
                                        <select id="waReportGroup" class="form-control" onchange="generateWAReport()"
                                            style="height:38px;padding-left:10px;font-weight:600;">
                                            <option value="Grup 1">Grup 1</option>
                                            <option value="Grup 2">Grup 2</option>
                                            <option value="Grup 3">Grup 3</option>
                                            <option value="Grup 4">Grup 4</option>
                                        </select>
                                    </div>
                                    <div class="form-group" style="margin:0;">
                                        <label
                                            style="font-size:11px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;">Shift</label>
                                        <select id="waReportShift" class="form-control" onchange="generateWAReport()"
                                            style="height:38px;padding-left:10px;font-weight:600;">
                                            <option value="1">Shift 1</option>
                                            <option value="2">Shift 2</option>
                                            <option value="3">Shift 3</option>
                                        </select>
                                    </div>
                                </div>
                                <div class="form-group" style="margin-bottom:14px;">
                                    <label
                                        style="font-size:11px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;">Tanggal
                                        Laporan</label>
                                    <input type="date" id="waReportDate" class="form-control"
                                        onchange="generateWAReport()" style="height:38px;padding-left:10px;">
                                </div>
                                <div class="form-group" style="margin-bottom:14px;">
                                    <label
                                        style="font-size:11px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;">Petugas
                                        Jaga (Nama, pisahkan koma)</label>
                                    <input type="text" id="waReportOfficers" class="form-control"
                                        placeholder="cth: Budi Santoso, Achmad Fauzi" oninput="generateWAReport()"
                                        style="padding-left:10px;height:38px;">
                                </div>
                                <div class="form-group" style="margin-bottom:14px;">
                                    <label
                                        style="font-size:11px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;">Catatan
                                        Tambahan (Cleaning, Masalah, dll)</label>
                                    <textarea id="waReportNotes" class="form-control" rows="4"
                                        placeholder="cth: Cleaning area line A selesai, Mesin ekstrusi dalam kondisi normal, dll."
                                        oninput="generateWAReport()"
                                        style="padding-top:8px;line-height:1.5;"></textarea>
                                </div>
                                <button type="button" onclick="generateWAReport()" class="btn btn-secondary"
                                    style="width:100%;padding:10px;border:1px solid var(--border-color);font-weight:600;display:inline-flex;align-items:center;justify-content:center;gap:8px;cursor:pointer;border-radius:var(--radius-sm);">
                                    <i class="fas fa-sync-alt"></i> Perbarui Preview
                                </button>
                            </div>

                            <!-- Right: Preview + Send -->
                            <div style="display:flex;flex-direction:column;gap:12px;">
                                <label
                                    style="font-size:11px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;">Preview
                                    Pesan WhatsApp</label>
                                <textarea id="waReportPreview" class="form-control" rows="14" readonly
                                    style="background-color:var(--bg-main);font-family:monospace;font-size:12px;line-height:1.6;padding:14px;color:var(--secondary);border-color:var(--border-color);resize:vertical;"></textarea>
                                <div style="display:flex;gap:10px;">
                                    <button type="button" onclick="copyWAReport()" class="btn btn-secondary"
                                        style="flex:1;padding:10px;font-weight:600;display:inline-flex;align-items:center;justify-content:center;gap:8px;cursor:pointer;border-radius:var(--radius-sm);border:1px solid var(--border-color);">
                                        <i class="fas fa-copy"></i> Salin Teks
                                    </button>
                                    <button type="button" onclick="sendToWhatsApp()" class="btn btn-primary"
                                        style="flex:1;padding:10px;font-weight:600;background-color:#25D366;border-color:#25D366;display:inline-flex;align-items:center;justify-content:center;gap:8px;cursor:pointer;border-radius:var(--radius-sm);">
                                        <i class="fab fa-whatsapp"></i> Buka di WhatsApp
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

                <!-- Footer -->
                <footer
                    style="text-align: center; padding: 20px 0; margin-top: 30px; font-size: 13px; color: var(--text-muted); border-top: 1px solid rgba(19, 154, 140, 0.08);">
                    &copy; Williyanto Adi 2026 - PT. Prysmian Cables Indonesia Final Test Report Dashboard
                </footer>
        </main>
    </div>

    <!-- 3. REPORT DATA DIALOG/MODAL -->
    <div id="reportModal" class="modal-overlay">
        <div class="modal-content">
            <div class="modal-header">
                <h2 id="modalTitle">Input Hasil Testing</h2>
                <button type="button" class="btn-close-modal" onclick="closeReportModal()">&times;</button>
            </div>

            <form id="reportForm">
                <div class="modal-body">
                    <!-- Row 1: Date & Shift -->
                    <div class="form-row">
                        <div class="form-group">
                            <label for="formDate">Hari & Tanggal Pengujian</label>
                            <input type="date" id="formDate" class="form-control" style="padding-left: 15px;" required>
                        </div>

                        <div class="form-group">
                            <label for="formShift">Shift Kerja</label>
                            <select id="formShift" class="form-control" style="padding-left: 15px;">
                                <option value="1">Shift 1</option>
                                <option value="2">Shift 2</option>
                                <option value="3">Shift 3</option>
                            </select>
                        </div>
                    </div>

                    <!-- Row 2: Production Details -->
                    <div class="form-grid-3">
                        <div class="form-group">
                            <label for="formOrdering">Nomor Bobin</label>
                            <select id="formOrderingSelect" class="form-control" style="padding-left: 15px;"
                                onchange="checkCustomOrdering()">
                                <option value="DELIVERY">DELIVERY</option>
                                <option value="STOCK">STOCK</option>
                                <option value="CUSTOM">Lainnya (Ketik Sendiri)...</option>
                            </select>
                            <input type="text" id="formOrderingCustom" class="form-control"
                                style="padding-left: 15px; margin-top: 10px; display: none;"
                                placeholder="Ketik nomor bobin yang sesuai...">
                            <input type="hidden" id="formOrdering" value="DELIVERY">
                        </div>

                        <div class="form-group">
                            <label for="formProdNo">Nomor Produksi</label>
                            <input type="text" id="formProdNo" class="form-control" style="padding-left: 15px;"
                                placeholder="07008255-2020141" required>
                        </div>

                        <div class="form-group">
                            <label for="formCustomer">Nama Pelanggan</label>
                            <input type="text" id="formCustomer" class="form-control" style="padding-left: 15px;"
                                placeholder="PT PERUSAHAAN LISTRIK NEGARA" required>
                        </div>
                    </div>

                    <!-- Row 3: Cable Specs & Length -->
                    <div class="form-row">
                        <div class="form-group">
                            <label for="formCableType">Tipe & Ukuran Kabel</label>
                            <input type="text" id="formCableType" class="form-control" style="padding-left: 15px;"
                                placeholder="3KV NYY 1X70 MM2 RM" required>
                        </div>

                        <div class="form-group">
                            <label for="formLength">Panjang Kabel</label>
                            <div style="display: flex; gap: 8px;">
                                <input type="number" id="formLength" class="form-control"
                                    style="padding-left: 15px; flex: 1;" placeholder="1000" min="1" required>
                                <select id="formLengthUnit" class="filter-select"
                                    style="width: 80px; padding: 12px 10px;">
                                    <option value="m">m</option>
                                    <option value="ft">ft</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <!-- Tests Checklist (OK/FAIL status selection) -->
                    <div>
                        <span class="checkbox-group-title">Pengujian Yang Dilakukan:</span>
                        <div
                            style="background-color: var(--bg-main); padding: 15px; border-radius: var(--radius-sm); border: 1px solid rgba(19, 154, 140, 0.08); margin-bottom: 20px;">
                            <div
                                style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 15px;">
                                <div class="form-group" style="margin-bottom: 0;">
                                    <label style="font-size: 12px; margin-bottom: 4px;">1. Elektrik</label>
                                    <select id="statusElektrik" class="form-control" style="padding-left: 15px;">
                                        <option value="OK">OK</option>
                                        <option value="FAIL">Gagal</option>
                                        <option value="NOT_TESTED">Tidak Diuji</option>
                                    </select>
                                </div>
                                <div class="form-group" style="margin-bottom: 0;">
                                    <label style="font-size: 12px; margin-bottom: 4px;">2. Dimensi</label>
                                    <select id="statusDimensi" class="form-control" style="padding-left: 15px;">
                                        <option value="OK">OK</option>
                                        <option value="FAIL">Gagal</option>
                                        <option value="NOT_TESTED">Tidak Diuji</option>
                                    </select>
                                </div>
                                <div class="form-group" style="margin-bottom: 0;">
                                    <label style="font-size: 12px; margin-bottom: 4px;">3. SQC</label>
                                    <select id="statusSqc" class="form-control" style="padding-left: 15px;">
                                        <option value="OK">OK</option>
                                        <option value="FAIL">Gagal</option>
                                        <option value="NOT_TESTED">Tidak Diuji</option>
                                    </select>
                                </div>
                                <div class="form-group" style="margin-bottom: 0;">
                                    <label style="font-size: 12px; margin-bottom: 4px;">4. Water Test</label>
                                    <select id="statusWater" class="form-control" style="padding-left: 15px;">
                                        <option value="NOT_TESTED">Tidak Diuji</option>
                                        <option value="OK">OK</option>
                                        <option value="FAIL">Gagal</option>
                                    </select>
                                </div>
                                <div class="form-group" style="margin-bottom: 0;">
                                    <label style="font-size: 12px; margin-bottom: 4px;">5. Record PD</label>
                                    <select id="statusRecordPd" class="form-control" style="padding-left: 15px;">
                                        <option value="NOT_TESTED">Tidak Diuji</option>
                                        <option value="OK">OK</option>
                                        <option value="FAIL">Gagal</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Status Radios (styled card-buttons) -->
                    <div class="form-row">
                        <div class="form-group">
                            <label>Status Hasil Akhir (Overall Status)</label>
                            <div class="status-selector">
                                <label class="status-card status-card-pass" id="cardPassed">
                                    <input type="radio" name="overallStatus" id="statusPassed" value="PASSED" checked
                                        onchange="updateStatusCards()">
                                    <i class="fas fa-check-circle"></i>
                                    <span>PASSED</span>
                                </label>
                                <label class="status-card status-card-nca" id="cardNca">
                                    <input type="radio" name="overallStatus" id="statusReject" value="NCA"
                                        onchange="updateStatusCards()">
                                    <i class="fas fa-times-circle"></i>
                                    <span>NCA</span>
                                </label>
                            </div>
                        </div>

                        <div class="form-group" id="notesFormGroup" style="display: none;">
                            <label for="formNotes">NCA ID</label>
                            <input type="text" id="formNotes" class="form-control" style="padding-left: 15px;"
                                placeholder="NCA ID: 442159">
                        </div>
                    </div>
                </div>

                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" onclick="closeReportModal()">Batalkan</button>
                    <button type="button" class="btn btn-save-next" id="saveAndNextBtn" onclick="handleSaveAndNext()">
                        <i class="fas fa-layer-group"></i> Simpan &amp; Lanjut
                    </button>
                    <button type="submit" class="btn btn-primary" id="saveReportBtn">
                        <i class="fas fa-save"></i> Simpan Laporan
                    </button>
                </div>
            </form>
        </div>
    </div>

    <!-- 4. USER CRUD DIALOG/MODAL -->
    <div id="userModal" class="modal-overlay">
        <div class="modal-content" style="max-width: 480px;">
            <div class="modal-header">
                <h2 id="userModalTitle">Tambah Akun Karyawan</h2>
                <button type="button" class="btn-close-modal" onclick="closeUserModal()">&times;</button>
            </div>

            <form id="userForm">
                <div class="modal-body">
                    <input type="hidden" id="userFormId">
                    <div class="form-group">
                        <label for="userFormName">Nama Lengkap</label>
                        <input type="text" id="userFormName" class="form-control" style="padding-left: 15px;"
                            placeholder="Nama Lengkap Karyawan" required>
                    </div>

                    <div class="form-group">
                        <label for="userFormUsername">Username</label>
                        <input type="text" id="userFormUsername" class="form-control" style="padding-left: 15px;"
                            placeholder="contoh: amar.saidin" required>
                    </div>

                    <div class="form-group">
                        <label for="userFormPassword">Password</label>
                        <input type="text" id="userFormPassword" class="form-control" style="padding-left: 15px;"
                            placeholder="password123" required>
                    </div>

                    <div class="form-group">
                        <label for="userFormRole">Role / Jabatan</label>
                        <select id="userFormRole" class="form-control" style="padding-left: 15px;">
                            <option value="Operator">Operator (User Biasa)</option>
                            <option value="Supervisor">Supervisor (Admin)</option>
                            <option value="Manager">Manager (Akses Supervisor)</option>
                            <option value="Super Admin">Super Admin (Akses Full)</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label for="userFormGroup">Grup</label>
                        <select id="userFormGroup" class="form-control" style="padding-left: 15px;">
                            <option value="Non Grup">Non Grup</option>
                            <option value="Grup 1">Grup 1</option>
                            <option value="Grup 2">Grup 2</option>
                            <option value="Grup 3">Grup 3</option>
                            <option value="Grup 4">Grup 4</option>
                        </select>
                    </div>
                </div>

                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" onclick="closeUserModal()">Batal</button>
                    <button type="submit" class="btn btn-primary"><i class="fas fa-save"></i> Simpan Akun</button>
                </div>
            </form>
        </div>
    </div>

    <!-- 5. BUG REPORT MODAL -->
    <div id="bugModal" class="modal-overlay">
        <div class="modal-content" style="max-width: 500px;">
            <div class="modal-header" style="background-color: #E76F51;">
                <h2 style="color: #fff; display: flex; align-items: center; gap: 8px;"><i class="fas fa-bug"></i>
                    Laporkan Masalah / Bug</h2>
                <button class="close-modal-btn" onclick="closeBugModal()">&times;</button>
            </div>
            <div class="modal-body">
                <p style="font-size: 13px; color: var(--text-muted); margin-bottom: 15px;">
                    Silakan isi rincian kendala yang Anda temukan. Sistem akan secara otomatis mengarahkan Anda untuk
                    mengirimkan laporan ini via email ke <strong>williyanto.adi@gmail.com</strong>.
                </p>
                <div class="form-group">
                    <label for="bugTitle">Subjek Masalah</label>
                    <input type="text" id="bugTitle" class="form-control"
                        placeholder="Contoh: Error saat mengunduh data ekspor" required>
                </div>
                <div class="form-group" style="margin-top: 15px;">
                    <label for="bugDescription">Deskripsi Masalah & Langkah Reproduksi</label>
                    <textarea id="bugDescription" class="form-control" rows="4" placeholder="Jelaskan detail bug..."
                        style="padding-top: 10px;" required></textarea>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" onclick="closeBugModal()">Batal</button>
                <button type="button" class="btn btn-primary" onclick="sendBugEmail()"
                    style="background-color: #E76F51; border-color: #E76F51;"><i class="fas fa-paper-plane"></i> Kirim
                    Laporan</button>
            </div>
        </div>
    </div>

    <!-- 6. BROADCAST POP-UP MODAL -->
    <div id="broadcastModal" class="modal-overlay">
        <div class="modal-content" style="max-width: 450px; border-left: 5px solid var(--primary);">
            <div class="modal-header" style="background-color: var(--secondary); color: #fff;">
                <h2 style="color: #fff; display: flex; align-items: center; gap: 8px;"><i
                        class="fas fa-bell animate-bounce"></i> Instruksi & Pesan Cepat</h2>
                <button class="close-modal-btn btn-close-modal" onclick="closeBroadcastModal()">&times;</button>
            </div>
            <div class="modal-body" style="text-align: center; padding: 24px 20px;">
                <div
                    style="background-color: var(--bg-main); padding: 20px; border-radius: var(--radius); margin-bottom: 20px; box-shadow: inset 0 2px 4px rgba(0,0,0,0.02); text-align: left;">
                    <p id="broadcastMsgText"
                        style="font-size: 15px; font-weight: 600; color: var(--secondary); line-height: 1.5; white-space: pre-wrap;">
                    </p>
                </div>
                <p style="font-size: 12px; color: var(--text-muted);">
                    Dikirim oleh: <strong id="broadcastMsgSender" style="color: var(--primary);"></strong> pada <span
                        id="broadcastMsgTime"></span>
                </p>
            </div>
            <div class="modal-footer" style="justify-content: center;">
                <button type="button" class="btn btn-primary" onclick="closeBroadcastModal()"
                    style="min-width: 120px;">Saya Mengerti</button>
            </div>
        </div>
    </div>

    <!-- 7. ONLINE USERS MODAL -->
    <div id="onlineUsersModal" class="modal-overlay">
        <div class="modal-content" style="max-width: 400px;">
            <div class="modal-header">
                <h2 style="display: flex; align-items: center; gap: 8px;"><i class="fas fa-users"
                        style="color: var(--primary-light);"></i> Karyawan Online</h2>
                <button type="button" class="btn-close-modal" onclick="closeOnlineUsersModal()">&times;</button>
            </div>
            <div class="modal-body" style="padding: 0;">
                <ul id="onlineUsersList" style="list-style: none; margin: 0; padding: 0;">
                    <!-- Populated by JS -->
                </ul>
            </div>
        </div>
    </div>

    <!-- Save Toast Notification (Multi-Input Mode) -->
    <div id="saveToast" style="
        position: fixed; bottom: 28px; left: 50%; transform: translateX(-50%) translateY(100px);
        background-color: var(--success); color: #fff;
        padding: 12px 24px; border-radius: 30px;
        font-size: 14px; font-weight: 600;
        display: flex; align-items: center; gap: 8px;
        box-shadow: 0 6px 20px rgba(52,168,83,0.35);
        opacity: 0; transition: transform 0.3s ease, opacity 0.3s ease;
        z-index: 9999; pointer-events: none;
    ">
        <i class="fas fa-check-circle"></i>
        <span>Data berhasil disimpan! Siap input berikutnya.</span>
    </div>

    <!-- Application Controller Logic -->
    <script src="app.js"></script>
</body>

</html>
