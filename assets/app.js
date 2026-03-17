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
    const current = location.pathname.split("/").pop() || "index.html";
    $$(".nav a").forEach((a) => {
      const href = (a.getAttribute("href") || "").split("#")[0];
      const target = href.split("/").pop() || "index.html";
      if (target === current) a.setAttribute("aria-current", "page");
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
      "hero.sub": "Eine kleine, schnelle Static-Site: klar, modern, ohne Backend.",
      "hero.cta": "Roadmap ansehen",
      "hero.secondary": "Kontakt",
      "quick.1.t": "Statisch & schnell",
      "quick.1.p": "Kein Backend, keine Datenbank. Nur HTML/CSS/JS — läuft überall.",
      "quick.2.t": "PWA-ready",
      "quick.2.p": "Offline-Cache + Manifest. Für GitHub Pages & Co. geeignet.",
      "quick.3.t": "Einfach anpassen",
      "quick.3.p": "Texte/Links sind zentral. Du kannst alles ohne Build-Tool ändern.",
      "card.a.t": "Projekte",
      "card.a.p": "Platz für Bots, Tools, Experimente und Demos. Alles bleibt statisch – Inhalte sind editierbar.",
      "card.b.t": "Community",
      "card.b.p": "Discord ist der schnellste Einstieg. Link kopieren oder direkt beitreten.",
      "contact.title": "Kontakt",
      "contact.note": "Kein Backend: dieses Formular erzeugt ein Mailto. Alternativ Link kopieren.",
      "contact.name": "Name",
      "contact.from": "E-Mail/Discord",
      "contact.msg": "Nachricht",
      "contact.send": "Mail öffnen",
      "footer.left": "All rights reserved.",
      "footer.right": "Datenschutz: keine Cookies, kein Tracking.",
    },
    en: {
      "hero.title": "ZARVEN",
      "hero.sub": "A small, fast static site: clean, modern, no backend.",
      "hero.cta": "View roadmap",
      "hero.secondary": "Contact",
      "quick.1.t": "Static & fast",
      "quick.1.p": "No backend, no database. Just HTML/CSS/JS — runs anywhere.",
      "quick.2.t": "PWA-ready",
      "quick.2.p": "Offline cache + manifest. Works well on GitHub Pages.",
      "quick.3.t": "Easy to edit",
      "quick.3.p": "Texts/links are centralized. No build tooling required.",
      "card.a.t": "Projects",
      "card.a.p": "Space for bots, tools, experiments and demos. Still fully static — content is editable.",
      "card.b.t": "Community",
      "card.b.p": "Discord is the fastest entry. Copy the invite or join directly.",
      "contact.title": "Contact",
      "contact.note": "No backend: this form generates a mailto. Or copy the link instead.",
      "contact.name": "Name",
      "contact.from": "Email/Discord",
      "contact.msg": "Message",
      "contact.send": "Open email",
      "footer.left": "All rights reserved.",
      "footer.right": "Privacy: no cookies, no tracking.",
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

