// Dynamic Users Database
let USERS = [];

function loadUsersDatabase() {
  const storedUsers = localStorage.getItem("prysmian_users");
  if (storedUsers) {
    USERS = JSON.parse(storedUsers);
    // Ensure new roles are added if migrating from old database structure
    if (!USERS.some((u) => u.role === "Super Admin")) {
      USERS.push(
        {
          id: 9,
          name: "Super Admin Global",
          username: "super.admin",
          password: "password123",
          role: "Super Admin",
          group: "Non Grup",
        },
        {
          id: 10,
          name: "Manager Operational",
          username: "manager.ops",
          password: "password123",
          role: "Manager",
          group: "Non Grup",
        },
      );
      saveUsersDatabase();
    }
    // Ensure all users have a group property and map admins/managers to Non Grup
    let updated = false;
    USERS.forEach((u) => {
      if (
        u.role === "Supervisor" ||
        u.role === "Manager" ||
        u.role === "Super Admin"
      ) {
        if (u.group !== "Non Grup") {
          u.group = "Non Grup";
          updated = true;
        }
      } else if (!u.group || u.group === "Non Grup") {
        if (u.id === 3 || u.id === 7) u.group = "Grup 1";
        else if (u.id === 4 || u.id === 8) u.group = "Grup 2";
        else if (u.id === 5) u.group = "Grup 3";
        else u.group = "Grup 4";
        updated = true;
      }
    });
    if (updated) {
      saveUsersDatabase();
    }
  } else {
    USERS = [
      {
        id: 1,
        name: "Amar Saidin",
        username: "amar.saidin",
        password: "password123",
        role: "Supervisor",
        group: "Non Grup",
      },
      {
        id: 2,
        name: "Willyanto Adi S.",
        username: "willyanto.adi",
        password: "password123",
        role: "Supervisor",
        group: "Non Grup",
      },
      {
        id: 3,
        name: "Budi Santoso",
        username: "budi.santoso",
        password: "password123",
        role: "Operator",
        group: "Grup 1",
      },
      {
        id: 4,
        name: "Hendra Wijaya",
        username: "hendra.wijaya",
        password: "password123",
        role: "Operator",
        group: "Grup 2",
      },
      {
        id: 5,
        name: "Dian Pratama",
        username: "dian.pratama",
        password: "password123",
        role: "Operator",
        group: "Grup 3",
      },
      {
        id: 6,
        name: "Eko Prasetyo",
        username: "eko.prasetyo",
        password: "password123",
        role: "Operator",
        group: "Grup 4",
      },
      {
        id: 7,
        name: "Achmad Fauzi",
        username: "achmad.fauzi",
        password: "password123",
        role: "Operator",
        group: "Grup 1",
      },
      {
        id: 8,
        name: "Rizky Hidayat",
        username: "rizky.hidayat",
        password: "password123",
        role: "Operator",
        group: "Grup 2",
      },
      {
        id: 9,
        name: "Super Admin Global",
        username: "super.admin",
        password: "password123",
        role: "Super Admin",
        group: "Non Grup",
      },
      {
        id: 10,
        name: "Manager Operational",
        username: "manager.ops",
        password: "password123",
        role: "Manager",
        group: "Non Grup",
      },
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

  // Poll for new broadcast messages every 3 seconds
  setInterval(checkBroadcastMessage, 3000);
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

  listContainer.innerHTML = USERS.map(
    (u) => `
        <div class="account-item">
            <span><strong>${u.name}</strong> (${u.role} - ${u.group || "Grup 1"})</span>
            <span class="username" onclick="fillLogin('${u.username}')" style="cursor:pointer; text-decoration:underline;">${u.username}</span>
            <span>Password: <code>${u.password}</code></span>
        </div>
    `,
  ).join("");
}

function fillLogin(username) {
  document.getElementById("loginUsername").value = username;
  document.getElementById("loginPassword").value = "password123";
}

function handleLogin(e) {
  e.preventDefault();
  const usernameInput = document
    .getElementById("loginUsername")
    .value.trim()
    .toLowerCase();
  const passwordInput = document.getElementById("loginPassword").value;

  const user = USERS.find(
    (u) => u.username === usernameInput && u.password === passwordInput,
  );

  if (user) {
    currentUser = user;
    localStorage.setItem("prysmian_user", JSON.stringify(user));

    // Auto-assign assistant as the next person in list to ensure default state
    const otherUsers = USERS.filter((u) => u.id !== user.id);
    currentAssistant = otherUsers[0];
    localStorage.setItem(
      "prysmian_assistant",
      JSON.stringify(currentAssistant),
    );

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

  // Close mobile sidebar if open
  const sidebar = document.querySelector("aside");
  const overlay = document.getElementById("sidebarOverlay");
  if (sidebar && overlay) {
    sidebar.classList.remove("open");
    overlay.classList.remove("open");
  }

  showLogin();
}

function toggleMobileSidebar() {
  const sidebar = document.querySelector("aside");
  const overlay = document.getElementById("sidebarOverlay");
  if (sidebar && overlay) {
    sidebar.classList.toggle("open");
    overlay.classList.toggle("open");
  }
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
  document.querySelectorAll(".nav-link").forEach((link) => {
    const tab = link.getAttribute("data-tab");
    if (
      isOperator &&
      (tab === "monthly" ||
        tab === "yearly" ||
        tab === "leaderboard" ||
        tab === "users")
    ) {
      link.style.display = "none";
    } else {
      link.style.display = "flex";
    }
  });

  // Hide see-all button for operator on the dashboard
  const seeAllBtn = document.querySelector(
    "#dashboardTab .card-header-flex button",
  );
  if (seeAllBtn) {
    seeAllBtn.style.display = isOperator ? "none" : "block";
  }

  // Show/hide Super Admin Actions
  const superAdminActions = document.getElementById("superAdminDataActions");
  if (superAdminActions) {
    superAdminActions.style.display =
      currentUser && currentUser.role === "Super Admin" ? "flex" : "none";
  }

  // Show/hide Broadcast Sender Panel
  const broadcastSenderCard = document.getElementById("broadcastSenderCard");
  if (broadcastSenderCard) {
    broadcastSenderCard.style.display =
      currentUser &&
      (currentUser.role === "Supervisor" ||
        currentUser.role === "Manager" ||
        currentUser.role === "Super Admin")
        ? "block"
        : "none";
  }

  // Render users table if admin
  if (!isOperator) {
    renderUsersTable();
  }

  // Initialize active shift select element to "1" or load from sessionStorage
  const activeShiftSelect = document.getElementById("activeShiftSelect");
  if (activeShiftSelect) {
    const storedShift = sessionStorage.getItem("prysmian_active_shift") || "1";
    activeShiftSelect.value = storedShift;
  }

  // Show/hide Shift Handover History (Supervisor/Manager/Super Admin only)
  const handoverHistoryCard = document.getElementById("handoverHistoryCard");
  if (handoverHistoryCard) {
    handoverHistoryCard.style.display =
      currentUser &&
      (currentUser.role === "Supervisor" ||
        currentUser.role === "Manager" ||
        currentUser.role === "Super Admin")
        ? "block"
        : "none";
  }

  // Render broadcast history list (only for non-Operators)
  if (
    currentUser &&
    (currentUser.role === "Supervisor" ||
      currentUser.role === "Manager" ||
      currentUser.role === "Super Admin")
  ) {
    renderBroadcastHistory();
  }

  // Check if there is an unread broadcast message
  checkBroadcastMessage();

  // Default to Dashboard tab
  switchTab("dashboard");

  // Populate dropdown of assistants
  populateAssistantsDropdown();
}

function updateSidebarUser() {
  document.getElementById("loggedInUserName").textContent = currentUser.name;

  const roleEl = document.querySelector(".sidebar-user .user-role");
  if (roleEl) {
    roleEl.textContent = `${currentUser.role} (${currentUser.group || "Grup 1"})`;
  }

  if (currentAssistant) {
    document.getElementById("currentAssistantName").innerHTML =
      `<i class="fas fa-hands-helping"></i> Partner: ${currentAssistant.name}`;
  } else {
    document.getElementById("currentAssistantName").innerHTML =
      `<i class="fas fa-exclamation-triangle"></i> Partner: Pilih Asisten`;
  }
}

function populateAssistantsDropdown() {
  const assistants = USERS.filter((u) => u.id !== currentUser.id);
  const dropdown = document.getElementById("assistantSelect");
  if (!dropdown) return;

  dropdown.innerHTML = assistants
    .map(
      (u) => `
        <option value="${u.id}" ${currentAssistant && currentAssistant.id === u.id ? "selected" : ""}>${u.name}</option>
    `,
    )
    .join("");
}

function handleAssistantChange(e) {
  const assistantId = parseInt(e.target.value);
  const assistant = USERS.find((u) => u.id === assistantId);
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
    {
      type: "3KV NYY 1X70 MM2 RM",
      customer: "PT PERUSAHAAN LISTRIK NEGARA (PERSERO)",
      code: "07008255-2020141",
    },
    {
      type: "1KV NYY 1X70 MM2 RM",
      customer: "PT PERUSAHAAN LISTRIK NEGARA (PERSERO)",
      code: "44106230-2020142",
    },
    {
      type: "0.6/1KV NYY 4X25 MM2 RM",
      customer: "PT KENCANA ELECTRIC",
      code: "12304859-2026043",
    },
    {
      type: "1KV NYFGbY 4X50 MM2 SM",
      customer: "PT SIEMENS INDONESIA",
      code: "77209384-2026011",
    },
    {
      type: "0.6/1KV NYA 1X10 MM2 RE",
      customer: "PT JAYA ABADI STEEL",
      code: "88392019-2026099",
    },
  ];

  let id = 1;
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    // Skip some days randomly (simulating days off or no testing)
    if (Math.random() > 0.85) continue;

    // 1 or 2 shifts per day
    const shifts = Math.random() > 0.5 ? [1, 2] : [2, 3];

    shifts.forEach((shift) => {
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
      const length =
        (Math.floor(Math.random() * 10) + 5) * 100 +
        Math.floor(Math.random() * 90); // 500 - 1500m

      const passed = Math.random() > 0.08; // 92% pass rate

      const reportDate = new Date(d);
      const dateString = reportDate.toISOString().split("T")[0];

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
          recordPd: Math.random() > 0.7,
        },
        status: passed ? "PASSED" : "REJECT",
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
  yearSelect.innerHTML = years
    .map((y) => `<option value="${y}">${y}</option>`)
    .join("");

  // Cleaned form logic
}

function switchTab(tabId) {
  // Restrict Operator from tabs other than dashboard and handover
  if (
    currentUser &&
    currentUser.role === "Operator" &&
    tabId !== "dashboard" &&
    tabId !== "handover"
  ) {
    return;
  }

  // Close mobile sidebar if open
  const sidebar = document.querySelector("aside");
  const overlay = document.getElementById("sidebarOverlay");
  if (sidebar && overlay) {
    sidebar.classList.remove("open");
    overlay.classList.remove("open");
  }

  // Nav links
  document.querySelectorAll(".nav-link").forEach((link) => {
    link.classList.remove("active");
    if (link.getAttribute("data-tab") === tabId) {
      link.classList.add("active");
    }
  });

  // Tab contents
  document.querySelectorAll(".dashboard-tab").forEach((tab) => {
    tab.classList.remove("active-tab");
    if (tab.id === `${tabId}Tab`) {
      tab.classList.add("active-tab");
    }
  });

  // Run recalculation and UI rendering for the tab
  calculateMetrics();

  if (tabId === "handover") {
    renderHandoverBoard();
  }
}

// --- Calculations & Chart Rendering ---
function calculateMetrics() {
  const yearFilter = parseInt(document.getElementById("filterYear").value);
  const monthFilter = parseInt(document.getElementById("filterMonth").value);

  // Filter reports baseline based on role
  let baselineReports = reports;
  if (currentUser && currentUser.role === "Operator") {
    baselineReports = reports.filter((r) => r.tester === currentUser.name);
  }

  // Filtered reports
  const filteredReports = baselineReports.filter((r) => {
    const rDate = new Date(r.date);
    return (
      rDate.getFullYear() === yearFilter && rDate.getMonth() + 1 === monthFilter
    );
  });

  // Yearly reports (for yearly tab and monthly comparison trends)
  const yearlyReports = baselineReports.filter((r) => {
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
  }
}

// Dashboard Page Rendering
function renderDashboardTab(monthlyData, yearlyData) {
  // 1. Calculate KPI Metrics Card
  const totalDrums = monthlyData.reduce((sum, r) => sum + r.inputDrums, 0);
  const outputDrums = monthlyData.reduce((sum, r) => sum + r.outputDrums, 0);
  const passedDrums = monthlyData
    .filter((r) => r.status === "PASSED")
    .reduce((sum, r) => sum + r.outputDrums, 0);
  const rejectDrums = monthlyData.filter((r) => r.status === "REJECT").length; // count of records rejected

  const successRate =
    totalDrums > 0 ? ((passedDrums / totalDrums) * 100).toFixed(1) : "0";

  // Calculate last input date & shift from all reports
  let lastInputStr = "-";
  if (reports.length > 0) {
    const sortedReports = [...reports].sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      if (dateA.getTime() !== dateB.getTime()) {
        return dateB - dateA;
      }
      return parseInt(b.shift) - parseInt(a.shift);
    });
    const latest = sortedReports[0];
    const d = new Date(latest.date);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    lastInputStr = `${day}/${month}/${year} (Shift ${latest.shift})`;
  }

  document.getElementById("metricDrums").textContent = totalDrums;
  const lastInputEl = document.getElementById("metricLastInput");
  if (lastInputEl) {
    lastInputEl.textContent = lastInputStr;
  }
  document.getElementById("metricOutput").textContent = passedDrums;
  document.getElementById("metricSuccess").textContent = successRate + "%";
  document.getElementById("metricReject").textContent = rejectDrums;

  // 2. Render Charts
  renderDailyTrendChart(monthlyData);
  renderStatusBreakdownChart(monthlyData);

  // 3. Render Latest Daily Reports Table (Recent 5)
  const recentReports = [...monthlyData]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);
  const tbody = document.getElementById("recentReportsTbody");

  if (recentReports.length === 0) {
    tbody.innerHTML = `<tr><td colspan="10" style="text-align: center; color: var(--text-muted);">Tidak ada data testing pada bulan ini. Silakan tambahkan laporan baru.</td></tr>`;
  } else {
    tbody.innerHTML = recentReports
      .map(
        (r) => `
            <tr>
                <td><strong>${formatDateIndo(r.date)}</strong></td>
                <td><span class="badge badge-shift">Shift ${r.shift}</span></td>
                <td>${r.tester}</td>
                <td>${r.assistant}</td>
                <td>${r.cableTypeSize}</td>
                <td>${r.length.toLocaleString()} ${r.lengthUnit || "m"}</td>
                <td><span class="badge ${r.status === "PASSED" ? "badge-success" : "badge-danger"}">${r.status}</span></td>
            </tr>
        `,
      )
      .join("");
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
    const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(i).padStart(2, "0")}`;
    dateMap[dateStr] = { input: 0, output: 0 };
  }

  monthlyData.forEach((r) => {
    if (dateMap[r.date]) {
      dateMap[r.date].input += r.inputDrums;
      dateMap[r.date].output += r.outputDrums;
    }
  });

  const labels = Object.keys(dateMap).map((d) => d.split("-")[2]); // Just day number
  const inputs = Object.values(dateMap).map((v) => v.input);
  const outputs = Object.values(dateMap).map((v) => v.output);

  if (dailyChartInstance) {
    dailyChartInstance.destroy();
  }

  dailyChartInstance = new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Input Drums",
          data: inputs,
          borderColor: "#EE9B00",
          backgroundColor: "rgba(238, 155, 0, 0.1)",
          borderWidth: 2,
          tension: 0.3,
          fill: true,
        },
        {
          label: "Output Drums",
          data: outputs,
          borderColor: "#139A8C",
          backgroundColor: "rgba(19, 154, 140, 0.1)",
          borderWidth: 2.5,
          tension: 0.3,
          fill: true,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "top",
          labels: {
            boxWidth: 12,
            font: { family: "Plus Jakarta Sans", size: 11 },
          },
        },
      },
      scales: {
        y: { beginAtZero: true, grid: { color: "rgba(0,0,0,0.05)" } },
        x: { grid: { display: false } },
      },
    },
  });
}

// Chart.js: Status passed/reject doughnut chart
function renderStatusBreakdownChart(monthlyData) {
  const ctx = document.getElementById("statusBreakdownChart").getContext("2d");

  const passed = monthlyData
    .filter((r) => r.status === "PASSED")
    .reduce((sum, r) => sum + r.outputDrums, 0);
  const rejected = monthlyData
    .filter((r) => r.status === "REJECT")
    .reduce((sum, r) => sum + r.outputDrums, 0);

  if (statusChartInstance) {
    statusChartInstance.destroy();
  }

  if (passed === 0 && rejected === 0) {
    // Draw empty state
    statusChartInstance = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: ["No Data"],
        datasets: [{ data: [1], backgroundColor: ["#E9ECEF"] }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
      },
    });
    return;
  }

  statusChartInstance = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["PASSED", "REJECT"],
      datasets: [
        {
          data: [passed, rejected],
          backgroundColor: ["#2A9D8F", "#E76F51"],
          borderWidth: 0,
          hoverOffset: 4,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            boxWidth: 12,
            font: { family: "Plus Jakarta Sans", size: 12, weight: "600" },
          },
        },
      },
      cutout: "70%",
    },
  });
}

// Monthly Tab page rendering
function renderMonthlyTab(monthlyData) {
  const totalDrums = monthlyData.reduce((sum, r) => sum + r.inputDrums, 0);
  const length = monthlyData.reduce((sum, r) => sum + r.length, 0);
  const passed = monthlyData
    .filter((r) => r.status === "PASSED")
    .reduce((sum, r) => sum + r.outputDrums, 0);
  const successRate =
    totalDrums > 0 ? ((passed / totalDrums) * 100).toFixed(1) : "0";

  document.getElementById("monthlySummaryInfo").innerHTML = `
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-bottom: 20px;">
            <div style="background-color: var(--primary-light); padding: 15px; border-radius: var(--radius-sm); text-align: center;">
                <p style="font-size: 11px; font-weight: 600; color: var(--primary-dark); text-transform: uppercase;">Total Panjang Kabel</p>
                <h4 style="font-size: 20px; font-weight: 700; color: var(--secondary); margin-top: 5px;">${length.toLocaleString()} m</h4>
            </div>
            <div style="background-color: #FFF3E0; padding: 15px; border-radius: var(--radius-sm); text-align: center;">
                <p style="font-size: 11px; font-weight: 600; color: #E65100; text-transform: uppercase;">Success Rate</p>
                <h4 style="font-size: 20px; font-weight: 700; color: var(--secondary); margin-top: 5px;">${successRate}%</h4>
            </div>
        </div>
    `;

  const tbody = document.getElementById("monthlyReportsTbody");
  if (monthlyData.length === 0) {
    tbody.innerHTML = `<tr><td colspan="9" style="text-align: center; color: var(--text-muted);">Tidak ada data testing pada bulan ini.</td></tr>`;
  } else {
    tbody.innerHTML = monthlyData
      .map(
        (r) => `
            <tr>
                <td><strong>${formatDateIndo(r.date)}</strong></td>
                <td><span class="badge badge-shift">Shift ${r.shift}</span></td>
                <td><strong>${r.tester}</strong></td>
                <td>${r.assistant}</td>
                <td><code>${r.productionNo}</code></td>
                <td>${r.cableTypeSize}</td>
                <td>${r.length.toLocaleString()} m</td>
                <td><span class="badge ${r.status === "PASSED" ? "badge-success" : "badge-danger"}">${r.status}</span></td>
                <td>
                    <div class="action-icons">
                        <button class="btn-icon-action edit-btn" onclick="openEditReport(${r.id})" title="Edit"><i class="fas fa-edit"></i></button>
                        <button class="btn-icon-action delete-btn" onclick="deleteReport(${r.id})" title="Hapus"><i class="fas fa-trash-alt"></i></button>
                    </div>
                </td>
            </tr>
        `,
      )
      .join("");
  }
}

// Yearly Tab page rendering
function renderYearlyTab(yearlyData) {
  // Summarize outputs by month for this year
  const months = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];

  const monthlySum = Array(12)
    .fill(0)
    .map(() => ({
      input: 0,
      output: 0,
      length: 0,
      passed: 0,
      totalRecords: 0,
    }));

  yearlyData.forEach((r) => {
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
  const yPassed = yearlyData
    .filter((r) => r.status === "PASSED")
    .reduce((sum, r) => sum + r.outputDrums, 0);
  const ySuccessRate =
    yTotalInput > 0 ? ((yPassed / yTotalInput) * 100).toFixed(1) : "0";

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
  tbody.innerHTML = months
    .map((mName, idx) => {
      const sum = monthlySum[idx];
      const success =
        sum.input > 0 ? ((sum.passed / sum.input) * 100).toFixed(1) : "0";
      return `
            <tr>
                <td><strong>${mName}</strong></td>
                <td>${sum.totalRecords} Laporan</td>
                <td>${sum.input} Drums</td>
                <td>${sum.output} Drums</td>
                <td>${sum.input - sum.output} Drums</td>
                <td>${sum.length.toLocaleString()} m</td>
                <td><strong style="color: ${parseFloat(success) > 90 ? "var(--success)" : "var(--danger)"}">${success}%</strong></td>
            </tr>
        `;
    })
    .join("");

  // Render Yearly Trend chart
  const ctx = document.getElementById("yearlyTrendChart").getContext("2d");

  if (trendChartInstance) {
    trendChartInstance.destroy();
  }

  trendChartInstance = new Chart(ctx, {
    type: "bar",
    data: {
      labels: months,
      datasets: [
        {
          label: "Output Drums",
          data: monthlySum.map((m) => m.output),
          backgroundColor: "#139A8C",
          borderRadius: 6,
        },
        {
          label: "Sisa Input",
          data: monthlySum.map((m) => m.input - m.output),
          backgroundColor: "#E76F51",
          borderRadius: 6,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "top",
          labels: { font: { family: "Plus Jakarta Sans" } },
        },
      },
      scales: {
        y: { beginAtZero: true, grid: { color: "rgba(0,0,0,0.05)" } },
        x: { grid: { display: false } },
      },
    },
  });
}

// Leaderboard Tab (Performance evaluation based on team and individual output)
function renderLeaderboardTab(monthlyData) {
  const title = document.getElementById("leaderboardTitle");
  const th1 = document.getElementById("leaderboardCol1");
  const th2 = document.getElementById("leaderboardCol2");
  const tbody = document.getElementById("leaderboardTbody");

  title.textContent = "Papan Peringkat Kinerja Tim (Main Tester & Partner)";
  th1.textContent = "Pasangan Tim";
  th2.textContent = "Peran";

  // Group outputs by pairing (Tester + Assistant combination)
  const teamMap = {};

  monthlyData.forEach((r) => {
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
        passed: 0,
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

  const sortedTeams = Object.values(teamMap).sort(
    (a, b) => b.output - a.output,
  );

  if (sortedTeams.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-muted);">Tidak ada data kinerja tim pada bulan ini.</td></tr>`;
  } else {
    tbody.innerHTML = sortedTeams
      .map((t, idx) => {
        const rankIcon =
          idx === 0 ? "👑 金" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : idx + 1;
        const success =
          t.input > 0 ? ((t.passed / t.input) * 100).toFixed(1) : "0";

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
      })
      .join("");
  }
}

