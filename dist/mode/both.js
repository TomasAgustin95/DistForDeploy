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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Both = void 0;
const config_1 = require("../config");
const market_maker_1 = require("./market-maker");
const trendTrade_1 = require("./trendTrade");
const sleep_1 = require("../utils/sleep");
class Both {
    constructor(connection, walletList, decimals) {
        this.runTrendTrade = () => __awaiter(this, void 0, void 0, function* () {
            if (!this.isValidTime())
                return;
            try {
                yield this.trendTrade.evaluateAndExecuteTrade(); //ema
            }
            catch (error) { }
            return;
        });
        this.runMarktMaker = () => __awaiter(this, void 0, void 0, function* () {
            if (!this.isValidTime())
                return;
            try {
                yield this.marketMaker.evaluateAndExecuteTrade(); //bundle
            }
            catch (error) { }
            return;
        });
        this.isValidTime = () => {
            if (this.configs.startTime == '' || this.configs.endTime == '')
                return true;
            let date = new Date();
            let current = Number(date.getTime()) + date.getTimezoneOffset() * 60 * 1000;
            let start = Number(new Date(this.configs.startTime).getTime());
            let end = Number(new Date(this.configs.endTime).getTime());
            if (start <= current && current <= end)
                return true;
            else {
                console.log('not in valid period.');
                return false;
            }
        };
        this.configs = (0, config_1.getConfigs)();
        this.marketMaker = new market_maker_1.MarketMaker(connection, walletList, decimals);
        this.trendTrade = new trendTrade_1.TrendTrade(connection, walletList, decimals);
    }
    run() {
        return __awaiter(this, void 0, void 0, function* () {
            this.isValidTime();
            // console.log('this.configs.intervalMarketMaker, this.configs.intervalTradeTrend');
            // console.log(this.configs.intervalMarketMaker, this.configs.intervalTradeTrend);
            setInterval(this.runTrendTrade, this.configs.intervalTradeTrend * 1000);
            yield (0, sleep_1.sleep)((this.configs.intervalTradeTrend - 3) * 1000);
            setInterval(this.runMarktMaker, this.configs.intervalMarketMaker * 1000);
            return;
        });
    }
}
exports.Both = Both;
//# sourceMappingURL=both.js.map