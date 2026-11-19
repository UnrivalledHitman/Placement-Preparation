(function () {
  "use strict";

  const VALID_TABS = ["daily", "weekly", "monthly", "skills", "report", "library"];
  const S = window.TrackerShared;

  function getSkillStage(pct) {
    if (pct === 0) return { label: "Not Started", cls: "pill-muted" };
    if (pct < 35) return { label: "Foundations", cls: "pill-1" };
    if (pct < 70) return { label: "Practising", cls: "pill-warn" };
    if (pct < 95) return { label: "Proficient", cls: "pill-3" };
    return { label: "Acquired", cls: "pill-ok" };
  }

  function renderKpiCard(opts) {
    const attrStr = opts.attrs ? ` ${opts.attrs}` : "";
    const badgeColorStyle = opts.badgeColor ? ` style="color:${opts.badgeColor}"` : "";
    const badgeClass = opts.badgeClass ? ` ${opts.badgeClass}` : "";
    return `
      <div class="subcard kpi-card clickable" data-action="${S.escHtml(opts.action)}"${attrStr}>
        <div class="flex items-center justify-between text-xs text-muted">
          <span class="font-semibold">${opts.title}</span>
          <span class="font-mono font-bold${badgeClass}"${badgeColorStyle}>${opts.badgeText}</span>
        </div>
        <div class="text-base font-bold font-mono">${opts.mainHtml}</div>
        ${S.renderProgressBar(opts.pct, opts.barColor)}
        <div class="text-xs text-muted">${opts.footHtml}</div>
      </div>`;
  }

  function mount(trackerId, rootId) {
    const config = S.getTracker(trackerId);
    if (!config) {
      throw new Error(`Unknown tracker config: ${trackerId}`);
    }
    const rootEl = document.getElementById(rootId || "tracker-root");
    if (!rootEl) {
      throw new Error(`Tracker root element #${rootId || "tracker-root"} not found`);
    }

    const STORAGE_KEY = config.storageKey;
    const RESOURCE_PREFIX = config.resourcePrefix || "../";
    const RESOURCES = config.resources;
    const SKILLS = config.skills;
    const MONTHS = config.months;
    const WEEKS = config.weeks;

    document.title = config.header.pageTitle;
    if (config.ui.weekChipMinWidth && document.documentElement && document.documentElement.style && typeof document.documentElement.style.setProperty === "function") {
      document.documentElement.style.setProperty("--week-chip-min", config.ui.weekChipMinWidth);
    }

    const trackMeta = {};
    for (const tr of config.tracks) {
      trackMeta[tr.key] = {
        ...tr,
        pillClass: `pill-${tr.slot}`,
        colorVar: `var(--chart-${tr.slot})`
      };
    }

    const SKILL_MAP = Object.fromEntries(SKILLS.map((s) => [s.id, s]));
    const MONTH_MAP = Object.fromEntries(MONTHS.map((m) => [m.id, m]));
    const WEEK_MAP = Object.fromEntries(WEEKS.map((w) => [w.id, w]));

    const DAYS = [];
    const ALL_TASKS = [];
    const TASK_MAP = {};

    (function buildSchedule() {
      const phases = config.phases || [];
      let dayNum = 1;
      for (const w of WEEKS) {
        w.dayNums = [];
        const phaseObj = phases.find((p) => w.id >= p.minWeek && w.id <= p.maxWeek);
        const phaseId = phaseObj ? phaseObj.id : 1;
        for (let dIdx = 0; dIdx < w.days.length; dIdx++) {
          const dayTasks = [];
          const tuples = w.days[dIdx] || [];
          tuples.forEach((tup, tIdx) => {
            const [track, skills, title, detail, res, hrs] = tup;
            const id = `${config.taskIdPrefix}w${w.id}d${dIdx + 1}_t${tIdx + 1}`;
            const taskObj = {
              id,
              dayNum,
              dateIso: "",
              dateLabel: "",
              weekday: "",
              week: w.id,
              month: w.month,
              phase: phaseId,
              track,
              skills,
              title,
              detail,
              res,
              hrs: Number(hrs)
            };
            dayTasks.push(taskObj);
            ALL_TASKS.push(taskObj);
            TASK_MAP[id] = taskObj;
          });
          DAYS.push({
            dayNum,
            dayInWeek: dIdx + 1,
            week: w.id,
            month: w.month,
            phase: phaseId,
            dateIso: "",
            dateLabel: "",
            weekday: "",
            ownShift: 0,
            cumShift: 0,
            shiftReason: "",
            tasks: dayTasks
          });
          w.dayNums.push(dayNum);
          dayNum++;
        }
      }
    })();

    const DAY_MAP = Object.fromEntries(DAYS.map((d) => [d.dayNum, d]));

    let storageAvailable = true;
    let hasSavedSnapshot = false;
    let resetArmedUntil = 0;
    const ui = {
      search: "",
      track: "all",
      status: "all",
      skill: "",
      openRescheduleDay: null,
      showWelcomeBanner: false
    };

    function renderShell() {
      const headerPills = config.tracks
        .map((tr) => `<span class="pill pill-${tr.slot}">${S.escHtml(tr.headerBadge)}</span>`)
        .join("");
      const trackFilters = config.tracks
        .map((tr) => `<button type="button" class="filter-pill" data-action="set-track" data-track="${S.escHtml(tr.key)}">${S.escHtml(tr.label)}</button>`)
        .join("");

      rootEl.innerHTML = `
        <header class="card p-4 flex flex-col gap-3">
          <div class="flex flex-wrap items-start justify-between gap-3">
            <div class="flex-1 min-w-[240px]">
              <div class="flex flex-wrap items-center gap-2 mb-1">
                ${headerPills}
                <span id="timeline-badge" class="pill pill-muted font-mono"></span>
                <span id="header-streak-pill" class="pill streak-pill font-mono">&#128293; Streak: 0d &bull; Best: 0d</span>
              </div>
              <h1 class="text-lg font-bold tracking-tight m-0">${S.escHtml(config.header.title)}</h1>
              <p class="text-xs text-muted mt-1 m-0">${S.escHtml(config.header.subtitle)}</p>
            </div>
            <div class="flex flex-wrap items-center gap-2">
              <div class="start-date-box">
                <label for="start-date-input" class="text-xs font-semibold text-muted whitespace-nowrap">Start Date:</label>
                <input id="start-date-input" type="date" class="input-ctrl py-1 text-xs font-mono" aria-label="Plan start date" />
                <button type="button" class="btn" data-action="set-start-today">Today</button>
              </div>
              <div class="font-scale-group" role="group" aria-label="Text size">
                <button type="button" class="scale-btn" data-action="set-font-scale" data-scale="sm" title="Smaller text">A-</button>
                <button type="button" class="scale-btn active" data-action="set-font-scale" data-scale="md" title="Default readable text">A</button>
                <button type="button" class="scale-btn" data-action="set-font-scale" data-scale="lg" title="Large text">A+</button>
              </div>
              <span id="storage-status" class="pill pill-muted">Checking localStorage...</span>
              <button id="theme-toggle-btn" type="button" class="btn" data-action="toggle-theme">Dark Theme</button>
              <button id="btn-export" type="button" class="btn" data-action="export-json">Export JSON</button>
              <button id="btn-import" type="button" class="btn" data-action="import-json">Import JSON</button>
              <button id="btn-reset" type="button" class="btn btn-ghost" data-action="reset-progress">Reset Progress</button>
            </div>
          </div>
          <div id="welcome-banner"></div>
          <div id="kpi-grid" class="kpi-grid"></div>
        </header>

        <section class="card p-3 flex flex-wrap items-center justify-between gap-2">
          <div class="flex flex-wrap items-center gap-2 flex-1 min-w-[240px]">
            <input id="search-input" type="search" class="input-ctrl flex-1 min-w-[180px]" placeholder="${S.escHtml(config.ui.searchPlaceholder)}" />
            <div class="flex flex-wrap items-center gap-1" role="group" aria-label="Track filter">
              <button type="button" class="filter-pill active" data-action="set-track" data-track="all">All</button>
              ${trackFilters}
            </div>
            <select id="status-filter" class="input-ctrl" aria-label="Status filter">
              <option value="all">Status: All</option>
              <option value="pending">Status: Pending</option>
              <option value="done">Status: Done</option>
              <option value="redo">Status: Needs Redo (~)</option>
            </select>
            <span id="active-skill-filter"></span>
          </div>
          <div class="flex flex-wrap items-center gap-2">
            <span id="catchup-slot"></span>
            <button id="btn-next-pending" type="button" class="btn btn-primary" data-action="next-pending-day">Next Pending Day &rarr;</button>
          </div>
        </section>

        <nav class="tabs" role="tablist" aria-label="Tracker views">
          <button type="button" class="tab-btn active" data-action="switch-tab" data-tab="daily">Daily Tasks (${DAYS.length}d)</button>
          <button type="button" class="tab-btn" data-action="switch-tab" data-tab="weekly">Weekly Targets (${WEEKS.length}w)</button>
          <button type="button" class="tab-btn" data-action="switch-tab" data-tab="monthly">${S.escHtml(config.ui.monthlyTabLabel)}</button>
          <button type="button" class="tab-btn" data-action="switch-tab" data-tab="skills">Skill Matrix (${SKILLS.length})</button>
          <button type="button" class="tab-btn" data-action="switch-tab" data-tab="report">Progress Report</button>
          <button type="button" class="tab-btn" data-action="switch-tab" data-tab="library">Redo Queue &amp; Library</button>
        </nav>

        <main id="main-view" class="flex flex-col gap-3"></main>

        <div id="io-modal" class="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="io-modal-title">
          <div class="card p-4 w-full max-w-xl flex flex-col gap-3">
            <div class="flex items-center justify-between gap-2">
              <h2 id="io-modal-title" class="text-sm font-bold m-0">Backup / Restore Progress JSON</h2>
              <button id="io-close" type="button" class="btn btn-ghost" data-action="close-io-modal">Close</button>
            </div>
            <p id="io-desc" class="text-xs text-muted m-0"></p>
            <textarea id="io-textarea" rows="9" class="input-ctrl w-full font-mono text-xs"></textarea>
            <div class="flex flex-wrap items-center justify-between gap-2">
              <div class="flex items-center gap-2">
                <button id="io-copy" type="button" class="btn" data-action="copy-io">Copy JSON</button>
                <button id="io-download" type="button" class="btn" data-action="download-io">Download .json</button>
                <label class="btn cursor-pointer">
                  Load .json File
                  <input id="io-file" type="file" accept=".json,application/json" class="hidden" />
                </label>
              </div>
              <button id="io-apply" type="button" class="btn btn-primary" data-action="apply-io">Apply Imported JSON</button>
            </div>
          </div>
        </div>

        <div id="toast" class="toast"></div>
      `;
    }

    function defaultState(todayIso) {
      const anchor = S.isValidIsoDate(todayIso) ? todayIso : S.getTodayLocalIso();
      return {
        version: 2,
        startDate: anchor,
        firstOpenedOn: anchor,
        dayShifts: {},
        shiftReasons: {},
        taskCompletedOn: {},
        tasks: {},
        weekTargets: {},
        monthTargets: {},
        notes: {},
        activeWeek: 1,
        activeTab: "daily",
        lastSavedAt: null
      };
    }

    function sanitizeState(raw, fallbackStartDate) {
      const base = defaultState(fallbackStartDate || S.getTodayLocalIso());
      if (!raw || typeof raw !== "object") return base;
      if (S.isValidIsoDate(raw.startDate)) base.startDate = raw.startDate;
      base.firstOpenedOn = S.isValidIsoDate(raw.firstOpenedOn) ? raw.firstOpenedOn : base.startDate;

      if (raw.dayShifts && typeof raw.dayShifts === "object") {
        for (const [k, v] of Object.entries(raw.dayShifts)) {
          const dn = Number(k);
          const sv = Number(v);
          if (Number.isInteger(dn) && dn >= 1 && dn <= DAYS.length && Number.isInteger(sv) && sv >= 1 && sv <= 365) {
            base.dayShifts[dn] = sv;
          }
        }
      }
      if (raw.shiftReasons && typeof raw.shiftReasons === "object") {
        for (const [k, v] of Object.entries(raw.shiftReasons)) {
          const dn = Number(k);
          if (Number.isInteger(dn) && dn >= 1 && dn <= DAYS.length && typeof v === "string" && v.trim()) {
            base.shiftReasons[dn] = v.trim();
          }
        }
      }
      if (raw.tasks && typeof raw.tasks === "object") {
        for (const [k, v] of Object.entries(raw.tasks)) {
          if ((v === 1 || v === 2) && TASK_MAP[k]) base.tasks[k] = v;
        }
      }
      if (raw.taskCompletedOn && typeof raw.taskCompletedOn === "object") {
        for (const [k, v] of Object.entries(raw.taskCompletedOn)) {
          if (TASK_MAP[k] && S.isValidIsoDate(v)) base.taskCompletedOn[k] = v;
        }
      }
      if (raw.weekTargets && typeof raw.weekTargets === "object") {
        for (const [k, v] of Object.entries(raw.weekTargets)) {
          if (v === true) base.weekTargets[k] = true;
        }
      }
      if (raw.monthTargets && typeof raw.monthTargets === "object") {
        for (const [k, v] of Object.entries(raw.monthTargets)) {
          if (v === true) base.monthTargets[k] = true;
        }
      }
      if (raw.notes && typeof raw.notes === "object") {
        for (const [k, v] of Object.entries(raw.notes)) {
          if (typeof v === "string" && v.trim()) base.notes[k] = v;
        }
      }
      const wk = Number(raw.activeWeek);
      if (Number.isInteger(wk) && wk >= 1 && wk <= WEEKS.length) base.activeWeek = wk;
      if (VALID_TABS.includes(raw.activeTab)) base.activeTab = raw.activeTab;
      if (typeof raw.lastSavedAt === "string" && raw.lastSavedAt.trim()) base.lastSavedAt = raw.lastSavedAt;
      return base;
    }

    function refreshStorageBadge(savedAt, snapshotExists) {
      S.updateStorageBadge(document.getElementById("storage-status"), {
        ok: storageAvailable,
        savedAt,
        hasSnapshot: snapshotExists,
        storageKey: STORAGE_KEY
      });
    }

    let state = null;

    function recomputeScheduleDates() {
      const anchorIso = (state && S.isValidIsoDate(state.startDate)) ? state.startDate : S.getTodayLocalIso();
      let cumShift = 0;
      for (const d of DAYS) {
        const ownShift = (state && state.dayShifts && state.dayShifts[d.dayNum]) || 0;
        cumShift += ownShift;
        const info = S.addDaysIso(anchorIso, (d.dayNum - 1) + cumShift);
        d.dateIso = info.iso;
        d.dateLabel = info.label;
        d.weekday = info.weekday;
        d.ownShift = ownShift;
        d.cumShift = cumShift;
        d.shiftReason = (state && state.shiftReasons && state.shiftReasons[d.dayNum]) || "";
        for (const t of d.tasks) {
          t.dateIso = info.iso;
          t.dateLabel = info.label;
          t.weekday = info.weekday;
        }
      }
    }

    function getTotalShiftDays() {
      return Object.values(state.dayShifts || {}).reduce((acc, n) => acc + (Number(n) || 0), 0);
    }

    function saveState() {
      const stamp = S.formatTimeHHMMSS(new Date());
      state.lastSavedAt = stamp;
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        storageAvailable = true;
        hasSavedSnapshot = true;
        refreshStorageBadge(stamp, true);
      } catch {
        storageAvailable = false;
        hasSavedSnapshot = false;
        refreshStorageBadge(null, false);
      }
    }

    function loadState() {
      const todayIso = S.getTodayLocalIso();
      storageAvailable = S.probeLocalStorage(`__${config.id}_probe__`);
      try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (!raw) {
          const fresh = defaultState(todayIso);
          ui.showWelcomeBanner = true;
          if (storageAvailable) {
            fresh.lastSavedAt = S.formatTimeHHMMSS(new Date());
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
            hasSavedSnapshot = true;
            refreshStorageBadge(fresh.lastSavedAt, true);
          } else {
            hasSavedSnapshot = false;
            refreshStorageBadge(null, false);
          }
          return fresh;
        }
        hasSavedSnapshot = true;
        const loaded = sanitizeState(JSON.parse(raw), todayIso);
        refreshStorageBadge(loaded.lastSavedAt, true);
        return loaded;
      } catch {
        storageAvailable = false;
        hasSavedSnapshot = false;
        refreshStorageBadge(null, false);
        return defaultState(todayIso);
      }
    }

    function showToast(msg) {
      const el = document.getElementById("toast");
      if (!el) return;
      el.textContent = msg;
      el.classList.add("show");
      clearTimeout(showToast._timer);
      showToast._timer = setTimeout(() => el.classList.remove("show"), 2600);
    }

    function getTaskStatus(taskId) {
      return state.tasks[taskId] || 0;
    }

    function renderResRef(resKey) {
      const r = RESOURCES[resKey];
      if (!r) return "";
      return `<a class="res-link" href="${S.escHtml(RESOURCE_PREFIX + r.path)}" target="_blank" rel="noopener">${S.escHtml(r.title)} &nearr;</a>`;
    }

    function computeSkillStats(skillId) {
      const linked = ALL_TASKS.filter((t) => t.skills.includes(skillId));
      let done = 0;
      let redo = 0;
      let hrsTotal = 0;
      let hrsDone = 0;
      for (const t of linked) {
        hrsTotal += t.hrs;
        const st = getTaskStatus(t.id);
        if (st === 1) {
          done++;
          hrsDone += t.hrs;
        } else if (st === 2) {
          redo++;
        }
      }
      const total = linked.length;
      const pct = total ? Math.round((done / total) * 100) : 0;
      return { total, done, redo, pct, hrsTotal, hrsDone, stage: getSkillStage(pct) };
    }

    function computeMetrics(todayIso) {
      const byTrack = { all: { total: 0, done: 0, redo: 0, hrsTotal: 0, hrsDone: 0 } };
      for (const tr of config.tracks) {
        byTrack[tr.key] = { total: 0, done: 0, redo: 0, hrsTotal: 0, hrsDone: 0 };
      }
      for (const t of ALL_TASKS) {
        const st = getTaskStatus(t.id);
        for (const key of ["all", t.track]) {
          const bucket = byTrack[key];
          if (!bucket) continue;
          bucket.total++;
          bucket.hrsTotal += t.hrs;
          if (st === 1) {
            bucket.done++;
            bucket.hrsDone += t.hrs;
          } else if (st === 2) {
            bucket.redo++;
          }
        }
      }
      const pctOf = (b) => (b && b.total ? Math.round((b.done / b.total) * 100) : 0);
      const trackPct = {};
      for (const tr of config.tracks) {
        trackPct[tr.key] = pctOf(byTrack[tr.key]);
      }

      let skillsAcquired = 0;
      let skillsProficientPlus = 0;
      const skillStats = {};
      for (const sk of SKILLS) {
        const ss = computeSkillStats(sk.id);
        skillStats[sk.id] = ss;
        if (ss.pct >= 95) skillsAcquired++;
        if (ss.pct >= 70) skillsProficientPlus++;
      }

      let completedDays = 0;
      let currentStreak = 0;
      let bestStreak = 0;
      let run = 0;
      const dayStreakMap = {};
      let lastStartedIdx = -1;
      let scheduledTodayIdx = -1;

      DAYS.forEach((d, idx) => {
        const full = d.tasks.length > 0 && d.tasks.every((t) => getTaskStatus(t.id) === 1);
        const anyDone = d.tasks.some((t) => getTaskStatus(t.id) === 1);
        if (anyDone) lastStartedIdx = idx;
        if (todayIso && d.dateIso <= todayIso) scheduledTodayIdx = idx;
        if (full) {
          completedDays++;
          run++;
          dayStreakMap[d.dayNum] = run;
          if (run > bestStreak) bestStreak = run;
        } else {
          run = 0;
          dayStreakMap[d.dayNum] = 0;
        }
      });

      for (let i = DAYS.length - 1; i >= 0; i--) {
        if (DAYS[i].tasks.some((t) => getTaskStatus(t.id) === 1)) {
          let k = i;
          while (k >= 0 && DAYS[k].tasks.every((t) => getTaskStatus(t.id) === 1)) {
            currentStreak++;
            k--;
          }
          break;
        }
      }

      const trailEnd = Math.max(6, Math.min(DAYS.length - 1, Math.max(lastStartedIdx, scheduledTodayIdx)));
      const trailStart = Math.max(0, trailEnd - 6);
      const recentTrail = [];
      for (let i = trailStart; i <= trailEnd && i < DAYS.length; i++) {
        const d = DAYS[i];
        const doneCount = d.tasks.filter((t) => getTaskStatus(t.id) === 1).length;
        const stLabel = d.tasks.length > 0 && doneCount === d.tasks.length
          ? "full"
          : doneCount > 0
            ? "partial"
            : "empty";
        recentTrail.push({ dayNum: d.dayNum, dateLabel: d.dateLabel, state: stLabel });
      }

      return {
        byTrack,
        trackPct,
        overallPct: pctOf(byTrack.all),
        skillsAcquired,
        skillsProficientPlus,
        skillStats,
        completedDays,
        currentStreak,
        bestStreak,
        dayStreakMap,
        recentTrail
      };
    }

    function getWeekStats(weekId) {
      const w = WEEK_MAP[weekId];
      const tasks = [];
      for (const dn of w.dayNums) tasks.push(...DAY_MAP[dn].tasks);
      const done = tasks.filter((t) => getTaskStatus(t.id) === 1).length;
      const targetsDone = w.targets.filter((tg) => state.weekTargets[tg.id]).length;
      return {
        total: tasks.length,
        done,
        pct: tasks.length ? Math.round((done / tasks.length) * 100) : 0,
        targetsDone,
        targetsTotal: w.targets.length
      };
    }

    function getMonthStats(monthId) {
      const m = MONTH_MAP[monthId];
      const tasks = ALL_TASKS.filter((t) => t.month === monthId);
      const done = tasks.filter((t) => getTaskStatus(t.id) === 1).length;
      const trackPct = {};
      for (const tr of config.tracks) {
        const sub = tasks.filter((t) => t.track === tr.key);
        const subDone = sub.filter((t) => getTaskStatus(t.id) === 1).length;
        trackPct[tr.key] = {
          total: sub.length,
          done: subDone,
          pct: sub.length ? Math.round((subDone / sub.length) * 100) : 0
        };
      }
      return {
        total: tasks.length,
        done,
        pct: tasks.length ? Math.round((done / tasks.length) * 100) : 0,
        trackPct,
        targetsDone: m.targets.filter((tg) => state.monthTargets[tg.id]).length,
        targetsTotal: m.targets.length
      };
    }

    function matchesFilters(task) {
      if (ui.track !== "all" && task.track !== ui.track) return false;
      if (ui.skill && !task.skills.includes(ui.skill)) return false;
      const st = getTaskStatus(task.id);
      if (ui.status === "pending" && st !== 0) return false;
      if (ui.status === "done" && st !== 1) return false;
      if (ui.status === "redo" && st !== 2) return false;
      if (ui.search.trim()) {
        const q = ui.search.trim().toLowerCase();
        const resTitle = (RESOURCES[task.res] && RESOURCES[task.res].title) || "";
        const skillNames = task.skills.map((sid) => SKILL_MAP[sid]?.name || "").join(" ");
        const hay = `${task.title} ${task.detail} ${task.dateLabel} ${task.dateIso} d${task.dayNum} day ${task.dayNum} w${task.week} week ${task.week} ${resTitle} ${skillNames}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    }

    function toggleTaskStatus(id, flagValue) {
      const todayIso = S.getTodayLocalIso();
      if (state.tasks[id] === flagValue) {
        delete state.tasks[id];
        delete state.taskCompletedOn[id];
      } else {
        state.tasks[id] = flagValue;
        if (flagValue === 1) state.taskCompletedOn[id] = todayIso;
        else delete state.taskCompletedOn[id];
      }
      saveState();
      renderAll();
    }

    function toggleTaskDone(id) { toggleTaskStatus(id, 1); }
    function toggleTaskRedo(id) { toggleTaskStatus(id, 2); }

    function toggleDayDone(dayNum) {
      const day = DAY_MAP[dayNum];
      if (!day) return;
      const todayIso = S.getTodayLocalIso();
      const visible = day.tasks.filter(matchesFilters);
      const targets = visible.length ? visible : day.tasks;
      const allDone = targets.every((t) => state.tasks[t.id] === 1);
      for (const t of targets) {
        if (allDone) {
          delete state.tasks[t.id];
          delete state.taskCompletedOn[t.id];
        } else {
          state.tasks[t.id] = 1;
          state.taskCompletedOn[t.id] = todayIso;
        }
      }
      saveState();
      renderAll();
    }

    function toggleFlagMap(mapObj, id) {
      if (mapObj[id]) delete mapObj[id];
      else mapObj[id] = true;
      saveState();
      renderAll();
    }

    function toggleWeekTarget(id) { toggleFlagMap(state.weekTargets, id); }
    function toggleMonthTarget(id) { toggleFlagMap(state.monthTargets, id); }

    function saveDayNote(dayNum, value) {
      const k = `d${dayNum}`;
      if (value && value.trim()) state.notes[k] = value;
      else delete state.notes[k];
      saveState();
    }

    function setStartDate(isoStr) {
      if (!S.isValidIsoDate(isoStr)) {
        showToast("Please select a valid Start Date.");
        renderAll();
        return false;
      }
      state.startDate = isoStr;
      ui.showWelcomeBanner = false;
      recomputeScheduleDates();
      saveState();
      renderAll();
      showToast(`Timeline adjusted to start on ${DAY_MAP[1].dateLabel}.`);
      return true;
    }

    function shiftDay(dayNum, delta) {
      if (!DAY_MAP[dayNum]) return false;
      const cur = state.dayShifts[dayNum] || 0;
      const next = Math.max(0, Math.min(365, cur + Number(delta || 0)));
      if (next === 0) {
        delete state.dayShifts[dayNum];
        delete state.shiftReasons[dayNum];
      } else {
        state.dayShifts[dayNum] = next;
      }
      recomputeScheduleDates();
      saveState();
      renderAll();
      showToast(
        next > 0
          ? `Day ${dayNum} shifted to ${DAY_MAP[dayNum].weekday}, ${DAY_MAP[dayNum].dateLabel} (+${next}d).`
          : `Cleared shift for Day ${dayNum} (${DAY_MAP[dayNum].dateLabel}).`
      );
      return true;
    }

    function moveDayToDate(dayNum, targetIso) {
      if (!DAY_MAP[dayNum] || !S.isValidIsoDate(targetIso)) {
        renderAll();
        return false;
      }
      if (dayNum === 1) {
        delete state.dayShifts[1];
        delete state.shiftReasons[1];
        return setStartDate(targetIso);
      }
      const prevDay = DAY_MAP[dayNum - 1];
      const naturalIso = S.addDaysIso(prevDay.dateIso, 1).iso;
      const neededShift = S.diffDaysIso(naturalIso, targetIso);
      if (neededShift < 0) {
        showToast(`Cannot move Day ${dayNum} on or before Day ${dayNum - 1} (${prevDay.dateLabel}).`);
        renderAll();
        return false;
      }
      if (neededShift === 0) {
        delete state.dayShifts[dayNum];
        delete state.shiftReasons[dayNum];
      } else {
        state.dayShifts[dayNum] = Math.min(365, neededShift);
      }
      recomputeScheduleDates();
      saveState();
      renderAll();
      showToast(`Moved Day ${dayNum} to ${DAY_MAP[dayNum].weekday}, ${DAY_MAP[dayNum].dateLabel}.`);
      return true;
    }

    function clearDayShift(dayNum) {
      if (!DAY_MAP[dayNum]) return;
      delete state.dayShifts[dayNum];
      delete state.shiftReasons[dayNum];
      recomputeScheduleDates();
      saveState();
      renderAll();
      showToast(`Cleared reschedule shift on Day ${dayNum}.`);
    }

    function saveShiftReason(dayNum, text) {
      if (!DAY_MAP[dayNum]) return;
      const trimmed = typeof text === "string" ? text.trim() : "";
      if (trimmed) state.shiftReasons[dayNum] = trimmed;
      else delete state.shiftReasons[dayNum];
      DAY_MAP[dayNum].shiftReason = trimmed;
      saveState();
    }

    function catchUpToToday() {
      const todayIso = S.getTodayLocalIso();
      const firstPending = DAYS.find((d) => d.tasks.some((t) => getTaskStatus(t.id) !== 1));
      if (!firstPending || firstPending.dateIso >= todayIso) {
        showToast("You are already caught up to today!");
        return false;
      }
      const delta = S.diffDaysIso(firstPending.dateIso, todayIso);
      state.dayShifts[firstPending.dayNum] = Math.min(365, (state.dayShifts[firstPending.dayNum] || 0) + delta);
      if (!state.shiftReasons[firstPending.dayNum]) {
        state.shiftReasons[firstPending.dayNum] = "Caught up to today";
      }
      state.activeWeek = firstPending.week;
      state.activeTab = "daily";
      recomputeScheduleDates();
      saveState();
      renderAll();
      showToast(`Shifted Day ${firstPending.dayNum} (+${delta}d) to Today (${DAY_MAP[firstPending.dayNum].dateLabel}).`);
      return true;
    }

    function setTrackFilter(track) {
      ui.track = ui.track === track && track !== "all" ? "all" : track;
      renderAll();
    }

    function filterBySkill(skillId) {
      ui.skill = skillId;
      ui.track = "all";
      state.activeTab = "daily";
      saveState();
      renderAll();
    }

    function openWeek(weekId) {
      state.activeWeek = weekId;
      state.activeTab = "daily";
      ui.skill = "";
      saveState();
      renderAll();
    }

    function switchTab(tab) {
      state.activeTab = tab;
      saveState();
      renderAll();
    }

    function findNextPendingDay() {
      const day = DAYS.find((d) => d.tasks.some((t) => getTaskStatus(t.id) !== 1));
      if (!day) {
        showToast(`All ${DAYS.length} days complete!`);
        return;
      }
      ui.search = "";
      ui.status = "all";
      ui.skill = "";
      state.activeWeek = day.week;
      state.activeTab = "daily";
      const sInp = document.getElementById("search-input");
      const sSel = document.getElementById("status-filter");
      if (sInp) sInp.value = "";
      if (sSel) sSel.value = "all";
      saveState();
      renderAll();
      const card = document.getElementById(`day-${day.dayNum}`);
      if (card && typeof card.scrollIntoView === "function") {
        card.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      showToast(`Jumped to Day ${day.dayNum} (Week ${day.week} • ${day.dateLabel})`);
    }

    function renderHeaderMeta(m, todayIso) {
      const totalShifts = getTotalShiftDays();
      const tlEl = document.getElementById("timeline-badge");
      if (tlEl && DAYS.length) {
        const shiftText = totalShifts > 0 ? ` • +${totalShifts}d shifted` : "";
        tlEl.textContent = `${DAYS[0].dateLabel} – ${DAYS[DAYS.length - 1].dateLabel} (${WEEKS.length}w / ${DAYS.length}d${shiftText})`;
      }
      const streakEl = document.getElementById("header-streak-pill");
      if (streakEl) {
        streakEl.innerHTML = `&#128293; Streak: ${m.currentStreak}d &bull; Best: ${m.bestStreak}d`;
      }
      const sdInp = document.getElementById("start-date-input");
      if (sdInp) sdInp.value = state.startDate;

      const welcomeEl = document.getElementById("welcome-banner");
      if (welcomeEl) {
        if (ui.showWelcomeBanner) {
          welcomeEl.innerHTML = `
            <div class="welcome-banner">
              <div class="text-xs leading-relaxed">
                <strong>Personalized Timeline Ready:</strong> Your start date was automatically set to <strong>${S.escHtml(DAY_MAP[1].dateLabel)}</strong> (first visit on this device). Adjust <strong>Start Date</strong> above anytime, or click <strong>Reschedule / +1d</strong> on any Day card if an event comes up.
              </div>
              <button type="button" class="btn" data-action="dismiss-welcome">Got it</button>
            </div>`;
        } else {
          welcomeEl.innerHTML = "";
        }
      }

      const catchSlot = document.getElementById("catchup-slot");
      if (catchSlot) {
        const firstPending = DAYS.find((d) => d.tasks.some((t) => getTaskStatus(t.id) !== 1));
        if (firstPending && firstPending.dateIso < todayIso) {
          const behindDays = S.diffDaysIso(firstPending.dateIso, todayIso);
          catchSlot.innerHTML = `<button type="button" class="btn" data-action="catch-up-today" title="Shift Day ${firstPending.dayNum} and remaining days forward to today">Catch Up (+${behindDays}d to Today)</button>`;
        } else {
          catchSlot.innerHTML = "";
        }
      }
    }

    function renderKpis(m) {
      const kpiEl = document.getElementById("kpi-grid");
      if (!kpiEl) return;
      const all = m.byTrack.all;
      const overallCard = renderKpiCard({
        action: "toggle-track-kpi",
        attrs: 'data-track="all"',
        title: "Overall Progress",
        badgeText: `${m.overallPct}%`,
        badgeColor: "var(--foreground)",
        mainHtml: `${all.done} / ${all.total} <span class="text-xs font-normal text-muted">tasks</span>`,
        pct: m.overallPct,
        barColor: "var(--primary)",
        footHtml: `${all.hrsDone.toFixed(1)}h / ${all.hrsTotal.toFixed(0)}h logged`
      });

      const trackCards = config.tracks.map((tr) => {
        const meta = trackMeta[tr.key];
        const bucket = m.byTrack[tr.key];
        const pct = m.trackPct[tr.key];
        return renderKpiCard({
          action: "toggle-track-kpi",
          attrs: `data-track="${S.escHtml(tr.key)}"`,
          title: S.escHtml(tr.kpiTitle),
          badgeText: `${pct}%`,
          badgeColor: meta.colorVar,
          mainHtml: `${bucket.done} / ${bucket.total}`,
          pct,
          barColor: meta.colorVar,
          footHtml: S.escHtml(tr.kpiSub)
        });
      }).join("");

      const skillsCard = renderKpiCard({
        action: "switch-tab",
        attrs: 'data-tab="skills"',
        title: "Skills Acquired",
        badgeText: `${m.skillsAcquired} / ${SKILLS.length}`,
        badgeClass: "text-success",
        mainHtml: `${m.skillsProficientPlus} <span class="text-xs font-normal text-muted">Proficient (70%+)</span>`,
        pct: Math.round((m.skillsAcquired / SKILLS.length) * 100),
        barColor: "var(--success)",
        footHtml: S.escHtml(config.ui.skillsKpiSub)
      });

      const trailHtml = m.recentTrail.map((pt) => {
        const cls = pt.state === "full" ? "streak-dot--full" : pt.state === "partial" ? "streak-dot--partial" : "streak-dot--empty";
        return `<span class="streak-dot ${cls}" title="Day ${pt.dayNum} (${S.escHtml(pt.dateLabel)}): ${pt.state}"></span>`;
      }).join("");

      const streakCard = renderKpiCard({
        action: "switch-tab",
        attrs: 'data-tab="report"',
        title: "Daily Streak",
        badgeText: `Best ${m.bestStreak}d`,
        badgeColor: "var(--warning)",
        mainHtml: `&#128293; ${m.currentStreak} <span class="text-xs font-normal text-muted">days &bull; ${m.completedDays}/${DAYS.length} full</span>`,
        pct: Math.round((m.completedDays / DAYS.length) * 100),
        barColor: "var(--warning)",
        footHtml: `<span class="flex items-center justify-between gap-2"><span class="streak-dots">${trailHtml}</span><span>${all.redo} redo</span></span>`
      });

      kpiEl.innerHTML = overallCard + trackCards + skillsCard + streakCard;
    }

    function renderToolbarControls() {
      document.querySelectorAll('[data-action="set-track"]').forEach((btn) => {
        btn.classList.toggle("active", btn.getAttribute("data-track") === ui.track);
      });
      document.querySelectorAll(".tab-btn").forEach((btn) => {
        btn.classList.toggle("active", btn.getAttribute("data-tab") === state.activeTab);
      });
      const skFilterEl = document.getElementById("active-skill-filter");
      if (skFilterEl) {
        if (ui.skill && SKILL_MAP[ui.skill]) {
          const sk = SKILL_MAP[ui.skill];
          const meta = trackMeta[sk.track] || { pillClass: "pill-muted" };
          skFilterEl.innerHTML = `
            <span class="pill ${meta.pillClass}">
              Skill: ${S.escHtml(sk.short)}
              <button type="button" data-action="clear-skill" class="pill-close-btn" aria-label="Clear skill filter">&times;</button>
            </span>`;
        } else {
          skFilterEl.innerHTML = "";
        }
      }
    }

    function renderTargetItem(opts) {
      const { action, tg, checked, pillText, tag, labelSuffix } = opts;
      const meta = trackMeta[tg.track] || { pillClass: "pill-muted" };
      const tagBadge = tag ? `<span class="pill pill-muted font-mono">${S.escHtml(tag)}</span>` : "";
      return `
        <div class="subcard p-2.5 flex items-start gap-2">
          ${S.renderCheckButton({ action, id: tg.id, checked })}
          <div class="flex-1 text-xs">
            <div class="flex flex-wrap items-center gap-1.5 mb-0.5">
              <span class="pill ${meta.pillClass}">${S.escHtml(pillText)}${labelSuffix || ""}</span>
              ${tagBadge}
            </div>
            <div class="leading-snug${checked ? " line-through text-muted" : ""}">${S.escHtml(tg.text)}</div>
          </div>
        </div>`;
    }

    function renderTaskRow(t) {
      const st = getTaskStatus(t.id);
      const isDone = st === 1;
      const isRedo = st === 2;
      const meta = trackMeta[t.track] || { pillClass: "pill-muted", label: t.track };
      const skillPills = t.skills.map((sid) => {
        const sk = SKILL_MAP[sid];
        return sk
          ? `<button type="button" data-action="filter-skill" data-skill="${S.escHtml(sid)}" class="pill pill-muted cursor-pointer hover:border-primary">${S.escHtml(sk.short)}</button>`
          : "";
      }).join("");

      return `
        <div class="task-row ${isDone ? "is-done" : ""} ${isRedo ? "is-redo" : ""}">
          ${S.renderCheckButton({ action: "toggle-task-done", id: t.id, checked: isDone, ariaLabel: "Mark task done" })}
          <div class="flex-1 min-w-0 flex flex-col gap-1">
            <div class="flex flex-wrap items-center justify-between gap-2">
              <div class="flex flex-wrap items-center gap-1.5">
                <span class="pill ${meta.pillClass}">${S.escHtml(meta.label)}</span>
                <span class="font-semibold text-sm">${S.escHtml(t.title)}</span>
              </div>
              <div class="flex items-center gap-1.5">
                <span class="pill pill-muted font-mono">${t.hrs.toFixed(1)}h</span>
                <button type="button" class="redo-btn ${isRedo ? "active" : ""}" data-action="toggle-task-redo" data-id="${S.escHtml(t.id)}">${isRedo ? "~ Needs Redo" : "~ Redo"}</button>
              </div>
            </div>
            <p class="text-xs text-muted m-0 leading-relaxed">${S.escHtml(t.detail)}</p>
            <div class="flex flex-wrap items-center justify-between gap-2 pt-0.5">
              <div class="flex flex-wrap items-center gap-1">${skillPills}</div>
              <div>${renderResRef(t.res)}</div>
            </div>
          </div>
        </div>`;
    }

    function renderDayCard(day, filteredTasks, dayStreak, todayIso) {
      const allDone = day.tasks.every((t) => getTaskStatus(t.id) === 1);
      const doneCount = day.tasks.filter((t) => getTaskStatus(t.id) === 1).length;
      const totalHrs = day.tasks.reduce((acc, t) => acc + t.hrs, 0);
      const noteVal = state.notes[`d${day.dayNum}`] || "";
      const dayBadgeCfg = config.ui.dayBadge;
      const showDayBadge = dayBadgeCfg && day.week <= dayBadgeCfg.maxWeek && day.dayInWeek === dayBadgeCfg.dayInWeek;
      const notePlaceholder = config.ui.notePlaceholder.replace("{dayNum}", String(day.dayNum));
      const isToday = day.dateIso === todayIso;
      const isOverdue = day.dateIso < todayIso && !allDone;
      const isPanelOpen = ui.openRescheduleDay === day.dayNum;
      const minTargetIso = day.dayNum > 1 ? S.addDaysIso(DAY_MAP[day.dayNum - 1].dateIso, 1).iso : "";

      const shiftBanner = day.ownShift > 0
        ? `<div class="shift-banner">
            <div>
              <strong>+${day.ownShift}d Event / Off-Day Shift</strong> inserted before Day ${day.dayNum}${day.shiftReason ? ` &bull; ${S.escHtml(day.shiftReason)}` : ""}
            </div>
            <div class="flex items-center gap-1.5">
              <button type="button" class="btn" data-action="shift-day" data-day="${day.dayNum}" data-delta="-1">Undo -1d</button>
              <button type="button" class="btn btn-ghost" data-action="clear-day-shift" data-day="${day.dayNum}">Clear Shift</button>
            </div>
          </div>`
        : "";

      const reschedulePanel = isPanelOpen
        ? `<div class="reschedule-panel">
            <div class="flex flex-wrap items-center gap-2">
              <span class="text-xs font-semibold text-muted">Shift Day ${day.dayNum} &amp; later days:</span>
              <button type="button" class="btn" data-action="shift-day" data-day="${day.dayNum}" data-delta="1">+1 Day (Event / Missed)</button>
              <button type="button" class="btn" ${day.ownShift <= 0 ? "disabled" : ""} data-action="shift-day" data-day="${day.dayNum}" data-delta="-1">-1 Day</button>
              <button type="button" class="btn btn-ghost" ${day.ownShift <= 0 ? "disabled" : ""} data-action="clear-day-shift" data-day="${day.dayNum}">Clear Shift</button>
            </div>
            <div class="flex flex-wrap items-center gap-2">
              <label class="text-xs text-muted">Move to Date:</label>
              <input type="date" class="input-ctrl py-1 text-xs font-mono" data-action="move-day-date" data-day="${day.dayNum}" value="${S.escHtml(day.dateIso)}" ${minTargetIso ? `min="${S.escHtml(minTargetIso)}"` : ""} aria-label="Move Day ${day.dayNum} to date" />
              <input type="text" class="input-ctrl py-1 text-xs" data-action="shift-reason" data-day="${day.dayNum}" value="${S.escHtml(day.shiftReason)}" placeholder="Reason (e.g. College Fest, Travel, Sick)..." />
            </div>
          </div>`
        : "";

      return `
        <article id="day-${day.dayNum}" class="card day-card${isToday ? " is-today" : ""}">
          <div class="day-head">
            <div class="flex flex-wrap items-center gap-2">
              <span class="pill pill-muted font-mono">Day ${day.dayNum}/${DAYS.length}</span>
              <span class="font-bold text-sm">${S.escHtml(day.weekday)}, ${S.escHtml(day.dateLabel)}</span>
              ${isToday ? `<span class="pill pill-1 font-mono">TODAY</span>` : ""}
              ${isOverdue ? `<span class="pill pill-warn font-mono">Overdue</span>` : ""}
              <span class="text-xs text-muted">Week ${day.week} &bull; Month ${day.month}</span>
              ${allDone && dayStreak > 0 ? `<span class="pill streak-pill font-mono">&#128293; Streak #${dayStreak}d</span>` : ""}
              ${showDayBadge ? `<span class="pill ${S.escHtml(dayBadgeCfg.pillClass)}">${S.escHtml(dayBadgeCfg.label)}</span>` : ""}
            </div>
            <div class="flex flex-wrap items-center gap-2">
              <span class="text-xs font-mono text-muted">${doneCount}/${day.tasks.length} tasks &bull; ${totalHrs.toFixed(1)}h</span>
              ${!allDone ? `<button type="button" class="btn" data-action="shift-day" data-day="${day.dayNum}" data-delta="1" title="Missed or busy? Push this day +1 day">+1d &curvearrowright;</button>` : ""}
              <button type="button" class="btn" data-action="toggle-reschedule" data-day="${day.dayNum}">${isPanelOpen ? "Hide Shift" : "Reschedule"}</button>
              <button type="button" class="btn ${allDone ? "btn-primary" : ""}" data-action="toggle-day-done" data-day="${day.dayNum}">${allDone ? "&#10003; Day Completed" : "Mark Day Done"}</button>
            </div>
          </div>
          ${shiftBanner}
          ${reschedulePanel}
          <div>${filteredTasks.map(renderTaskRow).join("")}</div>
          <div class="px-3.5 py-2 bg-content border-t flex items-center gap-2">
            <span class="text-xs font-semibold text-muted whitespace-nowrap">${S.escHtml(config.ui.noteLabel)}</span>
            <input type="text" class="input-ctrl flex-1 py-1 text-xs" data-action="save-day-note" data-day="${day.dayNum}" value="${S.escHtml(noteVal)}" placeholder="${S.escHtml(notePlaceholder)}" />
          </div>
        </article>`;
    }

    function renderDailyView(m, todayIso) {
      const globalFilter = Boolean(ui.skill || ui.search.trim() || ui.status === "redo");
      if (globalFilter) {
        const cards = [];
        let count = 0;
        for (const day of DAYS) {
          const sub = day.tasks.filter(matchesFilters);
          if (sub.length) {
            count += sub.length;
            cards.push(renderDayCard(day, sub, m.dayStreakMap[day.dayNum] || 0, todayIso));
          }
        }
        return `
          <div class="card p-3 flex flex-wrap items-center justify-between gap-2">
            <div class="text-xs"><strong>${count} matching tasks</strong> across <strong>${cards.length} days</strong>${ui.skill && SKILL_MAP[ui.skill] ? ` &bull; Skill: <strong>${S.escHtml(SKILL_MAP[ui.skill].name)}</strong>` : ""}</div>
            <button type="button" class="btn" data-action="clear-all-filters">Clear Filter &rarr; Back to Week ${state.activeWeek}</button>
          </div>
          ${cards.length ? cards.join("") : `<div class="card p-6 text-center text-sm text-muted">No tasks match the active filter combination.</div>`}`;
      }

      const activeW = WEEK_MAP[state.activeWeek] || WEEKS[0];
      const wStats = getWeekStats(activeW.id);
      const phases = config.phases || [];
      const activePhase = phases.find((p) => activeW.id >= p.minWeek && activeW.id <= p.maxWeek) || phases[0];

      const mBtns = MONTHS.map((mo) => `<button type="button" class="filter-pill ${mo.weeks.includes(activeW.id) ? "active" : ""}" data-action="open-week" data-week="${mo.weeks[0]}">M${mo.id}: W${mo.weeks[0]}–W${mo.weeks[mo.weeks.length - 1]}</button>`).join("");
      const weekChips = WEEKS.map((w) => {
        const st = getWeekStats(w.id);
        const wPhase = phases.find((p) => w.id >= p.minWeek && w.id <= p.maxWeek);
        const chipColor = (wPhase && wPhase.chipColor) || "var(--primary)";
        return `
          <button type="button" class="week-chip ${w.id === activeW.id ? "active" : ""}" data-action="open-week" data-week="${w.id}">
            <div class="flex items-center justify-between w-full">
              <span class="font-bold">W${w.id}</span>
              <span class="font-mono text-xs ${st.pct === 100 ? "text-success" : "text-muted"}">${st.pct}%</span>
            </div>
            ${S.renderProgressBar(st.pct, chipColor, 4)}
          </button>`;
      }).join("");

      const dayCards = activeW.dayNums.map((dn) => {
        const day = DAY_MAP[dn];
        const sub = day.tasks.filter(matchesFilters);
        return sub.length ? renderDayCard(day, sub, m.dayStreakMap[day.dayNum] || 0, todayIso) : "";
      }).filter(Boolean).join("");

      return `
        <section class="card p-3 flex flex-col gap-3">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <div class="flex flex-wrap items-center gap-1.5">${mBtns}</div>
            <div class="text-xs text-muted">${activePhase ? S.escHtml(activePhase.dailyLabel) : ""}</div>
          </div>
          <div class="week-strip">${weekChips}</div>
        </section>
        <section class="card p-4 flex flex-col gap-2">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <div>
              <span class="pill pill-muted font-mono mb-1">Week ${activeW.id} / ${WEEKS.length} &bull; Month ${activeW.month}</span>
              <h2 class="text-base font-bold m-0">${S.escHtml(activeW.title)}</h2>
              <p class="text-xs text-muted mt-0.5 m-0">${S.escHtml(activeW.practiceTag)}</p>
            </div>
            <div class="flex items-center gap-3">
              <div class="text-right">
                <div class="text-sm font-bold font-mono">${wStats.done}/${wStats.total} (${wStats.pct}%)</div>
                <div class="text-xs text-muted">${wStats.targetsDone}/${wStats.targetsTotal} weekly targets</div>
              </div>
              <div class="flex gap-1">
                <button type="button" class="btn" ${activeW.id <= 1 ? "disabled" : ""} data-action="open-week" data-week="${Math.max(1, activeW.id - 1)}">&larr; Prev</button>
                <button type="button" class="btn" ${activeW.id >= WEEKS.length ? "disabled" : ""} data-action="open-week" data-week="${Math.min(WEEKS.length, activeW.id + 1)}">Next &rarr;</button>
              </div>
            </div>
          </div>
          <div class="grid-3 pt-1">
            ${activeW.targets.map((tg) => {
              const meta = trackMeta[tg.track] || { label: tg.track };
              return renderTargetItem({
                action: "toggle-week-target",
                tg,
                checked: Boolean(state.weekTargets[tg.id]),
                pillText: meta.label,
                labelSuffix: " Weekly Target"
              });
            }).join("")}
          </div>
        </section>
        ${dayCards || `<div class="card p-6 text-center text-sm text-muted">No tasks in Week ${activeW.id} match the current filter.</div>`}`;
    }

    function renderWeekCardsGrid(list) {
      return `
        <div class="grid-2">
          ${list.map((w) => {
            const st = getWeekStats(w.id);
            const firstDay = DAY_MAP[w.dayNums[0]];
            const lastDay = DAY_MAP[w.dayNums[w.dayNums.length - 1]];
            const focusPills = (w.focus || []).map((fText, idx) => `<span class="pill pill-${idx + 1}">${S.escHtml(fText)}</span>`).join("");
            return `
              <article class="card p-3.5 flex flex-col gap-2.5">
                <div class="flex items-start justify-between gap-2">
                  <div>
                    <div class="flex items-center gap-1.5 mb-0.5">
                      <span class="pill pill-muted font-mono">Week ${w.id}</span>
                      <span class="text-xs text-muted">${S.escHtml(firstDay.dateLabel)} – ${S.escHtml(lastDay.dateLabel)}</span>
                    </div>
                    <h3 class="text-sm font-bold m-0">${S.escHtml(w.title)}</h3>
                  </div>
                  <button type="button" class="btn btn-primary" data-action="open-week" data-week="${w.id}">Open Days &rarr;</button>
                </div>
                <div class="flex flex-wrap gap-1.5 text-xs">${focusPills}</div>
                <div class="flex items-center gap-2 text-xs">
                  <div class="flex-1">${S.renderProgressBar(st.pct, st.pct === 100 ? "var(--success)" : "var(--primary)")}</div>
                  <span class="font-mono font-semibold">${st.done}/${st.total} (${st.pct}%)</span>
                </div>
                <div class="flex flex-col gap-1.5 pt-1 border-t">
                  ${w.targets.map((tg) => {
                    const chk = Boolean(state.weekTargets[tg.id]);
                    const meta = trackMeta[tg.track] || { colorVar: "var(--foreground)", label: tg.track };
                    return `
                      <label class="flex items-start gap-2 text-xs cursor-pointer">
                        ${S.renderCheckButton({ action: "toggle-week-target", id: tg.id, checked: chk })}
                        <span class="${chk ? "line-through text-muted" : ""}"><strong style="color:${meta.colorVar}">${S.escHtml(meta.label)}:</strong> ${S.escHtml(tg.text)}</span>
                      </label>`;
                  }).join("")}
                </div>
              </article>`;
          }).join("")}
        </div>`;
    }

    function renderWeeklyView() {
      const phases = config.phases || [];
      if (phases.length > 1) {
        return phases.map((ph) => {
          const list = WEEKS.filter((w) => w.id >= ph.minWeek && w.id <= ph.maxWeek);
          const firstW = list[0];
          const lastW = list[list.length - 1];
          const pFirst = firstW ? DAY_MAP[firstW.dayNums[0]] : null;
          const pLast = lastW ? DAY_MAP[lastW.dayNums[lastW.dayNums.length - 1]] : null;
          const spanPrefix = pFirst && pLast ? `${pFirst.dateLabel} – ${pLast.dateLabel} • ` : "";
          const cleanSub = ph.subtitle.replace(/^[^•]+•\s*/, "");
          return `
            <section class="flex flex-col gap-3">
              <div class="card p-3 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 class="text-sm font-bold m-0">${S.escHtml(ph.heading)}</h2>
                  <p class="text-xs text-muted m-0">${S.escHtml(spanPrefix + cleanSub)}</p>
                </div>
                <span class="pill pill-muted font-mono">${list.length} Weeks</span>
              </div>
              ${renderWeekCardsGrid(list)}
            </section>`;
        }).join("");
      }
      return renderWeekCardsGrid(WEEKS);
    }

    function renderMonthlyView() {
      return `
        <div class="grid-2">
          ${MONTHS.map((m) => {
            const ms = getMonthStats(m.id);
            const firstW = WEEK_MAP[m.weeks[0]];
            const lastW = WEEK_MAP[m.weeks[m.weeks.length - 1]];
            const mFirst = firstW ? DAY_MAP[firstW.dayNums[0]] : null;
            const mLast = lastW ? DAY_MAP[lastW.dayNums[lastW.dayNums.length - 1]] : null;
            const periodLabel = mFirst && mLast ? `${mFirst.dateLabel} – ${mLast.dateLabel}` : m.period;

            const skPills = m.skills.map((sid) => {
              const sk = SKILL_MAP[sid];
              if (!sk) return "";
              const meta = trackMeta[sk.track] || { pillClass: "pill-muted" };
              return `<button type="button" data-action="filter-skill" data-skill="${S.escHtml(sid)}" class="pill ${meta.pillClass} cursor-pointer">${S.escHtml(sk.short)}</button>`;
            }).join("");

            const trackBars = config.tracks.map((tr) => {
              const meta = trackMeta[tr.key];
              const pct = ms.trackPct[tr.key].pct;
              return `
                <div class="subcard p-2">
                  <div class="flex justify-between text-xs mb-1">
                    <span class="font-semibold">${S.escHtml(tr.label)}</span>
                    <span class="font-mono">${pct}%</span>
                  </div>
                  ${S.renderProgressBar(pct, meta.colorVar, 5)}
                </div>`;
            }).join("");

            return `
              <article class="card p-4 flex flex-col gap-3">
                <div class="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <div class="flex flex-wrap items-center gap-1.5 mb-1">
                      <span class="pill pill-muted font-mono">Weeks ${m.weeks[0]}–${m.weeks[m.weeks.length - 1]}</span>
                      <span class="text-xs text-muted">${S.escHtml(periodLabel)}</span>
                    </div>
                    <h2 class="text-base font-bold m-0">${S.escHtml(m.title)}</h2>
                    <div class="text-xs text-muted">${S.escHtml(m.phase)}</div>
                  </div>
                  <div class="text-right">
                    <div class="text-lg font-bold font-mono">${ms.pct}%</div>
                    <div class="text-xs text-muted">${ms.done}/${ms.total} tasks</div>
                  </div>
                </div>
                <p class="text-xs text-muted m-0 leading-relaxed">${S.escHtml(m.summary)}</p>
                ${S.renderProgressBar(ms.pct, "var(--primary)")}
                <div class="grid grid-cols-3 gap-2">${trackBars}</div>
                <div class="flex flex-col gap-2 pt-1 border-t">
                  <div class="flex items-center justify-between text-xs font-semibold">
                    <span>${S.escHtml(config.ui.monthlyTargetsHeading)}</span>
                    <span class="font-mono text-muted">${ms.targetsDone}/${ms.targetsTotal} verified</span>
                  </div>
                  ${m.targets.map((tg) => {
                    const meta = trackMeta[tg.track] || { label: tg.track };
                    return renderTargetItem({
                      action: "toggle-month-target",
                      tg,
                      checked: Boolean(state.monthTargets[tg.id]),
                      pillText: meta.label,
                      tag: tg.tag
                    });
                  }).join("")}
                </div>
                <div class="flex flex-wrap gap-1 pt-1 border-t">${skPills}</div>
              </article>`;
          }).join("")}
        </div>`;
    }

    function renderSkillsView(m) {
      const barW = 240;
      const rowsSvg = [
        ...config.tracks.map((tr) => ({
          label: tr.svgLabel,
          pct: m.trackPct[tr.key],
          color: trackMeta[tr.key].colorVar
        })),
        { label: config.ui.skillsChartCombinedLabel, pct: m.overallPct, color: "var(--primary)" }
      ];

      const svgChart = `
        <svg viewBox="0 0 700 152" class="w-full max-w-3xl" role="img" aria-label="${S.escHtml(config.ui.skillsChartAriaLabel)}">
          ${rowsSvg.map((r, i) => {
            const y = 16 + i * 33;
            const fw = Math.round((r.pct / 100) * barW);
            return `<text x="4" y="${y + 15}" fill="var(--foreground)" font-size="14" font-weight="600">${S.escHtml(r.label)}</text><rect x="260" y="${y + 3}" width="${barW}" height="14" rx="7" fill="var(--secondary)" /><rect x="260" y="${y + 3}" width="${fw}" height="14" rx="7" fill="${r.color}" /><text x="514" y="${y + 15}" fill="var(--muted-foreground)" font-size="14" font-family="monospace" font-weight="700">${r.pct}%</text>`;
          }).join("")}
        </svg>`;

      return `
        <section class="card p-4 flex flex-col gap-2">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 class="text-base font-bold m-0">${S.escHtml(config.ui.skillsMatrixTitle)}</h2>
              <p class="text-xs text-muted m-0">Stages update automatically from daily task completions: Not Started (0%) &rarr; Foundations (1–34%) &rarr; Practising (35–69%) &rarr; Proficient (70–94%) &rarr; Acquired (95%+).</p>
            </div>
            <span class="pill pill-ok font-mono">${m.skillsAcquired} / ${SKILLS.length} Acquired</span>
          </div>
          <div class="pt-1">${svgChart}</div>
        </section>
        ${config.tracks.map((tr) => {
          const meta = trackMeta[tr.key];
          const subSkills = SKILLS.filter((sk) => sk.track === tr.key);
          return `
            <section class="flex flex-col gap-2">
              <h3 class="text-sm font-bold m-0 px-1 flex items-center gap-2">
                <span class="pill ${meta.pillClass}">${S.escHtml(tr.label)}</span>
                <span>${S.escHtml(tr.skillGroupTitle)}</span>
              </h3>
              <div class="grid-3">
                ${subSkills.map((sk) => {
                  const ss = m.skillStats[sk.id];
                  return `
                    <article class="card p-3.5 flex flex-col gap-2">
                      <div class="flex items-start justify-between gap-2">
                        <div>
                          <div class="font-bold text-sm leading-snug">${S.escHtml(sk.name)}</div>
                          <div class="text-xs text-muted">${S.escHtml(sk.milestone)}</div>
                        </div>
                        <span class="pill ${ss.stage.cls}">${ss.stage.label}</span>
                      </div>
                      <p class="text-xs text-muted m-0 leading-relaxed">${S.escHtml(sk.desc)}</p>
                      <div class="flex items-center gap-2 text-xs">
                        <div class="flex-1">${S.renderProgressBar(ss.pct, meta.colorVar)}</div>
                        <span class="font-mono font-bold">${ss.done}/${ss.total} (${ss.pct}%)</span>
                      </div>
                      <div class="flex flex-wrap items-center justify-between gap-2 pt-1 border-t">
                        <div class="text-xs text-muted">${ss.hrsDone.toFixed(1)}h / ${ss.hrsTotal.toFixed(1)}h${ss.redo ? ` &bull; <strong class="text-warning">${ss.redo} redo</strong>` : ""}</div>
                        <button type="button" class="btn" data-action="filter-skill" data-skill="${S.escHtml(sk.id)}">Filter Tasks &rarr;</button>
                      </div>
                    </article>`;
                }).join("")}
              </div>
            </section>`;
        }).join("")}`;
    }

    function renderQueueAndLibraryView() {
      const redoTasks = ALL_TASKS.filter((t) => getTaskStatus(t.id) === 2);
      const noteEntries = Object.entries(state.notes)
        .map(([k, val]) => ({ dayNum: Number(k.slice(1)), val }))
        .filter((x) => DAY_MAP[x.dayNum] && x.val.trim())
        .sort((a, b) => a.dayNum - b.dayNum);

      return `
        <div class="grid-2">
          <section class="card p-4 flex flex-col gap-2.5">
            <div class="flex items-center justify-between gap-2">
              <h2 class="text-sm font-bold m-0">7-Day Redo Queue (~ Flagged)</h2>
              <span class="pill pill-warn font-mono">${redoTasks.length} queued</span>
            </div>
            <p class="text-xs text-muted m-0">${S.escHtml(config.ui.redoDesc)}</p>
            ${redoTasks.length
              ? `<div class="flex flex-col gap-2">${redoTasks.map((t) => {
                  const scheduledDay = DAY_MAP[t.dayNum];
                  const target = S.addDaysIso(scheduledDay ? scheduledDay.dateIso : state.startDate, 7);
                  const meta = trackMeta[t.track] || { pillClass: "pill-muted", label: t.track };
                  return `
                    <div class="subcard p-2.5 flex items-start justify-between gap-2">
                      <div class="text-xs">
                        <div class="flex flex-wrap items-center gap-1.5 mb-0.5">
                          <span class="pill ${meta.pillClass}">${S.escHtml(meta.label)}</span>
                          <strong>Day ${t.dayNum} (W${t.week}): ${S.escHtml(t.title)}</strong>
                        </div>
                        <div class="text-muted">Redo due by: <strong>${S.escHtml(target.label)}</strong> &bull; ${renderResRef(t.res)}</div>
                      </div>
                      <div class="flex gap-1">
                        <button type="button" class="btn btn-primary" data-action="toggle-task-done" data-id="${S.escHtml(t.id)}">&#10003; Mastered</button>
                        <button type="button" class="btn" data-action="open-week" data-week="${t.week}">W${t.week}</button>
                      </div>
                    </div>`;
                }).join("")}</div>`
              : `<div class="subcard p-4 text-xs text-center text-muted">${S.escHtml(config.ui.redoEmptyText)}</div>`}
          </section>

          <section class="card p-4 flex flex-col gap-2.5">
            <div class="flex items-center justify-between gap-2">
              <h2 class="text-sm font-bold m-0">${S.escHtml(config.ui.notesPanelTitle)}</h2>
              <span class="pill pill-muted font-mono">${noteEntries.length} entries</span>
            </div>
            <p class="text-xs text-muted m-0">${S.escHtml(config.ui.notesPanelDesc)}</p>
            ${noteEntries.length
              ? `<div class="flex flex-col gap-2">${noteEntries.map((e) => {
                  const d = DAY_MAP[e.dayNum];
                  return `
                    <div class="subcard p-2.5 flex items-start justify-between gap-2 text-xs">
                      <div>
                        <div class="font-semibold">Day ${d.dayNum} (${S.escHtml(d.dateLabel)} &bull; W${d.week})</div>
                        <div class="text-muted mt-0.5">${S.escHtml(e.val)}</div>
                      </div>
                      <button type="button" class="btn" data-action="open-week" data-week="${d.week}">Go &rarr;</button>
                    </div>`;
                }).join("")}</div>`
              : `<div class="subcard p-4 text-xs text-center text-muted">${S.escHtml(config.ui.notesEmptyText)}</div>`}
          </section>
        </div>

        <section class="card p-4 flex flex-col gap-3">
          <div>
            <h2 class="text-sm font-bold m-0">${S.escHtml(config.ui.libraryTitle)} (${Object.keys(RESOURCES).length} Mapped PDFs)</h2>
            <p class="text-xs text-muted m-0">Click any PDF below to open it directly from the repository.</p>
          </div>
          <div class="grid-3">
            ${config.tracks.map((tr) => {
              const meta = trackMeta[tr.key];
              const items = Object.entries(RESOURCES).filter(([, r]) => r.track === tr.key);
              return `
                <div class="subcard p-3 flex flex-col gap-2">
                  <div class="flex items-center justify-between">
                    <span class="pill ${meta.pillClass}">${S.escHtml(tr.libraryHeading)}</span>
                    <span class="text-xs font-mono text-muted">${items.length} PDFs</span>
                  </div>
                  <div class="flex flex-col gap-1.5 text-xs">
                    ${items.map(([k, r]) => `
                      <div class="flex flex-col border-b pb-1.5 last:border-none">
                        <div>${renderResRef(k)}</div>
                        <code class="text-[11px] text-muted break-all">${S.escHtml(r.path)}</code>
                      </div>`).join("")}
                  </div>
                </div>`;
            }).join("")}
          </div>
        </section>`;
    }

    function buildReportContext(m, todayIso) {
      const metrics = m || computeMetrics(todayIso || S.getTodayLocalIso());
      return {
        config,
        DAYS,
        ALL_TASKS,
        SKILLS,
        state,
        metrics,
        todayIso: todayIso || S.getTodayLocalIso()
      };
    }

    function getReportAnalysis() {
      const todayIso = S.getTodayLocalIso();
      return window.TrackerReport.analyzeProgress(buildReportContext(null, todayIso));
    }

    function renderAll() {
      const todayIso = S.getTodayLocalIso();
      const m = computeMetrics(todayIso);
      renderHeaderMeta(m, todayIso);
      renderKpis(m);
      renderToolbarControls();
      const mainEl = document.getElementById("main-view");
      if (!mainEl) return;
      if (state.activeTab === "daily") mainEl.innerHTML = renderDailyView(m, todayIso);
      else if (state.activeTab === "weekly") mainEl.innerHTML = renderWeeklyView();
      else if (state.activeTab === "monthly") mainEl.innerHTML = renderMonthlyView();
      else if (state.activeTab === "skills") mainEl.innerHTML = renderSkillsView(m);
      else if (state.activeTab === "report") mainEl.innerHTML = window.TrackerReport.renderReportView(buildReportContext(m, todayIso));
      else mainEl.innerHTML = renderQueueAndLibraryView();
    }

    function openIoModal(mode) {
      const modal = document.getElementById("io-modal");
      const title = document.getElementById("io-modal-title");
      const desc = document.getElementById("io-desc");
      const area = document.getElementById("io-textarea");
      const applyBtn = document.getElementById("io-apply");
      if (!modal || !area) return;
      if (mode === "export") {
        title.textContent = config.ui.exportTitle;
        desc.textContent = config.ui.exportDesc;
        area.value = JSON.stringify(state, null, 2);
        applyBtn.style.display = "none";
      } else {
        title.textContent = config.ui.importTitle;
        desc.textContent = "Paste an exported JSON snapshot below or load a .json file, then click Apply Imported JSON.";
        area.value = "";
        applyBtn.style.display = "inline-flex";
      }
      modal.classList.add("open");
    }

    function clearAllFilters() {
      ui.skill = "";
      ui.search = "";
      ui.status = "all";
      const sInp = document.getElementById("search-input");
      const sSel = document.getElementById("status-filter");
      if (sInp) sInp.value = "";
      if (sSel) sSel.value = "all";
      renderAll();
    }

    function handleActionClick(actEl) {
      const action = actEl.getAttribute("data-action");
      switch (action) {
        case "toggle-theme":
          S.toggleTheme();
          break;
        case "set-font-scale":
          S.setFontScale(actEl.getAttribute("data-scale"));
          break;
        case "set-start-today":
          setStartDate(S.getTodayLocalIso());
          break;
        case "dismiss-welcome":
          ui.showWelcomeBanner = false;
          renderAll();
          break;
        case "catch-up-today":
          catchUpToToday();
          break;
        case "toggle-reschedule": {
          const dn = Number(actEl.getAttribute("data-day"));
          ui.openRescheduleDay = ui.openRescheduleDay === dn ? null : dn;
          renderAll();
          break;
        }
        case "shift-day":
          shiftDay(Number(actEl.getAttribute("data-day")), Number(actEl.getAttribute("data-delta")));
          break;
        case "clear-day-shift":
          clearDayShift(Number(actEl.getAttribute("data-day")));
          break;
        case "copy-report": {
          const md = window.TrackerReport.generateMarkdownReport(getReportAnalysis(), config);
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(md).catch(() => {});
          }
          showToast("Markdown progress report copied to clipboard.");
          break;
        }
        case "download-report": {
          const md = window.TrackerReport.generateMarkdownReport(getReportAnalysis(), config);
          const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `${config.backupFilePrefix}_report_${S.getTodayLocalIso()}.md`;
          a.click();
          URL.revokeObjectURL(url);
          showToast("Downloaded Markdown progress report.");
          break;
        }
        case "export-json":
          openIoModal("export");
          break;
        case "import-json":
          openIoModal("import");
          break;
        case "reset-progress": {
          const now = Date.now();
          if (now < resetArmedUntil) {
            state = defaultState(S.getTodayLocalIso());
            ui.openRescheduleDay = null;
            resetArmedUntil = 0;
            actEl.textContent = "Reset Progress";
            recomputeScheduleDates();
            saveState();
            renderAll();
            showToast(config.ui.resetToast);
          } else {
            resetArmedUntil = now + 4000;
            actEl.textContent = "Confirm Reset?";
            setTimeout(() => {
              if (Date.now() >= resetArmedUntil && actEl) actEl.textContent = "Reset Progress";
            }, 4100);
          }
          break;
        }
        case "close-io-modal": {
          const modal = document.getElementById("io-modal");
          if (modal) modal.classList.remove("open");
          break;
        }
        case "copy-io": {
          const area = document.getElementById("io-textarea");
          if (area && navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(area.value).catch(() => {});
          }
          showToast("JSON copied to clipboard.");
          break;
        }
        case "download-io": {
          const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `${config.backupFilePrefix}_${S.getTodayLocalIso()}.json`;
          a.click();
          URL.revokeObjectURL(url);
          break;
        }
        case "apply-io": {
          try {
            const parsed = JSON.parse(document.getElementById("io-textarea").value);
            state = sanitizeState(parsed, S.getTodayLocalIso());
            recomputeScheduleDates();
            saveState();
            renderAll();
            const modal = document.getElementById("io-modal");
            if (modal) modal.classList.remove("open");
            showToast("Imported snapshot successfully.");
          } catch {
            showToast("Invalid JSON snapshot.");
          }
          break;
        }
        case "set-track":
          ui.track = actEl.getAttribute("data-track") || "all";
          renderAll();
          break;
        case "toggle-track-kpi":
          setTrackFilter(actEl.getAttribute("data-track") || "all");
          break;
        case "switch-tab":
          switchTab(actEl.getAttribute("data-tab") || "daily");
          break;
        case "next-pending-day":
          findNextPendingDay();
          break;
        case "toggle-task-done":
          toggleTaskDone(actEl.getAttribute("data-id"));
          break;
        case "toggle-task-redo":
          toggleTaskRedo(actEl.getAttribute("data-id"));
          break;
        case "toggle-day-done":
          toggleDayDone(Number(actEl.getAttribute("data-day")));
          break;
        case "toggle-week-target":
          toggleWeekTarget(actEl.getAttribute("data-id"));
          break;
        case "toggle-month-target":
          toggleMonthTarget(actEl.getAttribute("data-id"));
          break;
        case "filter-skill":
          filterBySkill(actEl.getAttribute("data-skill"));
          break;
        case "clear-skill":
          ui.skill = "";
          renderAll();
          break;
        case "clear-all-filters":
          clearAllFilters();
          break;
        case "open-week":
          openWeek(Number(actEl.getAttribute("data-week")));
          break;
      }
    }

    function bindEvents() {
      if (typeof rootEl.addEventListener !== "function") return;
      rootEl.addEventListener("click", (e) => {
        const target = e && e.target;
        const actEl = target && typeof target.closest === "function" ? target.closest("[data-action]") : null;
        if (actEl) handleActionClick(actEl);
      });
      rootEl.addEventListener("input", (e) => {
        const target = e && e.target;
        if (!target) return;
        const act = target.getAttribute ? target.getAttribute("data-action") : null;
        if (target.id === "search-input") {
          ui.search = target.value;
          renderAll();
        } else if (act === "save-day-note") {
          saveDayNote(Number(target.getAttribute("data-day")), target.value);
        } else if (act === "shift-reason") {
          saveShiftReason(Number(target.getAttribute("data-day")), target.value);
        }
      });
      rootEl.addEventListener("change", (e) => {
        const target = e && e.target;
        if (!target) return;
        const act = target.getAttribute ? target.getAttribute("data-action") : null;
        if (target.id === "status-filter") {
          ui.status = target.value;
          renderAll();
        } else if (target.id === "start-date-input") {
          setStartDate(target.value);
        } else if (act === "move-day-date") {
          moveDayToDate(Number(target.getAttribute("data-day")), target.value);
        } else if (target.id === "io-file") {
          const f = target.files && target.files[0];
          if (!f) return;
          const reader = new FileReader();
          reader.onload = () => {
            const area = document.getElementById("io-textarea");
            const applyBtn = document.getElementById("io-apply");
            if (area) area.value = String(reader.result || "");
            if (applyBtn) applyBtn.style.display = "inline-flex";
          };
          reader.readAsText(f);
        }
      });
    }

    renderShell();
    state = loadState();
    recomputeScheduleDates();
    S.initPreferences((e) => {
      if (e && e.key === STORAGE_KEY) {
        try {
          state = e.newValue ? sanitizeState(JSON.parse(e.newValue), S.getTodayLocalIso()) : defaultState(S.getTodayLocalIso());
          recomputeScheduleDates();
          hasSavedSnapshot = Boolean(e.newValue);
          refreshStorageBadge(state.lastSavedAt, hasSavedSnapshot);
          renderAll();
        } catch {}
      }
    });
    if (typeof window.addEventListener === "function") {
      window.addEventListener("beforeunload", () => saveState());
    }
    bindEvents();
    renderAll();

    const instance = {
      STORAGE_KEY,
      RESOURCE_PREFIX,
      IS_OFFLINE_WORKSPACE: true,
      RESOURCES,
      SKILLS,
      MONTHS,
      WEEKS,
      DAYS,
      ALL_TASKS,
      config,
      getState: () => state,
      switchTab,
      computeMetrics: () => computeMetrics(S.getTodayLocalIso()),
      computeSkillStats,
      toggleTaskDone,
      toggleTaskRedo,
      toggleDayDone,
      toggleWeekTarget,
      toggleMonthTarget,
      saveDayNote,
      setStartDate,
      shiftDay,
      moveDayToDate,
      clearDayShift,
      saveShiftReason,
      catchUpToToday,
      getReportAnalysis,
      setTrackFilter,
      filterBySkill,
      openWeek,
      findNextPendingDay,
      renderAll,
      saveState
    };
    window.TrackerApp.current = instance;
    return instance;
  }

  window.TrackerApp = { mount, current: null };
})();
