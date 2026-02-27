import {
  Vector2,
  Direction,
  GameState,
  GameConfig,
  GameSnapshot,
  FoodItem,
  PowerUp,
  ActivePowerUp,
  PowerUpType,
  InputEvent,
  Obstacle,
  ChallengeObjective,
} from "./types";
import {
  createSnake,
  moveSnake,
  checkSelfCollision,
  checkObstacleCollision,
  getSnakeOccupiedCells,
  isOppositeDirection,
} from "./snake";
import { spawnFood, checkFoodCollision, removeFood, getAvailableCells } from "./food";
import {
  trySpawnPowerUp,
  checkPowerUpCollision,
  activatePowerUp,
  updateActivePowerUps,
  hasPowerUp,
  removePowerUp,
  getSpeedMultiplier,
  getScoreMultiplier,
} from "./powerup";
import { SeededRandom } from "../utils/math";
import { LevelConfig } from "./types";

export type EngineEvent =
  | { type: "food_eaten"; position: Vector2; score: number }
  | { type: "powerup_collected"; powerUp: PowerUp }
  | { type: "game_over"; score: number; cause: string }
  | { type: "game_start" }
  | { type: "direction_changed"; direction: Direction };

export type EngineEventListener = (event: EngineEvent) => void;

export class GameEngine {
  private config: GameConfig;
  private snake: Vector2[];
  private direction: Direction;
  private nextDirection: Direction;
  private food: FoodItem[];
  private powerUps: PowerUp[];
  private activePowerUps: ActivePowerUp[];
  private obstacles: Obstacle[];
  private score: number;
  private tick: number;
  private speed: number;
  private state: GameState;
  private rng: SeededRandom;
  private inputQueue: Direction[];
  private inputLog: InputEvent[];
  private listeners: EngineEventListener[];
  private level: LevelConfig | null;
  private challenge: ChallengeObjective | null;
  private aiEnabled: boolean;

  constructor(config: GameConfig, level?: LevelConfig) {
    this.config = { ...config };
    this.level = level || null;
    this.listeners = [];
    this.inputQueue = [];
    this.inputLog = [];
    this.challenge = null;
    this.aiEnabled = false;

    const seed = config.seed ?? Date.now();
    this.rng = new SeededRandom(seed);

    const spawnPoint = level?.spawnPoint ?? {
      x: Math.floor(config.gridWidth / 2),
      y: Math.floor(config.gridHeight / 2),
    };
    const initialDir = level?.initialDirection ?? Direction.Right;

    this.snake = createSnake(spawnPoint, config.initialSnakeLength, initialDir);
    this.direction = initialDir;
    this.nextDirection = initialDir;
    this.food = [];
    this.powerUps = [];
    this.activePowerUps = [];
    this.obstacles = (level?.obstacles ?? []).map((o) => ({ position: o }));
    this.score = 0;
    this.tick = 0;
    this.speed = config.initialSpeed;
    this.state = GameState.Menu;
  }

  addEventListener(listener: EngineEventListener): void {
    this.listeners.push(listener);
  }

  removeEventListener(listener: EngineEventListener): void {
    this.listeners = this.listeners.filter((l) => l !== listener);
  }

  private emit(event: EngineEvent): void {
    for (const listener of this.listeners) {
      listener(event);
    }
  }

  start(): void {
    this.state = GameState.Playing;
    this.spawnInitialFood();
    this.emit({ type: "game_start" });
  }

  restart(level?: LevelConfig): void {
    const seed = this.config.seed ?? Date.now();
    this.rng = new SeededRandom(seed);

    if (level) this.level = level;

    const spawnPoint = this.level?.spawnPoint ?? {
      x: Math.floor(this.config.gridWidth / 2),
      y: Math.floor(this.config.gridHeight / 2),
    };
    const initialDir = this.level?.initialDirection ?? Direction.Right;

    this.snake = createSnake(spawnPoint, this.config.initialSnakeLength, initialDir);
    this.direction = initialDir;
    this.nextDirection = initialDir;
    this.food = [];
    this.powerUps = [];
    this.activePowerUps = [];
    this.obstacles = (this.level?.obstacles ?? []).map((o) => ({ position: o }));
    this.score = 0;
    this.tick = 0;
    this.speed = this.config.initialSpeed;
    this.inputQueue = [];
    this.inputLog = [];
    this.state = GameState.Playing;

    this.spawnInitialFood();
    this.emit({ type: "game_start" });
  }

  pause(): void {
    if (this.state === GameState.Playing) {
      this.state = GameState.Paused;
    }
  }

  resume(): void {
    if (this.state === GameState.Paused) {
      this.state = GameState.Playing;
    }
  }

  togglePause(): void {
    if (this.state === GameState.Playing) this.pause();
    else if (this.state === GameState.Paused) this.resume();
  }

  setDirection(dir: Direction): void {
    if (this.state !== GameState.Playing) return;
    if (isOppositeDirection(dir, this.direction) && this.snake.length > 1) return;
    if (this.inputQueue.length > 0) {
      const lastQueued = this.inputQueue[this.inputQueue.length - 1];
      if (isOppositeDirection(dir, lastQueued)) return;
      if (lastQueued === dir) return;
    } else if (dir === this.direction) {
      return;
    }

    this.inputQueue.push(dir);
  }

  setAIEnabled(enabled: boolean): void {
    this.aiEnabled = enabled;
  }

  isAIEnabled(): boolean {
    return this.aiEnabled;
  }

