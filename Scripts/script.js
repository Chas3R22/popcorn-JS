// Game field properties

let field;
const fieldWidth = 555;
const fieldHeight = 615;
let fieldContext;

// Player properties

let playerWidth = 80;
let playerHeight = 10;
let playerColor = "cyan";
let playerVelocity = 15;

let player = {
    x : fieldWidth/2 - playerWidth/2,
    y : fieldHeight - playerHeight - 25,
    width : playerWidth,
    height : playerHeight,
    color : playerColor,
    velocity : playerVelocity
}

// Ball properties

let ballWidth = 8;
let ballHeight = 8;
let ballColor = "white";
let ballVelocityX = 1;
let ballVelocityY = 4;
let ballRadii = 6;

let ball = {
    x : fieldWidth/2,
    y : fieldHeight/1.5,
    width : ballWidth,
    height : ballHeight,
    color : ballColor,
    xVelocity : ballVelocityX,
    yVelocity : ballVelocityY,
    radii : ballRadii
}

// Block properties

let blockArray = [];
let blockWidth = 40;
let blockHeight = 20;
let blockCount = 0;

// Blocks origin point

let blockOriginX = 15;
let blockOriginY = 15;

// Gameplay properties

let score = 0;
let lives = 3;
let gameOver = false;
let gameWon = false;

// Maps

const level1 = [
    [0,0,1,1,1,1,1,1,1,],
    [0,1,1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1,1,1,1],
    [0,1,1,5,5,5,5,5,5,5,1,1],
    [0,0,1,1,5,1,1,1,1,1,1,1,1],
    [0,0,0,1,1,5,1,1,1,1,1,1,1,1],
    [0,0,0,1,1,5,1,1,1,1,1,1,1,1],
    [0,0,1,1,5,1,1,1,1,1,1,1,1],
    [0,1,1,5,5,5,5,5,5,5,1,1],
    [1,1,1,1,1,1,1,1,1,1,1],
    [0,1,1,1,1,1,1,1,1,1],
    [0,0,1,1,1,1,1,1,1,],
]

const level2 = [
    [0,0,1,1,2,2,1,1,2,2],
    [0,0,1,1,2,2,1,1,2,2],
    [0,0,1,1,2,2,1,1,2,2],
    [0,0,1,1,2,2,1,1,2,2],
    [0,0,1,1,2,2,1,1,2,2],
    [0,0,1,1,2,2,1,1,2,2],
    [0,0,1,1,2,2,1,1,2,2],
    [0,0,1,1,2,2,1,1,2,2],
    [0,0,1,1,2,2,1,1,2,2],
    [0,0,1,1,2,2,1,1,2,2],
    [0,0,1,1,2,2,1,1,2,2],
    [0,0,1,1,2,2,1,1,2,2],
]

const level3 = [
    [0,0,0,0,2,2,2,2,2,2],
    [0,0,0,2,1,2,2,2,2,2,2],
    [0,0,2,1,4,3,3,2],
    [0,2,2,1,4,4,3,3,2,2,2,2,2],
    [2,2,2,1,4,3,3,2,2],
    [2,2,2,2,1,2,2,2,2,2,2,2,2,2],
    [2,2,2,2,1,2,2,2,2,2,2,2,2,2],
    [2,2,2,1,4,3,3,2,2],
    [0,2,2,1,4,4,3,3,2,2,2,2,2],
    [0,0,2,1,4,3,3,2],
    [0,0,0,2,1,2,2,2,2,2,2],
    [0,0,0,0,2,2,2,2,2,2],
]

let currentLevel = level1;

// Sounds

const eventSound = new Audio();

function playSound(condition) {
    eventSound.src = `Sounds/${condition}.wav`;
    eventSound.autoplay = true;
}

// Initial draws

window.onload = () => {
    field = document.getElementById("game-field");
    field.width = fieldWidth;
    field.height = fieldHeight;
    context = field.getContext("2d");

    drawInitialFigures();

    layoutBuilder(currentLevel);
    setTimeout(() => requestAnimationFrame(update), 3000);
}

// Frame update logic

function update() {
    context.clearRect(0, 0, field.width, field.height);

    if(lives <= 0) {
        playSound("loseLife");
        context.font = "20px sans-serif";
        context.fillStyle = "cyan";
        context.fillText("Game over! Press the spacebar button to replay.", 70, 500);
        gameOver = true;
        return;
    }

    if(blockCount <= 0) {
        playSound("victory");
        context.font = "20px sans-serif";
        context.fillStyle = "cyan";
        context.fillText("You win! Press the spacebar button to play the next level.", 30, 500);
        gameWon = true;
        return;
    }

    context.fillStyle = player.color;
    context.fillRect(player.x, player.y, player.width, player.height);

    context.fillStyle = ball.color;
    context.beginPath();
    context.roundRect(ball.x, ball.y, ball.width, ball.height, ball.radii);
    context.fill();

    ball.x += ball.xVelocity;
    ball.y += ball.yVelocity;

    if(ball.y <= 0) {
        ball.yVelocity *= -1;
        playSound("terrainCollision");
    } else if(ball.x <= 0 || (ball.x + ball.width) >= fieldWidth) {
        ball.xVelocity *= -1;
        playSound("terrainCollision");
    } else if(ball.y + ball.height >= fieldHeight) {
        playSound("loseLife");
        lives--;
        ball.x = fieldWidth/2;
        ball.y = fieldHeight/1.5;
        ball.xVelocity = 1;
        ball.yVelocity = 4;
        statDisplay(score, lives);
    }

    if(collisionTop(ball, player) || collisionBottom(ball, player)) {
        ball.yVelocity *= -1;
        playSound("playerCollision");
    } else if(collisionRight(ball, player) || collisionLeft(ball, player)) {
        ball.xVelocity *= -1;
        playSound("playerCollision");
    }

    for(let i = 0; i < blockArray.length; i++) {
        let block = blockArray[i];
        if(block.health > 0) {
            if(collisionTop(ball, block) || collisionBottom(ball, block)) {
                playSound("blockCollision");
                block.health -= 1;
                ball.yVelocity *= -1;
                score += 100;
                statDisplay(score, lives);
            } else if(collisionLeft(ball, block) || collisionRight(ball, block)) {
                playSound("blockCollision");
                block.health -= 1;
                ball.yVelocity *= -1;                
                score += 100;
                statDisplay(score, lives);
            }

            if(block.health <= 0) {
                blockCount--;
            }

            context.fillStyle = `${block.color}`;
            context.fillRect(block.x, block.y, block.width, block.height);
        }
    }
    
    requestAnimationFrame(update);
}

