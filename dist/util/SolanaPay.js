import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { createTransferCheckedInstruction, getAssociatedTokenAddress, getMint } from "@solana/spl-token";
import { clusterApiUrl, Connection, Keypair, PublicKey, Transaction } from "@solana/web3.js";
import { BigNumber } from 'bignumber.js';
const getSolanaNetworkConnection = () => {
    let network = WalletAdapterNetwork.Mainnet;
    if (process.env.SOLANA_CLUSTER == "devnet") {
        network = WalletAdapterNetwork.Devnet;
    }
    const endpoint = clusterApiUrl(network);
    return new Connection(endpoint);
};
//make Transaction: send to a wallet
const createSolTransferTransaction = async (fromWallet, toWallet, amount) => {
    const fromWalletPubKey = new PublicKey(fromWallet);
    const toWalletPubKey = new PublicKey(toWallet);
    const bnAmount = new BigNumber(amount);
    const connection = getSolanaNetworkConnection();
    const transactionReference = Keypair.generate().publicKey;
    //token address of the coin
    const usdcAddress = new PublicKey('4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU');
    // Get details about the USDC token
    const usdcMint = await getMint(connection, usdcAddress);
    const fromWalletTokenAccount = await getAssociatedTokenAddress(usdcAddress, fromWalletPubKey);
    const toWalletTokenAccount = await getAssociatedTokenAddress(usdcAddress, toWalletPubKey);
    //get a recent blockhash to include our transactions
    const latestBlockhash = await connection.getLatestBlockhash('finalized');
    const transaction = new Transaction({
        //@ts-ignore
        recentBlockhash: latestBlockhash.blockhash,
        feePayer: fromWalletPubKey
    });
    console.log(fromWalletTokenAccount, //source
    usdcAddress, //token address
    toWalletTokenAccount, //to
    fromWalletPubKey, //owner of source address
    bnAmount.toNumber() * (10 ** usdcMint.decimals), usdcMint.decimals);
    const transferInstruction = createTransferCheckedInstruction(fromWalletTokenAccount, //source
    usdcAddress, //token address
    toWalletTokenAccount, //to
    fromWalletPubKey, //owner of source address
    bnAmount.toNumber() * (10 ** (await usdcMint).decimals), usdcMint.decimals //decimals of usdc token
    );
    // //actual solana transfer
    // const transferInstruction = SystemProgram.transfer({
    //     fromPubkey: fromWalletPubKey,
    //     lamports: bnAmount.multipliedBy(LAMPORTS_PER_SOL).toNumber(),
    //     toPubkey: toWalletPubKey
    // })
    //We can use the reference later to query for this transaction
    transferInstruction.keys.push({
        pubkey: transactionReference,
        isSigner: false,
        isWritable: false,
    });
    // Add the instruction to the transaction
    transaction.add(transferInstruction);
    // Serialize the transaction and convert to base64 to return it
    const serializedTransaction = transaction.serialize({
        // We will need the buyer to sign this transaction after it's returned to them
        requireAllSignatures: false
    });
    console.log(transaction);
    const base64Transaction = serializedTransaction.toString('base64');
    return base64Transaction;
};
export default {
    createSolTransferTransaction
};
