import { initDotLens } from "./dot-lens.js";

class HeroCard extends HTMLElement {
  connectedCallback() {
    if (this.initialized) return;

    this.initialized = true;

    this.innerHTML = `
      <link rel="stylesheet" href="./components/hero-card/hero-card.css">

      <section class="hero-card" id="top" aria-labelledby="hero-title">
        <canvas class="hero-bg-canvas" aria-hidden="true"></canvas>

        <header class="hero-header">
          <nav class="header-pill" aria-label="Main navigation">
            <a class="pill-brand" href="#top" aria-label="ZeroCommit home">
              <span class="pill-logo" aria-hidden="true">Z</span>
              <span>ZeroCommit</span>
            </a>

            <a class="pill-btn" href="#get-started">
              Get Started
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </a>
          </nav>
        </header>

        <div class="hero-body">
          <div class="hero-eyebrow">
            <span class="hero-eyebrow-mark"></span>
            <span>Your code. Your AI. Your workflow.</span>
          </div>

          <div class="typography-group">
            <span class="subtitle">Introducing</span>
            <h1 class="title" id="hero-title">ZeroCommit</h1>
          </div>

          <p class="hero-tagline">
            Give AI your codebase. Get the solution. Apply changes across
            your project without the repetitive copy-paste.
          </p>
        </div>

        <div class="hero-bottom" aria-hidden="true">
          <span>AI-ASSISTED CODE EDITING</span>
          <span class="hero-bottom-right">CONTEXT → INSTRUCTIONS → CHANGES</span>
        </div>
      </section>
    `;

    const canvas = this.querySelector(".hero-bg-canvas");
    const card = this.querySelector(".hero-card");

    if (canvas && card) {
      this.cleanup = initDotLens(canvas, card);
    }
  }

  disconnectedCallback() {
    if (this.cleanup) {
      this.cleanup();
      this.cleanup = null;
    }

    this.initialized = false;
  }
}

if (!customElements.get("hero-card")) {
  customElements.define("hero-card", HeroCard);
}