// --- Report Form Submission & Modals ---
function openNewReportModal() {
  editingReportId = null;
  document.getElementById("modalTitle").textContent =
    "Tambah Laporan Testing Baru";

  // Set default values in form
  document.getElementById("formDate").value = new Date()
    .toISOString()
    .split("T")[0];
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
  updateStatusCards();

  document.getElementById("reportModal").classList.add("open");
}

function openEditReport(id) {
  editingReportId = id;
  const report = reports.find((r) => r.id === id);
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

  document.getElementById("statusElektrik").value = mapTestVal(
    report.tests.elektrik !== undefined
      ? report.tests.elektrik
      : report.tests.condrRes,
  );
  document.getElementById("statusDimensi").value = mapTestVal(
    report.tests.dimensi !== undefined
      ? report.tests.dimensi
      : report.tests.insulRes,
  );
  document.getElementById("statusSqc").value = mapTestVal(
    report.tests.sqc !== undefined ? report.tests.sqc : report.tests.sparkTest,
  );
  document.getElementById("statusWater").value = mapTestVal(
    report.tests.waterTest,
  );
  document.getElementById("statusRecordPd").value = mapTestVal(
    report.tests.recordPd !== undefined
      ? report.tests.recordPd
      : report.tests.highVolt,
  );

  // Status
  if (report.status === "PASSED") {
    document.getElementById("statusPassed").checked = true;
  } else {
    document.getElementById("statusReject").checked = true;
  }

  toggleNotesVisibility();
  updateStatusCards();

  document.getElementById("reportModal").classList.add("open");
}

