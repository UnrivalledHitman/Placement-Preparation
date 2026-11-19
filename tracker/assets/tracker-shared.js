(function () {
  "use strict";

  const THEME_KEY = "placement_roadmap_theme_v1";
  const FONT_SCALE_KEY = "placement_roadmap_font_scale_v1";
  const WD_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const MON_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const VALID_FONT_SCALES = ["sm", "md", "lg"];
  const registry = new Map();

  function registerTracker(config) {
    if (!config || !config.id) {
      throw new Error("Tracker config requires a non-empty id");
    }
    registry.set(config.id, config);
    return config;
  }

  function getTracker(id) {
    return registry.get(id) || null;
  }

  function getAllTrackers() {
    return Array.from(registry.values());
  }

  function escHtml(str) {
    return String(str ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function formatTimeHHMMSS(dateObj) {
    const d = dateObj || new Date();
    const pad = (n) => String(n).padStart(2, "0");
    return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  }

  function getTodayLocalIso(dateObj) {
    const d = dateObj || new Date();
    const y = String(d.getFullYear()).padStart(4, "0");
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }

  function isValidIsoDate(str) {
    if (typeof str !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(str)) return false;
    const [y, m, d] = str.split("-").map(Number);
    const dt = new Date(Date.UTC(y, m - 1, d));
    return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d;
  }

  function addDaysIso(isoStr, offsetDays) {
    const baseIso = isValidIsoDate(isoStr) ? isoStr : getTodayLocalIso();
    const [y, m, d] = baseIso.split("-").map(Number);
    const dt = new Date(Date.UTC(y, m - 1, d + (Number(offsetDays) || 0)));
    const yr = dt.getUTCFullYear();
    const mo = dt.getUTCMonth();
    const dy = dt.getUTCDate();
    const mon = MON_NAMES[mo];
    return {
      iso: `${String(yr).padStart(4, "0")}-${String(mo + 1).padStart(2, "0")}-${String(dy).padStart(2, "0")}`,
      weekday: WD_NAMES[dt.getUTCDay()],
      label: `${dy} ${mon} ${yr}`,
      shortLabel: `${dy} ${mon}`,
    };
  }

  function diffDaysIso(isoA, isoB) {
    if (!isValidIsoDate(isoA) || !isValidIsoDate(isoB)) return 0;
    const [ay, am, ad] = isoA.split("-").map(Number);
    const [by, bm, bd] = isoB.split("-").map(Number);
    return Math.round((Date.UTC(by, bm - 1, bd) - Date.UTC(ay, am - 1, ad)) / 86400000);
  }

  function probeLocalStorage(probeKey) {
    try {
      const k = probeKey || "__tracker_probe__";
      window.localStorage.setItem(k, "1");
      const back = window.localStorage.getItem(k);
      if (typeof window.localStorage.removeItem === "function") {
        window.localStorage.removeItem(k);
      }
      return back === "1";
    } catch {
      return false;
    }
  }

  function applyTheme(theme) {
    const mode = theme === "dark" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", mode);
    const btn = document.getElementById("theme-toggle-btn");
    if (btn) btn.textContent = mode === "dark" ? "Light Theme" : "Dark Theme";
  }

  function toggleTheme() {
    const cur = document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
    const next = cur === "dark" ? "light" : "dark";
    try {
      window.localStorage.setItem(THEME_KEY, next);
    } catch {}
    applyTheme(next);
    return next;
  }

  function applyFontScale(scale) {
    const mode = VALID_FONT_SCALES.includes(scale) ? scale : "md";
    document.documentElement.setAttribute("data-font-scale", mode);
    if (typeof document.querySelectorAll === "function") {
      document.querySelectorAll('[data-action="set-font-scale"]').forEach((btn) => {
        btn.classList.toggle("active", btn.getAttribute("data-scale") === mode);
      });
    }
    return mode;
  }

  function setFontScale(scale) {
    const mode = VALID_FONT_SCALES.includes(scale) ? scale : "md";
    try {
      window.localStorage.setItem(FONT_SCALE_KEY, mode);
    } catch {}
    return applyFontScale(mode);
  }

  function initPreferences(onStorageEvent) {
    let savedTheme = "dark";
    let savedScale = "md";
    try {
      const t = window.localStorage.getItem(THEME_KEY);
      if (t === "dark" || t === "light") savedTheme = t;
    } catch {}
    try {
      const fs = window.localStorage.getItem(FONT_SCALE_KEY);
      if (VALID_FONT_SCALES.includes(fs)) savedScale = fs;
    } catch {}
    applyTheme(savedTheme);
    applyFontScale(savedScale);
    if (typeof window.addEventListener === "function") {
      window.addEventListener("storage", (e) => {
        if (e && e.key === THEME_KEY && (e.newValue === "dark" || e.newValue === "light")) {
          applyTheme(e.newValue);
        } else if (e && e.key === FONT_SCALE_KEY && VALID_FONT_SCALES.includes(e.newValue)) {
          applyFontScale(e.newValue);
        }
        if (typeof onStorageEvent === "function") {
          onStorageEvent(e);
        }
      });
    }
  }

  function initTheme(onStorageEvent) {
    return initPreferences(onStorageEvent);
  }

  function updateStorageBadge(badgeEl, opts) {
    if (!badgeEl) return;
    const { ok, notStarted, savedAt, hasSnapshot, storageKey, readyLabel } = opts || {};
    if (!ok) {
      badgeEl.className = "pill pill-warn";
      badgeEl.textContent = "Storage Blocked — Export JSON";
      badgeEl.title = "browser localStorage threw an error; use Export JSON to save progress";
      return;
    }
    if (notStarted) {
      badgeEl.className = "pill pill-warn";
      badgeEl.textContent = "Not Started — Click Start";
      badgeEl.title = "Select your Start Date and click Start to begin logging progress";
      return;
    }
    if (savedAt || hasSnapshot) {
      badgeEl.className = "pill pill-ok";
      badgeEl.textContent = savedAt ? `Saved locally · ${savedAt}` : "Saved locally";
      badgeEl.title = storageKey
        ? `Persisted in browser localStorage under key ${storageKey}`
        : "Saved in browser localStorage";
    } else {
      badgeEl.className = "pill pill-ok";
      badgeEl.textContent = readyLabel || "LocalStorage Ready";
      badgeEl.title = storageKey
        ? `Ready to persist changes in localStorage under key ${storageKey}`
        : "Ready to persist changes in localStorage";
    }
  }

  function renderProgressBar(pct, color, heightPx) {
    const safePct = Math.max(0, Math.min(100, Number(pct) || 0));
    const trackStyle = heightPx ? ` style="height:${heightPx}px"` : "";
    return `<div class="prog-track"${trackStyle}><div class="prog-fill" style="width:${safePct}%; background:${color || "var(--primary)"}"></div></div>`;
  }

  function renderCheckButton({ action, id, checked, ariaLabel }) {
    const aria = ariaLabel ? ` aria-label="${escHtml(ariaLabel)}"` : "";
    return `<button type="button" class="chk-btn${checked ? " checked" : ""}" data-action="${escHtml(action)}" data-id="${escHtml(id)}"${aria}>${checked ? "&#10003;" : ""}</button>`;
  }

  function computeConfigSummary(config) {
    const weeks = Array.isArray(config.weeks) ? config.weeks : [];
    const totalDays = weeks.reduce((sum, w) => sum + (Array.isArray(w.days) ? w.days.length : 0), 0);
    const totalTasks = weeks.reduce(
      (sum, w) => sum + (Array.isArray(w.days) ? w.days : []).reduce((ds, d) => ds + (Array.isArray(d) ? d.length : 0), 0),
      0
    );
    return {
      totalTasks,
      totalDays,
      totalWeeks: weeks.length,
      totalMonths: Array.isArray(config.months) ? config.months.length : 0,
      totalSkills: Array.isArray(config.skills) ? config.skills.length : 0,
      pdfCount: config.resources ? Object.keys(config.resources).length : 0,
    };
  }

  function readTrackerSnapshot(storageKey, totalTasks) {
    const empty = {
      exists: false,
      done: 0,
      redo: 0,
      weekDone: 0,
      monthDone: 0,
      notes: 0,
      pct: 0,
      lastSavedAt: null,
      activeWeek: 1,
    };
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (!raw) return empty;
      const parsed = JSON.parse(raw);
      const tasks = parsed && typeof parsed.tasks === "object" && parsed.tasks ? parsed.tasks : {};
      let done = 0;
      let redo = 0;
      for (const v of Object.values(tasks)) {
        if (v === 1) done++;
        else if (v === 2) redo++;
      }
      const weekDone = parsed && parsed.weekTargets ? Object.values(parsed.weekTargets).filter(Boolean).length : 0;
      const monthDone = parsed && parsed.monthTargets ? Object.values(parsed.monthTargets).filter(Boolean).length : 0;
      const notes = parsed && parsed.notes
        ? Object.values(parsed.notes).filter((x) => typeof x === "string" && x.trim()).length
        : 0;
      const pct = totalTasks ? Math.round((done / totalTasks) * 100) : 0;
      return {
        exists: true,
        done,
        redo,
        weekDone,
        monthDone,
        notes,
        pct,
        lastSavedAt: typeof parsed.lastSavedAt === "string" ? parsed.lastSavedAt : null,
        activeWeek: Number.isInteger(parsed.activeWeek) ? parsed.activeWeek : 1,
      };
    } catch {
      return empty;
    }
  }

  window.TrackerShared = {
    THEME_KEY,
    FONT_SCALE_KEY,
    WD_NAMES,
    MON_NAMES,
    registerTracker,
    getTracker,
    getAllTrackers,
    escHtml,
    formatTimeHHMMSS,
    getTodayLocalIso,
    isValidIsoDate,
    addDaysIso,
    diffDaysIso,
    probeLocalStorage,
    applyTheme,
    toggleTheme,
    applyFontScale,
    setFontScale,
    initPreferences,
    initTheme,
    updateStorageBadge,
    renderProgressBar,
    renderCheckButton,
    computeConfigSummary,
    readTrackerSnapshot,
  };
})();
