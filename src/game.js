"use strict";
//import * as $ from "jquery";
class PolytrisGame {
    constructor(gridWidth, gridHeight, pieces) {
        this.logicTicks = 53;
        this.currentTick = 0;
        this.linesCleared = 0;
        this.score = 0;
        this.level = 0;
        this.paused = false;
        this.gameOver = false;
        this.gameOverPromptShown = false;
        this.removingLinesFrames = 0;
        this.linesToRemove = null;
        this.pauseText = "Paused";
        this.gameOverText = "Game Over";
        /** The total number of frames to remove lines for. */
        this.removingLinesFramesDelay = 50;
        this.tick = () => {
            if (this.gameOver && !this.gameOverPromptShown) {
                // game over handling
                var name = prompt("Game over. What is your name?", "");
                this.gameOverPromptShown = true;
                if (name) {
                    this.writeStatus("Submitting score...");
                    $.ajax({
                        url: "https://cors-anywhere.herokuapp.com/http://scores.richteaman.com/api/score",
                        headers: {
                            "name": name,
                            "lines": this.linesCleared.toString(10),
                            "points": this.score.toString(10),
                            "blocks": this.pieces[0].blocks.length.toString(10)
                        },
                        method: "POST"
                    })
                        .always(function () {
                        location.reload();
                    });
                }
                else {
                    location.reload();
                }
            }
            if (this.removingLinesFrames > 0) {
                this.removingLinesFrames--;
                if (this.removingLinesFrames == 0) {
                    this.removeLines();
                }
            }
            else if (!this.gameOver && !this.paused && this.currentTick % this.logicTicks == 0) {
                this.tickPiece();
            }
            this.renderGame(this.mainGtx, this.gameGrid, this.currentPiece);
            this.renderPreview(this.previewGtx, this.createGrid(this.nextPiece.length, this.nextPiece.length), this.nextPiece.createPreviewPiece());
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
        this.pieces = pieces;
        this.gameGrid = this.createGrid(this.gridWidth, this.gridHeight);
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
    renderBlock(gtx, x, y, width, height, colour) {
        var margin = 2;
        gtx.fillStyle = colour;
        gtx.fillRect(x, y, width, height);
        gtx.fillStyle = "rgba(0, 0, 0, 0.1)";
        gtx.fillRect(x, y, width, height);
        gtx.fillStyle = colour;
        gtx.fillRect(x + margin, y + margin, width - (2 * margin), height - (2 * margin));
    }
    /**
     * Renders the given grid on the given context with the given active piece as a game.
     * @param {*} gtx
     * @param {any[][]} grid
     * @param {any[]} activePiece
     */
    renderGame(gtx, grid, activePiece) {
        var cellWidth = gtx.canvas.width / grid.length;
        var cellHeight = gtx.canvas.height / grid[0].length;
        gtx.fillStyle = "#FFFFFF";
        gtx.fillRect(0, 0, gtx.canvas.width, gtx.canvas.height);
        var width = grid.length;
        var height = grid[0].length;
        for (var i = 0; i < width; i++) {
            var xPos = Math.floor(i * cellWidth);
            for (var j = 0; j < height; j++) {
                var yPos = Math.floor(j * cellHeight);
                if (grid[i][j] === 0) {
                    gtx.fillStyle = "#FFFFFF";
                    gtx.fillRect(xPos, yPos, cellWidth, cellHeight);
                }
                else {
                    var blockColour = grid[i][j];
                    this.renderBlock(gtx, xPos, yPos, cellWidth, cellHeight, blockColour);
                }
            }
        }
        if (this.removingLinesFrames > 0) {
            if (Math.floor(this.removingLinesFrames / 5) % 2 == 0) {
                gtx.fillStyle = "#CCCC00";
                this.linesToRemove.forEach(lineNumber => {
                    gtx.fillRect(0, lineNumber * cellHeight, this.gridWidth * cellWidth, cellHeight);
                });
            }
            else {
                gtx.fillStyle = "#000000";
            }
        }
        else {
            var colour = activePiece.createPolyColor();
            for (var i = 0; i < activePiece.length; i++) {
                var xPos = Math.floor(activePiece.blocks[i].x * cellWidth);
                var yPos = Math.floor(activePiece.blocks[i].y * cellHeight);
                this.renderBlock(gtx, xPos, yPos, cellWidth, cellHeight, colour);
            }
        }
        if (this.gameOver) {
            gtx.fillStyle = "rgba(10, 10, 10, 0.9)";
            gtx.fillRect(0, 0, gtx.canvas.width, gtx.canvas.height);
            gtx.font = "30px PressStart2P";
            gtx.fillStyle = "#FFFFFF";
            var gameOverTextWidth = gtx.measureText(this.gameOverText).width;
            var gameOverTextXpos = (gtx.canvas.width / 2) - (gameOverTextWidth / 2);
            gtx.fillText(this.gameOverText, gameOverTextXpos, gtx.canvas.height / 2);
        }
        else if (this.paused) {
            gtx.fillStyle = "#000000";
            gtx.fillRect(0, 0, gtx.canvas.width, gtx.canvas.height);
            gtx.font = "30px PressStart2P";
            gtx.fillStyle = "#FFFFFF";
            var pauseTextWidth = gtx.measureText(this.pauseText).width;
            var pauseTextXpos = (gtx.canvas.width / 2) - (pauseTextWidth / 2);
            gtx.fillText(this.pauseText, pauseTextXpos, gtx.canvas.height / 2);
        }
    }
    /**
     * Renders the given grid on the given context with the given active piece as a preview.
     * @param {*} gtx
     * @param {any[][]} grid
     * @param {any[]} activePiece
     */
    renderPreview(gtx, grid, activePiece) {
        var cellWidth = Math.floor(gtx.canvas.width / grid.length);
        var cellHeight = Math.floor(gtx.canvas.height / grid[0].length);
        gtx.fillStyle = "#FFFFFF";
        gtx.fillRect(0, 0, gtx.canvas.width, gtx.canvas.height);
        var width = grid.length;
        var height = grid[0].length;
        var colour = activePiece.createPolyColor();
        for (var i = 0; i < activePiece.length; i++) {
            this.renderBlock(gtx, activePiece.blocks[i].x * cellWidth, activePiece.blocks[i].y * cellHeight, cellWidth, cellHeight, colour);
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
                !(x >= 0 && x < this.gridWidth) ||
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
    tickPiece() {
        if (!this.moveCurrentPiece(0, 1)) {
            for (var i = 0; i < this.currentPiece.length; i++) {
                this.gameGrid[this.currentPiece.blocks[i].x][this.currentPiece.blocks[i].y] = this.currentPiece.createPolyColor();
            }
            this.checkLines();
            this.currentPiece = this.nextPiece;
            // translate piece to middle of the grid
            if (!this.moveCurrentPiece(this.gridWidth / 2, 0)) {
                // game over handled by next tick so a render can happen.
                this.gameOver = true;
            }
            else {
                this.nextPiece = this.spawnPiece();
            }
        }
    }
    writeStatus(message) {
        const statusElement = document.getElementById("status");
        if (statusElement) {
            statusElement.innerHTML = message;
        }
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
        var removedLines = new Array();
        for (var j = this.gridHeight - 1; j >= 0; j--) {
            var clearLine = true;
            for (var i = 0; i < this.gridWidth; i++) {
                if (this.gameGrid[i][j] == 0) {
                    clearLine = false;
                    break;
                }
            }
            if (clearLine) {
                removedLines.push(j);
            }
        }
        if (removedLines.length > 0) {
            this.linesToRemove = removedLines;
            this.removingLinesFrames = this.removingLinesFramesDelay;
            return true;
        }
        return false;
    }
    removeLines() {
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
    dropPiece() {
        while (this.moveCurrentPiece(0, 1)) { }
        this.tickPiece();
    }
    /**
     * Rotates the current piece clockwise. Returns true if the move was possible.
     */
    rotateCurrentPieceClockwise() {
        var clone = this.currentPiece.rotateClockwise();
        var canMovePiece = true;
        for (var i = 0; i < clone.length; i++) {
            var x = clone.blocks[i].x;
            var y = clone.blocks[i].y;
            if (y < 0) {
                y = 0;
            }
            if (y == this.gridHeight ||
                !(x >= 0 && x < this.gridWidth) ||
                this.gameGrid[x][y] != 0) {
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
            var x = clone.blocks[i].x;
            var y = clone.blocks[i].y;
            if (y < 0) {
                y = 0;
            }
            if (y == this.gridHeight ||
                !(x >= 0 && x < this.gridWidth) ||
                this.gameGrid[x][y] != 0) {
                canMovePiece = false;
            }
        }
        if (canMovePiece) {
            this.currentPiece = clone;
        }
        return canMovePiece;
    }
    rebuildGtx() {
        this.mainGtx = document.getElementById("gtx").getContext("2d");
        this.previewGtx = document.getElementById("preview_gtx").getContext("2d");
    }
    startGame() {
        this.rebuildGtx();
        this.currentPiece = this.spawnPiece();
        this.moveCurrentPiece(this.gridWidth / 2, 0);
        this.nextPiece = this.spawnPiece();
        setInterval(this.tick, 17);
    }
}
