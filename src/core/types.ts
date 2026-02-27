export interface Vector2 {
  x: number;
  y: number;
}

export enum Direction {
  Up = "UP",
  Down = "DOWN",
  Left = "LEFT",
  Right = "RIGHT",
}

export enum GameState {
  Menu = "MENU",
  Playing = "PLAYING",
  Paused = "PAUSED",
  GameOver = "GAME_OVER",
}

export enum PowerUpType {
  Speed = "SPEED",
  Slow = "SLOW",
  Ghost = "GHOST",
  DoubleScore = "DOUBLE_SCORE",
}

export interface PowerUp {
  position: Vector2;
  type: PowerUpType;
  duration: number;
  spawnTick: number;
}

export interface ActivePowerUp {
  type: PowerUpType;
  expiresAtTick: number;
}

export interface FoodItem {
  position: Vector2;
  value: number;
}

export interface Obstacle {
  position: Vector2;
}

export interface LevelConfig {
  name: string;
  obstacles: Vector2[];
  spawnPoint: Vector2;
  initialDirection: Direction;
}

export interface GameConfig {
  gridWidth: number;
  gridHeight: number;
  initialSnakeLength: number;
  initialSpeed: number;
  speedIncrementPerFood: number;
  maxSpeed: number;
  maxFoodOnBoard: number;
  wrapAround: boolean;
  seed: number | null;
  powerUpSpawnChance: number;
  powerUpDurations: Record<PowerUpType, number>;
  cellSize: number;
}

export interface GameSnapshot {
  snake: Vector2[];
  direction: Direction;
  food: FoodItem[];
  powerUps: PowerUp[];
  activePowerUps: ActivePowerUp[];
  obstacles: Obstacle[];
  score: number;
  tick: number;
  speed: number;
  state: GameState;
}

export interface InputEvent {
  tick: number;
  direction: Direction;
}

export interface ReplayData {
  config: GameConfig;
  seed: number;
  inputs: InputEvent[];
  finalScore: number;
}

export interface ParticleEffect {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

export type Locale = "es" | "en";

export interface AnalyticsEvent {
  type: "game_start" | "game_over" | "food_eaten" | "powerup_collected" | "level_complete";
  timestamp: number;
  data: Record<string, unknown>;
}

export interface ChallengeObjective {
  id: string;
  description: string;
  target: number;
  current: number;
  timeLimit: number;
  completed: boolean;
}

export interface SaveData {
  snapshot: GameSnapshot;
  config: GameConfig;
  timestamp: number;
  version: string;
}
