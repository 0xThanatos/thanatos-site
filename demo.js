// Looping hero demo: a scripted replay of a THANATOS chat. Every block mirrors
// a real component — GoalBlock (Mission Goal), BoardBlock (Task board),
// QuestionBlock + QuestionComposer (the question panel takes the composer's
// place and the answer is sent as a normal message), SignalBlock ("Waiting for
// you" / "Mission complete"), WorkerReviewBlock, ReportBlock, PermissionModal,
// the "Enable full access" confirm, the Web tool panel, and the Review Gate
// commit modal, then the Backend Handoff modal and its in-chat receipt once
// Claude's session window is nearly used. Behaviour follows sidecar makeCanUseTool: Safe mode
// auto-approves Write/Edit, shell commands prompt, Full access skips prompts,
// and Review Gate still pauses `git commit`. Thai copy: i18n.js "demo.*".
(() => {
  const root = document.querySelector(".demo");
  const wrap = root && root.closest(".hero-shot-wrap");
  const captionBox = document.querySelector(".demo-caption");
  if (!root || !wrap || !captionBox) return;
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const EN = {
    prompt1: "Build a pricing page for demo-shop as preview/pricing.html and show it next to the chat.",
    agentPlan: "Here's the plan. One question before I start.",
    goalObjective: "Ship a pricing page for demo-shop with a live preview",
    goal1: "pricing.html with the chosen plans",
    goal1e: "preview/pricing.html",
    goal2: "Preview opens beside the chat",
    goal2e: "Web panel · live reload",
    goal3: "Formatted and committed",
    goal3e: "3f2a91c",
    task1: "Lay out the page",
    task2: "Build the plan cards",
    task3: "Format with Prettier",
    task4: "Commit behind Review Gate",
    question: "Which plans should the pricing page show?",
    opt1: "Free and Pro",
    opt1d: "Two plans, monthly price only.",
    opt2: "Free, Pro and Team",
    opt2d: "Three plans, with Team for companies.",
    opt3: "Pro only",
    opt3d: "A single plan with a free trial.",
    agentBuild: "Thanks — three plans. Building the page now.",
    reviewNote: "Matches the spec: three plans render and the preview reloads on every edit.",
    agentFormat: "Page is up. Formatting it before I commit.",
    agentPage: "Formatted. Anything you'd like to change?",
    prompt2: "Make Pro the highlighted plan.",
    agentDone: "Done — Pro is highlighted. Committing the change.",
    reportTitle: "Summary",
    report1: "Built preview/pricing.html with Free, Pro and Team",
    report2: "Highlighted Pro as the most popular plan",
    report3: "Formatted with Prettier and committed 3f2a91c",
    bypassText: "Enabling Full access lets the agent do everything",
    bypassSub: "Including shell commands, git operations, file deletes, and network access — with no confirmation.",
    bypassTip: "Tip: use Safe mode for everyday file read/write. Turn on Full access only when you need to run commands.",
    c1: "Ask in plain words",
    c2: "It sets a goal and a board, then asks before guessing",
    c3: "Safe mode edits files — the page updates live",
    c4: "Shell commands ask for approval…",
    c5: "…or confirm Full access to let them run",
    c6: "Review Gate holds the commit — then a summary",
    c7: "Claude's limit is nearly used — hand off to Codex",
    c8: "Codex picks up the same chat and finishes the job",
    prompt3: "Add Stripe checkout to the Upgrade buttons and run a test payment.",
    agentPay: "Picked up the handoff brief. Wiring Stripe Checkout into Pro and Team.",
    ptask1: "Add the /api/checkout endpoint",
    ptask2: "Open Checkout from Upgrade",
    ptask3: "Run a test payment",
    ptask4: "Show the success state",
    preport1: "Added /api/checkout with Stripe test keys",
    preport2: "Upgrade opens Checkout for Pro and Team",
    preport3: "A $19 test payment went through end to end",
    pgoalObjective: "Take payments for Pro and Team with Stripe Checkout",
    pgoal1: "Checkout endpoint with Stripe test keys",
    pgoal1e: "POST /api/checkout",
    pgoal2: "Upgrade opens Checkout",
    pgoal2e: "Pro + Team buttons",
    pgoal3: "A test payment succeeds",
    pgoal3e: "pi_3Q… · $19 paid",
    pgoal4: "Send the receipt email",
    pgoal4e: "receipt.sent",
    agentRecheck: "Recheck: the receipt email isn't sent yet. Adding it now.",
    c9: "The goal recheck catches an unfinished item",
    c10: "Limit hit — Auto-continue counts down, then resumes",
  };

  const ICON = {
    target: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none"/></svg>',
    list: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M9 6h11M9 12h11M9 18h11"/><circle cx="4.5" cy="6" r="1"/><circle cx="4.5" cy="12" r="1"/><circle cx="4.5" cy="18" r="1"/></svg>',
    help: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 113.5 2.3c-.8.4-1 .9-1 1.7v.4"/><circle cx="12" cy="17" r="0.6" fill="currentColor" stroke="none"/></svg>',
    pause: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="7" y="5" width="3.5" height="14" rx="1"/><rect x="14" y="5" width="3.5" height="14" rx="1"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg>',
    checkCircle: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M8.5 12l2.5 2.5 4.5-5"/></svg>',
    warn: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3l9.5 17H2.5L12 3z" stroke-linejoin="round"/><line x1="12" y1="10" x2="12" y2="14"/><circle cx="12" cy="17" r="0.6" fill="currentColor" stroke="none"/></svg>',
    copy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 012-2h10"/></svg>',
  };
  const STATUS = { pending: "○", in_progress: "◉", completed: "●" };

  const $ = (sel) => root.querySelector(sel);
  const stage = $(".demo-stage");
  const thread = $(".d-thread");
  const greet = $(".d-greet");
  // Same buckets as ChatWelcome.vue, from the visitor's clock.
  const greeting = () => {
    const h = new Date().getHours();
    return h >= 5 && h < 11 ? "Good morning." : h >= 11 && h < 17 ? "Good afternoon." : "Good evening.";
  };
  const typed = $(".d-typed");
  const cursor = $(".d-cursor");
  const caption = captionBox.querySelector(".d-caption-text");
  const stepNum = captionBox.querySelector(".d-step");
  const toast = $(".d-toast");
  const page = $(".d-page");
  const chatTitle = $(".d-chat-title");
  const qc = $(".d-qc");
  const permModal = $('[data-modal="perm"]');
  const bypassModal = $('[data-modal="bypass"]');
  const gateModal = $('[data-modal="gate"]');
  const handoffModal = $('[data-modal="handoff"]');
  const handoffBtn = $("[data-handoff]");
  const hoSelect = $(".d-ho-select");
  const hoGo = $(".d-ho-go");
  const modelText = $(".d-model-text");
  const tip = $(".d-rtip");
  const ringSession = $('[data-ring="session"]');
  const ringWeekly = $('[data-ring="weekly"]');
  const resetBar = $(".d-vbar i");
  const fullSwitch = $('[data-toggle="full"]');
  const fullLabel = fullSwitch.querySelector(".d-switch-label");
  const sendBtn = $(".d-send");

  let lang = document.documentElement.lang === "th" ? "th" : "en";
  const t = (key) => {
    const th = window.THANATOS_I18N && window.THANATOS_I18N.th;
    return lang === "th" && th && th[`demo.${key}`] ? th[`demo.${key}`] : EN[key];
  };
  const graphemes = (text) =>
    window.Intl && Intl.Segmenter
      ? [...new Intl.Segmenter(undefined, { granularity: "grapheme" }).segment(text)].map((s) => s.segment)
      : Array.from(text);
  const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");

  // ---------- scaling: fixed canvas (1000×640, 640×640 on phones) ----------
  let scale = 1;
  const fit = () => {
    const stageW = parseFloat(getComputedStyle(root).getPropertyValue("--stage-w")) || 1000;
    scale = root.clientWidth / stageW || 1;
    root.style.setProperty("--demo-scale", String(scale));
    captionBox.parentElement.style.setProperty("--demo-scale", String(scale));
  };
  new ResizeObserver(fit).observe(root);

  // ---------- pause-aware timing ----------
  let run = 0;
  let visible = true;
  const isPaused = () => !visible || document.hidden;
  const wait = (ms, id) =>
    new Promise((resolve, reject) => {
      let left = ms;
      const step = () => {
        if (id !== run) return reject(new Error("cancel"));
        if (left <= 0) return resolve();
        if (!isPaused()) left -= 50;
        setTimeout(step, 50);
      };
      step();
    });

  // ---------- helpers ----------
  const posOf = (el) => {
    const s = stage.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    return { x: (r.left - s.left + r.width / 2) / scale, y: (r.top - s.top + r.height / 2) / scale };
  };
  const moveTo = async (el, id, ms = 650) => {
    const p = posOf(el);
    cursor.style.transitionDuration = `${ms}ms`;
    cursor.style.transform = `translate(${p.x}px, ${p.y}px)`;
    await wait(ms + 80, id);
  };
  const click = async (el, id) => {
    await moveTo(el, id);
    cursor.classList.add("press");
    el.classList.add("d-pressed");
    await wait(160, id);
    cursor.classList.remove("press");
    el.classList.remove("d-pressed");
  };
  const setCaption = async (n, text, id) => {
    captionBox.classList.remove("show");
    await wait(180, id);
    stepNum.textContent = String(n);
    caption.textContent = text;
    captionBox.classList.add("show");
  };
  const scrollThread = () => {
    thread.scrollTop = thread.scrollHeight;
  };
  const html = (s) => {
    const tpl = document.createElement("template");
    tpl.innerHTML = s.trim();
    return tpl.content.firstElementChild;
  };
  const add = (s, parent = thread) => {
    const el = html(s);
    parent.appendChild(el);
    requestAnimationFrame(() => el.classList.add("in"));
    scrollThread();
    return el;
  };
  const typeInto = async (text, id) => {
    root.classList.add("typing");
    typed.textContent = "";
    for (const g of graphemes(text)) {
      typed.textContent += g;
      await wait(lang === "th" ? 34 : 26, id);
    }
  };
  const userMsg = (text) => {
    // First message: the welcome fades and the composer glides down (composerHero off).
    if (root.classList.contains("hero")) {
      root.classList.remove("hero");
      chatTitle.textContent = text;
      handoffBtn.classList.remove("dim");
    }
    add(`<div class="d-msg d-user">${esc(text)}</div>`);
  };
  const send = async (id) => {
    await click(sendBtn, id);
    const text = typed.textContent;
    typed.textContent = "";
    root.classList.remove("typing");
    userMsg(text);
    await wait(450, id);
  };

  // Agent turn: header + Thought process + tools row + streamed reply; blocks
  // (goal, board, question, review, report, signal) are appended inside it.
  let clock = 14;
  let agentModel = "Sonnet 5";
  const agent = async (text, id) => {
    clock += 1;
    const card = add(`<div class="d-msg d-agent">
        <div class="d-agent-head"><span class="d-avatar"></span><b>MAIN AGENT</b><em>${agentModel}</em><span class="d-time">03/10/2026 02:${String(clock).padStart(2, "0")}</span></div>
        <div class="d-row d-thought"><span class="d-chev">▸</span><span class="d-dotc"></span><b>Thought process</b><i>click to reveal reasoning</i></div>
        <div class="d-row d-tools" hidden><span class="d-wrench"></span><span class="d-tools-text"></span></div>
        <p class="d-think">Thinking…</p>
      </div>`);
    await wait(550, id);
    const p = card.querySelector("p");
    p.className = "";
    p.textContent = "";
    const words = lang === "th" ? graphemes(text) : text.split(/(\s+)/);
    for (const w of words) {
      p.textContent += w;
      scrollThread();
      await wait(lang === "th" ? 15 : 36, id);
    }
    return card;
  };
  const setTools = (card, names) => {
    const row = card.querySelector(".d-tools");
    row.hidden = false;
    row.querySelector(".d-tools-text").textContent = `${names.length} tool${names.length > 1 ? "s" : ""} · ${names.join(", ")}`;
    scrollThread();
  };
  const block = (card, s) => add(s, card);
  const complete = (card, cost, secs) => {
    const meta = html(`<div class="d-meta"><span class="d-done">✓ Completed</span><span>$${cost}</span><span>${secs}s</span></div>`);
    card.after(meta);
    requestAnimationFrame(() => meta.classList.add("in"));
    scrollThread();
  };
  // TurnFooter for a turn that ended on an error (here: the provider's usage limit).
  const failed = (card, cost, secs, error) => {
    const meta = html(`<div class="d-meta"><span class="d-fail">✕ Failed</span><span>$${cost}</span><span>${secs}s</span></div>`);
    const err = html(`<div class="d-errbox">${esc(error)}</div>`);
    card.after(meta, err);
    requestAnimationFrame(() => [meta, err].forEach((el) => el.classList.add("in")));
    scrollThread();
  };
  const signal = (card, variant) => {
    const COPY = {
      await: ["Waiting for you", "Paused — the agent needs an operator decision to continue."],
      complete: ["Mission complete", "All work is finished — the follow-up watchdog has stopped."],
      recheck: ["Recheck required", "Required Mission Contract items are still outstanding or blocked."],
    };
    const copy = COPY[variant];
    const icon = variant === "await" ? ICON.pause : variant === "recheck" ? ICON.warn : ICON.check;
    return block(card, `<div class="d-signal ${variant}"><span class="d-sig-ic">${icon}</span><span class="d-sig-txt"><b>${copy[0]}</b><small>${copy[1]}</small></span>${variant === "complete" ? `<span class="d-sig-check">${ICON.checkCircle}</span>` : '<span class="d-sig-pulse"></span>'}</div>`);
  };

  let goalEl;
  let boardEl;
  const goalRow = (n, key, status) =>
    `<tr class="${status}"><td><span class="d-cbx"></span>${n}</td><td>${esc(t(key))}</td><td class="d-ev">${status === "done" ? esc(t(`${key}e`)) : "—"}</td></tr>`;
  // GoalBlock: one row per contract item; done rows show their evidence.
  const goalHtml = (objectiveKey) => `<div class="d-goal"><div class="d-goal-head">${ICON.target}<span>Mission Goal</span></div>
        <div class="d-goal-body"><strong>${esc(t(objectiveKey))}</strong>
        <table><thead><tr><th>ลำดับ</th><th>หัวข้อ</th><th>ผลลัพธ์</th></tr></thead><tbody></tbody></table></div></div>`;
  const renderGoal = (statuses, el = goalEl, prefix = "goal") => {
    el.querySelector("tbody").innerHTML = statuses.map((st, i) => goalRow(i + 1, `${prefix}${i + 1}`, st)).join("");
  };
  const renderBoard = (statuses, el = boardEl, prefix = "task") => {
    const counts = statuses.reduce((a, s) => ((a[s] = (a[s] || 0) + 1), a), {});
    el.querySelector(".d-board-chips").innerHTML = ["in_progress", "completed"]
      .filter((k) => counts[k])
      .map((k) => `<span class="st-${k}">${STATUS[k]} ${counts[k]}</span>`)
      .join("");
    el.querySelector("ul").innerHTML = statuses
      .map((s, i) => `<li class="st-${s}"><span class="d-bi">${STATUS[s]}</span>${esc(t(`${prefix}${i + 1}`))}</li>`)
      .join("");
  };

  const boardHtml = '<div class="d-board"><div class="d-board-sum"><span class="d-chev open">▸</span>' + ICON.list + '<b>Task board</b><small>4 items</small><span class="d-board-chips"></span></div><ul></ul></div>';

  // Rail usage cluster — IconRail.vue colours the Session ring warning ≥60%, danger ≥85%.
  const setRing = (el, pct, gauge) => {
    el.style.setProperty("--p", String(pct / 100));
    el.querySelector("b").textContent = String(pct);
    el.classList.toggle("full", pct >= 100);
    if (gauge) {
      el.classList.toggle("warn", pct >= 60 && pct < 85);
      el.classList.toggle("danger", pct >= 85);
    }
  };
  const setUsage = (session, weekly, reset) => {
    setRing(ringSession, session, true);
    setRing(ringWeekly, weekly, false);
    resetBar.style.setProperty("--h", `${reset}%`);
  };
  const showTip = (el, text) => {
    const p = posOf(el);
    tip.textContent = text;
    tip.style.left = `${p.x + el.offsetWidth / 2 + 10}px`;
    tip.style.top = `${p.y}px`;
    tip.classList.add("show");
  };

  // Backend Handoff modal state: model select + effort radio + summary line.
  const setHandoff = (model, effort) => {
    $(".d-ho-value").textContent = model;
    hoSelect.querySelectorAll(".d-ho-menu span").forEach((o) => o.classList.toggle("on", o.textContent === model));
    handoffModal.querySelectorAll("[data-effort]").forEach((o) => o.classList.toggle("on", o.dataset.effort === effort));
    const summary = $(".d-ho-summary");
    summary.textContent = `Codex · ${model} · ${effort.toUpperCase()}`;
    summary.classList.remove("bump");
    void summary.offsetWidth;
    summary.classList.add("bump");
  };
  const receipt = () =>
    add(`<div class="d-receipt"><div class="d-rc-alert"><b>Switched backend</b><small>new session</small></div>
        <div class="d-rc-route"><div class="src"><small>Stopped</small><b><i></i>Claude</b><span>Sonnet 5</span></div><div class="d-rc-arrow">→</div>
        <div class="tgt"><small>Continuing with</small><b><i></i>Codex</b><span><strong>GPT-5.6 Sol</strong> · high effort</span></div></div>
        <div class="d-rc-foot"><span>✓ Same working directory</span><span>✓ Task board</span><span>8 recent messages transferred</span></div>
        <div class="d-rc-ctx"><b>View handoff context</b><span>What the new agent received</span><em>4 sections</em></div></div>`);

  // ---------- the script ----------
  const reset = () => {
    thread.innerHTML = "";
    typed.textContent = "";
    chatTitle.textContent = "Untitled chat";
    greet.textContent = greeting();
    root.classList.add("hero");
    clock = 14;
    root.classList.remove("typing", "panel-open", "asking");
    fullSwitch.classList.remove("on");
    fullLabel.textContent = fullLabel.dataset.off;
    [permModal, bypassModal, gateModal, handoffModal].forEach((m) => m.classList.remove("show"));
    agentModel = "Sonnet 5";
    modelText.textContent = "CLAUDE · Sonnet 5 · MEDIUM";
    handoffBtn.classList.add("dim");
    hoSelect.classList.remove("open");
    hoGo.classList.remove("busy");
    $(".d-ho-go-text").textContent = "Continue with Codex";
    setHandoff("GPT-5.6 Terra", "medium");
    tip.classList.remove("show");
    root.classList.remove("limited");
    setUsage(72, 41, 55);
    qc.querySelectorAll(".d-qc-opt").forEach((o) => o.classList.remove("on"));
    toast.classList.remove("show");
    page.className = "d-page";
    captionBox.classList.remove("show");
    root.querySelectorAll("[data-demo]").forEach((el) => {
      el.textContent = t(el.dataset.demo);
    });
    cursor.style.transitionDuration = "0ms";
    cursor.style.transform = "translate(700px, 540px)";
  };

  async function play(id) {
    reset();
    await wait(500, id);

    // 1. prompt
    await setCaption(1, t("c1"), id);
    await moveTo($(".d-input"), id, 500);
    await typeInto(t("prompt1"), id);
    await wait(200, id);
    await send(id);

    // 2. goal + board + question (answered in the composer panel)
    const plan = await agent(t("agentPlan"), id);
    await setCaption(2, t("c2"), id);
    setTools(plan, ["set_goal", "board-set_tasks", "ask_user"]);
    goalEl = block(plan, goalHtml("goalObjective"));
    renderGoal(["", "", ""]);
    await wait(700, id);
    boardEl = block(plan, boardHtml);
    renderBoard(["pending", "pending", "pending", "pending"]);
    await wait(700, id);
    const qBlock = block(plan, `<div class="d-qblock"><div class="d-qb-head">${ICON.help}<span>Question for you</span><em>Answer in the composer ↓</em></div>
        <div class="d-qb-body"><p>${esc(t("question"))}</p><ul><li><b>${esc(t("opt1"))}</b><small>${esc(t("opt1d"))}</small></li><li><b>${esc(t("opt2"))}</b><small>${esc(t("opt2d"))}</small></li><li><b>${esc(t("opt3"))}</b><small>${esc(t("opt3d"))}</small></li></ul><div class="d-qb-meta">Free text allowed</div></div></div>`);
    const waiting = signal(plan, "await");
    root.classList.add("asking");
    await wait(900, id);
    const pick = qc.querySelector(".pick");
    await click(pick, id);
    pick.classList.add("on");
    await wait(350, id);
    await click(qc.querySelector(".d-btn"), id);
    root.classList.remove("asking");
    qBlock.querySelector(".d-qb-head em").textContent = "✓ Answered";
    qBlock.classList.add("answered");
    waiting.remove();
    complete(plan, "0.04", "5.2");
    userMsg(t("opt2"));
    await wait(400, id);

    // 3. Safe mode builds the page; the web panel live-reloads
    const build = await agent(t("agentBuild"), id);
    await setCaption(3, t("c3"), id);
    setTools(build, ["Write"]);
    renderBoard(["in_progress", "pending", "pending", "pending"]);
    root.classList.add("panel-open");
    await wait(450, id);
    page.classList.add("p1");
    const edits = ["p2", "p3", "p4", "p5"];
    for (let i = 0; i < edits.length; i++) {
      await wait(450, id);
      setTools(build, ["Write", ...Array(i + 1).fill("Edit")]);
      page.classList.add(edits[i], "flash");
      if (i === 1) renderBoard(["completed", "in_progress", "pending", "pending"]);
      await wait(200, id);
      page.classList.remove("flash");
    }
    renderBoard(["completed", "completed", "pending", "pending"]);
    renderGoal(["done", "done", ""]);
    block(build, `<div class="d-review accept"><div class="d-review-head">${ICON.check}<span>Worker review</span><em>Accepted</em></div><div class="d-review-body"><code>01a0fe08-8891</code><span>${esc(t("reviewNote"))}</span></div></div>`);
    complete(build, "0.21", "18.4");
    setUsage(80, 44, 62);
    await wait(500, id);

    // 4. a shell command needs approval
    const fmt = await agent(t("agentFormat"), id);
    setTools(fmt, ["Bash"]);
    renderBoard(["completed", "completed", "in_progress", "pending"]);
    await setCaption(4, t("c4"), id);
    permModal.classList.add("show");
    await wait(1000, id);
    await click(permModal.querySelector(".d-allow"), id);
    permModal.classList.remove("show");
    await wait(300, id);

    // 5. Full access via the confirm modal
    await setCaption(5, t("c5"), id);
    await click(fullSwitch, id);
    bypassModal.classList.add("show");
    await wait(1400, id);
    await click(bypassModal.querySelector(".d-confirm"), id);
    bypassModal.classList.remove("show");
    fullSwitch.classList.add("on");
    fullLabel.textContent = fullLabel.dataset.on;
    setTools(fmt, ["Bash", "Bash"]);
    renderBoard(["completed", "completed", "completed", "pending"]);
    await wait(400, id);
    complete(fmt, "0.05", "7.9");
    setUsage(88, 46, 70);
    const ask2 = await agent(t("agentPage"), id);
    complete(ask2, "0.01", "2.0");
    await moveTo($(".d-input"), id, 600);
    await typeInto(t("prompt2"), id);
    await wait(150, id);
    await send(id);
    const done = await agent(t("agentDone"), id);
    setTools(done, ["Edit"]);
    page.classList.add("p6", "flash");
    await wait(250, id);
    page.classList.remove("flash");
    await wait(400, id);
    setTools(done, ["Edit", "Bash"]);
    renderBoard(["completed", "completed", "completed", "in_progress"]);

    // 6. Review Gate holds the commit, then the summary
    await setCaption(6, t("c6"), id);
    gateModal.classList.add("show");
    await wait(1600, id);
    await click(gateModal.querySelector(".d-allow"), id);
    gateModal.classList.remove("show");
    renderBoard(["completed", "completed", "completed", "completed"]);
    renderGoal(["done", "done", "done"]);
    // The agent re-emits the contract with evidence before claiming completion;
    // every item is done, so the claim stands ("Mission complete").
    renderGoal(["done", "done", "done"], block(done, goalHtml("goalObjective")));
    await wait(700, id);
    block(done, `<div class="d-report"><div class="d-report-head"><span class="d-report-chip">Report</span><b>${esc(t("reportTitle"))}</b><span class="d-copy">${ICON.copy}Copy markdown</span></div>
        <ul><li>${esc(t("report1"))}</li><li>${esc(t("report2"))}</li><li>${esc(t("report3"))}</li></ul></div>`);
    await wait(500, id);
    signal(done, "complete");
    complete(done, "0.06", "9.1");
    setUsage(94, 48, 78);
    await wait(1400, id);

    // 7. Claude's session window is nearly used: hand off to Codex
    await setCaption(7, t("c7"), id);
    if (ringSession.offsetParent) {
      // The rail is hidden on phones; skip the hover there.
      await moveTo(ringSession, id, 700);
      showTip(ringSession, "Session usage · 94%");
      await wait(1300, id);
      tip.classList.remove("show");
    }
    await click(handoffBtn, id);
    handoffModal.classList.add("show");
    await wait(1100, id);
    await click(hoSelect, id);
    hoSelect.classList.add("open");
    await wait(500, id);
    const sol = [...hoSelect.querySelectorAll(".d-ho-menu span")].find((o) => o.textContent === "GPT-5.6 Sol");
    await click(sol, id);
    hoSelect.classList.remove("open");
    setHandoff("GPT-5.6 Sol", "medium");
    await wait(450, id);
    await click(handoffModal.querySelector('[data-effort="high"]'), id);
    setHandoff("GPT-5.6 Sol", "high");
    await wait(700, id);
    await click(hoGo, id);
    hoGo.classList.add("busy");
    $(".d-ho-go-text").textContent = "Starting…";
    await wait(700, id);
    handoffModal.classList.remove("show");

    // 8. Codex continues the same chat: payment flow to completion
    agentModel = "GPT-5.6 Sol";
    modelText.textContent = "CODEX · GPT-5.6 Sol · HIGH";
    setUsage(71, 58, 64);
    receipt();
    scrollThread();
    await setCaption(8, t("c8"), id);
    await wait(1200, id);
    await moveTo($(".d-input"), id, 600);
    await typeInto(t("prompt3"), id);
    await wait(150, id);
    await send(id);
    const pay = await agent(t("agentPay"), id);
    setTools(pay, ["set_goal", "board-set_tasks"]);
    const payGoal = block(pay, goalHtml("pgoalObjective"));
    renderGoal(["", "", "", ""], payGoal, "pgoal");
    await wait(600, id);
    const payBoard = block(pay, boardHtml);
    renderBoard(["in_progress", "pending", "pending", "pending"], payBoard, "ptask");
    await wait(700, id);
    setTools(pay, ["set_goal", "board-set_tasks", "Write"]);
    await wait(500, id);
    setTools(pay, ["set_goal", "board-set_tasks", "Write", "Edit"]);
    renderBoard(["completed", "in_progress", "pending", "pending"], payBoard, "ptask");
    renderGoal(["done", "", "", ""], payGoal, "pgoal");
    page.classList.add("p7", "flash");
    await wait(250, id);
    page.classList.remove("flash");
    setUsage(80, 60, 70);
    await wait(900, id);
    setTools(pay, ["set_goal", "board-set_tasks", "Write", "Edit", "Bash"]);
    renderBoard(["completed", "completed", "in_progress", "pending"], payBoard, "ptask");
    renderGoal(["done", "done", "", ""], payGoal, "pgoal");
    await wait(900, id);
    page.classList.add("p8", "flash");
    await wait(250, id);
    page.classList.remove("flash");
    renderBoard(["completed", "completed", "completed", "completed"], payBoard, "ptask");
    setUsage(88, 62, 76);
    block(pay, `<div class="d-report"><div class="d-report-head"><span class="d-report-chip">Report</span><b>${esc(t("reportTitle"))}</b><span class="d-copy">${ICON.copy}Copy markdown</span></div>
        <ul><li>${esc(t("preport1"))}</li><li>${esc(t("preport2"))}</li><li>${esc(t("preport3"))}</li></ul></div>`);
    await wait(700, id);

    // 9. The completion claim is rechecked against the Mission Contract: the
    //    receipt email has no evidence, so the app rejects it and injects
    //    [MISSION RECHECK] as an Auto turn (maybeRecheckMissionCompletion).
    await setCaption(9, t("c9"), id);
    renderGoal(["done", "done", "done", "in_progress"], block(pay, goalHtml("pgoalObjective")), "pgoal");
    await wait(900, id);
    signal(pay, "recheck");
    complete(pay, "0.11", "24.3");
    await wait(1400, id);
    add(`<div class="d-msg d-user d-auto"><span class="d-auto-chip">Auto</span><div>[MISSION RECHECK] Your completion claim was rejected — required Mission Contract items are not yet done with evidence:<br>- [in_progress] receipt-email: ${esc(t("pgoal4"))}</div></div>`);
    scrollThread();
    await wait(1500, id);
    const fix = await agent(t("agentRecheck"), id);
    setTools(fix, ["Edit"]);
    setUsage(96, 63, 84);
    await wait(800, id);
    setTools(fix, ["Edit", "Bash"]);
    await wait(700, id);

    // 10. Codex's session window runs out mid-turn: the turn fails with the
    //     provider's limit error and LimitRecoveryBanner counts down to resume.
    const resume = new Date(Date.now() + 5 * 60000);
    const at = resume.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
    setUsage(100, 64, 100);
    failed(fix, "0.03", "6.2", `You've hit your usage limit. Try again at ${at}.`);
    await setCaption(10, t("c10"), id);
    root.classList.add("limited");
    scrollThread();
    const count = $(".d-limit-count");
    for (let left = 299; left > 292; left--) {
      count.textContent = `Resumes in ${Math.floor(left / 60)}:${String(left % 60).padStart(2, "0")}`;
      await wait(1000, id);
    }
    root.classList.add("fade");
    await wait(600, id);
    root.classList.remove("fade");
  }

  async function loop() {
    const id = ++run;
    try {
      for (;;) await play(id);
    } catch {
      /* cancelled by a restart */
    }
  }

  new IntersectionObserver((entries) => {
    visible = entries.some((e) => e.isIntersecting);
  }).observe(root);

  document.addEventListener("langchange", (e) => {
    lang = e.detail && e.detail.lang === "th" ? "th" : "en";
    loop();
  });

  wrap.classList.add("demo-on");
  captionBox.classList.add("on");
  captionBox.parentElement.classList.add("demo-on");
  fit();
  loop();
})();
