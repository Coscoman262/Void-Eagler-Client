(function () {
  const cfg = window.SITE_CONFIG;
  const STORAGE_KEY = "voidClientServers";
  const SETTINGS_KEY = "voidClientSettings";

  function readParams() {
    const q = new URLSearchParams(window.location.search);
    return {
      username: q.get("username") || "",
      autoConnect: q.get("autoconnect") === "1",
      server: q.get("server") || ""
    };
  }

  function loadServers() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return [cfg.featuredServer];
    try {
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) && parsed.length ? parsed : [cfg.featuredServer];
    } catch (_err) {
      return [cfg.featuredServer];
    }
  }

  function saveServers(servers) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(servers));
  }

  function loadSettings() {
    try {
      return JSON.parse(localStorage.getItem(SETTINGS_KEY) || "{}");
    } catch (_err) {
      return {};
    }
  }

  function saveSettings(settings) {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }

  function validUsername(name) {
    return /^[A-Za-z0-9_]{3,16}$/.test(name);
  }

  function updateStatus(msg, good) {
    const el = document.getElementById("launch-status");
    el.textContent = msg;
    el.style.color = good ? "#10b981" : "#f87171";
  }

  function renderServers(servers) {
    const tbody = document.getElementById("servers-body");
    tbody.innerHTML = "";
    servers.forEach(function (s, idx) {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${s.name}</td>
        <td><small class="mono">${s.address}</small></td>
        <td>
          <button class="button secondary" data-connect="${idx}">Use</button>
          <button class="button secondary" data-delete="${idx}">Delete</button>
        </td>
      `;
      tbody.appendChild(row);
    });
  }

  function buildClientUrl(username, serverAddr, autoConnect) {
    const params = new URLSearchParams();
    params.set("username", username);
    params.set("server", serverAddr);
    params.set("autoconnect", autoConnect ? "1" : "0");
    return `${cfg.launcherDefaults.clientPath}?${params.toString()}`;
  }

  function launch(username, serverAddr, autoConnect) {
    const frame = document.getElementById("client-frame");
    frame.src = buildClientUrl(username, serverAddr, autoConnect);
    updateStatus("Launching Void Client...", true);
  }

  function init() {
    const params = readParams();
    const settings = loadSettings();
    const servers = loadServers();

    const usernameInput = document.getElementById("username");
    const serverNameInput = document.getElementById("server-name");
    const serverInput = document.getElementById("server-address");
    const autoConnectInput = document.getElementById("auto-connect");
    const profileSelect = document.getElementById("profile");
    const fpsSelect = document.getElementById("fps-limit");

    renderServers(servers);

    usernameInput.value = params.username || settings.username || cfg.launcherDefaults.defaultUsername;
    serverInput.value = params.server || settings.server || cfg.featuredServer.address;
    serverNameInput.value = settings.serverName || cfg.featuredServer.name;
    autoConnectInput.checked = params.autoConnect || settings.autoConnect || cfg.launcherDefaults.autoConnect;
    profileSelect.value = settings.profile || "balanced";
    fpsSelect.value = settings.fpsLimit || "120";

    document.getElementById("quick-featured").addEventListener("click", function () {
      serverNameInput.value = cfg.featuredServer.name;
      serverInput.value = cfg.featuredServer.address;
      updateStatus("Featured server selected.", true);
    });

    document.getElementById("launch-btn").addEventListener("click", function () {
      const name = usernameInput.value.trim();
      const addr = serverInput.value.trim();
      const sname = serverNameInput.value.trim() || "Custom Server";
      if (!validUsername(name)) {
        updateStatus("Username must be 3-16 chars with letters/numbers/underscore.", false);
        return;
      }
      if (!addr) {
        updateStatus("Server address is required.", false);
        return;
      }

      const newSettings = {
        username: name,
        server: addr,
        serverName: sname,
        autoConnect: autoConnectInput.checked,
        profile: profileSelect.value,
        fpsLimit: fpsSelect.value
      };
      saveSettings(newSettings);
      localStorage.setItem("voidClientProfile", profileSelect.value);
      localStorage.setItem("voidClientFpsLimit", fpsSelect.value);

      launch(name, addr, autoConnectInput.checked);
    });

    document.getElementById("save-server").addEventListener("click", function () {
      const name = serverNameInput.value.trim();
      const addr = serverInput.value.trim();
      if (!name || !addr) {
        updateStatus("Provide both server name and server address.", false);
        return;
      }

      const exists = servers.some((s) => s.address.toLowerCase() === addr.toLowerCase());
      if (!exists) {
        servers.push({ name: name, address: addr });
        saveServers(servers);
        renderServers(servers);
      }
      updateStatus(exists ? "Server already exists." : "Server saved.", !exists);
    });

    document.getElementById("reset-servers").addEventListener("click", function () {
      const fresh = [cfg.featuredServer];
      saveServers(fresh);
      servers.length = 0;
      fresh.forEach((s) => servers.push(s));
      renderServers(servers);
      updateStatus("Server list reset to featured server.", true);
    });

    document.getElementById("export-servers").addEventListener("click", function () {
      const blob = new Blob([JSON.stringify(servers, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "void-client-servers.json";
      a.click();
      URL.revokeObjectURL(url);
      updateStatus("Servers exported.", true);
    });

    document.getElementById("import-servers").addEventListener("change", function (ev) {
      const file = ev.target.files && ev.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = function () {
        try {
          const data = JSON.parse(String(reader.result || "[]"));
          if (!Array.isArray(data)) throw new Error("bad format");
          const clean = data.filter((x) => x && x.name && x.address);
          if (!clean.length) throw new Error("empty list");
          saveServers(clean);
          servers.length = 0;
          clean.forEach((s) => servers.push(s));
          renderServers(servers);
          updateStatus("Servers imported.", true);
        } catch (_err) {
          updateStatus("Invalid import file format.", false);
        }
      };
      reader.readAsText(file);
    });

    document.getElementById("servers-body").addEventListener("click", function (ev) {
      const btn = ev.target;
      if (!(btn instanceof HTMLButtonElement)) return;
      const useIdx = btn.getAttribute("data-connect");
      const delIdx = btn.getAttribute("data-delete");

      if (useIdx !== null) {
        const s = servers[Number(useIdx)];
        if (s) {
          serverNameInput.value = s.name;
          serverInput.value = s.address;
          updateStatus("Server selected.", true);
        }
      }

      if (delIdx !== null) {
        const i = Number(delIdx);
        if (servers.length === 1) {
          updateStatus("Keep at least one server in list.", false);
          return;
        }
        servers.splice(i, 1);
        saveServers(servers);
        renderServers(servers);
        updateStatus("Server removed.", true);
      }
    });

    if (params.autoConnect) {
      document.getElementById("launch-btn").click();
    }
  }

  window.LauncherApp = { init };
})();