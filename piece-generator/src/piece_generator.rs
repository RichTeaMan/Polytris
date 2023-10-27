use std::collections::HashSet;

use crate::poly::{Block, Poly};


pub fn create_polyominoes(poly_size: usize) -> Vec<Poly> {
    // create origin point
    let mut polys = Vec::new();
    let block = Block::default();
    let mut start_poly = Poly::default();
    start_poly.blocks.push(block);

    let mut hashes = HashSet::new();
    let poly_hash = start_poly.get_hash();
    hashes.insert(poly_hash);

    polys.push(start_poly);

    for _ in 1..poly_size {
        polys = expand_polys(polys, &mut hashes);
    }

    let mut hash_polys = HashSet::new();
    let mut result_polys = Vec::new();
    for i in 0..polys.len() {
        let poly = polys[i].clone();
        if poly.length() == poly_size {
            let norm_poly = normalise_poly(&poly);
            let hash = norm_poly.get_hash();
            if !hash_polys.contains(&hash) {
                hash_polys.insert(hash);
                let center_poly = center_poly(&norm_poly);
                result_polys.push(center_poly);
            }
        }
    }
    result_polys
}

fn center_poly(poly: &Poly) -> Poly {
    // find middle block

    let mut max_x = 0;
    let mut min_x = 100000;
    let mut max_y = 0;
    let mut min_y = 100000;

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

fn normalise_poly(poly: &Poly) -> Poly {
    // find most negative x and y
    let mut neg_x = 0;
    let mut neg_y = 0;
    for i in 0..poly.length() {
        if poly.blocks[i].x < neg_x {
            neg_x = poly.blocks[i].x;
        }
        if poly.blocks[i].y < neg_y {
            neg_y = poly.blocks[i].y;
        }
    }

    // add mod back to blocks
    let mut new_blocks = Vec::new();
    for block in &poly.blocks {
        new_blocks.push(Block::new(
            block.x + i32::abs(neg_x),
            block.y + i32::abs(neg_y),
        ));
    }

    // left align piece
    let mut small_x = poly.length() as i32;
    let mut small_y = poly.length() as i32;

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
            block.x - i32::abs(small_x),
            block.y - i32::abs(small_y),
        ));
    }
    Poly::from_blocks(norm_blocks)
}

fn attempt_to_grow_poly(
    poly: &Poly,
    block: Block,
    hashes: &mut HashSet<String>,
    mut result_polys: HashSet<Poly>,
) -> HashSet<Poly> {
    // check if block already exists in poly
    for i in 0..poly.length() {
        // existing block
        let existing_block = &poly.blocks[i];
        if existing_block.x == block.x && existing_block.y == block.y {
            return result_polys;
        }
    }

    let mut blocks = poly.blocks.clone();
    blocks.push(block);
    let mut new_poly = Poly::from_blocks(blocks);
    new_poly = normalise_poly(&new_poly);

    let mut add_poly = true;
    let mut new_hashes = Vec::new();
    for _i in 0..4 {
        let hash = new_poly.get_hash();
        if hashes.contains(&hash) {
            add_poly = false;
        } else {
            new_hashes.push(hash);
            new_poly = new_poly.rotate_clockwise();
            new_poly = normalise_poly(&new_poly);
        }
    }

    for hash in new_hashes {
        hashes.insert(hash);
    }

    if add_poly {
        result_polys.insert(new_poly);
    }

    result_polys
}

fn expand_polys(start_polys: Vec<Poly>, hashes: &mut HashSet<String>) -> Vec<Poly> {
    let mut result_polys = HashSet::new();
    result_polys.extend(start_polys.clone());

    // iterate through all polys
    for poly in start_polys {
        // iterate through all blocks in poly
        for i in 0..poly.length() {
            // add a block in all cardinalities
            // left
            result_polys = attempt_to_grow_poly(
                &poly,
                Block::new(poly.blocks[i].x + 1, poly.blocks[i].y),
                hashes,
                result_polys,
            );

            // up
            result_polys = attempt_to_grow_poly(
                &poly,
                Block::new(poly.blocks[i].x, poly.blocks[i].y + 1),
                hashes,
                result_polys,
            );

            // right
            result_polys = attempt_to_grow_poly(
                &poly,
                Block::new(poly.blocks[i].x - 1, poly.blocks[i].y),
                hashes,
                result_polys,
            );

            // down
            result_polys = attempt_to_grow_poly(
                &poly,
                Block::new(poly.blocks[i].x, poly.blocks[i].y - 1),
                hashes,
                result_polys,
            );
        }
    }

    Vec::from_iter(result_polys)
    //let mut res = Vec::new();
    //for poly in result_polys {
    //    // eurgh. must be a better way
    //    res.push(poly.clone());
    //}
    //res
}

#[cfg(test)]
mod tests {

    use super::*;

    #[test]
    fn poly_4_test() {
        assert_eq!(create_polyominoes(4).len(), 7);
    }

    #[test]
    fn poly_5_test() {
        assert_eq!(create_polyominoes(5).len(), 18);
    }

    #[test]
    fn poly_6_test() {
        assert_eq!(create_polyominoes(6).len(), 60);
    }

    #[test]
    fn poly_7_test() {
        assert_eq!(create_polyominoes(7).len(), 196);
    }

    #[test]
    fn poly_8_test() {
        assert_eq!(create_polyominoes(8).len(), 704);
    }

    #[test]
    fn poly_9_test() {
        assert_eq!(create_polyominoes(9).len(), 2500);
    }

    #[test]
    fn poly_12_test() {
        assert_eq!(create_polyominoes(12).len(), 126_759);
    }
}
