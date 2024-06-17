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
exports.RaydiumClient = void 0;
const web3_js_1 = require("@solana/web3.js");
const cross_fetch_1 = __importDefault(require("cross-fetch"));
class RaydiumClient {
    constructor(connection) {
        this.baseUri = 'https://quote-api.jup.ag/v6';
        this.connection = connection;
    }
    getConnection() {
        return this.connection;
    }
    getQuote(inputMint, outputMint, amount, slippageBps, swapMode = 'ExactIn') {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield (0, cross_fetch_1.default)(`${this.baseUri}/quote?inputMint=${inputMint}&outputMint=${outputMint}&amount=${amount}&slippageBps=${slippageBps}&dexes=Raydium&swapMode=${swapMode}`);
            const quoteResponse = yield response.json();
            return { success: response.ok, quote: quoteResponse };
        });
    }
    getSwapTransaction(wallet, quoteResponse, wrapAndUnwrapSol = true, feeAccount) {
        return __awaiter(this, void 0, void 0, function* () {
            const body = Object.assign({ quoteResponse, userPublicKey: wallet.publicKey.toString(), wrapAndUnwrapSol }, (feeAccount && { feeAccount }));
            const response = yield (0, cross_fetch_1.default)(`${this.baseUri}/swap`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            if (!response.ok) {
                return;
            }
            const { swapTransaction } = yield response.json();
            const swapTransactionBuf = Buffer.from(swapTransaction, 'base64');
            const transaction = web3_js_1.VersionedTransaction.deserialize(swapTransactionBuf);
            return transaction;
        });
    }
    signAndSendTransaction(swapTransaction, wallet) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield swapTransaction.sign([wallet]);
                // console.log({ swapTransaction });
                const txId = yield this.connection.sendRawTransaction(swapTransaction.serialize(), {
                    skipPreflight: true,
                    preflightCommitment: 'singleGossip',
                });
                console.log({ txId });
                const confirmation = yield this.waitForTransactionConfirmation(txId);
                console.log({ confirmation });
                if (!confirmation) {
                    return false;
                }
                return true;
            }
            catch (err) {
                console.log({ err });
                return false;
            }
        });
    }
    waitForTransactionConfirmation(txId, timeout = 60000) {
        return __awaiter(this, void 0, void 0, function* () {
            const startTime = Date.now();
            while (Date.now() - startTime < timeout) {
                try {
                    const status = yield this.connection.getSignatureStatus(txId);
                    console.log({ status });
                    if (status && status.value && status.value.confirmationStatus === 'finalized') {
                        console.log({ status });
                        return true;
                    }
                }
                catch (error) { }
                yield new Promise((resolve) => setTimeout(resolve, 2000));
            }
            return false;
        });
    }
}
exports.RaydiumClient = RaydiumClient;
//# sourceMappingURL=raydium.js.map