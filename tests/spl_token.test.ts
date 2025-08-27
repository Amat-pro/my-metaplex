import {Connection, Keypair, LAMPORTS_PER_SOL, Signer} from "@solana/web3.js";
import * as my_mint from "../src/spl_token";

describe("spl token", () => {

    const connection = new Connection("http://127.0.0.1:8899", "confirmed");
    const payer: Signer = Keypair.generate();

    before(async () => {
        console.log("request airdrop ...");
        try {
            const tx = await connection.requestAirdrop(payer.publicKey, 2 * LAMPORTS_PER_SOL);
            // 等待空投成功... 这里必须等待空投交易确认后才能进行后面的操作
            const latestBlockhash = await connection.getLatestBlockhash();
            await connection.confirmTransaction(
                {
                    signature: tx,
                    blockhash: latestBlockhash.blockhash,
                    lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
                },
                "confirmed"
            );
        } catch (err) {
            console.log("request airdrop error: ", err);
        }
    });

    it("metaplex spl token", async () => {
        // 1. create mint
        const mint = await my_mint.mint(connection,payer, payer.publicKey, payer.publicKey, 2)
        console.log("mint success, mint: ", mint.toString());
        // 2. mint tokens to payer
        const mintTokenTx = await my_mint.mintTokens(connection, payer, mint, payer.publicKey, 100);
        console.log("mint tokens to payer success, tx: ", mintTokenTx);
        // 3. get payer balance
        let payerBalance = await my_mint.getBalance(connection, payer, mint, payer.publicKey);
        console.log("get payer balance success, tx: ", payerBalance);
        // 4. transfer tokens
        const to= Keypair.generate();
        const transferTx = await my_mint.transferTokens(connection, payer, mint, payer.publicKey, to.publicKey, 1);
        console.log("transfer tokens success, tx: ", transferTx);
        payerBalance = await my_mint.getBalance(connection, payer, mint, payer.publicKey);
        console.log("get payer balance success, tx: ", payerBalance);
        let toBalance = await my_mint.getBalance(connection, payer, mint, to.publicKey);
        console.log("get payer balance success, tx: ", toBalance);
    });
});
