// Renders the benchmark bar chart on kernel.html from benchmark-data.js.
// With no measured data the section stays hidden. `?benchmark=sample` shows
// the layout with made-up numbers and a stamp that says so.
(() => {
  const section = document.getElementById("benchmark");
  const data = window.THANATOS_BENCHMARK;
  if (!section || !data) return;

  const sample = new URLSearchParams(location.search).get("benchmark") === "sample";
  if (!data.measured && !sample) return;

  const TOOLS = [
    { id: "thanatos", name: "THANATOS" },
    { id: "claude", name: "Claude Code CLI" },
    { id: "codex", name: "Codex CLI" },
  ];
  const chart = section.querySelector("[data-benchmark-chart]");
  const meta = section.querySelector("[data-benchmark-meta]");
  const stamp = section.querySelector("[data-benchmark-sample]");
  const dict = (window.THANATOS_I18N && window.THANATOS_I18N.th) || {};
  const el = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  };

  function valuesOf(metric) {
    return sample ? window.THANATOS_BENCHMARK_SAMPLE[metric.id] || {} : metric.values;
  }

  function render() {
    const th = document.documentElement.lang === "th";
    const t = (key, fallback) => (th && dict[key] ? dict[key] : fallback);
    chart.textContent = "";
    for (const metric of data.metrics) {
      const values = valuesOf(metric);
      const present = TOOLS.filter((tool) => typeof values[tool.id] === "number");
      if (!present.length) continue;
      const group = el("div", "bm-metric");
      group.append(el("h3", "", th ? metric.labelTh : metric.label));
      group.append(el("p", "bm-note", th ? metric.noteTh : metric.note));

      const rows = el("div", "bm-rows");
      rows.setAttribute("role", "list");
      for (const tool of present) {
        const value = Math.max(0, Math.min(100, values[tool.id]));
        const row = el("div", `bm-row${tool.id === "thanatos" ? " is-us" : ""}`);
        row.setAttribute("role", "listitem");
        row.setAttribute("aria-label", `${tool.name}: ${value}%`);
        row.append(el("span", "bm-tool", tool.name));
        const track = el("span", "bm-track");
        const bar = el("span", "bm-bar");
        bar.style.setProperty("--bm-value", String(value));
        track.append(bar);
        row.append(track, el("span", "bm-value", `${value}%`));
        rows.append(row);
      }
      group.append(rows);

      // The headline number: THANATOS against the better of the two CLIs.
      const others = present.filter((tool) => tool.id !== "thanatos").map((tool) => values[tool.id]);
      if (typeof values.thanatos === "number" && others.length) {
        const best = metric.higherIsBetter ? Math.max(...others) : Math.min(...others);
        const points = Math.round((values.thanatos - best) * 10) / 10;
        const better = metric.higherIsBetter ? points > 0 : points < 0;
        const same = points === 0;
        const sign = points > 0 ? "+" : "−";
        const text = same
          ? t("kernel.bench.same", "Same as the best CLI")
          : `${sign}${Math.abs(points)} ${t("kernel.bench.points", "points vs. the best CLI")}`;
        group.append(el("p", `bm-delta${same ? "" : better ? " is-better" : " is-worse"}`, text));
      }
      chart.append(group);
    }

    const parts = [];
    if (sample) {
      parts.push(t("kernel.bench.sampleMeta", "Layout preview. No benchmark has been run."));
    } else {
      if (data.tasks) parts.push(`${data.tasks} ${t("kernel.bench.tasks", "tasks")}`);
      if (data.runsPerTask) parts.push(`${data.runsPerTask} ${t("kernel.bench.runs", "runs per task and tool")}`);
      if (data.models) parts.push(data.models);
      if (data.date) parts.push(data.date);
    }
    meta.textContent = parts.join(" · ");
    if (!sample && data.source) {
      const link = el("a", "", t("kernel.bench.source", "Raw results"));
      link.href = data.source;
      meta.append(" · ", link);
    }
    stamp.hidden = !sample;
  }

  render();
  section.hidden = false;
  document.addEventListener("langchange", render);

  // Bars grow from zero the first time the chart is seen.
  if (window.IntersectionObserver) {
    new IntersectionObserver(
      (entries, observer) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          chart.classList.add("is-in");
          observer.disconnect();
        }
      },
      { threshold: 0.25 },
    ).observe(chart);
  } else {
    chart.classList.add("is-in");
  }
})();
