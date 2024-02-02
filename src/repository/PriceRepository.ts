import { Dayjs } from "dayjs";
import { Knex } from "knex";

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

	async getAvgForLastXDays(numOfDays: number): Promise<number> {
		const result = await this.db(this.tableName)
			.avg("close")
			.orderBy("date", "desc")
			.limit(numOfDays)
			.first();

		return result?.close || 0;
	}
}

export default PriceRepository;
