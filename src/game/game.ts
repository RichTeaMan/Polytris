import { Poly } from "./poly";
import * as $ from "jquery";
import { getRandomInt } from "./utilities";

export class PolytrisGame {

    gridWidth: number;
    gridHeight: number;

    logicTicks = 53;
    currentTick = 0;

    linesCleared = 0;
    score = 0;
    level = 0;

    paused = false;
    gameOver = false;
    gameOverPromptShown = false;

    gameGrid: any[][];
    pieces: Poly[];
    mainGtx: CanvasRenderingContext2D;
    previewGtx: CanvasRenderingContext2D;
    currentPiece: Poly;
    nextPiece: Poly;

    removingLinesFrames = 0;
    linesToRemove: number[] = undefined;

    pauseText = "Paused";
    gameOverText = "Game Over";

    /** The total number of frames to remove lines for. */
    removingLinesFramesDelay = 50;

    constructor(gridWidth: number, gridHeight: number, pieces: Poly[]) {

        this.gridWidth = gridWidth;
        this.gridHeight = gridHeight;
        this.pieces = pieces;
        this.gameGrid = PolytrisGame.createGrid(this.gridWidth, this.gridHeight);
    }

    static createGrid(width: number, height: number): string[][] {
        const gameGrid = new Array(width);
        for (let i = 0; i < width; i++) {
            gameGrid[i] = new Array(height);
            for (let j = 0; j < height; j++) {
                gameGrid[i][j] = 0;
            }
        }
        return gameGrid;
    }

    spawnPiece(): Poly {
        const pieceId = getRandomInt(0, this.pieces.length);
        const piece = this.pieces[pieceId];

        const newPiece = piece.clonePoly();

        return newPiece;
    }

