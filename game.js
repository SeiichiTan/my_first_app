const canvas = document.querySelector("#game-canvas");
const ctx = canvas.getContext("2d");
const scoreElement = document.querySelector("#score");
const messageElement = document.querySelector("#message");
const jumpButton = document.querySelector("#jump-button");

const width = canvas.width;
const height = canvas.height;
const groundY = 410;
const player = { x: 150, y: groundY - 54, width: 38, height: 54, velocityY: 0 };

let obstacles = [];
let distance = 0;
let speed = 330;
let elapsed = 0;
let state = "ready";
let previousTime = 0;

function showMessage(tag, title, detail) {
  messageElement.querySelector(".message__tag").textContent = tag;
  messageElement.querySelector("h2").textContent = title;
  messageElement.querySelector("p:last-child").textContent = detail;
  messageElement.classList.remove("is-hidden");
}

function startGame() {
  state = "playing";
  distance = 0;
  speed = 330;
  elapsed = 0;
  obstacles = [{ x: 720, width: 34, height: 48 }];
  player.y = groundY - player.height;
  player.velocityY = 0;
  scoreElement.textContent = "00000";
  messageElement.classList.add("is-hidden");
}

function jump() {
  if (state === "ready" || state === "over") {
    startGame();
  }
  if (state === "playing" && player.y >= groundY - player.height - 1) {
    player.velocityY = -690;
  }
}

function drawBackground() {
  const sky = ctx.createLinearGradient(0, 0, 0, groundY);
  sky.addColorStop(0, "#10162f");
  sky.addColorStop(1, "#49365f");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = "#f6e9c6";
  ctx.beginPath();
  ctx.arc(790, 105, 32, 0, Math.PI * 2);
  ctx.fill();

  for (let i = 0; i < 50; i += 1) {
    const starX = (i * 197 + 43) % width;
    const starY = (i * 71 + 19) % 235;
    ctx.fillStyle = i % 4 === 0 ? "#f6d891" : "rgba(226, 230, 255, 0.8)";
    ctx.fillRect(starX, starY, i % 7 === 0 ? 3 : 2, i % 7 === 0 ? 3 : 2);
  }

  const skylineOffset = (distance * 0.22) % 180;
  for (let i = -1; i < 8; i += 1) {
    const buildingX = i * 150 - skylineOffset;
    const buildingWidth = 92 + (i % 3 + 3) % 3 * 15;
    const buildingHeight = 105 + ((i * 47 % 95) + 95) % 95;
    const buildingY = groundY - buildingHeight;
    ctx.fillStyle = i % 2 === 0 ? "#252943" : "#30304d";
    ctx.fillRect(buildingX, buildingY, buildingWidth, buildingHeight);
    ctx.fillStyle = "#41405b";
    ctx.fillRect(buildingX + 8, buildingY - 5, buildingWidth - 16, 5);

    for (let windowY = buildingY + 16; windowY < groundY - 12; windowY += 22) {
      for (let windowX = buildingX + 12; windowX < buildingX + buildingWidth - 10; windowX += 22) {
        const lit = (Math.floor(windowX / 22) + Math.floor(windowY / 22) + i) % 3 !== 0;
        if (lit) {
          ctx.fillStyle = (Math.floor(windowX / 22) + i) % 2 === 0 ? "#f6c76a" : "#83d7e8";
          ctx.fillRect(windowX, windowY, 8, 10);
        }
      }
    }

    if (i % 2 === 0) {
      ctx.fillStyle = "#ff6c9c";
      ctx.fillRect(buildingX + buildingWidth - 14, buildingY + 20, 3, 30);
      ctx.fillStyle = "rgba(255, 108, 156, 0.18)";
      ctx.fillRect(buildingX + buildingWidth - 21, buildingY + 17, 17, 36);
    }
  }

  ctx.fillStyle = "#222338";
  ctx.fillRect(0, groundY, width, height - groundY);
  ctx.fillStyle = "#ec70a2";
  ctx.fillRect(0, groundY, width, 5);

  ctx.fillStyle = "rgba(255, 207, 124, 0.68)";
  const stripeOffset = (distance * 0.8) % 54;
  for (let x = -stripeOffset; x < width; x += 54) {
    ctx.fillRect(x, groundY + 31, 28, 4);
  }
}

