import {WalletAdapterNetwork} from "@solana/wallet-adapter-base";
import { createTransferCheckedInstruction, getAssociatedTokenAddress, getMint } from "@solana/spl-token"
import {clusterApiUrl, Connection, Keypair, LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import { Base64 } from "aws-sdk/clients/ecr.js";
import {BigNumber} from 'bignumber.js';

const getSolanaNetworkConnection = ():Connection =>{
    let network = WalletAdapterNetwork.Mainnet
    if (process.env.SOLANA_CLUSTER == "devnet"){
        network = WalletAdapterNetwork.Devnet
    }
    const endpoint = clusterApiUrl(network)
    return new Connection(endpoint)
}

//make Transaction: send to a wallet
const createSolTransferTransaction = async (fromWallet:string, toWallet:string, amount:number): Promise<Base64> => {
    const fromWalletPubKey = new PublicKey(fromWallet)
    const toWalletPubKey = new PublicKey(toWallet)
    const bnAmount = new BigNumber(amount)
    
    const connection = getSolanaNetworkConnection();
    const transactionReference = Keypair.generate().publicKey

    //token address of the coin
    const usdcAddress = new PublicKey('GHVhVTcXLixkUPJLAXDwgj2au2oy2PySkeA4a8gURtvt')
    // Get details about the USDC token
    const usdcMint = await getMint(connection, usdcAddress)
    const fromWalletTokenAccount = await getAssociatedTokenAddress(usdcAddress, fromWalletPubKey);
    const toWalletTokenAccount = await getAssociatedTokenAddress(usdcAddress, toWalletPubKey);

    //get a recent blockhash to include our transactions
    const latestBlockhash = await connection.getLatestBlockhash('finalized');
    const transaction = new Transaction({
        //@ts-ignore
        recentBlockhash: latestBlockhash.blockhash,
        feePayer: fromWalletPubKey
    })

    // const transferInstruction = createTransferCheckedInstruction(
    //     fromWalletTokenAccount,  //source
    //     usdcAddress,             //token address
    //     toWalletTokenAccount,    //to
    //     fromWalletPubKey,        //owner of source address
    //     bnAmount.toNumber() * (10 ** (await usdcMint).decimals),
    //     usdcMint.decimals        //decimals of usdc token
    // )

    //actual solana transfer
    const transferInstruction = SystemProgram.transfer({
        fromPubkey: fromWalletPubKey,
        lamports: bnAmount.multipliedBy(LAMPORTS_PER_SOL).toNumber(),
        toPubkey: toWalletPubKey
    })

    //We can use the reference later to query for this transaction
    transferInstruction.keys.push({
        pubkey: transactionReference,
        isSigner: false,
        isWritable: false,
    })

    // Add the instruction to the transaction
    transaction.add(transferInstruction)
    // Serialize the transaction and convert to base64 to return it
    const serializedTransaction = transaction.serialize({
        // We will need the buyer to sign this transaction after it's returned to them
        requireAllSignatures: false
    })
    console.log(transaction)
    const base64Transaction = serializedTransaction.toString('base64')

    return base64Transaction
}

export default{
    createSolTransferTransaction
}