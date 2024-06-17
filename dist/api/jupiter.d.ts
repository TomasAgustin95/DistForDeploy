import { Connection, Keypair } from '@solana/web3.js';
/**
 * Class for interacting with the Jupiter API to perform token swaps on the Solana blockchain.
 */
export declare class JupiterClient {
    private connection;
    private userKeypair;
    baseUri: string;
    /**
     * Constructs a JupiterClient instance.
     * @param connection The Solana connection object.
     * @param userKeypair The user's Solana Keypair.
     */
    constructor(connection: Connection, userKeypair: Keypair);
    /**
     * Get the Solana connection.
     * @returns The Solana connection.
     */
    getConnection(): Connection;
    /**
     * Get the user keypair.
     * @returns The user keypair.
     */
    getUserKeypair(): Keypair;
    /**
     * Retrieves a swap quote from the Jupiter API.
     * @param inputMint The address of the input token mint.
     * @param outputMint The address of the output token mint.
     * @param amount The amount of input tokens to swap.
     * @param slippageBps The maximum slippage allowed, in basis points.
     * @returns A promise that resolves to the swap quote.
     */
    getQuote(inputMint: string, outputMint: string, amount: string, slippageBps: number): Promise<any>;
    /**
     * Retrieves a swap transaction from the Jupiter API.
     * @param quoteResponse The response from the getQuote method.
     * @param wrapAndUnwrapSol Whether to wrap and unwrap SOL if necessary.
     * @param feeAccount An optional fee account address.
     * @returns A promise that resolves to the swap transaction.
     */
    getSwapTransaction(quoteResponse: any, wrapAndUnwrapSol?: boolean, feeAccount?: string): Promise<any>;
    /**
     * Executes a swap transaction on the Solana blockchain.
     * @param swapTransaction The swap transaction obtained from getSwapTransaction, encoded in base64.
     * @returns A promise that resolves to a boolean indicating whether the transaction was successfully confirmed.
     */
    executeSwap(swapTransaction: any): Promise<boolean>;
    /**
     * Waits for a transaction to be confirmed on the Solana blockchain.
     * @param txId The ID of the transaction to wait for.
     * @param timeout The maximum time to wait for confirmation, in milliseconds. Defaults to 60000 ms.
     * @returns A promise that resolves to a boolean indicating whether the transaction was confirmed within the timeout period.
     */
    waitForTransactionConfirmation(txId: string, timeout?: number): Promise<boolean>;
}
