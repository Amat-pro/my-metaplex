import {createNft, mplTokenMetadata} from "@metaplex-foundation/mpl-token-metadata";
import {createUmi} from "@metaplex-foundation/umi-bundle-defaults";
import {
    keypairIdentity,
    percentAmount,
    Umi,
    generateSigner,
    PublicKey,
} from "@metaplex-foundation/umi";
import {
    Connection,
    LAMPORTS_PER_SOL,
    Signer as web3JSSigner,
    SystemProgram,
    Keypair,
    PublicKey as web3JSPublickKey,
    sendAndConfirmTransaction
} from "@solana/web3.js";

/**
 *
 * @param connection
 * @param payer
 */
export function initUmi(
    connection: Connection,
    payer: Keypair,
) {
    const umi = createUmi(connection);
    umi.use(mplTokenMetadata());
    umi.use(keypairIdentity(umi.eddsa.createKeypairFromSecretKey(payer.secretKey)));
    return umi;
}

/**
 *
 * @param umi
 * @param name
 * @param symbol
 * @param uri
 * @param supply
 * @param nonceAccountPublicKey
 * @param nonceValue
 */
export async function createNFT(
    umi: Umi,
    name: string,
    symbol: string,
    uri: string,
    supply: bigint = 1n,
    nonceAccountPublicKey: PublicKey,
    nonceValue: string,
) {
    // mint keypair
    const mint = generateSigner(umi);

    const txBuilder = createNft(umi, {
        collectionDetails: null,
        creators: null,
        decimals: 0,
        isCollection: false,
        mint: mint, // 这里在createNft时必须是个Signer payer签名message付费,mint签名同一个message表明拥有这个mint的secretkey
        name: name,
        printSupply: {
            __kind: 'Limited', fields: [supply]
        },
        sellerFeeBasisPoints: percentAmount(5, 2),
        uri: uri,
        symbol: symbol,
    });

    // const latestBlockhashInfo = await umi.rpc.getLatestBlockhash();
    // console.log("latestBlockhash: ", latestBlockhashInfo);
    // send and confirm
    const txSig = await txBuilder.sendAndConfirm(umi, {
        send: {
            skipPreflight: true, // 暂时跳过
            maxRetries: 5,
        },
        confirm: {
            // strategy: {
            //     type: 'blockhash',
            //     blockhash: latestBlockhashInfo.blockhash,
            //     lastValidBlockHeight: latestBlockhashInfo.lastValidBlockHeight,
            // },
            strategy: {
                type: "durableNonce",
                minContextSlot: await umi.rpc.getSlot(),
                nonceAccountPubkey: nonceAccountPublicKey,
                nonceValue: nonceValue,
            }
        }
    });
    console.log("NFT Created! Transaction:", txSig);
}

export async function createNonceAccount(connection: Connection, payer: web3JSSigner) {
    console.log("create nonceAccount");
    const nonceAccount = Keypair.generate();

    const web3Tx = SystemProgram.createNonceAccount({
        fromPubkey: payer.publicKey,
        noncePubkey: nonceAccount.publicKey,
        lamports: LAMPORTS_PER_SOL,
        authorizedPubkey: payer.publicKey,
    });
    const tx = await sendAndConfirmTransaction(connection, web3Tx, [payer, nonceAccount]);
    console.log("create nonceAccount success: ", tx);
    return nonceAccount
}

export async function getNonce(connection: Connection, nonceKey: web3JSPublickKey) {
    const nonceInfo = await connection.getNonce(nonceKey);
    if (!nonceInfo) {
        return null
    }
    return nonceInfo.nonce
}
