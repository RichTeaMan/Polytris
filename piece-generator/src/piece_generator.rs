use std::collections::HashSet;

use crate::poly::{Block, Poly};

pub fn create_polyominoes(poly_size: usize) -> Vec<Poly> {
    let mut polys = Vec::new();
    let block = Block::default();
    let mut start_poly = Poly::default();
    start_poly.blocks.push(block);
    polys.push(start_poly);

    for _ in 2..=poly_size {
        polys = create_polyominoes_from_previous(polys);
    }
    polys
}

pub fn create_polyominoes_from_previous(polys: Vec<Poly>) -> Vec<Poly> {
    let mut hashes = HashSet::new();
    expand_polys(polys, &mut hashes)
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
    let mut new_poly = Poly::from_blocks(blocks).normalise();

    let mut new_hashes = Vec::new();
    let mut add_poly = true;
    for i in 0..4 {
        let hash = new_poly.get_hash();
        if !hashes.contains(&hash) {
            new_hashes.push(hash);
        } else {
            add_poly = false;
            break;
        }

        if i != 3 {
            new_poly = new_poly.rotate_clockwise().normalise();
        }
    }

    if add_poly {
        result_polys.insert(new_poly);
        for h in new_hashes {
            hashes.insert(h);
        }
    }

    result_polys
}

fn expand_polys(start_polys: Vec<Poly>, hashes: &mut HashSet<String>) -> Vec<Poly> {
    let mut result_polys = HashSet::new();

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
