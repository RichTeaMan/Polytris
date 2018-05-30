
class Block {
    public x: number;
    public y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
}

class Poly {
    blocks: Array<Block>;

    _hashCode: number;

    constructor() {
        this.blocks = new Array<Block>();
        this._hashCode = null;
    }

    static fromBlocks(blocks: Block[]): Poly {
        var poly = new Poly();
        poly.blocks = blocks;
        return poly;
    }

    get length(): number {
        return this.blocks.length;
    }

    createArray(): Poly[] {
        var polyArray = new Array<Poly>();
        polyArray.push(this);
        return polyArray;
    }

    rotateClockwise(): Poly {

        var clone = clonePoly(this);

        // rotate about the first block
        for (var i = 1; i < clone.length; i++) {
            var x = clone.blocks[i].x - clone.blocks[0].x;
            var y = clone.blocks[i].y - clone.blocks[0].y;
            clone.blocks[i].x = -y + clone.blocks[0].x;
            clone.blocks[i].y = x + clone.blocks[0].y;
        }
        return clone;
    }

    rotateAntiClockwise(): Poly {

        var clone = clonePoly(this);

        for (var i = 1; i < clone.length; i++) {
            var x = clone.blocks[i].x - clone.blocks[0].x;
            var y = clone.blocks[i].y - clone.blocks[0].y;
            clone.blocks[i].x = y + clone.blocks[0].x;
            clone.blocks[i].y = -x + clone.blocks[0].y;
        }
        return clone;
    }

    getHash(): String {
        var blockHashes = new Array();
        for (var i = 0; i < this.length; i++) {
            var polyHash = JSON.stringify(this.blocks[i]);
            blockHashes.push(polyHash);
        }
        return JSON.stringify(Array.from(blockHashes).sort());
    }

    getHashCode(): number {

        if (this._hashCode === null) {

            var hashCode = 0;
            var hashStr = this.getHash();
            if (hashStr.length == 0) return hashCode;
            for (var i = 0; i < hashStr.length; i++) {
                var char = hashStr.charCodeAt(i);
                hashCode = ((hashCode << 5) - hashCode) + char;
                hashCode = hashCode & hashCode; // Convert to 32bit integer
            }
            this._hashCode = hashCode;
        }
        return this._hashCode;
    }
}

var gridWidth = 10;
var gridHeight = 14;

var logicTicks = 20;
var currentTick = 0;

var linesCleared = 0;

function clonePoly(poly: Poly): Poly {
    // ensure current piece is deeply cloned
    var cloneBlocks = new Array<Block>(poly.length);
    for (var i = 0; i < poly.length; i++) {
        var block = new Block(poly.blocks[i].x, poly.blocks[i].y);
        cloneBlocks[i] = block;
    }
    var clone = new Poly();
    clone.blocks = cloneBlocks;
    clone._hashCode = poly._hashCode;
    return clone;
}

function createPolyominoes(n: number): Poly[] {

    // create origin point
    var polys = new Array<Poly>();
    var block = new Block(0, 0);
    var startPoly = new Poly();
    startPoly.blocks.push(block);

    polys.push(startPoly);

    var hashes = new Set<String>();
    hashes.add(startPoly.getHash());

    for (var i = 1; i < n; i++) {
        polys = expandPolys(polys, hashes);
    }

    var hashPolys = new Set();
    var resultPolys = new Array<Poly>();
    for (var i = 0; i < polys.length; i++) {
        var poly = clonePoly(polys[i]);
        if (poly.length == n) {
            normalisePoly(poly);
            var hash = getHashPolyomino(poly);
            if (!hashPolys.has(hash)) {
                hashPolys.add(hash);
                resultPolys.push(poly);
            }
        }
    }
    return resultPolys;
}

function normalisePoly(poly: Poly) {
    // find most negative x and y
    var negX = 0;
    var negY = 0;
    for (var i = 0; i < poly.length; i++) {
        if (poly.blocks[i].x < negX) {
            negX = poly.blocks[i].x;
        }
        if (poly.blocks[i].y < negY) {
            negY = poly.blocks[i].y;
        }
    }

    // add mod back to blocks
    for (var i = 0; i < poly.length; i++) {

        poly.blocks[i].x += Math.abs(negX);
        poly.blocks[i].y += Math.abs(negY);
    }

    // left align piece
    var smallX = poly.length;
    var smallY = poly.length;

    for (var i = 0; i < poly.length; i++) {
        if (poly.blocks[i].x < smallX) {
            smallX = poly.blocks[i].x;
        }
        if (poly.blocks[i].y < smallY) {
            smallY = poly.blocks[i].y;
        }
    }

    // add mod back to blocks
    for (var i = 0; i < poly.length; i++) {

        poly.blocks[i].x -= Math.abs(smallX);
        poly.blocks[i].y -= Math.abs(smallY);
    }
}

