use structopt::StructOpt;
use std::path::PathBuf;
use crate::note_generator::Note;
use crate::circuit::MixerCircuit;

#[derive(StructOpt, Debug)]
#[structopt(name = "privacy-mixer")]
enum Cli {
    /// Generate a new note for deposit
    GenerateNote {
        #[structopt(short, long)]
        recipient: String,
        
        #[structopt(short, long, parse(from_os_str))]
        output: PathBuf,
    },
    
    /// Generate a proof for withdrawal
    GenerateProof {
        #[structopt(short, long, parse(from_os_str))]
        note: PathBuf,
        
        #[structopt(short, long)]
        merkle_root: String,
        
        #[structopt(short, long)]
        merkle_proof: Vec<String>,
        
        #[structopt(short, long, parse(from_os_str))]
        output: PathBuf,
    },
}

impl Cli {
    pub fn run() -> Result<(), Box<dyn std::error::Error>> {
        let cli = Cli::from_args();
        
        match cli {
            Cli::GenerateNote { recipient, output } => {
                let note = Note::new(recipient);
                let json = serde_json::to_string_pretty(&note)?;
                std::fs::write(output, json)?;
                println!("Note generated successfully!");
            }
            
            Cli::GenerateProof { note, merkle_root, merkle_proof, output } => {
                let note_json = std::fs::read_to_string(note)?;
                let note: Note = serde_json::from_str(&note_json)?;
                
                // Generate proof
                let (nullifier, secret) = note.to_field_elements()?;
                let circuit = MixerCircuit::new(
                    // Convert inputs to field elements
                    // This is simplified - you'd need proper conversion in production
                    merkle_root.parse()?,
                    note.generate_nullifier_hash().parse()?,
                    nullifier,
                    secret,
                    merkle_proof.iter().map(|s| s.parse()).collect::<Result<_, _>>()?,
                    vec![false; 20], // Simplified - should be actual indices
                );
                
                // Generate and save proof
                let proof = circuit.generate_proof(&[])?; // You'd need actual proving key
                std::fs::write(output, hex::encode(proof))?;
                println!("Proof generated successfully!");
            }
        }
        
        Ok(())
    }
} 