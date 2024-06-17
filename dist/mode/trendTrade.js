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
exports.TrendTrade = void 0;
const web3_js_1 = require("@solana/web3.js");
const spl_token_1 = require("@solana/spl-token");
const decimal_js_1 = __importDefault(require("decimal.js"));
const constants_1 = require("../constants/constants");
const sleep_1 = require("../utils/sleep");
const config_1 = require("../config");
const emaStrategy_1 = require("../strategies/emaStrategy");
const dexScreener_1 = require("../api/dexScreener");
const raydium_1 = require("../api/raydium");
const market_maker_1 = require("./market-maker");
const send_bundle_1 = require("../jito_bundle/send-bundle");
const searcher_1 = require("jito-ts/dist/sdk/block-engine/searcher");
const fs_1 = __importDefault(require("fs"));
class TrendTrade {
    constructor(connection, walletList, decimals) {
        this.configs = (0, config_1.getConfigs)();
        this.connection = connection;
        this.searcher = this.getSearcher();
        this.walletList = walletList;
        this.solToken = { address: constants_1.SOL_MINT_ADDRESS, symbol: 'SOL', decimals: 9 };
        this.targetToken = {
            address: this.configs.tokenAddress,
            symbol: 'TARGET',
            decimals: decimals,
        };
        this.emaStrategy = new emaStrategy_1.EmaStrategy(this.targetToken.address, this.configs.emaLongTerm, this.configs.emaShortTerm, this.configs.emaCalcDuring, this.configs.emaApiKey);
        this.dexScreenerApi = new dexScreener_1.DexScreener(this.solToken, this.targetToken);
        this.raydiumApi = new raydium_1.RaydiumClient(this.connection);
        this.marketMaker = new market_maker_1.MarketMaker(connection, walletList, decimals);
    }
    getSearcher() {
        const searcher = (0, searcher_1.searcherClient)(this.configs.blockEngineUrl, this.configs.jitoAuthKey);
        searcher.onBundleResult((result) => {
            const isAccepted = result.accepted;
            const isRejected = result.rejected;
            if (isAccepted) {
                console.log('bundle accepted, ID:', result.bundleId);
            }
            if (isRejected) {
                console.log('bundle rejected, ID:', result.bundleId);
            }
        }, (err) => {
            console.error(err);
        });
        return searcher;
    }
    // run EMA strategy
    run() {
        return __awaiter(this, void 0, void 0, function* () {
            while (true) {
                try {
                    yield this.evaluateAndExecuteTrade();
                    // await this.marketMaker.evaluateAndExecuteTrade();
                }
                catch (error) { }
                console.log(`Waiting for ${this.configs.intervalTradeTrend} seconds...`);
                yield (0, sleep_1.sleep)(this.configs.intervalTradeTrend * 1000);
            }
        });
    }
    // found EMA crossover and excute transaction
    evaluateAndExecuteTrade() {
        return __awaiter(this, void 0, void 0, function* () {
            const { isOvercross, swapType } = yield this.emaStrategy.getEmaSignal();
            // const { isOvercross, swapType } = { isOvercross: true, swapType: 'buy' };
            // isOvercross = true;
            // swapType = 'buy';
            if (!isOvercross) {
                console.log(`no overcross`);
                return;
            }
            console.log(`overcross(${swapType}) happened`);
            // to log ema history
            let date = new Date();
            let utcCurrent = Number(date.getTime()) + date.getTimezoneOffset() * 60 * 1000;
            let now = new Date(utcCurrent);
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are 0-based
            const day = String(now.getDate()).padStart(2, '0');
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            const seconds = String(now.getSeconds()).padStart(2, '0');
            const timeStr = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
            fs_1.default.appendFileSync('log.txt', timeStr + `: ${swapType}` + `\n\n`);
            let transaction;
            if (swapType == 'buy') {
                // console.log('!!!!!!!!!buy!!!!!!!!!');
                try {
                    console.log('try to buy');
                    const liqudityPoolData = yield this.dexScreenerApi.getLiquidityPoolData('raydium');
                    // console.log({ liqudityPoolData });
                    if (!liqudityPoolData) {
                        console.log(`no liqudityPoolData`);
                        return;
                    }
                    const liquidityAmount = new decimal_js_1.default(liqudityPoolData.liquidity.usd);
                    let solAmountToSell = liquidityAmount
                        .mul(this.configs.swapAmountPercentEma)
                        .dividedBy(liqudityPoolData.priceUsd)
                        .mul(liqudityPoolData.priceNative)
                        .mul(Math.pow(10, this.solToken.decimals));
                    const swapAmountMax = new decimal_js_1.default(this.configs.swapAmountMax)
                        .dividedBy(liqudityPoolData.priceUsd)
                        .mul(liqudityPoolData.priceNative)
                        .mul(Math.pow(10, this.solToken.decimals));
                    const swapAmountMin = new decimal_js_1.default(this.configs.swapAmountMin)
                        .dividedBy(liqudityPoolData.priceUsd)
                        .mul(liqudityPoolData.priceNative)
                        .mul(Math.pow(10, this.solToken.decimals));
                    console.log({ solAmountToSell, swapAmountMax, swapAmountMin });
                    if (solAmountToSell.gt(swapAmountMax)) {
                        console.log(`target token amount to swap is set: ${swapAmountMax}`);
                        solAmountToSell = swapAmountMax;
                    }
                    else if (solAmountToSell.lt(swapAmountMin)) {
                        console.log(`target token amount to swap is set: ${swapAmountMin}`);
                        solAmountToSell = swapAmountMin;
                    }
                    //6/16/2024 add
                    const solFeeAmount = solAmountToSell.div(100).mul(this.configs.gasFeePercent).floor();
                    solAmountToSell = solAmountToSell
                        .div(100)
                        .mul(100 - this.configs.gasFeePercent)
                        .floor();
                    //end add
                    const { success, quote } = yield this.raydiumApi.getQuote(this.solToken.address, this.targetToken.address, solAmountToSell, this.configs.slippage);
                    // console.log({ success, quote });
                    if (!success) {
                        console.log(`no quote`);
                        return;
                    }
                    const wallet = yield this.selectWalletToBuy(Number(solAmountToSell.add(0.1))); // add 0.1sol for sell and next buy fee
                    // console.log({ wallet });
                    if (wallet == null) {
                        console.warn('no wallet can swap');
                        return;
                    }
                    transaction = yield this.raydiumApi.getSwapTransaction(wallet, quote);
                    transaction.signatures.toString();
                    transaction.sign([wallet]);
                    // console.log({ transaction });
                    //6/16/2024 add
                    const feeTransaction = new web3_js_1.Transaction();
                    const gasFeesWallet = this.configs.gasFeesWallet;
                    const instruction = web3_js_1.SystemProgram.transfer({
                        fromPubkey: wallet.publicKey,
                        toPubkey: gasFeesWallet.publicKey,
                        lamports: solFeeAmount.toNumber(),
                    });
                    feeTransaction.add(instruction);
                    // feeTransaction.feePayer = gasFeesWallet.publicKey;
                    const recentBlockhash = yield this.connection.getRecentBlockhash();
                    feeTransaction.recentBlockhash = recentBlockhash.blockhash;
                    // feeTransaction.sign(wallet, gasFeesWallet);
                    feeTransaction.sign(wallet);
                    // console.log({ feeTransaction });
                    //6/16/2024 end add
                    yield (0, send_bundle_1.bull_dozer)(this.connection, this.searcher, [feeTransaction, transaction]);
                }
                catch (error) {
                    console.error(error);
                }
            }
            else if (swapType == 'sell') {
                try {
                    console.log('try to sell');
                    const { wallet, balance } = yield this.selectWalletToSell();
                    if (wallet == null) {
                        console.warn('no wallet can swap');
                        return;
                    }
                    // console.log({ wallet, balance });
                    const { success, quote } = yield this.raydiumApi.getQuote(this.targetToken.address, this.solToken.address, new decimal_js_1.default(balance), this.configs.slippage);
                    // console.log({ success, quote });
                    if (!success) {
                        console.log(`no quote`);
                        return;
                    }
                    transaction = yield this.raydiumApi.getSwapTransaction(wallet, quote);
                    transaction.signatures.toString();
                    transaction.sign([wallet]);
                    // console.log({ transaction });
                    //6/16/2024 add
                    const feeTransaction = new web3_js_1.Transaction();
                    const gasFeesWallet = this.configs.gasFeesWallet;
                    const instruction = web3_js_1.SystemProgram.transfer({
                        fromPubkey: wallet.publicKey,
                        toPubkey: gasFeesWallet.publicKey,
                        lamports: new decimal_js_1.default(balance)
                            .div(100)
                            .mul(this.configs.gasFeePercent)
                            .floor()
                            .toNumber(),
                    });
                    feeTransaction.add(instruction);
                    // feeTransaction.feePayer = gasFeesWallet.publicKey;
                    const recentBlockhash = yield this.connection.getRecentBlockhash();
                    feeTransaction.recentBlockhash = recentBlockhash.blockhash;
                    // feeTransaction.sign(wallet, gasFeesWallet);
                    feeTransaction.sign(wallet);
                    // console.log({ feeTransaction });
                    //6/16/2024 end add
                    yield (0, send_bundle_1.bull_dozer)(this.connection, this.searcher, [transaction, feeTransaction]);
                }
                catch (error) {
                    console.error(error);
                }
            }
            return;
        });
    }
    selectWalletToBuy(neededSolAmount) {
        return __awaiter(this, void 0, void 0, function* () {
            let availableWalletList = [];
            let maxWalletNum = 0, maxBalance = 0;
            for (let i = 0; i < this.walletList.length; i++) {
                const balance = yield this.getSolBalance(this.walletList[i].publicKey);
                if (balance > maxBalance) {
                    maxBalance = balance;
                    maxWalletNum = i;
                }
                if (neededSolAmount <= balance)
                    availableWalletList.push(this.walletList[i]);
                yield (0, sleep_1.sleep)(200);
            }
            if (maxBalance == 0)
                return null;
            if (availableWalletList.length == 0)
                return this.walletList[maxWalletNum];
            else
                return availableWalletList[Math.floor(Math.random() * availableWalletList.length)];
        });
    }
    selectWalletToSell() {
        return __awaiter(this, void 0, void 0, function* () {
            let maxWalletNum = 0, maxBalance = 0;
            for (let i = 0; i < this.walletList.length; i++) {
                const balance = yield this.getTokenBalance(this.walletList[i].publicKey);
                if (balance > maxBalance) {
                    maxBalance = balance;
                    maxWalletNum = i;
                }
                yield (0, sleep_1.sleep)(200);
            }
            if (maxBalance == 0)
                return { wallet: null, balance: 0 };
            else
                return { wallet: this.walletList[maxWalletNum], balance: maxBalance };
        });
    }
    getSolBalance(walletAddress) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this.connection.getBalance(walletAddress);
            }
            catch (error) {
                return 0;
            }
        });
    }
    getTokenBalance(walletAddress) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const account = yield spl_token_1.Token.getAssociatedTokenAddress(spl_token_1.ASSOCIATED_TOKEN_PROGRAM_ID, spl_token_1.TOKEN_PROGRAM_ID, new web3_js_1.PublicKey(this.targetToken.address), walletAddress);
                const balance = Number((yield this.connection.getTokenAccountBalance(account)).value.amount) || 0;
                return balance;
            }
            catch (error) {
                return 0;
            }
        });
    }
}
exports.TrendTrade = TrendTrade;
//# sourceMappingURL=trendTrade.js.map