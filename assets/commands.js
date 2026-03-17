(() => {
  const listEl = document.getElementById("commandsList");
  const countEl = document.getElementById("commandsCount");
  const searchEl = document.getElementById("commandsSearch");

  if (!listEl) return;

  const render = (items) => {
    listEl.innerHTML = items
      .map((item) => {
        const name = item.name;
        const desc = item.description || "";
        return `
          <div class="commandCard">
            <div class="commandName">!${name}</div>
            <div class="commandDesc">${desc.replace(/\n/g, "<br />")}</div>
          </div>
        `;
      })
      .join("");
    if (countEl) countEl.textContent = String(items.length);
  };

  const load = async () => {
    try {
      const res = await fetch("../assets/commands.json", { cache: "no-store" });
      const data = await res.json();
      const commands = data && data.commands ? data.commands : {};
      const items = Object.keys(commands)
        .map((key) => ({ name: key, description: String(commands[key]?.description || "") }))
        .filter((item) => {
          const desc = item.description.toLowerCase();
          return !/(teamcmd|ownercmd|team\/owner)/i.test(desc);
        })
        .sort((a, b) => a.name.localeCompare(b.name));
      render(items);

      if (searchEl) {
        searchEl.addEventListener("input", () => {
          const q = searchEl.value.trim().toLowerCase();
          const filtered = items.filter((item) => {
            return item.name.toLowerCase().includes(q) || item.description.toLowerCase().includes(q);
          });
          render(filtered);
        });
      }
    } catch {
      listEl.innerHTML = "<div class=\"commandError\">Konnte commands.json nicht laden.</div>";
      if (countEl) countEl.textContent = "0";
    }
  };

  load();
})();
