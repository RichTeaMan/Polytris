use std::hash::Hash;

use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug, Default, Clone)]
pub struct Block {
    pub x: i8,
    pub y: i8,
}

impl Block {
    pub fn new(x: i8, y: i8) -> Block {
        Block { x, y }
    }
}

#[derive(Serialize, Deserialize, Debug, Default, Clone)]
pub struct Poly {
    #[serde(rename = "b")]
    pub blocks: Vec<Block>,
}

impl Poly {
    pub fn from_blocks(blocks: Vec<Block>) -> Poly {
        Poly {
            blocks,
            ..Default::default()
        }
    }

    pub fn length(&self) -> usize {
        self.blocks.len()
    }

    pub fn rotate_clockwise(&self) -> Poly {
        let mut clone = self.clone();

        // rotate about the first block
        for i in 1..clone.length() {
            let x = clone.blocks[i].x - clone.blocks[0].x;
            let y = clone.blocks[i].y - clone.blocks[0].y;
            clone.blocks[i].x = -y + clone.blocks[0].x;
            clone.blocks[i].y = x + clone.blocks[0].y;
        }
        clone
    }

    pub fn rotate_anti_clockwise(&self) -> Poly {
        let mut clone = self.clone();

        for i in 1..clone.length() {
            let x = clone.blocks[i].x - clone.blocks[0].x;
            let y = clone.blocks[i].y - clone.blocks[0].y;
            clone.blocks[i].x = y + clone.blocks[0].x;
            clone.blocks[i].y = -x + clone.blocks[0].y;
        }
        clone
    }

    pub fn normalise(&self) -> Poly {
        // find most negative x and y
        let mut neg_x = 0;
        let mut neg_y = 0;
        for i in 0..self.length() {
            if self.blocks[i].x < neg_x {
                neg_x = self.blocks[i].x;
            }
            if self.blocks[i].y < neg_y {
                neg_y = self.blocks[i].y;
            }
        }

        // add mod back to blocks
        let mut new_blocks = Vec::new();
        for block in &self.blocks {
            new_blocks.push(Block::new(
                block.x + i8::abs(neg_x),
                block.y + i8::abs(neg_y),
            ));
        }

        // left align piece
        let mut small_x = self.length() as i8;
        let mut small_y = self.length() as i8;

        for block in &new_blocks {
            if block.x < small_x {
                small_x = block.x;
            }
            if block.y < small_y {
                small_y = block.y;
            }
        }

        // norm blocks
        let mut norm_blocks = Vec::new();
        for block in new_blocks {
            norm_blocks.push(Block::new(
                block.x - i8::abs(small_x),
                block.y - i8::abs(small_y),
            ));
        }
        Self::center_poly(&Poly::from_blocks(norm_blocks))
    }

    fn center_poly(poly: &Poly) -> Poly {
        // find middle block

        let mut max_x = 0;
        let mut min_x = i8::MAX;
        let mut max_y = 0;
        let mut min_y = i8::MAX;

        for block in &poly.blocks {
            if block.x > max_x {
                max_x = block.x;
            }
            if block.x < min_x {
                min_x = block.x;
            }
            if block.y > max_y {
                max_y = block.y;
            }
            if block.y < min_y {
                min_y = block.y;
            }
        }

        let middle_x = (max_x - min_x) / 2;
        let middle_y = (max_y - min_y) / 2;

        // new blocks
        let mut new_blocks = Vec::new();
        for block in &poly.blocks {
            new_blocks.push(Block::new(block.x - middle_x, block.y - middle_y));
        }
        Poly::from_blocks(new_blocks)
    }

    pub fn get_hash(&self) -> String {
        let mut block_hashes = Vec::new();
        for block in &self.blocks {
            let block_hash = format!("{x},{y}", x = block.x, y = block.y);
            block_hashes.push(block_hash);
        }
        block_hashes.sort();
        block_hashes.join("|")
    }
}

impl PartialEq for Poly {
    fn eq(&self, other: &Self) -> bool {
        self.get_hash() == other.get_hash()
    }
}
impl Eq for Poly {}
impl Hash for Poly {
    fn hash<H: std::hash::Hasher>(&self, state: &mut H) {
        self.get_hash().hash(state);
    }
}
