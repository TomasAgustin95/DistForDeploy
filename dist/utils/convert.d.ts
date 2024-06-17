import Decimal from 'decimal.js';
/**
 * Converts a readable number of tokens to the smallest unit (e.g., lamports for SOL).
 * @param {number} value - The amount in readable units.
 * @param {number} decimals - The number of decimals the token uses.
 * @returns {number} - The amount in the smallest unit.
 */
export declare function fromNumberToLamports(value: number, decimals: number): number;
/**
 * Converts the smallest unit of tokens (e.g., lamports for SOL) to a readable number.
 * @param {number} value - The amount in the smallest unit.
 * @param {number} decimals - The number of decimals the token uses.
 * @returns {number} - The readable amount.
 */
export declare function fromLamportsToNumber(value: number, decimals: number): number;
/**
 * Converts a readable number of tokens to the smallest unit (e.g., lamports for SOL).
 * @param {number} value - The amount in readable units.
 * @param {number} decimals - The number of decimals the token uses.
 * @returns {Decimal} - The amount in the smallest unit.
 */
export declare function fromNumberToMinorUnits(value: number, decimals: number): Decimal;
/**
 * Converts the smallest unit of tokens (e.g., lamports for SOL) to a readable number.
 * @param {Decimal} value - The amount in the smallest unit.
 * @param {number} decimals - The number of decimals the token uses.
 * @returns {Decimal} - The readable amount.
 */
export declare function fromMinorUnitsToNumber(value: Decimal, decimals: number): Decimal;
