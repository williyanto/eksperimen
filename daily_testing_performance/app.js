// Dynamic Users Database
let USERS = [];

function loadUsersDatabase() {
    const storedUsers = localStorage.getItem("prysmian_users");
    if (storedUsers) {
        USERS = JSON.parse(storedUsers);
    } else {
        USERS = [
            { id: 1, name: "Amar Saidin", username: "amar.saidin", password: "password123", role: "Supervisor" },
            { id: 2, name: "Willyanto Adi S.", username: "willyanto.adi", password: "password123", role: "Supervisor" },
            { id: 3, name: "Budi Santoso", username: "budi.santoso", password: "password123", role: "Operator" },
            { id: 4, name: "Hendra Wijaya", username: "hendra.wijaya", password: "password123", role: "Operator" },
            { id: 5, name: "Dian Pratama", username: "dian.pratama", password: "password123", role: "Operator" },
            { id: 6, name: "Eko Prasetyo", username: "eko.prasetyo", password: "password123", role: "Operator" },
            { id: 7, name: "Achmad Fauzi", username: "achmad.fauzi", password: "password123", role: "Operator" },
            { id: 8, name: "Rizky Hidayat", username: "rizky.hidayat", password: "password123", role: "Operator" }
        ];
        saveUsersDatabase();
    }
}

function saveUsersDatabase() {
    localStorage.setItem("prysmian_users", JSON.stringify(USERS));
}

// App State
let currentUser = null;
let currentAssistant = null;
let reports = [];
let editingReportId = null;

// Chart Instances
let dailyChartInstance = null;
let trendChartInstance = null;
let statusChartInstance = null;

// Initialize App
document.addEventListener("DOMContentLoaded", () => {
    loadUsersDatabase();
    initAuth();
    initUI();
    initEventListeners();
});

// --- Authentication Logic ---
function initAuth() {
    const savedUser = localStorage.getItem("prysmian_user");
    const savedAssistant = localStorage.getItem("prysmian_assistant");
    
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        if (savedAssistant) {
            currentAssistant = JSON.parse(savedAssistant);
        }
        showDashboard();
    } else {
        showLogin();
    }
    
    // Render account helpers for testing
    renderAccountHelpers();
}

function renderAccountHelpers() {
    const listContainer = document.getElementById("accountsList");
    if (!listContainer) return;
    
    listContainer.innerHTML = USERS.map(u => `
        <div class="account-item">
            <span><strong>${u.name}</strong> (${u.role})</span>
            <span class="username" onclick="fillLogin('${u.username}')" style="cursor:pointer; text-decoration:underline;">${u.username}</span>
            <span>Password: <code>${u.password}</code></span>
        </div>
    `).join("");
}

function fillLogin(username) {
    document.getElementById("loginUsername").value = username;
    document.getElementById("loginPassword").value = "password123";
}

function handleLogin(e) {
    e.preventDefault();
    const usernameInput = document.getElementById("loginUsername").value.trim().toLowerCase();
    const passwordInput = document.getElementById("loginPassword").value;
    
    const user = USERS.find(u => u.username === usernameInput && u.password === passwordInput);
    
    if (user) {
        currentUser = user;
        localStorage.setItem("prysmian_user", JSON.stringify(user));
        
        // Auto-assign assistant as the next person in list to ensure default state
        const otherUsers = USERS.filter(u => u.id !== user.id);
        currentAssistant = otherUsers[0];
        localStorage.setItem("prysmian_assistant", JSON.stringify(currentAssistant));
        
        showDashboard();
    } else {
        alert("Username atau Password salah!");
    }
}

function handleLogout() {
    localStorage.removeItem("prysmian_user");
    localStorage.removeItem("prysmian_assistant");
    currentUser = null;
    currentAssistant = null;
    showLogin();
}

function toggleAccountsInfo() {
    const list = document.getElementById("accountsList");
    const icon = document.getElementById("accountsToggleIcon");
    if (list.style.display === "none" || !list.style.display) {
        list.style.display = "flex";
        icon.className = "fas fa-chevron-up";
    } else {
        list.style.display = "none";
        icon.className = "fas fa-chevron-down";
    }
}

// --- View Swapping ---
function showLogin() {
    document.getElementById("authScreen").style.display = "flex";
    document.getElementById("appScreen").style.display = "none";
}

function showDashboard() {
    document.getElementById("authScreen").style.display = "none";
    document.getElementById("appScreen").style.display = "grid";
    
    // Load and clean reports
    loadReports();
    
    // Update user info in UI
    updateSidebarUser();
    
    // Hide/show navigation links based on user role
    const isOperator = currentUser.role === "Operator";
    document.querySelectorAll(".nav-link").forEach(link => {
        const tab = link.getAttribute("data-tab");
        if (isOperator && (tab === "monthly" || tab === "yearly" || tab === "leaderboard" || tab === "users")) {
            link.style.display = "none";
        } else {
            link.style.display = "flex";
        }
    });

    // Hide see-all button for operator on the dashboard
    const seeAllBtn = document.querySelector("#dashboardTab .card-header-flex button");
    if (seeAllBtn) {
        seeAllBtn.style.display = isOperator ? "none" : "block";
    }
    
    // Render users table if admin
    if (!isOperator) {
        renderUsersTable();
    }
    
    // Default to Dashboard tab
    switchTab("dashboard");
    
    // Populate dropdown of assistants
    populateAssistantsDropdown();
}

function updateSidebarUser() {
    document.getElementById("loggedInUserName").textContent = currentUser.name;
    
    const roleEl = document.querySelector(".sidebar-user .user-role");
    if (roleEl) {
        roleEl.textContent = currentUser.role;
    }
    
    if (currentAssistant) {
        document.getElementById("currentAssistantName").innerHTML = `<i class="fas fa-hands-helping"></i> Partner: ${currentAssistant.name}`;
    } else {
        document.getElementById("currentAssistantName").innerHTML = `<i class="fas fa-exclamation-triangle"></i> Partner: Pilih Asisten`;
    }
}

