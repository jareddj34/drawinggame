// script.js
const canvas = document.getElementById("circleCanvas");
const ctx = canvas.getContext("2d");
const result = document.getElementById("result");
const resetButton = document.getElementById("resetButton");

let isDrawing = false;
let startX;
let startY;
let startRadius;
let path = [];
let hue = 0;

window.onload = () => {
    drawCenterDot();
};

function drawCenterDot() {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    ctx.beginPath();
    ctx.arc(centerX, centerY, 5, 0, Math.PI * 2); // Draw a small circle with radius 5
    ctx.fillStyle = "#000"; // Black color
    ctx.fill();
    ctx.closePath();
}

// Start drawing when mouse is pressed
canvas.addEventListener("mousedown", (e) => {
    console.log("mouse down");
    isDrawing = true;
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear previous drawings
    path = []; // Reset the path array
    startX = e.offsetX;
    startY = e.offsetY;
    path.push({ x: startX, y: startY });

    drawCenterDot();
});

// Capture drawing path while mouse is moving
canvas.addEventListener("mousemove", (e) => {
    if (!isDrawing) return;
    const x = e.offsetX;
    const y = e.offsetY;
    path.push({ x, y });
    const score = evaluateCircle(path);
    result.innerText = `Your circle score: ${score.toFixed(
        2
    )}% and the length of the path is ${path.length}`;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawPath(path);
    drawCenterDot();
});

// End drawing and evaluate the shape
canvas.addEventListener("mouseup", () => {
    isDrawing = false;
    const score = evaluateCircle(path);
    result.innerText = `Your circle score: ${score.toFixed(
        2
    )}% and the length of the path is ${path.length}`;

    drawCenterDot();
});

function draw(e) {
    ctx.strokeStyle = `hsl(${hue}, 100%, 50%)`;
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.stroke();
    [startX, startY] = [e.offsetX, e.offsetY];

    hue++;
    if (hue >= 360) {
        hue = 0;
    }
}

// Draw the user path on canvas
function drawPath(path) {
    ctx.beginPath();
    ctx.moveTo(path[0].x, path[0].y);
    for (let i = 1; i < path.length; i++) {
        ctx.lineTo(path[i].x, path[i].y);
    }
    // for (let i = 1; i < path.length; i++) {
    //     ctx.strokeStyle = `hsl(${hue}, 100%, 50%)`;
    //     hue++;
    //     if (hue > 360) hue = 0;
    //     ctx.lineTo(path[i].x, path[i].y);
    //     ctx.stroke();
    //     ctx.beginPath();
    //     ctx.moveTo(path[i].x, path[i].y);
    // }
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 10;
    ctx.stroke();
    ctx.closePath();
}

// Evaluate how circular the drawn path is
function evaluateCircle(path) {
    if (path.length < 10) return 0; // Not enough points to evaluate

    const center = { x: canvas.width / 2, y: canvas.height / 2 };
    let totalDeviation = 0;

    startRadius = Math.sqrt(
        (path[0].x - center.x) ** 2 + (path[0].y - center.y) ** 2
    );

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
    return Math.max(0, score); // Ensure score is not negative
}

// Reset canvas and result
resetButton.addEventListener("click", () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    result.innerText = "";
    drawCenterDot();
});
