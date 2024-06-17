"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserKeypair = exports.setupSolanaConnection = void 0;
const fs_1 = __importDefault(require("fs"));
const bs58_1 = __importDefault(require("bs58"));
const web3_js_1 = require("@solana/web3.js");
const web3_js_2 = require("@solana/web3.js");
/**
 * Setup connection to Solana RPC endpoint
 * @param {string} endpoint - RPC endpoint
 * @returns {Connection} - Connection object
 */
function setupSolanaConnection(rpcEndPoint, socketEndPoint) {
    return new web3_js_2.Connection(rpcEndPoint, {
        wsEndpoint: socketEndPoint,
    });
}
exports.setupSolanaConnection = setupSolanaConnection;
/**
 * Get user keypair from private key
 * @param {string} privateKey - User private key
 * @returns {Keypair} - User keypair
 */
function getUserKeypair(filePath) {
    const secretKeyString = fs_1.default.readFileSync(filePath, { encoding: 'utf8' });
    console.log(secretKeyString);
    const secretKey = bs58_1.default.decode(secretKeyString);
    return web3_js_1.Keypair.fromSecretKey(secretKey);
}
exports.getUserKeypair = getUserKeypair;
//# sourceMappingURL=solana.js.map