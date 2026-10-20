import type { AppDefinition } from "../core/AppRegistry";

const KEY = "marst-os-data-v1";

type StoreData = {
  notes: string;
  todos: { id: number; text: string; done: boolean }[];
  files: { name: string; content: string; type: string }[];
  money: number;
  level: number;
  mood: string;
  focusMinutes: number;
  installed: string[];
};

function loadData(): StoreData {
  const defaults: StoreData = {
    notes: "",
    todos: [],
    files: [
      { name: "환영합니다.txt", content: "Marst OS에 온 걸 환영해!\n여기서 너만의 작업 공간을 만들어 봐.", type: "문서" }
    ],
    money: 100,
    level: 1,
    mood: "노을",
    focusMinutes: 0,
    installed: []
  };

  try {
    return { ...defaults, ...JSON.parse(localStorage.getItem(KEY) || "{}") };
  } catch {
    return defaults;
  }
}

const data = loadData();

function save(): void {
  localStorage.setItem(KEY, JSON.stringify(data));
}

function escapeHTML(value: unknown): string {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[char]!);
}

function button(label: string, action: string, extra = ""): string {
  return `<button class="primary-button" data-action="${action}" ${extra}>${label}</button>`;
}

function card(title: string, description: string, icon: string): string {
  return `<div class="info-card"><span class="big-icon">${icon}</span><strong>${title}</strong><p>${description}</p></div>`;
}

function storeApp(): string {
  return `
    <div class="app-page store-page">
      <div class="store-hero">
        <div>
          <span class="eyebrow">MARST OS COLLECTION</span>
          <h1>새로운 가능성을<br>발견해 봐.</h1>
          <p>게임부터 창작 도구까지, 네 공간을 확장해 봐.</p>
        </div>
        <div class="hero-orb">✦</div>
      </div>
      <div class="store-search">
        <span>⌕</span><input id="store-search" placeholder="앱 이름 검색하기...">
      </div>
      <nav class="store-tabs">
        <button class="store-tab active" data-category="all">전체</button>
        <button class="store-tab" data-category="game">게임</button>
        <button class="store-tab" data-category="work">작업</button>
        <button class="store-tab" data-category="system">시스템</button>
        <button class="store-tab" data-category="original">Marst Originals</button>
      </nav>
      <div class="store-results" id="store-results"></div>
    </div>`;
}

function renderStoreResults(host: HTMLElement, apps: AppDefinition[], category: string, query: string): void {
  const filtered = apps.filter(app =>
    (category === "all" || app.category === category) &&
    `${app.name} ${app.description}`.toLowerCase().includes(query.toLowerCase())
  );

  host.innerHTML = filtered.length ? filtered.map(app => `
    <article class="store-card">
      <div class="store-card-top">
        <div class="store-app-icon">${app.icon}</div>
        <span class="category-tag">${({
          system: "시스템", game: "게임", work: "작업", original: "오리지널"
        } as Record<string, string>)[app.category]}</span>
      </div>
      <strong>${escapeHTML(app.name)}</strong>
      <p>${escapeHTML(app.description)}</p>
      <button class="install-button" data-install="${app.id}">
        ${data.installed.includes(app.id) ? "설치됨 · 열기" : "열기"}
      </button>
    </article>`).join("") : `<div class="empty-state">검색 결과가 없어. 다른 단어로 찾아 봐!</div>`;

  host.querySelectorAll<HTMLElement>("[data-install]").forEach(el => {
    el.addEventListener("click", () => {
      const id = el.dataset.install!;
      if (!data.installed.includes(id)) {
        data.installed.push(id);
        save();
      }
      window.dispatchEvent(new CustomEvent("marst-launch", { detail: id }));
    });
  });
}

function renderSnake(): string {
  return `
    <div class="app-page game-page">
      <h2>🐍 스네이크</h2>
      <p>방향키 또는 WASD로 먹이를 먹어 봐!</p>
      <div class="snake-score">점수 <strong id="snake-score">0</strong></div>
      <canvas id="snake-canvas" width="360" height="360"></canvas>
      <div class="game-controls">
        <button data-dir="up">↑</button>
        <div><button data-dir="left">←</button><button data-dir="down">↓</button><button data-dir="right">→</button></div>
      </div>
      <button class="primary-button" id="snake-start">게임 시작 / 재시작</button>
      <p class="muted" id="snake-status">시작 버튼을 눌러 시작해.</p>
    </div>`;
}

function renderBaseball(): string {
  return `
    <div class="app-page game-page">
      <div class="game-banner baseball-banner"><span>IEUM SPORTS</span><h1>⚾ 홈런 챌린지</h1><p>공이 도착하는 순간 타격 버튼을 눌러!</p></div>
      <div class="baseball-field">
        <div class="ball" id="baseball-ball">⚾</div>
        <div class="field-line"></div>
      </div>
      <div class="baseball-stats"><div>점수<strong id="baseball-score">0</strong></div><div>최고 점수<strong id="baseball-best">0</strong></div></div>
      <button class="primary-button wide" id="baseball-pitch">공 던지기</button>
      <button class="primary-button wide accent-button" id="baseball-hit" disabled>타격!</button>
      <p class="muted" id="baseball-status">공 던지기를 눌러 시작해.</p>
    </div>`;
}

function renderSurvivor(): string {
  return `
    <div class="app-page game-page">
      <div class="game-banner survivor-banner"><span>SURVIVAL MODE</span><h1>🧟 서바이버</h1><p>적을 피하고 생존 시간을 늘려 봐.</p></div>
      <div class="survivor-arena" id="survivor-arena">
        <div class="survivor-player" id="survivor-player">🧑</div>
      </div>
      <div class="baseball-stats"><div>생존<strong id="survivor-time">0초</strong></div><div>점수<strong id="survivor-score">0</strong></div></div>
      <div class="game-controls"><button data-move="up">↑</button><div><button data-move="left">←</button><button data-move="down">↓</button><button data-move="right">→</button></div></div>
      <button class="primary-button wide" id="survivor-start">생존 시작</button>
      <p class="muted" id="survivor-status">방향 버튼으로 이동해.</p>
    </div>`;
}

