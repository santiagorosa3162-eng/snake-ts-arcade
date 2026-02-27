import { GameState, ActivePowerUp, PowerUpType, ChallengeObjective } from "../core/types";
import { COLORS } from "../config";
import { t, Locale } from "../i18n";

export class HUD {
  private container: HTMLElement;
  private scoreEl: HTMLElement;
  private highScoreEl: HTMLElement;
  private statusEl: HTMLElement;
  private powerUpBar: HTMLElement;
  private mobileControls: HTMLElement;
  private menuOverlay: HTMLElement;
  private settingsPanel: HTMLElement;
  private challengeEl: HTMLElement;
  private fpsEl: HTMLElement;
  private locale: Locale;

  constructor(container: HTMLElement, locale: Locale = "es") {
    this.container = container;
    this.locale = locale;

    this.container.innerHTML = "";

    const hud = this.el("div", "hud");

    const topBar = this.el("div", "hud-top");

    const scoreGroup = this.el("div", "hud-score-group");
    this.scoreEl = this.el("span", "hud-score");
    this.scoreEl.textContent = "0";
    const scoreLabel = this.el("span", "hud-label");
    scoreLabel.textContent = t("score", locale);
    scoreGroup.append(scoreLabel, this.scoreEl);

    const highGroup = this.el("div", "hud-score-group");
    this.highScoreEl = this.el("span", "hud-highscore");
    this.highScoreEl.textContent = "0";
    const highLabel = this.el("span", "hud-label");
    highLabel.textContent = t("highScore", locale);
    highGroup.append(highLabel, this.highScoreEl);

    this.fpsEl = this.el("span", "hud-fps");
    this.statusEl = this.el("span", "hud-status");

    topBar.append(scoreGroup, highGroup, this.fpsEl, this.statusEl);
    hud.append(topBar);

    this.powerUpBar = this.el("div", "hud-powerups");
    hud.append(this.powerUpBar);

    this.challengeEl = this.el("div", "hud-challenge");
    this.challengeEl.style.display = "none";
    hud.append(this.challengeEl);

    this.menuOverlay = this.createMenuOverlay();
    this.settingsPanel = this.createSettingsPanel();

    this.mobileControls = this.createMobileControls();

    this.container.append(hud, this.menuOverlay, this.settingsPanel, this.mobileControls);
  }

  private el(tag: string, className?: string): HTMLElement {
    const element = document.createElement(tag);
    if (className) element.className = className;
    return element;
  }

  private createMenuOverlay(): HTMLElement {
    const overlay = this.el("div", "menu-overlay");
    overlay.innerHTML = `
      <div class="menu-content">
        <h1 class="menu-title">🐍 SNAKE</h1>
        <p class="menu-subtitle">${t("pressToStart", this.locale)}</p>
        <div class="menu-controls-info">
          <div class="control-hint">⬆⬇⬅➡ / WASD</div>
          <div class="control-hint">ESC ${t("pause", this.locale)} | M ${t("mute", this.locale)} | R ${t("restart", this.locale)}</div>
        </div>
        <div class="menu-buttons">
          <button class="menu-btn" data-action="start">${t("play", this.locale)}</button>
          <button class="menu-btn menu-btn-secondary" data-action="settings">${t("settings", this.locale)}</button>
          <button class="menu-btn menu-btn-secondary" data-action="ai-demo">AI Demo</button>
        </div>
      </div>
    `;
    return overlay;
  }