function populateAssistantsDropdown() {
    const assistants = USERS.filter(u => u.id !== currentUser.id);
    const dropdown = document.getElementById("assistantSelect");
    if (!dropdown) return;
    
    dropdown.innerHTML = assistants.map(u => `
        <option value="${u.id}" ${currentAssistant && currentAssistant.id === u.id ? 'selected' : ''}>${u.name}</option>
    `).join("");
}

function handleAssistantChange(e) {
    const assistantId = parseInt(e.target.value);
    const assistant = USERS.find(u => u.id === assistantId);
    if (assistant) {
        currentAssistant = assistant;
        localStorage.setItem("prysmian_assistant", JSON.stringify(assistant));
        updateSidebarUser();
        
        // Refresh calculations and UI when partner changes
        calculateMetrics();
    }
}

// --- Data CRUD Operations ---
function loadReports() {
    const stored = localStorage.getItem("prysmian_reports");
    if (stored) {
        reports = JSON.parse(stored);
    } else {
        generateMockData();
    }
    
    // Set date filters to current year/month
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1; // 1-indexed
    
    document.getElementById("filterYear").value = currentYear.toString();
    document.getElementById("filterMonth").value = currentMonth.toString();
}

function saveReports() {
    localStorage.setItem("prysmian_reports", JSON.stringify(reports));
}

// Mock Data Generator
function generateMockData() {
    const data = [];
    const now = new Date();
    const currentYear = 2026;
    const startMonth = 4; // May (0-indexed is 4, 1-indexed is 5)
    
    // Create records from May 1 to July 12, 2026
    const startDate = new Date(currentYear, startMonth, 1);
    const endDate = new Date(2026, 6, 12); // July 12, 2026
    
    const cableTypes = [
        { type: "3KV NYY 1X70 MM2 RM", customer: "PT PERUSAHAAN LISTRIK NEGARA (PERSERO)", code: "07008255-2020141" },
        { type: "1KV NYY 1X70 MM2 RM", customer: "PT PERUSAHAAN LISTRIK NEGARA (PERSERO)", code: "44106230-2020142" },
        { type: "0.6/1KV NYY 4X25 MM2 RM", customer: "PT KENCANA ELECTRIC", code: "12304859-2026043" },
        { type: "1KV NYFGbY 4X50 MM2 SM", customer: "PT SIEMENS INDONESIA", code: "77209384-2026011" },
        { type: "0.6/1KV NYA 1X10 MM2 RE", customer: "PT JAYA ABADI STEEL", code: "88392019-2026099" }
    ];

    let id = 1;
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        // Skip some days randomly (simulating days off or no testing)
        if (Math.random() > 0.85) continue;
        
        // 1 or 2 shifts per day
        const shifts = Math.random() > 0.5 ? [1, 2] : [2, 3];
        
        shifts.forEach(shift => {
            // Assign testers
            const testerIdx = Math.floor(Math.random() * USERS.length);
            let assistantIdx = Math.floor(Math.random() * USERS.length);
            while (assistantIdx === testerIdx) {
                assistantIdx = Math.floor(Math.random() * USERS.length);
            }
            
            const tester = USERS[testerIdx];
            const assistant = USERS[assistantIdx];
            
            // Output details
            const outputDrums = Math.floor(Math.random() * 4) + 1; // 1 to 4 drums
            const inputDrums = outputDrums;
            const sisaInput = 0;
            
            const cable = cableTypes[Math.floor(Math.random() * cableTypes.length)];
            const length = (Math.floor(Math.random() * 10) + 5) * 100 + Math.floor(Math.random() * 90); // 500 - 1500m
            
            const passed = Math.random() > 0.08; // 92% pass rate
            
            const reportDate = new Date(d);
            const dateString = reportDate.toISOString().split('T')[0];
            
            data.push({
                id: id++,
                date: dateString,
                shift: shift,
                inputDrums: inputDrums,
                outputDrums: outputDrums,
                sisaInput: sisaInput,
                notes: passed ? "" : `SQC ID: ${442100 + id} (REJECT)`,
                tester: tester.name,
                assistant: assistant.name,
                ordering: Math.random() > 0.5 ? "DELIVERY" : "STOCK",
                productionNo: cable.code,
                cableTypeSize: cable.type,
                customer: cable.customer,
                length: length,
                tests: {
                    elektrik: true,
                    dimensi: true,
                    sqc: Math.random() > 0.15,
                    waterTest: Math.random() > 0.5,
                    recordPd: Math.random() > 0.7
                },
                status: passed ? "PASSED" : "REJECT"
            });
        });
    }
    
    reports = data;
    saveReports();
}

// --- Navigation Tabs & Filtering ---
function initUI() {
    // Populate filters dropdown values
    const years = [2025, 2026, 2027];
    const yearSelect = document.getElementById("filterYear");
    yearSelect.innerHTML = years.map(y => `<option value="${y}">${y}</option>`).join("");
    
    // Cleaned form logic
}

function switchTab(tabId) {
    // Restrict Operator from tabs other than dashboard
    if (currentUser && currentUser.role === "Operator" && tabId !== "dashboard" && tabId !== "recent-tests") {
        return;
    }
    
    // Nav links
    document.querySelectorAll(".nav-link").forEach(link => {
        link.classList.remove("active");
        if (link.getAttribute("data-tab") === tabId) {
            link.classList.add("active");
        }
    });
    
    // Tab contents
    document.querySelectorAll(".dashboard-tab").forEach(tab => {
        tab.classList.remove("active-tab");
        if (tab.id === `${tabId}Tab`) {
            tab.classList.add("active-tab");
        }
    });
    
    // Run recalculation and UI rendering for the tab
    calculateMetrics();
}

