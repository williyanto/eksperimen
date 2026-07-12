/* ─────────────────────────────────────────
   Project Data
───────────────────────────────────────── */
const PROJECTS = [
  // ── Original 20 ──
  // Cara isi: ganti url: '' dengan url: 'https://link-proyek-anda.com'
  // Jika url dikosongkan, akan diarahkan ke halaman placeholder project.html
  {
    id: "kalkulator-iece",
    name: "Kalkulator IEC Trial",
    cat: "web",
    url: "https://williyanto-eksperimen.netlify.app/",
  },
  {
    id: "retro-synth-runner",
    name: "Retro Synth Runner",
    cat: "game",
    url: "https://www.instagram.com/williyanto.adi/",
  },
  {
    id: "devmetrics-dashboard",
    name: "DevMetrics Dashboard",
    cat: "web",
    url: "",
  },
  { id: "nova-weather", name: "Nova Weather", cat: "mobile", url: "" },
  { id: "quicksql-sandbox", name: "QuickSQL Sandbox", cat: "tool", url: "" },
  { id: "aura-soundscape", name: "Aura Soundscape", cat: "web", url: "" },
  { id: "byteblog-engine", name: "ByteBlog Engine", cat: "tool", url: "" },
  { id: "taskify-planner", name: "Taskify Planner", cat: "web", url: "" },
  { id: "css-generator-pro", name: "CSS Generator Pro", cat: "tool", url: "" },
  { id: "gitstats-tracker", name: "GitStats Tracker", cat: "tool", url: "" },
  { id: "chatnet-terminal", name: "ChatNet Terminal", cat: "tool", url: "" },
  {
    id: "markdown-live-editor",
    name: "Markdown Live Editor",
    cat: "web",
    url: "",
  },
  { id: "cryptotracker-web", name: "CryptoTracker Web", cat: "web", url: "" },
  { id: "pixl-paint", name: "Pixl Paint", cat: "web", url: "" },
  { id: "docugate-reader", name: "Docugate Reader", cat: "tool", url: "" },
  {
    id: "soundwaves-visualizer",
    name: "SoundWaves Visualizer",
    cat: "web",
    url: "",
  },
  { id: "tinyurl-minifier", name: "TinyURL Minifier", cat: "tool", url: "" },
  { id: "focus-pomodoro", name: "Focus Pomodoro", cat: "web", url: "" },
  { id: "flexbox-playground", name: "Flexbox Playground", cat: "web", url: "" },
  { id: "webinspector-cli", name: "WebInspector CLI", cat: "tool", url: "" },
  // ── 30 Proyek Tambahan ──
  { id: "codesnip-vault", name: "CodeSnip Vault", cat: "tool", url: "" },
  { id: "portfoify", name: "Portfoify", cat: "web", url: "" },
  { id: "snaptype", name: "SnapType", cat: "mobile", url: "" },
  { id: "regexcraft", name: "RegexCraft", cat: "tool", url: "" },
  { id: "daily-kanji", name: "Daily Kanji", cat: "mobile", url: "" },
  { id: "browserdb", name: "BrowserDB", cat: "tool", url: "" },
  { id: "devtimer", name: "DevTimer", cat: "tool", url: "" },
  { id: "palettix", name: "Palettix", cat: "web", url: "" },
  { id: "gridmaster", name: "GridMaster", cat: "web", url: "" },
  { id: "logpilot", name: "LogPilot", cat: "tool", url: "" },
  { id: "hexcolor-picker", name: "HexColor Picker", cat: "web", url: "" },
  { id: "typeracer-clone", name: "TypeRacer Clone", cat: "game", url: "" },
  { id: "morse-decoder", name: "Morse Decoder", cat: "tool", url: "" },
  { id: "ascii-art-gen", name: "ASCII Art Generator", cat: "tool", url: "" },
  { id: "invoice-maker", name: "Invoice Maker", cat: "web", url: "" },
  { id: "budgetly", name: "Budgetly", cat: "mobile", url: "" },
  { id: "rps-arena", name: "RPS Arena", cat: "game", url: "" },
  { id: "fontpreview", name: "FontPreview", cat: "web", url: "" },
  { id: "notionclone-lite", name: "NotionClone Lite", cat: "web", url: "" },
  { id: "qr-studio", name: "QR Studio", cat: "tool", url: "" },
  { id: "habitpulse", name: "HabitPulse", cat: "mobile", url: "" },
  { id: "cssanimator", name: "CSS Animator", cat: "web", url: "" },
  { id: "linktree-clone", name: "Linktree Clone", cat: "web", url: "" },
  { id: "snake-reborn", name: "Snake Reborn", cat: "game", url: "" },
  { id: "chartbuilder", name: "ChartBuilder", cat: "web", url: "" },
  { id: "envault", name: "EnVault", cat: "tool", url: "" },
  { id: "pingmon", name: "PingMon", cat: "tool", url: "" },
  { id: "shadergallery", name: "Shader Gallery", cat: "web", url: "" },
  { id: "minesweeper-pro", name: "Minesweeper Pro", cat: "game", url: "" },
  { id: "devfolio-builder", name: "Devfolio Builder", cat: "web", url: "" },
];

