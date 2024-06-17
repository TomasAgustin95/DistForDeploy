import { Connection } from '@solana/web3.js';
import { SearcherClient } from 'jito-ts/dist/sdk/block-engine/searcher';
export declare function bull_dozer(connection: Connection, searcher: SearcherClient, txs: any): Promise<void>;
