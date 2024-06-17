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
exports.bull_dozer = void 0;
const build_bundle_1 = require("./build-bundle");
function bull_dozer(connection, searcher, txs) {
    return __awaiter(this, void 0, void 0, function* () {
        const bundleTransactionLimit = parseInt('4');
        try {
            yield (0, build_bundle_1.build_bundle)(connection, searcher, bundleTransactionLimit, txs);
        }
        catch (error) {
            console.error(error);
        }
    });
}
exports.bull_dozer = bull_dozer;
//# sourceMappingURL=send-bundle.js.map