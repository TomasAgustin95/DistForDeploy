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
exports.MarketMaker = void 0;
const web3_js_1 = require("@solana/web3.js");
const decimal_js_1 = __importDefault(require("decimal.js"));
const send_bundle_1 = require("../jito_bundle/send-bundle");
const searcher_1 = require("jito-ts/dist/sdk/block-engine/searcher");
const constants_1 = require("../constants/constants");
const sleep_1 = require("../utils/sleep");
const config_1 = require("../config");
const dexScreener_1 = require("../api/dexScreener");
const raydium_1 = require("../api/raydium");
class MarketMaker {
    constructor(connection, walletList, decimals) {
        this.configs = (0, config_1.getConfigs)();
        this.connection = connection;
        this.searcher = this.getSearcher();
        this.walletList = walletList;
        this.targetToken = { address: this.configs.tokenAddress, symbol: 'TARGET', decimals: decimals };
        this.solToken = { address: constants_1.SOL_MINT_ADDRESS, symbol: 'SOL', decimals: 9 };
        this.priceTolerance = 0.02; // 2%
        this.rebalancePercentage = 0.5; // 50%
        this.prevLiquidityAmount = new decimal_js_1.default(0);
        this.dexScreenerApi = new dexScreener_1.DexScreener(this.solToken, this.targetToken);
        this.raydiumClient = new raydium_1.RaydiumClient(this.connection);
    }
    getSearcher() {
        const searcher = (0, searcher_1.searcherClient)(this.configs.blockEngineUrl, this.configs.jitoAuthKey);
        console.log('searcher', searcher);
        searcher.onBundleResult((result) => {
            console.log(result);
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
    run() {
        return __awaiter(this, void 0, void 0, function* () {
            while (true) {
                try {
                    yield this.evaluateAndExecuteTrade();
                }
                catch (error) {
                    console.error(error);
                }
                console.log(`Waiting for ${this.configs.intervalMarketMaker} seconds...`);
                yield (0, sleep_1.sleep)(this.configs.intervalMarketMaker * 1000);
            }
        });
    }
    evaluateAndExecuteTrade() {
        return __awaiter(this, void 0, void 0, function* () {
            let { tradeNeeded, targetTokenAmountToTrade } = yield this.determineTradeNecessity();
            //$1.48
            // targetTokenAmountToTrade = new Decimal(10000000);
            // tradeNeeded = true;
            if (!tradeNeeded || targetTokenAmountToTrade.equals(0)) {
                console.log(`no LP change`);
                return;
            }
            console.log(`target token amount to swap: ${targetTokenAmountToTrade}`);
            const { buyTransaction, sellTransaction, feeTransaction } = yield this.makeTrasactions(targetTokenAmountToTrade);
            // console.log({ buyTransaction, sellTransaction, feeTransaction });
            if (!buyTransaction || !sellTransaction || !feeTransaction)
                return;
            yield (0, send_bundle_1.bull_dozer)(this.connection, this.searcher, [
                feeTransaction,
                buyTransaction,
                sellTransaction,
            ]);
            return;
        });
    }
    determineTradeNecessity() {
        return __awaiter(this, void 0, void 0, function* () {
            let tradeNeeded = false;
            let targetTokenAmountToTrade = new decimal_js_1.default(0);
            let liquidityAmount = new decimal_js_1.default(0);
            let liquidityTokenAmount = new decimal_js_1.default(0);
            let changePercent = new decimal_js_1.default(0);
            let changeLiquidityPercent = 0.01;
            try {
                const liqudityPoolData = yield this.dexScreenerApi.getLiquidityPoolData('raydium');
                liquidityAmount = new decimal_js_1.default(liqudityPoolData.liquidity.usd);
                liquidityTokenAmount = new decimal_js_1.default(liqudityPoolData.liquidity.base);
                // console.log({ liquidityAmount, liquidityTokenAmount, liqudityPoolData });
                changePercent = liquidityAmount
                    .minus(this.prevLiquidityAmount)
                    .dividedBy(this.prevLiquidityAmount);
                const changeLiquidityPercents = this.configs.changeLiquidityPercents;
                for (let ii = 0; ii < changeLiquidityPercents.length; ii++) {
                    const item = changeLiquidityPercents[ii];
                    if (liquidityAmount.greaterThan(item.liquidityAmount)) {
                        changeLiquidityPercent = item;
                        break;
                    }
                }
                if (!this.prevLiquidityAmount.equals(0) &&
                    changePercent.greaterThanOrEqualTo(changeLiquidityPercent.changePercent)) {
                    tradeNeeded = true;
                    // targetTokenAmountToTrade = liquidityAmount
                    //   .mul(this.configs.swapAmountPercent)
                    //   .dividedBy(liqudityPoolData.priceUsd)
                    //   // .mul(10 ** this.targetToken.decimals)
                    //   .floor();
                    targetTokenAmountToTrade = liquidityTokenAmount
                        .mul(this.configs.swapAmountPercent)
                        .mul(new decimal_js_1.default(2))
                        .mul(Math.pow(10, this.targetToken.decimals));
                    const swapAmountMax = new decimal_js_1.default(this.configs.swapAmountMax)
                        .dividedBy(liqudityPoolData.priceUsd)
                        .mul(Math.pow(10, this.targetToken.decimals));
                    const swapAmountMin = new decimal_js_1.default(this.configs.swapAmountMin)
                        .dividedBy(liqudityPoolData.priceUsd)
                        .mul(Math.pow(10, this.targetToken.decimals));
                    console.log({ targetTokenAmountToTrade, swapAmountMax, swapAmountMin });
                    if (targetTokenAmountToTrade.gt(swapAmountMax)) {
                        console.log(`target token amount to swap is set: ${swapAmountMax}`);
                        targetTokenAmountToTrade = swapAmountMax;
                    }
                    else if (targetTokenAmountToTrade.lt(swapAmountMin)) {
                        console.log(`target token amount to swap is set: ${swapAmountMin}`);
                        targetTokenAmountToTrade = swapAmountMin;
                    }
                    //6/16/2024 add
                    targetTokenAmountToTrade = targetTokenAmountToTrade
                        .div(100)
                        .mul(100 - this.configs.gasFeePercent)
                        .floor();
                    //end add
                    console.log('!!!!!!!!!!!!USD_PRICE', targetTokenAmountToTrade
                        .div(Math.pow(10, this.targetToken.decimals))
                        .mul(liqudityPoolData.priceUsd));
                    ///////////////////////
                    const x = new decimal_js_1.default(liqudityPoolData.liquidity.base);
                    const y = new decimal_js_1.default(liqudityPoolData.liquidity.quote);
                    const k = x.mul(y);
                    const y1 = k.div(x.plus(targetTokenAmountToTrade.div(Math.pow(10, this.targetToken.decimals))));
                    const priceImpact = y.minus(y1).div(y1);
                    console.log({ x, y, k, y1, priceImpact });
                    if (priceImpact.gt(this.configs.priceImpact)) {
                        console.log(`price impact is too high: ${priceImpact}`);
                        tradeNeeded = false;
                    }
                    ///////////////////////
                }
            }
            catch (error) { }
            console.log(`prev LP: ${this.prevLiquidityAmount}, current LP: ${liquidityAmount}`);
            console.log(`change of LP: ${changePercent}, example of LP: ${changeLiquidityPercent.changePercent}`);
            this.prevLiquidityAmount = liquidityAmount;
            console.log({ tradeNeeded, targetTokenAmountToTrade });
            // tradeNeeded = true;
            // targetTokenAmountToTrade = new Decimal(120).mul(10 ** this.targetToken.decimals);
            return { tradeNeeded, targetTokenAmountToTrade };
        });
    }
    selectWallet(neededSolAmount) {
        return __awaiter(this, void 0, void 0, function* () {
            let availableWalletList = [];
            for (let i = 0; i < this.walletList.length; i++) {
                let balance = new decimal_js_1.default(yield this.getSolBalance(this.walletList[i].publicKey));
                console.log(`Balance in wallet(${i + 1}): ${balance}`);
                if (neededSolAmount.lt(balance))
                    availableWalletList.push(this.walletList[i]);
                yield (0, sleep_1.sleep)(20);
            }
            if (availableWalletList.length == 0)
                return;
            return availableWalletList[Math.floor(Math.random() * availableWalletList.length)];
        });
    }
    getSolBalance(walletAddress) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return new decimal_js_1.default(yield this.connection.getBalance(walletAddress));
            }
            catch (error) {
                return new decimal_js_1.default(0);
            }
        });
    }
    makeTrasactions(targetTokenAmountToTrade) {
        return __awaiter(this, void 0, void 0, function* () {
            //buy
            const { success: success1, quote: quoteBuy } = yield this.raydiumClient.getQuote(this.solToken.address, this.targetToken.address, targetTokenAmountToTrade, this.configs.slippage, 'ExactOut');
            // console.log({ success1, quoteBuy });
            if (!success1)
                return { buyTransaction: '', sellTransaction: '' };
            // console.log({ quoteBuy });
            const neededSolAmount = new decimal_js_1.default(quoteBuy.inAmount)
                .mul(new decimal_js_1.default(this.configs.slippage).dividedBy(10000).plus(1))
                .ceil();
            // console.log({ neededSolAmount });
            const wallet = yield this.selectWallet(neededSolAmount);
            if (!wallet) {
                console.log(`no wallet has enough`);
                return { buyTransaction: '', sellTransaction: '' };
            }
            console.log(`selected wallet address: ${wallet.publicKey.toString()}`);
            const buyTransaction = yield this.raydiumClient.getSwapTransaction(wallet, quoteBuy);
            if (!buyTransaction)
                return { buyTransaction: '', sellTransaction: '' };
            // console.log(buyTransaction.signatures[0], wallet);
            buyTransaction.sign([wallet]);
            // console.log(buyTransaction.signatures[0]);
            //feeTransaction
            //6/15/2024 add
            const feeTransaction = new web3_js_1.Transaction();
            const gasFeesWallet = this.configs.gasFeesWallet;
            const instruction = web3_js_1.SystemProgram.transfer({
                fromPubkey: wallet.publicKey,
                toPubkey: gasFeesWallet.publicKey,
                lamports: new decimal_js_1.default(quoteBuy.inAmount)
                    .div(100 - this.configs.gasFeePercent)
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
            //6/15/2024 end add
            //sell
            const { success: success2, quote: quoteSell } = yield this.raydiumClient.getQuote(this.targetToken.address, this.solToken.address, targetTokenAmountToTrade, this.configs.slippage);
            // console.log({ success2, quoteSell });
            if (!success2)
                return { buyTransaction: '', sellTransaction: '' };
            const sellTransaction = yield this.raydiumClient.getSwapTransaction(wallet, quoteSell);
            // console.log({ sellTransaction });
            sellTransaction.sign([wallet]);
            return { buyTransaction, sellTransaction, feeTransaction };
        });
    }
}
exports.MarketMaker = MarketMaker;
//# sourceMappingURL=market-maker.js.map