    static renderBlock(gtx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, colour: string) {

        const margin = 2;

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
    renderGame(gtx: CanvasRenderingContext2D, grid: any[], activePiece: Poly) {

        const cellWidth = gtx.canvas.width / grid.length;
        const cellHeight = gtx.canvas.height / grid[0].length;

        gtx.fillStyle = "#FFFFFF";

        gtx.fillRect(0, 0, gtx.canvas.width, gtx.canvas.height);
        const width = grid.length;
        const height = grid[0].length;

        for (let i = 0; i < width; i++) {

            const xPos = Math.floor(i * cellWidth);

            for (let j = 0; j < height; j++) {

                const yPos = Math.floor(j * cellHeight);

                if (grid[i][j] === 0) {
                    gtx.fillStyle = "#FFFFFF";
                    gtx.fillRect(xPos, yPos, cellWidth, cellHeight);
                } else {
                    const blockColour: string = grid[i][j];
                    PolytrisGame.renderBlock(gtx, xPos, yPos, cellWidth, cellHeight, blockColour);
                }
            }
        }

        if (this.removingLinesFrames > 0) {

            if (Math.floor(this.removingLinesFrames / 5) % 2 == 0) {
                gtx.fillStyle = "#CCCC00";
                this.linesToRemove.forEach(lineNumber => {

                    gtx.fillRect(0, lineNumber * cellHeight, this.gridWidth * cellWidth, cellHeight);
                });
            } else {
                gtx.fillStyle = "#000000";
            }
        } else {
            const colour = activePiece.createPolyColor();
            for (let i = 0; i < activePiece.length; i++) {

                const xPos = Math.floor(activePiece.blocks[i].x * cellWidth);
                const yPos = Math.floor(activePiece.blocks[i].y * cellHeight);

                PolytrisGame.renderBlock(gtx, xPos, yPos, cellWidth, cellHeight, colour);
            }
        }

        if (this.gameOver) {
            gtx.fillStyle = "rgba(10, 10, 10, 0.9)";
            gtx.fillRect(0, 0, gtx.canvas.width, gtx.canvas.height);
            gtx.font = "30px PressStart2P";
            gtx.fillStyle = "#FFFFFF";

            const gameOverTextWidth = gtx.measureText(this.gameOverText).width;
            const gameOverTextXPosition = (gtx.canvas.width / 2) - (gameOverTextWidth / 2);

            gtx.fillText(
                this.gameOverText,
                gameOverTextXPosition,
                gtx.canvas.height / 2);

        }
        else if (this.paused) {
            gtx.fillStyle = "#000000";
            gtx.fillRect(0, 0, gtx.canvas.width, gtx.canvas.height);
            gtx.font = "30px PressStart2P";
            gtx.fillStyle = "#FFFFFF";

            const pauseTextWidth = gtx.measureText(this.pauseText).width;
            const pauseTextXPosition = (gtx.canvas.width / 2) - (pauseTextWidth / 2);

            gtx.fillText(
                this.pauseText,
                pauseTextXPosition,
                gtx.canvas.height / 2);
        }
    }

    /**
     * Renders the given grid on the given context with the given active piece as a preview.
     * @param {*} gtx
     * @param {any[][]} grid
     * @param {any[]} activePiece
     */
    static renderPreview(gtx: CanvasRenderingContext2D, grid: any[], activePiece: Poly) {
        const cellWidth = Math.floor(gtx.canvas.width / grid.length);
        const cellHeight = Math.floor(gtx.canvas.height / grid[0].length);

        gtx.fillStyle = "#FFFFFF";

        gtx.fillRect(0, 0, gtx.canvas.width, gtx.canvas.height);
        const width = grid.length;
        const height = grid[0].length;

        const colour = activePiece.createPolyColor();
        for (let i = 0; i < activePiece.length; i++) {
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
    moveCurrentPiece(xMod: number, yMod: number) {

        let canMovePiece = true;
        for (let i = 0; i < this.currentPiece.length; i++) {
            const x = this.currentPiece.blocks[i].x + xMod;
            let y = this.currentPiece.blocks[i].y + yMod;
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
            for (let i = 0; i < this.currentPiece.length; i++) {
                this.currentPiece.blocks[i].y += yMod;
                this.currentPiece.blocks[i].x += xMod;
            }
        }
        return canMovePiece;
    }

    tick = () => {

        if (this.gameOver && !this.gameOverPromptShown) {
            // game over handling
            const name = prompt("Game over. What is your name?", "");
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
            } else {
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
        PolytrisGame.renderPreview(this.previewGtx, PolytrisGame.createGrid(this.nextPiece.length, this.nextPiece.length), this.nextPiece.createPreviewPiece());

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
    }

    tickPiece() {
        if (!this.moveCurrentPiece(0, 1)) {

            for (let i = 0; i < this.currentPiece.length; i++) {
                this.gameGrid[this.currentPiece.blocks[i].x][this.currentPiece.blocks[i].y] = this.currentPiece.createPolyColor();
            }
            this.checkLines();

            this.currentPiece = this.nextPiece;
            // translate piece to middle of the grid
            if (!this.moveCurrentPiece(this.gridWidth / 2, 0)) {
                // game over handled by next tick so a render can happen.
                this.gameOver = true;
            } else {
                this.nextPiece = this.spawnPiece();
            }
        }
    }

    writeStatus(message: string) {
        const statusElement = document.getElementById("status");
        if (statusElement) {
            statusElement.innerHTML = message;
        }
    }

    calculateLineClearedBonus(linesCleared: number) {
        const base = (this.level + 1) * 25;

        const bonus = Math.floor(base * Math.pow(3.5, linesCleared - 1));
        return bonus;
    }

    calculateLevelUp() {

        let earnedLevel = Math.floor(this.linesCleared / 10);
        if (earnedLevel > 20) {
            earnedLevel = 20;
        }
        if (earnedLevel > this.level) {
            this.level = earnedLevel;

            switch (this.level) {

                case 0: this.logicTicks = 53; break;
                case 1: this.logicTicks = 49; break;
                case 2: this.logicTicks = 45; break;
                case 3: this.logicTicks = 41; break;
                case 4: this.logicTicks = 37; break;
                case 5: this.logicTicks = 33; break;
                case 6: this.logicTicks = 28; break;
                case 7: this.logicTicks = 22; break;
                case 8: this.logicTicks = 17; break;
                case 9: this.logicTicks = 11; break;
                case 10: this.logicTicks = 10; break;
                case 11: this.logicTicks = 9; break;
                case 12: this.logicTicks = 8; break;
                case 13: this.logicTicks = 7; break;
                case 14: this.logicTicks = 6; break;
                case 15: this.logicTicks = 6; break;
                case 16: this.logicTicks = 5; break;
                case 17: this.logicTicks = 5; break;
                case 18: this.logicTicks = 4; break;
                case 19: this.logicTicks = 4; break;
                case 20: this.logicTicks = 3; break;
                default: this.logicTicks = 3; break;
            }

            this.currentTick = 0;
        }
    }

    checkLines() {

        const removedLines = new Array<number>();
        for (let j = this.gridHeight - 1; j >= 0; j--) {

            let clearLine = true;
            for (let i = 0; i < this.gridWidth; i++) {
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

        let linesAdded = 0;
        let addedLineCount = this.gridHeight - 1;
        const newGameGrid = PolytrisGame.createGrid(this.gridWidth, this.gridHeight);
        for (let j = this.gridHeight - 1; j >= 0; j--) {

            let clearLine = true;
            for (let i = 0; i < this.gridWidth; i++) {
                if (this.gameGrid[i][j] == 0) {
                    clearLine = false;
                    break;
                }

            }
            if (clearLine) {
                linesAdded++;
            }
            else {
                for (let i = 0; i < this.gridWidth; i++) {
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
    rotateCurrentPieceClockwise(): boolean {

        const clone = this.currentPiece.rotateClockwise();

        let canMovePiece = true;
        for (let i = 0; i < clone.length; i++) {
            const x = clone.blocks[i].x;
            let y = clone.blocks[i].y;
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
    rotateCurrentPieceAntiClockwise(): boolean {

        const clone = this.currentPiece.rotateAntiClockwise();

        let canMovePiece = true;
        for (let i = 0; i < clone.length; i++) {
            const x = clone.blocks[i].x;
            let y = clone.blocks[i].y;
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
        this.mainGtx = (<HTMLCanvasElement>document.getElementById("gtx")).getContext("2d");
        this.previewGtx = (<HTMLCanvasElement>document.getElementById("preview_gtx")).getContext("2d");

    }

    startGame() {
        this.rebuildGtx();
        this.currentPiece = this.spawnPiece();
        this.moveCurrentPiece(this.gridWidth / 2, 0);
        this.nextPiece = this.spawnPiece();
        setInterval(this.tick, 17);
    }

}
