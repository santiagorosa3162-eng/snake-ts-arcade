import { GameConfig, PowerUpType } from "./core/types";

export const DEFAULT_CONFIG: GameConfig = {
  gridWidth: 20,
  gridHeight: 20,
  initialSnakeLength: 3,
  initialSpeed: 8,
  speedIncrementPerFood: 0.15,
  maxSpeed: 25,
  maxFoodOnBoard: 1,
  wrapAround: false,
  seed: null,
  powerUpSpawnChance: 0.15,
  powerUpDurations: {
    [PowerUpType.Speed]: 150,
    [PowerUpType.Slow]: 150,
    [PowerUpType.Ghost]: 120,
    [PowerUpType.DoubleScore]: 200,
  },
  cellSize: 24,
};

export const COLORS = {
  background: "#0a0a0a",
  grid: "#141414",
  gridLine: "#1a1a1a",
  snakeHead: "#22c55e",
  snakeBody: "#16a34a",
  snakeGhost: "rgba(34, 197, 94, 0.4)",
  food: "#ef4444",
  foodGlow: "rgba(239, 68, 68, 0.3)",
  obstacle: "#6b7280",
  powerUpSpeed: "#f59e0b",
  powerUpSlow: "#3b82f6",
  powerUpGhost: "#a855f7",
  powerUpDouble: "#ec4899",
  textPrimary: "#f5f5f5",
  textSecondary: "#a3a3a3",
  hudBackground: "rgba(10, 10, 10, 0.85)",
  menuOverlay: "rgba(0, 0, 0, 0.8)",
  particleEat: ["#22c55e", "#4ade80", "#86efac"],
  particleDeath: ["#ef4444", "#f87171", "#fca5a5"],
};

export const KEYS = {
  UP: ["ArrowUp", "KeyW"],
  DOWN: ["ArrowDown", "KeyS"],
  LEFT: ["ArrowLeft", "KeyA"],
  RIGHT: ["ArrowRight", "KeyD"],
  PAUSE: ["Escape", "KeyP"],
  MUTE: ["KeyM"],
  RESTART: ["KeyR"],
} as const;

export const SWIPE_THRESHOLD = 30;
export const SWIPE_MAX_TIME = 300;

export const STORAGE_KEYS = {
  HIGH_SCORE: "snake_high_score",
  SETTINGS: "snake_settings",
  LOCALE: "snake_locale",
  SAVE_DATA: "snake_save",
  REPLAY: "snake_replay",
  TUTORIAL_SHOWN: "snake_tutorial_shown",
  ANALYTICS_OPT_IN: "snake_analytics_opt_in",
} as const;

export const VERSION = "1.0.0";
