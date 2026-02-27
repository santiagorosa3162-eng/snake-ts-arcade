import { Vector2, PowerUp, PowerUpType, ActivePowerUp, GameConfig } from "./types";
import { SeededRandom, vectorInArray } from "../utils/math";

const POWERUP_TYPES = [PowerUpType.Speed, PowerUpType.Slow, PowerUpType.Ghost, PowerUpType.DoubleScore];

export function trySpawnPowerUp(
  availableCells: Vector2[],
  existingPowerUps: PowerUp[],
  rng: SeededRandom,
  config: GameConfig,
  currentTick: number
): PowerUp | null {
  if (existingPowerUps.length >= 2) return null;
  if (rng.next() > config.powerUpSpawnChance) return null;

  const existingPositions = existingPowerUps.map((p) => p.position);
  const filtered = availableCells.filter((cell) => !vectorInArray(cell, existingPositions));
  if (filtered.length === 0) return null;

  const index = rng.nextInt(0, filtered.length - 1);
  const type = POWERUP_TYPES[rng.nextInt(0, POWERUP_TYPES.length - 1)];

  return {
    position: filtered[index],
    type,
    duration: config.powerUpDurations[type],
    spawnTick: currentTick,
  };
}

export function checkPowerUpCollision(head: Vector2, powerUps: PowerUp[]): PowerUp | null {
  for (const pu of powerUps) {
    if (head.x === pu.position.x && head.y === pu.position.y) {
      return pu;
    }
  }
  return null;
}

export function activatePowerUp(
  powerUp: PowerUp,
  currentTick: number,
  activePowerUps: ActivePowerUp[]
): ActivePowerUp[] {
  const filtered = activePowerUps.filter((ap) => ap.type !== powerUp.type);
  return [
    ...filtered,
    {
      type: powerUp.type,
      expiresAtTick: currentTick + powerUp.duration,
    },
  ];
}

export function updateActivePowerUps(active: ActivePowerUp[], currentTick: number): ActivePowerUp[] {
  return active.filter((ap) => ap.expiresAtTick > currentTick);
}

export function hasPowerUp(active: ActivePowerUp[], type: PowerUpType): boolean {
  return active.some((ap) => ap.type === type);
}

export function removePowerUp(powerUps: PowerUp[], collected: PowerUp): PowerUp[] {
  return powerUps.filter((p) => p !== collected);
}

export function getSpeedMultiplier(active: ActivePowerUp[]): number {
  if (hasPowerUp(active, PowerUpType.Speed)) return 1.5;
  if (hasPowerUp(active, PowerUpType.Slow)) return 0.6;
  return 1.0;
}

export function getScoreMultiplier(active: ActivePowerUp[]): number {
  return hasPowerUp(active, PowerUpType.DoubleScore) ? 2 : 1;
}
