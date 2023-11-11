// Import Solana web3 functinalities
const {
    Connection,
    PublicKey,
    clusterApiUrl,
    Keypair,
    LAMPORTS_PER_SOL,
    Transaction,
    SystemProgram,
    sendAndConfirmTransaction
} = require("@solana/web3.js");
const { log } = require("console");

const transferSol = async() => {
    const connection = new Connection("http://127.0.0.1:8899", "confirmed");

    // Get Keypair from Secret Key
    var from = Keypair.generate();

    // Generate another Keypair (account we'll be sending to)
    const to = Keypair.generate();

    // Aidrop 2 SOL to Sender wallet
    console.log("Airdopping some SOL to Sender wallet!");
    const fromAirDropSignature = await connection.requestAirdrop(
        new PublicKey(from.publicKey),
        2 * LAMPORTS_PER_SOL
    );

    // Latest blockhash (unique identifer of the block) of the cluster
    let latestBlockHash = await connection.getLatestBlockhash();

    // Confirm transaction using the last valid block height (refers to its time)
    // to check for transaction expiration
    await connection.confirmTransaction({
        blockhash: latestBlockHash.blockhash,
        lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
        signature: fromAirDropSignature
    });

    console.log("Airdrop completed for the Sender account");
    console.log("\n");

    const walletBalanceFrom = await connection.getBalance(from.publicKey);
    console.log("-- from Wallet balance:", `${parseInt(walletBalanceFrom) / LAMPORTS_PER_SOL}`);
    const walletBalanceTo = await connection.getBalance(to.publicKey);
    console.log("-- to Wallet balance:", `${parseInt(walletBalanceTo) / LAMPORTS_PER_SOL}`);
    console.log("\n")

    const halfOfwalletBalanceFrom = walletBalanceFrom / 2;

    // Send money from "from" wallet and into "to" wallet
    var transaction = new Transaction().add(
        SystemProgram.transfer({
            fromPubkey: from.publicKey,
            toPubkey: to.publicKey,
            lamports: halfOfwalletBalanceFrom
        })
    );

    // Sign transaction
    var signature = await sendAndConfirmTransaction(
        connection,
        transaction,
        [from]
    );
    console.log('Signature is', signature);
    console.log("\n");

    const walletBalanceFromAfter = await connection.getBalance(from.publicKey);
    console.log("-> from Wallet balance:", `${parseInt(walletBalanceFromAfter) / LAMPORTS_PER_SOL}`);
    const walletBalanceToAfter = await connection.getBalance(to.publicKey);
    console.log("-> to Wallet balance:", `${parseInt(walletBalanceToAfter) / LAMPORTS_PER_SOL}`);
}

transferSol();