  private createSettingsPanel(): HTMLElement {
    const panel = this.el("div", "settings-panel");
    panel.style.display = "none";
    panel.innerHTML = `
      <div class="settings-content">
        <h2>${t("settings", this.locale)}</h2>
        <div class="setting-row">
          <label>${t("wrapAround", this.locale)}</label>
          <input type="checkbox" id="setting-wrap" />
        </div>
        <div class="setting-row">
          <label>${t("gridSize", this.locale)}</label>
          <select id="setting-grid">
            <option value="15">15×15</option>
            <option value="20" selected>20×20</option>
            <option value="25">25×25</option>
            <option value="30">30×30</option>
          </select>
        </div>
        <div class="setting-row">
          <label>${t("speed", this.locale)}</label>
          <input type="range" id="setting-speed" min="3" max="20" value="8" />
          <span id="setting-speed-val">8</span>
        </div>
        <div class="setting-row">
          <label>${t("level", this.locale)}</label>
          <select id="setting-level">
            <option value="0">${t("classic", this.locale)}</option>
            <option value="1">${t("walls", this.locale)}</option>
            <option value="2">${t("maze", this.locale)}</option>
            <option value="3">${t("spiral", this.locale)}</option>
          </select>
        </div>
        <div class="setting-row">
          <label>${t("highContrast", this.locale)}</label>
          <input type="checkbox" id="setting-contrast" />
        </div>
        <div class="setting-row">
          <label>${t("colorblind", this.locale)}</label>
          <input type="checkbox" id="setting-colorblind" />
        </div>
        <div class="setting-row">
          <label>${t("language", this.locale)}</label>
          <select id="setting-lang">
            <option value="es" ${this.locale === "es" ? "selected" : ""}>Español</option>
            <option value="en" ${this.locale === "en" ? "selected" : ""}>English</option>
          </select>
        </div>
        <div class="setting-row">
          <label>Volumen</label>
          <input type="range" id="setting-volume" min="0" max="100" value="50" />
        </div>
        <button class="menu-btn" data-action="close-settings">${t("back", this.locale)}</button>
      </div>
    `;
    return panel;
  }

  private createMobileControls(): HTMLElement {
    const controls = this.el("div", "mobile-controls");
    controls.innerHTML = `
      <button class="mobile-btn" data-dir="up">▲</button>
      <div class="mobile-row">
        <button class="mobile-btn" data-dir="left">◄</button>
        <button class="mobile-btn" data-dir="right">►</button>
      </div>
      <button class="mobile-btn" data-dir="down">▼</button>
    `;
    return controls;
  }

  updateScore(score: number): void {
    this.scoreEl.textContent = score.toString();
  }

  updateHighScore(highScore: number): void {
    this.highScoreEl.textContent = highScore.toString();
  }

  updateFPS(fps: number): void {
    this.fpsEl.textContent = `${Math.round(fps)} FPS`;
  }

  updateState(state: GameState): void {
    this.menuOverlay.style.display = state === GameState.Menu ? "flex" : "none";
    this.statusEl.textContent =
      state === GameState.Paused ? `⏸ ${t("paused", this.locale)}` : "";
  }

  updatePowerUps(active: ActivePowerUp[], currentTick: number): void {
    this.powerUpBar.innerHTML = "";
    for (const ap of active) {
      const remaining = Math.max(0, ap.expiresAtTick - currentTick);
      const badge = this.el("span", "powerup-badge");
      badge.textContent = `${this.powerUpIcon(ap.type)} ${remaining}`;
      badge.style.color = this.powerUpColor(ap.type);
      this.powerUpBar.append(badge);
    }
  }

  updateChallenge(challenge: ChallengeObjective | null): void {
    if (!challenge) {
      this.challengeEl.style.display = "none";
      return;
    }
    this.challengeEl.style.display = "block";
    this.challengeEl.textContent = `${challenge.description}: ${challenge.current}/${challenge.target}`;
    if (challenge.completed) {
      this.challengeEl.classList.add("challenge-complete");
    }
  }

  showSettings(): void {
    this.settingsPanel.style.display = "flex";
    this.menuOverlay.style.display = "none";
  }

  hideSettings(): void {
    this.settingsPanel.style.display = "none";
  }

  getMenuOverlay(): HTMLElement {
    return this.menuOverlay;
  }

  getSettingsPanel(): HTMLElement {
    return this.settingsPanel;
  }

  getMobileControls(): HTMLElement {
    return this.mobileControls;
  }

  setLocale(locale: Locale): void {
    this.locale = locale;
  }

  private powerUpIcon(type: PowerUpType): string {
    switch (type) {
      case PowerUpType.Speed: return "⚡";
      case PowerUpType.Slow: return "🐢";
      case PowerUpType.Ghost: return "👻";
      case PowerUpType.DoubleScore: return "×2";
    }
  }

  private powerUpColor(type: PowerUpType): string {
    switch (type) {
      case PowerUpType.Speed: return COLORS.powerUpSpeed;
      case PowerUpType.Slow: return COLORS.powerUpSlow;
      case PowerUpType.Ghost: return COLORS.powerUpGhost;
      case PowerUpType.DoubleScore: return COLORS.powerUpDouble;
    }
  }
}
