import { Connection } from '@solana/web3.js';
import { SearcherClient } from 'jito-ts/dist/sdk/block-engine/searcher';
export declare function build_bundle(connection: Connection, search: SearcherClient, bundleTransactionLimit: number, txns: any): Promise<false | undefined>;
