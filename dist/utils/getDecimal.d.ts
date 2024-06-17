import { Connection } from '@solana/web3.js';
/**
 * get token decimal from token address
 * @param {Connection} connection - connection
 * @param {string} tokenAddress - token address
 * @returns {number} - Decimal of token
 */
export declare function getDecimal(connection: Connection, tokenAddress: string): Promise<number>;
