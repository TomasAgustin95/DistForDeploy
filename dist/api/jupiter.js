"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JupiterClient = void 0;
const web3_js_1 = require("@solana/web3.js");
const cross_fetch_1 = __importDefault(require("cross-fetch"));
/**
 * Class for interacting with the Jupiter API to perform token swaps on the Solana blockchain.
 */
class JupiterClient {
    /**
     * Constructs a JupiterClient instance.
     * @param connection The Solana connection object.
     * @param userKeypair The user's Solana Keypair.
     */
    constructor(connection, userKeypair) {
        this.connection = connection;
        this.userKeypair = userKeypair;
        this.baseUri = 'https://quote-api.jup.ag/v6';
    }
    /**
     * Get the Solana connection.
     * @returns The Solana connection.
     */
    getConnection() {
        return this.connection;
    }
    /**
     * Get the user keypair.
     * @returns The user keypair.
     */
    getUserKeypair() {
        return this.userKeypair;
    }
    /**
     * Retrieves a swap quote from the Jupiter API.
     * @param inputMint The address of the input token mint.
     * @param outputMint The address of the output token mint.
     * @param amount The amount of input tokens to swap.
     * @param slippageBps The maximum slippage allowed, in basis points.
     * @returns A promise that resolves to the swap quote.
     */
    getQuote(inputMint, outputMint, amount, slippageBps) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`Getting quote for ${amount} ${inputMint} -> ${outputMint}`);
            const response = yield (0, cross_fetch_1.default)(`${this.baseUri}/quote?inputMint=${inputMint}&outputMint=${outputMint}&amount=${amount}&slippageBps=${slippageBps}`);
            const quoteResponse = yield response.json();
            if (!response.ok) {
                console.error('Failed to get quote:', quoteResponse.error);
                throw new Error(`Failed to get quote: ${quoteResponse.error}`);
            }
            return quoteResponse;
        });
    }
    /**
     * Retrieves a swap transaction from the Jupiter API.
     * @param quoteResponse The response from the getQuote method.
     * @param wrapAndUnwrapSol Whether to wrap and unwrap SOL if necessary.
     * @param feeAccount An optional fee account address.
     * @returns A promise that resolves to the swap transaction.
     */
    getSwapTransaction(quoteResponse, wrapAndUnwrapSol = true, feeAccount) {
        return __awaiter(this, void 0, void 0, function* () {
            const body = Object.assign({ quoteResponse, userPublicKey: this.userKeypair.publicKey.toString(), wrapAndUnwrapSol }, (feeAccount && { feeAccount }));
            const response = yield (0, cross_fetch_1.default)(`${this.baseUri}/swap`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            if (!response.ok) {
                throw new Error('Failed to get swap transaction');
            }
            const { swapTransaction } = yield response.json();
            return swapTransaction;
        });
    }
    /**
     * Executes a swap transaction on the Solana blockchain.
     * @param swapTransaction The swap transaction obtained from getSwapTransaction, encoded in base64.
     * @returns A promise that resolves to a boolean indicating whether the transaction was successfully confirmed.
     */
    executeSwap(swapTransaction) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const swapTransactionBuf = Buffer.from(swapTransaction, 'base64');
                let transaction = web3_js_1.VersionedTransaction.deserialize(swapTransactionBuf);
                transaction.sign([this.userKeypair]);
                const txId = yield this.connection.sendRawTransaction(transaction.serialize(), {
                    skipPreflight: true,
                    preflightCommitment: 'singleGossip',
                });
                console.log('Swap transaction sent:', txId);
                const confirmation = yield this.waitForTransactionConfirmation(txId);
                if (!confirmation) {
                    console.error('Swap transaction confirmation timed out');
                    return false;
                }
                console.log('Swap transaction confirmed');
                return true;
            }
            catch (err) {
                console.error('Failed to send swap transaction:', err);
                return false;
            }
        });
    }
    /**
     * Waits for a transaction to be confirmed on the Solana blockchain.
     * @param txId The ID of the transaction to wait for.
     * @param timeout The maximum time to wait for confirmation, in milliseconds. Defaults to 60000 ms.
     * @returns A promise that resolves to a boolean indicating whether the transaction was confirmed within the timeout period.
     */
    waitForTransactionConfirmation(txId, timeout = 60000) {
        return __awaiter(this, void 0, void 0, function* () {
            const startTime = Date.now();
            while (Date.now() - startTime < timeout) {
                const status = yield this.connection.getSignatureStatus(txId);
                if (status && status.value && status.value.confirmationStatus === 'finalized') {
                    return true;
                }
                yield new Promise((resolve) => setTimeout(resolve, 2000));
            }
            return false;
        });
    }
}
exports.JupiterClient = JupiterClient;
//# sourceMappingURL=jupiter.js.map