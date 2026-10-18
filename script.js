(() => {
  const canvas = document.querySelector(".dot-field");
  const context = canvas.getContext("2d");
  const pointer = { x: -1000, y: -1000 };
  const spacing = 28;
  let width = 0;
  let height = 0;
  let dots = [];
  let frame = 0;

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
    draw();
  }

  function draw() {
    context.clearRect(0, 0, width, height);
    const active = pointer.x >= 0;
    for (const dot of dots) {
      const dx = dot.x - pointer.x;
      const dy = dot.y - pointer.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const influence = active ? Math.max(0, 1 - distance / 125) : 0;
      const lift = influence * 13;
      const radius = 1.15 + influence * 1.1;
      context.beginPath();
      context.arc(dot.x, dot.y - lift, radius, 0, Math.PI * 2);
      context.fillStyle = influence > 0.08 ? `rgba(63, 105, 54, ${0.22 + influence * 0.48})` : "rgba(57, 75, 59, 0.16)";
      context.fill();
    }
    frame = 0;
  }

  function scheduleDraw() {
    if (!frame) frame = window.requestAnimationFrame(draw);
  }

  window.addEventListener("pointermove", (event) => {
    pointer.x = event.clientX;
    pointer.y = event.clientY;
    scheduleDraw();
  }, { passive: true });
  window.addEventListener("pointerleave", () => {
    pointer.x = -1000;
    pointer.y = -1000;
    scheduleDraw();
  });
  window.addEventListener("resize", resize, { passive: true });
  resize();
})();