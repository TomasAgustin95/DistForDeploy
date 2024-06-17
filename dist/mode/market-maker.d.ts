import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import Decimal from 'decimal.js';
import { SearcherClient } from 'jito-ts/dist/sdk/block-engine/searcher';
import { Config } from '../config';
import { DexScreener } from '../api/dexScreener';
import { RaydiumClient } from '../api/raydium';
export declare class MarketMaker {
    configs: Config;
    connection: Connection;
    walletList: Keypair[];
    targetToken: {
        address: string;
        symbol: string;
        decimals: number;
    };
    solToken: {
        address: string;
        symbol: string;
        decimals: number;
    };
    priceTolerance: number;
    rebalancePercentage: number;
    raydiumClient: RaydiumClient;
    prevLiquidityAmount: Decimal;
    searcher: SearcherClient;
    dexScreenerApi: DexScreener;
    constructor(connection: Connection, walletList: Keypair[], decimals: number);
    getSearcher(): SearcherClient;
    run(): Promise<void>;
    evaluateAndExecuteTrade(): Promise<void>;
    determineTradeNecessity(): Promise<{
        tradeNeeded: Boolean;
        targetTokenAmountToTrade: Decimal;
    }>;
    selectWallet(neededSolAmount: Decimal): Promise<any>;
    getSolBalance(walletAddress: PublicKey): Promise<Decimal>;
    makeTrasactions(targetTokenAmountToTrade: Decimal): Promise<{
        buyTransaction: any;
        sellTransaction: any;
        feeTransaction?: any;
    }>;
}
