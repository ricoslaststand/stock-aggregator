import { Dayjs } from "dayjs";
import { Knex } from "knex";

import { StockPrice } from "@domain/Stock";

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
			.andWhereBetween("`date`", [params.startDate, params.endDate])
			.orderBy("`date`", "asc");

		return result.map(this.formatItemToStockPrice);
	}

	async getLastXStockPrices(params: {
		startDate: Date;
		numOfPrices: number;
		tickerSymbol: string;
	}): Promise<StockPrice[]> {
		const result = await this.db(this.tableName)
			.where("ticker_symbol", params.tickerSymbol)
			.where("date", "<=", params.startDate)
			.orderBy("date", "desc")
			.limit(params.numOfPrices);

		return result.map(this.formatItemToStockPrice);
	}

	async getAvgPriceForLastXDays(
		tickerSymbol: string,
		numOfDays: number,
	): Promise<number> {
		const result = await this.db(this.tableName)
			.avg("close")
			.orderBy("`date`", "desc")
			.where("ticker_symbol", tickerSymbol)
			.limit(numOfDays)
			.first();

		return result?.close || 0;
	}

	async getAvgVolumeForLastXDays(
		tickerSymbol: string,
		numOfDays: number,
		endDate: Date = new Date(),
	): Promise<number> {
		const result = await this.db(this.tableName)
			.select("date")
			.avg("volume as volume")
			.where("ticker_symbol", tickerSymbol)
			.andWhere("date", "<=", endDate)
			.orderBy("date", "desc")
			.groupBy("date")
			.limit(numOfDays)
			.first();

		return result?.volume || 0;
	}

	private formatItemToStockPrice(item: any): StockPrice {
		return {
			tickerSymbol: item.ticker_symbol,
			date: item.date,
			volume: Number(item.volume),
			high: Number(item.high),
			low: Number(item.low),
			open: Number(item.open),
			close: Number(item.close),
			adjClose: Number(item.close),
		};
	}
}

export default PriceRepository;
