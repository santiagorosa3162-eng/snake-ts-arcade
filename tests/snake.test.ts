import { describe, it, expect } from "vitest";
import {
  createSnake,
  moveSnake,
  checkSelfCollision,
  isOppositeDirection,
  getDirectionVector,
  checkObstacleCollision,
  getSnakeOccupiedCells,
} from "../src/core/snake";
import { Direction } from "../src/core/types";
import { DEFAULT_CONFIG } from "../src/config";

describe("createSnake", () => {
  it("creates snake with correct length", () => {
    const snake = createSnake({ x: 10, y: 10 }, 3, Direction.Right);
    expect(snake).toHaveLength(3);
  });

  it("creates snake segments in correct positions going right", () => {
    const snake = createSnake({ x: 10, y: 10 }, 3, Direction.Right);
    expect(snake[0]).toEqual({ x: 10, y: 10 });
    expect(snake[1]).toEqual({ x: 9, y: 10 });
    expect(snake[2]).toEqual({ x: 8, y: 10 });
  });

  it("creates snake segments going left", () => {
    const snake = createSnake({ x: 5, y: 5 }, 2, Direction.Left);
    expect(snake[0]).toEqual({ x: 5, y: 5 });
    expect(snake[1]).toEqual({ x: 6, y: 5 });
  });

  it("creates snake segments going up", () => {
    const snake = createSnake({ x: 5, y: 5 }, 2, Direction.Up);
    expect(snake[0]).toEqual({ x: 5, y: 5 });
    expect(snake[1]).toEqual({ x: 5, y: 6 });
  });

  it("handles single segment snake", () => {
    const snake = createSnake({ x: 0, y: 0 }, 1, Direction.Right);
    expect(snake).toHaveLength(1);
    expect(snake[0]).toEqual({ x: 0, y: 0 });
  });
});

describe("moveSnake", () => {
  const config = { ...DEFAULT_CONFIG, wrapAround: false };

  it("moves snake head in correct direction", () => {
    const snake = createSnake({ x: 10, y: 10 }, 3, Direction.Right);
    const { head } = moveSnake(snake, Direction.Right, false, config);
    expect(head).toEqual({ x: 11, y: 10 });
  });

  it("maintains length when not growing", () => {
    const snake = createSnake({ x: 10, y: 10 }, 3, Direction.Right);
    const { newSegments } = moveSnake(snake, Direction.Right, false, config);
    expect(newSegments).toHaveLength(3);
  });

  it("increases length when growing", () => {
    const snake = createSnake({ x: 10, y: 10 }, 3, Direction.Right);
    const { newSegments } = moveSnake(snake, Direction.Right, true, config);
    expect(newSegments).toHaveLength(4);
  });

  it("detects out of bounds without wrap", () => {
    const snake = createSnake({ x: 0, y: 0 }, 1, Direction.Left);
    const { outOfBounds } = moveSnake(snake, Direction.Left, false, config);
    expect(outOfBounds).toBe(true);
  });

  it("wraps around when enabled", () => {
    const wrapConfig = { ...config, wrapAround: true };
    const snake = createSnake({ x: 0, y: 0 }, 1, Direction.Left);
    const { head, outOfBounds } = moveSnake(snake, Direction.Left, false, wrapConfig);
    expect(outOfBounds).toBe(false);
    expect(head.x).toBe(config.gridWidth - 1);
  });

  it("wraps vertically", () => {
    const wrapConfig = { ...config, wrapAround: true };
    const snake = createSnake({ x: 5, y: 0 }, 1, Direction.Up);
    const { head } = moveSnake(snake, Direction.Up, false, wrapConfig);
    expect(head.y).toBe(config.gridHeight - 1);
  });
});

describe("checkSelfCollision", () => {
  it("returns false for straight snake", () => {
    const snake = createSnake({ x: 10, y: 10 }, 3, Direction.Right);
    expect(checkSelfCollision(snake)).toBe(false);
  });

  it("returns true when head overlaps body", () => {
    const snake = [
      { x: 5, y: 5 },
      { x: 6, y: 5 },
      { x: 6, y: 6 },
      { x: 5, y: 6 },
      { x: 5, y: 5 },
    ];
    expect(checkSelfCollision(snake)).toBe(true);
  });

  it("returns false for single segment", () => {
    expect(checkSelfCollision([{ x: 0, y: 0 }])).toBe(false);
  });
});

describe("isOppositeDirection", () => {
  it("detects up-down as opposite", () => {
    expect(isOppositeDirection(Direction.Up, Direction.Down)).toBe(true);
  });

  it("detects left-right as opposite", () => {
    expect(isOppositeDirection(Direction.Left, Direction.Right)).toBe(true);
  });

  it("returns false for non-opposite", () => {
    expect(isOppositeDirection(Direction.Up, Direction.Left)).toBe(false);
  });

  it("returns false for same direction", () => {
    expect(isOppositeDirection(Direction.Up, Direction.Up)).toBe(false);
  });
});

describe("getDirectionVector", () => {
  it("returns correct vector for each direction", () => {
    expect(getDirectionVector(Direction.Up)).toEqual({ x: 0, y: -1 });
    expect(getDirectionVector(Direction.Down)).toEqual({ x: 0, y: 1 });
    expect(getDirectionVector(Direction.Left)).toEqual({ x: -1, y: 0 });
    expect(getDirectionVector(Direction.Right)).toEqual({ x: 1, y: 0 });
  });
});

describe("checkObstacleCollision", () => {
  it("detects collision with obstacle", () => {
    expect(checkObstacleCollision({ x: 5, y: 5 }, [{ x: 5, y: 5 }])).toBe(true);
  });

  it("returns false when no collision", () => {
    expect(checkObstacleCollision({ x: 5, y: 5 }, [{ x: 6, y: 6 }])).toBe(false);
  });

  it("handles empty obstacles", () => {
    expect(checkObstacleCollision({ x: 5, y: 5 }, [])).toBe(false);
  });
});

describe("getSnakeOccupiedCells", () => {
  it("returns set of all occupied positions", () => {
    const snake = createSnake({ x: 10, y: 10 }, 3, Direction.Right);
    const cells = getSnakeOccupiedCells(snake);
    expect(cells.size).toBe(3);
    expect(cells.has("10,10")).toBe(true);
    expect(cells.has("9,10")).toBe(true);
    expect(cells.has("8,10")).toBe(true);
  });
});
