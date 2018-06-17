"use strict";
//import * as $ from "jquery";
class Block {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}
class Poly {
    constructor() {
        this.blocks = new Array();
        this._hashCode = null;
    }
    static fromBlocks(blocks) {
        var poly = new Poly();
        poly.blocks = blocks;
        return poly;
    }
    get length() {
        return this.blocks.length;
    }
    clonePoly() {
        // ensure current piece is deeply cloned
        var cloneBlocks = new Array(this.length);
        for (var i = 0; i < this.length; i++) {
            var block = new Block(this.blocks[i].x, this.blocks[i].y);
            cloneBlocks[i] = block;
        }
        var clone = new Poly();
        clone.blocks = cloneBlocks;
        clone._hashCode = this._hashCode;
        return clone;
    }
    createArray() {
        var polyArray = new Array();
        polyArray.push(this);
        return polyArray;
    }
    rotateClockwise() {
        var clone = this.clonePoly();
        // rotate about the first block
        for (var i = 1; i < clone.length; i++) {
            var x = clone.blocks[i].x - clone.blocks[0].x;
            var y = clone.blocks[i].y - clone.blocks[0].y;
            clone.blocks[i].x = -y + clone.blocks[0].x;
            clone.blocks[i].y = x + clone.blocks[0].y;
        }
        return clone;
    }
    rotateAntiClockwise() {
        var clone = this.clonePoly();
        for (var i = 1; i < clone.length; i++) {
            var x = clone.blocks[i].x - clone.blocks[0].x;
            var y = clone.blocks[i].y - clone.blocks[0].y;
            clone.blocks[i].x = y + clone.blocks[0].x;
            clone.blocks[i].y = -x + clone.blocks[0].y;
        }
        return clone;
    }
    /**
     * Creates a hex string colour for a given poly. The colour will be
     * consistent as the poly moves and rotates.
     * @param poly
     */
    createPolyColor() {
        var hashCode = this.getHashCode();
        var color = Math.abs(hashCode);
        var limit = 13777215;
        if (color > limit) {
            color = color % limit;
        }
        var code = color.toString(16);
        while (code.length < 6) {
            code = "0" + code;
        }
        return "#" + code;
    }
    getHash() {
        var blockHashes = new Array();
        for (var i = 0; i < this.length; i++) {
            var polyHash = JSON.stringify(this.blocks[i]);
            blockHashes.push(polyHash);
        }
        return JSON.stringify(Array.from(blockHashes).sort());
    }
    getHashCode() {
        if (this._hashCode === null) {
            var hashCode = 0;
            var hashStr = this.getHash();
            if (hashStr.length == 0)
                return hashCode;
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
class PolytrisGame {
    constructor(gridWidth, gridHeight, polySize) {
        this.logicTicks = 53;
        this.currentTick = 0;
        this.linesCleared = 0;
        this.score = 0;
        this.level = 0;
        this.paused = false;
        this.tick = () => {
            if (!this.paused && this.currentTick % this.logicTicks == 0) {
                if (!this.moveCurrentPiece(0, 1)) {
                    for (var i = 0; i < this.currentPiece.length; i++) {
                        this.gameGrid[this.currentPiece.blocks[i].x][this.currentPiece.blocks[i].y] = this.currentPiece.createPolyColor();
                    }
                    this.checkLines();
                    this.currentPiece = this.nextPiece;
                    // translate piece to middle of the grid
                    if (!this.moveCurrentPiece(this.gridWidth / 2, 0)) {
                        // game over 
                        var name = prompt("Game over. What is your name?", "");
                        if (name) {
                            $.ajax({
                                url: "https://cors-anywhere.herokuapp.com/http://scores.richteaman.com/api/score",
                                headers: {
                                    "name": name,
                                    "lines": this.linesCleared.toString(10),
                                    "points": this.score.toString(10),
                                    "blocks": this.polySize.toString(10)
                                },
                                method: "POST"
                            }).done(function () {
                                location.reload();
                            });
                        }
                    }
                    this.nextPiece = this.spawnPiece();
                }
            }
            this.render(this.mainGtx, this.gameGrid, this.currentPiece);
            var previewPiece = this.nextPiece.clonePoly();
            for (var i = 0; i < previewPiece.blocks.length; i++) {
                var block = previewPiece.blocks[i];
                block.x += (previewPiece.blocks.length / 2) - 1;
                block.y += (previewPiece.blocks.length / 2) - 1;
            }
            this.render(this.previewGtx, this.createGrid(this.nextPiece.length, this.nextPiece.length), previewPiece);
            const statusElement = document.getElementById("status");
            if (this.paused) {
                statusElement.innerHTML = "Paused";
            }
            else {
                statusElement.innerHTML = "";
            }
            const linesClearedElement = document.getElementById("lines_cleared");
            if (linesClearedElement) {
                linesClearedElement.innerHTML = this.linesCleared.toString();
            }
            const scoreElement = document.getElementById("score");
            if (scoreElement) {
                scoreElement.innerHTML = this.score.toString();
            }
            const levelElement = document.getElementById("level");
            if (levelElement) {
                levelElement.innerHTML = this.level.toString();
            }
            this.currentTick++;
        };
        this.gridWidth = gridWidth;
        this.gridHeight = gridHeight;
        this.pieces = this.createPolyominoes(polySize);
        this.gameGrid = this.createGrid(this.gridWidth, this.gridHeight);
        this.polySize = polySize;
    }
    createPolyominoes(n) {
        // create origin point
        var polys = new Array();
        var block = new Block(0, 0);
        var startPoly = new Poly();
        startPoly.blocks.push(block);
        polys.push(startPoly);
        var hashes = new Set();
        hashes.add(startPoly.getHash());
        for (var i = 1; i < n; i++) {
            polys = this.expandPolys(polys, hashes);
        }
        var hashPolys = new Set();
        var resultPolys = new Array();
        for (var i = 0; i < polys.length; i++) {
            var poly = polys[i].clonePoly();
            if (poly.length == n) {
                this.normalisePoly(poly);
                var hash = this.getHashPolyomino(poly);
                if (!hashPolys.has(hash)) {
                    hashPolys.add(hash);
                    resultPolys.push(poly);
                }
            }
        }
        resultPolys.forEach(poly => {
            this.centerPoly(poly);
        });
        return resultPolys;
    }
    centerPoly(poly) {
        // find middle block
        var maxX = 0;
        var minX = 100000;
        var maxY = 0;
        var minY = 100000;
        poly.blocks.forEach(block => {
            if (block.x > maxX) {
                maxX = block.x;
            }
            if (block.x < minX) {
                minX = block.x;
            }
            if (block.y > maxY) {
                maxY = block.y;
            }
            if (block.y < minY) {
                minY = block.y;
            }
        });
        var middleX = Math.floor((maxX - minX) / 2);
        var middleY = Math.floor((maxY - minY) / 2);
        poly.blocks.forEach(block => {
            block.x -= middleX;
            block.y -= middleY;
        });
    }
    normalisePoly(poly) {
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
    attemptToGrowPoly(poly, block, hashes, resultPolys) {
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
        this.normalisePoly(newPoly);
        var addPoly = true;
        var newHashes = new Array();
        for (var i = 0; i < 4; i++) {
            var hash = newPoly.getHash();
            if (hashes.has(hash)) {
                addPoly = false;
            }
            else {
                newHashes.push(hash);
                newPoly = newPoly.rotateClockwise();
                this.normalisePoly(newPoly);
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
    expandPolys(startPolys, hashes) {
        var resultPolys = new Set(startPolys);
        // iterate through all polys
        for (var p = 0; p < startPolys.length; p++) {
            var poly = startPolys[p];
            var polyHash = this.getHashPolyomino(poly);
            // iterate through all blocks in poly
            for (var i = 0; i < poly.length; i++) {
                // add a block in all cardinalities
                // left
                this.attemptToGrowPoly(poly, new Block(poly.blocks[i].x + 1, poly.blocks[i].y), hashes, resultPolys);
                // up
                this.attemptToGrowPoly(poly, new Block(poly.blocks[i].x, poly.blocks[i].y + 1), hashes, resultPolys);
                // right
                this.attemptToGrowPoly(poly, new Block(poly.blocks[i].x - 1, poly.blocks[i].y), hashes, resultPolys);
                // down
                this.attemptToGrowPoly(poly, new Block(poly.blocks[i].x, poly.blocks[i].y - 1), hashes, resultPolys);
            }
        }
        return Array.from(resultPolys);
    }
    getHashPolyomino(poly) {
        var blockHashes = new Set();
        for (var i = 0; i < poly.length; i++) {
            var polyHash = JSON.stringify(poly.blocks[i]);
            blockHashes.add(polyHash);
        }
        return JSON.stringify(Array.from(blockHashes).sort());
    }
    createGrid(width, height) {
        var gameGrid = new Array(width);
        for (var i = 0; i < width; i++) {
            gameGrid[i] = new Array(height);
            for (var j = 0; j < height; j++) {
                gameGrid[i][j] = 0;
            }
        }
        return gameGrid;
    }
    spawnPiece() {
        var pieceId = getRandomInt(0, this.pieces.length);
        var piece = this.pieces[pieceId];
        var newPiece = piece.clonePoly();
        return newPiece;
    }
    /**
     * Renders the given grid on the given context with the given active piece.
     * @param {*} gtx
     * @param {any[][]} grid
     * @param {any[]} activePiece
     */
    render(gtx, grid, activePiece) {
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
                }
                else {
                    gtx.fillStyle = grid[i][j];
                }
                gtx.fillRect(i * cellWidth, j * cellHeight, cellWidth, cellHeight);
            }
        }
        gtx.fillStyle = activePiece.createPolyColor();
        for (var i = 0; i < activePiece.length; i++) {
            gtx.fillRect(activePiece.blocks[i].x * cellWidth, activePiece.blocks[i].y * cellHeight, cellWidth, cellHeight);
        }
    }
    /**
     * Return true if move was possible, other false.
     *
     * @argument xMod {number} Change in x position.
     * @argument yMod {number} Change in y position.
     * @returns {boolean}
     */
    moveCurrentPiece(xMod, yMod) {
        var canMovePiece = true;
        for (var i = 0; i < this.currentPiece.length; i++) {
            var x = this.currentPiece.blocks[i].x + xMod;
            var y = this.currentPiece.blocks[i].y + yMod;
            if (y < 0) {
                y = 0;
            }
            if (y == this.gridHeight ||
                this.gameGrid[x][y] != 0) {
                canMovePiece = false;
            }
        }
        if (canMovePiece) {
            for (var i = 0; i < this.currentPiece.length; i++) {
                this.currentPiece.blocks[i].y += yMod;
                this.currentPiece.blocks[i].x += xMod;
            }
        }
        return canMovePiece;
    }
    calculateLineClearedBonus(linesCleared) {
        var base = (this.level + 1) * 25;
        var bonus = base * Math.pow(3.5, linesCleared - 1);
        bonus = Math.floor(bonus);
        return bonus;
    }
    calculateLevelUp() {
        var earnedLevel = Math.floor(this.linesCleared / 10);
        if (earnedLevel > 20) {
            earnedLevel = 20;
        }
        if (earnedLevel > this.level) {
            this.level = earnedLevel;
            switch (this.level) {
                case 0:
                    this.logicTicks = 53;
                    break;
                case 1:
                    this.logicTicks = 49;
                    break;
                case 2:
                    this.logicTicks = 45;
                    break;
                case 3:
                    this.logicTicks = 41;
                    break;
                case 4:
                    this.logicTicks = 37;
                    break;
                case 5:
                    this.logicTicks = 33;
                    break;
                case 6:
                    this.logicTicks = 28;
                    break;
                case 7:
                    this.logicTicks = 22;
                    break;
                case 8:
                    this.logicTicks = 17;
                    break;
                case 9:
                    this.logicTicks = 11;
                    break;
                case 10:
                    this.logicTicks = 10;
                    break;
                case 11:
                    this.logicTicks = 9;
                    break;
                case 12:
                    this.logicTicks = 8;
                    break;
                case 13:
                    this.logicTicks = 7;
                    break;
                case 14:
                    this.logicTicks = 6;
                    break;
                case 15:
                    this.logicTicks = 6;
                    break;
                case 16:
                    this.logicTicks = 5;
                    break;
                case 17:
                    this.logicTicks = 5;
                    break;
                case 18:
                    this.logicTicks = 4;
                    break;
                case 19:
                    this.logicTicks = 4;
                    break;
                case 20:
                    this.logicTicks = 3;
                    break;
                default:
                    this.logicTicks = 3;
                    break;
            }
            this.currentTick = 0;
        }
    }
    checkLines() {
        var linesAdded = 0;
        var addedLineCount = this.gridHeight - 1;
        var newGameGrid = this.createGrid(this.gridWidth, this.gridHeight);
        for (var j = this.gridHeight - 1; j >= 0; j--) {
            var clearLine = true;
            for (var i = 0; i < this.gridWidth; i++) {
                if (this.gameGrid[i][j] == 0) {
                    clearLine = false;
                    break;
                }
            }
            if (clearLine) {
                linesAdded++;
            }
            else {
                for (var i = 0; i < this.gridWidth; i++) {
                    newGameGrid[i][addedLineCount] = this.gameGrid[i][j];
                }
                addedLineCount--;
            }
        }
        if (linesAdded > 0) {
            this.score += this.calculateLineClearedBonus(linesAdded);
        }
        this.linesCleared += linesAdded;
        this.gameGrid = newGameGrid;
        this.calculateLevelUp();
    }
    /**
     * Rotates the current piece clockwise. Returns true if the move was possible.
     */
    rotateCurrentPieceClockwise() {
        var clone = this.currentPiece.rotateClockwise();
        var canMovePiece = true;
        for (var i = 0; i < clone.length; i++) {
            if (clone.blocks[i].y == this.gridHeight || this.gameGrid[clone.blocks[i].x][clone.blocks[i].y] != 0) {
                canMovePiece = false;
            }
        }
        if (canMovePiece) {
            this.currentPiece = clone;
        }
        return canMovePiece;
    }
    /**
     * Rotates the current piece anticlockwise. Returns true if the move was possible.
     */
    rotateCurrentPieceAntiClockwise() {
        var clone = this.currentPiece.rotateAntiClockwise();
        var canMovePiece = true;
        for (var i = 0; i < clone.length; i++) {
            if (clone.blocks[i].y == this.gridHeight || this.gameGrid[clone.blocks[i].x][clone.blocks[i].y] != 0) {
                canMovePiece = false;
            }
        }
        if (canMovePiece) {
            this.currentPiece = clone;
        }
        return canMovePiece;
    }
    startGame() {
        this.mainGtx = document.getElementById("gtx").getContext("2d");
        this.previewGtx = document.getElementById("preview_gtx").getContext("2d");
        this.currentPiece = this.spawnPiece();
        this.moveCurrentPiece(this.gridWidth / 2, 0);
        this.nextPiece = this.spawnPiece();
        setInterval(this.tick, 17);
    }
}
/**
 * Gets an integer between the given values. Maximum is exclusive and the minimum is inclusive.
 * @argument min {number} Minimum number.
 * @argument max {number} Maximum number.
 * @returns {number}
 */
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}
function getQueryParam(name) {
    var results = new RegExp('[\?&]' + name + '=([^&#]*)')
        .exec(window.location.search);
    return (results && results[1]) || false;
}
