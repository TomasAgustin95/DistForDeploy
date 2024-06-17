import { Connection, Keypair } from '@solana/web3.js';
import Decimal from 'decimal.js';
export declare class RaydiumClient {
    baseUri: string;
    connection: Connection;
    constructor(connection: Connection);
    getConnection(): Connection;
    getQuote(inputMint: string, outputMint: string, amount: Decimal, slippageBps: number, swapMode?: string): Promise<{
        success: boolean;
        quote: any;
    }>;
    getSwapTransaction(wallet: Keypair, quoteResponse: any, wrapAndUnwrapSol?: boolean, feeAccount?: string): Promise<any>;
    signAndSendTransaction(swapTransaction: any, wallet: Keypair): Promise<boolean>;
    waitForTransactionConfirmation(txId: string, timeout?: number): Promise<boolean>;
}
