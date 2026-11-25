(function () {
  "use strict";

  const S = window.TrackerShared;

  function avgOf(arr, fn) {
    if (!arr.length) return 0;
    return arr.reduce((acc, x) => acc + fn(x), 0) / arr.length;
  }

  function formatTrackPctSummary(config, metrics) {
    const items = (config.tracks || []).map((tr) => ({
      key: tr.key,
      label: tr.label,
      pct: (metrics.trackPct && metrics.trackPct[tr.key]) || 0,
      done: (metrics.byTrack && metrics.byTrack[tr.key] && metrics.byTrack[tr.key].done) || 0,
      total: (metrics.byTrack && metrics.byTrack[tr.key] && metrics.byTrack[tr.key].total) || 0
    }));
    const sorted = [...items].sort((a, b) => b.pct - a.pct);
    return {
      items,
      strongest: sorted[0] || null,
      lowest: sorted[sorted.length - 1] || null
    };
  }

  function analyzeProgress({ config, DAYS, ALL_TASKS, SKILLS, state, metrics, todayIso }) {
    const daySeries = [];
    let lastCompletedDayNum = 0;
    let scheduledUpToTodayDayNum = 0;
    let totalShiftDays = 0;
    const shiftEvents = [];

    for (let i = 0; i < DAYS.length; i++) {
      const d = DAYS[i];
      const total = d.tasks.length;
      let done = 0;
      let hrsDone = 0;
      let hrsTotal = 0;
      for (const t of d.tasks) {
        hrsTotal += t.hrs;
        if ((state.tasks && state.tasks[t.id]) === 1) {
          done++;
          hrsDone += t.hrs;
        }
      }
      const pct = total ? Math.round((done / total) * 100) : 0;
      const isFull = total > 0 && done === total;
      const isPartial = done > 0 && done < total;
      const streakNum = (metrics.dayStreakMap && metrics.dayStreakMap[d.dayNum]) || 0;
      const ownShift = d.ownShift || 0;
      const shiftReason = d.shiftReason || "";
      const note = (state.notes && state.notes[`d${d.dayNum}`]) || "";
      const prev = i > 0 ? daySeries[i - 1] : null;
      const deltaTasks = prev ? done - prev.done : 0;
      const deltaPct = prev ? pct - prev.pct : 0;

      if (done > 0) lastCompletedDayNum = d.dayNum;
      if (d.dateIso <= todayIso) scheduledUpToTodayDayNum = d.dayNum;
      if (ownShift > 0) {
        totalShiftDays += ownShift;
        shiftEvents.push({ dayNum: d.dayNum, dateLabel: d.dateLabel, ownShift, shiftReason });
      }

      daySeries.push({
        dayNum: d.dayNum,
        week: d.week,
        dateIso: d.dateIso,
        dateLabel: d.dateLabel,
        weekday: d.weekday,
        done,
        total,
        pct,
        hrsDone,
        hrsTotal,
        isFull,
        isPartial,
        streakNum,
        ownShift,
        shiftReason,
        note,
        deltaTasks,
        deltaPct,
        rollingPct: pct
      });
    }

    const progressSeries = lastCompletedDayNum > 0 ? daySeries.slice(0, lastCompletedDayNum) : [];
    const activeCutoff = Math.max(lastCompletedDayNum, Math.min(DAYS.length, scheduledUpToTodayDayNum));
    const activeSeries = activeCutoff > 0 ? daySeries.slice(0, activeCutoff) : [];

    for (let i = 0; i < progressSeries.length; i++) {
      const start = Math.max(0, i - 2);
      const win = progressSeries.slice(start, i + 1);
      progressSeries[i].rollingPct = Math.round(avgOf(win, (x) => x.pct));
    }

    let fullDays = 0;
    let partialDays = 0;
    let zeroDays = 0;
    for (const row of progressSeries) {
      if (row.isFull) fullDays++;
      else if (row.isPartial) partialDays++;
      else zeroDays++;
    }

    let earlyLabel = "Early";
    let recentLabel = "Recent";
    let earlyAvgPct = 0;
    let recentAvgPct = 0;
    let growthPct = 0;
    let earlyAvgTasks = 0;
    let recentAvgTasks = 0;
    let growthTasks = 0;

    if (progressSeries.length >= 2) {
      let earlySlice;
      let recentSlice;
      if (progressSeries.length >= 14) {
        earlySlice = progressSeries.slice(0, 7);
        recentSlice = progressSeries.slice(-7);
      } else {
        const mid = Math.floor(progressSeries.length / 2);
        earlySlice = progressSeries.slice(0, mid);
        recentSlice = progressSeries.slice(mid);
      }
      earlyLabel = `Days ${earlySlice[0].dayNum}–${earlySlice[earlySlice.length - 1].dayNum}`;
      recentLabel = `Days ${recentSlice[0].dayNum}–${recentSlice[recentSlice.length - 1].dayNum}`;
      earlyAvgPct = Math.round(avgOf(earlySlice, (x) => x.pct));
      recentAvgPct = Math.round(avgOf(recentSlice, (x) => x.pct));
      growthPct = recentAvgPct - earlyAvgPct;
      earlyAvgTasks = Number(avgOf(earlySlice, (x) => x.done).toFixed(2));
      recentAvgTasks = Number(avgOf(recentSlice, (x) => x.done).toFixed(2));
      growthTasks = Number((recentAvgTasks - earlyAvgTasks).toFixed(2));
    } else if (progressSeries.length === 1) {
      earlyLabel = "Day 1";
      recentLabel = "Day 1";
      earlyAvgPct = progressSeries[0].pct;
      recentAvgPct = progressSeries[0].pct;
      earlyAvgTasks = Number(progressSeries[0].done.toFixed(2));
      recentAvgTasks = earlyAvgTasks;
    }

    const totalDone = (metrics.byTrack && metrics.byTrack.all && metrics.byTrack.all.done) || 0;
    const totalTasks = ALL_TASKS.length;
    const totalHrsDone = (metrics.byTrack && metrics.byTrack.all && metrics.byTrack.all.hrsDone) || 0;
    const tsList = Object.values(state.taskCompletedOn || {}).filter((x) => S.isValidIsoDate(x));
    const calendarActivityDays = new Set(tsList).size;
    const avgTasksPerActiveDay = calendarActivityDays > 0
      ? Number((totalDone / calendarActivityDays).toFixed(2))
      : progressSeries.length > 0
        ? Number((totalDone / progressSeries.length).toFixed(2))
        : 0;
    const avgHrsPerDay = progressSeries.length > 0
      ? Number((totalHrsDone / progressSeries.length).toFixed(2))
      : 0;

    const remTasks = Math.max(0, totalTasks - totalDone);
    const scheduleEndLabel = DAYS.length ? DAYS[DAYS.length - 1].dateLabel : "";
    const scheduleStartLabel = DAYS.length ? DAYS[0].dateLabel : "";
    let projectedFinishLabel = scheduleEndLabel;
    if (remTasks === 0 && lastCompletedDayNum > 0) {
      projectedFinishLabel = DAYS[lastCompletedDayNum - 1].dateLabel;
    } else if (progressSeries.length > 0 && recentAvgTasks > 0) {
      const estRemDays = Math.ceil(remTasks / recentAvgTasks);
      const anchorIso = todayIso > state.startDate ? todayIso : state.startDate;
      projectedFinishLabel = S.addDaysIso(anchorIso, estRemDays).label;
    }

    const trackSummary = formatTrackPctSummary(config, metrics);
    const currentStreak = metrics.currentStreak || 0;
    const bestStreak = metrics.bestStreak || 0;

    let stage;
    if (totalDone === 0) {
      stage = {
        label: "Ready to Begin",
        pillClass: "pill-muted",
        headline: "Start Day 1 to launch your discipline baseline",
        narrative: `Your roadmap starts on ${scheduleStartLabel} (${state.startDate}). Complete even 1 task on Day 1 to begin building a multi-day discipline log and streak trail.`
      };
    } else if (progressSeries.length >= 2 && growthPct >= 10) {
      stage = {
        label: "Rising Discipline",
        pillClass: "pill-ok",
        headline: `Strong upward momentum: +${growthPct}% completion growth`,
        narrative: `You started at ${earlyAvgPct}% (${earlyAvgTasks} tasks/day) across ${earlyLabel} and climbed to ${recentAvgPct}% (${recentAvgTasks} tasks/day) across ${recentLabel}. You have logged ${fullDays} full 100% days and hold a ${currentStreak}d current streak (best ${bestStreak}d).`
      };
    } else if (recentAvgPct >= 85 && progressSeries.length >= 3) {
      stage = {
        label: "Peak Consistency",
        pillClass: "pill-ok",
        headline: `Sustaining ${recentAvgPct}% daily completion across ${recentLabel}`,
        narrative: `You are executing with high discipline at ${recentAvgTasks} tasks/day across ${recentLabel}, with ${fullDays} full days completed and a best streak of ${bestStreak}d.`
      };
    } else if (progressSeries.length < 4) {
      stage = {
        label: "Building Momentum",
        pillClass: "pill-1",
        headline: `Early baseline established (${progressSeries.length} day window, ${totalDone} tasks done)`,
        narrative: `You have completed ${totalDone} task(s) across ${fullDays} full day(s) and ${partialDays} partial day(s). Keep logging daily completions so the early-vs-recent discipline trend unlocks clearer multi-day comparisons.`
      };
    } else if (growthPct <= -10 || recentAvgPct < 50) {
      stage = {
        label: "Needs Refocus",
        pillClass: "pill-warn",
        headline: `Recent pace dipped to ${recentAvgPct}% (${growthPct}% vs ${earlyLabel})`,
        narrative: `Early execution in ${earlyLabel} averaged ${earlyAvgPct}%, while ${recentLabel} is at ${recentAvgPct}%. If travel or an event interrupted your schedule, use "+1d" / Reschedule on the missed Day card so your streak and expectations stay realistic.`
      };
    } else {
      stage = {
        label: "Steady Progress",
        pillClass: "pill-2",
        headline: `Maintaining steady cadence at ${recentAvgPct}% across ${recentLabel}`,
        narrative: `Completion moved from ${earlyAvgPct}% (${earlyLabel}) to ${recentAvgPct}% (${recentLabel}) with ${fullDays} full days and ${partialDays} partial days completed.`
      };
    }

    return {
      todayIso,
      startDate: state.startDate,
      scheduleStartLabel,
      scheduleEndLabel,
      projectedFinishLabel,
      totalTasks,
      totalDone,
      totalHrsDone: Number(totalHrsDone.toFixed(1)),
      totalDays: DAYS.length,
      lastCompletedDayNum,
      scheduledUpToTodayDayNum,
      daySeries,
      progressSeries,
      activeSeries,
      earlyLabel,
      recentLabel,
      earlyAvgPct,
      recentAvgPct,
      growthPct,
      earlyAvgTasks,
      recentAvgTasks,
      growthTasks,
      fullDays,
      partialDays,
      zeroDays,
      currentStreak,
      bestStreak,
      calendarActivityDays,
      avgTasksPerActiveDay,
      avgHrsPerDay,
      totalShiftDays,
      shiftEvents,
      trackSummary,
      skillsCount: SKILLS.length,
      skillsAcquired: metrics.skillsAcquired || 0,
      stage
    };
  }

  function renderTrendSvg(progressSeries) {
    if (!progressSeries.length) {
      return `<div class="subcard p-4 text-xs text-center text-muted">Complete tasks on Day 1+ to plot your day-by-day bar chart and 3-day rolling discipline trend line.</div>`;
    }
    const slice = progressSeries.slice(-28);
    const W = 780;
    const H = 230;
    const padL = 44;
    const padR = 16;
    const padT = 18;
    const padB = 38;
    const plotW = W - padL - padR;
    const plotH = H - padT - padB;
    const slotW = plotW / slice.length;
    const barW = Math.max(8, Math.min(26, slotW * 0.65));

    const yForPct = (pct) => padT + plotH - (Math.max(0, Math.min(100, pct)) / 100) * plotH;

    const gridLines = [0, 33, 67, 100].map((tick) => {
      const y = yForPct(tick);
      return `
        <line x1="${padL}" y1="${y}" x2="${W - padR}" y2="${y}" stroke="var(--card-border)" stroke-dasharray="${tick === 0 ? "none" : "4 4"}" />
        <text x="${padL - 8}" y="${y + 4}" text-anchor="end" fill="var(--muted-foreground)" font-size="11" font-family="monospace">${tick}%</text>`;
    }).join("");

    const bars = [];
    const points = [];
    const xTicks = [];

    slice.forEach((d, idx) => {
      const cx = padL + idx * slotW + slotW / 2;
      const bx = cx - barW / 2;
      const by = yForPct(d.pct);
      const bh = Math.max(2, padT + plotH - by);
      const barColor = d.isFull ? "var(--success)" : d.isPartial ? "var(--primary)" : "var(--secondary)";
      bars.push(`<rect x="${bx.toFixed(1)}" y="${by.toFixed(1)}" width="${barW.toFixed(1)}" height="${bh.toFixed(1)}" rx="3" fill="${barColor}"><title>Day ${d.dayNum} (${d.dateLabel}): ${d.done}/${d.total} (${d.pct}%)</title></rect>`);

      const ry = yForPct(d.rollingPct);
      points.push(`${cx.toFixed(1)},${ry.toFixed(1)}`);

      if (slice.length <= 14 || idx === 0 || idx === slice.length - 1 || d.dayNum % 3 === 0) {
        xTicks.push(`<text x="${cx.toFixed(1)}" y="${H - 14}" text-anchor="middle" fill="var(--muted-foreground)" font-size="11" font-family="monospace">D${d.dayNum}</text>`);
      }
    });

    const dots = slice.map((d, idx) => {
      const cx = padL + idx * slotW + slotW / 2;
      const ry = yForPct(d.rollingPct);
      return `<circle cx="${cx.toFixed(1)}" cy="${ry.toFixed(1)}" r="3.5" fill="var(--warning)" stroke="var(--card)" stroke-width="1.5"><title>Day ${d.dayNum} 3-Day Avg: ${d.rollingPct}%</title></circle>`;
    }).join("");

    return `
      <svg viewBox="0 0 ${W} ${H}" class="w-full" role="img" aria-label="Day-by-Day Completion and Discipline Trend Chart">
        ${gridLines}
        ${bars.join("")}
        <polyline fill="none" stroke="var(--warning)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" points="${points.join(" ")}" />
        ${dots}
        ${xTicks.join("")}
      </svg>`;
  }

  function renderDeltaBadge(deltaTasks, idx) {
    if (idx === 0) return `<span class="delta-flat font-mono">Baseline</span>`;
    if (deltaTasks > 0) return `<span class="delta-up font-mono">+${deltaTasks} &uarr;</span>`;
    if (deltaTasks < 0) return `<span class="delta-down font-mono">${deltaTasks} &darr;</span>`;
    return `<span class="delta-flat font-mono">0 &rarr;</span>`;
  }

  function renderHeatmapGrid(daySeries, todayIso) {
    const weeksMap = new Map();
    for (const d of daySeries) {
      if (!weeksMap.has(d.week)) weeksMap.set(d.week, []);
      weeksMap.get(d.week).push(d);
    }
    const cols = [];
    for (const [wk, days] of weeksMap.entries()) {
      const cells = days.map((d) => {
        const level = d.isFull ? "full" : d.pct >= 60 ? "high" : d.done > 0 ? "low" : "empty";
        const isToday = d.dateIso === todayIso;
        return `<span class="heatmap-cell heatmap-cell--${level}${isToday ? " is-today" : ""}" title="Day ${d.dayNum} (W${wk} • ${S.escHtml(d.dateLabel)}): ${d.done}/${d.total} tasks (${d.pct}%)"></span>`;
      }).join("");
      cols.push(`
        <div class="heatmap-col">
          <span class="heatmap-wk font-mono">W${wk}</span>
          <div class="heatmap-cells">${cells}</div>
        </div>`);
    }
    return `
      <div class="heatmap-wrap">
        <div class="heatmap-grid">${cols.join("")}</div>
        <div class="heatmap-legend text-xs text-muted">
          <span>Consistency Map:</span>
          <span class="heatmap-legend-item"><span class="heatmap-cell heatmap-cell--empty"></span> 0%</span>
          <span class="heatmap-legend-item"><span class="heatmap-cell heatmap-cell--low"></span> 1&ndash;59%</span>
          <span class="heatmap-legend-item"><span class="heatmap-cell heatmap-cell--high"></span> 60&ndash;99%</span>
          <span class="heatmap-legend-item"><span class="heatmap-cell heatmap-cell--full"></span> 100% Day</span>
        </div>
      </div>`;
  }

  function renderMilestoneBadges(a) {
    const milestones = [
      { id: "m1", title: "First Spark", req: "1+ Full Day", unlocked: a.fullDays >= 1, tag: `${Math.min(1, a.fullDays)}/1d` },
      { id: "m3", title: "3-Day Momentum", req: "3d Streak", unlocked: a.bestStreak >= 3, tag: `${Math.min(3, a.bestStreak)}/3d` },
      { id: "m7", title: "7-Day Iron Week", req: "7d Streak", unlocked: a.bestStreak >= 7, tag: `${Math.min(7, a.bestStreak)}/7d` },
      { id: "m14", title: "14-Day Forge", req: "14d Streak", unlocked: a.bestStreak >= 14, tag: `${Math.min(14, a.bestStreak)}/14d` },
      { id: "m30", title: "30-Day Unstoppable", req: "30d Streak", unlocked: a.bestStreak >= 30, tag: `${Math.min(30, a.bestStreak)}/30d` },
      { id: "m50", title: "Halfway Mastery", req: "50% Tasks", unlocked: (a.totalDone / Math.max(1, a.totalTasks)) >= 0.5, tag: `${Math.round((a.totalDone / Math.max(1, a.totalTasks)) * 100)}%` }
    ];
    return `
      <div class="milestone-grid">
        ${milestones.map((m) => `
          <div class="milestone-badge${m.unlocked ? " is-unlocked" : ""}">
            <div class="flex items-center justify-between gap-2">
              <span class="font-bold text-xs">${S.escHtml(m.title)}</span>
              <span class="pill ${m.unlocked ? "pill-ok" : "pill-muted"} font-mono">${m.unlocked ? "Unlocked" : S.escHtml(m.tag)}</span>
            </div>
            <div class="text-[11px] text-muted">${S.escHtml(m.req)}</div>
          </div>`).join("")}
      </div>`;
  }

  function renderReportView(ctx) {
    const a = analyzeProgress(ctx);
    const { trackSummary, stage } = a;
    const trackCallout = trackSummary.strongest && trackSummary.lowest && a.totalDone > 0
      ? `<div class="text-xs text-muted">Strongest area: <strong>${S.escHtml(trackSummary.strongest.label)} (${trackSummary.strongest.pct}%)</strong> &bull; Focus next: <strong>${S.escHtml(trackSummary.lowest.label)} (${trackSummary.lowest.pct}%)</strong></div>`
      : "";

    const growthBadge = a.growthPct > 0
      ? `<span class="pill pill-ok font-mono">+${a.growthPct}% &uarr;</span>`
      : a.growthPct < 0
        ? `<span class="pill pill-warn font-mono">${a.growthPct}% &darr;</span>`
        : `<span class="pill pill-muted font-mono">0%</span>`;

    const tableRows = a.activeSeries.length
      ? a.activeSeries.map((d, idx) => {
          const statusPill = d.isFull
            ? `<span class="pill pill-ok">Completed 100%</span>`
            : d.isPartial
              ? `<span class="pill pill-1">Partial (${d.pct}%)</span>`
              : `<span class="pill pill-muted">Pending</span>`;
          const shiftTag = d.ownShift > 0
            ? ` <span class="pill pill-warn">+${d.ownShift}d shifted${d.shiftReason ? `: ${S.escHtml(d.shiftReason)}` : ""}</span>`
            : "";
          const streakBadge = d.streakNum > 0
            ? `<span class="pill streak-pill font-mono">&#128293; ${d.streakNum}d</span>`
            : `<span class="text-muted font-mono">&mdash;</span>`;
          return `
            <tr>
              <td class="font-mono font-semibold">Day ${d.dayNum} <span class="text-muted text-[11px]">(W${d.week})</span></td>
              <td class="whitespace-nowrap">${S.escHtml(d.weekday)}, ${S.escHtml(d.dateLabel)}</td>
              <td>
                <div class="flex items-center gap-2">
                  <span class="font-mono font-semibold whitespace-nowrap">${d.done}/${d.total} (${d.pct}%)</span>
                  <div class="flex-1" style="min-width:64px">${S.renderProgressBar(d.pct, d.isFull ? "var(--success)" : "var(--primary)", 6)}</div>
                </div>
              </td>
              <td class="font-mono whitespace-nowrap">${d.hrsDone.toFixed(1)}h / ${d.hrsTotal.toFixed(1)}h</td>
              <td>${renderDeltaBadge(d.deltaTasks, idx)}</td>
              <td>${streakBadge}</td>
              <td>
                <div class="flex flex-wrap items-center gap-1.5">
                  ${statusPill}${shiftTag}
                  ${d.note ? `<span class="text-xs text-muted">${S.escHtml(d.note)}</span>` : ""}
                </div>
              </td>
            </tr>`;
        }).join("")
      : "";

    return `
      <section class="card p-4 flex flex-col gap-3">
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div class="flex flex-col gap-1.5 flex-1 min-w-[240px]">
            <div class="flex flex-wrap items-center gap-2">
              <span class="pill ${stage.pillClass}">${S.escHtml(stage.label)}</span>
              <span class="pill pill-muted font-mono">${a.progressSeries.length} Tracked Day(s)</span>
            </div>
            <h2 class="text-lg font-bold m-0">${S.escHtml(stage.headline)}</h2>
            <p class="text-sm text-muted m-0 leading-relaxed">${S.escHtml(stage.narrative)}</p>
            ${trackCallout}
          </div>
          <div class="flex flex-wrap items-center gap-2">
            <button type="button" class="btn" data-action="copy-report">Copy Markdown Report</button>
            <button type="button" class="btn btn-primary" data-action="download-report">Download Report (.md)</button>
          </div>
        </div>

        <div class="kpi-grid">
          <div class="subcard kpi-card">
            <div class="flex items-center justify-between text-xs text-muted">
              <span class="font-semibold">Early &rarr; Recent Discipline</span>
              ${growthBadge}
            </div>
            <div class="text-base font-bold font-mono">${a.earlyAvgPct}% &rarr; ${a.recentAvgPct}%</div>
            ${S.renderProgressBar(a.recentAvgPct, "var(--success)")}
            <div class="text-xs text-muted">${S.escHtml(a.earlyLabel)} (${a.earlyAvgTasks}/d) vs ${S.escHtml(a.recentLabel)} (${a.recentAvgTasks}/d)</div>
          </div>

          <div class="subcard kpi-card">
            <div class="flex items-center justify-between text-xs text-muted">
              <span class="font-semibold">Daily Streak &amp; Full Days</span>
              <span class="pill streak-pill font-mono">Best ${a.bestStreak}d</span>
            </div>
            <div class="text-base font-bold font-mono">&#128293; ${a.currentStreak}d active</div>
            ${S.renderProgressBar(a.totalDays ? Math.round((a.fullDays / Math.max(1, a.progressSeries.length)) * 100) : 0, "var(--warning)")}
            <div class="text-xs text-muted">${a.fullDays} full (100%) &bull; ${a.partialDays} partial &bull; ${a.zeroDays} skipped</div>
          </div>

          <div class="subcard kpi-card">
            <div class="flex items-center justify-between text-xs text-muted">
              <span class="font-semibold">Execution Velocity</span>
              <span class="font-mono font-bold">${a.avgHrsPerDay}h/day</span>
            </div>
            <div class="text-base font-bold font-mono">${a.avgTasksPerActiveDay} tasks/day</div>
            ${S.renderProgressBar(a.totalTasks ? Math.round((a.totalDone / a.totalTasks) * 100) : 0, "var(--primary)")}
            <div class="text-xs text-muted">Est. finish: <strong>${S.escHtml(a.projectedFinishLabel)}</strong></div>
          </div>

          <div class="subcard kpi-card">
            <div class="flex items-center justify-between text-xs text-muted">
              <span class="font-semibold">Personalized Schedule</span>
              <span class="pill ${a.totalShiftDays ? "pill-warn" : "pill-muted"} font-mono">${a.totalShiftDays}d shifted</span>
            </div>
            <div class="text-base font-bold font-mono">${S.escHtml(a.startDate)}</div>
            ${S.renderProgressBar(Math.round((a.skillsAcquired / Math.max(1, a.skillsCount)) * 100), "var(--chart-2)")}
            <div class="text-xs text-muted">Target end: <strong>${S.escHtml(a.scheduleEndLabel)}</strong></div>
          </div>
        </div>
      </section>

      <section class="card p-4 flex flex-col gap-3">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 class="text-base font-bold m-0">Consistency Heatmap &amp; Milestone Badges</h3>
            <p class="text-xs text-muted m-0">Every cell represents one roadmap day (${a.totalDays} days across ${Math.round(a.totalDays / 7)} weeks). Unlock streak milestones as you build daily discipline.</p>
          </div>
          <span class="pill streak-pill font-mono">&#128293; ${a.currentStreak}d Active &bull; Best ${a.bestStreak}d</span>
        </div>
        ${renderHeatmapGrid(a.daySeries, a.todayIso)}
        ${renderMilestoneBadges(a)}
      </section>

      <section class="card p-4 flex flex-col gap-3">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 class="text-base font-bold m-0">Day-by-Day Discipline Trend</h3>
            <p class="text-xs text-muted m-0">Daily task completion bars paired with a 3-day rolling discipline trend line (latest 28 tracked days).</p>
          </div>
          <div class="flex flex-wrap items-center gap-2 text-xs">
            <span class="pill pill-ok">100% Day</span>
            <span class="pill pill-1">Partial Day</span>
            <span class="pill pill-warn">3-Day Rolling Avg</span>
          </div>
        </div>
        ${renderTrendSvg(a.progressSeries)}
      </section>

      <section class="card p-4 flex flex-col gap-3">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 class="text-base font-bold m-0">Day-by-Day Progress &amp; Streak Log</h3>
            <p class="text-xs text-muted m-0">Shows how daily task volume, day-over-day delta, and consecutive streaks evolve over time.</p>
          </div>
          <span class="pill pill-muted font-mono">${a.activeSeries.length} Day Row(s)</span>
        </div>
        ${a.activeSeries.length
          ? `<div class="report-table-wrap">
              <table class="report-table">
                <thead>
                  <tr>
                    <th>Day</th>
                    <th>Calendar Date</th>
                    <th>Completed</th>
                    <th>Hours</th>
                    <th>Day Delta</th>
                    <th>Streak</th>
                    <th>Status &amp; Adjustments</th>
                  </tr>
                </thead>
                <tbody>${tableRows}</tbody>
              </table>
            </div>`
          : `<div class="subcard p-4 text-xs text-center text-muted">No scheduled days reached yet (${S.escHtml(a.scheduleStartLabel)}). Check off any task or adjust Start Date to generate daily rows.</div>`}
      </section>
    `;
  }

  function generateMarkdownReport(analysis, config) {
    const a = analysis;
    const lines = [
      `# ${config.header.title} — Discipline & Progress Report`,
      "",
      `- **Generated On:** ${a.todayIso}`,
      `- **Start Date:** ${a.scheduleStartLabel} (\`${a.startDate}\`)`,
      `- **Current Schedule End:** ${a.scheduleEndLabel} (${a.totalShiftDays} off-day shift(s) applied)`,
      `- **Projected Finish at Current Pace:** ${a.projectedFinishLabel}`,
      `- **Stage:** ${a.stage.label} — ${a.stage.headline}`,
      "",
      "## Discipline Summary",
      `- **Overall Progress:** ${a.totalDone} / ${a.totalTasks} tasks (${Math.round((a.totalDone / Math.max(1, a.totalTasks)) * 100)}%), ${a.totalHrsDone}h logged`,
      `- **Early vs Recent Discipline:** ${a.earlyLabel}: ${a.earlyAvgPct}% (${a.earlyAvgTasks} tasks/day) -> ${a.recentLabel}: ${a.recentAvgPct}% (${a.recentAvgTasks} tasks/day) (Delta: ${a.growthPct >= 0 ? "+" : ""}${a.growthPct}%)`,
      `- **Daily Streaks:** Current ${a.currentStreak}d | Best ${a.bestStreak}d | Full 100% Days: ${a.fullDays} | Partial Days: ${a.partialDays}`,
      `- **Velocity:** ${a.avgTasksPerActiveDay} tasks/active day (${a.avgHrsPerDay}h/tracked day)`,
      "",
      `> ${a.stage.narrative}`,
      "",
      "## Track Breakdown",
      "| Track | Done | Total | Completion |",
      "|---|---:|---:|---:|",
      ...a.trackSummary.items.map((tr) => `| ${tr.label} | ${tr.done} | ${tr.total} | ${tr.pct}% |`),
      ""
    ];

    if (a.shiftEvents.length) {
      lines.push("## Rescheduled Days / Off-Days");
      for (const ev of a.shiftEvents) {
        lines.push(`- Day ${ev.dayNum} (${ev.dateLabel}): shifted +${ev.ownShift}d${ev.shiftReason ? ` — ${ev.shiftReason}` : ""}`);
      }
      lines.push("");
    }

    if (a.activeSeries.length) {
      lines.push("## Day-by-Day Progress Log");
      lines.push("| Day | Date | Done | % | Delta | Streak | Note |");
      lines.push("|---:|---|---:|---:|---:|---:|---|");
      for (let i = 0; i < a.activeSeries.length; i++) {
        const d = a.activeSeries[i];
        const deltaStr = i === 0 ? "Baseline" : `${d.deltaTasks >= 0 ? "+" : ""}${d.deltaTasks}`;
        const streakStr = d.streakNum > 0 ? `${d.streakNum}d` : "-";
        const extra = [d.ownShift ? `+${d.ownShift}d ${d.shiftReason}` : "", d.note].filter(Boolean).join(" | ");
        lines.push(`| Day ${d.dayNum} | ${d.weekday}, ${d.dateLabel} | ${d.done}/${d.total} | ${d.pct}% | ${deltaStr} | ${streakStr} | ${extra || "-"} |`);
      }
      lines.push("");
    }

    return lines.join("\n");
  }

  window.TrackerReport = {
    analyzeProgress,
    renderHeatmapGrid,
    renderMilestoneBadges,
    renderReportView,
    generateMarkdownReport
  };
})();
