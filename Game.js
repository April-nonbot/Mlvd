const builderCanvas = document.getElementById("builderCanvas");
const raceCanvas = document.getElementById("raceCanvas");

const bctx = builderCanvas.getContext("2d");
const rctx = raceCanvas.getContext("2d");

let trackPoints = [];
let draggingPoint = -1;

let car;
let raceRunning = false;
let raceStartTime = 0;
let currentLap = 1;

let bestTime = Number(localStorage.getItem("trackRushBest")) || 0;

const lapsToRace = 3;
const trackWidth = 75;


/* -------------------------
   SCREEN MANAGEMENT
------------------------- */

function showScreen(id) {
  document.querySelectorAll(".screen").forEach(screen => {
    screen.classList.add("hidden");
  });

  document.getElementById(id).classList.remove("hidden");
}

function goMenu() {
  raceRunning = false;
  showScreen("menu");
  updateBestTime();
}

function openBuilder() {
  showScreen("builder");

  resizeCanvas(builderCanvas);

  if (trackPoints.length < 4) {
    createDefaultTrack();
  }

  drawBuilder();
}


/* -------------------------
   BEST TIME
------------------------- */

function updateBestTime() {
  const text = bestTime ? formatTime(bestTime) : "--";

  document.getElementById("bestMenu").textContent =
    "Best Time: " + text;

  document.getElementById("bestRace").textContent = text;
}

function formatTime(milliseconds) {
  const totalSeconds = milliseconds / 1000;

  const minutes = Math.floor(totalSeconds / 60);

  const seconds = Math.floor(totalSeconds % 60);

  const hundredths =
    Math.floor((milliseconds % 1000) / 10);

  return (
    String(minutes).padStart(2, "0") +
    ":" +
    String(seconds).padStart(2, "0") +
    "." +
    String(hundredths).padStart(2, "0")
  );
}


/* -------------------------
   CANVAS
------------------------- */

function resizeCanvas(canvas) {
  const rect = canvas.getBoundingClientRect();

  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;

  const ctx = canvas.getContext("2d");

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

window.addEventListener("resize", () => {
  resizeCanvas(builderCanvas);
  resizeCanvas(raceCanvas);

  if (!document.getElementById("builder").classList.contains("hidden")) {
    drawBuilder();
  }
});


/* -------------------------
   DEFAULT TRACK
------------------------- */

function createDefaultTrack() {
  const width = builderCanvas.clientWidth;
  const height = builderCanvas.clientHeight;

  const cx = width / 2;
  const cy = height / 2;

  const w = Math.min(width * 0.32, 300);
  const h = Math.min(height * 0.27, 190);

  trackPoints = [
    { x: cx - w, y: cy - h },
    { x: cx + w, y: cy - h },
    { x: cx + w * 1.15, y: cy },
    { x: cx + w * 0.8, y: cy + h },
    { x: cx - w * 0.8, y: cy + h },
    { x: cx - w * 1.15, y: cy }
  ];
}


/* -------------------------
   DRAW BUILDER
------------------------- */

function drawBuilder() {
  const width = builderCanvas.clientWidth;
  const height = builderCanvas.clientHeight;

  bctx.clearRect(0, 0, width, height);

  drawBackground(bctx, width, height);

  if (trackPoints.length >= 2) {
    drawTrack(bctx, trackPoints);
  }

  trackPoints.forEach((point, index) => {
    bctx.beginPath();

    bctx.arc(
      point.x,
      point.y,
      11,
      0,
      Math.PI * 2
    );

    bctx.fillStyle = "white";
    bctx.fill();

    bctx.strokeStyle = "#111";
    bctx.lineWidth = 3;
    bctx.stroke();

    bctx.fillStyle = "#111";
    bctx.font = "bold 11px Arial";
    bctx.textAlign = "center";
    bctx.textBaseline = "middle";

    bctx.fillText(
      index + 1,
      point.x,
      point.y
    );
  });

  if (trackPoints.length > 0) {
    drawStartLine(
      bctx,
      trackPoints[0],
      trackPoints[1]
    );
  }
}


/* -------------------------
   DRAW TRACK
------------------------- */

function drawTrack(ctx, points) {
  if (points.length < 2) return;

  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  ctx.beginPath();

  ctx.moveTo(
    points[0].x,
    points[0].y
  );

  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(
      points[i].x,
      points[i].y
    );
  }

  ctx.closePath();

  // Outer edge
  ctx.strokeStyle = "#111";
  ctx.lineWidth = trackWidth + 18;
  ctx.stroke();

  // Road
  ctx.strokeStyle = "#555";
  ctx.lineWidth = trackWidth;
  ctx.stroke();

  // Middle markings
  ctx.strokeStyle = "rgba(255,255,255,0.55)";
  ctx.lineWidth = 3;
  ctx.setLineDash([18, 18]);
  ctx.stroke();

  ctx.setLineDash([]);
}


