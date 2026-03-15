const root = document.documentElement;
const stage = document.querySelector("[data-stage]");
const stageShell = stage?.querySelector(".visual-shell");
const copyButtons = document.querySelectorAll(".contact-copy");
const copyToast = document.querySelector(".copy-toast");
const selectableValues = document.querySelectorAll("[data-selectable]");
const revealItems = document.querySelectorAll(".reveal");
const depthCards = [...document.querySelectorAll("[data-depth-card]")];
const magneticItems = document.querySelectorAll("[data-magnetic]");
const ambientCanvas = document.querySelector(".ambient-canvas");
const themeToggle = document.querySelector("[data-theme-toggle]");
const quoteCard = document.querySelector(".quote-card");
const quoteLabel = quoteCard?.querySelector(".quote-label");
const quoteMarquee = quoteCard?.querySelector(".quote-marquee");
const quoteLines = quoteCard ? [...quoteCard.querySelectorAll(".quote-line")] : [];

const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
const finePointerQuery = window.matchMedia("(pointer: fine)");

let prefersReducedMotion = reducedMotionQuery.matches;
let hasFinePointer = finePointerQuery.matches;
let activeTheme = "dark";

const syncPreferences = () => {
  prefersReducedMotion = reducedMotionQuery.matches;
  hasFinePointer = finePointerQuery.matches;
};

reducedMotionQuery.addEventListener?.("change", syncPreferences);
finePointerQuery.addEventListener?.("change", syncPreferences);

const syncThemeToggle = (theme) => {
  if (!themeToggle) {
    return;
  }

  const isDark = theme === "dark";
  themeToggle.setAttribute("aria-pressed", String(isDark));
  themeToggle.title = isDark ? "濃色名片" : "淡色名片";
  themeToggle.setAttribute(
    "aria-label",
    isDark ? "切換爲淡色名片" : "切換爲濃色名片"
  );
};

const applyTheme = (theme) => {
  activeTheme = theme === "light" ? "light" : "dark";
  document.body.dataset.theme = activeTheme;
  root.style.colorScheme = activeTheme;
  syncThemeToggle(activeTheme);
};

const toggleTheme = () => {
  applyTheme(activeTheme === "dark" ? "light" : "dark");

  if (!themeToggle || prefersReducedMotion) {
    return;
  }

  themeToggle.animate(
    [
      { transform: "translate3d(0, 0, 0) scale(1)" },
      { transform: "translate3d(0, -1px, 0) scale(1.04)" },
      { transform: "translate3d(0, 0, 0) scale(1)" },
    ],
    {
      duration: 340,
      easing: "cubic-bezier(0.22, 1, 0.36, 1)",
    }
  );
};

applyTheme("dark");
themeToggle?.addEventListener("click", toggleTheme);

const showToast = (message) => {
  if (!copyToast) {
    return;
  }

  copyToast.textContent = message;
  copyToast.classList.add("is-visible");

  window.clearTimeout(showToast.timeoutId);
  showToast.timeoutId = window.setTimeout(() => {
    copyToast.classList.remove("is-visible");
  }, 1500);
};

const copyText = async (value) => {
  if (!window.isSecureContext || !navigator.clipboard?.writeText) {
    return false;
  }

  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch {
    return false;
  }
};

copyButtons.forEach((button) => {
  button.addEventListener("click", async () => {
    const value = button.dataset.copy;

    if (!value) {
      return;
    }

    const previousLabel = button.textContent;

    try {
      const copied = await copyText(value);

      if (!copied) {
        throw new Error("copy failed");
      }

      button.textContent = "已複製";
      button.classList.add("is-copied");
      showToast("聯絡方式已複製。");
    } catch {
      button.textContent = "失敗";
      showToast("複製失敗。");
    }

    window.setTimeout(() => {
      button.textContent = previousLabel ?? "複製";
      button.classList.remove("is-copied");
    }, 1400);
  });
});

selectableValues.forEach((value) => {
  value.addEventListener("dblclick", () => {
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(value);

    selection?.removeAllRanges();
    selection?.addRange(range);
  });
});

const revealElement = (element) => {
  element.classList.add("is-visible");
};

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        revealElement(entry.target);
        revealObserver.unobserve(entry.target);
      });
    },
    {
      threshold: 0.16,
      rootMargin: "0px 0px -30px 0px",
    }
  );

  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach(revealElement);
}

const resetDepthCard = (card) => {
  card.style.setProperty("--card-rx", "0deg");
  card.style.setProperty("--card-ry", "0deg");
  card.style.setProperty("--card-shift", "0px");
  card.style.setProperty("--pointer-x", "50%");
  card.style.setProperty("--pointer-y", "50%");
  card.style.setProperty("--glow-opacity", "0");
};

