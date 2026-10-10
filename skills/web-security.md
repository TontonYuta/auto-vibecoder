# Skill: Web Application Security Standards for AI Studio Apps

> **Objective:** Ensure generated applications are completely secure, free of dangerous injection vectors, and safely persist data in client environments.

---

## 1. Zero `eval()` / Safe Math Evaluation
* **Rule:** Never allow `eval(str)` or `new Function('return ' + str)()` to evaluate user-submitted math expressions.
* **Approved Pattern:** Write dedicated, deterministic generator and evaluator functions:
  ```typescript
  // Safe math evaluation
  function evaluateProblem(num1: number, op: '+' | '-' | '×' | '÷', num2: number): number {
    switch (op) {
      case '+': return num1 + num2;
      case '-': return num1 - num2;
      case '×': return num1 * num2;
      case '÷': return Math.floor(num1 / num2);
    }
  }
  ```

---

## 2. Safe LocalStorage Persistence
* Wrap all `localStorage` access in `try...catch` blocks to prevent crashes when running in private browsing modes or locked-down iframes.
* Always validate and sanitize parsed JSON schemas with default fallbacks:
  ```typescript
  function loadSavedStats() {
    try {
      const raw = localStorage.getItem('app_stats');
      if (!raw) return DEFAULT_STATS;
      const parsed = JSON.parse(raw);
      return typeof parsed === 'object' && parsed !== null ? parsed : DEFAULT_STATS;
    } catch {
      return DEFAULT_STATS;
    }
  }
  ```

---

## 3. Sandboxed Iframe & DOM Safety
* Do not attempt to access `window.parent` or `top` from within the generated application (will trigger cross-origin DOM exceptions).
* All external links must have `target="_blank" rel="noopener noreferrer"`.
* Prevent prototype pollution when merging configuration objects.