// --- Calculations & Chart Rendering ---
function calculateMetrics() {
    const yearFilter = parseInt(document.getElementById("filterYear").value);
    const monthFilter = parseInt(document.getElementById("filterMonth").value);
    
    // Filter reports baseline based on role
    let baselineReports = reports;
    if (currentUser && currentUser.role === "Operator") {
        baselineReports = reports.filter(r => r.tester === currentUser.name);
    }
    
    // Filtered reports
    const filteredReports = baselineReports.filter(r => {
        const rDate = new Date(r.date);
        return rDate.getFullYear() === yearFilter && (rDate.getMonth() + 1) === monthFilter;
    });
    
    // Yearly reports (for yearly tab and monthly comparison trends)
    const yearlyReports = baselineReports.filter(r => {
        const rDate = new Date(r.date);
        return rDate.getFullYear() === yearFilter;
    });
    
    // Render active tab view
    const activeTab = document.querySelector(".dashboard-tab.active-tab");
    if (!activeTab) return;
    
    if (activeTab.id === "dashboardTab") {
        renderDashboardTab(filteredReports, yearlyReports);
    } else if (activeTab.id === "monthlyTab") {
        renderMonthlyTab(filteredReports);
    } else if (activeTab.id === "yearlyTab") {
        renderYearlyTab(yearlyReports);
    } else if (activeTab.id === "leaderboardTab") {
        renderLeaderboardTab(filteredReports);
    } else if (activeTab.id === "usersTab") {
        renderUsersTable();
    } else if (activeTab.id === "recent-testsTab") {
        renderRecentTestsTab(filteredReports);
    }
}

// Dashboard Page Rendering
function renderDashboardTab(monthlyData, yearlyData) {
    // 1. Calculate KPI Metrics Card
    const totalDrums = monthlyData.reduce((sum, r) => sum + r.inputDrums, 0);
    const outputDrums = monthlyData.reduce((sum, r) => sum + r.outputDrums, 0);
    const passedDrums = monthlyData.filter(r => r.status === "PASSED").reduce((sum, r) => sum + r.outputDrums, 0);
    const rejectDrums = monthlyData.filter(r => r.status === "REJECT").length; // count of records rejected
    
    const successRate = totalDrums > 0 ? ((passedDrums / totalDrums) * 100).toFixed(1) : "0";
    
    document.getElementById("metricDrums").textContent = totalDrums;
    document.getElementById("metricOutput").textContent = passedDrums;
    document.getElementById("metricSuccess").textContent = successRate + "%";
    document.getElementById("metricReject").textContent = rejectDrums;
    
    // 2. Render Charts
    renderDailyTrendChart(monthlyData);
    renderStatusBreakdownChart(monthlyData);
    
    // 3. Render Latest Daily Reports Table (Recent 5)
    const recentReports = [...monthlyData].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);
    const tbody = document.getElementById("recentReportsTbody");
    
    if (recentReports.length === 0) {
        tbody.innerHTML = `<tr><td colspan="10" style="text-align: center; color: var(--text-muted);">Tidak ada data testing pada bulan ini. Silakan tambahkan laporan baru.</td></tr>`;
    } else {
        tbody.innerHTML = recentReports.map(r => `
            <tr>
                <td><strong>${formatDateIndo(r.date)}</strong></td>
                <td><span class="badge badge-shift">Shift ${r.shift}</span></td>
                <td>${r.tester}</td>
                <td>${r.assistant}</td>
                <td>${r.cableTypeSize}</td>
                <td>${r.length.toLocaleString()} ${r.lengthUnit || "m"}</td>
                <td><span class="badge ${r.status === 'PASSED' ? 'badge-success' : 'badge-danger'}">${r.status}</span></td>
            </tr>
        `).join("");
    }
}

// Chart.js: Daily Testing Output Trend
function renderDailyTrendChart(monthlyData) {
    const ctx = document.getElementById("dailyTrendChart").getContext("2d");
    
    // Group outputs by date
    const dateMap = {};
    
    // Pre-fill all days of the selected month
    const year = parseInt(document.getElementById("filterYear").value);
    const month = parseInt(document.getElementById("filterMonth").value);
    const daysInMonth = new Date(year, month, 0).getDate();
    
    for (let i = 1; i <= daysInMonth; i++) {
        const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
        dateMap[dateStr] = { input: 0, output: 0 };
    }
    
    monthlyData.forEach(r => {
        if (dateMap[r.date]) {
            dateMap[r.date].input += r.inputDrums;
            dateMap[r.date].output += r.outputDrums;
        }
    });
    
    const labels = Object.keys(dateMap).map(d => d.split("-")[2]); // Just day number
    const inputs = Object.values(dateMap).map(v => v.input);
    const outputs = Object.values(dateMap).map(v => v.output);
    
    if (dailyChartInstance) {
        dailyChartInstance.destroy();
    }
    
    dailyChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Input Drums',
                    data: inputs,
                    borderColor: '#EE9B00',
                    backgroundColor: 'rgba(238, 155, 0, 0.1)',
                    borderWidth: 2,
                    tension: 0.3,
                    fill: true
                },
                {
                    label: 'Output Drums',
                    data: outputs,
                    borderColor: '#139A8C',
                    backgroundColor: 'rgba(19, 154, 140, 0.1)',
                    borderWidth: 2.5,
                    tension: 0.3,
                    fill: true
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'top', labels: { boxWidth: 12, font: { family: 'Plus Jakarta Sans', size: 11 } } }
            },
            scales: {
                y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } },
                x: { grid: { display: false } }
            }
        }
    });
}

