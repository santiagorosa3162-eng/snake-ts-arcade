import { Direction } from "../core/types";
import { KEYS, SWIPE_THRESHOLD, SWIPE_MAX_TIME } from "../config";

export type InputCallback = (action: InputAction) => void;

export type InputAction =
  | { type: "direction"; direction: Direction }
  | { type: "pause" }
  | { type: "mute" }
  | { type: "restart" }
  | { type: "confirm" };

export class InputController {
  private callback: InputCallback;
  private touchStartX: number = 0;
  private touchStartY: number = 0;
  private touchStartTime: number = 0;
  private gamepadInterval: number | null = null;
  private gamepadPrevButtons: boolean[] = [];
  private destroyed: boolean = false;

  private boundKeyDown: (e: KeyboardEvent) => void;
  private boundTouchStart: (e: TouchEvent) => void;
  private boundTouchEnd: (e: TouchEvent) => void;

  constructor(callback: InputCallback) {
    this.callback = callback;

    this.boundKeyDown = this.onKeyDown.bind(this);
    this.boundTouchStart = this.onTouchStart.bind(this);
    this.boundTouchEnd = this.onTouchEnd.bind(this);

    document.addEventListener("keydown", this.boundKeyDown);
    document.addEventListener("touchstart", this.boundTouchStart, { passive: false });
    document.addEventListener("touchend", this.boundTouchEnd, { passive: false });

    this.startGamepadPolling();
  }

  private onKeyDown(e: KeyboardEvent): void {
    const code = e.code;

    if (KEYS.UP.includes(code)) {
      e.preventDefault();
      this.callback({ type: "direction", direction: Direction.Up });
    } else if (KEYS.DOWN.includes(code)) {
      e.preventDefault();
      this.callback({ type: "direction", direction: Direction.Down });
    } else if (KEYS.LEFT.includes(code)) {
      e.preventDefault();
      this.callback({ type: "direction", direction: Direction.Left });
    } else if (KEYS.RIGHT.includes(code)) {
      e.preventDefault();
      this.callback({ type: "direction", direction: Direction.Right });
    } else if (KEYS.PAUSE.includes(code)) {
      e.preventDefault();
      this.callback({ type: "pause" });
    } else if (KEYS.MUTE.includes(code)) {
      e.preventDefault();
      this.callback({ type: "mute" });
    } else if (KEYS.RESTART.includes(code)) {
      e.preventDefault();
      this.callback({ type: "restart" });
    } else if (code === "Space") {
      e.preventDefault();
      this.callback({ type: "confirm" });
    }
  }

  private onTouchStart(e: TouchEvent): void {
    if (e.touches.length === 1) {
      this.touchStartX = e.touches[0].clientX;
      this.touchStartY = e.touches[0].clientY;
      this.touchStartTime = Date.now();
    }
  }

  private onTouchEnd(e: TouchEvent): void {
    if (e.changedTouches.length === 0) return;

    const dx = e.changedTouches[0].clientX - this.touchStartX;
    const dy = e.changedTouches[0].clientY - this.touchStartY;
    const elapsed = Date.now() - this.touchStartTime;

    if (elapsed > SWIPE_MAX_TIME) return;

    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    if (absDx < SWIPE_THRESHOLD && absDy < SWIPE_THRESHOLD) {
      this.callback({ type: "confirm" });
      return;
    }

    if (absDx > absDy) {
      this.callback({
        type: "direction",
        direction: dx > 0 ? Direction.Right : Direction.Left,
      });
    } else {
      this.callback({
        type: "direction",
        direction: dy > 0 ? Direction.Down : Direction.Up,
      });
    }
  }

  private startGamepadPolling(): void {
    this.gamepadInterval = window.setInterval(() => {
      if (this.destroyed) return;
      const gamepads = navigator.getGamepads();
      if (!gamepads) return;

      for (const gp of gamepads) {
        if (!gp) continue;
        this.processGamepad(gp);
        break;
      }
    }, 100);
  }

  private processGamepad(gp: Gamepad): void {
    const threshold = 0.5;

    if (gp.axes[1] < -threshold) {
      this.callback({ type: "direction", direction: Direction.Up });
    } else if (gp.axes[1] > threshold) {
      this.callback({ type: "direction", direction: Direction.Down });
    } else if (gp.axes[0] < -threshold) {
      this.callback({ type: "direction", direction: Direction.Left });
    } else if (gp.axes[0] > threshold) {
      this.callback({ type: "direction", direction: Direction.Right });
    }

    if (gp.buttons[12]?.pressed) this.callback({ type: "direction", direction: Direction.Up });
    if (gp.buttons[13]?.pressed) this.callback({ type: "direction", direction: Direction.Down });
    if (gp.buttons[14]?.pressed) this.callback({ type: "direction", direction: Direction.Left });
    if (gp.buttons[15]?.pressed) this.callback({ type: "direction", direction: Direction.Right });

    const wasPressed = this.gamepadPrevButtons[9] ?? false;
    if (gp.buttons[9]?.pressed && !wasPressed) {
      this.callback({ type: "pause" });
    }

    this.gamepadPrevButtons = gp.buttons.map((b) => b.pressed);
  }

  destroy(): void {
    this.destroyed = true;
    document.removeEventListener("keydown", this.boundKeyDown);
    document.removeEventListener("touchstart", this.boundTouchStart);
    document.removeEventListener("touchend", this.boundTouchEnd);
    if (this.gamepadInterval !== null) {
      clearInterval(this.gamepadInterval);
    }
  }
}
