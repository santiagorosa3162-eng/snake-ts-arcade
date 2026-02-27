import {
  Vector2,
  GameConfig,
  GameSnapshot,
  PowerUpType,
  GameState,
  ActivePowerUp,
} from "../core/types";
import { COLORS } from "../config";
import { ParticleSystem } from "./particles";

export class CanvasRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private config: GameConfig;
  private particles: ParticleSystem;
  private animationOffset: number = 0;
  private highContrast: boolean = false;
  private colorblindMode: boolean = false;

  constructor(canvas: HTMLCanvasElement, config: GameConfig) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
    this.config = config;
    this.particles = new ParticleSystem();
    this.resize();
  }

  resize(): void {
    const container = this.canvas.parentElement;
    if (!container) return;

    const maxWidth = container.clientWidth;
    const maxHeight = container.clientHeight;
    const gridPixelW = this.config.gridWidth * this.config.cellSize;
    const gridPixelH = this.config.gridHeight * this.config.cellSize;

    const scale = Math.min(maxWidth / gridPixelW, maxHeight / gridPixelH, 1);
    const w = Math.floor(gridPixelW * scale);
    const h = Math.floor(gridPixelH * scale);

    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = w * dpr;
    this.canvas.height = h * dpr;
    this.canvas.style.width = `${w}px`;
    this.canvas.style.height = `${h}px`;
    this.ctx.setTransform(dpr * scale, 0, 0, dpr * scale, 0, 0);
  }

  setHighContrast(enabled: boolean): void {
    this.highContrast = enabled;
  }

  setColorblindMode(enabled: boolean): void {
    this.colorblindMode = enabled;
  }

  getParticles(): ParticleSystem {
    return this.particles;
  }

  render(snapshot: GameSnapshot, dt: number): void {
    this.animationOffset += dt;
    this.particles.update(dt);

    const cs = this.config.cellSize;
    const w = this.config.gridWidth * cs;
    const h = this.config.gridHeight * cs;

    this.ctx.clearRect(0, 0, w, h);
    this.drawBackground(w, h, cs);
    this.drawObstacles(snapshot.obstacles.map((o) => o.position), cs);
    this.drawFood(snapshot.food.map((f) => f.position), cs);
    this.drawPowerUps(snapshot.powerUps, cs);
    this.drawSnake(snapshot.snake, snapshot.activePowerUps, cs);
    this.particles.render(this.ctx);

    if (snapshot.state === GameState.Paused) {
      this.drawOverlay(w, h, "PAUSA");
    }

    if (snapshot.state === GameState.GameOver) {
      this.drawOverlay(w, h, "GAME OVER");
    }
  }

  private drawBackground(w: number, h: number, cs: number): void {
    this.ctx.fillStyle = COLORS.background;
    this.ctx.fillRect(0, 0, w, h);

    this.ctx.strokeStyle = COLORS.gridLine;
    this.ctx.lineWidth = 0.5;

    for (let x = 0; x <= this.config.gridWidth; x++) {
      this.ctx.beginPath();
      this.ctx.moveTo(x * cs, 0);
      this.ctx.lineTo(x * cs, h);
      this.ctx.stroke();
    }

    for (let y = 0; y <= this.config.gridHeight; y++) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y * cs);
      this.ctx.lineTo(w, y * cs);
      this.ctx.stroke();
    }
  }

  private drawSnake(segments: Vector2[], activePowerUps: ActivePowerUp[], cs: number): void {
    const isGhost = activePowerUps.some((ap) => ap.type === PowerUpType.Ghost);
    const headColor = this.highContrast ? "#ffffff" : COLORS.snakeHead;
    const bodyColor = isGhost ? COLORS.snakeGhost : (this.highContrast ? "#cccccc" : COLORS.snakeBody);

    for (let i = segments.length - 1; i >= 0; i--) {
      const seg = segments[i];
      const isHead = i === 0;
      const padding = 1;

      this.ctx.fillStyle = isHead ? headColor : bodyColor;

      if (isGhost && !isHead) {
        this.ctx.globalAlpha = 0.4;
      }

      const radius = isHead ? cs * 0.15 : cs * 0.1;
      this.roundRect(
        seg.x * cs + padding,
        seg.y * cs + padding,
        cs - padding * 2,
        cs - padding * 2,
        radius
      );

      this.ctx.globalAlpha = 1;

      if (isHead) {
        this.drawEyes(seg, cs);
      }
    }
  }

  private drawEyes(head: Vector2, cs: number): void {
    const cx = head.x * cs + cs / 2;
    const cy = head.y * cs + cs / 2;
    const eyeSize = cs * 0.1;
    const offset = cs * 0.15;

    this.ctx.fillStyle = "#ffffff";
    this.ctx.beginPath();
    this.ctx.arc(cx - offset, cy - offset, eyeSize, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.beginPath();
    this.ctx.arc(cx + offset, cy - offset, eyeSize, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.fillStyle = "#000000";
    this.ctx.beginPath();
    this.ctx.arc(cx - offset, cy - offset, eyeSize * 0.5, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.beginPath();
    this.ctx.arc(cx + offset, cy - offset, eyeSize * 0.5, 0, Math.PI * 2);
    this.ctx.fill();
  }

  private drawFood(positions: Vector2[], cs: number): void {
    const foodColor = this.colorblindMode ? "#fbbf24" : COLORS.food;

    for (const pos of positions) {
      const cx = pos.x * cs + cs / 2;
      const cy = pos.y * cs + cs / 2;
      const pulse = 1 + Math.sin(this.animationOffset * 4) * 0.1;
      const radius = (cs * 0.35) * pulse;

      this.ctx.shadowColor = COLORS.foodGlow;
      this.ctx.shadowBlur = 12;
      this.ctx.fillStyle = foodColor;
      this.ctx.beginPath();
      this.ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.shadowBlur = 0;
    }
  }

  private drawPowerUps(powerUps: { position: Vector2; type: PowerUpType }[], cs: number): void {
    for (const pu of powerUps) {
      const cx = pu.position.x * cs + cs / 2;
      const cy = pu.position.y * cs + cs / 2;
      const bob = Math.sin(this.animationOffset * 3) * 2;
      const color = this.getPowerUpColor(pu.type);

      this.ctx.shadowColor = color;
      this.ctx.shadowBlur = 10;
      this.ctx.fillStyle = color;
      this.ctx.beginPath();
      this.ctx.arc(cx, cy + bob, cs * 0.3, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.shadowBlur = 0;

      this.ctx.fillStyle = "#ffffff";
      this.ctx.font = `bold ${cs * 0.4}px JetBrains Mono`;
      this.ctx.textAlign = "center";
      this.ctx.textBaseline = "middle";
      this.ctx.fillText(this.getPowerUpSymbol(pu.type), cx, cy + bob);
    }
  }

  private drawObstacles(obstacles: Vector2[], cs: number): void {
    this.ctx.fillStyle = this.highContrast ? "#ff6600" : COLORS.obstacle;

    for (const obs of obstacles) {
      this.ctx.fillRect(obs.x * cs + 1, obs.y * cs + 1, cs - 2, cs - 2);
    }
  }

  private drawOverlay(w: number, h: number, text: string): void {
    this.ctx.fillStyle = COLORS.menuOverlay;
    this.ctx.fillRect(0, 0, w, h);

    this.ctx.fillStyle = COLORS.textPrimary;
    this.ctx.font = "bold 28px 'Space Grotesk'";
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";
    this.ctx.fillText(text, w / 2, h / 2);

    this.ctx.font = "16px 'Space Grotesk'";
    this.ctx.fillStyle = COLORS.textSecondary;
    this.ctx.fillText("Presiona ESPACIO para continuar", w / 2, h / 2 + 40);
  }

  private getPowerUpColor(type: PowerUpType): string {
    switch (type) {
      case PowerUpType.Speed: return COLORS.powerUpSpeed;
      case PowerUpType.Slow: return COLORS.powerUpSlow;
      case PowerUpType.Ghost: return COLORS.powerUpGhost;
      case PowerUpType.DoubleScore: return COLORS.powerUpDouble;
    }
  }

  private getPowerUpSymbol(type: PowerUpType): string {
    switch (type) {
      case PowerUpType.Speed: return "⚡";
      case PowerUpType.Slow: return "🐢";
      case PowerUpType.Ghost: return "👻";
      case PowerUpType.DoubleScore: return "×2";
    }
  }

  private roundRect(x: number, y: number, w: number, h: number, r: number): void {
    this.ctx.beginPath();
    this.ctx.moveTo(x + r, y);
    this.ctx.lineTo(x + w - r, y);
    this.ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    this.ctx.lineTo(x + w, y + h - r);
    this.ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    this.ctx.lineTo(x + r, y + h);
    this.ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    this.ctx.lineTo(x, y + r);
    this.ctx.quadraticCurveTo(x, y, x + r, y);
    this.ctx.fill();
  }

  getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }

  updateConfig(config: GameConfig): void {
    this.config = config;
    this.resize();
  }
}
