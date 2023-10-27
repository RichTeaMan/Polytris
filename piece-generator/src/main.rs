use std::{fs::File, io::BufWriter};

mod piece_generator;
mod poly;

fn main() {
    let size = 16;
    println!("Piece generator, generating {size} pieces.");

    let pieces = piece_generator::create_polyominoes(size);
    println!("Created {l} pieces.", l = pieces.len());

    let file_res = File::create(format!("poly-{size}.json"));

    println!("Writing JSON...");
    if let Ok(file) = file_res {
        let writer = BufWriter::new(file);
        serde_json::to_writer(writer, &pieces);
    } else {
        panic!("Cannot create file.");
    }

    let pp_file_res = File::create(format!("pp_poly-{size}.json"));

    println!("Writing pretty JSON...");
    if let Ok(file) = pp_file_res {
        let writer = BufWriter::new(file);
        serde_json::to_writer_pretty(writer, &pieces);
    } else {
        panic!("Cannot create file.");
    }

    println!("Generation complete.");
}