depthCards.forEach((card) => {
  resetDepthCard(card);

  if (!hasFinePointer) {
    return;
  }

  card.addEventListener("pointermove", (event) => {
    if (prefersReducedMotion) {
      return;
    }

    const bounds = card.getBoundingClientRect();
    const px = (event.clientX - bounds.left) / bounds.width;
    const py = (event.clientY - bounds.top) / bounds.height;

    card.style.setProperty("--card-rx", `${((0.5 - py) * 6).toFixed(2)}deg`);
    card.style.setProperty("--card-ry", `${((px - 0.5) * 8).toFixed(2)}deg`);
    card.style.setProperty("--card-shift", "-3px");
    card.style.setProperty("--pointer-x", `${(px * 100).toFixed(2)}%`);
    card.style.setProperty("--pointer-y", `${(py * 100).toFixed(2)}%`);
    card.style.setProperty("--glow-opacity", "1");
  });

  card.addEventListener("pointerleave", () => resetDepthCard(card));
  card.addEventListener("pointercancel", () => resetDepthCard(card));
});

if (stage && stageShell && hasFinePointer) {
  const resetStage = () => {
    stageShell.style.setProperty("--rotate-x", "0deg");
    stageShell.style.setProperty("--rotate-y", "0deg");
    stageShell.style.setProperty("--shine-x", "50%");
    stageShell.style.setProperty("--shine-y", "50%");
  };

  stage.addEventListener("pointermove", (event) => {
    if (prefersReducedMotion) {
      return;
    }

    const bounds = stage.getBoundingClientRect();
    const px = (event.clientX - bounds.left) / bounds.width - 0.5;
    const py = (event.clientY - bounds.top) / bounds.height - 0.5;

    stageShell.style.setProperty("--rotate-x", `${(-py * 7).toFixed(2)}deg`);
    stageShell.style.setProperty("--rotate-y", `${(px * 9).toFixed(2)}deg`);
    stageShell.style.setProperty("--shine-x", `${((px + 0.5) * 100).toFixed(2)}%`);
    stageShell.style.setProperty("--shine-y", `${((py + 0.5) * 100).toFixed(2)}%`);
  });

  stage.addEventListener("pointerleave", resetStage);
  stage.addEventListener("pointercancel", resetStage);
}

magneticItems.forEach((item) => {
  item.addEventListener("pointermove", (event) => {
    if (prefersReducedMotion || !hasFinePointer) {
      return;
    }

    const bounds = item.getBoundingClientRect();
    const dx = event.clientX - bounds.left - bounds.width / 2;
    const dy = event.clientY - bounds.top - bounds.height / 2;
    const force = item.classList.contains("cta-primary") ? 0.16 : 0.11;

    item.style.transform = `translate3d(${(dx * force).toFixed(2)}px, ${(dy * force).toFixed(2)}px, 0)`;
  });

  const reset = () => {
    item.style.transform = "";
  };

  item.addEventListener("pointerleave", reset);
  item.addEventListener("pointercancel", reset);
});

const playQuoteSignal = () => {
  if (!quoteCard || prefersReducedMotion || !quoteLines.length || !quoteMarquee) {
    return;
  }

  quoteCard.classList.add("is-signaling");
  window.clearTimeout(playQuoteSignal.timeoutId);
  playQuoteSignal.timeoutId = window.setTimeout(() => {
    quoteCard.classList.remove("is-signaling");
  }, 1400);

  quoteLabel?.animate(
    [
      { opacity: 0.72, transform: "translate3d(0, 0, 0)" },
      { opacity: 1, transform: "translate3d(0, -2px, 0)" },
      { opacity: 0.72, transform: "translate3d(0, 0, 0)" },
    ],
    {
      duration: 900,
      easing: "cubic-bezier(0.22, 1, 0.36, 1)",
    }
  );

  quoteLines[1]?.animate(
    [
      { transform: "translate3d(0, 0, 0) scale(1)" },
      { transform: "translate3d(8px, 0, 0) scale(1.02)" },
      { transform: "translate3d(0, 0, 0) scale(1)" },
    ],
    {
      duration: 1260,
      delay: 70,
      easing: "cubic-bezier(0.22, 1, 0.36, 1)",
    }
  );

};

if (quoteCard) {
  playQuoteSignal();
  playQuoteSignal.intervalId = window.setInterval(playQuoteSignal, 4600);
  quoteCard.addEventListener("pointerenter", playQuoteSignal);

  document.addEventListener("visibilitychange", () => {
    window.clearInterval(playQuoteSignal.intervalId);

    if (document.hidden || prefersReducedMotion) {
      return;
    }

    playQuoteSignal.intervalId = window.setInterval(playQuoteSignal, 4600);
  });
}

const updateScrollProgress = () => {
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  const progress = maxScroll > 0 ? window.scrollY / maxScroll : 0;
  root.style.setProperty("--scroll-progress", progress.toFixed(4));
};

