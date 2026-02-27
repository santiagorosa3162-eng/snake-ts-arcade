import { describe, it, expect } from "vitest";
import { getAvailableCells, spawnFood, checkFoodCollision, removeFood } from "../src/core/food";
import { DEFAULT_CONFIG } from "../src/config";
import { SeededRandom } from "../src/utils/math";

describe("getAvailableCells", () => {
  it("returns all cells when nothing is occupied", () => {
    const config = { ...DEFAULT_CONFIG, gridWidth: 5, gridHeight: 5 };
    const cells = getAvailableCells(config, new Set(), []);
    expect(cells).toHaveLength(25);
  });

  it("excludes occupied cells", () => {
    const config = { ...DEFAULT_CONFIG, gridWidth: 3, gridHeight: 3 };
    const occupied = new Set(["0,0", "1,1", "2,2"]);
    const cells = getAvailableCells(config, occupied, []);
    expect(cells).toHaveLength(6);
  });

  it("excludes obstacle cells", () => {
    const config = { ...DEFAULT_CONFIG, gridWidth: 3, gridHeight: 3 };
    const obstacles = [{ x: 0, y: 0 }, { x: 1, y: 1 }];
    const cells = getAvailableCells(config, new Set(), obstacles);
    expect(cells).toHaveLength(7);
  });

  it("returns empty when all cells occupied", () => {
    const config = { ...DEFAULT_CONFIG, gridWidth: 1, gridHeight: 1 };
    const occupied = new Set(["0,0"]);
    const cells = getAvailableCells(config, occupied, []);
    expect(cells).toHaveLength(0);
  });
});

describe("spawnFood", () => {
  it("spawns food on available cell", () => {
    const rng = new SeededRandom(42);
    const cells = [{ x: 5, y: 5 }, { x: 6, y: 6 }];
    const food = spawnFood(cells, rng, []);
    expect(food).not.toBeNull();
    expect(food!.value).toBe(10);
    expect(cells).toContainEqual(food!.position);
  });

  it("returns null when no cells available", () => {
    const rng = new SeededRandom(42);
    const food = spawnFood([], rng, []);
    expect(food).toBeNull();
  });

  it("avoids existing food positions", () => {
    const rng = new SeededRandom(42);
    const cells = [{ x: 0, y: 0 }, { x: 1, y: 1 }];
    const existing = [{ position: { x: 0, y: 0 }, value: 10 }];
    const food = spawnFood(cells, rng, existing);
    expect(food).not.toBeNull();
    expect(food!.position).toEqual({ x: 1, y: 1 });
  });

  it("returns null when all cells have food", () => {
    const rng = new SeededRandom(42);
    const cells = [{ x: 0, y: 0 }];
    const existing = [{ position: { x: 0, y: 0 }, value: 10 }];
    const food = spawnFood(cells, rng, existing);
    expect(food).toBeNull();
  });
});

describe("checkFoodCollision", () => {
  it("detects collision with food", () => {
    const food = [{ position: { x: 5, y: 5 }, value: 10 }];
    const result = checkFoodCollision({ x: 5, y: 5 }, food);
    expect(result).toBe(food[0]);
  });

  it("returns null when no collision", () => {
    const food = [{ position: { x: 5, y: 5 }, value: 10 }];
    const result = checkFoodCollision({ x: 6, y: 6 }, food);
    expect(result).toBeNull();
  });

  it("handles empty food array", () => {
    const result = checkFoodCollision({ x: 5, y: 5 }, []);
    expect(result).toBeNull();
  });

  it("finds correct food among multiple", () => {
    const food = [
      { position: { x: 1, y: 1 }, value: 10 },
      { position: { x: 5, y: 5 }, value: 10 },
      { position: { x: 9, y: 9 }, value: 10 },
    ];
    const result = checkFoodCollision({ x: 5, y: 5 }, food);
    expect(result).toBe(food[1]);
  });
});

describe("removeFood", () => {
  it("removes eaten food from array", () => {
    const food = [
      { position: { x: 1, y: 1 }, value: 10 },
      { position: { x: 5, y: 5 }, value: 10 },
    ];
    const result = removeFood(food, food[0]);
    expect(result).toHaveLength(1);
    expect(result[0].position).toEqual({ x: 5, y: 5 });
  });
});
