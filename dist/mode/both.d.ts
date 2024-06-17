import { Connection, Keypair } from '@solana/web3.js';
import { Config } from '../config';
import { MarketMaker } from './market-maker';
import { TrendTrade } from './trendTrade';
export declare class Both {
    configs: Config;
    marketMaker: MarketMaker;
    trendTrade: TrendTrade;
    constructor(connection: Connection, walletList: Keypair[], decimals: number);
    run(): Promise<void>;
    runTrendTrade: () => Promise<void>;
    runMarktMaker: () => Promise<void>;
    isValidTime: () => boolean;
}
