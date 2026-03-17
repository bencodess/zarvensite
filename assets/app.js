(() => {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const MSG = {
    de: { copied: "Kopiert.", copyFail: "Konnte nicht kopieren.", mailOpen: "E-Mail-Entwurf geöffnet.", de: "Deutsch", en: "English" },
    en: { copied: "Copied.", copyFail: "Could not copy.", mailOpen: "Email draft opened.", de: "Deutsch", en: "English" },
  };
  let currentLang = "de";

  const toastEl = $("#toast");
  let toastTimer = null;
  function toast(message) {
    if (!toastEl) return;
    toastEl.textContent = message;
    toastEl.classList.add("show");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toastEl.classList.remove("show"), 1800);
  }

  function applyLanguage(lang) {
    currentLang = lang === "en" ? "en" : "de";
    document.documentElement.lang = currentLang;
    const strings = currentLang === "en" ? STRINGS.en : STRINGS.de;
    $$("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      const value = strings[key];
      if (typeof value === "string") el.textContent = value;
    });
    $$("[data-i18n-placeholder]").forEach((el) => {
      const key = el.getAttribute("data-i18n-placeholder");
      const value = strings[key];
      if (typeof value === "string") el.setAttribute("placeholder", value);
    });
    const langBtn = $("#langBtn");
    if (langBtn) {
      langBtn.setAttribute("aria-pressed", String(currentLang === "en"));
      langBtn.textContent = currentLang === "en" ? "DE" : "EN";
    }
  }

  function getInitialLanguage() {
    const saved = localStorage.getItem("lang");
    if (saved === "de" || saved === "en") return saved;
    const nav = (navigator.language || "en").toLowerCase();
    return nav.startsWith("de") ? "de" : "en";
  }

  function bindNavCurrent() {
    const p = location.pathname;
    let key = "home";
    if (p === "/" || p.endsWith("/index.html")) {
      key = "home";
    } else if (p.endsWith("/")) {
      const seg = p.split("/").filter(Boolean).pop();
      key = seg || "home";
    } else {
      const file = p.split("/").pop() || "index.html";
      if (file.endsWith(".html")) key = file.slice(0, -5);
      else key = file;
    }

    $$(".nav a").forEach((a) => {
      const page = a.getAttribute("data-page");
      if (page && page === key) a.setAttribute("aria-current", "page");
    });
  }

  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      try {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        const ok = document.execCommand("copy");
        ta.remove();
        return ok;
      } catch {
        return false;
      }
    }
  }

  function bindCopyButtons() {
    $$("[data-copy]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const value = btn.getAttribute("data-copy") || "";
        const ok = await copyText(value);
        const m = MSG[currentLang] || MSG.de;
        toast(ok ? m.copied : m.copyFail);
      });
    });
  }

  function bindSmoothAnchors() {
    $$('a[href^="#"]').forEach((a) => {
      a.addEventListener("click", (e) => {
        const id = a.getAttribute("href");
        if (!id || id === "#") return;
        const target = $(id);
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
        history.replaceState(null, "", id);
      });
    });
  }

  function initContactForm() {
    const form = $("#contactForm");
    if (!form) return;
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const email = form.getAttribute("data-email") || "hello@zarven.net";
      const name = $("#name")?.value?.trim() || "";
      const from = $("#from")?.value?.trim() || "";
      const msg = $("#message")?.value?.trim() || "";
      const subject = encodeURIComponent(`Contact via zarven.net${name ? ` — ${name}` : ""}`);
      const body = encodeURIComponent(
        [
          msg,
          "",
          "—",
          name ? `Name: ${name}` : null,
          from ? `Contact: ${from}` : null,
        ]
          .filter(Boolean)
          .join("\n")
      );
      location.href = `mailto:${encodeURIComponent(email)}?subject=${subject}&body=${body}`;
      const m = MSG[currentLang] || MSG.de;
      toast(m.mailOpen);
    });
  }

  async function registerSW() {
    if (!("serviceWorker" in navigator)) return;
    try {
      await navigator.serviceWorker.register("./assets/sw.js", { scope: "./" });
    } catch {
      // optional
    }
  }

  function setYear() {
    const yearEl = $("#year");
    if (yearEl) yearEl.textContent = String(new Date().getFullYear());
  }

  const STRINGS = {
    de: {
      "hero.title": "ZARVEN",
      "home.tag": "Moderation, Games, Coins, Sticker und Tools für Gruppen.",
      "home.about": "Schnell, stabil, teamfähig. Gebaut für große Gruppen und klare Regeln.",
      "home.what": "Der Bot läuft auf Baileys und ist auf Gruppen-Management und Unterhaltung ausgelegt.",
    },
    en: {
      "hero.title": "ZARVEN",
      "home.tag": "Moderation, games, coins, stickers and tools for groups.",
      "home.about": "Fast, stable, team-ready. Built for large groups and clear rules.",
      "home.what": "Built on Baileys for group management and entertainment.",
    },
  };

  document.addEventListener("DOMContentLoaded", () => {
    bindNavCurrent();
    bindCopyButtons();
    bindSmoothAnchors();
    initContactForm();
    setYear();

    const langBtn = $("#langBtn");
    let lang = getInitialLanguage();
    applyLanguage(lang);
    if (langBtn) {
      langBtn.addEventListener("click", () => {
        lang = lang === "de" ? "en" : "de";
        localStorage.setItem("lang", lang);
        applyLanguage(lang);
        const m = MSG[currentLang] || MSG.de;
        toast(lang === "de" ? m.de : m.en);
      });
    }

    registerSW();
  });
})();
