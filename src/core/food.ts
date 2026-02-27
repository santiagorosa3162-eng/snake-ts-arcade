import { Vector2, FoodItem, GameConfig } from "./types";
import { SeededRandom, vectorInArray } from "../utils/math";

export function getAvailableCells(
  config: GameConfig,
  occupied: Set<string>,
  obstacles: Vector2[]
): Vector2[] {
  const available: Vector2[] = [];
  const obstacleSet = new Set(obstacles.map((o) => `${o.x},${o.y}`));

  for (let x = 0; x < config.gridWidth; x++) {
    for (let y = 0; y < config.gridHeight; y++) {
      const key = `${x},${y}`;
      if (!occupied.has(key) && !obstacleSet.has(key)) {
        available.push({ x, y });
      }
    }
  }

  return available;
}

export function spawnFood(
  availableCells: Vector2[],
  rng: SeededRandom,
  existingFood: FoodItem[]
): FoodItem | null {
  const existingPositions = existingFood.map((f) => f.position);
  const filtered = availableCells.filter((cell) => !vectorInArray(cell, existingPositions));

  if (filtered.length === 0) return null;

  const index = rng.nextInt(0, filtered.length - 1);
  return {
    position: filtered[index],
    value: 10,
  };
}

export function checkFoodCollision(head: Vector2, food: FoodItem[]): FoodItem | null {
  for (const item of food) {
    if (head.x === item.position.x && head.y === item.position.y) {
      return item;
    }
  }
  return null;
}

export function removeFood(food: FoodItem[], eaten: FoodItem): FoodItem[] {
  return food.filter((f) => f !== eaten);
}
