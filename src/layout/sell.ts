import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js"
import { solanaConnection } from "../constants"
import { buyandsell, mainKp } from "./buy"
import { logger, readSettings } from "../utils"
import { PumpAmmSdk } from "@pump-fun/pump-swap-sdk"
import { getAssociatedTokenAddress } from "@solana/spl-token"
import { BN } from "bn.js"

export const totalSell = async () => {
    const pumpSwap = new PumpAmmSdk(solanaConnection);
    const solBalance = (await solanaConnection.getBalance(mainKp.publicKey)) / LAMPORTS_PER_SOL

    logger.info(`Token selling started`)
    logger.info(`Wallet address: ${mainKp.publicKey.toBase58()}`)
    logger.info(`Balance of the main wallet: ${solBalance}Sol`)

    console.log("SELLING...")

    const settings = readSettings()
    const POOL_ID = new PublicKey(settings.poolId!);
    const slippage = Number(settings.slippage!);
    const TOKEN_CA = new PublicKey(settings.mint!);

    const ata = await getAssociatedTokenAddress(TOKEN_CA, mainKp.publicKey)

    logger.info(`Token account address: ${ata.toBase58()}`)

    const tokenInfo = await solanaConnection.getTokenAccountBalance(ata);
    console.log("🚀 ~ constsell_token= ~ tokenAmount:", await solanaConnection.getTokenAccountBalance(ata))
    const tokenAmount = Number(tokenInfo.value.amount!);

    logger.info(`Token amount: ${tokenAmount}`)

    await buyandsell(pumpSwap, POOL_ID, TOKEN_CA, new BN(tokenAmount), slippage, mainKp, "quoteToBase");
}