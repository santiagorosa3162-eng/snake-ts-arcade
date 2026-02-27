import { Vector2, Direction, GameConfig } from "./types";
import { vectorEquals, vectorInArray } from "../utils/math";

export function createSnake(startPos: Vector2, length: number, direction: Direction): Vector2[] {
  const segments: Vector2[] = [];
  const dx = direction === Direction.Left ? 1 : direction === Direction.Right ? -1 : 0;
  const dy = direction === Direction.Up ? 1 : direction === Direction.Down ? -1 : 0;

  for (let i = 0; i < length; i++) {
    segments.push({
      x: startPos.x + dx * i,
      y: startPos.y + dy * i,
    });
  }

  return segments;
}

export function getDirectionVector(direction: Direction): Vector2 {
  switch (direction) {
    case Direction.Up:
      return { x: 0, y: -1 };
    case Direction.Down:
      return { x: 0, y: 1 };
    case Direction.Left:
      return { x: -1, y: 0 };
    case Direction.Right:
      return { x: 1, y: 0 };
  }
}

export function isOppositeDirection(a: Direction, b: Direction): boolean {
  return (
    (a === Direction.Up && b === Direction.Down) ||
    (a === Direction.Down && b === Direction.Up) ||
    (a === Direction.Left && b === Direction.Right) ||
    (a === Direction.Right && b === Direction.Left)
  );
}

export function moveSnake(
  segments: Vector2[],
  direction: Direction,
  grow: boolean,
  config: GameConfig
): { newSegments: Vector2[]; head: Vector2; outOfBounds: boolean } {
  const dirVec = getDirectionVector(direction);
  const head = segments[0];
  let newHead: Vector2 = {
    x: head.x + dirVec.x,
    y: head.y + dirVec.y,
  };

  let outOfBounds = false;

  if (config.wrapAround) {
    newHead = {
      x: ((newHead.x % config.gridWidth) + config.gridWidth) % config.gridWidth,
      y: ((newHead.y % config.gridHeight) + config.gridHeight) % config.gridHeight,
    };
  } else if (
    newHead.x < 0 ||
    newHead.x >= config.gridWidth ||
    newHead.y < 0 ||
    newHead.y >= config.gridHeight
  ) {
    outOfBounds = true;
  }

  const newSegments = [newHead, ...segments];
  if (!grow) {
    newSegments.pop();
  }

  return { newSegments, head: newHead, outOfBounds };
}

export function checkSelfCollision(segments: Vector2[]): boolean {
  const head = segments[0];
  return segments.slice(1).some((seg) => vectorEquals(head, seg));
}

export function checkObstacleCollision(head: Vector2, obstacles: Vector2[]): boolean {
  return vectorInArray(head, obstacles);
}

export function getSnakeOccupiedCells(segments: Vector2[]): Set<string> {
  const cells = new Set<string>();
  for (const seg of segments) {
    cells.add(`${seg.x},${seg.y}`);
  }
  return cells;
}
