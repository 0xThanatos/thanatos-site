const prefersReducedMotion = () =>
  window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Split into user-perceived characters so Thai vowels and tone marks stay
// attached to their consonant while typing.
const graphemes = (text) => {
  if (window.Intl && Intl.Segmenter) {
    return [...new Intl.Segmenter(undefined, { granularity: "grapheme" }).segment(text)].map((s) => s.segment);
  }
  return Array.from(text);
};

const typewriter = (() => {
  const TYPE_MS = 70;
  const DELETE_MS = 35;
  const HOLD_MS = 2000;
  const GAP_MS = 250;
  let el = null;
  let title = null;
  let timer = null;
  let words = [];
  let wordIndex = 0;
  let charCount = 0;
  let deleting = true;

  // Reserve the tallest wrap across all words so the page below never jumps.
  function reserveHeight() {
    if (!el || !title) return;
    if (words.length < 2 || prefersReducedMotion()) {
      title.style.minHeight = "";
      return;
    }
    const current = el.textContent;
    title.style.minHeight = "";
    let max = 0;
    for (const w of words) {
      el.textContent = w.join("");
      max = Math.max(max, title.offsetHeight);
    }
    el.textContent = current;
    title.style.minHeight = `${max}px`;
  }

  function tick() {
    const word = words[wordIndex];
    if (deleting) {
      charCount -= 1;
      el.textContent = word.slice(0, charCount).join("");
      if (charCount === 0) {
        deleting = false;
        wordIndex = (wordIndex + 1) % words.length;
        timer = setTimeout(tick, GAP_MS);
        return;
      }
      timer = setTimeout(tick, DELETE_MS);
      return;
    }
    charCount += 1;
    el.textContent = word.slice(0, charCount).join("");
    if (charCount === word.length) {
      deleting = true;
      timer = setTimeout(tick, HOLD_MS);
      return;
    }
    timer = setTimeout(tick, TYPE_MS);
  }

  function setWords(list) {
    if (!el) return;
    clearTimeout(timer);
    words = list.filter(Boolean).map(graphemes);
    if (!words.length) return;
    wordIndex = 0;
    charCount = words[0].length;
    deleting = true;
    el.textContent = words[0].join("");
    reserveHeight();
    if (words.length > 1 && !prefersReducedMotion()) timer = setTimeout(tick, HOLD_MS);
  }

  function init() {
    el = document.querySelector(".type-word");
    if (!el) return;
    title = el.closest("h1");
    let resizeTimer;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(reserveHeight, 150);
    });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(reserveHeight);
  }

  return { init, setWords };
})();

