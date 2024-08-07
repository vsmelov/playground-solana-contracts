use anchor_lang::prelude::*;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod playground_solana_contracts {
    use super::*;

    pub fn create_user_stats(ctx: Context<CreateUserStats>, name: String) -> Result<()> {
        let user_stats = &mut ctx.accounts.user_stats;
        user_stats.level = 0;
        if name.as_bytes().len() > 200 {
            return err!(ErrorCode::NameIsTooLong);
        }
        user_stats.name = name;
        user_stats.bump = ctx.bumps.user_stats;
        user_stats.bump = ctx.bumps.user_stats;
        Ok(())
    }

    pub fn change_user_name(ctx: Context<ChangeUserName>, new_name: String) -> Result<()> {
        if new_name.as_bytes().len() > 200 {
            panic!(); // Simplified error handling
        }
        ctx.accounts.user_stats.name = new_name;
        Ok(())
    }
}

#[account]
pub struct UserStats {
    pub level: u16,
    pub name: String,
    pub bump: u8,
}

#[derive(Accounts)]
pub struct CreateUserStats<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(
        init,
        payer = user,
        space = 8 + 2 + 4 + 200 + 1,
        seeds = [b"user-stats", user.key().as_ref()],
        bump
    )]
    pub user_stats: Account<'info, UserStats>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ChangeUserName<'info> {
    pub user: Signer<'info>,
    #[account(mut, seeds = [b"user-stats", user.key().as_ref()], bump = user_stats.bump)]
    pub user_stats: Account<'info, UserStats>,
}


#[error_code]
pub enum ErrorCode {
    #[msg("Name is too long")]
    NameIsTooLong,
}
