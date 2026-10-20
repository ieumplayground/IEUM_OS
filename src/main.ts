import "./styles/desktop.css";
import "./styles/windows.css";
import "./styles/apps.css";

import { AppRegistry } from "./core/AppRegistry";
import { WindowManager } from "./core/WindowManager";
import { renderTaskbar } from "./components/Taskbar";
import { mountApp, renderApp } from "./apps/apps";

const registry = new AppRegistry();
const wm = new WindowManager(registry);
const root = document.querySelector<HTMLDivElement>("#app")!;

let startOpen = false;
let startQuery = "";
let currentCategory = "all";

const escapeHTML = (value: string) =>
  value.replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[c]!);

function toast(message: string) {
  const host = document.querySelector("#toast-host");
  if (!host) return;
  const el = document.createElement("div");
  el.className = "toast";
  el.textContent = message;
  host.append(el);
  setTimeout(() => el.remove(), 2600);
}

function launch(appId: string) {
  const app = registry.get(appId);
  if (!app) return;
  const existing = wm.windows.find(w => w.appId === appId);
  wm.open(appId);
  renderWindows();
  renderTaskbarUI();
  startOpen = false;
  renderStartMenu();

  if (!existing) toast(`${app.icon} ${app.name} 실행 중`);
}

function renderDesktopIcons() {
  const host = document.querySelector("#desktop-icons")!;
  const ids = ["store", "mypc", "settings", "files", "browser"];
  host.innerHTML = ids.map(id => {
    const app = registry.get(id)!;
    return `
      <button class="desktop-icon" data-launch="${id}">
        <span class="desktop-icon-art">${app.icon}</span>
        <span>${app.name}</span>
      </button>`;
  }).join("");

  host.querySelectorAll<HTMLElement>("[data-launch]").forEach(el => {
    el.addEventListener("dblclick", () => launch(el.dataset.launch!));
    el.addEventListener("click", () => {
      host.querySelectorAll(".desktop-icon").forEach(i => i.classList.remove("selected"));
      el.classList.add("selected");
    });
  });
}

function renderStartMenu() {
  const host = document.querySelector<HTMLDivElement>("#start-menu-host")!;
  if (!startOpen) {
    host.innerHTML = "";
    return;
  }

  const apps = registry.search(startQuery, currentCategory);
  host.innerHTML = `
    <section class="start-menu">
      <div class="start-menu-header">
        <div class="start-user"><span>🌅</span><div><strong>Marst OS</strong><small>나만의 디지털 공간</small></div></div>
        <button id="start-close" aria-label="닫기">×</button>
      </div>
      <input id="start-search" class="start-search" placeholder="앱 검색..." value="${escapeHTML(startQuery)}">
      <div class="start-menu-tabs">
        ${[
          ["all", "전체"], ["system", "시스템"], ["game", "게임"],
          ["work", "작업"], ["original", "Originals"]
        ].map(([id, label]) => `<button data-start-category="${id}" class="${currentCategory === id ? "active" : ""}">${label}</button>`).join("")}
      </div>
      <div class="start-app-grid">
        ${apps.map(app => `
          <button class="start-app" data-start-launch="${app.id}">
            <span>${app.icon}</span><small>${app.name}</small>
          </button>`).join("") || `<p class="muted">검색 결과가 없어.</p>`}
      </div>
      <div class="start-menu-bottom">
        <span>✦ Marst OS 0.1</span>
        <button id="start-power">⏻</button>
      </div>
    </section>`;

  host.querySelector("#start-close")?.addEventListener("click", () => {
    startOpen = false;
    renderStartMenu();
  });

  host.querySelector<HTMLInputElement>("#start-search")?.addEventListener("input", e => {
    startQuery = (e.target as HTMLInputElement).value;
    renderStartMenu();
    const input = host.querySelector<HTMLInputElement>("#start-search");
    input?.focus();
    input?.setSelectionRange(startQuery.length, startQuery.length);
  });

  host.querySelectorAll<HTMLElement>("[data-start-category]").forEach(el => {
    el.addEventListener("click", () => {
      currentCategory = el.dataset.startCategory!;
      renderStartMenu();
    });
  });

  host.querySelectorAll<HTMLElement>("[data-start-launch]").forEach(el => {
    el.addEventListener("click", () => launch(el.dataset.startLaunch!));
  });

  host.querySelector("#start-power")?.addEventListener("click", () => {
    startOpen = false;
    renderStartMenu();
    toast("Marst OS는 브라우저에서 실행 중이야.");
  });
}

function renderTaskbarUI() {
  const host = document.querySelector<HTMLElement>("#taskbar")!;
  renderTaskbar(host, wm, registry, () => {
    startOpen = !startOpen;
    renderStartMenu();
  }, launch, () => {
    renderWindows();
    renderTaskbarUI();
  });
}