function renderTycoon(): string {
  return `
    <div class="app-page">
      <div class="game-banner tycoon-banner"><span>MINI BUSINESS</span><h1>🏙️ 미니 타이쿤</h1><p>작은 사업을 키워 나만의 회사를 만들어 봐.</p></div>
      <div class="tycoon-money">보유 자금 <strong id="tycoon-money">${data.money.toLocaleString()} 코인</strong></div>
      <div class="tycoon-stats"><div>사업 레벨<strong id="tycoon-level">${data.level}</strong></div><div>초당 수익<strong id="tycoon-income">${data.level * 2}</strong></div></div>
      <button class="primary-button wide" id="tycoon-collect">💰 수익 받기 (+${data.level * 2})</button>
      <button class="secondary-button wide" id="tycoon-upgrade">🏗️ 사업 업그레이드 (${data.level * 30} 코인)</button>
      <p class="muted" id="tycoon-status">수익을 모아 사업을 업그레이드해!</p>
    </div>`;
}

function renderCoding(): string {
  return `
    <div class="app-page coding-page">
      <div class="editor-toolbar"><span>● ● ●</span><strong>IEUM Coding</strong><button id="code-run">▶ 실행</button></div>
      <div class="editor-workspace">
        <div class="editor-code"><label>index.html</label><textarea id="code-source" spellcheck="false"><h1>안녕, Marst OS!</h1>
<p>내 첫 번째 웹페이지야.</p>
<button onclick="alert('성공!')">눌러 봐</button>
<style>
body { font-family: sans-serif; padding: 24px; color: #333; }
button { padding: 10px 16px; }
</style></textarea></div>
        <div class="editor-preview"><label>미리보기</label><iframe id="code-preview" sandbox="allow-scripts" title="코드 미리보기"></iframe></div>
      </div>
    </div>`;
}

function renderDocs(): string {
  return `
    <div class="app-page docs-page">
      <div class="docs-toolbar"><button data-format="bold"><b>B</b></button><button data-format="italic"><i>I</i></button><button data-format="underline"><u>U</u></button><button id="docs-save">💾 저장</button></div>
      <input id="docs-title" class="document-title" value="제목 없는 문서">
      <div id="docs-editor" class="document-editor" contenteditable="true">여기에서 문서를 작성해 봐.</div>
      <p class="muted" id="docs-status">문서는 브라우저에 저장할 수 있어.</p>
    </div>`;
}

function renderSlides(): string {
  return `
    <div class="app-page slides-page">
      <div class="slides-toolbar"><strong>IEUM Slides</strong><button id="slide-add">＋ 슬라이드 추가</button><button id="slide-save">저장</button></div>
      <div class="slides-workspace"><aside id="slide-list"><button class="slide-thumb active" data-slide="0">1</button></aside>
        <div class="slide-canvas" id="slide-canvas" contenteditable="true"><h1>새로운 시작</h1><p>아이디어를 현실로.</p></div>
      </div>
      <p class="muted" id="slide-status">슬라이드 내용을 클릭해 수정해.</p>
    </div>`;
}

function renderSheets(): string {
  return `
    <div class="app-page sheets-page">
      <div class="sheets-toolbar"><strong>IEUM Sheets</strong><button id="sheet-add">＋ 행 추가</button><button id="sheet-save">저장</button></div>
      <div class="sheet-wrap"><table id="sheet-table"><thead><tr><th>A</th><th>B</th><th>C</th></tr></thead><tbody>
      ${Array.from({length: 8}, (_, i) => `<tr>${Array.from({length: 3}, (_, j) => `<td contenteditable="true">${i === 0 ? ["항목", "수량", "메모"][j] : ""}</td>`).join("")}</tr>`).join("")}
      </tbody></table></div>
      <p class="muted" id="sheet-status">셀을 클릭해서 입력해.</p>
    </div>`;
}

function renderNotes(): string {
  return `
    <div class="app-page notes-page">
      <div class="notes-heading"><div><span class="eyebrow">QUICK CAPTURE</span><h2>메모장</h2></div><span>📝</span></div>
      <textarea id="notes-content" placeholder="지금 떠오르는 생각을 적어 봐...">${escapeHTML(data.notes)}</textarea>
      <div class="notes-footer"><span id="notes-status">자동 저장 준비</span><button class="primary-button" id="notes-clear">비우기</button></div>
    </div>`;
}

function renderTodo(): string {
  return `
    <div class="app-page todo-page">
      <span class="eyebrow">YOUR DAY, YOUR WAY</span><h1>오늘의 할 일</h1><p>작은 한 걸음도 기록해 봐.</p>
      <form id="todo-form" class="todo-form"><input id="todo-input" placeholder="새로운 할 일..." required><button>＋</button></form>
      <div class="todo-progress"><div id="todo-progress-fill"></div></div><div class="todo-list" id="todo-list"></div>
      <p class="muted" id="todo-count"></p>
    </div>`;
}

function renderTerminal(): string {
  return `
    <div class="terminal-page">
      <div class="terminal-output" id="terminal-output"><p>Marst OS [Version 0.1.0]</p><p>브라우저용 시뮬레이션 터미널. <code>help</code>를 입력해 봐.</p></div>
      <form id="terminal-form"><span>PS MarstOS&gt;</span><input id="terminal-input" autocomplete="off" autofocus></form>
    </div>`;
}

