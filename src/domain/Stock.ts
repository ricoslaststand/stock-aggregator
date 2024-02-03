export type Stock = {
	tickerSymbol: string;
	name: string;
	industry: string;
};

export type StockPrice = {
	tickerSymbol: string;
	date: Date;
	open: number;
	high: number;
	low: number;
	volume: number;
	close: number;
	adjClose: number;
};
