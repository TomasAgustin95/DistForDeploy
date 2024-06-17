import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import { Config } from '../config';
import { EmaStrategy } from '../strategies/emaStrategy';
import { DexScreener } from '../api/dexScreener';
import { RaydiumClient } from '../api/raydium';
import { MarketMaker } from './market-maker';
import { SearcherClient } from 'jito-ts/dist/sdk/block-engine/searcher';
export declare class TrendTrade {
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
    emaStrategy: EmaStrategy;
    dexScreenerApi: DexScreener;
    raydiumApi: RaydiumClient;
    searcher: SearcherClient;
    marketMaker: MarketMaker;
    constructor(connection: Connection, walletList: Keypair[], decimals: number);
    getSearcher(): SearcherClient;
    run(): Promise<void>;
    evaluateAndExecuteTrade(): Promise<void>;
    selectWalletToBuy(neededSolAmount: number): Promise<Keypair | any>;
    selectWalletToSell(): Promise<{
        wallet: Keypair | any;
        balance: number;
    }>;
    getSolBalance(walletAddress: PublicKey): Promise<number>;
    getTokenBalance(walletAddress: PublicKey): Promise<number>;
}
