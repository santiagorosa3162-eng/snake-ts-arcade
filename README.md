# 🐍 Snake Game

Juego Snake profesional construido con TypeScript, HTML5 Canvas y Vite. Incluye power-ups, niveles, IA, sistema de partículas, replay determinístico, i18n y más.

![Snake Game Demo](https://via.placeholder.com/800x400/0a0a0a/22c55e?text=🐍+SNAKE+GAME+DEMO)

> **[▶ Jugar Demo en Vivo](https://tu-usuario.github.io/snake-game/)**

---

## Stack Tecnológico

| Categoría | Tecnología |
|-----------|-----------|
| Lenguaje | TypeScript (strict mode) |
| Build | Vite 5 |
| Rendering | HTML5 Canvas 2D |
| Tests | Vitest |
| Linting | ESLint + Prettier |
| CI/CD | GitHub Actions |
| Deploy | GitHub Pages |

---

## Características

### MVP (Implementado)
- Movimiento en cuadrícula por pasos con velocidad configurable
- Controles: teclado (flechas + WASD), touch (swipe + botones), gamepad
- Comida aleatoria sin solapamiento
- Colisiones: pared, cuerpo propio, obstáculos
- Puntuación + récord local (localStorage)
- Pausa / reanudar / reiniciar
- UI responsiva con controles móviles
- Separación modular: engine / rendering / UI / persistencia

### Features Avanzadas (Implementado)
- ✅ Modo sin paredes (wrap-around)
- ✅ Power-ups: velocidad, ralentización, modo fantasma, doble puntuación
- ✅ Obstáculos y 4 niveles predefinidos (clásico, paredes, laberinto, espiral)
- ✅ IA bot con BFS pathfinding
- ✅ Partículas al comer y al morir
- ✅ Audio sintetizado (Web Audio API) con control de volumen
- ✅ Soporte gamepad (API Gamepad)
- ✅ Accesibilidad: alto contraste, modo daltónico
- ✅ Localización (i18n): español e inglés
- ✅ Save/Load de replay (determinístico, exportable como JSON)
- ✅ Analítica básica (stub opt-in, sin envío real)
- ✅ Modo challenge (infraestructura lista)
- ✅ FPS counter

---

## Requisitos

- Node.js ≥ 18
- npm ≥ 9

---

## Instalación

```bash
git clone https://github.com/tu-usuario/snake-game.git
cd snake-game
npm install
```

---

## Uso

### Desarrollo
```bash
npm run dev
```
Abre http://localhost:3000 en el navegador.

### Build de producción
```bash
npm run build
```
Los archivos estáticos quedan en `dist/`.

### Preview de producción
```bash
npm run preview
```

### Tests
```bash
npm test              # ejecutar una vez
npm run test:watch    # modo watch
npm run test:coverage # con cobertura
```

### Lint
```bash
npm run lint          # verificar
npm run lint:fix      # corregir automáticamente
```

### Type check
```bash
npm run typecheck
```

---

## Controles

| Acción | Teclado | Gamepad | Móvil |
|--------|---------|---------|-------|
| Mover arriba | ↑ / W | D-pad ↑ / Stick ↑ | Swipe ↑ / Botón ▲ |
| Mover abajo | ↓ / S | D-pad ↓ / Stick ↓ | Swipe ↓ / Botón ▼ |
| Mover izquierda | ← / A | D-pad ← / Stick ← | Swipe ← / Botón ◄ |
| Mover derecha | → / D | D-pad → / Stick → | Swipe → / Botón ► |
| Pausa | Esc / P | Start | — |
| Silenciar audio | M | — | — |
| Reiniciar | R | — | — |
| Confirmar / Iniciar | Espacio | — | Tap |

---

## Configuración

Todos los parámetros están en `src/config.ts`:

```typescript
{
  gridWidth: 20,          // ancho de la cuadrícula
  gridHeight: 20,         // alto de la cuadrícula
  initialSnakeLength: 3,  // largo inicial
  initialSpeed: 8,        // ticks por segundo
  speedIncrementPerFood: 0.15,
  maxSpeed: 25,
  maxFoodOnBoard: 1,
  wrapAround: false,      // true = sin paredes
  seed: null,             // null = aleatorio, número = determinístico
  powerUpSpawnChance: 0.15,
  cellSize: 24,           // píxeles por celda
}
```

Los niveles se configuran en `src/core/level.ts` con arrays de obstáculos.

---

## Estructura del Proyecto

```
snake-game/
├── public/
│   └── assets/
│       ├── sprites/          # SVGs del juego
│       └── sfx/              # (audio sintetizado en runtime)
├── src/
│   ├── core/
│   │   ├── types.ts          # tipos e interfaces
│   │   ├── engine.ts         # motor de juego (tick loop)
│   │   ├── snake.ts          # lógica de serpiente
│   │   ├── food.ts           # spawn y colisión de comida
│   │   ├── powerup.ts        # power-ups
│   │   ├── level.ts          # niveles y obstáculos
│   │   └── ai.ts             # IA con BFS
│   ├── render/
│   │   ├── canvasRenderer.ts # renderizado Canvas 2D
│   │   └── particles.ts      # sistema de partículas
│   ├── audio/
│   │   └── audioManager.ts   # Web Audio API
│   ├── ui/
│   │   ├── hud.ts            # HUD y menús
│   │   └── controls.ts       # input: teclado, touch, gamepad
│   ├── i18n/
│   │   └── index.ts          # traducciones ES/EN
│   ├── persistence/
│   │   └── storage.ts        # localStorage: scores, saves, replays
│   ├── utils/
│   │   ├── math.ts           # SeededRandom, helpers
│   │   └── analytics.ts      # stub de analítica
│   ├── config.ts             # configuración central
│   ├── style.css             # estilos globales
│   └── main.ts               # punto de entrada
├── tests/
│   ├── snake.test.ts
│   ├── food.test.ts
│   └── engine.test.ts
├── .github/
│   └── workflows/ci.yml
├── .eslintrc.json
├── .prettierrc
├── .gitignore
├── .env.example
├── package.json
├── tsconfig.json
├── vite.config.ts
├── LICENSE
└── README.md
```

---

## Deploy

### GitHub Pages

1. En el repositorio, ir a **Settings → Pages → Source: GitHub Actions**.
2. Cada push a `main` ejecuta el workflow que construye y despliega automáticamente.
3. Alternativa manual:
   ```bash
   npm run deploy:gh-pages
   ```

### Vercel

1. Importar el repositorio en [vercel.com](https://vercel.com).
2. Framework Preset: **Vite**.
3. Build Command: `npm run build`.
4. Output Directory: `dist`.
5. Deploy.

### Netlify

1. Conectar el repositorio.
2. Build Command: `npm run build`.
3. Publish Directory: `dist`.

---

## Features No Implementadas (Guía de Implementación)

### Multijugador Local (Split-Screen)
**Dificultad: Media**

1. Crear un segundo `GameEngine` con controles separados (WASD vs flechas).
2. Dividir el canvas en dos mitades con `ctx.save()`/`ctx.restore()` y `ctx.translate()`.
3. Cada engine mantiene su propio estado.
4. Compartir el array de obstáculos y comida o mantenerlos independientes.

### Multijugador Online (WebSocket)
**Dificultad: Alta**

1. Backend: Node.js + Socket.io.
   ```bash
   npm install socket.io express
   ```
2. Servidor mantiene el `GameEngine` autoritativo.
3. Clientes envían inputs, servidor broadcast snapshots a ~20 Hz.
4. Esquema de mensajes:
   - `client→server`: `{ type: "input", direction: "UP" }`
   - `server→client`: `{ type: "state", snapshot: GameSnapshot }`

### Infinite Runner
**Dificultad: Media**

1. Usar un `gridWidth` virtual mucho mayor.
2. Cámara que sigue la cabeza de la serpiente con offset.
3. Generar obstáculos proceduralmente usando el `SeededRandom`.
4. Eliminar obstáculos fuera de la vista.

### Leaderboard Remoto
**Dificultad: Media**

Opción A — Supabase:
```sql
CREATE TABLE leaderboard (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  score integer NOT NULL,
  created_at timestamptz DEFAULT now()
);
```

Opción B — Node.js + SQLite:
```typescript
// server.ts
import express from "express";
import Database from "better-sqlite3";

const db = new Database("leaderboard.db");
db.exec("CREATE TABLE IF NOT EXISTS scores (id INTEGER PRIMARY KEY, name TEXT, score INTEGER, ts TEXT)");

const app = express();
app.use(express.json());

app.get("/api/scores", (_, res) => {
  const rows = db.prepare("SELECT * FROM scores ORDER BY score DESC LIMIT 100").all();
  res.json(rows);
});

app.post("/api/scores", (req, res) => {
  const { name, score } = req.body;
  db.prepare("INSERT INTO scores (name, score, ts) VALUES (?, ?, datetime('now'))").run(name, score);
  res.json({ ok: true });
});

app.listen(3001);
```

### Gráficos 3D (Three.js)
**Dificultad: Alta**

1. Reemplazar `CanvasRenderer` por un `ThreeRenderer` que use `THREE.BoxGeometry` para cada segmento.
2. Cámara isométrica o follow-cam.
3. Mantener el engine intacto (separación lógica/presentación).

---

## Plan de Commits Sugerido

| # | Mensaje | Contenido |
|---|---------|-----------|
| 1 | `feat: project scaffold and configuration` | package.json, tsconfig, vite.config, eslint, prettier, gitignore, LICENSE |
| 2 | `feat: core game engine and types` | types.ts, config.ts, snake.ts, food.ts, engine.ts, math.ts |
| 3 | `feat: canvas renderer and particle system` | canvasRenderer.ts, particles.ts |
| 4 | `feat: UI, controls, audio, i18n, persistence` | hud.ts, controls.ts, audioManager.ts, i18n/, storage.ts, style.css |
| 5 | `feat: main entry point and game loop` | main.ts, index.html, assets |
| 6 | `feat: advanced features (AI, powerups, levels)` | ai.ts, powerup.ts, level.ts |
| 7 | `test: unit tests for core modules` | tests/*.test.ts |
| 8 | `ci: GitHub Actions workflow` | .github/workflows/ci.yml |
| 9 | `docs: README and documentation` | README.md, .env.example |

---

## Checklist de QA Manual

- [ ] El juego se inicia al presionar Espacio o el botón "Jugar"
- [ ] La serpiente se mueve correctamente con flechas y WASD
- [ ] No se puede revertir la dirección directamente
- [ ] La comida aparece sin solaparse con la serpiente
- [ ] La serpiente crece al comer
- [ ] La puntuación se actualiza correctamente
- [ ] El récord se persiste entre recargas
- [ ] Colisión con pared termina el juego (modo borders on)
- [ ] Colisión con el cuerpo termina el juego
- [ ] Wrap-around funciona correctamente cuando está activado
- [ ] Pausa con Esc funciona
- [ ] Silenciar con M funciona
- [ ] Reiniciar con R funciona
- [ ] Los power-ups aparecen y se recogen correctamente
- [ ] El modo fantasma permite atravesar el cuerpo
- [ ] La IA juega automáticamente sin chocar
- [ ] Los controles táctiles funcionan en móvil
- [ ] Los botones de dirección funcionan en móvil
- [ ] La UI se escala correctamente en pantallas pequeñas
- [ ] Los niveles cargan los obstáculos correctamente
- [ ] El panel de ajustes cambia los parámetros
- [ ] Cambiar idioma funciona
- [ ] Alto contraste y modo daltónico aplican cambios visuales
- [ ] Los tests pasan (`npm test`)
- [ ] El build produce dist/ sin errores (`npm run build`)

---

## Stacks Alternativos

### Python + Pygame
```bash
pip install pygame
python main.py
```
Estructura: adaptar `core/` a Python puro, Pygame solo para rendering.

### Rust + Bevy
```bash
cargo init snake-game
cargo add bevy
cargo run
```

### Electron (wrapper de la versión web)
```bash
npm install electron --save-dev
npx electron .
```

### Unity (C# + WebGL)
Exportar como WebGL desde Unity Editor. La lógica de `engine.ts` se traduce directamente a C#.

---

## Contribuir

1. Fork del repositorio
2. Crear branch: `git checkout -b feature/mi-feature`
3. Commit: `git commit -m 'feat: mi feature'`
4. Push: `git push origin feature/mi-feature`
5. Pull Request

---

## Roadmap

- [ ] Multijugador local (split-screen)
- [ ] Multijugador online (WebSocket)
- [ ] Leaderboard remoto (Supabase)
- [ ] Modo infinite runner
- [ ] Editor de niveles visual
- [ ] Temas visuales seleccionables
- [ ] Soporte PWA (offline)
- [ ] Replay visual (reproducir partidas guardadas)
- [ ] Logros / achievements

---

## Licencia

[MIT](LICENSE)

---

```
    ████████████████████████
    █                      █
    █   ■ ■ ■ ■ ●         █
    █               ◆     █
    █                      █
    █         ★            █
    █                      █
    ████████████████████████

    ■ = snake  ● = head  ◆ = food  ★ = power-up
```
