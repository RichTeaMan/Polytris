use std::{
    fs::{self, File},
    io::{self, BufWriter},
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

    if let Err(e) = generate_polyominoes(args.n as usize) {
        panic!("An error occurred: {}", e);
    }
}

fn generate_polyominoes(size: usize) -> io::Result<()> {
    println!("Piece generator, generating {size} pieces.");

    let out_dir = "polyominoes";

    fs::create_dir_all(out_dir).unwrap();

    let mut previous_generation = piece_generator::create_polyominoes(2);

    for i in 3..=size {
        println!("Generating with {i} blocks...");
        let pieces = piece_generator::create_polyominoes_from_previous(previous_generation);
        println!(
            "Created {l} pieces with {n} blocks.",
            l = pieces.len(),
            n = i
        );

        let file = File::create(format!("{out_dir}/poly-{i}.json"))?;

        println!("Writing JSON...");
        let writer = BufWriter::new(file);
        serde_json::to_writer(writer, &pieces)?;

        let bin_file = File::create(format!("{out_dir}/poly-{i}.bin"))?;

        println!("Writing binary...");
        let writer = BufWriter::new(bin_file);
        write_binary(writer, &pieces)?;
        previous_generation = pieces;
    }

    println!("Generation complete.");
    Ok(())
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
            .flat_map(|b| vec![b.x as u8, b.y as u8])
            .collect::<Vec<u8>>();
        let poly_line = poly_line_vec.as_slice();
        writer.write_all(poly_line)?;
        writer.write_all(b"\n")?;
    }

    Ok(())
}
