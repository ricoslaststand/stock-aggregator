import dayjs from "dayjs";
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';

dayjs.extend(isSameOrBefore)

import PriceRepository from "@repository/PriceRepository";
import StockRepository from "@repository/StockRepository";
import { IStockFlagChecker } from "@service/StockFlagChecker";

class StockFlagger {
	private priceRepo: PriceRepository;
	private stockRepo: StockRepository;
	private stockFlags: IStockFlagChecker[];

	constructor(priceRepo: PriceRepository, stockRepo: StockRepository, stockFlags: IStockFlagChecker[]) {
		this.priceRepo = priceRepo;
		this.stockRepo = stockRepo;
		this.stockFlags = stockFlags;
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

				console.log(`Stock ${tickerSymbol}, date: ${date.getUTCDate()}, reasons: ${reasons}`);
			}
		}

		console.log(`Fetched ${stocks.length} stocks`);
	}

	private generateDateRange(): [Date, Date] {
		const today = dayjs(new Date()).startOf("D");

		const startDate = today.clone().subtract(10);

		return [startDate.toDate(), today.toDate()];
	}

	private generateListOfDates(startDate: Date, endDate: Date): Date[] {
		const results: Date[] = [];

		let startDay = dayjs(startDate);
		const endDay = dayjs(endDate);

		while (startDay.isSameOrBefore(endDay, "d")) {
			results.push(startDay.toDate());
			startDay = startDay.add(1, "d");
		}

		return results;
	}
}

export default StockFlagger;
