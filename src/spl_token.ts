import {Connection, PublicKey, Signer} from "@solana/web3.js";
import {createMint, getOrCreateAssociatedTokenAccount, mintTo, transfer} from "@solana/spl-token";

/**
 * create mint
 */
export async function mint(
    connection: Connection,
    payer: Signer,
    mintAuthority: PublicKey,
    freezeAuthority: PublicKey,
    decimals: number,
): Promise<PublicKey> {
    return await createMint(connection, payer, mintAuthority, freezeAuthority, decimals);
}

/**
 * mintTokens
 */
export async function mintTokens(
    connection: Connection,
    payer: Signer,
    mint: PublicKey,
    owner: PublicKey,
    amount: number,
): Promise<string> {
    const ata = await getOrCreateAssociatedTokenAccount(connection, payer, mint, owner);
    return await mintTo(connection, payer, mint, ata.address, payer.publicKey, amount);
}

/**
 * transferTokens
 */
export async function transferTokens(
    connection: Connection,
    payer: Signer,
    mint: PublicKey,
    from: PublicKey,
    to: PublicKey,
    amount: number,
): Promise<String> {
    const fromAta = await getOrCreateAssociatedTokenAccount(connection, payer, mint, from);
    const toAta = await getOrCreateAssociatedTokenAccount(connection, payer, mint, to);
    return await transfer(connection, payer, fromAta.address, toAta.address, payer, amount);
}

/**
 * getBalance
 */
export async function getBalance(
    connection: Connection,
    payer: Signer,
    mint: PublicKey,
    owner: PublicKey,
): Promise<bigint> {
    const ata = await getOrCreateAssociatedTokenAccount(connection, payer, mint, owner);
    return ata.amount;
}