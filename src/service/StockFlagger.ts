import dayjs = require("dayjs");

import PriceRepository from "../repository/PriceRepository";
import StockRepository from "../repository/StockRepository";

class StockFlagger {
	private priceRepo: PriceRepository;
	private stockRepo: StockRepository;
	private stockFlags: StockFlagChecker[];

	constructor(priceRepo: PriceRepository) {
		this.priceRepo = priceRepo;
	}

	async checkAllStocks(): Promise<void> {
		const stocks = await this.stockRepo.getStocks();
		const dates = this.generateListOfDates();

		for (const stock of stocks) {
			const { tickerSymbol } = stock;
		}
	}

	private generateListOfDates(startDate: Date, endDate: Date): Date[] {
		const results: Date[] = [];

		const startDay = dayjs(startDate);
		const endDay = dayjs(endDate);

		while (endDay.isBefore(startDay, "D") || endDay.isSame(endDay, "D")) {
			results.push(startDay.toDate());
			startDay.add(1, "D");
		}

		return results;
	}
}

export default StockFlagger;
