import "./style.css";
import { GameEngine, EngineEvent } from "./core/engine";
import { GameState, Direction } from "./core/types";
import { CanvasRenderer } from "./render/canvasRenderer";
import { AudioManager } from "./audio/audioManager";
import { InputController, InputAction } from "./ui/controls";
import { HUD } from "./ui/hud";
import { DEFAULT_CONFIG, COLORS } from "./config";
import { getHighScore, setHighScore, saveReplay } from "./persistence/storage";
import { getLocaleFromStorage, Locale } from "./i18n";
import { getLevelByIndex } from "./core/level";
import { getAIDirection } from "./core/ai";
import { trackEvent } from "./utils/analytics";

class Game {
  private engine: GameEngine;
  private renderer: CanvasRenderer;
  private audio: AudioManager;
  private input: InputController;
  private hud: HUD;
  private canvas: HTMLCanvasElement;
  private lastTime: number = 0;
  private accumulator: number = 0;
  private frameId: number = 0;
  private highScore: number;
  private locale: Locale;
  private currentLevel: number = 0;
  private fpsFrames: number = 0;
  private fpsTime: number = 0;
  private currentFps: number = 0;

  constructor() {
    this.locale = getLocaleFromStorage();
    this.highScore = getHighScore();

    const app = document.getElementById("app")!;
    app.innerHTML = "";

    const wrapper = document.createElement("div");
    wrapper.className = "game-wrapper";

    const canvasContainer = document.createElement("div");
    canvasContainer.className = "canvas-container";

    this.canvas = document.createElement("canvas");
    this.canvas.id = "game-canvas";
    canvasContainer.appendChild(this.canvas);

    const hudContainer = document.createElement("div");
    hudContainer.className = "hud-container";

    wrapper.append(hudContainer, canvasContainer);
    app.appendChild(wrapper);

    const level = getLevelByIndex(this.currentLevel);
    this.engine = new GameEngine({ ...DEFAULT_CONFIG }, level);
    this.renderer = new CanvasRenderer(this.canvas, DEFAULT_CONFIG);
    this.audio = new AudioManager();

    this.hud = new HUD(hudContainer, this.locale);
    this.hud.updateHighScore(this.highScore);

    this.engine.addEventListener(this.onEngineEvent.bind(this));

    this.input = new InputController(this.onInput.bind(this));

    this.setupMenuButtons();
    this.setupSettingsButtons();
    this.setupMobileButtons();

    window.addEventListener("resize", () => this.renderer.resize());

    this.renderer.resize();
    this.loop(performance.now());
  }

  private onInput(action: InputAction): void {
    switch (action.type) {
      case "direction":
        if (this.engine.getState() === GameState.Playing) {
          this.engine.setDirection(action.direction);
        }
        break;
      case "pause":
        this.engine.togglePause();
        this.hud.updateState(this.engine.getState());
        break;
      case "mute":
        this.audio.toggleMute();
        break;
      case "restart":
        this.restartGame();
        break;
      case "confirm":
        this.handleConfirm();
        break;
    }
  }

  private onEngineEvent(event: EngineEvent): void {
    switch (event.type) {
      case "food_eaten":
        this.audio.playEat();
        this.renderer.getParticles().emit(
          event.position.x * DEFAULT_CONFIG.cellSize + DEFAULT_CONFIG.cellSize / 2,
          event.position.y * DEFAULT_CONFIG.cellSize + DEFAULT_CONFIG.cellSize / 2,
          12,
          COLORS.particleEat
        );
        trackEvent({
          type: "food_eaten",
          timestamp: Date.now(),
          data: { score: event.score },
        });
        break;
      case "powerup_collected":
        this.audio.playPowerUp();
        break;
      case "game_over":
        this.audio.playGameOver();
        if (event.score > this.highScore) {
          this.highScore = event.score;
          setHighScore(event.score);
          this.hud.updateHighScore(this.highScore);
        }
        this.renderer.getParticles().emit(
          this.engine.getSnake()[0].x * DEFAULT_CONFIG.cellSize + DEFAULT_CONFIG.cellSize / 2,
          this.engine.getSnake()[0].y * DEFAULT_CONFIG.cellSize + DEFAULT_CONFIG.cellSize / 2,
          30,
          COLORS.particleDeath
        );
        saveReplay(
          this.engine.getConfig(),
          this.engine.getConfig().seed ?? 0,
          this.engine.getInputLog(),
          event.score
        );
        trackEvent({
          type: "game_over",
          timestamp: Date.now(),
          data: { score: event.score, cause: event.cause },
        });
        break;
      case "game_start":
        this.audio.init();
        trackEvent({
          type: "game_start",
          timestamp: Date.now(),
          data: {},
        });
        break;
    }
  }

