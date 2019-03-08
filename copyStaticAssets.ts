import * as shell from "shelljs";

shell.cp("-R", "src/public/js/lib", "dist/public/js/");
shell.cp("-R", "src/public/fonts", "dist/public/");
shell.cp("-R", "src/public/images", "dist/public/");

shell.cp("dist/utilities.js", "dist/public/js/.");
shell.cp("dist/poly.js", "dist/public/js/.");
shell.cp("dist/pieceGenerator.js", "dist/public/js/.");
shell.cp("dist/game.js", "dist/public/js/.");

shell.cp("dist/utilities.js.map", "dist/public/js/.");
shell.cp("dist/poly.js.map", "dist/public/js/.");
shell.cp("dist/pieceGenerator.js.map", "dist/public/js/.");
shell.cp("dist/game.js.map", "dist/public/js/.");