function closeReportModal() {
  document.getElementById("reportModal").classList.remove("open");
  editingReportId = null;
}

// Sync visual card state with radio selection
function updateStatusCards() {
  const isPassed = document.getElementById("statusPassed").checked;
  const cardPass = document.getElementById("cardPassed");
  const cardNca = document.getElementById("cardNca");
  if (cardPass) cardPass.classList.toggle("active", isPassed);
  if (cardNca) cardNca.classList.toggle("active", !isPassed);
  toggleNotesVisibility();
}

// Reset only the per-drum fields (keep date/shift/tester context)
function resetForNextEntry() {
  document.getElementById("formOrdering").value = "";
  document.getElementById("formProdNo").value = "";
  document.getElementById("formCableType").value = "";
  document.getElementById("formCustomer").value = "";
  document.getElementById("formLength").value = "";
  document.getElementById("formNotes").value = "";
  document.getElementById("statusElektrik").value = "OK";
  document.getElementById("statusDimensi").value = "OK";
  document.getElementById("statusSqc").value = "OK";
  document.getElementById("statusWater").value = "NOT_TESTED";
  document.getElementById("statusRecordPd").value = "NOT_TESTED";
  document.getElementById("statusPassed").checked = true;
  updateStatusCards();
  // Focus first meaningful field for speed
  setTimeout(() => document.getElementById("formOrdering").focus(), 80);
}

