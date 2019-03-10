import { getQueryParam } from "./utilities";
import { PieceGenerator } from "./pieceGenerator";
import { PolytrisGame } from "./game";

function resize(game: PolytrisGame) {
  const currentCanvasHeight = $("#game_row").height() - 10;

  const blockLength = currentCanvasHeight / game.gridHeight;

  const gameHeight = blockLength * game.gridHeight;
  const gameWidth = blockLength * game.gridWidth;

  console.log(`width: ${gameWidth} - height: ${gameHeight}`);
  $("#gtx").attr("height", gameHeight);
  $("#gtx").attr("width", gameWidth);
  game.rebuildGtx();
}

export function startGame() {
  let links = "Poly size: ";
  for (let i = 1; i < 10; i++) {
    links += `<a href="${window.location.pathname}?polySize=${i}">${i}</a>`;
  }
  $("#game_links").html(links);

  let polySize = 4;
  const polySizeQuery = getQueryParam("polySize");
  if (polySizeQuery) {
      const polySizeQueryStr = <string>polySizeQuery;
      polySize = parseInt(polySizeQueryStr, 10);
      if (isNaN(polySize)) {
          polySize = 4;
      }
  }

  const pieces = new PieceGenerator().createPolyominoes(polySize);

  const game = new PolytrisGame(10, 18, pieces);
  game.startGame();

  window.onresize = function() { resize(game); };
  resize(game);

  window.onkeydown = function (e) {
    const key = e.keyCode ? e.keyCode : e.which;

    let xMod = 0;
    let yMod = 0;

    if (!game.paused && !game.gameOver && game.removingLinesFrames == 0) {
      // up or space
      if (key == 38 || key == 32) {
        game.dropPiece();
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
        game.rotateCurrentPieceClockwise();
      }
      // Z
      else if (key == 90) {
        game.rotateCurrentPieceAntiClockwise();
      }
    }
    // P
    if (key == 80) {
      game.paused = !game.paused;
    }
    if (xMod != 0 || yMod != 0) {
      game.moveCurrentPiece(xMod, yMod);
    }
  };
}
startGame();
