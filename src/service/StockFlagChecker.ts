export interface IStockFlagChecker {
	checkFlag(tickerSymbol: string, date: Date): Promise<boolean>;
	getReason(): string;
}
