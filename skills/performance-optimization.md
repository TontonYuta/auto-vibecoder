# Skill: High-Performance Web Apps in AI Studio Sandbox

> **Objective:** Ensure generated applications run at a silky smooth 60fps without memory leaks, audio lag, or frame drops inside AI Studio's iframe sandbox.

---

## 1. Zero-Dependency Web Audio Synthesis
Never request external audio files (`.mp3` or `.wav` from URLs) because external CDNs frequently fail with CORS errors in sandboxes.

### Standard Audio Engine Prompt Snippet:
```typescript
// Always demand synthesized Web Audio API sound effects:
class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  private init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playCorrect() {
    if (this.isMuted) return;
    this.init();
    const osc = this.ctx!.createOscillator();
    const gain = this.ctx!.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(587.33, this.ctx!.currentTime); // D5
    osc.frequency.exponentialRampToValueAtTime(880, this.ctx!.currentTime + 0.15); // A5
    gain.gain.setValueAtTime(0.2, this.ctx!.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx!.currentTime + 0.15);
    osc.connect(gain);
    gain.connect(this.ctx!.destination);
    osc.start();
    osc.stop(this.ctx!.currentTime + 0.15);
  }

  playError() {
    if (this.isMuted) return;
    this.init();
    const osc = this.ctx!.createOscillator();
    const gain = this.ctx!.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, this.ctx!.currentTime);
    osc.frequency.linearRampToValueAtTime(80, this.ctx!.currentTime + 0.2);
    gain.gain.setValueAtTime(0.25, this.ctx!.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx!.currentTime + 0.2);
    osc.connect(gain);
    gain.connect(this.ctx!.destination);
    osc.start();
    osc.stop(this.ctx!.currentTime + 0.2);
  }
}
```

---

## 2. Canvas Animation & Particle Object Pooling
* When using HTML5 Canvas for particles or falling objects (like Survival Mode):
  * Always use `requestAnimationFrame`.
  * Clean up previous frames with `ctx.clearRect(0, 0, width, height)`.
  * Cancel animation frames in React `useEffect` cleanup return to prevent zombie loops.
  * Limit maximum active particles to 80-120 to keep CPU/GPU utilization minimal.

---

## 3. React Rendering Optimization
* Use `useCallback` for keyboard event listeners.
* Separate high-frequency state (e.g. countdown timer ticking every 100ms) from root component state to avoid re-rendering entire component trees.