const CAT_LABELS = {
  all: "Semua",
  web: "Web",
  game: "Game",
  mobile: "Mobile",
  tool: "Tools",
};

/* ─────────────────────────────────────────
   State
───────────────────────────────────────── */
let activeFilter = "all";
let searchQuery = "";
let showAll = false;
const INITIAL_VISIBLE = 20;

/* ─────────────────────────────────────────
   Theme Toggle (Dark / Light)
───────────────────────────────────────── */
const THEME_KEY = "mk-theme";

function initTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  if (saved === "light") applyTheme("light");
  else applyTheme("dark");
}

function applyTheme(mode) {
  const btn = document.getElementById("theme-toggle");
  if (mode === "light") {
    document.body.classList.add("light");
    if (btn) btn.textContent = "🌙";
  } else {
    document.body.classList.remove("light");
    if (btn) btn.textContent = "☀";
  }
  localStorage.setItem(THEME_KEY, mode);
}

function toggleTheme() {
  const isLight = document.body.classList.contains("light");
  applyTheme(isLight ? "dark" : "light");
}

/* ─────────────────────────────────────────
   Scroll Progress Bar
───────────────────────────────────────── */
function initScrollProgress() {
  const bar = document.getElementById("scroll-progress");
  if (!bar) return;
  window.addEventListener(
    "scroll",
    () => {
      const scrolled = window.scrollY;
      const total = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.width = total > 0 ? (scrolled / total) * 100 + "%" : "0%";
    },
    { passive: true },
  );
}

/* ─────────────────────────────────────────
   Real-time Clock
───────────────────────────────────────── */
function initClock() {
  const timeEl = document.getElementById("clock-time");
  const dateEl = document.getElementById("clock-date");
  if (!timeEl || !dateEl) return;

  function tick() {
    const now = new Date();
    timeEl.textContent = now.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
    dateEl.textContent = now.toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }
  tick();
  setInterval(tick, 1000);
}

/* ─────────────────────────────────────────
   Render Project List
───────────────────────────────────────── */
function getFiltered() {
  return PROJECTS.filter((p) => {
    const matchCat = activeFilter === "all" || p.cat === activeFilter;
    const matchSearch = p.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });
}

