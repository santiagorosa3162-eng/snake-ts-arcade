export type Locale = "es" | "en";

const translations: Record<string, Record<Locale, string>> = {
  score: { es: "Puntos", en: "Score" },
  highScore: { es: "Récord", en: "Best" },
  pause: { es: "Pausa", en: "Pause" },
  paused: { es: "Pausado", en: "Paused" },
  mute: { es: "Silenciar", en: "Mute" },
  restart: { es: "Reiniciar", en: "Restart" },
  play: { es: "Jugar", en: "Play" },
  settings: { es: "Ajustes", en: "Settings" },
  back: { es: "Volver", en: "Back" },
  pressToStart: { es: "Toca o presiona ESPACIO para empezar", en: "Tap or press SPACE to start" },
  gameOver: { es: "Fin del Juego", en: "Game Over" },
  wrapAround: { es: "Sin Paredes", en: "Wrap Around" },
  gridSize: { es: "Tamaño", en: "Grid Size" },
  speed: { es: "Velocidad", en: "Speed" },
  level: { es: "Nivel", en: "Level" },
  classic: { es: "Clásico", en: "Classic" },
  walls: { es: "Paredes", en: "Walls" },
  maze: { es: "Laberinto", en: "Maze" },
  spiral: { es: "Espiral", en: "Spiral" },
  highContrast: { es: "Alto Contraste", en: "High Contrast" },
  colorblind: { es: "Daltonismo", en: "Colorblind" },
  language: { es: "Idioma", en: "Language" },
  tutorial: {
    es: "Usa las flechas o WASD para mover la serpiente. ¡Come la comida y evita las paredes!",
    en: "Use arrows or WASD to move the snake. Eat food and avoid walls!",
  },
  dontShowAgain: { es: "No mostrar de nuevo", en: "Don't show again" },
  save: { es: "Guardar", en: "Save" },
  load: { es: "Cargar", en: "Load" },
  exportReplay: { es: "Exportar Replay", en: "Export Replay" },
};

export function t(key: string, locale: Locale): string {
  return translations[key]?.[locale] ?? key;
}

export function getLocaleFromStorage(): Locale {
  try {
    const stored = localStorage.getItem("snake_locale");
    if (stored === "en" || stored === "es") return stored;
  } catch {
    /* noop */
  }
  return "es";
}
