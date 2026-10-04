// The Mission lifecycle diagram: six stages that play in a loop, like the
// "How a prompt flows" diagram on the landing page, but each stage can be
// selected to stop the loop and read it. Works as a keyboard tab list.
(() => {
  const root = document.querySelector("[data-kernel-diagram]");
  if (!root) return;

  const tabs = [...root.querySelectorAll(".k-node")];
  const wires = [...root.querySelectorAll(".k-wire")];
  const panels = [...root.querySelectorAll(".k-panel")];
  const tables = [...root.querySelectorAll(".k-table")];
  const track = root.querySelector(".k-track");
  const playButton = root.querySelector("[data-kernel-play]");
  const playLabel = root.querySelector("[data-kernel-play-label]");
  const bar = root.querySelector(".k-progress i");

  const reducedMotion =
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const stepMs =
    parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--k-step")) || 4200;

  let index = 0;
  let playing = !reducedMotion; // what the visitor asked for
  let hovering = false; // pointer or focus is on the track
  let visible = true; // the diagram is on screen
  let timer = null;

  function show(next, focus) {
    index = (next + tabs.length) % tabs.length;
    const writes = (tabs[index].dataset.writes || "").split(" ");
    tabs.forEach((tab, i) => {
      const active = i === index;
      tab.classList.toggle("is-active", active);
      tab.classList.toggle("is-done", i < index);
      tab.setAttribute("aria-selected", String(active));
      tab.tabIndex = active ? 0 : -1;
      panels[i].hidden = !active;
    });
    wires.forEach((wire, i) => {
      wire.classList.toggle("is-done", i < index);
      wire.classList.toggle("is-flowing", i === index);
    });
    tables.forEach((table) => table.classList.toggle("is-writing", writes.includes(table.dataset.table)));
    if (focus) tabs[index].focus();
  }

  // Restart the CSS animations that are timed to one stage.
  function restartAnimations() {
    for (const el of [bar, ...wires.map((wire) => wire.firstElementChild)]) {
      if (!el) continue;
      el.style.animation = "none";
      void el.offsetWidth;
      el.style.animation = "";
    }
  }

  function schedule() {
    clearTimeout(timer);
    const running = playing && visible && !hovering;
    root.classList.toggle("is-playing", running);
    restartAnimations();
    if (running) {
      timer = setTimeout(() => {
        show(index + 1);
        schedule();
      }, stepMs);
    }
  }

  function setLabel() {
    const th = document.documentElement.lang === "th";
    const dict = (window.THANATOS_I18N && window.THANATOS_I18N.th) || {};
    const key = playing ? "pause" : "play";
    const translated = dict[playLabel.dataset[key === "pause" ? "i18nPause" : "i18nPlay"]];
    playLabel.textContent = th && translated ? translated : playLabel.dataset[key];
    playButton.setAttribute("aria-pressed", String(playing));
  }

  function select(next, focus) {
    playing = false; // choosing a stage stops the loop until Play is pressed
    show(next, focus);
    setLabel();
    schedule();
  }

  tabs.forEach((tab, i) => {
    tab.addEventListener("click", () => select(i, false));
    tab.addEventListener("keydown", (event) => {
      const moves = { ArrowRight: i + 1, ArrowDown: i + 1, ArrowLeft: i - 1, ArrowUp: i - 1, Home: 0, End: tabs.length - 1 };
      if (!(event.key in moves)) return;
      event.preventDefault();
      select(moves[event.key], true);
    });
  });

  // Resting the pointer on a stage holds the loop there without stopping it.
  const hold = (value) => () => {
    hovering = value;
    schedule();
  };
  track.addEventListener("pointerenter", hold(true));
  track.addEventListener("pointerleave", hold(false));

  playButton.addEventListener("click", () => {
    playing = !playing;
    if (playing && index === tabs.length - 1) show(0);
    setLabel();
    schedule();
  });

  if (window.IntersectionObserver) {
    new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        schedule();
      },
      { threshold: 0.2 },
    ).observe(root);
  }
  document.addEventListener("langchange", setLabel);

  show(0);
  setLabel();
  schedule();
})();
