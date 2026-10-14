import "../components/hero-card/hero-card.js";

const updateYear = () => {
  const year = document.getElementById("year");

  if (year) {
    year.textContent = String(new Date().getFullYear());
  }
};

const setupFaq = () => {
  const faqItems = document.querySelectorAll(".faq-item");

  faqItems.forEach((item) => {
    item.addEventListener("toggle", () => {
      if (!item.open) return;

      faqItems.forEach((otherItem) => {
        if (otherItem !== item) {
          otherItem.open = false;
        }
      });
    });
  });
};

const initialize = () => {
  updateYear();
  setupFaq();
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initialize, { once: true });
} else {
  initialize();
}