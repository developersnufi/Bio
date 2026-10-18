(() => {
  const canvas = document.querySelector(".dot-field");
  const context = canvas.getContext("2d");
  const pointer = { x: -1000, y: -1000, targetX: -1000, targetY: -1000 };
  const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
  const spacing = 25;
  let width = 0;
  let height = 0;
  let dots = [];
  let frame = 0;
  let reducedMotion = motionPreference.matches;

  function resize() {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    dots = [];
    for (let y = 18; y < height; y += spacing) {
      for (let x = 18; x < width; x += spacing) dots.push({ x, y });
    }
    if (reducedMotion) draw(performance.now());
  }

  function draw(timestamp) {
    context.clearRect(0, 0, width, height);
    pointer.x += (pointer.targetX - pointer.x) * 0.14;
    pointer.y += (pointer.targetY - pointer.y) * 0.14;
    const active = pointer.x >= 0;
    const time = reducedMotion ? 0 : timestamp * 0.001;
    for (const dot of dots) {
      const dx = dot.x - pointer.x;
      const dy = dot.y - pointer.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const influence = active ? Math.max(0, 1 - distance / 250) : 0;
      const wave = reducedMotion ? 0 : Math.sin(dot.x * 0.012 + time * 1.1) * 4.5 + Math.cos(dot.y * 0.016 - time * 0.8) * 3;
      const ripple = active && !reducedMotion ? Math.sin(distance * 0.045 - time * 4) * influence : 0;
      const drift = reducedMotion ? 0 : Math.sin(dot.y * 0.014 + time * 0.65) * 2.5;
      const radius = 1.2 + influence * 1.2 + Math.max(0, ripple) * 1.8;
      context.beginPath();
      context.arc(dot.x + drift, dot.y + wave + ripple * 10, radius, 0, Math.PI * 2);
      if (influence > 0) {
        const hue = (timestamp * 0.035 + dot.x * 0.16 + dot.y * 0.12) % 360;
        context.fillStyle = `hsla(${hue}, 95%, 55%, ${0.12 + influence * 0.78})`;
      } else {
        context.fillStyle = "rgba(57, 75, 59, 0.2)";
      }
      context.fill();
    }
  }

  function scheduleDraw() {
    if (reducedMotion && !frame) {
      frame = window.requestAnimationFrame((timestamp) => {
        frame = 0;
        draw(timestamp);
      });
    }
  }

  function animate(timestamp) {
    draw(timestamp);
    if (!reducedMotion) frame = window.requestAnimationFrame(animate);
  }

  function updateMotionPreference(event) {
    reducedMotion = event.matches;
    window.cancelAnimationFrame(frame);
    frame = 0;
    if (reducedMotion) {
      draw(performance.now());
    } else {
      frame = window.requestAnimationFrame(animate);
    }
  }

  window.addEventListener("pointermove", (event) => {
    pointer.targetX = event.clientX;
    pointer.targetY = event.clientY;
    scheduleDraw();
  }, { passive: true });
  window.addEventListener("pointerleave", () => {
    pointer.targetX = -1000;
    pointer.targetY = -1000;
    scheduleDraw();
  });
  window.addEventListener("resize", resize, { passive: true });
  motionPreference.addEventListener("change", updateMotionPreference);

  document.documentElement.classList.add("js-reveal");
  const sections = document.querySelectorAll(".content-section");
  if ("IntersectionObserver" in window && !reducedMotion) {
    const observer = new IntersectionObserver((entries, currentObserver) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          currentObserver.unobserve(entry.target);
        }
      }
    }, { threshold: 0.12 });
    sections.forEach((section) => observer.observe(section));
  } else {
    sections.forEach((section) => section.classList.add("is-visible"));
  }

  resize();
  if (!reducedMotion) frame = window.requestAnimationFrame(animate);
})();