function outOfBoundsCheck(position) {
    return (position < 0 || position + playerWidth > fieldWidth);
}

function updatePlayerPosition(keyPress) {
    if(gameOver) {
        if(keyPress.code == "Space") {
            score = 0;
            currentLevel = level1;
            reloadGame(currentLevel);
        }
    }
    if(gameWon) {
        if(keyPress.code == "Space") {
            changeLevel();
            reloadGame(currentLevel);
        }
    }

    if(keyPress.code == "ArrowLeft") {
        let nextPlayerPosition = player.x - player.velocity;
        if(!outOfBoundsCheck(nextPlayerPosition)) player.x = nextPlayerPosition;
    } else if(keyPress.code == "ArrowRight") {
        let nextPlayerPosition = player.x + player.velocity;
        if(!outOfBoundsCheck(nextPlayerPosition)) player.x = nextPlayerPosition;
    }
}

function collisionCheck(elementA, elementB) {
    return elementA.x < elementB.x + elementB.width && // A top left corner does not reach B top right corner.
           elementA.x + elementA.width > elementB.x && // A top right corner passes B top left corner.
           elementA.y < elementB.y + elementB.height && // A top left corner does not reach B bottom left corner.
           elementA.y + elementA.height > elementB.y // A bottom left corner passes B top left corner.
}

function collisionTop(ball, object) {
    return collisionCheck(ball, object) && (ball.y + ball.height) >= object.y;
}

function collisionBottom(ball, object) {
    return collisionCheck(ball, object) && (object.y + object.height) >= ball.y;
}

function collisionLeft(ball, object) {
    return collisionCheck(ball, object) && (ball.x + ball.width) >= object.x;
}

function collisionRight(ball, object) {
    return collisionCheck(ball, object) && (object.y + object.width) >= ball.x;
}

function layoutBuilder(level) {
    blockArray = [];
    for(let c = 0; c < level.length; c++) {
        let blockRows = level[c].length;
        for(let r = 0; r < blockRows; r++) {
            let block = {
                x : blockOriginX + c*blockWidth + c*4,
                y : blockOriginY + r*blockHeight + r*4,
                width : blockWidth,
                height : blockHeight,
                health : 0,
                color : "black"
            }
            switch(level[c][r]) {
                case 0: 
                    block.health = 0;
                    block.color = "black";
                    break;
                case 1:
                    block.health = 1;
                    block.color = "hotpink";
                    break;
                case 2:
                    block.health = 1;
                    block.color = "cyan";
                    break;
                case 3:
                    block.health = 2;
                    block.color = "deepskyblue";
                    break;
                case 4:
                    block.health = 3;
                    block.color = "dodgerblue";
                    break;
                case 5:
                    block.health = 4;
                    block.color = "blue";
                    break;
            }
            blockArray.push(block);
            if(block.health === 0) {
                blockCount--;
            }
        }
    }
    blockCount += blockArray.length;
}

function statDisplay(score, lives) {
    const livesField = document.getElementById("lives");
    const scoreField = document.getElementById("score");

    livesField.innerHTML = `Lives: ${lives}`;
    scoreField.innerHTML = `Score: ${score}`;
}

function reloadGame(level) {
    context.clearRect(0, 0, field.width, field.height);
    gameOver = false;
    gameWon = false;
    
    player = {
        x : fieldWidth/2 - playerWidth/2,
        y : fieldHeight - playerHeight - 25,
        width : playerWidth,
        height : playerHeight,
        color : playerColor,
        velocity : playerVelocity
    }

    ball = {
        x : fieldWidth/2,
        y : fieldHeight/1.5,
        width : ballWidth,
        height : ballHeight,
        color : ballColor,
        xVelocity : ballVelocityX,
        yVelocity : ballVelocityY,
        radii : ballRadii
    }

    blockCount = 0;
    blockArray = [];
    //score = 0;
    lives = 3;

    layoutBuilder(level);
    statDisplay(score, lives);
    drawInitialFigures();

    setTimeout(() => requestAnimationFrame(update), 3000);
}

function drawInitialFigures() {
    context.font = "20px sans-serif";
    context.fillStyle = "cyan";
    context.fillText("Get ready!", 235, 500);

    context.fillStyle = player.color;
    context.fillRect(player.x, player.y, player.width, player.height);
    document.addEventListener("keydown", updatePlayerPosition);

    context.fillStyle = ball.color;
    context.beginPath();
    context.roundRect(ball.x, ball.y, ball.width, ball.height, ball.radii);
    context.fill();
}

function changeLevel() {
    if(currentLevel === level1) {
        currentLevel = level2;
    } else if(currentLevel === level2) {
        currentLevel = level3;
    } else if(currentLevel === level3) {
        currentLevel = level1;
    }
}