/* -------------------------
   BACKGROUND
------------------------- */

function drawBackground(ctx, width, height) {
  ctx.fillStyle = "#24552d";
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = "rgba(255,255,255,0.05)";
  ctx.lineWidth = 1;

  for (let x = 0; x < width; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }

  for (let y = 0; y < height; y += 40) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
}


/* -------------------------
   START LINE
------------------------- */

function drawStartLine(ctx, point, nextPoint) {
  const dx = nextPoint.x - point.x;
  const dy = nextPoint.y - point.y;

  const length = Math.hypot(dx, dy);

  if (!length) return;

  const nx = -dy / length;
  const ny = dx / length;

  ctx.strokeStyle = "white";
  ctx.lineWidth = 7;

  ctx.beginPath();

  ctx.moveTo(
    point.x - nx * 38,
    point.y - ny * 38
  );

  ctx.lineTo(
    point.x + nx * 38,
    point.y + ny * 38
  );

  ctx.stroke();
}


/* -------------------------
   BUILDING
------------------------- */

builderCanvas.addEventListener("pointerdown", event => {
  const rect = builderCanvas.getBoundingClientRect();

  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  draggingPoint = -1;

  for (let i = 0; i < trackPoints.length; i++) {
    const distance = Math.hypot(
      trackPoints[i].x - x,
      trackPoints[i].y - y
    );

    if (distance < 25) {
      draggingPoint = i;
      break;
    }
  }

  if (draggingPoint >= 0) {
    builderCanvas.setPointerCapture(event.pointerId);
  } else {
    trackPoints.push({ x, y });
    drawBuilder();
  }
});


builderCanvas.addEventListener("pointermove", event => {
  if (draggingPoint === -1) return;

  const rect = builderCanvas.getBoundingClientRect();

  trackPoints[draggingPoint] = {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top
  };

  drawBuilder();
});


builderCanvas.addEventListener("pointerup", () => {
  draggingPoint = -1;
});


function undoPoint() {
  trackPoints.pop();
  drawBuilder();
}


function clearTrack() {
  trackPoints = [];
  drawBuilder();
}


function finishBuilding() {
  if (trackPoints.length < 4) {
    alert("You need at least 4 points to make a track.");
    return;
  }

  startRace();
}


/* -------------------------
   RACING
------------------------- */

function startRace() {
  if (trackPoints.length < 4) {
    openBuilder();
    alert("Build a track with at least 4 points first.");
    return;
  }

  showScreen("race");

  resizeCanvas(raceCanvas);

  const start = trackPoints[0];
  const next = trackPoints[1];

  const angle = Math.atan2(
    next.y - start.y,
    next.x - start.x
  );

  car = {
    x: start.x,
    y: start.y,
    angle: angle,
    speed: 0,
    previousProgress: 0
  };

  currentLap = 1;

  document.getElementById("lap").textContent =
    "1 / " + lapsToRace;

  updateBestTime();

  raceRunning = false;

  countdown();
}


function countdown() {
  let count = 3;

  document.getElementById("timer").textContent =
    "00:00.00";

  const interval = setInterval(() => {

    count--;

    if (count <= 0) {
      clearInterval(interval);

      raceRunning = true;
      raceStartTime = performance.now();

      requestAnimationFrame(gameLoop);
    }

  }, 1000);
}


/* -------------------------
   CONTROLS
------------------------- */

const controls = {
  left: false,
  right: false,
  gas: false,
  brake: false
};


function setupButton(id, control) {
  const button = document.getElementById(id);

  button.addEventListener("pointerdown", event => {
    event.preventDefault();
    controls[control] = true;
  });

  button.addEventListener("pointerup", () => {
    controls[control] = false;
  });

  button.addEventListener("pointercancel", () => {
    controls[control] = false;
  });

  button.addEventListener("pointerleave", () => {
    controls[control] = false;
  });
}


setupButton("left", "left");
setupButton("right", "right");
setupButton("gas", "gas");
setupButton("brake", "brake");


/* Keyboard controls too */

window.addEventListener("keydown", event => {

  if (event.key === "ArrowLeft") controls.left = true;
  if (event.key === "ArrowRight") controls.right = true;
  if (event.key === "ArrowUp") controls.gas = true;
  if (event.key === "ArrowDown") controls.brake = true;

});


window.addEventListener("keyup", event => {

  if (event.key === "ArrowLeft") controls.left = false;
  if (event.key === "ArrowRight") controls.right = false;
  if (event.key === "ArrowUp") controls.gas = false;
  if (event.key === "ArrowDown") controls.brake = false;

});


