const canvas = document.getElementById("circleCanvas");
const ctx = canvas.getContext("2d");
const result = document.getElementById("result");
const resetButton = document.getElementById("resetButton");

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

let path = [];

window.onload = () => {
    drawCenterDot();
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

function draw(e) {
    if (!isDrawing) return;

    //function stuff
    const x = e.offsetX;
    const y = e.offsetY;
    console.log("current x and y", x, y);
    path.push({ x, y });
    const score = evaluateCircle(path);

    // Map score to a color between red (0) and green (100)
    let greenValue, redValue;
    if (path.length < 10) {
        greenValue = 255;
        redValue = 0;
    } else {
        //Completed circle
        if (Math.abs(x - startX) <= 5 && Math.abs(y - startY) <= 5) {
            if (score > highScore) {
                highScore = score;
                result.innerText = `You got a new high score of ${score.toFixed(
                    2
                )}%`;
            } else {
                result.innerText = `You have completed the circle with a score of ${score.toFixed(
                    2
                )}%`;
            }
            isDrawing = false;
            goodSound();
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

    if (tooClose) {
        result.innerText = `Too close to the dot!`;
    } else {
        result.innerText = `Your circle score: ${score.toFixed(2)}%`;
    }

    if (isBad) {
        result.innerText = `You are NOT drawing a circle well!`;
    } else {
        result.innerText = `Your circle score: ${score.toFixed(2)}%`;
    }
}

function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

canvas.addEventListener("mousedown", (e) => {
    isDrawing = true;
    [lastX, lastY] = [e.offsetX, e.offsetY];
    startX = e.offsetX;
    startY = e.offsetY;

    console.log("start x and y", startX, startY);

    //game function stuff
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear previous drawings
    path = [];
    path.push({ x: lastX, y: lastY });

    drawCenterDot();
});

canvas.addEventListener("mousemove", draw);

canvas.addEventListener("mouseup", () => {
    isDrawing = false;
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

resetButton.addEventListener("click", () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    result.innerText = "";
    drawCenterDot();
});

function wrongSound() {
    let audio = new Audio("wrong.mp3");
    audio.play();
}

function goodSound() {
    let audio = new Audio("good.wav");
    audio.play();
}
