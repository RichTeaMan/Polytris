use std::collections::HashSet;

use crate::poly::{Block, Poly};

pub fn createPolyominoes(polySize: usize) -> Vec<Poly> {
    // create origin point
    let mut polys = Vec::new();
    let mut block = Block::default();
    let mut startPoly = Poly::default();
    startPoly.blocks.push(block);

    let mut hashes = HashSet::new();
    let poly_hash = startPoly.getHash();
    hashes.insert(poly_hash);

    polys.push(startPoly);

    for _ in 1..polySize {
        polys = expandPolys(polys, &mut hashes);
    }

    let mut hashPolys = HashSet::new();
    let mut resultPolys = Vec::new();
    for i in 0..polys.len() {
        let poly = polys[i].clone();
        if poly.length() == polySize {
            let norm_poly = normalisePoly(&poly);
            let hash = norm_poly.getHash();
            if !hashPolys.contains(&hash) {
                hashPolys.insert(hash);
                let center_poly = centerPoly(&norm_poly);
                resultPolys.push(center_poly);
            }
        }
    }
    resultPolys
}

fn centerPoly(poly: &Poly) -> Poly {
    // find middle block

    let mut maxX = 0;
    let mut minX = 100000;
    let mut maxY = 0;
    let mut minY = 100000;

    for block in &poly.blocks {
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
    }

    //let middleX = Math.floor((maxX - minX) / 2);
    //let middleY = Math.floor((maxY - minY) / 2);
    let middleX = (maxX - minX) / 2;
    let middleY = (maxY - minY) / 2;

    // new blocks
    let mut new_blocks = Vec::new();
    for block in &poly.blocks {
        new_blocks.push(Block::new(block.x - middleX, block.y - middleY));
    }
    Poly::from_blocks(new_blocks)
}

fn normalisePoly(poly: &Poly) -> Poly {
    // find most negative x and y
    let mut negX = 0;
    let mut negY = 0;
    for i in 0..poly.length() {
        if (poly.blocks[i].x < negX) {
            negX = poly.blocks[i].x;
        }
        if (poly.blocks[i].y < negY) {
            negY = poly.blocks[i].y;
        }
    }

    // add mod back to blocks
    let mut new_blocks = Vec::new();
    for block in &poly.blocks {
        new_blocks.push(Block::new(
            block.x + i32::abs(negX),
            block.y + i32::abs(negY),
        ));
    }

    // left align piece
    let mut smallX = poly.length() as i32;
    let mut smallY = poly.length() as i32;

    for block in &new_blocks {
        if block.x < smallX {
            smallX = block.x;
        }
        if block.y < smallY {
            smallY = block.y;
        }
    }

    // norm blocks
    let mut norm_blocks = Vec::new();
    for block in new_blocks {
        norm_blocks.push(Block::new(
            block.x - i32::abs(smallX),
            block.y - i32::abs(smallY),
        ));
    }
    Poly::from_blocks(norm_blocks)
}

fn attemptToGrowPoly(
    poly: &Poly,
    block: Block,
    mut hashes: &mut HashSet<String>,
    mut resultPolys: HashSet<Poly>,
) -> HashSet<Poly> {
    // check if block already exists in poly
    for i in 0..poly.length() {
        // existing block
        let eB = &poly.blocks[i];
        if (eB.x == block.x && eB.y == block.y) {
            return resultPolys;
        }
    }

    let mut blocks = poly.blocks.clone();
    blocks.push(block);
    let mut newPoly = Poly::from_blocks(blocks);
    newPoly = normalisePoly(&newPoly);

    let mut addPoly = true;
    let mut newHashes = Vec::new();
    for i in 0..4 {
        let hash = newPoly.getHash();
        if (hashes.contains(&hash)) {
            addPoly = false;
        } else {
            newHashes.push(hash);
            newPoly = newPoly.rotateClockwise();
            newPoly = normalisePoly(&newPoly);
        }
    }

    for hash in newHashes {
        hashes.insert(hash);
    }

    if (addPoly) {
        resultPolys.insert(newPoly);
    }

    resultPolys
}

fn expandPolys(startPolys: Vec<Poly>, mut hashes: &mut HashSet<String>) -> Vec<Poly> {
    let mut resultPolys = HashSet::new();
    resultPolys.extend(startPolys.clone());

    // iterate through all polys
    for poly in startPolys {
        // iterate through all blocks in poly
        for i in 0..poly.length() {
            // add a block in all cardinalities
            // left
            resultPolys = attemptToGrowPoly(
                &poly,
                Block::new(poly.blocks[i].x + 1, poly.blocks[i].y),
                hashes,
                resultPolys,
            );

            // up
            resultPolys = attemptToGrowPoly(
                &poly,
                Block::new(poly.blocks[i].x, poly.blocks[i].y + 1),
                hashes,
                resultPolys,
            );

            // right
            resultPolys = attemptToGrowPoly(
                &poly,
                Block::new(poly.blocks[i].x - 1, poly.blocks[i].y),
                hashes,
                resultPolys,
            );

            // down
            resultPolys = attemptToGrowPoly(
                &poly,
                Block::new(poly.blocks[i].x, poly.blocks[i].y - 1),
                hashes,
                resultPolys,
            );
        }
    }

    let mut res = Vec::new();
    for poly in resultPolys {
        // eurgh. must be a better way
        res.push(poly.clone());
    }
    res
}


#[cfg(test)]
mod tests {

    use super::*;

    #[test]
    fn poly_4_test() {
        assert_eq!(createPolyominoes(4).len(), 7);
    }

    #[test]
    fn poly_5_test() {
        assert_eq!(createPolyominoes(5).len(), 18);
    }

    #[test]
    fn poly_6_test() {
        assert_eq!(createPolyominoes(6).len(), 60);
    }

    #[test]
    fn poly_7_test() {
        assert_eq!(createPolyominoes(7).len(), 196);
    }
    
    #[test]
    fn poly_8_test() {
        assert_eq!(createPolyominoes(8).len(), 704);
    }

    #[test]
    fn poly_9_test() {
        assert_eq!(createPolyominoes(9).len(), 2500);
    }

    #[test]
    fn poly_12_test() {
        assert_eq!(createPolyominoes(12).len(), 126_759);
    }
}