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
exports.DexScreener = void 0;
class DexScreener {
    constructor(tokenA, tokenB) {
        this.baseUrl = 'https://api.dexscreener.com/latest/dex/tokens/';
        this.tokenA = tokenA;
        this.tokenB = tokenB;
    }
    getLiquidityPoolData(dexId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const url = `https://api.dexscreener.com/latest/dex/tokens/${this.tokenB.address}`;
                const response = yield fetch(url);
                const liqudityPoolList = (yield response.json()).pairs;
                const liqudityPoolData = liqudityPoolList.filter((liquidity) => {
                    return (liquidity.dexId =
                        dexId &&
                            (liquidity.quoteToken.address == this.tokenB.address ||
                                liquidity.baseToken.address == this.tokenB.address));
                })[0];
                return liqudityPoolData;
            }
            catch (error) {
                console.warn('no pool data');
                return null;
            }
        });
    }
}
exports.DexScreener = DexScreener;
//# sourceMappingURL=dexScreener.js.map