(function () {
  "use strict";

  const S = window.TrackerShared;

  function mount(rootId) {
    const rootEl = document.getElementById(rootId || "hub-root");
    if (!rootEl) {
      throw new Error(`Hub root element #${rootId || "hub-root"} not found`);
    }

    const trackers = S.getAllTrackers();
    const summaries = trackers.map((cfg) => ({ cfg, summary: S.computeConfigSummary(cfg) }));
    const uniquePdfPaths = new Set();
    for (const cfg of trackers) {
      if (cfg.resources) {
        for (const r of Object.values(cfg.resources)) uniquePdfPaths.add(r.path);
      }
    }

    const headerPills = trackers
      .map((cfg) => `<span class="pill pill-${cfg.hub.slot}">${S.escHtml(cfg.hub.headerPill)}</span>`)
      .join("");

    rootEl.innerHTML = `
      <header class="card p-4 flex flex-col gap-3">
        <div class="flex flex-wrap items-center justify-between gap-2.5">
          <div>
            <div class="flex flex-wrap items-center gap-2 mb-1">
              ${headerPills}
              <span class="pill pill-muted">Offline LocalStorage Hub</span>
            </div>
            <h1 class="text-xl font-bold tracking-tight m-0">Placement Preparation Roadmap Trackers</h1>
            <p class="text-xs text-muted mt-1 m-0">
              Central dashboard for all study trackers in <span class="font-mono">tracker/</span>. Each tracker saves daily checkboxes, <span class="font-mono">~ Redo</span> flags, weekly/monthly targets &amp; daily error logs independently in <span class="font-mono">localStorage</span>.
            </p>
          </div>
          <div class="flex flex-wrap items-center gap-2">
            <span id="storage-status" class="pill pill-muted">Checking localStorage...</span>
            <button id="theme-toggle-btn" type="button" class="btn" data-action="toggle-theme">Dark Theme</button>
            <a href="../README.md" class="btn" target="_blank" rel="noopener">Repository Index &nearr;</a>
          </div>
        </div>
        <div id="overall-summary" class="summary-grid"></div>
      </header>

      <section id="tracker-cards" class="grid grid-3--hub"></section>

      <section class="card p-4 flex flex-col gap-2.5">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <h2 class="text-base font-bold m-0">How Progress Sync &amp; Storage Work</h2>
          <span class="pill pill-muted font-mono">100% Offline &bull; ${trackers.length} Independent Storage Keys</span>
        </div>
        <div class="grid-3">
          <div class="subcard p-3 flex flex-col gap-1">
            <strong>Auto-Save on Every Click</strong>
            <p class="text-xs text-muted m-0">Completing a task, flagging <span class="font-mono">~ Redo</span>, ticking a target, or typing a daily note writes immediately to browser <span class="font-mono">localStorage</span> and updates the save timestamp.</p>
          </div>
          <div class="subcard p-3 flex flex-col gap-1">
            <strong>Multi-Tab Live Sync</strong>
            <p class="text-xs text-muted m-0">Changes made in any open tracker tab propagate automatically to this hub and other open views via the <span class="font-mono">storage</span> event listener.</p>
          </div>
          <div class="subcard p-3 flex flex-col gap-1">
            <strong>JSON Portability</strong>
            <p class="text-xs text-muted m-0">Use <strong>Export JSON</strong> inside any tracker for periodic backups or to move your state between browsers/computers.</p>
          </div>
        </div>
      </section>
    `;

    function renderHub() {
      const storageOk = S.probeLocalStorage("__hub_probe__");
      const snapshots = summaries.map(({ cfg, summary }) => ({
        cfg,
        summary,
        snap: S.readTrackerSnapshot(cfg.storageKey, summary.totalTasks)
      }));

      let totalDone = 0;
      let totalTasks = 0;
      let totalRedo = 0;
      let activeTrackers = 0;
      for (const { summary, snap } of snapshots) {
        totalDone += snap.done;
        totalTasks += summary.totalTasks;
        totalRedo += snap.redo;
        if (snap.exists && (snap.done > 0 || snap.redo > 0 || snap.weekDone > 0 || snap.monthDone > 0 || snap.notes > 0)) {
          activeTrackers++;
        }
      }
      const combinedPct = totalTasks ? Math.round((totalDone / totalTasks) * 100) : 0;

      S.updateStorageBadge(document.getElementById("storage-status"), {
        ok: storageOk,
        hasSnapshot: activeTrackers > 0,
        savedAt: activeTrackers > 0 ? `${activeTrackers} Saved` : null,
        readyLabel: "LocalStorage Ready"
      });

      const trackBadgeList = trackers.map((t) => t.hub.badge).join(" &bull; ");
      const summaryEl = document.getElementById("overall-summary");
      if (summaryEl) {
        summaryEl.innerHTML = `
          <div class="subcard p-3 flex flex-col gap-1">
            <span class="text-xs text-muted">Combined Tasks Completed</span>
            <strong class="font-mono" style="font-size:17px">${totalDone} / ${totalTasks} (${combinedPct}%)</strong>
            ${S.renderProgressBar(combinedPct, "var(--primary)", 8)}
          </div>
          <div class="subcard p-3 flex flex-col gap-1">
            <span class="text-xs text-muted">Active Trackers Started</span>
            <strong class="font-mono" style="font-size:17px">${activeTrackers} / ${trackers.length}</strong>
            <span class="text-xs text-muted">Independent localStorage keys</span>
          </div>
          <div class="subcard p-3 flex flex-col gap-1">
            <span class="text-xs text-muted">Queued Redo Items (~)</span>
            <strong class="font-mono text-warning" style="font-size:17px">${totalRedo}</strong>
            <span class="text-xs text-muted">Across all ${trackers.length} study tracks</span>
          </div>
          <div class="subcard p-3 flex flex-col gap-1">
            <span class="text-xs text-muted">Mapped Study Library</span>
            <strong class="font-mono" style="font-size:17px">${uniquePdfPaths.size} Unique PDFs</strong>
            <span class="text-xs text-muted">${trackBadgeList}</span>
          </div>`;
      }

      const cardsEl = document.getElementById("tracker-cards");
      if (cardsEl) {
        cardsEl.innerHTML = snapshots.map(({ cfg, summary, snap }) => {
          const chartColor = `var(--chart-${cfg.hub.slot})`;
          return `
            <article class="card p-4 flex flex-col justify-between gap-3">
              <div class="flex flex-col gap-2">
                <div class="flex flex-wrap items-center justify-between gap-2">
                  <span class="pill pill-${cfg.hub.slot}">${S.escHtml(cfg.hub.badge)}</span>
                  <span class="pill ${snap.exists ? "pill-ok" : "pill-muted"} font-mono">
                    ${snap.exists ? (snap.lastSavedAt ? `Saved ${S.escHtml(snap.lastSavedAt)}` : "Saved") : "Not Started"}
                  </span>
                </div>
                <h2 class="text-base font-bold m-0">${S.escHtml(cfg.hub.title)}</h2>
                <p class="text-xs text-muted m-0">${S.escHtml(cfg.hub.timeline)}</p>
                <p class="text-xs text-muted m-0 leading-relaxed">${S.escHtml(cfg.hub.scope)}</p>
              </div>
              <div class="flex flex-col gap-2 mt-1">
                <div class="flex items-center justify-between text-xs">
                  <span class="text-muted">Progress</span>
                  <strong class="font-mono">${snap.done} / ${summary.totalTasks} tasks (${snap.pct}%)</strong>
                </div>
                ${S.renderProgressBar(snap.pct, chartColor, 8)}
                <div class="flex items-center justify-between text-[11px] text-muted">
                  <span>${summary.totalDays} days &bull; ${summary.totalSkills} skills &bull; ${summary.pdfCount} PDFs</span>
                  <span>${snap.redo} redo &bull; W${snap.activeWeek}</span>
                </div>
                <div class="flex flex-wrap items-center justify-between gap-2 pt-1.5 border-t">
                  <code class="text-[11px] text-muted font-mono">${S.escHtml(cfg.storageKey)}</code>
                  <a href="${S.escHtml(cfg.hub.href)}" class="btn btn-primary">Open Tracker &rarr;</a>
                </div>
              </div>
            </article>`;
        }).join("");
      }
    }

    S.initTheme(() => renderHub());
    renderHub();
    if (typeof window.addEventListener === "function") {
      window.addEventListener("focus", renderHub);
    }
    if (typeof rootEl.addEventListener === "function") {
      rootEl.addEventListener("click", (e) => {
        const target = e && e.target;
        const actEl = target && typeof target.closest === "function" ? target.closest('[data-action="toggle-theme"]') : null;
        if (actEl) S.toggleTheme();
      });
    }

    return { renderHub, trackers };
  }

  window.TrackerHub = { mount };
})();
