use anchor_lang::prelude::*;

declare_id!("7AwuU7HNHrE2GgS4tRdZLdnJmG4Pz5HjgDkd7fDVtoLK");

#[program]
pub mod playground_solana_contracts {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
