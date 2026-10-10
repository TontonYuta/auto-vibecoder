# AGENTS.md — Agent Instruction & Operational Manual

> **Target Audience:** Autonomous AI Coding Agents (`agy`, Claude Code, Cursor, Devin, Windsurf, Copilot, etc.).  
> **Repository Mission:** Autonomous Vibecoding Harness orchestrating Google AI Studio Apps (`https://aistudio.google.com/apps`) via Playwright CDP, featuring automated self-healing, progressive multi-turn prompting, and live sandbox verification.

---

## 1. Quick Orientation for Agents

When you (an AI Agent) are tasked with running, fixing, or extending this repository:
1. **Nature of the project:** Node.js + Playwright automation tool that connects to an existing Google Chrome session running with `--remote-debugging-port=9222`.
2. **Why CDP instead of launch?** Google detects and blocks automated login via vanilla Puppeteer/Playwright. Using Chrome DevTools Protocol (CDP) attaches to an authenticated user session with 0% bot detection risk.
3. **Core Workflow:**
   - **Step 1:** Verify or launch Chrome on port `9222`.
   - **Step 2:** Parse app specification (`specs/*.yaml`) or user idea.
   - **Step 3:** Drive AI Studio through progressive build stages (`v1` Base -> `v2` Mechanics -> `v3` Visual Juice & Audio -> `v4` Polish).
   - **Step 4:** Observe generation status, trigger auto-fix if build fails, aggregate console errors, and verify the live preview.

---

## 2. Environment Prerequisites & Setup Commands

Always run these verification commands before executing tasks:

```bash
# 1. Install dependencies
npm install

# 2. Check if Chrome CDP port 9222 is alive
curl -s http://localhost:9222/json/version

# 3. If port 9222 is NOT responding, start Chrome with remote debugging:
# On Linux:
google-chrome --remote-debugging-port=9222 --user-data-dir="$HOME/.config/google-chrome-ai-studio" https://aistudio.google.com/apps &

# 4. Run a recipe (e.g. MathHeads clone):
npm run vibecode:mathheads
```

---

## 3. Skill Library Integration (`skills/`)

As an AI Agent, you MUST consult and apply these specialized skills when modifying prompts, generating features, or evaluating app quality:

| Skill File | When to Consult / Apply |
| :--- | :--- |
| [`skills/ui-ux-design-pro.md`](file:///home/tontonyuta/auto-vibecoder/skills/ui-ux-design-pro.md) | Designing prompts for modern UI, Tailwind styling, Dark mode, typography, micro-interactions, responsive layout (375px - 1920px). |
| [`skills/performance-optimization.md`](file:///home/tontonyuta/auto-vibecoder/skills/performance-optimization.md) | Crafting logic for zero-latency Web Audio API, Canvas particle pooling, smooth 60fps animations, memory leak prevention. |
| [`skills/web-security.md`](file:///home/tontonyuta/auto-vibecoder/skills/web-security.md) | Ensuring generated apps have secure LocalStorage handling, input sanitization, safe math evaluation without `eval()`. |
| [`skills/prompt-architect.md`](file:///home/tontonyuta/auto-vibecoder/skills/prompt-architect.md) | Breaking down any high-level PRD into incremental, high-success prompts tailored for Gemini 3.8 / Pro in AI Studio. |

---

## 4. Codebase Architecture

```
auto-vibecoder/
├── AGENTS.md                  # This manual (Always read first)
├── README.md                  # User-facing documentation & showcase
├── package.json               # Scripts & dependencies
├── bin/
│   └── vibecoder.js           # CLI entrypoint executable
├── src/
│   ├── core/
│   │   ├── browser.js         # CDP connection manager & port checker
│   │   ├── driver.js          # Google AI Studio DOM driver & state machine
│   │   └── healing.js         # Self-healing engine (Fix button, Error banner, Console errors)
│   ├── planner/
│   │   └── planner.js         # PRD-to-Prompts breakdown planner
│   └── utils/
│       └── logger.js          # Formatted console output & spinner utilities
├── skills/                    # Domain knowledge for AI agents
├── specs/                     # Declarative recipes for building apps
│   ├── mathheads.yaml         # Complete recipe for MathHeads mental math game
│   └── template.yaml          # Template for defining new app recipes
└── output/                    # Screenshots and runtime reports
```

---

## 5. Self-Healing & Failure Protocol

When automated builds run, handle failures according to this protocol:
1. **Build Error Detected:**
   - Priority 1: Check for `button:has-text("Fix")` or `button:has-text("Fix with Gemini")` and click it.
   - Priority 2: Extract text from `[role="alert"]` or `.error-banner` and send a targeted prompt:
     `"Bản build bị lỗi: [error_text]. Hãy sửa lại toàn bộ mã nguồn liên quan."`
2. **Silent Runtime Crashes:**
   - Listen to `page.on('console')`. If `msg.type() === 'error'`, filter out 3rd-party analytics and feed unhandled exceptions back into the chat.
3. **Loop Safety:**
   - Maximum 3 self-heal attempts per build stage. If still failing, capture a full screenshot to `output/failed_stage.png` and alert the user.

---

## 6. How Agents Can Extend This Repo

- **Adding a new app recipe:** Create a new file in `specs/<app-name>.yaml` following [`specs/template.yaml`](file:///home/tontonyuta/auto-vibecoder/specs/template.yaml).
- **Adding a new skill:** Add a markdown file in `skills/<skill-name>.md` detailing rules, anti-patterns, and optimal prompt snippets.
- **Improving driver resilience:** If Google updates AI Studio DOM, update selector fallbacks in [`src/core/driver.js`](file:///home/tontonyuta/auto-vibecoder/src/core/driver.js).
