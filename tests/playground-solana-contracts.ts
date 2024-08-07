import * as anchor from '@coral-xyz/anchor';
import { Program, BN } from '@coral-xyz/anchor';
import { Keypair, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { PlaygroundSolanaContracts } from '../target/types/playground_solana_contracts';
import { expect } from 'chai';

describe('playground_solana_contracts', () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.PlaygroundSolanaContracts as Program<PlaygroundSolanaContracts>;

  it('Sets and changes name!', async () => {
    const [userStatsPDA, _] = await PublicKey.findProgramAddress(
      [
        anchor.utils.bytes.utf8.encode('user-stats'),
        provider.wallet.publicKey.toBuffer(),
      ],
      program.programId
    );

    await program.methods
      .createUserStats('brian')
      .accounts({
        user: provider.wallet.publicKey,
        userStats: userStatsPDA,
      })
      .rpc();

    let userStats = await program.account.userStats.fetch(userStatsPDA);
    expect(userStats.name).to.equal('brian');

    await program.methods
      .changeUserName('tom')
      .accounts({
        user: provider.wallet.publicKey,
        userStats: userStatsPDA,
      })
      .rpc();

    userStats = await program.account.userStats.fetch(userStatsPDA);
    expect(userStats.name).to.equal('tom');
  });

  it('Fails to change name from another wallet', async () => {
      const [userStatsPDA, _] = await PublicKey.findProgramAddress(
        [
          anchor.utils.bytes.utf8.encode('user-stats'),
          provider.wallet.publicKey.toBuffer(),
        ],
        program.programId
      );

      const otherWallet = Keypair.generate();
      const airdropSignature = await provider.connection.requestAirdrop(
        otherWallet.publicKey,
        LAMPORTS_PER_SOL
      );
      await provider.connection.confirmTransaction(airdropSignature);

      try {
        await program.methods
          .changeUserName('alice')
          .accounts({
            user: otherWallet.publicKey,
            userStats: userStatsPDA,
          })
          .signers([otherWallet])
          .rpc();
          expect.fail('Should have thrown an error');
      } catch (err) {
        // Ensure the error is related to unauthorized access
        console.log('xxx err.message', err.message);
        expect(err.message).to.include(
            'AnchorError caused by account: user_stats. ' +
            'Error Code: ConstraintSeeds. ' +
            'Error Number: 2006. ' +
            'Error Message: A seeds constraint was violated.');
      }

      const userStats = await program.account.userStats.fetch(userStatsPDA);
      expect(userStats.name).to.not.equal('alice');
    });


  it('Fails to create user stats with an overly long name', async () => {
  const [userStatsPDA, _] = await PublicKey.findProgramAddress(
    [
      anchor.utils.bytes.utf8.encode('user-stats'),
      provider.wallet.publicKey.toBuffer(),
    ],
    program.programId
  );

  try {
    await program.methods
      .createUserStats('a'.repeat(201)) // 201 characters long
      .accounts({
        user: provider.wallet.publicKey,
        userStats: userStatsPDA,
      })
      .rpc();
    expect.fail('Should have thrown an error');
  } catch (err) {
    // Expect an error related to argument validation
      console.log('xxx err.message', err.message);
    expect(err.message).to.include('Account should not exist');
  }

  try {
    await program.account.userStats.fetch(userStatsPDA);
    expect.fail('Should have thrown an error');
  } catch (err) {
    // The expected error message when the account does not exist
    expect(err.message).to.include('Account should not exist');
  }
});

});
