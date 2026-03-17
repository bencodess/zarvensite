(() => {
  const $ = (sel, root = document) => root.querySelector(sel);

  function formatDate(ms, lang) {
    try {
      const d = new Date(ms);
      return new Intl.DateTimeFormat(lang, {
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }).format(d);
    } catch {
      return new Date(ms).toISOString();
    }
  }

  function updateCountdown() {
    const el = $("#countdown");
    if (!el) return;
    const target = el.getAttribute("data-target");
    if (!target) {
      el.textContent = "—";
      return;
    }
    const targetMs = Date.parse(target);
    if (Number.isNaN(targetMs)) {
      el.textContent = "—";
      return;
    }

    const now = Date.now();
    const diff = targetMs - now;
    const lang = document.documentElement.lang || "de";

    const meta = $("#countdownMeta");
    if (meta) meta.textContent = formatDate(targetMs, lang);

    if (diff <= 0) {
      el.textContent = "Live.";
      return;
    }

    const s = Math.floor(diff / 1000);
    const d = Math.floor(s / 86400);
    const h = Math.floor((s % 86400) / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    el.textContent = `${d}d ${h}h ${m}m ${sec}s`;
  }

  document.addEventListener("DOMContentLoaded", () => {
    updateCountdown();
    window.setInterval(updateCountdown, 1000);
  });
})();

