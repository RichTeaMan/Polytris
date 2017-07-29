
var gridWidth = 10;
var gridHeight = 14;

var gridSquareLength = 40;

var logicTicks = 20;
var currentTick = 0;

function createPolyominoes(n) {

    // create origin point
    var polys = [[{ "x" : 0, "y": 0}]];

    for (var i = 1; i < n; i++) {

        polys = expandPolys(polys);
    }
    return polys;
}

function expandPolys(startPolys) {

    var resultPolys = new Set();

    // iterate through all polys
    for (var p = 0; p < startPolys.length; p++) {
        var poly = startPolys[p];

        var polyHash = getHashPolyomino(poly);

        // iterate through all blocks in poly
        for (var i = 0; i < poly.length; i++) {

            // add a block in all cardinalities
            // left
            var leftCpoly = Array.from(poly);
            var leftNewBlock = { "x": poly[i].x + 1, "y": poly[i].y };
            leftCpoly.push(leftNewBlock);
            if (getHashPolyomino(leftCpoly) != polyHash) {
                resultPolys.add(leftCpoly);
            }

            // up
            var upCpoly = Array.from(poly);
            var upNewBlock = { "x": poly[i].x, "y": poly[i].y + 1 };
            upCpoly.push(upNewBlock);
            if (getHashPolyomino(upCpoly) != polyHash) {
                resultPolys.add(upCpoly);
            }

            // right
            var rightCpoly = Array.from(poly);
            var rightNewBlock = { "x": poly[i].x - 1, "y": poly[i].y };
            rightCpoly.push(rightNewBlock);
            if (getHashPolyomino(rightCpoly) != polyHash) {
                resultPolys.add(rightCpoly);
            }

            // down
            var downCpoly = Array.from(poly);
            var downNewBlock = { "x": poly[i].x, "y": poly[i].y - 1 };
            downCpoly.push(downNewBlock);
            if (getHashPolyomino(downCpoly) != polyHash) {
                resultPolys.add(downCpoly);
            }

            for (var r = 0; r < resultPolys.length; r++) {
                for (var b = 0; b < resultPolys[r].length; b++) {
                    var block = resultPolys[r][b];
                    if (block.x > 10) {
                        console.log("wtf");
                    }
                }
            }
        }
    }

    return Array.from(resultPolys);
}

function getHashPolyomino(poly) {
    var blockHashes = new Set();
    for (var i = 0; i < poly.length; i++) {
        var polyHash = JSON.stringify(poly[i]);
        blockHashes.add(polyHash);
    }
    return JSON.stringify(Array.from(blockHashes));
}

function createGrid() {
    var gameGrid = new Array(gridWidth);
    for (var i = 0; i < gridWidth; i++) {
        gameGrid[i] = new Array(gridHeight);
        for (var j = 0; j < gridHeight; j++) {
            gameGrid[i][j] = 0;
        }
    }
    return gameGrid;
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
}

var gameGrid = createGrid();

var pieces = createPolyominoes(4);

function spawnPiece() {
    var pieceId = getRandomInt(0, pieces.length);
    var piece = Array.from(pieces[pieceId]);
    for (var i = 0; i < piece.length; i++) {
        var block = piece[i];
        block.x += 5;
    }
    currentPiece = piece;

    var blockHashElement = document.getElementById("blockHash");
    if (blockHashElement) {
        blockHashElement.innerText = JSON.stringify(currentPiece);
    }
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

// return true if move was possible, other false.
function moveCurrentPiece(xMod, yMod) {

    var canMovePiece = true;
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
    return canMovePiece;
}

function tick() {

    if (currentTick % logicTicks == 0) {

        if (!moveCurrentPiece(0, 1)) {

            checkLines();
            spawnPiece();
        }
    }

    render();
    currentTick++;
}

function checkLines() {

    var addedLineCount = gridHeight - 1;
    var newGameGrid = createGrid();
    for (var j = gridHeight - 1; j >= 0; j--) {

        var clearLine = true;
        for (var i = 0; i < gridWidth; i++) {
            if (gameGrid[i][j] == 0) {
                clearLine = false;
                break;
            }

        }
        if (!clearLine) {
            for (var i = 0; i < gridWidth; i++) {
                newGameGrid[i][addedLineCount] = gameGrid[i][j];
            }
            addedLineCount--;
        }
    }
    gameGrid = newGameGrid;
}

window.onkeydown = function (e) {
    var key = e.keyCode ? e.keyCode : e.which;

    left = 37
    up = 38
    right = 39
    down = 40
    var xMod = 0;
    var yMod = 0;

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

    moveCurrentPiece(xMod, yMod);
}


var currentPiece = [];
var gtx = document.getElementById("gtx").getContext("2d");

spawnPiece();

setInterval(tick, 50);