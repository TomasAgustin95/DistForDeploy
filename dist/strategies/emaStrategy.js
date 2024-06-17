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
exports.EmaStrategy = void 0;
const decimal_js_1 = __importDefault(require("decimal.js"));
const cross_fetch_1 = __importDefault(require("cross-fetch"));
const indicators_1 = require("@ixjb94/indicators");
class EmaStrategy {
    constructor(tokenAddress, longTerm, shortTerm, emaCalcDuring, apiKey) {
        this.tokenAddress = tokenAddress;
        this.longTerm = longTerm;
        this.shortTerm = shortTerm;
        this.emaCalcDuring = emaCalcDuring;
        this.apiKey = apiKey;
        this.isShortUp = 0;
    }
    getEmaSignal() {
        return __awaiter(this, void 0, void 0, function* () {
            // console.log("starttime:", new Date().toLocaleString());
            const longEma = yield this.getEMA(this.longTerm);
            const shortEma = yield this.getEMA(this.shortTerm);
            // console.log("endtime:", new Date().toLocaleString());
            console.log(`EMA ${this.shortTerm} close: ${shortEma}, EMA ${this.longTerm} close: ${longEma}`);
            if (shortEma > longEma)
                console.log(`EMA${this.shortTerm} close > EMA${this.longTerm} close`);
            else
                console.log(`EMA${this.longTerm} close > EMA${this.shortTerm} close`);
            const newIsShortUp = shortEma > longEma ? 1 : -1;
            let isOvercross;
            let swapType = '';
            // console.log("newIsShortUp, this.isShortUp, longEma, shortEma");
            console.log(newIsShortUp, this.isShortUp);
            if (newIsShortUp != this.isShortUp && this.isShortUp != 0 && longEma != 0 && shortEma != 0) {
                isOvercross = true;
                swapType = newIsShortUp == 1 ? 'buy' : 'sell';
            }
            else {
                isOvercross = false;
            }
            this.isShortUp = newIsShortUp;
            console.log({ isOvercross, swapType });
            return { isOvercross, swapType };
            // return { isOvercross: true, swapType: 'buy' };
        });
    }
    getEMA(term) {
        return __awaiter(this, void 0, void 0, function* () {
            const options = {
                method: 'GET',
                headers: {
                    'X-API-KEY': this.apiKey,
                },
            };
            const temp_term = term; // add 30 to add correctivity
            const timeTo = new decimal_js_1.default(Date.now())
                .dividedBy(1000)
                .floor()
                .minus(new decimal_js_1.default(Date.now()).dividedBy(1000).floor().modulo(60));
            const timeFrom = timeTo.minus(temp_term * this.emaCalcDuring * 60);
            try {
                // const startTime = performance.now();
                // console.log("Start Time:", startTime);
                const result = yield (yield (0, cross_fetch_1.default)(`https://public-api.birdeye.so/defi/history_price?address=${this.tokenAddress}&address_type=token&type=${this.emaCalcDuring}m&time_from=${timeFrom}&time_to=${timeTo}`, options)).json();
                // const finishedTime = performance.now();
                // console.log("Finished Time:", finishedTime);
                // console.log('this.tokenAddress, this.emaCalcDuring, timeFrom, timeTo');
                // console.log(this.tokenAddress, this.emaCalcDuring, timeFrom, timeTo);
                // console.log('result', result.data.items);
                if (result.success) {
                    let priceArray = [];
                    for (let i = 0; i < temp_term; i++) {
                        priceArray.push(Number(result.data.items[i].value));
                    }
                    const indicators = new indicators_1.IndicatorsNormalizedSync();
                    const emaArray = indicators.ema(priceArray, term);
                    // console.log("emaArray", emaArray[temp_term - 1]);
                    // console.log("priceArray", priceArray);
                    return emaArray[temp_term - 1];
                }
                else
                    return 0;
            }
            catch (error) {
                return 0;
            }
        });
    }
}
exports.EmaStrategy = EmaStrategy;
//# sourceMappingURL=emaStrategy.js.map