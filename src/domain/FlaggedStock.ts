export interface FlaggedStock {
	tickerSymbol: string;
	date: Date;
	close: number;
	reasons: string[];
}
