import { LevelConfig, Direction, Vector2 } from "./types";

export const LEVELS: LevelConfig[] = [
  {
    name: "Clásico",
    obstacles: [],
    spawnPoint: { x: 10, y: 10 },
    initialDirection: Direction.Right,
  },
  {
    name: "Cuatro Paredes",
    obstacles: generateBorderObstacles(20, 20, 5),
    spawnPoint: { x: 10, y: 10 },
    initialDirection: Direction.Right,
  },
  {
    name: "Laberinto",
    obstacles: [
      ...generateLine({ x: 5, y: 0 }, { x: 5, y: 8 }),
      ...generateLine({ x: 14, y: 11 }, { x: 14, y: 19 }),
      ...generateLine({ x: 0, y: 10 }, { x: 8, y: 10 }),
      ...generateLine({ x: 11, y: 10 }, { x: 19, y: 10 }),
    ],
    spawnPoint: { x: 2, y: 2 },
    initialDirection: Direction.Right,
  },
  {
    name: "Espiral",
    obstacles: [
      ...generateLine({ x: 2, y: 2 }, { x: 17, y: 2 }),
      ...generateLine({ x: 17, y: 2 }, { x: 17, y: 17 }),
      ...generateLine({ x: 2, y: 17 }, { x: 17, y: 17 }),
      ...generateLine({ x: 2, y: 6 }, { x: 2, y: 17 }),
      ...generateLine({ x: 5, y: 5 }, { x: 14, y: 5 }),
      ...generateLine({ x: 14, y: 5 }, { x: 14, y: 14 }),
      ...generateLine({ x: 5, y: 14 }, { x: 14, y: 14 }),
      ...generateLine({ x: 5, y: 5 }, { x: 5, y: 11 }),
    ],
    spawnPoint: { x: 10, y: 10 },
    initialDirection: Direction.Right,
  },
];

function generateLine(from: Vector2, to: Vector2): Vector2[] {
  const points: Vector2[] = [];
  const dx = Math.sign(to.x - from.x);
  const dy = Math.sign(to.y - from.y);
  let { x, y } = from;

  while (x !== to.x || y !== to.y) {
    points.push({ x, y });
    x += dx;
    y += dy;
  }
  points.push({ x: to.x, y: to.y });

  return points;
}

function generateBorderObstacles(width: number, height: number, inset: number): Vector2[] {
  const obstacles: Vector2[] = [];
  for (let i = inset; i < width - inset; i++) {
    obstacles.push({ x: i, y: inset });
    obstacles.push({ x: i, y: height - inset - 1 });
  }
  for (let i = inset; i < height - inset; i++) {
    obstacles.push({ x: inset, y: i });
    obstacles.push({ x: width - inset - 1, y: i });
  }
  return obstacles;
}

export function getLevelByIndex(index: number): LevelConfig {
  return LEVELS[Math.min(index, LEVELS.length - 1)];
}

export function parseLevelFromJSON(json: string): LevelConfig {
  return JSON.parse(json) as LevelConfig;
}