let scrollTicking = false;
const queueScrollUpdate = () => {
  if (scrollTicking) {
    return;
  }

  scrollTicking = true;
  window.requestAnimationFrame(() => {
    updateScrollProgress();
    scrollTicking = false;
  });
};

window.addEventListener("scroll", queueScrollUpdate, { passive: true });
window.addEventListener("resize", queueScrollUpdate);
updateScrollProgress();

const updateSpotlight = (x, y) => {
  root.style.setProperty("--spotlight-x", `${(x / window.innerWidth) * 100}%`);
  root.style.setProperty("--spotlight-y", `${(y / window.innerHeight) * 100}%`);
};

if (hasFinePointer && !prefersReducedMotion) {
  window.addEventListener(
    "pointermove",
    (event) => {
      updateSpotlight(event.clientX, event.clientY);
    },
    { passive: true }
  );
}

const getAmbientPalette = () =>
  activeTheme === "light"
    ? {
        fills: [
          "rgba(186, 51, 34, 0.36)",
          "rgba(155, 111, 56, 0.3)",
          "rgba(210, 154, 109, 0.28)",
        ],
        link: [186, 51, 34],
        linkAlpha: 0.085,
      }
    : {
        fills: [
          "rgba(215, 68, 46, 0.56)",
          "rgba(200, 155, 85, 0.48)",
          "rgba(248, 221, 188, 0.34)",
        ],
        link: [200, 155, 85],
        linkAlpha: 0.06,
      };

class AmbientField {
  constructor(canvas) {
    this.canvas = canvas;
    this.context = canvas?.getContext("2d");
    this.particles = [];
    this.pointer = { x: 0, y: 0 };
    this.frameId = 0;
    this.tick = this.tick.bind(this);
    this.handlePointerMove = this.handlePointerMove.bind(this);
    this.handleResize = this.handleResize.bind(this);
  }

  init() {
    if (!this.canvas || !this.context || prefersReducedMotion) {
      return;
    }

    this.handleResize();
    this.seedParticles();
    window.addEventListener("pointermove", this.handlePointerMove, { passive: true });
    window.addEventListener("resize", this.handleResize);
    this.frameId = window.requestAnimationFrame(this.tick);
  }

  handlePointerMove(event) {
    this.pointer.x = event.clientX;
    this.pointer.y = event.clientY;
  }

  handleResize() {
    if (!this.canvas || !this.context) {
      return;
    }

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = window.innerWidth;
    const height = window.innerHeight;

    this.canvas.width = width * dpr;
    this.canvas.height = height * dpr;
    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;
    this.context.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.seedParticles();
  }

  seedParticles() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const count = Math.max(14, Math.min(26, Math.floor(width / 86)));

    this.particles = Array.from({ length: count }, (_, index) => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.32,
      vy: (Math.random() - 0.5) * 0.32,
      radius: 1 + Math.random() * 1.9,
      phase: Math.random() * Math.PI * 2,
      drift: 0.16 + Math.random() * 0.26,
      hue: index % 3,
    }));

    this.pointer.x = width * 0.72;
    this.pointer.y = height * 0.2;
  }

  tick(time) {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const palette = getAmbientPalette();

    this.context.clearRect(0, 0, width, height);

    this.particles.forEach((particle, index) => {
      particle.phase += particle.drift * 0.01;
      particle.x += particle.vx + Math.cos(time * 0.00022 + particle.phase) * 0.13;
      particle.y += particle.vy + Math.sin(time * 0.00018 + particle.phase) * 0.13;

      const dx = this.pointer.x - particle.x;
      const dy = this.pointer.y - particle.y;
      const distance = Math.hypot(dx, dy);

      if (distance < 180) {
        particle.x -= dx * 0.0016;
        particle.y -= dy * 0.0016;
      }

      if (particle.x < -40) particle.x = width + 40;
      if (particle.x > width + 40) particle.x = -40;
      if (particle.y < -40) particle.y = height + 40;
      if (particle.y > height + 40) particle.y = -40;

      this.context.beginPath();
      this.context.fillStyle = palette.fills[particle.hue] ?? palette.fills[0];
      this.context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      this.context.fill();

      for (let next = index + 1; next < this.particles.length; next += 1) {
        const other = this.particles[next];
        const gap = Math.hypot(particle.x - other.x, particle.y - other.y);

        if (gap > 150) {
          continue;
        }

        this.context.beginPath();
        this.context.strokeStyle = `rgba(${palette.link.join(", ")}, ${palette.linkAlpha * (1 - gap / 150)})`;
        this.context.lineWidth = 1;
        this.context.moveTo(particle.x, particle.y);
        this.context.lineTo(other.x, other.y);
        this.context.stroke();
      }
    });

    this.frameId = window.requestAnimationFrame(this.tick);
  }
}

new AmbientField(ambientCanvas).init();
