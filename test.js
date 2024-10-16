const canvas = document.getElementById("circleCanvas");
const ctx = canvas.getContext("2d");
const result = document.getElementById("result");
const highScoreText = document.getElementById("highScore");
const resetButton = document.getElementById("resetButton");
const goButton = document.getElementById("goButton");

ctx.strokeStyle = "BADA55";
ctx.lineJoin = "round";
ctx.lineCap = "round";
ctx.lineWidth = 10;

let isDrawing = false;
let lastX = 0;
let lastY = 0;
let startX;
let startY;
let hue = 0;
let direction = true;
let tooClose = false;
let isBad = false;
let highScore = 0;
let goneAround = false;
let fullRound = false;
let previousPoint = null;
let previousTime = null;

let drawingSound = new Audio("drawing.mp3");

let path = [];

window.onload = () => {
    //drawCenterDot();
    // ctx.font = "50px comic sans ms";
    // ctx.fillText(
    //     "Draw a circle",
    //     canvas.width / 2 - 160,
    //     canvas.height / 2 - 30
    // );
    // ctx.fillText("around this", canvas.width / 2 - 140, canvas.height / 2 + 55);
};

function drawCenterDot() {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    ctx.beginPath();
    ctx.arc(centerX, centerY, 5, 0, Math.PI * 2); // Draw a small circle with radius 5
    ctx.fillStyle = "white"; // Black color
    ctx.fill();
    ctx.closePath();
}

goButton.addEventListener("click", () => {
    goButton.style.display = "none"; // Hide the button
    startGame();
});

function startGame() {
    // Initialize game state and start drawing
    drawCenterDot();
    ctx.font = "50px comic sans ms";
    ctx.fillText(
        "Draw a circle",
        canvas.width / 2 - 160,
        canvas.height / 2 - 30
    );
    ctx.fillText("around this", canvas.width / 2 - 140, canvas.height / 2 + 55);
}

function draw(e) {
    if (!isDrawing || goButton.style.display !== "none") return;

    result.style.color = "white";

    //function stuff
    const x = e.offsetX;
    const y = e.offsetY;

    const currentTime = Date.now();
    if (previousPoint && previousTime) {
        const distance = Math.sqrt(
            Math.pow(x - previousPoint.x, 2) + Math.pow(y - previousPoint.y, 2)
        );
        const timeElapsed = currentTime - previousTime;
        const speed = distance / timeElapsed;
        const invertedSpeed = 1 / speed;

        // Adjust stroke size based on speed
        const minStrokeSize = 1;
        const maxStrokeSize = 15;
        const strokeSize = Math.min(
            maxStrokeSize,
            Math.max(minStrokeSize, invertedSpeed * 8)
        );

        ctx.lineWidth = strokeSize;
    }

    previousPoint = { x, y };
    previousTime = currentTime;

    path.push({ x, y });
    const score = evaluateCircle(path);

    // Map score to a color between red (0) and green (100)
    let greenValue, redValue;
    if (path.length < 10) {
        greenValue = 255;
        redValue = 0;
    } else {
        //Completed circle
        if (
            Math.abs(x - startX) <= 10 &&
            Math.abs(y - startY) <= 10 &&
            goneAround &&
            path.length > 40
        ) {
            console.log(path.length);
            result.innerText = `${score.toFixed(1)}%`;
            if (score > highScore) {
                if (score > 90) {
                    angelSound();
                }

                highScore = score;
                goodSound();
                highScoreText.innerText = `New best score`;
                highScoreText.classList.add("glow"); // Add the glow effect
            } else {
                highScoreText.innerText = `Best: ${highScore.toFixed(1)}%`;
            }
            isDrawing = false;

            return;
        }
        greenValue = Math.min(
            255,
            Math.max(0, Math.floor((score / 100) * 255))
        );
        redValue = 450 - greenValue;
    }
    ctx.strokeStyle = `rgb(${redValue}, ${greenValue}, 0)`;

    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.stroke();
    [lastX, lastY] = [e.offsetX, e.offsetY];

    highScoreText.innerText = "";

    if (tooClose) {
        //result.innerText = `Too close to the dot!`;
        result.innerText = "";
        ctx.fillText(
            "Too close to the dot!",
            canvas.width / 2 - 210,
            canvas.height / 2 + 55
        );
    } else {
        result.innerText = `${score.toFixed(1)}%`;
    }

    if (isBad) {
        // result.innerText = `You are NOT drawing a circle well!`;
        result.innerText = `XX.X%`;
        result.style.color = "red";
        highScoreText.innerText = `Wrong Way`;
    } else {
        // Clear the area where the text will be drawn
        // ctx.clearRect(canvas.width / 2 - 150, canvas.height / 2, 500, 500);

        // ctx.fillText(
        //     `${score.toFixed(2)}%`,
        //     canvas.width / 2 - 120,
        //     canvas.height / 2 + 55
        // );
        result.innerText = `${score.toFixed(1)}%`;
    }
}

function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

canvas.addEventListener("mousedown", (e) => {
    if (goButton.style.display !== "none") return;
    isDrawing = true;
    [lastX, lastY] = [e.offsetX, e.offsetY];
    startX = e.offsetX;
    startY = e.offsetY;
    goneAround = false;
    fullRound = false;

    highScoreText.classList.remove("glow");

    console.log("start x and y", startX, startY);

    //game function stuff
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear previous drawings
    //clear the highscoretext
    highScoreText.innerText = ``;
    path = [];
    path.push({ x: lastX, y: lastY });

    drawCenterDot();
    drawSound();
});

canvas.addEventListener("mousemove", draw);

canvas.addEventListener("mouseup", () => {
    isDrawing = false;
    stopDrawSound();
});

function evaluateCircle(path) {
    const center = { x: canvas.width / 2, y: canvas.height / 2 };
    let totalDeviation = 0;
    startRadius = Math.sqrt(
        (path[0].x - center.x) ** 2 + (path[0].y - center.y) ** 2
    );

    // if its too close to center
    if (startRadius < 38) {
        tooClose = true;
        isDrawing = false;
        wrongSound();
        result.innerText = `Too close to the dot!`;
    } else {
        tooClose = false;
    }

    if (path.length < 10) return 0; // Not enough points to evaluate

    // Loop throught the points of the path and see how close it is to the start radius
    for (let point of path) {
        const dx = point.x - center.x;
        const dy = point.y - center.y;
        const radius = Math.sqrt(dx * dx + dy * dy);
        totalDeviation += Math.abs(radius - startRadius);

        if (point.y > center.y && !goneAround) {
            goneAround = true;
            console.log("gone around: " + goneAround);
        }
    }

    //console.log("total deviation", totalDeviation);
    let aveRadiusDrawn = totalDeviation / path.length;

    const score = 100 - aveRadiusDrawn; // Score based on deviation

    if (score < 25) {
        wrongSound();
        isDrawing = false;
        isBad = true;
    } else {
        isBad = false;
    }

    return Math.max(0, score); // Ensure score is not negative
}

function wrongSound() {
    let audio = new Audio("wrong.mp3");
    audio.play();
}

function goodSound() {
    let audio = new Audio("good.wav");
    audio.play();
}

function drawSound() {
    drawingSound.loop = true; // Set the sound to loop
    drawingSound.play(); // Start playing the sound
}

function stopDrawSound() {
    drawingSound.pause(); // Pause the sound when drawing stops
    drawingSound.currentTime = 0; // Reset sound to the start for the next drawing
}

function angelSound() {
    let audio = new Audio("angel.mp3");
    audio.play();
}
