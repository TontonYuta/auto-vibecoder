# Skill: UI/UX Design & Game Feel Pro for AI Studio Web Apps

> **Objective:** Instruct AI Studio to build modern, hyper-polished, responsive web apps with incredible aesthetic quality and tactile "game feel" (vibes).

---

## 1. Color Palette & Theming Standard
Always enforce a coherent modern dark theme:
* **Background:** Deep dark slate/zinc (`bg-slate-950` or `bg-zinc-950`), not pure `#000000` which looks flat.
* **Surface / Cards:** Slightly lighter translucent panels (`bg-slate-900/80` with `backdrop-blur-md` and subtle borders `border border-slate-800/80`).
* **Accents & Neon Glow:**
  * Primary Action: Vibrant Cyan / Neon Blue (`#06b6d4`, `#0ea5e9`, with glow: `shadow-[0_0_20px_rgba(6,182,212,0.4)]`).
  * Success / Streaks: Bright Emerald / Mint (`#10b981`).
  * Warning / Danger: Crimson / Rose (`#f43f5e`).
  * Combo Fire: Amber / Gold (`#f59e0b`).

---

## 2. Typography Rules
* **Numbers & Counters:** Always require monospaced fonts (e.g. `font-mono`, JetBrains Mono or Roboto Mono) so digits don't jitter horizontally when numbers change.
* **Headings & Body:** Clean modern sans-serif (Inter, Nunito, Plus Jakarta Sans) with tight tracking (`tracking-tight`).

---

## 3. Responsive & Mobile-First Principles
* Every button must have a minimum touch target of **48px x 48px** for phone usability (`h-12 min-w-[3rem]`).
* Prevent unwanted horizontal scrollbars by wrapping pages in `w-full max-w-full overflow-x-hidden`.
* Use flex/grid with `flex-col sm:flex-row` adaptations.
* Floating virtual numpads must be collapsible or docked at the bottom with safe padding.

---

## 4. "Juice" & Tactile Game Feel
When generating games or interactive tools, always mandate:
1. **Particle Explosions:** A lightweight `<canvas>` particle burst overlay on success (confetti / sparkle stars).
2. **Screen Shake:** CSS keyframe shake (`animate-[shake_0.2s_ease-in-out]`) on wrong answers or damage.
3. **Pop Animations:** Scale bounce (`transform transition-transform active:scale-95 hover:scale-105`) on all buttons.
4. **Combo Multipliers:** Glowing streak counters that escalate in visual intensity (`🔥 x2`, `⚡ x3`, `💥 x5 GODLIKE`).
