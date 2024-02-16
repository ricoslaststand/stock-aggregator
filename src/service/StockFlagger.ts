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

		const hits = []

		for (const stock of stocks) {
			const { tickerSymbol } = stock;

			for (const date of dates) {
				let reasons = [];

				let meetsAllFlags = true;

				for (const stockFlag of this.stockFlags) {
					const isFlagged = await stockFlag.checkFlag(tickerSymbol, date);

					meetsAllFlags = meetsAllFlags && isFlagged

					if (isFlagged) {
						reasons.push(stockFlag.getReason());
					}
				}

				console.log(`Meets ${reasons.length} reasons`)

				const str = `Stock ${tickerSymbol}, date: ${dayjs(date).format('MM/DD/YYYY')}, reasons: ${reasons.join(", ")}`
				hits.push(str)

				console.log(str)

				if (meetsAllFlags) {
					// const str = `Stock ${tickerSymbol}, date: ${date.getUTCDate()}, reasons: ${reasons}`
					hits.push(str)
				}
			}
		}

		console.log(`# of hits: ${hits.length}`);

		console.log(`Fetched ${stocks.length} stocks`);
	}

	private generateDateRange(): [Date, Date] {
		const today = dayjs(new Date()).startOf("d");

		const startDate = today.clone().subtract(10, "d");

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
