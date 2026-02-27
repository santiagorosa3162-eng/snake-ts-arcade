import { Vector2, Direction, GameConfig, FoodItem, Obstacle } from "./types";
import { getDirectionVector, isOppositeDirection } from "./snake";
import { vectorEquals } from "../utils/math";

interface PathNode {
  position: Vector2;
  direction: Direction;
  parent: PathNode | null;
}

const ALL_DIRECTIONS = [Direction.Up, Direction.Down, Direction.Left, Direction.Right];

export function getAIDirection(
  snake: Vector2[],
  food: FoodItem[],
  obstacles: Obstacle[],
  currentDirection: Direction,
  config: GameConfig
): Direction {
  if (food.length === 0) return currentDirection;

  const head = snake[0];
  const target = findClosestFood(head, food);
  const occupied = new Set(snake.slice(0, -1).map((s) => `${s.x},${s.y}`));
  const obstacleSet = new Set(obstacles.map((o) => `${o.position.x},${o.position.y}`));

  const path = bfs(head, target.position, occupied, obstacleSet, config);
  if (path && path.length > 0) {
    return path[0];
  }

  return findSafeDirection(head, snake, obstacles, currentDirection, config);
}

function findClosestFood(head: Vector2, food: FoodItem[]): FoodItem {
  let closest = food[0];
  let minDist = manhattan(head, food[0].position);

  for (let i = 1; i < food.length; i++) {
    const dist = manhattan(head, food[i].position);
    if (dist < minDist) {
      minDist = dist;
      closest = food[i];
    }
  }

  return closest;
}

function manhattan(a: Vector2, b: Vector2): number {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

function bfs(
  start: Vector2,
  end: Vector2,
  occupied: Set<string>,
  obstacles: Set<string>,
  config: GameConfig
): Direction[] | null {
  const queue: PathNode[] = [];
  const visited = new Set<string>();
  visited.add(`${start.x},${start.y}`);

  for (const dir of ALL_DIRECTIONS) {
    const vec = getDirectionVector(dir);
    const next = applyMove(start, vec, config);
    const key = `${next.x},${next.y}`;

    if (!occupied.has(key) && !obstacles.has(key) && isInBounds(next, config)) {
      queue.push({ position: next, direction: dir, parent: null });
      visited.add(key);
    }
  }

  while (queue.length > 0) {
    const current = queue.shift()!;

    if (vectorEquals(current.position, end)) {
      return reconstructPath(current);
    }

    for (const dir of ALL_DIRECTIONS) {
      const vec = getDirectionVector(dir);
      const next = applyMove(current.position, vec, config);
      const key = `${next.x},${next.y}`;

      if (!visited.has(key) && !occupied.has(key) && !obstacles.has(key) && isInBounds(next, config)) {
        visited.add(key);
        queue.push({ position: next, direction: dir, parent: current });
      }
    }
  }

  return null;
}

function applyMove(pos: Vector2, vec: Vector2, config: GameConfig): Vector2 {
  let x = pos.x + vec.x;
  let y = pos.y + vec.y;

  if (config.wrapAround) {
    x = ((x % config.gridWidth) + config.gridWidth) % config.gridWidth;
    y = ((y % config.gridHeight) + config.gridHeight) % config.gridHeight;
  }

  return { x, y };
}

function isInBounds(pos: Vector2, config: GameConfig): boolean {
  if (config.wrapAround) return true;
  return pos.x >= 0 && pos.x < config.gridWidth && pos.y >= 0 && pos.y < config.gridHeight;
}

function reconstructPath(node: PathNode): Direction[] {
  const path: Direction[] = [];
  let current: PathNode | null = node;

  while (current) {
    path.unshift(current.direction);
    current = current.parent;
  }

  return path;
}

function findSafeDirection(
  head: Vector2,
  snake: Vector2[],
  obstacles: Obstacle[],
  currentDirection: Direction,
  config: GameConfig
): Direction {
  const occupied = new Set(snake.map((s) => `${s.x},${s.y}`));
  const obstacleSet = new Set(obstacles.map((o) => `${o.position.x},${o.position.y}`));

  const safeDirs = ALL_DIRECTIONS.filter((dir) => {
    if (isOppositeDirection(dir, currentDirection)) return false;
    const vec = getDirectionVector(dir);
    const next = applyMove(head, vec, config);
    const key = `${next.x},${next.y}`;
    return !occupied.has(key) && !obstacleSet.has(key) && isInBounds(next, config);
  });

  if (safeDirs.length === 0) return currentDirection;
  if (safeDirs.includes(currentDirection)) return currentDirection;
  return safeDirs[0];
}