/* -------------------------
   GAME LOOP
------------------------- */

let lastFrame = 0;


function gameLoop(timestamp) {

  if (!raceRunning) return;

  const delta =
    Math.min((timestamp - lastFrame) / 1000, 0.035);

  lastFrame = timestamp;

  updateCar(delta);

  drawRace();

  const elapsed =
    performance.now() - raceStartTime;

  document.getElementById("timer").textContent =
    formatTime(elapsed);

  requestAnimationFrame(gameLoop);
}


/* -------------------------
   CAR PHYSICS
------------------------- */

function updateCar(delta) {

  if (controls.gas) {
    car.speed += 420 * delta;
  } else {
    car.speed -= 120 * delta;
  }

  if (controls.brake) {
    car.speed -= 550 * delta;
  }

  car.speed = Math.max(
    0,
    Math.min(car.speed, 600)
  );

  let steering = 0;

  if (controls.left) steering--;
  if (controls.right) steering++;

  if (car.speed > 20) {
    car.angle +=
      steering *
      2.8 *
      delta *
      Math.min(car.speed / 250, 1);
  }

  car.x +=
    Math.cos(car.angle) *
    car.speed *
    delta;

  car.y +=
    Math.sin(car.angle) *
    car.speed *
    delta;


  const nearest = nearestTrackPoint();

  // Slow down if off track
  if (nearest.distance > trackWidth / 2) {
    car.speed *= 0.92;
  }

  // Lap detection
  const progress = nearest.progress;

  if (
    car.previousProgress > 0.8 &&
    progress < 0.2 &&
    car.speed > 40
  ) {

    currentLap++;

    if (currentLap > lapsToRace) {
      finishRace();
      return;
    }

    document.getElementById("lap").textContent =
      currentLap + " / " + lapsToRace;
  }

  car.previousProgress = progress;
}


/* -------------------------
   FIND CLOSEST TRACK POINT
------------------------- */

function nearestTrackPoint() {

  let closest = null;
  let closestDistance = Infinity;
  let closestIndex = 0;

  for (let i = 0; i < trackPoints.length; i++) {

    const point = trackPoints[i];

    const distance = Math.hypot(
      car.x - point.x,
      car.y - point.y
    );

    if (distance < closestDistance) {
      closestDistance = distance;
      closest = point;
      closestIndex = i;
    }
  }

  return {
    distance: closestDistance,
    progress:
      closestIndex / trackPoints.length
  };
}


/* -------------------------
   DRAW RACE
------------------------- */

function drawRace() {

  const width = raceCanvas.clientWidth;
  const height = raceCanvas.clientHeight;

  rctx.clearRect(0, 0, width, height);

  drawBackground(rctx, width, height);

  drawTrack(rctx, trackPoints);

  drawStartLine(
    rctx,
    trackPoints[0],
    trackPoints[1]
  );

  drawCar(
    rctx,
    car.x,
    car.y,
    car.angle
  );
}


/* -------------------------
   DRAW CAR
------------------------- */

function drawCar(ctx, x, y, angle) {

  ctx.save();

  ctx.translate(x, y);
  ctx.rotate(angle);

  // Wheels
  ctx.fillStyle = "#111";

  ctx.fillRect(-15, -12, 8, 6);
  ctx.fillRect(-15, 6, 8, 6);
  ctx.fillRect(8, -12, 8, 6);
  ctx.fillRect(8, 6, 8, 6);

  // Car
  ctx.fillStyle = "#e53935";

  ctx.fillRect(
    -17,
    -9,
    34,
    18
  );

  // Window
  ctx.fillStyle = "#222";

  ctx.fillRect(
    -4,
    -7,
    11,
    14
  );

  ctx.restore();
}


/* -------------------------
   FINISH
------------------------- */

function finishRace() {

  raceRunning = false;

  const finalTime =
    performance.now() - raceStartTime;

  const previousBest = bestTime;

  document.getElementById("finalTime").textContent =
    formatTime(finalTime);

  if (!bestTime || finalTime < bestTime) {

    bestTime = finalTime;

    localStorage.setItem(
      "trackRushBest",
      bestTime
    );

    document.getElementById("finishTitle").textContent =
      "NEW BEST!";

  } else {

    document.getElementById("finishTitle").textContent =
      "FINISH!";
  }

  document.getElementById("oldBest").textContent =
    previousBest
      ? "Previous best: " + formatTime(previousBest)
      : "Your first completed race!";

  showScreen("finish");
}


/* -------------------------
   START
------------------------- */

resizeCanvas(builderCanvas);
resizeCanvas(raceCanvas);

updateBestTime();

showScreen("menu");
