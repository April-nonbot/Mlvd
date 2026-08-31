```javascript
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let characterChoice = "leprechaun";
let worldChoice = "fairy";

let player;
let platforms = [];
let coins = [];
let obstacles = [];

let score = 0;
let coinCount = 0;
let highScore = Number(localStorage.getItem("rainbowHighScore")) || 0;

let gameRunning = false;
let gameSpeed = 5;
let frame = 0;


/* =========================
   CHARACTER & WORLD SELECT
========================= */

function chooseCharacter(character) {

    characterChoice = character;

    document.querySelectorAll(".character").forEach(button => {
        button.classList.remove("selected");
    });

    if (character === "leprechaun") {
        document.querySelectorAll(".character")[0].classList.add("selected");
    } else {
        document.querySelectorAll(".character")[1].classList.add("selected");
    }
}


function chooseWorld(world) {

    worldChoice = world;

    document.querySelectorAll(".world").forEach(button => {
        button.classList.remove("selected");
    });

    if (world === "fairy") {
        document.querySelectorAll(".world")[0].classList.add("selected");
    } else {
        document.querySelectorAll(".world")[1].classList.add("selected");
    }
}


/* =========================
   START GAME
========================= */

function startGame() {

    document.getElementById("menu").style.display = "none";
    document.getElementById("gameContainer").style.display = "block";

    resizeCanvas();

    score = 0;
    coinCount = 0;
    gameSpeed = 5;
    frame = 0;

    platforms = [];
    coins = [];
    obstacles = [];

    player = {

        x: 120,
        y: canvas.height - 170,

        width: 60,
        height: 60,

        velocityY: 0,

        gravity: 0.7,

        jumpPower: -14,

        grounded: false
    };


    createStartingPlatforms();

    gameRunning = true;

    requestAnimationFrame(gameLoop);
}


/* =========================
   CANVAS SIZE
========================= */

function resizeCanvas() {

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

window.addEventListener("resize", resizeCanvas);


/* =========================
   STARTING PLATFORMS
========================= */

function createStartingPlatforms() {

    platforms.push({

        x: 0,
        y: canvas.height - 80,

        width: canvas.width + 300,
        height: 80
    });
}


/* =========================
   JUMP
========================= */

function jump() {

    if (!gameRunning) return;

    if (player.grounded) {

        player.velocityY = player.jumpPower;

        player.grounded = false;
    }
}


/* Keyboard */

document.addEventListener("keydown", function(event) {

    if (
        event.code === "Space" ||
        event.code === "ArrowUp" ||
        event.code === "KeyW"
    ) {

        event.preventDefault();

        jump();
    }

});


/* Touch */

canvas.addEventListener("touchstart", function(event) {

    event.preventDefault();

    jump();

});


/* =========================
   CREATE PLATFORMS
========================= */

function createPlatform() {

    const height = 40 + Math.random() * 100;

    platforms.push({

        x: canvas.width + 50,

        y: canvas.height - 120 - Math.random() * 150,

        width: 150 + Math.random() * 100,

        height: 25
    });


    /* Add a coin */

    coins.push({

        x: canvas.width + 100,

        y: canvas.height - 190 - Math.random() * 100,

        radius: 12,

        collected: false
    });
}


/* =========================
   CREATE OBSTACLES
========================= */

function createObstacle() {

    obstacles.push({

        x: canvas.width + 50,

        y: canvas.height - 120,

        width: 45,

        height: 45
    });
}


/* =========================
   UPDATE GAME
========================= */

function update() {

    frame++;


    /* Player gravity */

    player.velocityY += player.gravity;

    player.y += player.velocityY;

    player.grounded = false;


    /* Platform collision */

    platforms.forEach(platform => {

        if (

            player.x < platform.x + platform.width &&

            player.x + player.width > platform.x &&

            player.y + player.height <= platform.y + 15 &&

            player.y + player.height + player.velocityY >= platform.y

        ) {

            player.y = platform.y - player.height;

            player.velocityY = 0;

            player.grounded = true;
        }

    });


    /* Move platforms */

    platforms.forEach(platform => {

        platform.x -= gameSpeed;

    });


    /* Move coins */

    coins.forEach(coin => {

        coin.x -= gameSpeed;

    });


    /* Move obstacles */

    obstacles.forEach(obstacle => {

        obstacle.x -= gameSpeed;

    });


    /* Remove old objects */

    platforms = platforms.filter(platform => platform.x + platform.width > -100);

    coins = coins.filter(coin => coin.x > -50);

    obstacles = obstacles.filter(obstacle => obstacle.x > -100);


    /* Create new platform */

    if (frame % 100 === 0) {

        createPlatform();
    }


    /* Create obstacles */

    if (frame > 150 && frame % 150 === 0) {

        createObstacle();
    }


    /* Collect coins */

    coins.forEach(coin => {

        if (!coin.collected) {

            const distance = Math.hypot(

                player.x + player.width / 2 - coin.x,

                player.y + player.height / 2 - coin.y

            );

            if (distance < 45) {

                coin.collected = true;

                coinCount++;

                score += 10;
            }
        }

    });


    /* Collision with obstacles */

    obstacles.forEach(obstacle => {

        if (

            player.x < obstacle.x + obstacle.width &&

            player.x + player.width > obstacle.x &&

            player.y < obstacle.y + obstacle.height &&

            player.y + player.height > obstacle.y

        ) {

            endGame();
        }

    });


    /* Falling */

    if (player.y > canvas.height + 100) {

        endGame();
    }


    /* Score */

    if (frame % 5 === 0) {

        score++;

    }


    /* Difficulty */

    if (frame % 600 === 0) {

        gameSpeed += 0.5;
    }


    updateUI();
}


/* =========================
   DRAW BACKGROUND
========================= */

function drawBackground() {

    let gradient;

    if (worldChoice === "fairy") {

        gradient = ctx.createLinearGradient(
            0,
            0,
            0,
            canvas.height
        );

        gradient.addColorStop(0, "#c7f0ff");
        gradient.addColorStop(1, "#e9c7ff");

    } else {

        gradient = ctx.createLinearGradient(
            0,
            0,
            0,
            canvas.height
        );

        gradient.addColorStop(0, "#ffd6f6");
        gradient.addColorStop(1, "#bde7ff");
    }


    ctx.fillStyle = gradient;

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    /* Clouds */

    ctx.fillStyle = "rgba(255,255,255,0.8)";

    for (let i = 0; i < 6; i++) {

        const x =
            ((i * 250) -
            (frame * 0.3)) %
            (canvas.width + 300);

        const cloudX =
            x < -100
                ? x + canvas.width + 300
                : x;

        const y = 100 + (i % 3) * 70;

        ctx.beginPath();

        ctx.arc(cloudX, y, 25, 0, Math.PI * 2);

        ctx.arc(
            cloudX + 30,
            y - 10,
            35,
            0,
            Math.PI * 2
        );

        ctx.arc(
            cloudX + 65,
            y,
            25,
            0,
            Math.PI * 2
        );

        ctx.fill();
    }


    /* Rainbow */

    drawRainbow();
}


/* =========================
   DRAW RAINBOW
========================= */

function drawRainbow() {

    const centerX = canvas.width / 2;

    const centerY = canvas.height - 100;

    const colors = [
        "#ff0000",
        "#ff8c00",
        "#ffff00",
        "#00aa44",
        "#0088ff",
        "#8a2be2"
    ];


    colors.forEach((color, index) => {

        ctx.beginPath();

        ctx.strokeStyle = color;

        ctx.lineWidth = 12;

        ctx.arc(

            centerX,

            centerY,

            200 - index * 12,

            Math.PI,

            Math.PI * 2

        );

        ctx.stroke();

    });
}


/* =========================
   DRAW PLATFORMS
========================= */

function drawPlatforms() {

    platforms.forEach(platform => {

        /* Rainbow platform */

        const rainbowColors = [
            "#ff4d4d",
            "#ff9f43",
            "#feca57",
            "#1dd1a1",
            "#54a0ff",
            "#9b59b6"
        ];

        const stripeHeight =
            platform.height / rainbowColors.length;


        rainbowColors.forEach((color, index) => {

            ctx.fillStyle = color;

            ctx.fillRect(

                platform.x,

                platform.y +
                index * stripeHeight,

                platform.width,

                stripeHeight
            );

        });
    });
}


/* =========================
   DRAW PLAYER
========================= */

function drawPlayer() {

    const emoji =
        characterChoice === "leprechaun"
            ? "🍀"
            : "🦄";


    ctx.font = "55px Arial";

    ctx.textAlign = "center";

    ctx.textBaseline = "middle";


    ctx.fillText(

        emoji,

        player.x + player.width / 2,

        player.y + player.height / 2
    );
}


/* =========================
   DRAW COINS
========================= */

function drawCoins() {

    coins.forEach(coin => {

        if (coin.collected) return;

        ctx.beginPath();

        ctx.fillStyle = "#FFD700";

        ctx.arc(

            coin.x,

            coin.y,

            coin.radius,

            0,

            Math.PI * 2
        );

        ctx.fill();


        ctx.strokeStyle = "#B8860B";

        ctx.lineWidth = 3;

        ctx.stroke();


        ctx.fillStyle = "#8B6508";

        ctx.font = "bold 12px Arial";

        ctx.textAlign = "center";

        ctx.textBaseline = "middle";

        ctx.fillText(
            "$",
            coin.x,
            coin.y
        );
    });
}


/* =========================
   DRAW OBSTACLES
========================= */

function drawObstacles() {

    obstacles.forEach(obstacle => {

        let emoji;

        if (worldChoice === "fairy") {

            emoji = "🍄";

        } else {

            emoji = "🐉";
        }


        ctx.font = "45px Arial";

        ctx.textAlign = "center";

        ctx.textBaseline = "middle";

        ctx.fillText(

            emoji,

            obstacle.x + obstacle.width / 2,

            obstacle.y + obstacle.height / 2
        );
    });
}


/* =========================
   DRAW EVERYTHING
========================= */

function draw() {

    drawBackground();

    drawPlatforms();

    drawCoins();

    drawObstacles();

    drawPlayer();
}


/* =========================
   GAME LOOP
========================= */

function gameLoop() {

    if (!gameRunning) return;

    update();

    draw();

    requestAnimationFrame(gameLoop);
}


/* =========================
   UPDATE UI
========================= */

function updateUI() {

    document.getElementById("score").textContent =
        score;

    document.getElementById("coins").textContent =
        coinCount;

    document.getElementById("highScore").textContent =
        highScore;
}


/* =========================
   GAME OVER
========================= */

function endGame() {

    if (!gameRunning) return;

    gameRunning = false;


    if (score > highScore) {

        highScore = score;

        localStorage.setItem(
            "rainbowHighScore",
            highScore
        );
    }


    document.getElementById("finalScore").textContent =
        score;

    document.getElementById("gameOver").style.display =
        "block";
}


/* =========================
   RESTART
========================= */

function restartGame() {

    document.getElementById("gameOver").style.display =
        "none";

    startGame();
}


/* =========================
   RETURN TO MENU
========================= */

function returnToMenu() {

    gameRunning = false;

    document.getElementById("gameContainer").style.display =
        "none";

    document.getElementById("gameOver").style.display =
        "none";

    document.getElementById("menu").style.display =
        "block";
}


/* =========================
   INITIAL UI
========================= */

document.getElementById("highScore").textContent =
    highScore;
```
