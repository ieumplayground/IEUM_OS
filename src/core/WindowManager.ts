import { AppRegistry } from "./AppRegistry";

export interface OSWindow {
  id: string;
  appId: string;
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  z: number;
  minimized: boolean;
  maximized: boolean;
  state: Record<string, unknown>;
}

export class WindowManager {
  windows: OSWindow[] = [];
  topZ = 10;
  private sequence = 0;

  constructor(private registry: AppRegistry) {}

  open(appId: string): OSWindow | undefined {
    const existing = this.windows.find(w => w.appId === appId);

    if (existing) {
      existing.minimized = false;
      this.focus(existing.id);
      return existing;
    }

    const app = this.registry.get(appId);
    if (!app) return;

    const width = app.width ?? 600;
    const height = app.height ?? 450;
    const offset = (this.sequence % 8) * 28;

    const win: OSWindow = {
      id: `window-${++this.sequence}`,
      appId,
      title: app.name,
      x: Math.max(12, (window.innerWidth - width) / 2 + offset - 60),
      y: Math.max(18, (window.innerHeight - height) / 2 + offset - 50),
      width,
      height,
      z: ++this.topZ,
      minimized: false,
      maximized: false,
      state: {}
    };

    this.windows.push(win);
    return win;
  }

  get(id: string): OSWindow | undefined {
    return this.windows.find(w => w.id === id);
  }

  close(id: string): void {
    this.windows = this.windows.filter(w => w.id !== id);
  }

  minimize(id: string): void {
    const win = this.get(id);
    if (win) win.minimized = true;
  }

  restore(id: string): void {
    const win = this.get(id);
    if (!win) return;
    win.minimized = false;
    this.focus(id);
  }

  focus(id: string): void {
    const win = this.get(id);
    if (win) win.z = ++this.topZ;
  }

  toggleMaximize(id: string): void {
    const win = this.get(id);
    if (win) {
      win.maximized = !win.maximized;
      win.minimized = false;
      this.focus(id);
    }
  }

  move(id: string, x: number, y: number): void {
    const win = this.get(id);
    if (!win || win.maximized) return;
    win.x = Math.max(0, Math.min(x, window.innerWidth - 120));
    win.y = Math.max(0, Math.min(y, window.innerHeight - 100));
  }
}
