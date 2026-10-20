import type { WindowManager } from "../core/WindowManager";
import type { AppRegistry } from "../core/AppRegistry";

export function renderTaskbar(
  host: HTMLElement,
  wm: WindowManager,
  registry: AppRegistry,
  toggleStart: () => void,
  launch: (id: string) => void,
  refresh: () => void
): void {
  host.innerHTML = `
    <div class="taskbar-left">
      <button class="taskbar-weather" title="오늘의 분위기">🌇 <span>노을이 머무는 시간</span></button>
    </div>
    <div class="taskbar-center">
      <button class="taskbar-icon start-button" title="시작 메뉴">◈</button>
      ${["store", "files", "browser", "notes"].map(id => {
        const app = registry.get(id)!;
        return `<button class="taskbar-icon pinned" data-pin="${id}" title="${app.name}">${app.icon}</button>`;
      }).join("")}
      <span class="taskbar-separator"></span>
      ${wm.windows.map(w => {
        const app = registry.get(w.appId)!;
        return `<button class="taskbar-icon running ${w.minimized ? "minimized" : "active"}" data-window="${w.id}" title="${w.title}">${app.icon}</button>`;
      }).join("")}
    </div>
    <div class="taskbar-right">
      <span class="tray-icon">⌃</span>
      <span class="tray-icon">◉</span>
      <div class="clock"><strong id="clock-time"></strong><small id="clock-date"></small></div>
    </div>`;

  host.querySelector(".start-button")?.addEventListener("click", toggleStart);

  host.querySelectorAll<HTMLElement>("[data-pin]").forEach(el => {
    el.addEventListener("click", () => launch(el.dataset.pin!));
  });

  host.querySelectorAll<HTMLElement>("[data-window]").forEach(el => {
    el.addEventListener("click", () => {
      const win = wm.get(el.dataset.window!);
      if (!win) return;
      if (!win.minimized && win.z === wm.topZ) wm.minimize(win.id);
      else wm.restore(win.id);
      refresh();
    });
  });

  const updateClock = () => {
    const now = new Date();
    const time = host.querySelector("#clock-time");
    const date = host.querySelector("#clock-date");
    if (time) time.textContent = now.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" });
    if (date) date.textContent = now.toLocaleDateString("ko-KR", { month: "2-digit", day: "2-digit", weekday: "short" });
  };
  updateClock();
  window.setInterval(updateClock, 10000);
}