function renderSettings(): string {
  return `
    <div class="app-page settings-page">
      <span class="eyebrow">PERSONALIZE YOUR SPACE</span><h1>설정</h1>
      <section class="settings-section"><h3>🎨 테마</h3><p>OS의 분위기를 바꿔 봐.</p>
        <div class="theme-options"><button data-theme="sunset">🌇 노을</button><button data-theme="night">🌌 밤하늘</button><button data-theme="ocean">🌊 바다</button></div>
      </section>
      <section class="settings-section"><h3>🖥️ 시스템</h3><div class="setting-row"><span>운영체제</span><strong>Marst OS 0.1.0</strong></div><div class="setting-row"><span>저장 방식</span><strong>브라우저 로컬 저장</strong></div></section>
      <section class="settings-section"><h3>🧹 데이터</h3><p>메모, 할 일, 게임 기록을 초기화해.</p><button class="danger-button" id="settings-reset">모든 데이터 초기화</button></section>
    </div>`;
}

function renderMyPC(): string {
  return `
    <div class="app-page">
      <div class="mypc-hero"><span>🖥️</span><div><h1>Marst PC</h1><p>나만의 디지털 공간</p></div></div>
      <div class="info-grid">
        ${card("시스템", "Marst OS · 버전 0.1.0", "⚙️")}
        ${card("앱 카탈로그", "게임과 작업 도구", "🛍️")}
        ${card("로컬 데이터", "브라우저 저장소 사용", "💾")}
        ${card("오리지널 앱", "Marst Originals", "✨")}
      </div>
      <p class="muted">웹 OS는 브라우저 안에서 실행돼. 실제 Windows 시스템 파일이나 PC 디스크를 직접 변경하지 않아.</p>
    </div>`;
}

function renderFiles(): string {
  return `
    <div class="app-page files-page">
      <div class="files-toolbar"><h2>📁 파일 관리자</h2><button id="file-new">＋ 새 텍스트 파일</button></div>
      <div class="files-path">⌂ 이 PC　›　사용자 파일</div>
      <div class="file-list" id="file-list"></div>
      <p class="muted">이 파일 목록은 Marst OS 안에 저장되는 가상 파일이야.</p>
    </div>`;
}

function renderBrowser(): string {
  return `
    <div class="browser-page">
      <form id="browser-form" class="browser-toolbar"><button type="button" id="browser-back">‹</button><button type="button" id="browser-forward">›</button><input id="browser-url" value="https://example.com" placeholder="웹 주소 입력"><button>이동</button></form>
      <iframe id="browser-frame" src="about:blank" title="인터넷" sandbox="allow-forms allow-scripts allow-same-origin allow-popups"></iframe>
      <p class="browser-note">일부 사이트는 보안 정책 때문에 iframe에서 열리지 않을 수 있어.</p>
    </div>`;
}

function renderMood(): string {
  return `
    <div class="app-page mood-page">
      <span class="eyebrow">A LITTLE MOMENT FOR YOU</span><h1>오늘의 분위기</h1>
      <div class="mood-sky">🌅<span>✦</span></div>
      <p>오늘 너의 마음과 가장 가까운 풍경은?</p>
      <div class="mood-options">${["노을", "고요한 밤", "맑은 아침", "비 오는 날", "새로운 시작"].map(m => `<button data-mood="${m}" class="${data.mood === m ? "selected" : ""}">${m}</button>`).join("")}</div>
      <p class="mood-result" id="mood-result">오늘의 키워드: <strong>${escapeHTML(data.mood)}</strong></p>
    </div>`;
}

function renderStarMap(): string {
  return `
    <div class="app-page starmap-page">
      <span class="eyebrow">PERSONAL UNIVERSE</span><h1>StarMap</h1><p>오늘 탐험하고 싶은 별을 선택해.</p>
      <div class="star-field">${Array.from({length: 28}, (_, i) => `<button class="star-dot" style="left:${(i * 37 + 11) % 94}%;top:${(i * 61 + 7) % 82}%" data-star="${i + 1}" title="별 ${i + 1}">✦</button>`).join("")}</div>
      <div id="star-info" class="star-info">별을 선택하면 탐험 기록을 남길 수 있어.</div>
      <textarea id="star-note" placeholder="이 별에 대한 탐험 기록..." rows="3"></textarea><button class="primary-button" id="star-save">기록 저장</button>
    </div>`;
}

function renderIdea(): string {
  return `
    <div class="app-page idea-page">
      <span class="eyebrow">THINK DIFFERENTLY</span><h1>Idea Forge</h1><p>서로 다른 개념을 조합해서 새로운 아이디어를 만들어 봐.</p>
      <div class="idea-pair"><div id="idea-a">우주</div><span>＋</span><div id="idea-b">음악</div></div>
      <button class="primary-button wide" id="idea-generate">✨ 아이디어 조합</button>
      <div class="idea-result" id="idea-result">조합 버튼을 눌러 아이디어를 발견해 봐.</div>
      <button class="secondary-button wide" id="idea-save">아이디어를 파일로 저장</button>
    </div>`;
}

function renderFocus(): string {
  return `
    <div class="app-page focus-page">
      <span class="eyebrow">GROW ONE STEP AT A TIME</span><h1>Focus Garden</h1><p>집중할수록 정원이 자라나.</p>
      <div class="garden-visual" id="garden-visual">🌱</div>
      <div class="focus-time"><strong id="focus-time">25:00</strong><span>집중 타이머</span></div>
      <div class="focus-actions"><button class="primary-button" id="focus-start">시작</button><button class="secondary-button" id="focus-pause">일시정지</button><button class="secondary-button" id="focus-reset">초기화</button></div>
      <p class="muted">누적 집중 시간: <strong id="focus-total">${data.focusMinutes}분</strong></p>
    </div>`;
}

