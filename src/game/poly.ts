
export class Block {
    public x: number;
    public y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
}

/**
 * Poly !!!!.
 */
export class Poly {
    blocks: Array<Block>;

    _hashCode: number = 0;

    constructor() {
        this.blocks = new Array<Block>();
        this._hashCode = undefined;
    }

    static fromBlocks(blocks: Block[]): Poly {
        const poly = new Poly();
        poly.blocks = blocks;
        return poly;
    }

    get length(): number {
        return this.blocks.length;
    }

    clonePoly(): Poly {
        // ensure current piece is deeply cloned
        const cloneBlocks = new Array<Block>(this.length);
        for (let i = 0; i < this.length; i++) {
            const block = new Block(this.blocks[i].x, this.blocks[i].y);
            cloneBlocks[i] = block;
        }
        const clone = new Poly();
        clone.blocks = cloneBlocks;
        clone._hashCode = this.getHashCode();
        return clone;
    }

    createArray(): Poly[] {
        const polyArray = new Array<Poly>();
        polyArray.push(this);
        return polyArray;
    }

    rotateClockwise(): Poly {

        const clone = this.clonePoly();

        // rotate about the first block
        for (let i = 1; i < clone.length; i++) {
            const x = clone.blocks[i].x - clone.blocks[0].x;
            const y = clone.blocks[i].y - clone.blocks[0].y;
            clone.blocks[i].x = -y + clone.blocks[0].x;
            clone.blocks[i].y = x + clone.blocks[0].y;
        }
        return clone;
    }

    rotateAntiClockwise(): Poly {

        const clone = this.clonePoly();

        for (let i = 1; i < clone.length; i++) {
            const x = clone.blocks[i].x - clone.blocks[0].x;
            const y = clone.blocks[i].y - clone.blocks[0].y;
            clone.blocks[i].x = y + clone.blocks[0].x;
            clone.blocks[i].y = -x + clone.blocks[0].y;
        }
        return clone;
    }

    /**
     * Creates a hex string colour for the poly. The colour will be
     * consistent as the poly moves and rotates.
     */
    createPolyColor(): string {
        const hashCode = this.getHashCode();
        let color = Math.abs(hashCode);
        const limit = 13777215;
        if (color > limit) {
            color = color % limit;
        }
        let code = color.toString(16);
        while (code.length < 6) {
            code = "0" + code;
        }
        return "#" + code;
    }

    createPreviewPiece(): Poly {
        const previewPiece = this.clonePoly();
        for (let i = 0; i < previewPiece.blocks.length; i++) {
            const block = previewPiece.blocks[i];
            block.x += Math.floor(previewPiece.blocks.length / 2) - 1;
            block.y += Math.floor(previewPiece.blocks.length / 2) - 1;
        }
        return previewPiece;
    }

    getHash(): String {
        const blockHashes = new Array();
        for (let i = 0; i < this.length; i++) {
            const polyHash = JSON.stringify(this.blocks[i]);
            blockHashes.push(polyHash);
        }
        return JSON.stringify(Array.from(blockHashes).sort());
    }

    getHashCode(): number {

        if (!this._hashCode) {

            let hashCode = 0;
            const hashStr = this.getHash();
            if (hashStr.length == 0) return hashCode;
            for (let i = 0; i < hashStr.length; i++) {
                const char = hashStr.charCodeAt(i);
                hashCode = ((hashCode << 5) - hashCode) + char;
                hashCode = hashCode & hashCode; // Convert to 32bit integer
            }
            this._hashCode = hashCode;
        }
        return this._hashCode;
    }
}
