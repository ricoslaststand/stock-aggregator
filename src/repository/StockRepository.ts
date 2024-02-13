import { Knex } from "knex";
import { Stock } from "../domain/Stock";

class StockRepository {
	private db: Knex;
	private tableName: string;

	constructor(db: Knex) {
		this.db = db;
		this.tableName = "stocks";
	}

	async getStocks(): Promise<Stock[]> {
		const results = await this.db(this.tableName).orderBy("ticker_symbol");

		return results.map(
			(result): Stock => ({
				tickerSymbol: result.ticker_symbol,
				name: result.name,
				industry: result.sector,
			}),
		);
	}
}

export default StockRepository;