// ---------- TH / EN ----------
// English is the markup itself; originals are captured once so EN can be restored.
const i18n = (() => {
  const STORAGE_KEY = "thanatos-lang";
  const dict = (window.THANATOS_I18N && window.THANATOS_I18N.th) || {};
  const originals = new Map();
  let originalTitle = "";
  let originalDescription = "";
  let originalWords = "";

  const remember = (el, field, value) => {
    const entry = originals.get(el) || {};
    if (!(field in entry)) entry[field] = value;
    originals.set(el, entry);
    return entry[field];
  };

  function readSaved() {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch {
      return null;
    }
  }

  function save(lang) {
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      /* private mode or blocked storage: the choice just won't persist */
    }
  }

  function initialLang() {
    const saved = readSaved();
    if (saved === "th" || saved === "en") return saved;
    const nav = (navigator.languages && navigator.languages[0]) || navigator.language || "";
    return nav.toLowerCase().startsWith("th") ? "th" : "en";
  }

  function apply(lang) {
    const th = lang === "th";
    const pick = (key, original) => (th && key in dict ? dict[key] : original);

    document.querySelectorAll("[data-i18n]").forEach((el) => {
      el.textContent = pick(el.dataset.i18n, remember(el, "text", el.textContent));
    });
    document.querySelectorAll("[data-i18n-html]").forEach((el) => {
      el.innerHTML = pick(el.dataset.i18nHtml, remember(el, "html", el.innerHTML));
    });
    document.querySelectorAll("[data-i18n-alt]").forEach((el) => {
      el.setAttribute("alt", pick(el.dataset.i18nAlt, remember(el, "alt", el.getAttribute("alt") || "")));
    });
    document.querySelectorAll("[data-i18n-aria]").forEach((el) => {
      el.setAttribute("aria-label", pick(el.dataset.i18nAria, remember(el, "aria", el.getAttribute("aria-label") || "")));
    });

    // Each page names its own title/description keys (`<html data-i18n-meta>`);
    // the landing page uses "meta".
    const metaKey = document.documentElement.dataset.i18nMeta || "meta";
    const meta = document.querySelector('meta[name="description"]');
    if (!originalTitle) originalTitle = document.title;
    if (meta && !originalDescription) originalDescription = meta.getAttribute("content");
    document.title = pick(`${metaKey}.title`, originalTitle);
    if (meta) meta.setAttribute("content", pick(`${metaKey}.description`, originalDescription));

    document.documentElement.lang = lang;
    document.querySelectorAll(".lang-switch [data-lang]").forEach((btn) => {
      btn.setAttribute("aria-pressed", String(btn.dataset.lang === lang));
    });

    document.dispatchEvent(new CustomEvent("langchange", { detail: { lang } }));

    const wordEl = document.querySelector("[data-i18n-words]");
    if (wordEl) {
      if (!originalWords) originalWords = wordEl.dataset.words || "";
      typewriter.setWords(pick(wordEl.dataset.i18nWords, originalWords).split("|"));
    }
  }

  function init() {
    apply(initialLang());
    document.querySelectorAll(".lang-switch [data-lang]").forEach((btn) => {
      btn.addEventListener("click", () => {
        save(btn.dataset.lang);
        apply(btn.dataset.lang);
      });
    });
  }

  return { init };
})();

function initCurrentYear() {
  const year = String(new Date().getFullYear());
  document.querySelectorAll("[data-current-year]").forEach((el) => { el.textContent = year; });
}

function initMobileNav() {
  const toggle = document.querySelector(".nav-toggle");
  const links = document.querySelector(".nav-links");
  if (!toggle || !links) return;

  const setOpen = (open, returnFocus = false) => {
    links.classList.toggle("nav-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    if (!open && returnFocus) toggle.focus();
  };

  toggle.addEventListener("click", () => setOpen(toggle.getAttribute("aria-expanded") !== "true"));
  links.addEventListener("click", (event) => {
    if (event.target.closest("a")) setOpen(false);
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") setOpen(false, true);
  });
  window.addEventListener("resize", () => {
    if (window.innerWidth > 560) setOpen(false);
  });
}

function initScrollSpy() {
  const sections = ["why-not-cli", "features", "compare", "architecture"].map((id) => document.getElementById(id));
  const links = document.querySelectorAll(".nav-links a[href^='#']");
  if (!window.IntersectionObserver) return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      links.forEach((l) => l.classList.toggle("nav-active", l.getAttribute("href") === `#${entry.target.id}`));
    });
  }, { rootMargin: "-50% 0px -50% 0px" });
  sections.forEach((s) => s && observer.observe(s));
}

function initScrollReveal() {
  const targets = document.querySelectorAll(".reveal");
  if (!window.IntersectionObserver) {
    targets.forEach((t) => t.classList.add("reveal-in"));
    return;
  }
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("reveal-in");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  targets.forEach((t) => observer.observe(t));
}

// The script sits at the end of <body>, so the DOM is ready: apply the
// language immediately to avoid an English flash for Thai visitors.
for (const init of [initCurrentYear, typewriter.init, i18n.init, initMobileNav, initScrollSpy, initScrollReveal]) {
  try {
    init();
  } catch (e) {
    console.error("init failed:", e);
  }
}
