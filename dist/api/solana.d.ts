import { Keypair } from '@solana/web3.js';
import { Connection } from '@solana/web3.js';
/**
 * Setup connection to Solana RPC endpoint
 * @param {string} endpoint - RPC endpoint
 * @returns {Connection} - Connection object
 */
export declare function setupSolanaConnection(rpcEndPoint: string, socketEndPoint: string): Connection;
/**
 * Get user keypair from private key
 * @param {string} privateKey - User private key
 * @returns {Keypair} - User keypair
 */
export declare function getUserKeypair(filePath: string): Keypair;
