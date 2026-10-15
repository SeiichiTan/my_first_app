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
let obstacleCount = 0;
let distance = 0;
let speed = 250;
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
  speed = 250;
  elapsed = 0;
  obstacleCount = 0;
  obstacles = [createObstacle(720)];
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
    player.velocityY = -820;
  }
}

function drawBackground() {
  const sky = ctx.createLinearGradient(0, 0, 0, groundY);
  sky.addColorStop(0, "#10162f");
  sky.addColorStop(1, "#49365f");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, width, height);

  const moonGlow = ctx.createRadialGradient(790, 105, 4, 790, 105, 88);
  moonGlow.addColorStop(0, "rgba(255, 129, 220, 0.32)");
  moonGlow.addColorStop(1, "rgba(255, 129, 220, 0)");
  ctx.fillStyle = moonGlow;
  ctx.fillRect(700, 15, 180, 180);

  ctx.save();
  ctx.shadowColor = "#ff9cdb";
  ctx.shadowBlur = 28;
  ctx.fillStyle = "#ffe7c2";
  ctx.beginPath();
  ctx.arc(790, 105, 32, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  ctx.strokeStyle = "rgba(255, 150, 224, 0.48)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(790, 105, 47, 13, -0.18, 0, Math.PI * 2);
  ctx.stroke();

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

  const groundGradient = ctx.createLinearGradient(0, groundY, 0, height);
  groundGradient.addColorStop(0, "#29233f");
  groundGradient.addColorStop(1, "#111426");
  ctx.fillStyle = groundGradient;
  ctx.fillRect(0, groundY, width, height - groundY);
  ctx.save();
  ctx.shadowColor = "#ff5cbd";
  ctx.shadowBlur = 16;
  ctx.fillStyle = "#ff78d0";
  ctx.fillRect(0, groundY, width, 5);
  ctx.restore();

  ctx.fillStyle = "rgba(105, 230, 255, 0.72)";
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

function createObstacle(x) {
  obstacleCount += 1;
  return {
    x,
    width: 78 + Math.random() * 14,
    height: 58 + Math.random() * 12,
    type: obstacleCount % 5 === 0 ? "shingen" : "dog",
  };
}

function drawDog(obstacle) {
  ctx.save();
  ctx.translate(obstacle.x, groundY - obstacle.height);
  ctx.scale(obstacle.width / 100, obstacle.height / 76);

  ctx.fillStyle = "rgba(8, 10, 28, 0.34)";
  ctx.beginPath();
  ctx.ellipse(50, 75, 47, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#3b2030";
  ctx.lineWidth = 7;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(75, 42);
  ctx.quadraticCurveTo(100, 25, 91, 12);
  ctx.stroke();

  ctx.fillStyle = "#762f3c";
  ctx.fillRect(34, 51, 10, 22);
  ctx.fillRect(70, 50, 10, 23);
  ctx.fillStyle = "#e85c5e";
  ctx.fillRect(36, 66, 10, 5);
  ctx.fillRect(72, 66, 10, 5);

  ctx.save();
  ctx.shadowColor = "#ff645e";
  ctx.shadowBlur = 16;
  ctx.fillStyle = "#a83f4b";
  ctx.beginPath();
  ctx.ellipse(58, 43, 32, 19, -0.08, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(31, 29, 22, 23, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.fillStyle = "#542438";
  ctx.beginPath();
  ctx.moveTo(14, 22);
  ctx.lineTo(7, 2);
  ctx.lineTo(27, 13);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(36, 12);
  ctx.lineTo(47, 0);
  ctx.lineTo(51, 22);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#f1ae82";
  ctx.beginPath();
  ctx.ellipse(15, 38, 16, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#271523";
  ctx.beginPath();
  ctx.arc(9, 34, 5, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#fff0c7";
  ctx.beginPath();
  ctx.moveTo(4, 43);
  ctx.lineTo(28, 43);
  ctx.lineTo(24, 55);
  ctx.lineTo(9, 52);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#4b1829";
  ctx.beginPath();
  ctx.moveTo(5, 43);
  ctx.lineTo(28, 43);
  ctx.lineTo(25, 54);
  ctx.lineTo(21, 46);
  ctx.lineTo(17, 54);
  ctx.lineTo(13, 46);
  ctx.lineTo(9, 53);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#ffdb72";
  ctx.beginPath();
  ctx.arc(27, 25, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#281523";
  ctx.beginPath();
  ctx.arc(28, 25, 1.6, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#431a2b";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(20, 19);
  ctx.lineTo(32, 21);
  ctx.stroke();

  ctx.fillStyle = "#f5bd55";
  ctx.fillRect(40, 47, 37, 5);
  ctx.restore();
}

function drawShingen(obstacle) {
  ctx.save();
  ctx.translate(obstacle.x, groundY - obstacle.height);
  ctx.scale(obstacle.width / 100, obstacle.height / 76);

  ctx.fillStyle = "rgba(8, 10, 28, 0.34)";
  ctx.beginPath();
  ctx.ellipse(50, 75, 47, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#8e2635";
  ctx.beginPath();
  ctx.moveTo(21, 75);
  ctx.lineTo(27, 48);
  ctx.lineTo(73, 48);
  ctx.lineTo(82, 75);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#f0bb5d";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(28, 57);
  ctx.lineTo(73, 57);
  ctx.moveTo(25, 67);
  ctx.lineTo(78, 67);
  ctx.stroke();

  ctx.fillStyle = "#f0c092";
  ctx.beginPath();
  ctx.ellipse(50, 37, 17, 20, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#38212a";
  ctx.beginPath();
  ctx.arc(43, 35, 2, 0, Math.PI * 2);
  ctx.arc(57, 35, 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#4b2630";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(42, 44);
  ctx.quadraticCurveTo(50, 48, 58, 44);
  ctx.stroke();

  ctx.fillStyle = "#27243b";
  ctx.beginPath();
  ctx.moveTo(28, 30);
  ctx.lineTo(25, 18);
  ctx.lineTo(14, 10);
  ctx.lineTo(36, 15);
  ctx.lineTo(50, 5);
  ctx.lineTo(64, 15);
  ctx.lineTo(86, 10);
  ctx.lineTo(75, 20);
  ctx.lineTo(72, 31);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#f6c85e";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(50, 20, 12, Math.PI, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = "#d64b42";
  ctx.beginPath();
  ctx.arc(50, 17, 4, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#f0c05f";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(82, 75);
  ctx.lineTo(91, 34);
  ctx.stroke();
  ctx.strokeStyle = "#e8edf2";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(91, 34);
  ctx.lineTo(96, 16);
  ctx.stroke();

  ctx.textAlign = "center";
  ctx.font = "bold 12px sans-serif";
  ctx.lineWidth = 3;
  ctx.strokeStyle = "#191326";
  ctx.strokeText("武田信玄", 50, 10);
  ctx.fillStyle = "#fff1c9";
  ctx.fillText("武田信玄", 50, 10);
  ctx.restore();
}

function drawObstacle(obstacle) {
  if (obstacle.type === "shingen") {
    drawShingen(obstacle);
    return;
  }

  drawDog(obstacle);
}

function update(delta) {
  if (state !== "playing") return;

  elapsed += delta;
  distance += speed * delta / 10;
  speed = Math.min(400, speed + delta * 1.8);
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
    obstacles.push(createObstacle(Math.max(width + 30, previousRight + gap)));
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
