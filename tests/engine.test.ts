import { describe, it, expect, vi } from "vitest";
import { GameEngine } from "../src/core/engine";
import { GameState, Direction } from "../src/core/types";
import { DEFAULT_CONFIG } from "../src/config";

function createEngine(overrides = {}) {
  return new GameEngine({ ...DEFAULT_CONFIG, seed: 12345, ...overrides });
}

describe("GameEngine", () => {
  it("initializes in Menu state", () => {
    const engine = createEngine();
    expect(engine.getState()).toBe(GameState.Menu);
  });

  it("transitions to Playing on start", () => {
    const engine = createEngine();
    engine.start();
    expect(engine.getState()).toBe(GameState.Playing);
  });

  it("spawns food on start", () => {
    const engine = createEngine();
    engine.start();
    expect(engine.getFood().length).toBeGreaterThan(0);
  });

  it("initializes snake with correct length", () => {
    const engine = createEngine({ initialSnakeLength: 5 });
    expect(engine.getSnake()).toHaveLength(5);
  });

  it("pauses and resumes correctly", () => {
    const engine = createEngine();
    engine.start();
    engine.pause();
    expect(engine.getState()).toBe(GameState.Paused);
    engine.resume();
    expect(engine.getState()).toBe(GameState.Playing);
  });

  it("togglePause works", () => {
    const engine = createEngine();
    engine.start();
    engine.togglePause();
    expect(engine.getState()).toBe(GameState.Paused);
    engine.togglePause();
    expect(engine.getState()).toBe(GameState.Playing);
  });

  it("ignores direction when not playing", () => {
    const engine = createEngine();
    const initialDir = engine.getDirection();
    engine.setDirection(Direction.Left);
    expect(engine.getDirection()).toBe(initialDir);
  });

  it("prevents opposite direction", () => {
    const engine = createEngine();
    engine.start();
    engine.setDirection(Direction.Left);
    engine.update();
    expect(engine.getDirection()).toBe(Direction.Right);
  });

  it("updates tick on each update", () => {
    const engine = createEngine();
    engine.start();
    engine.update();
    expect(engine.getTick()).toBe(1);
    engine.update();
    expect(engine.getTick()).toBe(2);
  });

  it("does not update when paused", () => {
    const engine = createEngine();
    engine.start();
    engine.pause();
    const tick = engine.getTick();
    engine.update();
    expect(engine.getTick()).toBe(tick);
  });

  it("triggers game over on wall collision", () => {
    const engine = createEngine({ wrapAround: false, gridWidth: 5, gridHeight: 5 });
    engine.start();
    const listener = vi.fn();
    engine.addEventListener(listener);

    for (let i = 0; i < 10; i++) {
      engine.setDirection(Direction.Right);
      engine.update();
    }

    const gameOverEvent = listener.mock.calls.find(
      (call) => call[0].type === "game_over"
    );
    expect(gameOverEvent).toBeDefined();
    expect(engine.getState()).toBe(GameState.GameOver);
  });

  it("wraps around when enabled", () => {
    const engine = createEngine({
      wrapAround: true,
      gridWidth: 5,
      gridHeight: 5,
      initialSnakeLength: 1,
    });
    engine.start();

    for (let i = 0; i < 10; i++) {
      engine.update();
    }

    expect(engine.getState()).toBe(GameState.Playing);
  });

  it("restart resets state", () => {
    const engine = createEngine();
    engine.start();
    for (let i = 0; i < 3; i++) engine.update();
    engine.restart();
    expect(engine.getState()).toBe(GameState.Playing);
    expect(engine.getScore()).toBe(0);
    expect(engine.getTick()).toBe(0);
  });

  it("emits events correctly", () => {
    const engine = createEngine();
    const listener = vi.fn();
    engine.addEventListener(listener);
    engine.start();
    expect(listener).toHaveBeenCalledWith({ type: "game_start" });
  });

  it("removeEventListener works", () => {
    const engine = createEngine();
    const listener = vi.fn();
    engine.addEventListener(listener);
    engine.removeEventListener(listener);
    engine.start();
    expect(listener).not.toHaveBeenCalled();
  });

  it("getSnapshot returns valid snapshot", () => {
    const engine = createEngine();
    engine.start();
    const snap = engine.getSnapshot();
    expect(snap.state).toBe(GameState.Playing);
    expect(snap.snake.length).toBeGreaterThan(0);
    expect(snap.score).toBe(0);
    expect(snap.tick).toBe(0);
  });
});
