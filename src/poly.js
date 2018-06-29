"use strict";
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
        clone._hashCode = this.getHashCode();
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
    createPreviewPiece() {
        var previewPiece = this.clonePoly();
        for (var i = 0; i < previewPiece.blocks.length; i++) {
            var block = previewPiece.blocks[i];
            block.x += Math.floor(previewPiece.blocks.length / 2) - 1;
            block.y += Math.floor(previewPiece.blocks.length / 2) - 1;
        }
        return previewPiece;
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
