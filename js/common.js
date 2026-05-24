(function () {
  const cfg = window.SITE_CONFIG;

  function applyTheme() {
    const t = cfg.theme;
    document.documentElement.style.setProperty("--bg", t.colorBg);
    document.documentElement.style.setProperty("--surface", t.colorSurface);
    document.documentElement.style.setProperty("--text", t.colorText);
    document.documentElement.style.setProperty("--muted", t.colorMuted);
    document.documentElement.style.setProperty("--primary", t.colorPrimary);
    document.documentElement.style.setProperty("--accent", t.colorAccent);
    document.documentElement.style.setProperty("--border", t.colorBorder);
    document.body.style.fontFamily = t.fontPrimary;
  }

  function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  }

  function setHref(id, value) {
    const el = document.getElementById(id);
    if (el) el.href = value;
  }

  function basePath() {
    const path = cfg.repo && cfg.repo.pagesBasePath ? cfg.repo.pagesBasePath : "/";
    if (!path.endsWith("/")) return path + "/";
    return path;
  }

  function navTemplate(current) {
    const links = [
      ["index.html", "Home", "home"],
      ["launcher.html", "Launcher", "launcher"],
      ["docs.html", "Docs", "docs"],
      ["status.html", "Status", "status"],
      ["legal.html", "Legal", "legal"],
      ["support.html", "Support", "support"]
    ];

    const built = links.map(([href, label, key]) => {
      const active = current === key ? "active" : "";
      return `<a class="${active}" href="${href}">${label}</a>`;
    }).join("");

    return `
      <div class="container nav">
        <a class="brand" href="index.html">
          <img data-brand-logo src="" alt="">
          <span id="brand-name">Void Client</span>
        </a>
        <nav class="nav-links">${built}</nav>
      </div>
    `;
  }

  function footerTemplate() {
    return `
      <div class="container">
        <p id="footer-legal"></p>
        <div class="footer-links">
          <a id="link-discord" href="#" target="_blank" rel="noreferrer">Discord</a>
          <a id="link-support" href="#" target="_blank" rel="noreferrer">Support</a>
          <a id="link-github" href="#" target="_blank" rel="noreferrer">GitHub</a>
          <a href="legal.html">Legal</a>
          <a href="support.html">Contact</a>
        </div>
      </div>
    `;
  }

  function applyBranding() {
    setText("brand-subtitle", cfg.brand.subtitle);
    setText("footer-legal", cfg.legal.footerNotice);
    setText("support-email", cfg.links.supportEmail || "support@example.com");

    const logos = document.querySelectorAll("[data-brand-logo]");
    logos.forEach((img) => {
      img.src = cfg.brand.logoPath;
      img.alt = cfg.brand.name + " logo";
    });

    const hero = document.getElementById("hero-image");
    if (hero) {
      hero.src = cfg.brand.heroImagePath;
      hero.alt = cfg.brand.name + " hero image";
    }

    setHref("link-discord", cfg.links.discord);
    setHref("link-support", cfg.links.support);
    setHref("link-github", cfg.links.github);

    const pageTitle = document.body.getAttribute("data-page-title");
    if (pageTitle) {
      document.title = `${cfg.brand.name} | ${pageTitle}`;
    } else {
      document.title = cfg.brand.name;
    }
  }

  function renderShell() {
    const current = document.body.getAttribute("data-nav") || "";
    const header = document.querySelector("header");
    const footer = document.querySelector("footer");
    if (header) header.innerHTML = navTemplate(current);
    if (footer) footer.innerHTML = footerTemplate();
  }

  function renderMarkdown(text) {
    const lines = text.split("\n");
    let inList = false;
    const out = [];

    function closeList() {
      if (inList) {
        out.push("</ul>");
        inList = false;
      }
    }

    lines.forEach((raw) => {
      const line = raw.trim();
      if (!line) {
        closeList();
        return;
      }
      if (line.startsWith("### ")) {
        closeList();
        out.push(`<h3>${line.slice(4)}</h3>`);
        return;
      }
      if (line.startsWith("## ")) {
        closeList();
        out.push(`<h2>${line.slice(3)}</h2>`);
        return;
      }
      if (line.startsWith("# ")) {
        closeList();
        out.push(`<h1>${line.slice(2)}</h1>`);
        return;
      }
      if (line.startsWith("- ")) {
        if (!inList) {
          out.push("<ul>");
          inList = true;
        }
        out.push(`<li>${line.slice(2)}</li>`);
        return;
      }
      closeList();
      out.push(`<p>${line}</p>`);
    });

    closeList();
    return `<div class="markdown">${out.join("")}</div>`;
  }

  async function fillMarkdownFile(targetId, filePath) {
    const target = document.getElementById(targetId);
    if (!target) return;
    try {
      const res = await fetch(filePath, { cache: "no-store" });
      const text = await res.text();
      target.innerHTML = renderMarkdown(text);
    } catch (_err) {
      target.innerHTML = "<p>Could not load content.</p>";
    }
  }

  function registerSW() {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("sw.js").catch(function () {});
    }
  }

  function init() {
    renderShell();
    applyTheme();
    applyBranding();
    registerSW();
    window.__BASE_PATH__ = basePath();
  }

  window.AppCommon = { init, renderMarkdown, fillMarkdownFile };
})();