function renderDetective(): string {
  return `
    <div class="app-page detective-page">
      <span class="eyebrow">CASE FILE #001</span><h1>🔎 사라진 별 조각</h1>
      <div class="case-note">전시실의 별 조각이 사라졌어. 용의자는 세 명. 단서는 다음과 같아.</div>
      <ul class="clue-list"><li>민: “나는 전시실에 들어가지 않았어.”</li><li>서: “민은 전시실에 들어갔어.”</li><li>윤: “서의 말은 거짓이야.”</li></ul>
      <p>세 사람 중 <strong>진실을 말하는 사람은 정확히 한 명</strong>이야. 누가 범인일까?</p>
      <div class="detective-options">${["민", "서", "윤"].map(name => `<button data-suspect="${name}">${name}</button>`).join("")}</div>
      <div id="detective-result" class="detective-result">추리를 선택해 봐.</div>
      <button class="secondary-button" id="detective-hint">힌트</button>
    </div>`;
}

function renderCalculator(): string {
  return `
    <div class="app-page calculator-page">
      <div id="calc-display">0</div>
      <div class="calc-grid">${["C","⌫","%","÷","7","8","9","×","4","5","6","−","1","2","3","+","±","0",".","="].map(k => `<button data-calc="${k}" class="${["÷","×","−","+","="].includes(k) ? "calc-op" : ""}">${k}</button>`).join("")}</div>
    </div>`;
}

export function renderApp(appId: string, _state: Record<string, unknown> = {}): string {
  switch (appId) {
    case "store": return storeApp();
    case "mypc": return renderMyPC();
    case "settings": return renderSettings();
    case "files": return renderFiles();
    case "browser": return renderBrowser();
    case "snake": return renderSnake();
    case "baseball": return renderBaseball();
    case "survivor": return renderSurvivor();
    case "tycoon": return renderTycoon();
    case "coding": return renderCoding();
    case "docs": return renderDocs();
    case "ppt": return renderSlides();
    case "excel": return renderSheets();
    case "notes": return renderNotes();
    case "todo": return renderTodo();
    case "terminal": return renderTerminal();
    case "mood": return renderMood();
    case "starmap": return renderStarMap();
    case "idea": return renderIdea();
    case "focus": return renderFocus();
    case "detective": return renderDetective();
    case "calculator": return renderCalculator();
    default: return `<div class="app-page"><h2>앱을 찾을 수 없어.</h2></div>`;
  }
}