  setChallenge(challenge: ChallengeObjective | null): void {
    this.challenge = challenge;
  }

  getChallenge(): ChallengeObjective | null {
    return this.challenge;
  }

  update(): void {
    if (this.state !== GameState.Playing) return;

    if (this.inputQueue.length > 0) {
      const nextDir = this.inputQueue.shift()!;
      if (!isOppositeDirection(nextDir, this.direction)) {
        this.direction = nextDir;
        this.inputLog.push({ tick: this.tick, direction: nextDir });
        this.emit({ type: "direction_changed", direction: nextDir });
      }
    }

    const isGhost = hasPowerUp(this.activePowerUps, PowerUpType.Ghost);

    const { newSegments, head, outOfBounds } = moveSnake(
      this.snake,
      this.direction,
      false,
      this.config
    );

    if (outOfBounds) {
      this.state = GameState.GameOver;
      this.emit({ type: "game_over", score: this.score, cause: "wall" });
      return;
    }

    if (!isGhost && checkSelfCollision(newSegments)) {
      this.state = GameState.GameOver;
      this.emit({ type: "game_over", score: this.score, cause: "self" });
      return;
    }

    const obstaclePositions = this.obstacles.map((o) => o.position);
    if (!isGhost && checkObstacleCollision(head, obstaclePositions)) {
      this.state = GameState.GameOver;
      this.emit({ type: "game_over", score: this.score, cause: "obstacle" });
      return;
    }

    this.snake = newSegments;

    const eatenFood = checkFoodCollision(head, this.food);
    if (eatenFood) {
      this.snake.push(this.snake[this.snake.length - 1]);
      const multiplier = getScoreMultiplier(this.activePowerUps);
      const points = eatenFood.value * multiplier;
      this.score += points;
      this.food = removeFood(this.food, eatenFood);
      this.speed = Math.min(
        this.config.maxSpeed,
        this.speed + this.config.speedIncrementPerFood
      );
      this.emit({ type: "food_eaten", position: eatenFood.position, score: points });

      if (this.challenge) {
        this.challenge.current++;
      }

      this.refillFood();
    }

    const collectedPU = checkPowerUpCollision(head, this.powerUps);
    if (collectedPU) {
      this.activePowerUps = activatePowerUp(collectedPU, this.tick, this.activePowerUps);
      this.powerUps = removePowerUp(this.powerUps, collectedPU);
      this.emit({ type: "powerup_collected", powerUp: collectedPU });
    }

    this.activePowerUps = updateActivePowerUps(this.activePowerUps, this.tick);

    if (this.tick % 30 === 0) {
      const occupied = getSnakeOccupiedCells(this.snake);
      const foodPositions = this.food.map((f) => f.position);
      foodPositions.forEach((fp) => occupied.add(`${fp.x},${fp.y}`));
      const available = getAvailableCells(
        this.config,
        occupied,
        this.obstacles.map((o) => o.position)
      );
      const pu = trySpawnPowerUp(available, this.powerUps, this.rng, this.config, this.tick);
      if (pu) this.powerUps.push(pu);
    }

    this.tick++;
  }

  private spawnInitialFood(): void {
    for (let i = 0; i < this.config.maxFoodOnBoard; i++) {
      this.refillFood();
    }
  }

  private refillFood(): void {
    if (this.food.length >= this.config.maxFoodOnBoard) return;
    const occupied = getSnakeOccupiedCells(this.snake);
    const available = getAvailableCells(
      this.config,
      occupied,
      this.obstacles.map((o) => o.position)
    );
    const newFood = spawnFood(available, this.rng, this.food);
    if (newFood) this.food.push(newFood);
  }

  getEffectiveSpeed(): number {
    return this.speed * getSpeedMultiplier(this.activePowerUps);
  }

  getSnapshot(): GameSnapshot {
    return {
      snake: [...this.snake.map((s) => ({ ...s }))],
      direction: this.direction,
      food: [...this.food.map((f) => ({ ...f, position: { ...f.position } }))],
      powerUps: [...this.powerUps],
      activePowerUps: [...this.activePowerUps],
      obstacles: [...this.obstacles],
      score: this.score,
      tick: this.tick,
      speed: this.speed,
      state: this.state,
    };
  }

  getState(): GameState {
    return this.state;
  }

  getScore(): number {
    return this.score;
  }

  getSnake(): Vector2[] {
    return this.snake;
  }

  getFood(): FoodItem[] {
    return this.food;
  }

  getPowerUps(): PowerUp[] {
    return this.powerUps;
  }

  getActivePowerUps(): ActivePowerUp[] {
    return this.activePowerUps;
  }

  getObstacles(): Obstacle[] {
    return this.obstacles;
  }

  getDirection(): Direction {
    return this.direction;
  }

  getTick(): number {
    return this.tick;
  }

  getConfig(): GameConfig {
    return { ...this.config };
  }

  getInputLog(): InputEvent[] {
    return [...this.inputLog];
  }

  loadSnapshot(snapshot: GameSnapshot): void {
    this.snake = snapshot.snake;
    this.direction = snapshot.direction;
    this.food = snapshot.food;
    this.powerUps = snapshot.powerUps;
    this.activePowerUps = snapshot.activePowerUps;
    this.obstacles = snapshot.obstacles;
    this.score = snapshot.score;
    this.tick = snapshot.tick;
    this.speed = snapshot.speed;
    this.state = snapshot.state;
  }

  updateConfig(partial: Partial<GameConfig>): void {
    Object.assign(this.config, partial);
  }
}
