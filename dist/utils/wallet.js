"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getKeypairFromString = exports.getUserKeypair = void 0;
const fs_1 = __importDefault(require("fs"));
const web3_js_1 = require("@solana/web3.js");
const USER_HOME = require('os').homedir();
const USER_KEYPAIR_PATH = require('path').join(USER_HOME, '.config/solana/id.json');
function loadKeypairFromFile(filePath) {
    try {
        const fileContent = fs_1.default.readFileSync(filePath, { encoding: 'utf8' });
        const secretKeyArray = JSON.parse(fileContent);
        return web3_js_1.Keypair.fromSecretKey(Uint8Array.from(secretKeyArray));
    }
    catch (error) {
        console.error(`Errore durante il caricamento della chiave privata da ${filePath}:`, error);
        process.exit(1);
    }
}
function getUserKeypair() {
    return loadKeypairFromFile(USER_KEYPAIR_PATH);
}
exports.getUserKeypair = getUserKeypair;
function getKeypairFromString(secretKey) {
    try {
        const keypair = web3_js_1.Keypair.fromSecretKey(new Uint8Array(secretKey.split(',').map((val) => Number(val))));
        return keypair;
    }
    catch (error) {
        throw new Error(`SECRET_KEY is bad`);
    }
}
exports.getKeypairFromString = getKeypairFromString;
//# sourceMappingURL=wallet.js.map