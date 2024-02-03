import dayjs = require("dayjs");

import PriceRepository from "../repository/PriceRepository";
import StockRepository from "../repository/StockRepository";
import { IStockFlagChecker } from "./StockFlagChecker";

class StockFlagger {
	private priceRepo: PriceRepository;
	private stockRepo: StockRepository;
	private stockFlags: IStockFlagChecker[];

	constructor(priceRepo: PriceRepository) {
		this.priceRepo = priceRepo;
	}

	async checkAllStocks(): Promise<void> {
		const stocks = await this.stockRepo.getStocks();
		const [startDate, endDate] = this.generateDateRange();
		const dates = this.generateListOfDates(startDate, endDate);

		for (const stock of stocks) {
			const { tickerSymbol } = stock;

			for (const date of dates) {
				let reasons = "";

				for (const stockFlag of this.stockFlags) {
					const isFlagged = await stockFlag.checkFlag(tickerSymbol, date);

					if (isFlagged) {
						reasons += stockFlag.getReason();
					}
				}
			}
		}
	}

	private generateDateRange(): [Date, Date] {
		const today = dayjs(new Date()).startOf("D");

		const startDate = today.clone().subtract(180);

		return [startDate.toDate(), today.toDate()];
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