  private handleConfirm(): void {
    const state = this.engine.getState();
    if (state === GameState.Menu) {
      this.startGame();
    } else if (state === GameState.GameOver) {
      this.restartGame();
    } else if (state === GameState.Paused) {
      this.engine.resume();
      this.hud.updateState(this.engine.getState());
    }
  }

  private startGame(): void {
    this.engine.start();
    this.hud.updateState(GameState.Playing);
  }

  private restartGame(): void {
    const level = getLevelByIndex(this.currentLevel);
    this.engine.restart(level);
    this.hud.updateState(GameState.Playing);
    this.hud.updateScore(0);
    this.renderer.getParticles().clear();
  }

  private setupMenuButtons(): void {
    const overlay = this.hud.getMenuOverlay();

    overlay.addEventListener("click", (e) => {
      const target = e.target as HTMLElement;
      const action = target.dataset.action;

      if (action === "start") {
        this.startGame();
      } else if (action === "settings") {
        this.hud.showSettings();
      } else if (action === "ai-demo") {
        this.engine.setAIEnabled(true);
        this.startGame();
      }
    });
  }

  private setupSettingsButtons(): void {
    const panel = this.hud.getSettingsPanel();

    panel.addEventListener("click", (e) => {
      const target = e.target as HTMLElement;
      if (target.dataset.action === "close-settings") {
        this.hud.hideSettings();
        this.hud.updateState(this.engine.getState());
      }
    });

    panel.addEventListener("change", (e) => {
      const target = e.target as HTMLInputElement | HTMLSelectElement;

      if (target.id === "setting-wrap") {
        this.engine.updateConfig({ wrapAround: (target as HTMLInputElement).checked });
      } else if (target.id === "setting-grid") {
        const size = parseInt(target.value, 10);
        this.engine.updateConfig({ gridWidth: size, gridHeight: size });
        this.renderer.updateConfig(this.engine.getConfig());
      } else if (target.id === "setting-speed") {
        const speed = parseInt(target.value, 10);
        const label = panel.querySelector("#setting-speed-val");
        if (label) label.textContent = speed.toString();
        this.engine.updateConfig({ initialSpeed: speed });
      } else if (target.id === "setting-level") {
        this.currentLevel = parseInt(target.value, 10);
      } else if (target.id === "setting-contrast") {
        this.renderer.setHighContrast((target as HTMLInputElement).checked);
      } else if (target.id === "setting-colorblind") {
        this.renderer.setColorblindMode((target as HTMLInputElement).checked);
      } else if (target.id === "setting-lang") {
        this.locale = target.value as Locale;
        localStorage.setItem("snake_locale", this.locale);
        this.hud.setLocale(this.locale);
      } else if (target.id === "setting-volume") {
        this.audio.setVolume(parseInt(target.value, 10) / 100);
      }
    });
  }

  private setupMobileButtons(): void {
    const controls = this.hud.getMobileControls();

    controls.addEventListener("touchstart", (e) => {
      const target = e.target as HTMLElement;
      const dir = target.dataset.dir;
      if (!dir) return;
      e.preventDefault();

      const dirMap: Record<string, Direction> = {
        up: Direction.Up,
        down: Direction.Down,
        left: Direction.Left,
        right: Direction.Right,
      };

      if (dirMap[dir]) {
        this.onInput({ type: "direction", direction: dirMap[dir] });
      }
    });
  }

  private loop(timestamp: number): void {
    const dt = Math.min((timestamp - this.lastTime) / 1000, 0.1);
    this.lastTime = timestamp;

    this.fpsFrames++;
    this.fpsTime += dt;
    if (this.fpsTime >= 1) {
      this.currentFps = this.fpsFrames / this.fpsTime;
      this.fpsFrames = 0;
      this.fpsTime = 0;
      this.hud.updateFPS(this.currentFps);
    }

    if (this.engine.getState() === GameState.Playing) {
      const tickInterval = 1 / this.engine.getEffectiveSpeed();
      this.accumulator += dt;

      while (this.accumulator >= tickInterval) {
        if (this.engine.isAIEnabled()) {
          const aiDir = getAIDirection(
            this.engine.getSnake(),
            this.engine.getFood(),
            this.engine.getObstacles(),
            this.engine.getDirection(),
            this.engine.getConfig()
          );
          this.engine.setDirection(aiDir);
        }

        this.engine.update();
        this.accumulator -= tickInterval;

        if (this.engine.getState() !== GameState.Playing) break;
      }

      this.hud.updateScore(this.engine.getScore());
      this.hud.updatePowerUps(this.engine.getActivePowerUps(), this.engine.getTick());
      this.hud.updateChallenge(this.engine.getChallenge());
    }

    this.renderer.render(this.engine.getSnapshot(), dt);

    this.frameId = requestAnimationFrame(this.loop.bind(this));
  }
}

new Game();
