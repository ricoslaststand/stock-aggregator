import { Dayjs } from "dayjs";
import { Knex } from "knex";

import { StockPrice } from "../domain/Stock";

class PriceRepository {
	private db: Knex;
	private tableName: string;

	constructor(db: Knex) {
		this.db = db;
		this.tableName = "daily_stock_prices";
	}

	async getLastDaysOfPriceChange(date: Dayjs, numDays = 30) {
		return await this.db("daily_price_changes")
			.whereRaw("date <= ?", [date])
			.orderBy("date", "desc")
			.limit(numDays);
	}

	async getStockPrices(params: {
		startDate: Date;
		endDate: Date;
		tickerSymbol: string;
	}): Promise<StockPrice[]> {
		const { tickerSymbol } = params;

		const result = await this.db(this.tableName)
			.where("ticker_symbol", tickerSymbol)
			.andWhereBetween("date", [params.startDate, params.endDate])
			.orderBy("date", "asc");

		return result.map(this.formatItemToStockPrice);
	}

	async getLastXStockPrices(params: {
		startDate: Date;
		numOfPrices: number;
		tickerSymbol: string;
	}): Promise<StockPrice[]> {
		const result = await this.db(this.tableName)
			.where("ticker_symbol", params.tickerSymbol)
			.andWhereRaw("date <= ?", [params.startDate])
			.orderBy("date", "asc")
			.limit(params.numOfPrices);

		return result.map(this.formatItemToStockPrice);
	}

	async getAvgForLastXDays(numOfDays: number): Promise<number> {
		const result = await this.db(this.tableName)
			.avg("close")
			.orderBy("date", "desc")
			.limit(numOfDays)
			.first();

		return result?.close || 0;
	}

	private formatItemToStockPrice(item: any): StockPrice {
		return {
			tickerSymbol: item.ticker_symbol,
			date: item.date,
			volume: item.volume,
			high: item.high,
			low: item.low,
			open: item.open,
			close: item.close,
			adjClose: item.close,
		};
	}
}

export default PriceRepository;
