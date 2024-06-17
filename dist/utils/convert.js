"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fromMinorUnitsToNumber = exports.fromNumberToMinorUnits = exports.fromLamportsToNumber = exports.fromNumberToLamports = void 0;
// src/utils/convert.ts
const decimal_js_1 = __importDefault(require("decimal.js"));
/**
 * Converts a readable number of tokens to the smallest unit (e.g., lamports for SOL).
 * @param {number} value - The amount in readable units.
 * @param {number} decimals - The number of decimals the token uses.
 * @returns {number} - The amount in the smallest unit.
 */
function fromNumberToLamports(value, decimals) {
    const result = value * Math.pow(10, decimals);
    const roundedResult = result.toFixed(0);
    return parseInt(roundedResult);
}
exports.fromNumberToLamports = fromNumberToLamports;
/**
 * Converts the smallest unit of tokens (e.g., lamports for SOL) to a readable number.
 * @param {number} value - The amount in the smallest unit.
 * @param {number} decimals - The number of decimals the token uses.
 * @returns {number} - The readable amount.
 */
function fromLamportsToNumber(value, decimals) {
    const result = value / Math.pow(10, decimals);
    const roundedResult = result.toFixed(0);
    return parseInt(roundedResult);
}
exports.fromLamportsToNumber = fromLamportsToNumber;
/**
 * Converts a readable number of tokens to the smallest unit (e.g., lamports for SOL).
 * @param {number} value - The amount in readable units.
 * @param {number} decimals - The number of decimals the token uses.
 * @returns {Decimal} - The amount in the smallest unit.
 */
function fromNumberToMinorUnits(value, decimals) {
    return new decimal_js_1.default(value).mul(new decimal_js_1.default(10).pow(decimals));
}
exports.fromNumberToMinorUnits = fromNumberToMinorUnits;
/**
 * Converts the smallest unit of tokens (e.g., lamports for SOL) to a readable number.
 * @param {Decimal} value - The amount in the smallest unit.
 * @param {number} decimals - The number of decimals the token uses.
 * @returns {Decimal} - The readable amount.
 */
function fromMinorUnitsToNumber(value, decimals) {
    return value.div(new decimal_js_1.default(10).pow(decimals));
}
exports.fromMinorUnitsToNumber = fromMinorUnitsToNumber;
//# sourceMappingURL=convert.js.map