// Chart.js: Status passed/reject doughnut chart
function renderStatusBreakdownChart(monthlyData) {
    const ctx = document.getElementById("statusBreakdownChart").getContext("2d");
    
    const passed = monthlyData.filter(r => r.status === "PASSED").reduce((sum, r) => sum + r.outputDrums, 0);
    const rejected = monthlyData.filter(r => r.status === "REJECT").reduce((sum, r) => sum + r.outputDrums, 0);
    
    if (statusChartInstance) {
        statusChartInstance.destroy();
    }
    
    if (passed === 0 && rejected === 0) {
        // Draw empty state
        statusChartInstance = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['No Data'],
                datasets: [{ data: [1], backgroundColor: ['#E9ECEF'] }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } }
            }
        });
        return;
    }
    
    statusChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['PASSED', 'REJECT'],
            datasets: [{
                data: [passed, rejected],
                backgroundColor: ['#2A9D8F', '#E76F51'],
                borderWidth: 0,
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        boxWidth: 12,
                        font: { family: 'Plus Jakarta Sans', size: 12, weight: '600' }
                    }
                }
            },
            cutout: '70%'
        }
    });
}

// Monthly Tab page rendering
function renderMonthlyTab(monthlyData) {
    const totalDrums = monthlyData.reduce((sum, r) => sum + r.inputDrums, 0);
    const outputDrums = monthlyData.reduce((sum, r) => sum + r.outputDrums, 0);
    const sisaDrums = monthlyData.reduce((sum, r) => sum + r.sisaInput, 0);
    const length = monthlyData.reduce((sum, r) => sum + r.length, 0);
    const passed = monthlyData.filter(r => r.status === "PASSED").reduce((sum, r) => sum + r.outputDrums, 0);
    const successRate = totalDrums > 0 ? ((passed / totalDrums) * 100).toFixed(1) : "0";

    document.getElementById("monthlySummaryInfo").innerHTML = `
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 20px;">
            <div style="background-color: var(--primary-light); padding: 15px; border-radius: var(--radius-sm); text-align: center;">
                <p style="font-size: 11px; font-weight: 600; color: var(--primary-dark); text-transform: uppercase;">Total Input</p>
                <h4 style="font-size: 20px; font-weight: 700; color: var(--secondary); margin-top: 5px;">${totalDrums} Drums</h4>
            </div>
            <div style="background-color: #E8F5E9; padding: 15px; border-radius: var(--radius-sm); text-align: center;">
                <p style="font-size: 11px; font-weight: 600; color: #2E7D32; text-transform: uppercase;">Total Output</p>
                <h4 style="font-size: 20px; font-weight: 700; color: var(--secondary); margin-top: 5px;">${outputDrums} Drums</h4>
            </div>
            <div style="background-color: rgba(231,111,81,0.1); padding: 15px; border-radius: var(--radius-sm); text-align: center;">
                <p style="font-size: 11px; font-weight: 600; color: var(--danger); text-transform: uppercase;">Total Sisa</p>
                <h4 style="font-size: 20px; font-weight: 700; color: var(--secondary); margin-top: 5px;">${sisaDrums} Drums</h4>
            </div>
            <div style="background-color: #FFF3E0; padding: 15px; border-radius: var(--radius-sm); text-align: center;">
                <p style="font-size: 11px; font-weight: 600; color: #E65100; text-transform: uppercase;">Success Rate</p>
                <h4 style="font-size: 20px; font-weight: 700; color: var(--secondary); margin-top: 5px;">${successRate}%</h4>
            </div>
        </div>
    `;

    const tbody = document.getElementById("monthlyReportsTbody");
    if (monthlyData.length === 0) {
        tbody.innerHTML = `<tr><td colspan="12" style="text-align: center; color: var(--text-muted);">Tidak ada data testing pada bulan ini.</td></tr>`;
    } else {
        tbody.innerHTML = monthlyData.map(r => `
            <tr>
                <td><strong>${formatDateIndo(r.date)}</strong></td>
                <td><span class="badge badge-shift">Shift ${r.shift}</span></td>
                <td><strong>${r.tester}</strong></td>
                <td>${r.assistant}</td>
                <td>${r.inputDrums}</td>
                <td>${r.outputDrums}</td>
                <td>${r.sisaInput}</td>
                <td><code>${r.productionNo}</code></td>
                <td>${r.cableTypeSize}</td>
                <td>${r.length.toLocaleString()} m</td>
                <td><span class="badge ${r.status === 'PASSED' ? 'badge-success' : 'badge-danger'}">${r.status}</span></td>
                <td>
                    <div class="action-icons">
                        <button class="btn-icon-action edit-btn" onclick="openEditReport(${r.id})" title="Edit"><i class="fas fa-edit"></i></button>
                        <button class="btn-icon-action delete-btn" onclick="deleteReport(${r.id})" title="Hapus"><i class="fas fa-trash-alt"></i></button>
                    </div>
                </td>
            </tr>
        `).join("");
    }
}