export function mountApp(appId: string, root: HTMLElement, launch: (id: string) => void): void {
  if (appId === "store") {
    let category = "all";
    let query = "";
    const results = root.querySelector<HTMLElement>("#store-results")!;
    const update = () => renderStoreResults(results, appDefinitions, category, query);
    update();

    root.querySelectorAll<HTMLElement>("[data-category]").forEach(tab => {
      tab.addEventListener("click", () => {
        category = tab.dataset.category!;
        root.querySelectorAll(".store-tab").forEach(t => t.classList.toggle("active", t === tab));
        update();
      });
    });
    root.querySelector<HTMLInputElement>("#store-search")?.addEventListener("input", e => {
      query = (e.target as HTMLInputElement).value;
      update();
    });
  }

  if (appId === "notes") {
    const area = root.querySelector<HTMLTextAreaElement>("#notes-content")!;
    area.addEventListener("input", () => {
      data.notes = area.value;
      save();
      root.querySelector("#notes-status")!.textContent = "✓ 자동 저장됨";
    });
    root.querySelector("#notes-clear")?.addEventListener("click", () => {
      if (confirm("메모를 비울까?")) {
        area.value = "";
        data.notes = "";
        save();
      }
    });
  }

  if (appId === "todo") {
    const list = root.querySelector<HTMLElement>("#todo-list")!;
    const count = root.querySelector<HTMLElement>("#todo-count")!;
    const fill = root.querySelector<HTMLElement>("#todo-progress-fill")!;
    const update = () => {
      list.innerHTML = data.todos.map(t => `
        <div class="todo-item ${t.done ? "done" : ""}">
          <label><input type="checkbox" data-todo="${t.id}" ${t.done ? "checked" : ""}><span>${escapeHTML(t.text)}</span></label>
          <button data-delete-todo="${t.id}">×</button>
        </div>`).join("") || `<div class="empty-state">아직 할 일이 없어. 하나 추가해 봐!</div>`;
      const done = data.todos.filter(t => t.done).length;
      count.textContent = `${done} / ${data.todos.length} 완료`;
      fill.style.width = `${data.todos.length ? done / data.todos.length * 100 : 0}%`;
      list.querySelectorAll<HTMLInputElement>("[data-todo]").forEach(el => el.addEventListener("change", () => {
        const t = data.todos.find(t => t.id === Number(el.dataset.todo));
        if (t) t.done = el.checked;
        save(); update();
      }));
      list.querySelectorAll<HTMLElement>("[data-delete-todo]").forEach(el => el.addEventListener("click", () => {
        data.todos = data.todos.filter(t => t.id !== Number(el.dataset.deleteTodo));
        save(); update();
      }));
    };
    root.querySelector("#todo-form")?.addEventListener("submit", e => {
      e.preventDefault();
      const input = root.querySelector<HTMLInputElement>("#todo-input")!;
      const text = input.value.trim();
      if (!text) return;
      data.todos.push({ id: Date.now(), text, done: false });
      input.value = "";
      save(); update();
    });
    update();
  }

  if (appId === "mypc") {
    root.querySelectorAll("[data-launch]").forEach(el => el.addEventListener("click", () => launch((el as HTMLElement).dataset.launch!)));
  }

  if (appId === "files") {
    const list = root.querySelector<HTMLElement>("#file-list")!;
    const update = () => {
      list.innerHTML = data.files.map((f, i) => `
        <button class="file-row" data-file="${i}"><span>📄</span><span><strong>${escapeHTML(f.name)}</strong><small>${escapeHTML(f.type)}</small></span><span>›</span></button>`).join("");
      list.querySelectorAll<HTMLElement>("[data-file]").forEach(el => el.addEventListener("click", () => {
        const f = data.files[Number(el.dataset.file)];
        if (!f) return;
        const content = prompt(`${f.name} 내용을 편집해 봐:`, f.content);
        if (content !== null) { f.content = content; save(); }
      }));
    };
    root.querySelector("#file-new")?.addEventListener("click", () => {
      const name = prompt("파일 이름을 입력해 줘.", "새 메모.txt");
      if (!name?.trim()) return;
      data.files.push({ name: name.trim(), content: "", type: "텍스트 문서" });
      save(); update();
    });
    update();
  }

  if (appId === "settings") {
    root.querySelectorAll<HTMLElement>("[data-theme]").forEach(el => el.addEventListener("click", () => {
      document.documentElement.dataset.theme = el.dataset.theme!;
      localStorage.setItem("marst-os-theme", el.dataset.theme!);
    }));
    root.querySelector("#settings-reset")?.addEventListener("click", () => {
      if (confirm("모든 메모, 할 일, 게임 기록을 초기화할까?")) {
        localStorage.removeItem(KEY);
        location.reload();
      }
    });
  }

  if (appId === "browser") {
    const frame = root.querySelector<HTMLIFrameElement>("#browser-frame")!;
    const form = root.querySelector<HTMLFormElement>("#browser-form")!;
    const url = root.querySelector<HTMLInputElement>("#browser-url")!;
    const history: string[] = [];
    let index = -1;
    const go = (target: string) => {
      let normalized = target.trim();
      if (!normalized) return;
      if (!/^https?:\/\//i.test(normalized)) normalized = `https://${normalized}`;
      try { new URL(normalized); } catch { return; }
      history.splice(index + 1);
      history.push(normalized);
      index = history.length - 1;
      url.value = normalized;
      frame.src = normalized;
    };
    form.addEventListener("submit", e => { e.preventDefault(); go(url.value); });
    root.querySelector("#browser-back")?.addEventListener("click", () => {
      if (index > 0) { index--; url.value = history[index]; frame.src = history[index]; }
    });
    root.querySelector("#browser-forward")?.addEventListener("click", () => {
      if (index < history.length - 1) { index++; url.value = history[index]; frame.src = history[index]; }
    });
    go(url.value);
  }

  if (appId === "coding") {
    const source = root.querySelector<HTMLTextAreaElement>("#code-source")!;
    const preview = root.querySelector<HTMLIFrameElement>("#code-preview")!;
    const run = () => { preview.srcdoc = source.value; };
    root.querySelector("#code-run")?.addEventListener("click", run);
    run();
  }

  if (appId === "docs") {
    const editor = root.querySelector<HTMLElement>("#docs-editor")!;
    const title = root.querySelector<HTMLInputElement>("#docs-title")!;
    const saved = localStorage.getItem("marst-docs");
    if (saved) {
      try { const obj = JSON.parse(saved); title.value = obj.title; editor.innerHTML = obj.content; } catch {}
    }
    root.querySelectorAll<HTMLElement>("[data-format]").forEach(el => el.addEventListener("click", () => {
      editor.focus();
      document.execCommand(el.dataset.format!);
    }));
    root.querySelector("#docs-save")?.addEventListener("click", () => {
      localStorage.setItem("marst-docs", JSON.stringify({ title: title.value, content: editor.innerHTML }));
      root.querySelector("#docs-status")!.textContent = "✓ 문서가 저장됐어.";
    });
  }

  if (appId === "ppt") {
    const canvas = root.querySelector<HTMLElement>("#slide-canvas")!;
    const list = root.querySelector<HTMLElement>("#slide-list")!;
    const slides = [canvas.innerHTML];
    let current = 0;
    const drawList = () => {
      list.innerHTML = slides.map((_, i) => `<button class="slide-thumb ${i === current ? "active" : ""}" data-slide="${i}">${i + 1}</button>`).join("");
      list.querySelectorAll<HTMLElement>("[data-slide]").forEach(el => el.addEventListener("click", () => {
        slides[current] = canvas.innerHTML;
        current = Number(el.dataset.slide);
        canvas.innerHTML = slides[current];
        drawList();
      }));
    };
    root.querySelector("#slide-add")?.addEventListener("click", () => {
      slides[current] = canvas.innerHTML;
      slides.push("<h1>새 슬라이드</h1><p>내용을 입력해.</p>");
      current = slides.length - 1; canvas.innerHTML = slides[current]; drawList();
    });
    root.querySelector("#slide-save")?.addEventListener("click", () => {
      slides[current] = canvas.innerHTML;
      localStorage.setItem("marst-slides", JSON.stringify(slides));
      root.querySelector("#slide-status")!.textContent = "✓ 슬라이드가 저장됐어.";
    });
    drawList();
  }

  if (appId === "excel") {
    root.querySelector("#sheet-add")?.addEventListener("click", () => {
      const body = root.querySelector("#sheet-table tbody")!;
      const row = document.createElement("tr");
      row.innerHTML = "<td contenteditable='true'></td><td contenteditable='true'></td><td contenteditable='true'></td>";
      body.append(row);
    });
    root.querySelector("#sheet-save")?.addEventListener("click", () => {
      const rows = [...root.querySelectorAll("#sheet-table tr")].map(row =>
        [...row.querySelectorAll("th,td")].map(cell => cell.textContent)
      );
      localStorage.setItem("marst-sheets", JSON.stringify(rows));
      root.querySelector("#sheet-status")!.textContent = "✓ 표가 저장됐어.";
    });
  }

  if (appId === "terminal") {
    const form = root.querySelector<HTMLFormElement>("#terminal-form")!;
    const input = root.querySelector<HTMLInputElement>("#terminal-input")!;
    const output = root.querySelector<HTMLElement>("#terminal-output")!;
    const print = (html: string) => { output.insertAdjacentHTML("beforeend", `<p>${html}</p>`); output.scrollTop = output.scrollHeight; };
    form.addEventListener("submit", e => {
      e.preventDefault();
      const cmd = input.value.trim();
      print(`<span class="terminal-prompt">PS MarstOS&gt;</span> ${escapeHTML(cmd)}`);
      input.value = "";
      const commands: Record<string, string> = {
        help: "사용 가능: help, date, time, whoami, apps, clear, echo [문장], about",
        whoami: "Marst",
        apps: appDefinitions.map(a => escapeHTML(a.name)).join(" · "),
        about: "Marst OS 브라우저 시뮬레이션 터미널 v0.1.0",
        date: new Date().toLocaleDateString("ko-KR"),
        time: new Date().toLocaleTimeString("ko-KR"),
        clear: ""
      };
      if (cmd === "clear") output.innerHTML = "";
      else if (cmd.startsWith("echo ")) print(escapeHTML(cmd.slice(5)));
      else print(commands[cmd] ?? "알 수 없는 명령어야. help를 입력해 봐.");
    });
  }

  if (appId === "snake") {
    const canvas = root.querySelector<HTMLCanvasElement>("#snake-canvas")!;
    const ctx = canvas.getContext("2d")!;
    const cell = 18;
    const cells = 20;
    let snake: { x: number; y: number }[] = [];
    let food = { x: 10, y: 10 };
    let dir = { x: 1, y: 0 };
    let next = { x: 1, y: 0 };
    let score = 0;
    let timer = 0;
    let running = false;

    const draw = () => {
      ctx.fillStyle = "#111827"; ctx.fillRect(0, 0, 360, 360);
      ctx.strokeStyle = "#202b3c";
      for (let i = 0; i <= cells; i++) {
        ctx.beginPath(); ctx.moveTo(i * cell, 0); ctx.lineTo(i * cell, 360); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, i * cell); ctx.lineTo(360, i * cell); ctx.stroke();
      }
      ctx.fillStyle = "#fb7185"; ctx.beginPath(); ctx.arc(food.x * cell + 9, food.y * cell + 9, 7, 0, Math.PI * 2); ctx.fill();
      snake.forEach((p, i) => { ctx.fillStyle = i === 0 ? "#a7f3d0" : "#34d399"; ctx.fillRect(p.x * cell + 2, p.y * cell + 2, 14, 14); });
    };
    const reset = () => {
      snake = [{ x: 8, y: 10 }, { x: 7, y: 10 }, { x: 6, y: 10 }];
      food = { x: 14, y: 10 }; dir = { x: 1, y: 0 }; next = { ...dir }; score = 0; running = true;
      root.querySelector("#snake-score")!.textContent = "0";
      root.querySelector("#snake-status")!.textContent = "플레이 중!";
      draw();
      clearInterval(timer);
      timer = window.setInterval(step, 115);
    };
    const step = () => {
      dir = next;
      const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };
      if (head.x < 0 || head.y < 0 || head.x >= cells || head.y >= cells || snake.some(p => p.x === head.x && p.y === head.y)) {
        running = false; clearInterval(timer);
        root.querySelector("#snake-status")!.textContent = `게임 종료! 점수: ${score}`;
        return;
      }
      snake.unshift(head);
      if (head.x === food.x && head.y === food.y) {
        score += 10;
        root.querySelector("#snake-score")!.textContent = String(score);
        do { food = { x: Math.floor(Math.random() * cells), y: Math.floor(Math.random() * cells) }; }
        while (snake.some(p => p.x === food.x && p.y === food.y));
      } else snake.pop();
      draw();
    };
    const setDir = (d: string) => {
      const map: Record<string, { x: number; y: number }> = {
        up: { x: 0, y: -1 }, down: { x: 0, y: 1 }, left: { x: -1, y: 0 }, right: { x: 1, y: 0 }
      };
      const v = map[d]; if (v && v.x !== -dir.x || v && v.y !== -dir.y) next = v;
    };
    root.querySelector("#snake-start")?.addEventListener("click", reset);
    root.querySelectorAll<HTMLElement>("[data-dir]").forEach(el => el.addEventListener("click", () => setDir(el.dataset.dir!)));
    const key = (e: KeyboardEvent) => {
      if (!root.isConnected || !running) return;
      const map: Record<string, string> = { ArrowUp: "up", w: "up", ArrowDown: "down", s: "down", ArrowLeft: "left", a: "left", ArrowRight: "right", d: "right" };
      if (map[e.key]) { e.preventDefault(); setDir(map[e.key]); }
    };
    window.addEventListener("keydown", key);
    draw();
  }

  if (appId === "baseball") {
    let score = 0;
    let best = Number(localStorage.getItem("marst-baseball-best") || 0);
    let active = false;
    let started = 0;
    let timer = 0;
    root.querySelector("#baseball-best")!.textContent = String(best);
    const ball = root.querySelector<HTMLElement>("#baseball-ball")!;
    const pitch = root.querySelector<HTMLButtonElement>("#baseball-pitch")!;
    const hit = root.querySelector<HTMLButtonElement>("#baseball-hit")!;
    const status = root.querySelector<HTMLElement>("#baseball-status")!;
    pitch.onclick = () => {
      clearTimeout(timer); active = true; started = performance.now();
      ball.style.transition = "none"; ball.style.left = "8%"; ball.style.opacity = "1";
      void ball.offsetWidth;
      ball.style.transition = "left 1.4s linear"; ball.style.left = "76%";
      hit.disabled = false; pitch.disabled = true; status.textContent = "지금 타격 버튼을 눌러!";
      timer = window.setTimeout(() => { active = false; hit.disabled = true; pitch.disabled = false; status.textContent = "스트라이크! 다시 던져 봐."; }, 1450);
    };
    hit.onclick = () => {
      if (!active) return;
      const elapsed = performance.now() - started;
      active = false; clearTimeout(timer); hit.disabled = true; pitch.disabled = false;
      const accuracy = Math.abs(elapsed - 850);
      const points = accuracy < 150 ? 3 : accuracy < 350 ? 2 : accuracy < 550 ? 1 : 0;
      score += points;
      root.querySelector("#baseball-score")!.textContent = String(score);
      status.textContent = points ? `${["", "안타!", "2루타!", "홈런!"][points]} +${points}점` : "헛스윙! 타이밍을 다시 맞춰 봐.";
      if (score > best) { best = score; localStorage.setItem("marst-baseball-best", String(best)); root.querySelector("#baseball-best")!.textContent = String(best); }
    };
  }

  if (appId === "survivor") {
    const arena = root.querySelector<HTMLElement>("#survivor-arena")!;
    const player = root.querySelector<HTMLElement>("#survivor-player")!;
    let x = 50, y = 50, score = 0, seconds = 0, timer = 0, spawn = 0, running = false;
    const enemies: HTMLElement[] = [];
    const move = (dir: string) => {
      const step = 7;
      if (dir === "left") x -= step;
      if (dir === "right") x += step;
      if (dir === "up") y -= step;
      if (dir === "down") y += step;
      x = Math.max(5, Math.min(95, x)); y = Math.max(7, Math.min(92, y));
      player.style.left = `${x}%`; player.style.top = `${y}%`;
    };
    root.querySelectorAll<HTMLElement>("[data-move]").forEach(el => el.addEventListener("click", () => move(el.dataset.move!)));
    root.querySelector("#survivor-start")?.addEventListener("click", () => {
      clearInterval(timer); clearInterval(spawn); enemies.forEach(e => e.remove()); enemies.length = 0;
      x = 50; y = 50; score = 0; seconds = 0; running = true;
      root.querySelector("#survivor-status")!.textContent = "적을 피하며 살아남아!";
      timer = window.setInterval(() => {
        seconds++;
        root.querySelector("#survivor-time")!.textContent = `${seconds}초`;
        score += 1;
        root.querySelector("#survivor-score")!.textContent = String(score);
      }, 1000);
      spawn = window.setInterval(() => {
        const enemy = document.createElement("span");
        enemy.className = "survivor-enemy"; enemy.textContent = "🧟";
        enemy.style.left = `${Math.random() * 90 + 5}%`; enemy.style.top = `${Math.random() * 85 + 5}%`;
        arena.append(enemy); enemies.push(enemy);
        window.setTimeout(() => { enemy.remove(); const i = enemies.indexOf(enemy); if (i >= 0) enemies.splice(i, 1); }, 3000);
      }, 1000);
      const check = window.setInterval(() => {
        if (!root.isConnected || !running) { clearInterval(check); return; }
        const p = player.getBoundingClientRect();
        for (const e of enemies) {
          const r = e.getBoundingClientRect();
          if (Math.abs(p.x - r.x) < 22 && Math.abs(p.y - r.y) < 22) {
            running = false; clearInterval(timer); clearInterval(spawn); clearInterval(check);
            root.querySelector("#survivor-status")!.textContent = `잡혔어! 생존 시간: ${seconds}초`;
            break;
          }
        }
      }, 150);
    });
  }

  if (appId === "tycoon") {
    const update = () => {
      root.querySelector("#tycoon-money")!.textContent = `${data.money.toLocaleString()} 코인`;
      root.querySelector("#tycoon-level")!.textContent = String(data.level);
      root.querySelector("#tycoon-income")!.textContent = String(data.level * 2);
      root.querySelector("#tycoon-collect")!.textContent = `💰 수익 받기 (+${data.level * 2})`;
      root.querySelector("#tycoon-upgrade")!.textContent = `🏗️ 사업 업그레이드 (${data.level * 30} 코인)`;
    };
    root.querySelector("#tycoon-collect")?.addEventListener("click", () => {
      data.money += data.level * 2; save(); update();
      root.querySelector("#tycoon-status")!.textContent = `수익을 받았어! 현재 ${data.money} 코인`;
    });
    root.querySelector("#tycoon-upgrade")?.addEventListener("click", () => {
      const cost = data.level * 30;
      if (data.money < cost) { root.querySelector("#tycoon-status")!.textContent = "코인이 부족해. 수익을 먼저 모아 봐."; return; }
      data.money -= cost; data.level++; save(); update();
      root.querySelector("#tycoon-status")!.textContent = `업그레이드 성공! 이제 레벨 ${data.level}이야.`;
    });
    update();
  }

  if (appId === "mood") {
    root.querySelectorAll<HTMLElement>("[data-mood]").forEach(el => el.addEventListener("click", () => {
      data.mood = el.dataset.mood!; save();
      root.querySelectorAll("[data-mood]").forEach(b => b.classList.toggle("selected", b === el));
      root.querySelector("#mood-result")!.innerHTML = `오늘의 키워드: <strong>${escapeHTML(data.mood)}</strong>`;
    }));
  }

  if (appId === "starmap") {
    let selected = 1;
    const note = root.querySelector<HTMLTextAreaElement>("#star-note")!;
    const notes = JSON.parse(localStorage.getItem("marst-star-notes") || "{}") as Record<string, string>;
    root.querySelectorAll<HTMLElement>("[data-star]").forEach(el => el.addEventListener("click", () => {
      selected = Number(el.dataset.star);
      root.querySelectorAll(".star-dot").forEach(s => s.classList.toggle("selected", s === el));
      root.querySelector("#star-info")!.textContent = `별 #${selected} · 탐험 기록`;
      note.value = notes[String(selected)] || "";
    }));
    root.querySelector("#star-save")?.addEventListener("click", () => {
      notes[String(selected)] = note.value;
      localStorage.setItem("marst-star-notes", JSON.stringify(notes));
      root.querySelector("#star-info")!.textContent = `별 #${selected}의 기록을 저장했어.`;
    });
  }

  if (appId === "idea") {
    const pairs = [
      ["우주", "음악", "행성마다 고유한 소리를 부여하는 인터랙티브 우주 음악 지도"],
      ["야구", "AI", "투구 궤적을 분석해 타격 타이밍을 연습하는 스마트 타격장"],
      ["시간", "정원", "집중할 때마다 가상 정원이 자라는 시간 관리 앱"],
      ["미스터리", "코딩", "코드를 분석해야 풀리는 인터랙티브 추리 사건"],
      ["날씨", "게임", "실제 날씨에 따라 맵과 퀘스트가 달라지는 탐험 게임"],
      ["책", "우주", "책을 읽을수록 새로운 행성이 열리는 독서 은하계"]
    ];
    let current = "";
    root.querySelector("#idea-generate")?.addEventListener("click", () => {
      const p = pairs[Math.floor(Math.random() * pairs.length)];
      current = p[2];
      root.querySelector("#idea-a")!.textContent = p[0];
      root.querySelector("#idea-b")!.textContent = p[1];
      root.querySelector("#idea-result")!.textContent = current;
    });
    root.querySelector("#idea-save")?.addEventListener("click", () => {
      if (!current) return;
      data.files.push({ name: `아이디어-${Date.now()}.txt`, content: current, type: "아이디어" });
      save();
      root.querySelector("#idea-result")!.textContent = "✓ 파일 관리자에 아이디어를 저장했어.";
    });
  }

  if (appId === "focus") {
    let remaining = 25 * 60, timer = 0, startedAt = 0, elapsed = 0;
    const display = root.querySelector<HTMLElement>("#focus-time")!;
    const draw = () => {
      display.textContent = `${Math.floor(remaining / 60).toString().padStart(2, "0")}:${(remaining % 60).toString().padStart(2, "0")}`;
      root.querySelector("#garden-visual")!.textContent = data.focusMinutes < 10 ? "🌱" : data.focusMinutes < 30 ? "🌿" : data.focusMinutes < 60 ? "🌳" : "🌳🌼";
      root.querySelector("#focus-total")!.textContent = `${data.focusMinutes}분`;
    };
    root.querySelector("#focus-start")?.addEventListener("click", () => {
      if (timer) return;
      startedAt = Date.now();
      timer = window.setInterval(() => {
        remaining--;
        elapsed++;
        if (elapsed >= 60) { data.focusMinutes++; elapsed = 0; save(); }
        draw();
        if (remaining <= 0) {
          clearInterval(timer); timer = 0;
          data.focusMinutes += Math.floor(elapsed / 60); elapsed = 0; save();
          root.querySelector("#focus-time")!.textContent = "완료!";
          root.querySelector("#focus-total")!.textContent = `${data.focusMinutes}분`;
          root.querySelector("#garden-visual")!.textContent = "🌳🌼✨";
        }
      }, 1000);
    });
    root.querySelector("#focus-pause")?.addEventListener("click", () => {
      clearInterval(timer); timer = 0;
      if (elapsed >= 60) { data.focusMinutes++; elapsed -= 60; save(); }
      draw();
    });
    root.querySelector("#focus-reset")?.addEventListener("click", () => {
      clearInterval(timer); timer = 0; remaining = 1500; elapsed = 0; draw();
    });
    draw();
  }

  if (appId === "detective") {
    root.querySelectorAll<HTMLElement>("[data-suspect]").forEach(el => el.addEventListener("click", () => {
      const answers: Record<string, string> = {
        민: "세 명의 말이 모두 모순 없이 성립하는지 확인해 봐.",
        서: "민이 진실이면 서도 진실이고, 윤은 거짓이 돼. 진실이 두 명이 되지.",
        윤: "민이 거짓이면 서도 거짓이고 윤은 진실이야. 진실은 한 명뿐이야."
      };
      const result = root.querySelector<HTMLElement>("#detective-result")!;
      result.textContent = el.dataset.suspect === "윤"
        ? "정답! 윤이 범인이야. 민과 서는 거짓을 말하고, 윤만 진실을 말해."
        : `아직 아니야. ${answers[el.dataset.suspect!]}`;
    }));
    root.querySelector("#detective-hint")?.addEventListener("click", () => {
      root.querySelector("#detective-result")!.textContent = "힌트: 민이 거짓이면 민은 전시실에 들어갔고, 서의 말은 거짓이 돼. 그러면 윤의 말은 진실이야.";
    });
  }

  if (appId === "calculator") {
    let expression = "0";
    const display = root.querySelector<HTMLElement>("#calc-display")!;
    const update = () => display.textContent = expression;
    root.querySelectorAll<HTMLElement>("[data-calc]").forEach(el => el.addEventListener("click", () => {
      const key = el.dataset.calc!;
      if (key === "C") expression = "0";
      else if (key === "⌫") expression = expression.length > 1 ? expression.slice(0, -1) : "0";
      else if (key === "±") expression = expression.startsWith("-") ? expression.slice(1) : `-${expression}`;
      else if (key === "=") {
        try {
          const safe = expression.replace(/×/g, "*").replace(/÷/g, "/").replace(/−/g, "-");
          if (!/^[0-9+\-*/().%\s]+$/.test(safe)) throw new Error();
          const result = Function(`"use strict"; return (${safe})`)();
          expression = Number.isFinite(result) ? String(Number(result.toFixed(8))) : "오류";
        } catch { expression = "오류"; }
      } else if (key === "%") {
        const n = Number(expression);
        expression = Number.isFinite(n) ? String(n / 100) : "오류";
      } else expression = expression === "0" || expression === "오류" ? key : expression + key;
      update();
    }));
  }
}
