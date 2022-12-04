use std::hash::Hash;

use serde::{Serialize, Deserialize};

#[derive(Serialize, Deserialize, Debug, Default, Clone)]
pub struct Block {
    pub x: i32,
    pub y: i32,

}

impl Block {

    pub fn new(x: i32, y: i32) -> Block {
        Block {
            x,y
        }
    }
}

#[derive(Serialize, Deserialize, Debug, Default, Clone)]
pub struct Poly {
    pub blocks: Vec<Block>,

    _hashCode: i32,

}

impl Poly{

    pub fn from_blocks(blocks: Vec<Block>) -> Poly {
        Poly {
            blocks,
            ..Default::default()
        }
    }

    pub fn length(&self) -> usize {
        self.blocks.len()
    }

    /*
    clonePoly(): Poly {
        // ensure current piece is deeply cloned
        var cloneBlocks = new Array<Block>(this.length);
        for (var i = 0; i < this.length; i++) {
            var block = new Block(this.blocks[i].x, this.blocks[i].y);
            cloneBlocks[i] = block;
        }
        var clone = new Poly();
        clone.blocks = cloneBlocks;
        clone._hashCode = this.getHashCode();
        return clone;
    }

    createArray(): Poly[] {
        var polyArray = new Array<Poly>();
        polyArray.push(this);
        return polyArray;
    }
    */

    pub fn rotateClockwise(&self) -> Poly {

        let mut clone = self.clone();

        // rotate about the first block
        for  i in 1..clone.length() {
            let x = clone.blocks[i].x - clone.blocks[0].x;
            let y = clone.blocks[i].y - clone.blocks[0].y;
            clone.blocks[i].x = -y + clone.blocks[0].x;
            clone.blocks[i].y = x + clone.blocks[0].y;
        }
        clone
    }

    pub fn rotateAntiClockwise(&self) -> Poly {

        let mut clone = self.clone();

        for i in 1..clone.length() {
            let x = clone.blocks[i].x - clone.blocks[0].x;
            let y = clone.blocks[i].y - clone.blocks[0].y;
            clone.blocks[i].x = y + clone.blocks[0].x;
            clone.blocks[i].y = -x + clone.blocks[0].y;
        }
        clone
    }

    /**
     * Creates a hex string colour for a given poly. The colour will be
     * consistent as the poly moves and rotates.
     * @param poly 
     */
    pub fn create_poly_color() -> String {
        "#ffffff".to_string()
    }
    /*
    pub fn createPolyColor() -> string {
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
    */

    /*
    createPreviewPiece(): Poly {
        var previewPiece = this.clonePoly();
        for (var i = 0; i < previewPiece.blocks.length; i++) {
            var block = previewPiece.blocks[i];
            block.x += Math.floor(previewPiece.blocks.length / 2) - 1;
            block.y += Math.floor(previewPiece.blocks.length / 2) - 1;
        }
        return previewPiece;
    }
    */

    pub fn getHash(&self) -> String {
        let mut block_hashes = Vec::new();
        for block in &self.blocks {
            let block_hash = serde_json::to_string(&block).unwrap();
            block_hashes.push(block_hash);
        }
        block_hashes.sort();
        serde_json::to_string(&block_hashes).unwrap()
    }

    /*
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
*/
}

impl PartialEq for Poly {
    fn eq(&self, other: &Self) -> bool {
        self.getHash() == other.getHash()
    }
}
impl Eq for Poly {
}
impl Hash for Poly {
    fn hash<H: std::hash::Hasher>(&self, state: &mut H) {
        self.getHash().hash(state);
    }
}