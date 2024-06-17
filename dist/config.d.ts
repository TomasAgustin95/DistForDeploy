import Decimal from 'decimal.js';
import { Keypair } from '@solana/web3.js';
export declare const getConfigs: () => Config;
export interface Config {
    workMord: string;
    solanaRpcEndpoind: string;
    rpcWebsocketEndpoint: string;
    blockEngineUrl: string;
    enableTrading: boolean;
    walletNumber: number;
    tokenAddress: string;
    swapAmountPercent: Decimal;
    swapAmountPercentEma: number;
    swapAmountMax: number;
    swapAmountMin: number;
    slippage: number;
    emaApiKey: string;
    emaLongTerm: number;
    emaShortTerm: number;
    emaCalcDuring: number;
    jitoAuthKey: Keypair;
    intervalMarketMaker: number;
    intervalTradeTrend: number;
    startTime: string;
    endTime: string;
    changeLiquidityPercents: {
        liquidityAmount: Decimal;
        changePercent: Decimal;
    }[];
    priceImpact: number;
    gasFeePercent: number;
    gasFeesWallet: Keypair;
}