function renderWindows() {
  const layer = document.querySelector<HTMLElement>("#window-layer")!;

  layer.innerHTML = wm.windows.map(win => {
    const app = registry.get(win.appId)!;
    return `
      <article class="app-window
        ${win.minimized ? "is-minimized" : ""}
        ${win.maximized ? "is-maximized" : ""}"
        data-window="${win.id}"
        style="left:${win.x}px;top:${win.y}px;width:${win.width}px;height:${win.height}px;z-index:${win.z}">
        <header class="window-titlebar" data-drag="${win.id}">
          <div class="window-app-icon">${app.icon}</div>
          <span class="window-title">${escapeHTML(win.title)}</span>
          <div class="window-controls">
            <button class="window-control" data-min="${win.id}" title="최소화">−</button>
            <button class="window-control" data-max="${win.id}" title="최대화">□</button>
            <button class="window-control close" data-close="${win.id}" title="닫기">×</button>
          </div>
        </header>
        <div class="window-content" data-content="${win.id}">
          ${renderApp(win.appId, win.state)}
        </div>
      </article>`;
  }).join("");

  layer.querySelectorAll<HTMLElement>(".app-window").forEach(el => {
    el.addEventListener("pointerdown", () => {
      wm.focus(el.dataset.window!);
      el.style.zIndex = String(wm.topZ);
    });
  });

  layer.querySelectorAll<HTMLElement>("[data-content]").forEach(el => {
    const win = wm.get(el.dataset.content!);
    if (win) mountApp(win.appId, el, launch);
  });

  layer.querySelectorAll<HTMLButtonElement>("[data-close]").forEach(btn => {
    btn.onclick = () => {
      wm.close(btn.dataset.close!);
      renderWindows();
      renderTaskbarUI();
    };
  });

  layer.querySelectorAll<HTMLButtonElement>("[data-min]").forEach(btn => {
    btn.onclick = () => {
      wm.minimize(btn.dataset.min!);
      renderWindows();
      renderTaskbarUI();
    };
  });

  layer.querySelectorAll<HTMLButtonElement>("[data-max]").forEach(btn => {
    btn.onclick = () => {
      wm.toggleMaximize(btn.dataset.max!);
      renderWindows();
    };
  });

  layer.querySelectorAll<HTMLElement>("[data-drag]").forEach(bar => {
    let startX = 0, startY = 0, originX = 0, originY = 0;
    let dragging = false;

    bar.addEventListener("pointerdown", e => {
      if ((e.target as HTMLElement).closest("button")) return;
      const win = wm.get(bar.dataset.drag!);
      if (!win || win.maximized) return;

      dragging = true;
      startX = e.clientX;
      startY = e.clientY;
      originX = win.x;
      originY = win.y;
      bar.setPointerCapture(e.pointerId);
      wm.focus(win.id);
      (bar.closest(".app-window") as HTMLElement).style.zIndex = String(wm.topZ);
    });

    bar.addEventListener("pointermove", e => {
      if (!dragging) return;
      const win = wm.get(bar.dataset.drag!);
      if (!win) return;

      wm.move(win.id, originX + e.clientX - startX, originY + e.clientY - startY);
      const windowEl = bar.closest(".app-window") as HTMLElement;
      windowEl.style.left = `${win.x}px`;
      windowEl.style.top = `${win.y}px`;
    });

    const stop = () => dragging = false;
    bar.addEventListener("pointerup", stop);
    bar.addEventListener("pointercancel", stop);
  });
}

function renderShell() {
  root.innerHTML = `
    <main class="desktop">
      <div class="desktop-shade"></div>
      <header class="desktop-top">
        <div class="brand"><span class="brand-mark">M</span><span>Marst <b>OS</b></span></div>
        <div class="top-pill"><span class="live-dot"></span> 당신의 하루를 위한 작은 세계</div>
      </header>
      <section class="desktop-icons" id="desktop-icons"></section>
      <section class="window-layer" id="window-layer"></section>
      <div id="start-menu-host"></div>
      <footer class="taskbar" id="taskbar"></footer>
      <div class="toast-host" id="toast-host"></div>
    </main>`;

  renderDesktopIcons();
  renderTaskbarUI();
  renderStartMenu();
}

window.addEventListener("marst-launch", (event: Event) => {
  const custom = event as CustomEvent<string>;
  launch(custom.detail);
});

const savedTheme = localStorage.getItem("marst-os-theme");
if (savedTheme) document.documentElement.dataset.theme = savedTheme;

renderShell();

window.addEventListener("keydown", e => {
  if (e.key === "Escape" && startOpen) {
    startOpen = false;
    renderStartMenu();
  }

  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "e") {
    e.preventDefault();
    launch("files");
  }

  if (e.key === "F1") {
    e.preventDefault();
    launch("store");
  }
});
