# 🐍 Snake TS Arcade

A deterministic and modular Snake game built with **TypeScript**, **Vite**, and **HTML5 Canvas**.

This project demonstrates clean architecture, separation of concerns, deterministic game logic, AI pathfinding, and full test coverage.

---

## 🚀 Tech Stack

| Category | Technology |
|-----------|------------|
| Language | TypeScript (strict mode) |
| Build Tool | Vite 5 |
| Rendering | HTML5 Canvas |
| Testing | Vitest |
| Linting | ESLint + Prettier |
| CI/CD | GitHub Actions |

---

## ✨ Features

### Core Gameplay
- Grid-based deterministic movement
- Configurable tick speed
- Keyboard (WASD + Arrows), touch, and gamepad support
- Collision detection (walls, self, obstacles)
- Score system with persistent high score
- Pause / Restart
- Responsive UI

### Advanced Features
- Wrap-around mode (optional)
- Multiple predefined levels
- Power-ups:
  - Speed boost
  - Slow motion
  - Ghost mode
  - Double score
- AI bot using BFS pathfinding
- Particle effects
- Synthesized audio via Web Audio API
- Deterministic replay export/import (JSON)
- Accessibility modes:
  - High contrast
  - Colorblind mode
- Internationalization (English / Spanish)

---

## 📦 Installation

```bash
git clone https://github.com/santiagorosa3162-eng/snake-ts-arcade.git
cd snake-ts-arcade
npm install