function showSaveToast() {
  const toast = document.getElementById("saveToast");
  if (!toast) return;
  toast.style.opacity = "1";
  toast.style.transform = "translateX(-50%) translateY(0)";
  clearTimeout(toast._hideTimer);
  toast._hideTimer = setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateX(-50%) translateY(100px)";
  }, 2200);
}

// "Simpan & Lanjut" button handler — saves and keeps modal open for next entry
function handleSaveAndNext() {
  const form = document.getElementById("reportForm");
  // Trigger HTML5 validation
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }
  // Re-use the core save logic via a synthetic submit but skip close
  const e = { preventDefault: () => {} };
  _doSaveReport(e, /* keepOpen= */ true);
}

function handleSaveReport(e) {
  e.preventDefault();
  _doSaveReport(e, /* keepOpen= */ false);
}

// Core save logic — keepOpen=true means Simpan & Lanjut, false means close after
function _doSaveReport(e, keepOpen) {
  const date = document.getElementById("formDate").value;
  const shift = parseInt(document.getElementById("formShift").value);

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

  let status = document.getElementById("statusPassed").checked
    ? "PASSED"
    : "REJECT";
  if (
    elektrik === "FAIL" ||
    dimensi === "FAIL" ||
    sqc === "FAIL" ||
    waterTest === "FAIL" ||
    recordPd === "FAIL"
  ) {
    status = "REJECT";
  }

  if (!cableTypeSize || !productionNo) {
    alert("Mohon isi tipe kabel dan nomor produksi!");
    return;
  }

  const testsObj = { elektrik, dimensi, sqc, waterTest, recordPd };

  if (editingReportId !== null) {
    const idx = reports.findIndex((r) => r.id === editingReportId);
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
        status,
      };
    }
  } else {
    const newId =
      reports.length > 0 ? Math.max(...reports.map((r) => r.id)) + 1 : 1;
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
      status,
    });
  }

  saveReports();
  calculateMetrics();

  if (keepOpen && editingReportId === null) {
    showSaveToast();
    resetForNextEntry();
  } else {
    closeReportModal();
  }
}

function deleteReport(id) {
  if (confirm("Apakah Anda yakin ingin menghapus data testing ini?")) {
    reports = reports.filter((r) => r.id !== id);
    saveReports();
    calculateMetrics();
  }
}