function drawPlayer() {
  const bob = state === "playing" && player.y === groundY - player.height
    ? Math.sin(elapsed * 18) * 2
    : 0;
  const x = player.x;
  const y = player.y + bob;
  const runningLeg = state === "playing" ? Math.sin(elapsed * 18) * 5 : 0;

  ctx.fillStyle = "rgba(8, 10, 28, 0.35)";
  ctx.beginPath();
  ctx.ellipse(x + 20, groundY + 3, 28, 6, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.save();
  ctx.shadowColor = "#5ff5ff";
  ctx.shadowBlur = 18;
  ctx.strokeStyle = "#f4ffff";
  ctx.lineWidth = 3;
  ctx.lineJoin = "round";
  ctx.fillStyle = "#21c9df";
  ctx.beginPath();
  ctx.roundRect(x + 5, y + 17, 28, 30, 8);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#ffd38c";
  ctx.beginPath();
  ctx.arc(x + 21, y + 11, 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#18334c";
  ctx.beginPath();
  ctx.roundRect(x + 11, y - 1, 22, 8, 4);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#18334c";
  ctx.beginPath();
  ctx.arc(x + 26, y + 10, 2, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#f4ffff";
  ctx.lineWidth = 8;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(x + 13, y + 43);
  ctx.lineTo(x + 11 + runningLeg, y + 53);
  ctx.moveTo(x + 27, y + 43);
  ctx.lineTo(x + 29 - runningLeg, y + 53);
  ctx.stroke();
  ctx.strokeStyle = "#ffca69";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(x + 13, y + 43);
  ctx.lineTo(x + 11 + runningLeg, y + 53);
  ctx.moveTo(x + 27, y + 43);
  ctx.lineTo(x + 29 - runningLeg, y + 53);
  ctx.stroke();
  ctx.restore();
}

function drawObstacle(obstacle) {
  const y = groundY - obstacle.height;
  ctx.fillStyle = "#e76f51";
  ctx.fillRect(obstacle.x, y + 8, obstacle.width, obstacle.height - 8);
  ctx.fillStyle = "#f28b68";
  ctx.fillRect(obstacle.x + 5, y, obstacle.width - 10, 12);
  ctx.fillStyle = "#c65343";
  ctx.fillRect(obstacle.x + 6, y + 18, 5, 8);
  ctx.fillRect(obstacle.x + obstacle.width - 11, y + 32, 5, 8);
}

function update(delta) {
  if (state !== "playing") return;

  elapsed += delta;
  distance += speed * delta / 10;
  speed = Math.min(510, speed + delta * 2.5);
  player.velocityY += 1850 * delta;
  player.y += player.velocityY * delta;
  if (player.y >= groundY - player.height) {
    player.y = groundY - player.height;
    player.velocityY = 0;
  }

  for (const obstacle of obstacles) {
    obstacle.x -= speed * delta;
  }
  obstacles = obstacles.filter((obstacle) => obstacle.x + obstacle.width > -10);

  const lastObstacle = obstacles[obstacles.length - 1];
  if (!lastObstacle || lastObstacle.x < width - 310) {
    const previousRight = lastObstacle ? lastObstacle.x + lastObstacle.width : width;
    const gap = 300 + Math.random() * 190;
    obstacles.push({
      x: Math.max(width + 30, previousRight + gap),
      width: 28 + Math.random() * 20,
      height: 34 + Math.random() * 35,
    });
  }

  const playerBox = {
    left: player.x + 7,
    right: player.x + player.width - 5,
    top: player.y + 5,
    bottom: player.y + player.height,
  };
  if (obstacles.some((obstacle) =>
    playerBox.right > obstacle.x + 4
    && playerBox.left < obstacle.x + obstacle.width - 4
    && playerBox.bottom > groundY - obstacle.height + 5
    && playerBox.top < groundY
  )) {
    state = "over";
    showMessage("GAME OVER", "ゲームオーバー", "画面をタップしてもう一度！");
  }

  scoreElement.textContent = String(Math.floor(distance)).padStart(5, "0");
}

function render() {
  drawBackground();
  for (const obstacle of obstacles) drawObstacle(obstacle);
  drawPlayer();
}

function frame(timestamp) {
  const delta = previousTime ? Math.min((timestamp - previousTime) / 1000, 0.04) : 0;
  previousTime = timestamp;
  update(delta);
  render();
  requestAnimationFrame(frame);
}

window.addEventListener("keydown", (event) => {
  if (["Space", "ArrowUp", "KeyW"].includes(event.code)) {
    event.preventDefault();
    if (!event.repeat) jump();
  }
});

jumpButton.addEventListener("click", jump);
canvas.addEventListener("pointerdown", jump);
messageElement.addEventListener("pointerdown", jump);

showMessage("READY?", "走り出そう！", "ジャンプして障害物をよけよう");
requestAnimationFrame(frame);
