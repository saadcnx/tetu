export function initDotLens(canvas, container) {
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    return () => {};
  }

  const STEP = 25;
  const RADIUS = 230;
  const RADIUS_SQ = RADIUS * RADIUS;

  let width = 0;
  let height = 0;
  let dpr = 1;
  let rafId = 0;
  let running = false;
  let destroyed = false;

  let targetX = 0;
  let targetY = 0;
  let currentX = 0;
  let currentY = 0;
  let hasPointer = false;

  let points = [];

  const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  let reducedMotion = motionQuery.matches;

  const buildGrid = () => {
    points = [];

    for (let x = STEP / 2; x < width; x += STEP) {
      for (let y = STEP / 2; y < height; y += STEP) {
        points.push({ x, y });
      }
    }
  };

  const resize = () => {
    if (destroyed) return;

    const rect = container.getBoundingClientRect();

    width = rect.width;
    height = rect.height;
    dpr = Math.min(window.devicePixelRatio || 1, 1.5);

    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    if (!hasPointer) {
      targetX = width / 2;
      targetY = height * 0.48;
      currentX = targetX;
      currentY = targetY;
    }

    buildGrid();

    if (reducedMotion) {
      currentX = targetX;
      currentY = targetY;
      draw();
    } else {
      start();
    }
  };

  function draw() {
    if (destroyed || width <= 0 || height <= 0) return;

    ctx.clearRect(0, 0, width, height);

    const time = reducedMotion ? 0 : performance.now() * 0.001;
    const breath = Math.sin(time * 1.2);
    const pullFactor = 0.82 + breath * 0.035;

    for (const point of points) {
      const dx = point.x - currentX;
      const dy = point.y - currentY;
      const distanceSquared = dx * dx + dy * dy;

      let x = point.x;
      let y = point.y;
      let size = 1.05;
      let alpha = 0.085;

      if (distanceSquared < RADIUS_SQ) {
        const distance = Math.sqrt(distanceSquared);
        const pull = Math.exp(-(distanceSquared) / (2 * 74 * 74)) * pullFactor;

        x = currentX + dx * (1 - pull);
        y = currentY + dy * (1 - pull);

        const centerDistance = Math.hypot(x - currentX, y - currentY);

        if (centerDistance < 9) continue;

        let fade = 1;

        if (centerDistance < 25) {
          fade = (centerDistance - 9) / 16;
        }

        const proximity = 1 - distance / RADIUS;

        size = (1.05 + proximity * 1.45 + proximity * breath * 0.15) * fade;
        alpha = (0.09 + proximity * 0.56 + proximity * breath * 0.04) * fade;
      }

      ctx.beginPath();
      ctx.fillStyle = `rgba(0, 0, 0, ${Math.max(0, alpha)})`;
      ctx.arc(x, y, Math.max(0.1, size), 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.beginPath();
    ctx.fillStyle = "#000000";
    ctx.arc(currentX, currentY, 2.6 + breath * 0.25, 0, Math.PI * 2);
    ctx.fill();
  }

  const render = () => {
    if (!running || destroyed) return;

    const easing = reducedMotion ? 1 : 0.14;

    currentX += (targetX - currentX) * easing;
    currentY += (targetY - currentY) * easing;

    draw();

    if (reducedMotion) {
      running = false;
      rafId = 0;
      return;
    }

    rafId = requestAnimationFrame(render);
  };

  const start = () => {
    if (destroyed || running) return;

    if (reducedMotion) {
      currentX = targetX;
      currentY = targetY;
      draw();
      return;
    }

    running = true;
    rafId = requestAnimationFrame(render);
  };

  const stop = () => {
    running = false;

    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = 0;
    }
  };

  const onPointerMove = (event) => {
    if (event.pointerType === "touch") return;

    const rect = container.getBoundingClientRect();

    targetX = event.clientX - rect.left;
    targetY = event.clientY - rect.top;
    hasPointer = true;

    start();
  };

  const onPointerLeave = () => {
    hasPointer = false;
    targetX = width / 2;
    targetY = height * 0.48;
    start();
  };

  const onMotionPreferenceChange = (event) => {
    reducedMotion = event.matches;

    stop();

    if (reducedMotion) {
      currentX = targetX;
      currentY = targetY;
      draw();
    } else {
      start();
    }
  };

  const resizeObserver = new ResizeObserver(resize);

  resizeObserver.observe(container);
  container.addEventListener("pointermove", onPointerMove);
  container.addEventListener("pointerleave", onPointerLeave);
  motionQuery.addEventListener("change", onMotionPreferenceChange);

  resize();

  return () => {
    if (destroyed) return;

    destroyed = true;
    stop();
    resizeObserver.disconnect();
    container.removeEventListener("pointermove", onPointerMove);
    container.removeEventListener("pointerleave", onPointerLeave);
    motionQuery.removeEventListener("change", onMotionPreferenceChange);
    ctx.clearRect(0, 0, width, height);
  };
}