function renderList() {
  const container = document.getElementById("project-list");
  const noResults = document.getElementById("no-results");
  if (!container) return;

  const filtered = getFiltered();
  container.innerHTML = "";

  if (filtered.length === 0) {
    if (noResults) noResults.style.display = "block";
    updateShowMoreBtn(0, 0);
    return;
  }

  if (noResults) noResults.style.display = "none";

  // Determine how many to show
  const visible = showAll ? filtered : filtered.slice(0, INITIAL_VISIBLE);

  visible.forEach((project, idx) => {
    const num = String(idx + 1).padStart(2, "0");
    const url = project.url || `project.html?id=${project.id}`;
    const catLbl = CAT_LABELS[project.cat] || project.cat;

    const row = document.createElement("div");
    row.className = "project-row";
    row.style.animationDelay = idx * 25 + "ms";

    row.innerHTML = `
      <span class="project-num">${num}</span>
      <a href="${url}" class="project-name">${project.name}</a>
      <span class="project-cat">${catLbl}</span>
      <button class="copy-btn" data-id="${project.id}" title="Salin tautan proyek" aria-label="Salin tautan">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
        </svg>
      </button>
    `;
    container.appendChild(row);
  });

  // Copy handlers
  container.querySelectorAll(".copy-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = btn.dataset.id;
      const url =
        window.location.href.replace(/[^/]*$/, "") + `project.html?id=${id}`;
      try {
        await navigator.clipboard.writeText(url);
      } catch {
        const ta = document.createElement("textarea");
        ta.value = url;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        ta.remove();
      }
      btn.classList.add("copied");
      btn.innerHTML = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
      setTimeout(() => {
        btn.classList.remove("copied");
        btn.innerHTML = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>`;
      }, 1800);
    });
  });

  updateShowMoreBtn(filtered.length, visible.length);
}

/* ─────────────────────────────────────────
   Show More / Show Less Button
───────────────────────────────────────── */
function updateShowMoreBtn(total, shown) {
  const btn = document.getElementById("show-more-btn");
  const info = document.getElementById("show-more-info");
  if (!btn) return;

  const hidden = total - shown;

  if (hidden <= 0 && showAll) {
    // All shown — show "Sembunyikan" button
    btn.style.display = "inline-flex";
    btn.textContent = `Sembunyikan (tampilkan ${INITIAL_VISIBLE} saja)`;
    btn.dataset.action = "less";
    if (info) info.textContent = `Menampilkan ${total} proyek`;
  } else if (hidden > 0) {
    // More to show
    btn.style.display = "inline-flex";
    btn.textContent = `Tampilkan ${hidden} proyek lainnya ↓`;
    btn.dataset.action = "more";
    if (info) info.textContent = `Menampilkan ${shown} dari ${total} proyek`;
  } else {
    // Nothing hidden and not expanded (filtered results fit within limit)
    btn.style.display = "none";
    if (info) info.textContent = `Menampilkan ${shown} proyek`;
  }
}

/* ─────────────────────────────────────────
   Filter Tabs
───────────────────────────────────────── */
function initFilters() {
  const tabs = document.querySelectorAll(".filter-btn");
  tabs.forEach((btn) => {
    btn.addEventListener("click", () => {
      tabs.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      activeFilter = btn.dataset.filter;
      showAll = false; // reset on filter change
      renderList();
    });
  });
}

/* ─────────────────────────────────────────
   Search
───────────────────────────────────────── */
function initSearch() {
  const input = document.getElementById("search-input");
  if (!input) return;
  input.addEventListener("input", () => {
    searchQuery = input.value.trim();
    showAll = false; // reset on new search
    renderList();
  });
}

/* ─────────────────────────────────────────
   Init
───────────────────────────────────────── */
document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  initClock();
  initScrollProgress();
  renderList();
  initFilters();
  initSearch();

  const toggleBtn = document.getElementById("theme-toggle");
  if (toggleBtn) toggleBtn.addEventListener("click", toggleTheme);

  // Show More / Show Less
  const showMoreBtn = document.getElementById("show-more-btn");
  if (showMoreBtn) {
    showMoreBtn.addEventListener("click", () => {
      showAll = showMoreBtn.dataset.action !== "less";
      renderList();
      if (!showAll) {
        // Scroll back to top of list smoothly
        document
          .getElementById("projects")
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  }
});
