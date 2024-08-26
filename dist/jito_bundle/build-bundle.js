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
exports.build_bundle = void 0;
const web3_js_1 = require("@solana/web3.js");
const types_1 = require("jito-ts/dist/sdk/block-engine/types");
const utils_1 = require("jito-ts/dist/sdk/block-engine/utils");
const wallet_1 = require("../utils/wallet");
function build_bundle(connection, search, bundleTransactionLimit, txns) {
    return __awaiter(this, void 0, void 0, function* () {
        if (txns.length > bundleTransactionLimit) {
            console.error('Exceeded bundleTransactionLimit');
            return false;
        }
        const _tipAccount = (yield search.getTipAccounts())[0];
        const tipAccount = new web3_js_1.PublicKey(_tipAccount);
        const bund = new types_1.Bundle([], bundleTransactionLimit);
        const resp = yield connection.getLatestBlockhash('finalized');
        for (let i = 0; i < txns.length; i++) {
            bund.addTransactions(txns[i]);
        }
        // console.log('bund', bund);
        const jitoFeeKeypair = (0, wallet_1.getKeypairFromString)(new String(process.env.JITO_FEE_SECRET_KEY));
        let maybeBundle = bund.addTipTx(jitoFeeKeypair, Number(process.env.JITO_FEE) ||
            1000000 /*  500000  /* 300000 */ /* 200000 */ /* 100000 */ /* 50000 */ /* 10000 */ /*  5000 */ /* 1000 */, tipAccount, resp.blockhash);
        console.log('maybeBundle', maybeBundle);
        // console.log(
        //   '!!!!!!!!!!!!!!!!!!!!!!maybeBundle',
        //   util.inspect(maybeBundle, { showHidden: false, depth: null })
        // );
        if ((0, utils_1.isError)(maybeBundle)) {
            return;
        }
        try {
            // console.log('maybeBundle', maybeBundle);
            const response_bund = yield search.sendBundle(maybeBundle);
            console.log('bundle is sent');
            console.log(`https://explorer.jito.wtf/bundle/${response_bund}`);
        }
        catch (err) {
            console.error(err);
        }
        return;
    });
}
exports.build_bundle = build_bundle;
//# sourceMappingURL=build-bundle.js.map