// Yearly Tab page rendering
function renderYearlyTab(yearlyData) {
    // Summarize outputs by month for this year
    const months = [
        "Januari", "Februari", "Maret", "April", "Mei", "Juni", 
        "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];
    
    const monthlySum = Array(12).fill(0).map(() => ({ input: 0, output: 0, length: 0, passed: 0, totalRecords: 0 }));
    
    yearlyData.forEach(r => {
        const m = new Date(r.date).getMonth();
        monthlySum[m].input += r.inputDrums;
        monthlySum[m].output += r.outputDrums;
        monthlySum[m].length += r.length;
        monthlySum[m].totalRecords++;
        if (r.status === "PASSED") {
            monthlySum[m].passed += r.outputDrums;
        }
    });
    
    // Yearly stats cards
    const yTotalInput = yearlyData.reduce((sum, r) => sum + r.inputDrums, 0);
    const yTotalOutput = yearlyData.reduce((sum, r) => sum + r.outputDrums, 0);
    const yTotalLength = yearlyData.reduce((sum, r) => sum + r.length, 0);
    const yPassed = yearlyData.filter(r => r.status === "PASSED").reduce((sum, r) => sum + r.outputDrums, 0);
    const ySuccessRate = yTotalInput > 0 ? ((yPassed / yTotalInput) * 100).toFixed(1) : "0";

    document.getElementById("yearlyStatsGrid").innerHTML = `
        <div style="background-color: var(--secondary); color: #fff; padding: 20px; border-radius: var(--radius); display: flex; align-items: center; justify-content: space-between;">
            <div>
                <p style="font-size: 11px; font-weight: 600; text-transform: uppercase; color: #8DA9C4;">Total Input Tahunan</p>
                <h3 style="font-size: 24px; font-weight: 700; margin-top: 5px;">${yTotalInput} Drums</h3>
            </div>
            <div style="font-size: 32px; color: var(--primary);"><i class="fas fa-industry"></i></div>
        </div>
        <div style="background-color: var(--primary); color: #fff; padding: 20px; border-radius: var(--radius); display: flex; align-items: center; justify-content: space-between;">
            <div>
                <p style="font-size: 11px; font-weight: 600; text-transform: uppercase; color: var(--primary-light);">Total Output Tahunan</p>
                <h3 style="font-size: 24px; font-weight: 700; margin-top: 5px;">${yTotalOutput} Drums</h3>
            </div>
            <div style="font-size: 32px; color: #fff; opacity: 0.8;"><i class="fas fa-check-circle"></i></div>
        </div>
        <div style="background-color: #fff; border: 1px solid rgba(0,0,0,0.05); padding: 20px; border-radius: var(--radius); display: flex; align-items: center; justify-content: space-between;">
            <div>
                <p style="font-size: 11px; font-weight: 600; text-transform: uppercase; color: var(--text-muted);">Total Panjang Diuji</p>
                <h3 style="font-size: 24px; font-weight: 700; color: var(--secondary); margin-top: 5px;">${yTotalLength.toLocaleString()} m</h3>
            </div>
            <div style="font-size: 32px; color: var(--accent);"><i class="fas fa-ruler-combined"></i></div>
        </div>
        <div style="background-color: #fff; border: 1px solid rgba(0,0,0,0.05); padding: 20px; border-radius: var(--radius); display: flex; align-items: center; justify-content: space-between;">
            <div>
                <p style="font-size: 11px; font-weight: 600; text-transform: uppercase; color: var(--text-muted);">Tingkat Kelulusan (Tahun)</p>
                <h3 style="font-size: 24px; font-weight: 700; color: var(--secondary); margin-top: 5px;">${ySuccessRate}%</h3>
            </div>
            <div style="font-size: 32px; color: var(--success);"><i class="fas fa-chart-line"></i></div>
        </div>
    `;

    // Render monthly summary table
    const tbody = document.getElementById("yearlySummaryTbody");
    tbody.innerHTML = months.map((mName, idx) => {
        const sum = monthlySum[idx];
        const success = sum.input > 0 ? ((sum.passed / sum.input) * 100).toFixed(1) : "0";
        return `
            <tr>
                <td><strong>${mName}</strong></td>
                <td>${sum.totalRecords} Laporan</td>
                <td>${sum.input} Drums</td>
                <td>${sum.output} Drums</td>
                <td>${sum.input - sum.output} Drums</td>
                <td>${sum.length.toLocaleString()} m</td>
                <td><strong style="color: ${parseFloat(success) > 90 ? 'var(--success)' : 'var(--danger)'}">${success}%</strong></td>
            </tr>
        `;
    }).join("");

    // Render Yearly Trend chart
    const ctx = document.getElementById("yearlyTrendChart").getContext("2d");
    
    if (trendChartInstance) {
        trendChartInstance.destroy();
    }
    
    trendChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: months,
            datasets: [
                {
                    label: 'Output Drums',
                    data: monthlySum.map(m => m.output),
                    backgroundColor: '#139A8C',
                    borderRadius: 6
                },
                {
                    label: 'Sisa Input',
                    data: monthlySum.map(m => m.input - m.output),
                    backgroundColor: '#E76F51',
                    borderRadius: 6
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'top', labels: { font: { family: 'Plus Jakarta Sans' } } }
            },
            scales: {
                y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } },
                x: { grid: { display: false } }
            }
        }
    });
}

// Leaderboard Tab (Performance evaluation based on team and individual output)
let leaderboardViewMode = "team"; // 'team' or 'individual'

function setLeaderboardView(mode) {
    leaderboardViewMode = mode;
    
    // Toggle active state in buttons
    document.querySelectorAll(".leaderboard-toggle-btn .toggle-opt").forEach(opt => {
        opt.classList.remove("active");
        if (opt.getAttribute("onclick").includes(mode)) {
            opt.classList.add("active");
        }
    });
    
    calculateMetrics();
}

