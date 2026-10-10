# Skill: Prompt Architecture & Multi-Stage Staging for AI Studio

> **Objective:** Break down complex project specifications into incremental, high-success prompts that keep Gemini 3.8 / Pro in a flow state without triggering model overload or truncated code.

---

## 1. The Monolithic Prompt Anti-Pattern
❌ **Anti-Pattern:** Dumping an entire 15-page PRD into a single prompt on AI Studio.
* Result: AI Studio runs out of output tokens, omits critical components, invents mock placeholders, or fails with TypeScript compilation errors.

---

## 2. The 4-Stage Progressive Delivery Formula
Always structure prompts into 4 focused iterations:

### Stage 1: Foundation & Core Layout (v1)
* Define the visual shell, color theme (Dark Slate), font family.
* Implement core state management and basic input/output components.
* Output: A working MVP that renders cleanly without visual glitches.

### Stage 2: Core Game Loop / Main Feature (v2)
* Implement the primary interactive loop (e.g., timer, score, streak multiplier).
* Introduce responsive numpad / keyboard shortcuts.
* Output: An engaging, playable/usable core loop.

### Stage 3: Game Feel, Audio & Advanced Modes (v3)
* Synthesize Web Audio API sound effects.
* Add secondary modes (e.g., Survival falling problems, Bot Duel race).
* Add tactile micro-interactions (Canvas particle confetti, screen shake).

### Stage 4: Polish, Analytics & Persistence (v4)
* Add LocalStorage persistence for high scores and progression ranks.
* Polish mobile viewport responsiveness (375px check).
* Add detailed post-game statistics or dashboard modals.
