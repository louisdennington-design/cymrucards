class WelshPracticeApp {
  constructor() {
    this.currentWord = null;
    this.welshFirst = false;

    // selected mode (defaults from UI if present)
    this.materialType = "nouns";

    // progress tracking (10% steps)
    this.lastProgressStep = null;

    this.init();
  }

  init() {
    this.cacheElements();
    this.initStateFromUI();
    this.bindEvents();
    this.updateProgress(); // initialise display
  }

  cacheElements() {
    this.nextBtn = document.getElementById("nextBtn");
    this.revealBtn = document.getElementById("revealBtn");
    this.languageToggle = document.getElementById("languageToggle");
    this.resetBtn = document.getElementById("resetBtn");

    this.primaryWord = document.getElementById("primaryWord");
    this.translation = document.getElementById("translation");

    // NEW progress UI
    this.progressPercent = document.getElementById("progressPercent");

    // mode select
    this.materialTypeSelect = document.getElementById("materialType");

    // alphabet UI
    this.alphabetBtn = document.getElementById("alphabetBtn");
    this.alphabetPanel = document.getElementById("alphabetPanel");
  }

  initStateFromUI() {
    if (this.languageToggle) {
      this.welshFirst = !!this.languageToggle.checked;
    }

    if (this.materialTypeSelect && this.materialTypeSelect.value) {
      this.materialType = this.materialTypeSelect.value;
    }
  }

  bindEvents() {
    if (this.nextBtn) {
      this.nextBtn.addEventListener("click", () => this.getNextWord());
    }

    if (this.revealBtn) {
      this.revealBtn.addEventListener("click", () => this.revealTranslation());
    }

    if (this.languageToggle) {
      this.languageToggle.addEventListener("change", (e) => {
        this.welshFirst = e.target.checked;
        this.updateDisplay();
      });
    }

    // mode change
    if (this.materialTypeSelect) {
      this.materialTypeSelect.addEventListener("change", async (e) => {
        this.materialType = e.target.value;

        // reset progress step for this mode (frontend-side)
        this.lastProgressStep = null;

        // clear current display so it's obvious mode changed
        this.currentWord = null;
        if (this.primaryWord) this.primaryWord.textContent = 'Click "Next" to start!';
        if (this.translation) this.translation.classList.add("hidden");
        if (this.revealBtn) this.revealBtn.disabled = true;

        this.updateProgress();

        // optional auto-fetch
        await this.getNextWord();
      });
    }

    // alphabet toggle
    if (this.alphabetBtn && this.alphabetPanel) {
      this.alphabetBtn.addEventListener("click", () => this.toggleAlphabet());
    }

    if (this.resetBtn) {
      this.resetBtn.addEventListener("click", () => this.resetSession());
    }
  }

  async getNextWord() {
    try {
      const url = new URL("/api/word", window.location.origin);
      url.searchParams.set("type", this.materialType);

      const response = await fetch(url.toString());
      if (!response.ok) throw new Error("Failed to fetch word");

      this.currentWord = await response.json();

      this.updateDisplay();
      this.updateProgress();

      // Enable reveal button and hide translation
      if (this.revealBtn) this.revealBtn.disabled = false;
      if (this.translation) this.translation.classList.add("hidden");
    } catch (error) {
      console.error("Error fetching word:", error);
      if (this.primaryWord) this.primaryWord.textContent = "Error loading item";
    }
  }

  updateDisplay() {
    if (!this.currentWord) return;
    if (!this.primaryWord || !this.translation) return;

    // Expecting backend: { english: "...", welsh: "...", total?: n, seen?: n }
    if (this.welshFirst) {
      this.primaryWord.textContent = this.currentWord.welsh ?? "";
      this.translation.textContent = this.currentWord.english ?? "";
    } else {
      this.primaryWord.textContent = this.currentWord.english ?? "";
      this.translation.textContent = this.currentWord.welsh ?? "";
    }
  }

  revealTranslation() {
    if (this.translation) this.translation.classList.remove("hidden");
    if (this.revealBtn) this.revealBtn.disabled = true;
  }

  updateProgress() {
    if (!this.progressPercent) return;

    // Prefer backend-provided totals
    const total = Number(this.currentWord?.total);
    const seen = Number(this.currentWord?.seen);

    // If missing, fall back to 0% (keeps UI stable)
    if (!Number.isFinite(total) || !Number.isFinite(seen) || total <= 0) {
      this.progressPercent.textContent = "0%";
      return;
    }

    const rawPct = (seen / total) * 100;
    const stepPct = Math.max(0, Math.min(100, Math.floor(rawPct / 10) * 10));

    // Only update (and animate) when crossing a 10% boundary
    if (this.lastProgressStep === null) {
      this.lastProgressStep = stepPct;
      this.progressPercent.textContent = `${stepPct}%`;
      return;
    }

    if (stepPct !== this.lastProgressStep) {
      this.lastProgressStep = stepPct;
      this.progressPercent.textContent = `${stepPct}%`;
      this.pulseProgressPercent();
    }
  }

  pulseProgressPercent() {
    if (!this.progressPercent) return;

    // restart animation reliably
    this.progressPercent.classList.remove("pulse");
    // force reflow
    void this.progressPercent.offsetWidth;
    this.progressPercent.classList.add("pulse");

    const onEnd = () => {
      this.progressPercent.classList.remove("pulse");
      this.progressPercent.removeEventListener("animationend", onEnd);
    };
    this.progressPercent.addEventListener("animationend", onEnd);
  }

  toggleAlphabet() {
    if (!this.alphabetBtn || !this.alphabetPanel) return;

    const isHidden = this.alphabetPanel.classList.contains("hidden");
    if (isHidden) {
      this.alphabetPanel.classList.remove("hidden");
      this.alphabetPanel.setAttribute("aria-hidden", "false");
      this.alphabetBtn.setAttribute("aria-expanded", "true");
    } else {
      this.alphabetPanel.classList.add("hidden");
      this.alphabetPanel.setAttribute("aria-hidden", "true");
      this.alphabetBtn.setAttribute("aria-expanded", "false");
    }
  }

  async resetSession() {
    try {
      // keep your existing reset endpoint; if you later add per-mode reset, pass type here
      await fetch("/api/reset-session", { method: "POST" });

      if (this.primaryWord) {
        this.primaryWord.textContent = 'Session reset! Click "Next" to start.';
      }
      if (this.translation) this.translation.classList.add("hidden");
      if (this.revealBtn) this.revealBtn.disabled = true;

      this.currentWord = null;
      this.lastProgressStep = null;
      this.updateProgress();

      // hide alphabet panel on reset (optional)
      if (this.alphabetPanel) this.alphabetPanel.classList.add("hidden");
      if (this.alphabetBtn) this.alphabetBtn.setAttribute("aria-expanded", "false");
      if (this.alphabetPanel) this.alphabetPanel.setAttribute("aria-hidden", "true");
    } catch (error) {
      console.error("Error resetting session:", error);
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new WelshPracticeApp();
});