function renderLeaderboardTab(monthlyData) {
    const title = document.getElementById("leaderboardTitle");
    const th1 = document.getElementById("leaderboardCol1");
    const th2 = document.getElementById("leaderboardCol2");
    const tbody = document.getElementById("leaderboardTbody");
    
    if (leaderboardViewMode === "team") {
        title.textContent = "Papan Peringkat Kinerja Tim (Main Tester & Partner)";
        th1.textContent = "Pasangan Tim";
        th2.textContent = "Peran";
        
        // Group outputs by pairing (Tester + Assistant combination)
        const teamMap = {};
        
        monthlyData.forEach(r => {
            // Sort names to make pairing bidirectional/unordered (e.g. Amar & Willy = Willy & Amar)
            const pairName = [r.tester, r.assistant].sort().join(" & ");
            
            if (!teamMap[pairName]) {
                teamMap[pairName] = {
                    pair: pairName,
                    tester1: r.tester,
                    tester2: r.assistant,
                    input: 0,
                    output: 0,
                    length: 0,
                    recordsCount: 0,
                    passed: 0
                };
            }
            
            teamMap[pairName].input += r.inputDrums;
            teamMap[pairName].output += r.outputDrums;
            teamMap[pairName].length += r.length;
            teamMap[pairName].recordsCount++;
            if (r.status === "PASSED") {
                teamMap[pairName].passed += r.outputDrums;
            }
        });
        
        const sortedTeams = Object.values(teamMap).sort((a, b) => b.output - a.output);
        
        if (sortedTeams.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-muted);">Tidak ada data kinerja tim pada bulan ini.</td></tr>`;
        } else {
            tbody.innerHTML = sortedTeams.map((t, idx) => {
                const rankIcon = idx === 0 ? '👑 金' : (idx === 1 ? '🥈' : (idx === 2 ? '🥉' : idx + 1));
                const success = t.input > 0 ? ((t.passed / t.input) * 100).toFixed(1) : "0";
                
                return `
                    <tr>
                        <td><strong>${rankIcon}</strong></td>
                        <td>
                            <div style="font-weight: 600; color: var(--secondary);">${t.pair}</div>
                        </td>
                        <td><span class="badge badge-outline">2 Orang Kolaborasi</span></td>
                        <td><strong>${t.output} Drums</strong></td>
                        <td>${t.input} Drums</td>
                        <td>${t.length.toLocaleString()} m</td>
                        <td><span class="badge badge-success">${success}% OK</span></td>
                    </tr>
                `;
            }).join("");
        }
        
    } else {
        // Individual contribution view: sum up every drum where this employee participated as either Tester or Assistant
        title.textContent = "Papan Kinerja Individu (Kontribusi Total Tester / Partner)";
        th1.textContent = "Nama Karyawan";
        th2.textContent = "Kontribusi Sebagai";
        
        const empMap = {};
        
        // Initialize map with all 8 users
        USERS.forEach(u => {
            empMap[u.name] = {
                name: u.name,
                asTesterOutput: 0,
                asAssistantOutput: 0,
                totalOutput: 0,
                totalInput: 0,
                totalLength: 0,
                passedOutput: 0,
                totalShifts: 0
            };
        });
        
        monthlyData.forEach(r => {
            // Main Tester contribution
            if (empMap[r.tester]) {
                empMap[r.tester].asTesterOutput += r.outputDrums;
                empMap[r.tester].totalOutput += r.outputDrums;
                empMap[r.tester].totalInput += r.inputDrums;
                empMap[r.tester].totalLength += r.length;
                empMap[r.tester].totalShifts++;
                if (r.status === "PASSED") {
                    empMap[r.tester].passedOutput += r.outputDrums;
                }
            }
            
            // Assistant contribution
            if (empMap[r.assistant]) {
                empMap[r.assistant].asAssistantOutput += r.outputDrums;
                empMap[r.assistant].totalOutput += r.outputDrums;
                empMap[r.assistant].totalInput += r.inputDrums;
                empMap[r.assistant].totalLength += r.length;
                empMap[r.assistant].totalShifts++;
                if (r.status === "PASSED") {
                    empMap[r.assistant].passedOutput += r.outputDrums;
                }
            }
        });
        
        const sortedEmployees = Object.values(empMap).sort((a, b) => b.totalOutput - a.totalOutput);
        
        tbody.innerHTML = sortedEmployees.map((e, idx) => {
            const rankIcon = idx === 0 ? '🏆' : (idx === 1 ? '🥈' : (idx === 2 ? '🥉' : idx + 1));
            const success = e.totalInput > 0 ? ((e.passedOutput / e.totalInput) * 100).toFixed(1) : "0";
            
            return `
                <tr>
                    <td><strong>${rankIcon}</strong></td>
                    <td>
                        <div style="font-weight: 600; color: var(--secondary);">${e.name}</div>
                    </td>
                    <td>
                        <div style="font-size: 11px; color: var(--text-muted);">
                            Tester: <strong>${e.asTesterOutput} Drums</strong> | Asisten: <strong>${e.asAssistantOutput} Drums</strong>
                        </div>
                    </td>
                    <td><strong>${e.totalOutput} Drums</strong></td>
                    <td>${e.totalInput} Drums</td>
                    <td>${e.totalLength.toLocaleString()} m</td>
                    <td><span class="badge badge-success">${success}% OK</span></td>
                </tr>
            `;
        }).join("");
    }
}

// --- Report Form Submission & Modals ---
function openNewReportModal() {
    editingReportId = null;
    document.getElementById("modalTitle").textContent = "Tambah Laporan Testing Baru";
    
    // Set default values in form
    document.getElementById("formDate").value = new Date().toISOString().split('T')[0];
    document.getElementById("formShift").value = "1";
    document.getElementById("formNotes").value = "";
    document.getElementById("formOrdering").value = "DELIVERY";
    document.getElementById("formProdNo").value = "";
    document.getElementById("formCableType").value = "";
    document.getElementById("formCustomer").value = "";
    document.getElementById("formLength").value = "";
    document.getElementById("formLengthUnit").value = "m";
    
    // Dropdown selectors
    document.getElementById("statusElektrik").value = "OK";
    document.getElementById("statusDimensi").value = "OK";
    document.getElementById("statusSqc").value = "OK";
    document.getElementById("statusWater").value = "NOT_TESTED";
    document.getElementById("statusRecordPd").value = "NOT_TESTED";
    
    // Status Passed
    document.getElementById("statusPassed").checked = true;
    
    toggleNotesVisibility();
    
    document.getElementById("reportModal").classList.add("open");
}