// --- Supervisor User CRUD Management ---
function renderUsersTable() {
  const tbody = document.getElementById("usersTableTbody");
  if (!tbody) return;

  tbody.innerHTML = USERS.map((u, idx) => {
    const grp = u.group || "Grup 1";
    const rowClass =
      grp === "Non Grup"
        ? ""
        : grp === "Grup 2"
          ? "group-row-2"
          : grp === "Grup 3"
            ? "group-row-3"
            : grp === "Grup 4"
              ? "group-row-4"
              : "group-row-1";
    const badgeClass =
      grp === "Non Grup"
        ? "badge-group-none"
        : grp === "Grup 2"
          ? "badge-group-2"
          : grp === "Grup 3"
            ? "badge-group-3"
            : grp === "Grup 4"
              ? "badge-group-4"
              : "badge-group-1";

    return `
            <tr class="${rowClass}" draggable="true" ondragstart="handleDragStart(event)" ondragover="handleDragOver(event)" ondragenter="handleDragEnter(event)" ondragleave="handleDragLeave(event)" ondrop="handleDrop(event)" ondragend="handleDragEnd(event)" data-user-id="${u.id}">
                <td style="text-align: center; vertical-align: middle;"><i class="fas fa-grip-vertical drag-handle" title="Seret untuk mengubah urutan"></i></td>
                <td><strong>${u.name}</strong></td>
                <td><code>${u.username}</code></td>
                <td><code>${u.password}</code></td>
                <td><span class="badge ${u.role === "Super Admin" ? "badge-danger" : u.role === "Manager" ? "badge-success" : u.role === "Supervisor" ? "badge-shift" : "badge-outline"}">${u.role}</span></td>
                <td><span class="badge ${badgeClass}">${grp}</span></td>
                <td>
                    <div class="action-icons">
                        <button class="btn-icon-action move-btn" onclick="moveUser(${u.id}, 'up')" title="Pindah Ke Atas" ${idx === 0 ? 'disabled style="opacity: 0.3; cursor: not-allowed;"' : ""}><i class="fas fa-arrow-up"></i></button>
                        <button class="btn-icon-action move-btn" onclick="moveUser(${u.id}, 'down')" title="Pindah Ke Bawah" ${idx === USERS.length - 1 ? 'disabled style="opacity: 0.3; cursor: not-allowed;"' : ""}><i class="fas fa-arrow-down"></i></button>
                        <button class="btn-icon-action edit-btn" onclick="openUserModal(${u.id})" title="Edit"><i class="fas fa-edit"></i></button>
                        <button class="btn-icon-action delete-btn" onclick="deleteUser(${u.id})" title="Hapus"><i class="fas fa-trash-alt"></i></button>
                    </div>
                </td>
            </tr>
        `;
  }).join("");
}

