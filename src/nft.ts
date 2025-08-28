import { createNft, mplTokenMetadata } from "@metaplex-foundation/mpl-token-metadata";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import {
    keypairIdentity,
    percentAmount,
    Umi,
    generateSigner,
} from "@metaplex-foundation/umi";
import {Connection, Keypair, Signer} from "@solana/web3.js";

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
 */
export async function createNFT(
    umi: Umi,
    name: string,
    symbol: string,
    uri: string,
    supply: bigint = 1n,
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

    // send and confirm
    const txSig = await txBuilder.sendAndConfirm(umi);
    console.log("NFT Created! Transaction:", txSig);
}

