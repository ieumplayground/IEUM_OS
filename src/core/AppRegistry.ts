export interface AppDefinition {
  id: string;
  name: string;
  icon: string;
  category: "system" | "game" | "work" | "original";
  description: string;
  width?: number;
  height?: number;
}

export const appDefinitions: AppDefinition[] = [
  { id: "store", name: "앱스토어", icon: "🛍️", category: "system", description: "다양한 앱을 만나 봐", width: 850, height: 600 },
  { id: "mypc", name: "내 PC", icon: "🖥️", category: "system", description: "OS 시스템 정보", width: 700, height: 480 },
  { id: "settings", name: "설정", icon: "⚙️", category: "system", description: "나만의 OS 꾸미기", width: 650, height: 500 },
  { id: "files", name: "파일 관리자", icon: "📁", category: "system", description: "내 파일 관리", width: 720, height: 500 },
  { id: "browser", name: "인터넷", icon: "🌐", category: "system", description: "웹사이트 열기", width: 850, height: 600 },

  { id: "snake", name: "스네이크", icon: "🐍", category: "game", description: "먹이를 먹고 성장하는 게임", width: 520, height: 590 },
  { id: "baseball", name: "IEUM 야구", icon: "⚾", category: "game", description: "타이밍을 맞춰 홈런을 노려 봐", width: 600, height: 520 },
  { id: "survivor", name: "서바이버", icon: "🧟", category: "game", description: "몰려오는 적을 버텨라", width: 620, height: 540 },
  { id: "tycoon", name: "미니 타이쿤", icon: "🏙️", category: "game", description: "나만의 사업을 키워 봐", width: 620, height: 520 },

  { id: "coding", name: "IEUM Coding", icon: "💻", category: "work", description: "코드 작성과 미리보기", width: 800, height: 600 },
  { id: "docs", name: "IEUM Docs", icon: "📄", category: "work", description: "문서 작성", width: 760, height: 580 },
  { id: "ppt", name: "IEUM Slides", icon: "📊", category: "work", description: "발표 자료 작성", width: 760, height: 560 },
  { id: "excel", name: "IEUM Sheets", icon: "📈", category: "work", description: "표와 데이터 정리", width: 760, height: 540 },
  { id: "notes", name: "메모장", icon: "📝", category: "work", description: "생각을 빠르게 기록해", width: 560, height: 500 },
  { id: "terminal", name: "PowerShell", icon: "⌨️", category: "work", description: "OS 명령어 실행기", width: 700, height: 450 },
  { id: "todo", name: "To-do", icon: "☑️", category: "work", description: "오늘 할 일 관리", width: 560, height: 500 },

  { id: "mood", name: "MoodSpace", icon: "🌅", category: "original", description: "오늘의 분위기를 기록하는 감성 공간", width: 600, height: 500 },
  { id: "starmap", name: "StarMap", icon: "🌌", category: "original", description: "나만의 우주 탐험 노트", width: 620, height: 520 },
  { id: "idea", name: "Idea Forge", icon: "💡", category: "original", description: "아이디어를 조합해 새로운 발상 만들기", width: 600, height: 500 },
  { id: "focus", name: "Focus Garden", icon: "🌱", category: "original", description: "집중한 시간을 정원으로 키우기", width: 580, height: 500 },
  { id: "detective", name: "Bug Detective", icon: "🔎", category: "original", description: "논리 퍼즐로 사건의 진실 찾기", width: 650, height: 540 },
  { id: "calculator", name: "계산기", icon: "🧮", category: "work", description: "간단한 계산", width: 340, height: 460 }
];

export class AppRegistry {
  constructor(public readonly apps = appDefinitions) {}

  get(id: string): AppDefinition | undefined {
    return this.apps.find(app => app.id === id);
  }

  search(query: string, category = "all"): AppDefinition[] {
    const q = query.trim().toLowerCase();

    return this.apps.filter(app => {
      const categoryMatch = category === "all" || app.category === category;
      const textMatch = !q || `${app.name} ${app.description}`.toLowerCase().includes(q);
      return categoryMatch && textMatch;
    });
  }
}
