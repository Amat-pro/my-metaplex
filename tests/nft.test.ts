import {clusterApiUrl, Connection, Keypair} from "@solana/web3.js";
import fs from "fs";
import {createNFT, initUmi} from "../src/nft.js";
import { setGlobalDispatcher, ProxyAgent } from "undici";

// 设置代理
const proxyAgent = new ProxyAgent("http://127.0.0.1:7890");
setGlobalDispatcher(proxyAgent);

describe("nft", () => {
    // 使用devnet metaplex在dev环境上部署了相关的program
    const connection = new Connection(clusterApiUrl("devnet"), {
        commitment: "confirmed",
    });
    // 配置devnet上有余额的账户
    const secretKeyString = fs.readFileSync("testdata/id.json", { encoding: "utf-8" });
    const secretKey = Uint8Array.from(JSON.parse(secretKeyString));
    const payer = Keypair.fromSecretKey(secretKey);
    const umi = initUmi(connection, payer);

    console.log("payer: ", payer.publicKey);

    it("nft", async () => {
        const owner = Keypair.generate();
        console.log("owner: ", owner.publicKey);

        await createNFT(umi, "my NFT", "symbol", "uri", 2n);
    });
});
