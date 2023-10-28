use std::{
    fs::File,
    io::{self, BufWriter, Write},
};

use poly::Poly;

mod piece_generator;
mod poly;

use clap::Parser;

/// Polyominoes generator.
#[derive(Parser, Debug)]
#[command(author, version, about, long_about = None)]
struct Args {
    /// n value of polyominoes to generate.
    #[arg(short, long, default_value_t = 4)]
    n: u8,
}

fn main() {

    let args = Args::parse();

    let size: usize = args.n.into();
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

    let bin_file_res = File::create(format!("poly-{size}.bin"));

    println!("Writing binary...");
    if let Ok(file) = bin_file_res {
        let writer = BufWriter::new(file);
        write_binary(writer, &pieces);
    } else {
        panic!("Cannot create file.");
    }

    println!("Generation complete.");
}

fn write_binary<W>(mut writer: W, polyominoes: &Vec<Poly>) -> io::Result<()>
where
    W: io::Write,
{
    if polyominoes.is_empty() {
        panic!("Polyominoes cannot be empty.");
    }
    let poly_size = polyominoes.first().unwrap().length();

    let header = [poly_size as u8, b'\n', polyominoes.len() as u8, b'\n'];

    writer.write_all(&header)?;

    for poly in polyominoes {
        if poly.length() != poly_size {
            panic!("Polyomino of irregular length.");
        }
        let poly_line_vec = poly
            .blocks
            .iter()
            .map(|b| vec![b.x as u8, b.y as u8])
            .flatten()
            .collect::<Vec<u8>>();
        let poly_line = poly_line_vec.as_slice();
        writer.write_all(&poly_line)?;
        writer.write_all(b"\n")?;
    }

    Ok(())
}
