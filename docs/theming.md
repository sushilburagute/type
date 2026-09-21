# theming

`type` supports system, light, dark, dark modern, light modern, monokai, solarized dark, quiet light and abyss themes; blue, red and green accents; and Geist Mono, Newsreader and Space Grotesk editor fonts.

Settings live in the `type:settings` localStorage entry. A small inline script in `index.html` applies `data-theme`, `data-color-scheme`, `data-accent`, and `data-font` before React starts, preventing a wrong-theme flash. React keeps those attributes synchronized after startup, and a persisted non-default font is loaded from the app's own assets.

Semantic colours are declared in `src/styles/theme.css` and exposed to Tailwind in `src/styles/index.css`. Add a theme token there instead of placing literal colours in components. Motion is CSS-only and disabled by `prefers-reduced-motion`.