function openEditReport(id) {
    editingReportId = id;
    const report = reports.find(r => r.id === id);
    if (!report) return;
    
    document.getElementById("modalTitle").textContent = "Edit Laporan Testing";
    
    document.getElementById("formDate").value = report.date;
    document.getElementById("formShift").value = report.shift.toString();
    document.getElementById("formNotes").value = report.notes;
    document.getElementById("formOrdering").value = report.ordering;
    document.getElementById("formProdNo").value = report.productionNo;
    document.getElementById("formCableType").value = report.cableTypeSize;
    document.getElementById("formCustomer").value = report.customer;
    document.getElementById("formLength").value = report.length;
    document.getElementById("formLengthUnit").value = report.lengthUnit || "m";
    
    // Map tests to OK/FAIL/NOT_TESTED (retro-compatible mapping)
    const mapTestVal = (val) => {
        if (val === true || val === "OK") return "OK";
        if (val === "FAIL") return "FAIL";
        return "NOT_TESTED";
    };
    
    document.getElementById("statusElektrik").value = mapTestVal(report.tests.elektrik !== undefined ? report.tests.elektrik : report.tests.condrRes);
    document.getElementById("statusDimensi").value = mapTestVal(report.tests.dimensi !== undefined ? report.tests.dimensi : report.tests.insulRes);
    document.getElementById("statusSqc").value = mapTestVal(report.tests.sqc !== undefined ? report.tests.sqc : report.tests.sparkTest);
    document.getElementById("statusWater").value = mapTestVal(report.tests.waterTest);
    document.getElementById("statusRecordPd").value = mapTestVal(report.tests.recordPd !== undefined ? report.tests.recordPd : report.tests.highVolt);
    
    // Status
    if (report.status === "PASSED") {
        document.getElementById("statusPassed").checked = true;
    } else {
        document.getElementById("statusReject").checked = true;
    }
    
    toggleNotesVisibility();
    
    document.getElementById("reportModal").classList.add("open");
}

function closeReportModal() {
    document.getElementById("reportModal").classList.remove("open");
    editingReportId = null;
}

function handleSaveReport(e) {
    e.preventDefault();
    
    const date = document.getElementById("formDate").value;
    const shift = parseInt(document.getElementById("formShift").value);
    
    // Automatic drum counts (each record represents 1 drum)
    const outputDrums = 1;
    const inputDrums = 1;
    const sisaInput = 0;
    
    const notes = document.getElementById("formNotes").value.trim();
    const ordering = document.getElementById("formOrdering").value;
    const productionNo = document.getElementById("formProdNo").value.trim();
    const cableTypeSize = document.getElementById("formCableType").value.trim();
    const customer = document.getElementById("formCustomer").value.trim();
    const length = parseInt(document.getElementById("formLength").value) || 0;
    const lengthUnit = document.getElementById("formLengthUnit").value;
    
    const elektrik = document.getElementById("statusElektrik").value;
    const dimensi = document.getElementById("statusDimensi").value;
    const sqc = document.getElementById("statusSqc").value;
    const waterTest = document.getElementById("statusWater").value;
    const recordPd = document.getElementById("statusRecordPd").value;
    
    let status = document.getElementById("statusPassed").checked ? "PASSED" : "REJECT";
    
    // Auto status override if any test failed
    if (elektrik === "FAIL" || dimensi === "FAIL" || sqc === "FAIL" || waterTest === "FAIL" || recordPd === "FAIL") {
        status = "REJECT";
    }
    
    if (!cableTypeSize || !productionNo) {
        alert("Mohon isi tipe kabel dan nomor produksi!");
        return;
    }
    
    const testsObj = { elektrik, dimensi, sqc, waterTest, recordPd };
    
    if (editingReportId !== null) {
        // Edit existing
        const idx = reports.findIndex(r => r.id === editingReportId);
        if (idx !== -1) {
            reports[idx] = {
                ...reports[idx],
                date,
                shift,
                inputDrums,
                outputDrums,
                sisaInput,
                notes: status === "REJECT" ? notes : "",
                ordering,
                productionNo,
                cableTypeSize,
                customer,
                length,
                lengthUnit,
                tests: testsObj,
                status
            };
        }
    } else {
        // Add new
        const newId = reports.length > 0 ? Math.max(...reports.map(r => r.id)) + 1 : 1;
        reports.push({
            id: newId,
            date,
            shift,
            inputDrums,
            outputDrums,
            sisaInput,
            notes: status === "REJECT" ? notes : "",
            tester: currentUser.name,
            assistant: currentAssistant ? currentAssistant.name : "Tanpa Asisten",
            ordering,
            productionNo,
            cableTypeSize,
            customer,
            length,
            lengthUnit,
            tests: testsObj,
            status
        });
    }
    
    saveReports();
    closeReportModal();
    calculateMetrics();
}

function deleteReport(id) {
    if (confirm("Apakah Anda yakin ingin menghapus data testing ini?")) {
        reports = reports.filter(r => r.id !== id);
        saveReports();
        calculateMetrics();
    }
}

// --- Supervisor User CRUD Management ---
function renderUsersTable() {
    const tbody = document.getElementById("usersTableTbody");
    if (!tbody) return;
    
    tbody.innerHTML = USERS.map(u => `
        <tr>
            <td><strong>${u.name}</strong></td>
            <td><code>${u.username}</code></td>
            <td><code>${u.password}</code></td>
            <td><span class="badge ${u.role === 'Supervisor' ? 'badge-shift' : 'badge-outline'}">${u.role}</span></td>
            <td>
                <div class="action-icons">
                    <button class="btn-icon-action edit-btn" onclick="openUserModal(${u.id})" title="Edit"><i class="fas fa-edit"></i></button>
                    <button class="btn-icon-action delete-btn" onclick="deleteUser(${u.id})" title="Hapus"><i class="fas fa-trash-alt"></i></button>
                </div>
            </td>
        </tr>
    `).join("");
}