function attemptToGrowPoly(poly: Poly, block: Block, hashes: Set<String>, resultPolys: Set<Poly>): boolean {

    // check if block already exists in poly
    for (var i = 0; i < poly.length; i++) {
        // existing block
        var eB = poly.blocks[i];
        if (eB.x == block.x && eB.y == block.y) {
            return false;
        }
    }

    var blocks = Array.from(poly.blocks);
    blocks.push(block);
    var newPoly = Poly.fromBlocks(blocks);
    normalisePoly(newPoly);

    var addPoly = true;
    var newHashes = new Array<String>();
    for (var i = 0; i < 4; i++) {

        var hash = newPoly.getHash();
        if (hashes.has(hash)) {
            addPoly = false;
        } else {
            newHashes.push(hash);
            newPoly = newPoly.rotateClockwise();
            normalisePoly(newPoly);
        }
    }

    newHashes.forEach((hash, i, _newHashes) => {
        hashes.add(hash);
    });

    if (addPoly) {
        resultPolys.add(newPoly);
    }

    return addPoly;
}

function expandPolys(startPolys: Poly[], hashes: Set<String>): Poly[] {

    var resultPolys = new Set<Poly>(startPolys);

    // iterate through all polys
    for (var p = 0; p < startPolys.length; p++) {
        var poly = startPolys[p];

        var polyHash = getHashPolyomino(poly);

        // iterate through all blocks in poly
        for (var i = 0; i < poly.length; i++) {

            // add a block in all cardinalities
            // left
            attemptToGrowPoly(poly, new Block(poly.blocks[i].x + 1, poly.blocks[i].y), hashes, resultPolys);

            // up
            attemptToGrowPoly(poly, new Block(poly.blocks[i].x, poly.blocks[i].y + 1), hashes, resultPolys);

            // right
            attemptToGrowPoly(poly, new Block(poly.blocks[i].x - 1, poly.blocks[i].y), hashes, resultPolys);

            // down
            attemptToGrowPoly(poly, new Block(poly.blocks[i].x, poly.blocks[i].y - 1), hashes, resultPolys);
        }
    }

    return Array.from(resultPolys);
}

function getHashPolyomino(poly: Poly): String {
    var blockHashes = new Set();
    for (var i = 0; i < poly.length; i++) {
        var polyHash = JSON.stringify(poly.blocks[i]);
        blockHashes.add(polyHash);
    }


    return JSON.stringify(Array.from(blockHashes).sort());
}

function createGrid(width: number, height: number) {
    var gameGrid = new Array(width);
    for (var i = 0; i < width; i++) {
        gameGrid[i] = new Array(height);
        for (var j = 0; j < height; j++) {
            gameGrid[i][j] = 0;
        }
    }
    return gameGrid;
}

/**
 * Gets an integer between the given values. Maximum is exclusive and the minimum is inclusive.
 * @argument min {number} Minimum number.
 * @argument max {number} Maximum number.
 * @returns {number}
 */
function getRandomInt(min: number, max: number) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}

function spawnPiece(): Poly {
    var pieceId = getRandomInt(0, pieces.length);
    var piece = pieces[pieceId];

    var newPiece = clonePoly(piece);
    return newPiece;
}

/**
 * Renders the given grid on the given context with the given active piece.
 * @param {*} gtx 
 * @param {any[][]} grid 
 * @param {any[]} activePiece
 */
function render(gtx: CanvasRenderingContext2D, grid: any[], activePiece: Poly) {

    var cellWidth = Math.floor(gtx.canvas.width / grid.length);
    var cellHeight = Math.floor(gtx.canvas.height / grid[0].length);

    gtx.fillStyle = "#FFFFFF";
    gtx.fillRect(0, 0, gtx.canvas.width, gtx.canvas.height);
    var width = grid.length;
    var height = grid[0].length;

    for (var i = 0; i < width; i++) {
        for (var j = 0; j < height; j++) {
            if (grid[i][j] === 0) {
                gtx.fillStyle = "#FFFFFF";
            } else {
                gtx.fillStyle = grid[i][j];
            }
            gtx.fillRect(i * cellWidth, j * cellHeight, cellWidth, cellHeight);
        }
    }
    gtx.fillStyle = createPolyColor(activePiece);
    for (var i = 0; i < activePiece.length; i++) {
        gtx.fillRect(activePiece.blocks[i].x * cellWidth, activePiece.blocks[i].y * cellHeight, cellWidth, cellHeight);
    }
}

/**
 * Creates a hex string colour for a given poly. The colour will be
 * consistent as the poly moves and rotates.
 * @param poly 
 */
function createPolyColor(poly: Poly): string {
    var hashCode = poly.getHashCode();
    var color = Math.abs(hashCode) % 15777215;
    return "#" + color.toString(16);
}

/**
 * Return true if move was possible, other false.
 * 
 * @argument xMod {number} Change in x position.
 * @argument yMod {number} Change in y position.
 * @returns {boolean}
 */