function openUserModal(userId = null) {
  const form = document.getElementById("userForm");
  if (!form) return;
  form.reset();

  // Check if the current logged-in user is a Super Admin
  const isSuperAdmin = currentUser && currentUser.role === "Super Admin";
  const roleSelect = document.getElementById("userFormRole");
  if (roleSelect) {
    roleSelect.disabled = !isSuperAdmin;
  }

  if (userId) {
    const u = USERS.find((user) => user.id === userId);
    if (!u) return;
    document.getElementById("userModalTitle").textContent =
      "Edit Akun Karyawan";
    document.getElementById("userFormId").value = u.id;
    document.getElementById("userFormName").value = u.name;
    document.getElementById("userFormUsername").value = u.username;
    document.getElementById("userFormPassword").value = u.password;
    document.getElementById("userFormRole").value = u.role;
    document.getElementById("userFormGroup").value = u.group || "Grup 1";
  } else {
    document.getElementById("userModalTitle").textContent =
      "Tambah Akun Karyawan";
    document.getElementById("userFormId").value = "";
    document.getElementById("userFormRole").value = "Operator";
    document.getElementById("userFormGroup").value = "Grup 1";
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
  const username = document
    .getElementById("userFormUsername")
    .value.trim()
    .toLowerCase();
  const password = document.getElementById("userFormPassword").value;
  const role = document.getElementById("userFormRole").value;
  const group = document.getElementById("userFormGroup").value;

  // Check duplicates
  const duplicate = USERS.find(
    (u) => u.username === username && u.id !== parseInt(idVal),
  );
  if (duplicate) {
    alert("Username sudah terdaftar!");
    return;
  }

  if (idVal) {
    // Edit
    const idx = USERS.findIndex((u) => u.id === parseInt(idVal));
    if (idx !== -1) {
      USERS[idx] = { ...USERS[idx], name, username, password, role, group };
    }
  } else {
    // Add
    const newId =
      USERS.length > 0 ? Math.max(...USERS.map((u) => u.id)) + 1 : 1;
    USERS.push({ id: newId, name, username, password, role, group });
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
    USERS = USERS.filter((u) => u.id !== userId);
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
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
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
  const selectors = [
    "statusElektrik",
    "statusDimensi",
    "statusSqc",
    "statusWater",
    "statusRecordPd",
  ];
  const hasFail = selectors.some(
    (id) => document.getElementById(id).value === "FAIL",
  );
  if (hasFail) {
    document.getElementById("statusReject").checked = true;
  } else {
    document.getElementById("statusPassed").checked = true;
  }
  toggleNotesVisibility();
}

// Set up filter change listeners
function initEventListeners() {
  document
    .getElementById("filterYear")
    .addEventListener("change", calculateMetrics);
  document
    .getElementById("filterMonth")
    .addEventListener("change", calculateMetrics);
  document
    .getElementById("assistantSelect")
    .addEventListener("change", handleAssistantChange);

  // Add Note visibility triggers
  document
    .getElementById("statusPassed")
    .addEventListener("change", toggleNotesVisibility);
  document
    .getElementById("statusReject")
    .addEventListener("change", toggleNotesVisibility);

  // Auto reject check listeners
  const selectors = [
    "statusElektrik",
    "statusDimensi",
    "statusSqc",
    "statusWater",
    "statusRecordPd",
  ];
  selectors.forEach((id) => {
    document.getElementById(id).addEventListener("change", checkAutoReject);
  });

  // Add Report Modal triggers
  document
    .getElementById("btnAddNewReport")
    .addEventListener("click", openNewReportModal);
  document
    .getElementById("reportForm")
    .addEventListener("submit", handleSaveReport);

  // User CRUD Form trigger
  document
    .getElementById("userForm")
    .addEventListener("submit", handleSaveUser);
}

// --- Drag and Drop Reordering for Users ---
let dragSrcRow = null;

function handleDragStart(e) {
  dragSrcRow = e.currentTarget;
  e.dataTransfer.effectAllowed = "move";
  e.dataTransfer.setData("text/html", e.currentTarget.innerHTML);
  e.currentTarget.classList.add("dragging");
}

function handleDragOver(e) {
  if (e.preventDefault) {
    e.preventDefault();
  }
  e.dataTransfer.dropEffect = "move";
  return false;
}

function handleDragEnter(e) {
  e.currentTarget.classList.add("drag-over");
}

function handleDragLeave(e) {
  e.currentTarget.classList.remove("drag-over");
}

function handleDragEnd(e) {
  e.currentTarget.classList.remove("dragging");
  document.querySelectorAll("#usersTableTbody tr").forEach((row) => {
    row.classList.remove("drag-over");
  });
}

function handleDrop(e) {
  if (e.stopPropagation) {
    e.stopPropagation();
  }

  e.currentTarget.classList.remove("drag-over");

  if (dragSrcRow && dragSrcRow !== e.currentTarget) {
    const srcId = parseInt(dragSrcRow.getAttribute("data-user-id"));
    const targetId = parseInt(e.currentTarget.getAttribute("data-user-id"));

    const srcIdx = USERS.findIndex((u) => u.id === srcId);
    const targetIdx = USERS.findIndex((u) => u.id === targetId);

    if (srcIdx !== -1 && targetIdx !== -1) {
      const [removed] = USERS.splice(srcIdx, 1);
      USERS.splice(targetIdx, 0, removed);

      saveUsersDatabase();
      renderUsersTable();
      renderAccountHelpers();
      populateAssistantsDropdown();
    }
  }
  return false;
}

// --- Reorder via Arrow Buttons ---
function moveUser(id, direction) {
  const idx = USERS.findIndex((u) => u.id === id);
  if (idx === -1) return;

  if (direction === "up" && idx > 0) {
    const temp = USERS[idx];
    USERS[idx] = USERS[idx - 1];
    USERS[idx - 1] = temp;
  } else if (direction === "down" && idx < USERS.length - 1) {
    const temp = USERS[idx];
    USERS[idx] = USERS[idx + 1];
    USERS[idx + 1] = temp;
  }

  saveUsersDatabase();
  renderUsersTable();
  renderAccountHelpers();
  populateAssistantsDropdown();
}

// --- Super Admin Backup Operations (JSON Export/Import) ---
function exportBackupData() {
  const backupData = {
    users: USERS,
    reports: reports,
  };

  const jsonStr = JSON.stringify(backupData, null, 2);
  const blob = new Blob([jsonStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `backup_prysmian_dashboard_${new Date().toISOString().split("T")[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function triggerImport() {
  document.getElementById("importFile").click();
}

function importBackupData(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (evt) {
    try {
      const imported = JSON.parse(evt.target.result);
      if (
        imported.users &&
        Array.isArray(imported.users) &&
        imported.reports &&
        Array.isArray(imported.reports)
      ) {
        if (
          confirm(
            "Apakah Anda yakin ingin memulihkan database dari file backup ini? Data saat ini akan ditimpa.",
          )
        ) {
          USERS = imported.users;
          reports = imported.reports;
          saveUsersDatabase();
          saveReports();
          calculateMetrics();
          renderUsersTable();
          renderAccountHelpers();
          populateAssistantsDropdown();
          alert("Database berhasil dipulihkan dari file cadangan!");
        }
      } else {
        alert("Format file cadangan tidak valid!");
      }
    } catch (err) {
      alert("Gagal membaca file cadangan!");
    }
  };
  reader.readAsText(file);
  e.target.value = "";
}

// --- Bug Report Feature ---
function openBugModal() {
  const bugModal = document.getElementById("bugModal");
  if (bugModal) {
    document.getElementById("bugTitle").value = "";
    document.getElementById("bugDescription").value = "";
    bugModal.classList.add("open");
  }
}

// Ensure mobile menu closes when opening bug report modal
const originalOpenBugModal = openBugModal;
openBugModal = function () {
  originalOpenBugModal();
  const sidebar = document.querySelector("aside");
  const overlay = document.getElementById("sidebarOverlay");
  if (sidebar && overlay) {
    sidebar.classList.remove("open");
    overlay.classList.remove("open");
  }
};

function closeBugModal() {
  const bugModal = document.getElementById("bugModal");
  if (bugModal) {
    bugModal.classList.remove("open");
  }
}

function sendBugEmail() {
  const title = document.getElementById("bugTitle").value.trim();
  const desc = document.getElementById("bugDescription").value.trim();

  if (!title || !desc) {
    alert("Harap lengkapi subjek dan deskripsi masalah!");
    return;
  }

  const recipient = "williyanto.adi@gmail.com";
  const subject = encodeURIComponent(
    `Laporan Bug - Aplikasi Penilaian Karyawan: ${title}`,
  );

  const userRole = currentUser ? currentUser.role : "Guest";
  const userName = currentUser ? currentUser.name : "Guest";

  const bodyContent = `Halo Admin,\n\nSaya menemukan kendala/bug pada aplikasi.\n\nDetail Masalah:\n-------------------------------\nSubjek: ${title}\nDeskripsi:\n${desc}\n\nInformasi Pelapor:\nNama: ${userName}\nJabatan: ${userRole}\nTanggal: ${new Date().toLocaleString()}\n\n---\nDikirim otomatis dari Laporan Bug Aplikasi.`;
  const body = encodeURIComponent(bodyContent);

  const mailtoUrl = `mailto:${recipient}?subject=${subject}&body=${body}`;

  window.location.href = mailtoUrl;
  closeBugModal();
}

// --- Broadcast Message Feature (Supervisor/Manager/Admin to Operator) ---
function sendBroadcastMessage() {
  const input = document.getElementById("broadcastInput");
  if (!input) return;

  const text = input.value.trim();
  if (!text) {
    alert("Ketik pesan/pengumuman terlebih dahulu!");
    return;
  }

  const senderName = currentUser ? currentUser.name : "System";
  const now = new Date();
  const timeStr = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
  const dateStr = now.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const broadcastObj = {
    id: Date.now(),
    sender: senderName,
    text: text,
    date: dateStr,
    time: timeStr,
    readers: [],
  };

  // Set active broadcast for popup alert triggering
  localStorage.setItem("prysmian_broadcast", JSON.stringify(broadcastObj));

  // Add to history array in localStorage
  const historyData = localStorage.getItem("prysmian_broadcasts_history");
  let history = [];
  if (historyData) {
    try {
      history = JSON.parse(historyData);
    } catch (e) {
      history = [];
    }
  }
  history.unshift(broadcastObj);
  localStorage.setItem("prysmian_broadcasts_history", JSON.stringify(history));

  input.value = "";
  alert("Pesan instruksi cepat berhasil disiarkan!");

  // Refresh history panel
  renderBroadcastHistory();
}

function closeBroadcastModal() {
  const modal = document.getElementById("broadcastModal");
  if (modal) {
    modal.classList.remove("open");
  }

  // Mark as read in history
  if (currentUser) {
    const broadcastData = localStorage.getItem("prysmian_broadcast");
    if (broadcastData) {
      try {
        const broadcast = JSON.parse(broadcastData);
        const historyData = localStorage.getItem("prysmian_broadcasts_history");
        if (historyData) {
          let history = JSON.parse(historyData);
          const item = history.find((b) => b.id === broadcast.id);
          if (item) {
            const exists = item.readers.some(
              (r) => r.userId === currentUser.id,
            );
            if (!exists) {
              const now = new Date();
              const timeStr = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
              item.readers.push({
                userId: currentUser.id,
                name: currentUser.name,
                time: timeStr,
              });
              localStorage.setItem(
                "prysmian_broadcasts_history",
                JSON.stringify(history),
              );
            }
          }
        }
      } catch (err) {
        console.error("Error updating broadcast reader receipt:", err);
      }
    }
  }
}

function checkBroadcastMessage() {
  // If Admin/Spv/Manager, just update the read status list (polling)
  if (
    currentUser &&
    (currentUser.role === "Supervisor" ||
      currentUser.role === "Manager" ||
      currentUser.role === "Super Admin")
  ) {
    renderBroadcastHistory();
  }

  if (!currentUser) return;

  const broadcastData = localStorage.getItem("prysmian_broadcast");
  if (!broadcastData) return;

  try {
    const broadcast = JSON.parse(broadcastData);
    const lastReadId = localStorage.getItem(
      `prysmian_last_read_broadcast_${currentUser.id}`,
    );

    if (broadcast && broadcast.id.toString() !== lastReadId) {
      localStorage.setItem(
        `prysmian_last_read_broadcast_${currentUser.id}`,
        broadcast.id.toString(),
      );

      document.getElementById("broadcastMsgText").textContent = broadcast.text;
      document.getElementById("broadcastMsgSender").textContent =
        broadcast.sender;
      document.getElementById("broadcastMsgTime").textContent =
        `${broadcast.date} ${broadcast.time}`;

      const modal = document.getElementById("broadcastModal");
      if (modal) {
        modal.classList.add("open");
      }
    }
  } catch (err) {
    console.error("Error checking broadcast message:", err);
  }
}

function renderBroadcastHistory() {
  const tbody = document.getElementById("broadcastHistoryList");
  if (!tbody) return;

  const historyData = localStorage.getItem("prysmian_broadcasts_history");
  let history = [];
  if (historyData) {
    try {
      history = JSON.parse(historyData);
    } catch (e) {
      history = [];
    }
  }

  if (history.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: var(--text-muted); padding: 15px;">Belum ada riwayat siaran cepat yang dikirimkan.</td></tr>`;
    return;
  }

  tbody.innerHTML = history
    .map((b) => {
      let readersStr = "";
      if (b.readers && b.readers.length > 0) {
        readersStr = b.readers
          .map(
            (r) =>
              `<span class="badge badge-outline" style="margin-right: 4px; border-color: var(--primary); color: var(--primary); font-size: 10px; padding: 2px 6px;">${r.name} (${r.time})</span>`,
          )
          .join("");
      } else {
        readersStr = `<span style="color: var(--text-muted); font-style: italic; font-size: 11px;">Belum dibaca operator</span>`;
      }

      return `
            <tr>
                <td style="font-weight: 600; color: var(--secondary);">${b.date}<br><small style="color: var(--text-muted);">${b.time}</small></td>
                <td><strong style="color: var(--primary);">${b.sender}</strong></td>
                <td style="word-break: break-word; line-height: 1.4;">${b.text}</td>
                <td>
                    <div style="max-height: 60px; overflow-y: auto; display: flex; flex-wrap: wrap; gap: 4px;">
                        ${readersStr}
                    </div>
                </td>
            </tr>
        `;
    })
    .join("");
}

// --- Shift Handover Board Feature ---

// Called when either From or To shift dropdown changes
function changeHandoverShift() {
  const fromSel = document.getElementById("fromShiftSelect");
  const toSel = document.getElementById("toShiftSelect");
  if (!fromSel || !toSel) return;

  const fromShift = fromSel.value;
  const toShift = toSel.value;

  // Prevent selecting same shift for From and To
  if (fromShift === toShift) {
    // Auto-adjust toShift to next shift
    const nextShift = (parseInt(fromShift) % 3) + 1;
    toSel.value = nextShift.toString();
  }

  // Update hint text and button label
  const hint = document.getElementById("handoverWriteHint");
  const btn = document.getElementById("sendHandoverBtn");
  const toVal = toSel.value;
  if (hint)
    hint.innerHTML = `Tulis instruksi dari <strong>Shift ${fromSel.value}</strong> untuk <strong>Shift ${toVal}</strong>.`;
  if (btn)
    btn.innerHTML = `<i class="fas fa-share-square"></i> Kirim dari Shift ${fromSel.value} ke Shift ${toVal}`;

  // Update inbox title
  const inboxTitle = document.getElementById("handoverInboxTitle");
  if (inboxTitle)
    inboxTitle.innerHTML = `<i class="fas fa-envelope-open-text" style="color: var(--primary);"></i> Kotak Masuk Shift ${toVal}`;

  // Save to session storage
  sessionStorage.setItem("prysmian_from_shift", fromSel.value);
  sessionStorage.setItem("prysmian_to_shift", toVal);

  renderHandoverBoard();
}

// Legacy compatibility (if called from old code)
function changeActiveShift() {
  changeHandoverShift();
}

function sendHandoverNote() {
  const textInput = document.getElementById("handoverText");
  if (!textInput) return;

  const text = textInput.value.trim();
  if (!text) {
    alert("Catatan peralihan shift tidak boleh kosong!");
    return;
  }

  const fromSel = document.getElementById("fromShiftSelect");
  const toSel = document.getElementById("toShiftSelect");
  const senderShift = parseInt(fromSel ? fromSel.value : "1");
  const targetShift = parseInt(toSel ? toSel.value : "2");

  const now = new Date();
  const timeStr = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
  const dateStr = now.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const noteObj = {
    id: Date.now(),
    sender: currentUser.name,
    senderRole: currentUser.role,
    senderShift: senderShift,
    targetShift: targetShift,
    text: text,
    date: dateStr,
    time: timeStr,
  };

  const handoversData = localStorage.getItem("prysmian_handovers");
  let handovers = [];
  if (handoversData) {
    try {
      handovers = JSON.parse(handoversData);
    } catch (e) {
      handovers = [];
    }
  }
  handovers.unshift(noteObj);
  localStorage.setItem("prysmian_handovers", JSON.stringify(handovers));

  textInput.value = "";
  alert(
    `Catatan berhasil dikirim dari Shift ${senderShift} ke Shift ${targetShift}!`,
  );
  renderHandoverBoard();
}

function renderHandoverBoard() {
  if (!currentUser) return;

  // Restore dropdown values from session storage
  const fromSel = document.getElementById("fromShiftSelect");
  const toSel = document.getElementById("toShiftSelect");
  if (fromSel)
    fromSel.value = sessionStorage.getItem("prysmian_from_shift") || "1";
  if (toSel) toSel.value = sessionStorage.getItem("prysmian_to_shift") || "2";

  const toShift = parseInt(toSel ? toSel.value : "2");
  const fromShift = parseInt(fromSel ? fromSel.value : "1");

  // Update hint and button
  const hint = document.getElementById("handoverWriteHint");
  const btn = document.getElementById("sendHandoverBtn");
  if (hint)
    hint.innerHTML = `Tulis instruksi dari <strong>Shift ${fromShift}</strong> untuk <strong>Shift ${toShift}</strong>.`;
  if (btn)
    btn.innerHTML = `<i class="fas fa-share-square"></i> Kirim dari Shift ${fromShift} ke Shift ${toShift}`;

  // Update inbox title
  const inboxTitle = document.getElementById("handoverInboxTitle");
  if (inboxTitle)
    inboxTitle.innerHTML = `<i class="fas fa-envelope-open-text" style="color: var(--primary);"></i> Kotak Masuk Shift ${toShift}`;

  const handoversData = localStorage.getItem("prysmian_handovers");
  let handovers = [];
  if (handoversData) {
    try {
      handovers = JSON.parse(handoversData);
    } catch (e) {
      handovers = [];
    }
  }

  const inboxList = document.getElementById("handoverInboxList");
  if (inboxList) {
    // For Operators: only show messages where targetShift === toShift
    // For Admin/Spv/Manager: show all messages targeting toShift
    const filteredInbox = handovers.filter((h) => h.targetShift === toShift);

    if (filteredInbox.length === 0) {
      inboxList.innerHTML = `
                <div style="text-align: center; padding: 40px 20px; color: var(--text-muted);">
                    <i class="fas fa-inbox" style="font-size: 36px; color: var(--border-color); display: block; margin-bottom: 12px;"></i>
                    <p style="margin: 0; font-size: 13px;">Belum ada instruksi dari Shift ${fromShift} untuk Shift ${toShift}.</p>
                </div>
            `;
    } else {
      inboxList.innerHTML = filteredInbox
        .map(
          (h) => `
                <div style="background-color: var(--bg-main); border: 1px solid var(--border-color); border-left: 4px solid var(--primary); border-radius: var(--radius-sm); padding: 14px 16px; margin-bottom: 12px;">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                        <span style="color: var(--primary); font-weight: 700; font-size: 12px;">
                            <i class="fas fa-user-circle"></i> ${h.sender}
                            <span style="font-weight: 500; color: var(--text-muted);"> · ${h.senderRole}</span>
                        </span>
                        <span style="color: var(--text-muted); font-size: 11px;">${h.date} · ${h.time}</span>
                    </div>
                    <div style="font-size: 13px; color: var(--secondary); line-height: 1.6; white-space: pre-wrap;">${h.text}</div>
                    <div style="margin-top: 8px;">
                        <span class="badge" style="background-color: rgba(19,154,140,0.1); color: var(--primary); font-size: 10px; padding: 3px 8px; border-radius: 20px;">
                            Shift ${h.senderShift} → Shift ${h.targetShift}
                        </span>
                    </div>
                </div>
            `,
        )
        .join("");
    }
  }

  const isPrivileged =
    currentUser.role === "Supervisor" ||
    currentUser.role === "Manager" ||
    currentUser.role === "Super Admin";
  const historyCard = document.getElementById("handoverHistoryCard");
  const historyTbody = document.getElementById("handoverHistoryTbody");

  if (isPrivileged && historyCard && historyTbody) {
    historyCard.style.display = "block";
    if (handovers.length === 0) {
      historyTbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-muted); padding: 15px;">Belum ada catatan peralihan shift yang tercatat.</td></tr>`;
    } else {
      historyTbody.innerHTML = handovers
        .map(
          (h) => `
                <tr>
                    <td style="font-weight: 600; color: var(--secondary);">${h.date}<br><small style="color: var(--text-muted);">${h.time}</small></td>
                    <td><span class="badge badge-shift" style="background-color: var(--primary); color: #fff; padding: 4px 8px;">Shift ${h.senderShift}</span></td>
                    <td><span class="badge badge-shift" style="background-color: var(--secondary); color: #fff; padding: 4px 8px;">Shift ${h.targetShift}</span></td>
                    <td>
                        <strong style="color: var(--secondary);">${h.sender}</strong><br>
                        <small style="color: var(--text-muted); font-size: 10px;">${h.senderRole}</small>
                    </td>
                    <td style="white-space: pre-wrap; word-break: break-word; line-height: 1.4;">${h.text}</td>
                </tr>
            `,
        )
        .join("");
    }
  } else if (historyCard) {
    historyCard.style.display = "none";
  }

  // Initialize WA Report card with today's date
  initWAReportCard();
}

// --- WhatsApp Group Report Generator ---
function initWAReportCard() {
  const dateInput = document.getElementById("waReportDate");
  if (dateInput && !dateInput.value) {
    dateInput.value = new Date().toISOString().split("T")[0];
  }
  // Auto-populate officers from current group if available
  const groupSel = document.getElementById("waReportGroup");
  if (
    groupSel &&
    currentUser &&
    currentUser.group &&
    currentUser.group !== "Non Grup"
  ) {
    groupSel.value = currentUser.group;
  }
  generateWAReport();
}

function generateWAReport() {
  const groupSel = document.getElementById("waReportGroup");
  const shiftSel = document.getElementById("waReportShift");
  const dateInput = document.getElementById("waReportDate");
  const officersInput = document.getElementById("waReportOfficers");
  const notesInput = document.getElementById("waReportNotes");
  const preview = document.getElementById("waReportPreview");
  if (!preview) return;

  const selectedGroup = groupSel ? groupSel.value : "Grup 1";
  const selectedShift = shiftSel ? shiftSel.value : "1";
  const selectedDate = dateInput
    ? dateInput.value
    : new Date().toISOString().split("T")[0];
  const officers = officersInput ? officersInput.value.trim() : "";
  const notes = notesInput ? notesInput.value.trim() : "";

  // Format date to Indonesian locale
  let displayDate = selectedDate;
  if (selectedDate) {
    const d = new Date(selectedDate + "T00:00:00");
    displayDate = d.toLocaleDateString("id-ID", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  }

  // Pull reports from localStorage filtered by group & date
  const storedReports = localStorage.getItem("prysmian_reports");
  let allReports = [];
  if (storedReports) {
    try {
      allReports = JSON.parse(storedReports);
    } catch (e) {
      allReports = [];
    }
  }

  // Also use in-memory reports array
  const reportsArr = reports && reports.length > 0 ? reports : allReports;

  // Filter by selected date and shift
  const dayReports = reportsArr.filter((r) => {
    const rDate = r.date ? r.date.split("T")[0] : r.date;
    const shiftMatch = r.shift ? r.shift.toString() === selectedShift : true;
    return rDate === selectedDate && shiftMatch;
  });

  // Count test types
  const totalDrums = dayReports.length;
  const totalOutput = dayReports.reduce(
    (sum, r) => sum + (r.outputDrums || 0),
    0,
  );
  const passed = dayReports.filter((r) => r.status === "PASSED").length;
  const rejected = dayReports.filter((r) => r.status === "REJECT").length;

  // Count test types
  let elektrik = 0,
    dimensi = 0,
    sqc = 0,
    waterTest = 0,
    recordPd = 0;
  dayReports.forEach((r) => {
    if (r.tests) {
      if (r.tests.elektrik) elektrik++;
      if (r.tests.dimensi) dimensi++;
      if (r.tests.sqc) sqc++;
      if (r.tests.waterTest) waterTest++;
      if (r.tests.recordPd) recordPd++;
    }
  });

  // Build list of cable types tested
  const cableTypes = [
    ...new Set(dayReports.map((r) => r.cableTypeSize).filter(Boolean)),
  ];

  // Build officers line
  const officerLine = officers
    ? officers
    : currentUser
      ? currentUser.name
      : "-";

  // Build testing detail lines
  let testingLines = "";
  if (totalDrums > 0) {
    testingLines = `\n📋 *Detail Pengujian:*`;
    if (elektrik > 0)
      testingLines += `\n   • Uji Elektrik      : ${elektrik} drum`;
    if (dimensi > 0)
      testingLines += `\n   • Uji Dimensi      : ${dimensi} drum`;
    if (sqc > 0) testingLines += `\n   • SQC / Visual     : ${sqc} drum`;
    if (waterTest > 0)
      testingLines += `\n   • Water Test       : ${waterTest} drum`;
    if (recordPd > 0)
      testingLines += `\n   • Record PD        : ${recordPd} drum`;
    if (cableTypes.length > 0)
      testingLines += `\n\n🔌 *Tipe Kabel:*\n   ${cableTypes.join(", ")}`;
  } else {
    testingLines = `\n📋 *Detail Pengujian:*\n   (Tidak ada data testing untuk shift ini)`;
  }

  let notesLine = "";
  if (notes) {
    notesLine = `\n\n📝 *Catatan Tambahan:*\n${notes
      .split("\n")
      .map((l) => `   ${l}`)
      .join("\n")}`;
  }

  const now = new Date();
  const timeNow = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;

  const message = `🏭 *LAPORAN SHIFT ${selectedShift} - ${selectedGroup.toUpperCase()}*
📅 ${displayDate}
⏰ Dibuat pukul: ${timeNow} WIB
━━━━━━━━━━━━━━━━━━━━━━

👷 *Petugas Jaga:*
   ${officerLine}

📊 *Ringkasan Hasil Testing:*
   • Total Drum Diuji  : ${totalDrums} drum
   • Total Output      : ${totalOutput} drum
   • Lulus (PASSED)    : ${passed} drum
   • NCA / REJECT      : ${rejected} drum
${testingLines}${notesLine}

━━━━━━━━━━━━━━━━━━━━━━
✅ Laporan ini dibuat otomatis dari sistem Final Test Dashboard PT. Prysmian Cables Indonesia.
_Dikirim oleh: ${currentUser ? currentUser.name : "System"} (${currentUser ? currentUser.role : ""})_`;

  preview.value = message;
}

function copyWAReport() {
  const preview = document.getElementById("waReportPreview");
  if (!preview || !preview.value) {
    alert(
      "Tidak ada pesan untuk disalin. Harap generate laporan terlebih dahulu.",
    );
    return;
  }
  navigator.clipboard
    .writeText(preview.value)
    .then(() => {
      alert(
        "Teks laporan berhasil disalin ke clipboard! Anda dapat menempelkannya langsung di WhatsApp.",
      );
    })
    .catch(() => {
      preview.select();
      document.execCommand("copy");
      alert("Teks laporan berhasil disalin!");
    });
}

function sendToWhatsApp() {
  const preview = document.getElementById("waReportPreview");
  if (!preview || !preview.value) {
    alert("Harap generate laporan terlebih dahulu.");
    return;
  }
  const encoded = encodeURIComponent(preview.value);
  window.open(`https://wa.me/?text=${encoded}`, "_blank");
}