function openUserModal(userId = null) {
    const form = document.getElementById("userForm");
    if (!form) return;
    form.reset();
    
    if (userId) {
        const u = USERS.find(user => user.id === userId);
        if (!u) return;
        document.getElementById("userModalTitle").textContent = "Edit Akun Karyawan";
        document.getElementById("userFormId").value = u.id;
        document.getElementById("userFormName").value = u.name;
        document.getElementById("userFormUsername").value = u.username;
        document.getElementById("userFormPassword").value = u.password;
        document.getElementById("userFormRole").value = u.role;
    } else {
        document.getElementById("userModalTitle").textContent = "Tambah Akun Karyawan";
        document.getElementById("userFormId").value = "";
    }
    
    document.getElementById("userModal").classList.add("open");
}

function closeUserModal() {
    document.getElementById("userModal").classList.remove("open");
}

function handleSaveUser(e) {
    e.preventDefault();
    const idVal = document.getElementById("userFormId").value;
    const name = document.getElementById("userFormName").value.trim();
    const username = document.getElementById("userFormUsername").value.trim().toLowerCase();
    const password = document.getElementById("userFormPassword").value;
    const role = document.getElementById("userFormRole").value;
    
    // Check duplicates
    const duplicate = USERS.find(u => u.username === username && u.id !== parseInt(idVal));
    if (duplicate) {
        alert("Username sudah terdaftar!");
        return;
    }
    
    if (idVal) {
        // Edit
        const idx = USERS.findIndex(u => u.id === parseInt(idVal));
        if (idx !== -1) {
            USERS[idx] = { ...USERS[idx], name, username, password, role };
        }
    } else {
        // Add
        const newId = USERS.length > 0 ? Math.max(...USERS.map(u => u.id)) + 1 : 1;
        USERS.push({ id: newId, name, username, password, role });
    }
    
    saveUsersDatabase();
    closeUserModal();
    renderUsersTable();
    renderAccountHelpers();
    populateAssistantsDropdown();
}

function deleteUser(userId) {
    if (currentUser && currentUser.id === userId) {
        alert("Anda tidak dapat menghapus akun Anda sendiri!");
        return;
    }
    
    if (confirm("Apakah Anda yakin ingin menghapus akun karyawan ini?")) {
        USERS = USERS.filter(u => u.id !== userId);
        saveUsersDatabase();
        renderUsersTable();
        renderAccountHelpers();
        populateAssistantsDropdown();
    }
}

// --- Helper Utilities ---
function formatDateIndo(dateStr) {
    const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
    const months = [
        "Januari", "Februari", "Maret", "April", "Mei", "Juni", 
        "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];
    
    const d = new Date(dateStr);
    const dayName = days[d.getDay()];
    const dateNum = d.getDate();
    const monthName = months[d.getMonth()];
    const year = d.getFullYear();
    
    return `${dayName}, ${dateNum} ${monthName} ${year}`;
}

function toggleNotesVisibility() {
    const isReject = document.getElementById("statusReject").checked;
    const notesGroup = document.getElementById("notesFormGroup");
    if (notesGroup) {
        notesGroup.style.display = isReject ? "block" : "none";
    }
}

function checkAutoReject() {
    const selectors = ["statusElektrik", "statusDimensi", "statusSqc", "statusWater", "statusRecordPd"];
    const hasFail = selectors.some(id => document.getElementById(id).value === "FAIL");
    if (hasFail) {
        document.getElementById("statusReject").checked = true;
    } else {
        document.getElementById("statusPassed").checked = true;
    }
    toggleNotesVisibility();
}

// Set up filter change listeners
function initEventListeners() {
    document.getElementById("filterYear").addEventListener("change", calculateMetrics);
    document.getElementById("filterMonth").addEventListener("change", calculateMetrics);
    document.getElementById("assistantSelect").addEventListener("change", handleAssistantChange);
    
    // Add Note visibility triggers
    document.getElementById("statusPassed").addEventListener("change", toggleNotesVisibility);
    document.getElementById("statusReject").addEventListener("change", toggleNotesVisibility);
    
    // Auto reject check listeners
    const selectors = ["statusElektrik", "statusDimensi", "statusSqc", "statusWater", "statusRecordPd"];
    selectors.forEach(id => {
        document.getElementById(id).addEventListener("change", checkAutoReject);
    });
    
    // Add Report Modal triggers
    document.getElementById("btnAddNewReport").addEventListener("click", openNewReportModal);
    document.getElementById("reportForm").addEventListener("submit", handleSaveReport);
    
    // User CRUD Form trigger
    document.getElementById("userForm").addEventListener("submit", handleSaveUser);
}

function renderRecentTestsTab(filteredReports) {
    const tbody = document.getElementById("recentTestsTableTbody");
    if (!tbody) return;
    
    // Sort reports by date descending
    const sorted = [...filteredReports].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    if (sorted.length === 0) {
        tbody.innerHTML = `<tr><td colspan="10" style="text-align: center; color: var(--text-muted);">Tidak ada data testing ditemukan. Silakan tambahkan laporan baru.</td></tr>`;
    } else {
        tbody.innerHTML = sorted.map(r => `
            <tr>
                <td><strong>${formatDateIndo(r.date)}</strong></td>
                <td><span class="badge badge-shift">Shift ${r.shift}</span></td>
                <td><strong>${r.tester}</strong></td>
                <td>${r.assistant}</td>
                <td><code>${r.ordering || "-"}</code></td>
                <td><code>${r.productionNo}</code></td>
                <td>${r.cableTypeSize}</td>
                <td>${r.length.toLocaleString()} ${r.lengthUnit || "m"}</td>
                <td><span class="badge ${r.status === 'PASSED' ? 'badge-success' : 'badge-danger'}">${r.status}</span></td>
                <td>
                    <div class="action-icons">
                        <button class="btn-icon-action edit-btn" onclick="openEditReport(${r.id})" title="Edit"><i class="fas fa-edit"></i></button>
                        <button class="btn-icon-action delete-btn" onclick="deleteReport(${r.id})" title="Hapus"><i class="fas fa-trash-alt"></i></button>
                    </div>
                </td>
            </tr>
        `).join("");
    }
}