function moveCurrentPiece(xMod: number, yMod: number) {

    var canMovePiece = true;
    for (var i = 0; i < currentPiece.length; i++) {
        if (currentPiece.blocks[i].y + yMod == gridHeight || gameGrid[currentPiece.blocks[i].x + xMod][currentPiece.blocks[i].y + yMod] != 0) {
            canMovePiece = false;
        }
    }

    if (canMovePiece) {
        for (var i = 0; i < currentPiece.length; i++) {
            currentPiece.blocks[i].y += yMod;
            currentPiece.blocks[i].x += xMod;
        }
    }
    return canMovePiece;
}

function tick() {

    if (currentTick % logicTicks == 0) {

        if (!moveCurrentPiece(0, 1)) {

            for (var i = 0; i < currentPiece.length; i++) {
                gameGrid[currentPiece.blocks[i].x][currentPiece.blocks[i].y] = createPolyColor(currentPiece);
            }

            checkLines();
            currentPiece = nextPiece;
            // translate piece to middle of the grid
            moveCurrentPiece(gridWidth / 2, 0);
            nextPiece = spawnPiece();
        }
    }

    render(mainGtx, gameGrid, currentPiece);
    render(previewGtx, createGrid(nextPiece.length, nextPiece.length), nextPiece);

    const newLocal = document.getElementById("lines_cleared");
    if (newLocal) {
        newLocal.innerHTML = linesCleared.toString();
    }

    currentTick++;
}

function checkLines() {

    var addedLineCount = gridHeight - 1;
    var newGameGrid = createGrid(gridWidth, gridHeight);
    for (var j = gridHeight - 1; j >= 0; j--) {

        var clearLine = true;
        for (var i = 0; i < gridWidth; i++) {
            if (gameGrid[i][j] == 0) {
                clearLine = false;
                break;
            }

        }
        if (clearLine) {
            linesCleared++;
        }
        else {
            for (var i = 0; i < gridWidth; i++) {
                newGameGrid[i][addedLineCount] = gameGrid[i][j];
            }
            addedLineCount--;
        }
    }
    gameGrid = newGameGrid;
}

function rotateClockwise(poly: Poly): Poly {

    var clone = clonePoly(poly);

    // rotate about the first block
    for (var i = 1; i < clone.length; i++) {
        var x = clone.blocks[i].x - clone.blocks[0].x;
        var y = clone.blocks[i].y - clone.blocks[0].y;
        clone.blocks[i].x = -y + clone.blocks[0].x;
        clone.blocks[i].y = x + clone.blocks[0].y;
    }

    var canMovePiece = true;
    for (var i = 0; i < clone.length; i++) {
        if (clone.blocks[i].y == gridHeight || gameGrid[clone.blocks[i].x][clone.blocks[i].y] != 0) {
            canMovePiece = false;
        }
    }

    if (canMovePiece) {
        poly = clone;
    }
    return poly;
}

function rotateAntiClockwise(poly: Poly): Poly {

    var clone = clonePoly(poly);

    for (var i = 1; i < clone.length; i++) {
        var x = clone.blocks[i].x - clone.blocks[0].x;
        var y = clone.blocks[i].y - clone.blocks[0].y;
        clone.blocks[i].x = y + clone.blocks[0].x;
        clone.blocks[i].y = -x + clone.blocks[0].y;
    }

    var canMovePiece = true;
    for (var i = 0; i < clone.length; i++) {
        if (clone.blocks[i].y == gridHeight || gameGrid[clone.blocks[i].x][clone.blocks[i].y] != 0) {
            canMovePiece = false;
        }
    }

    if (canMovePiece) {
        poly = clone;
    }
    return poly;
}

window.onkeydown = function (e) {
    var key = e.keyCode ? e.keyCode : e.which;

    var left = 37
    var up = 38
    var right = 39
    var down = 40
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
    // X
    else if (key == 88) {
        currentPiece = rotateClockwise(currentPiece);
    }
    // Z
    else if (key == 90) {
        currentPiece = rotateAntiClockwise(currentPiece);
    }
    moveCurrentPiece(xMod, yMod);
}

function startGame(polySize: number) {

    pieces = createPolyominoes(polySize);
    mainGtx = (<HTMLCanvasElement>document.getElementById("gtx")).getContext("2d");
    previewGtx = (<HTMLCanvasElement>document.getElementById("preview_gtx")).getContext("2d");
    currentPiece = spawnPiece();
    moveCurrentPiece(gridWidth / 2, 0);
    nextPiece = spawnPiece();
    setInterval(tick, 50);
}

function getQueryParam(name: String): String | boolean {
    var results = new RegExp('[\?&]' + name + '=([^&#]*)')
        .exec(window.location.search);

    return (results && results[1]) || false;
}


var gameGrid = createGrid(gridWidth, gridHeight);

var pieces: Poly[];
var mainGtx: CanvasRenderingContext2D;
var previewGtx: CanvasRenderingContext2D;
var currentPiece: Poly;
var nextPiece: Poly;
