export declare class EmaStrategy {
    tokenAddress: string;
    longTerm: number;
    shortTerm: number;
    emaCalcDuring: number;
    apiKey: string;
    isShortUp: number;
    constructor(tokenAddress: string, longTerm: number, shortTerm: number, emaCalcDuring: number, apiKey: string);
    getEmaSignal(): Promise<{
        isOvercross: boolean;
        swapType: string;
    }>;
    getEMA(term: number): Promise<number>;
}
