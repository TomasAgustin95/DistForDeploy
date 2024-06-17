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
exports.getDecimal = void 0;
const web3_js_1 = require("@solana/web3.js");
// const { getAccount, getMint } = require('@solana/spl-token');
/**
 * get token decimal from token address
 * @param {Connection} connection - connection
 * @param {string} tokenAddress - token address
 * @returns {number} - Decimal of token
 */
function getDecimal(connection, tokenAddress) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const info = (_a = (yield connection.getParsedAccountInfo(new web3_js_1.PublicKey(tokenAddress))).value) === null || _a === void 0 ? void 0 : _a.data;
            return info.parsed.info.decimals;
        }
        catch (error) {
            return 0;
        }
    });
}
exports.getDecimal = getDecimal;
//# sourceMappingURL=getDecimal.js.map