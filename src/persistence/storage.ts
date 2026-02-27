import { GameSnapshot, GameConfig, ReplayData, InputEvent, SaveData } from "../core/types";
import { STORAGE_KEYS, VERSION } from "../config";

export function getHighScore(): number {
  try {
    const val = localStorage.getItem(STORAGE_KEYS.HIGH_SCORE);
    return val ? parseInt(val, 10) : 0;
  } catch {
    return 0;
  }
}

export function setHighScore(score: number): void {
  try {
    const current = getHighScore();
    if (score > current) {
      localStorage.setItem(STORAGE_KEYS.HIGH_SCORE, score.toString());
    }
  } catch {
    /* noop */
  }
}

export function isTutorialShown(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEYS.TUTORIAL_SHOWN) === "true";
  } catch {
    return false;
  }
}

export function setTutorialShown(): void {
  try {
    localStorage.setItem(STORAGE_KEYS.TUTORIAL_SHOWN, "true");
  } catch {
    /* noop */
  }
}

export function saveGame(snapshot: GameSnapshot, config: GameConfig): void {
  try {
    const data: SaveData = {
      snapshot,
      config,
      timestamp: Date.now(),
      version: VERSION,
    };
    localStorage.setItem(STORAGE_KEYS.SAVE_DATA, JSON.stringify(data));
  } catch {
    /* noop */
  }
}

export function loadGame(): SaveData | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SAVE_DATA);
    if (!raw) return null;
    return JSON.parse(raw) as SaveData;
  } catch {
    return null;
  }
}

export function deleteSave(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.SAVE_DATA);
  } catch {
    /* noop */
  }
}

export function saveReplay(config: GameConfig, seed: number, inputs: InputEvent[], finalScore: number): void {
  try {
    const data: ReplayData = { config, seed, inputs, finalScore };
    localStorage.setItem(STORAGE_KEYS.REPLAY, JSON.stringify(data));
  } catch {
    /* noop */
  }
}

export function loadReplay(): ReplayData | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.REPLAY);
    if (!raw) return null;
    return JSON.parse(raw) as ReplayData;
  } catch {
    return null;
  }
}

export function exportReplayAsFile(replay: ReplayData): void {
  const blob = new Blob([JSON.stringify(replay, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `snake-replay-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function getAnalyticsOptIn(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEYS.ANALYTICS_OPT_IN) === "true";
  } catch {
    return false;
  }
}

export function setAnalyticsOptIn(optIn: boolean): void {
  try {
    localStorage.setItem(STORAGE_KEYS.ANALYTICS_OPT_IN, optIn.toString());
  } catch {
    /* noop */
  }
}
