
var gridWidth = 10;
var gridHeight = 14;

var gridSquareLength = 40;

var logicTicks = 20;
var currentTick = 0;

var gameGrid = new Array(gridWidth);
for (var i = 0; i < gridWidth; i++) {
    gameGrid[i] = new Array(gridHeight);
    for (var j = 0; j < gridHeight; j++) {
        gameGrid[i][j] = 0;
    }
}


function spawnPiece() {
    currentPiece = [{ "x": 5, "y": 0 }];
}



function render() {

    gtx.fillStyle = "#FF0000";
    gtx.fillRect(0, 0, 800, 800);

    for (var i = 0; i < gridWidth; i++) {
        for (var j = 0; j < gridHeight; j++) {
            if (gameGrid[i][j] == 0) {
                gtx.fillStyle = "#FFFFFF";
            } else {
                gtx.fillStyle = "#0000FF";
            }
            gtx.fillRect(i * gridSquareLength, j * gridSquareLength, gridSquareLength, gridSquareLength);
        }
    }

    gtx.fillStyle = "#0000FF";
    for (var i = 0; i < currentPiece.length; i++) {
        gtx.fillRect(currentPiece[i].x * gridSquareLength, currentPiece[i].y * gridSquareLength, gridSquareLength, gridSquareLength);
    }
}

function tick() {

    if (currentTick % logicTicks == 0) {

        var canDropPiece = true;
        for (var i = 0; i < currentPiece.length; i++) {
            if (currentPiece[i].y + 1 == gridHeight || gameGrid[currentPiece[i].x][currentPiece[i].y + 1] != 0) {
                canDropPiece = false;
            }
        }

        if (canDropPiece) {
            for (var i = 0; i < currentPiece.length; i++) {
                currentPiece[i].y++;
            }
        } else {
            for (var i = 0; i < currentPiece.length; i++) {
                gameGrid[currentPiece[i].x][currentPiece[i].y] = 1;
            }
            spawnPiece();
        }
    }

    render();
    currentTick++;
}

window.onkeydown = function (e) {
    var key = e.keyCode ? e.keyCode : e.which;

    left = 37
    up = 38
    right = 39
    down = 40
    var xMod = 0;
    var yMod = 0;
    var canMovePiece = true;

    // up
    if (key == 38) {

    }
    // down
    else if (key == 40) {
        yMod++;
    }
    // left
    else if (key == 37) {
        xMod--;
    }
    // right
    else if (key == 39) {
        xMod++;
    }

    for (var i = 0; i < currentPiece.length; i++) {
        if (currentPiece[i].y + yMod == gridHeight || gameGrid[currentPiece[i].x + xMod][currentPiece[i].y + yMod] != 0) {
            canMovePiece = false;
        }
    }

    if (canMovePiece) {
        for (var i = 0; i < currentPiece.length; i++) {
            currentPiece[i].y += yMod;
            currentPiece[i].x += xMod;
        }
    }
}


var currentPiece = [];
var gtx = document.getElementById("gtx").getContext("2d");

spawnPiece();

setInterval(tick, 50);