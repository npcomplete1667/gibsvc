import {WalletAdapterNetwork} from "@solana/wallet-adapter-base";
import { createTransferCheckedInstruction, getAssociatedTokenAddress, getMint } from "@solana/spl-token"
import {clusterApiUrl, Connection, DecodedTransferInstruction, Keypair, LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
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
const createSolTransferTransaction = async (from_wallet:string, to_wallet:string, amount:number, pay_dev:boolean): Promise<Base64> => {
    console.log("SolanaPay: createSolTransferTransaction from_wallet=", from_wallet, " to_wallet=", to_wallet, ", amount=",amount)
    const fromWalletPubKey = new PublicKey(from_wallet)
    
    const connection = getSolanaNetworkConnection();
    const transactionReference = Keypair.generate().publicKey

    const latestBlockhash = await connection.getLatestBlockhash('finalized');
    const transaction = new Transaction({
        //@ts-ignore
        recentBlockhash: latestBlockhash.blockhash,
        feePayer: fromWalletPubKey
    })

    if(pay_dev){
        transaction.add(createSolTransferInstruction(from_wallet, to_wallet, amount * 0.995, transactionReference))
        transaction.add(createSolTransferInstruction(from_wallet, "Hv9qLetAN9QxJkFWhbQGaPdJ6ca5CgEAyWnsotdGzZdC", amount * 0.005, transactionReference))
    } else{
        transaction.add(createSolTransferInstruction(from_wallet, to_wallet, amount, transactionReference))
    }


    // Serialize the transaction and convert to base64 to return it
    const serializedTransaction = transaction.serialize({
        // We will need the buyer to sign this transaction after it's returned to them
        requireAllSignatures: false
    })
    console.log(transaction)
    const base64Transaction = serializedTransaction.toString('base64')

    return base64Transaction
}

const createSolTransferInstruction = (from_wallet:string, to_wallet:string, amount:number, transactionReference:PublicKey): any => {
    console.log("SolanaPay: createSolTransferInstruction from_wallet=", from_wallet, " to_wallet=", to_wallet, ", amount=",amount)
    const fromWalletPubKey = new PublicKey(from_wallet)
    const toWalletPubKey = new PublicKey(to_wallet)
    let bnAmount = new BigNumber(amount.toFixed(10))

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
    return transferInstruction
}

export default{
    createSolTransferTransaction
}