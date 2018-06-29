
class PieceGenerator {

    public createPolyominoes(polySize: number): Poly[] {

        // create origin point
        var polys = new Array<Poly>();
        var block = new Block(0, 0);
        var startPoly = new Poly();
        startPoly.blocks.push(block);

        polys.push(startPoly);

        var hashes = new Set<String>();
        hashes.add(startPoly.getHash());

        for (var i = 1; i < polySize; i++) {
            polys = this.expandPolys(polys, hashes);
        }

        var hashPolys = new Set();
        var resultPolys = new Array<Poly>();
        for (var i = 0; i < polys.length; i++) {
            var poly = polys[i].clonePoly();
            if (poly.length == polySize) {
                this.normalisePoly(poly);
                var hash = poly.getHash();
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

    private centerPoly(poly: Poly) {
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

    private normalisePoly(poly: Poly) {
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

    private attemptToGrowPoly(poly: Poly, block: Block, hashes: Set<String>, resultPolys: Set<Poly>): boolean {

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
        var newHashes = new Array<String>();
        for (var i = 0; i < 4; i++) {

            var hash = newPoly.getHash();
            if (hashes.has(hash)) {
                addPoly = false;
            } else {
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

    private expandPolys(startPolys: Poly[], hashes: Set<String>): Poly[] {

        var resultPolys = new Set<Poly>(startPolys);

        // iterate through all polys
        for (var p = 0; p < startPolys.length; p++) {
            var poly = startPolys[p];

            var polyHash = poly.getHash();

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

}
