import dayjs from "dayjs";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";

dayjs.extend(isSameOrBefore);

import { DayOfWeek } from "@domain/Date";
import { FlaggedStock } from "@domain/FlaggedStock";
import PriceRepository from "@repository/PriceRepository";
import StockRepository from "@repository/StockRepository";
import { IStockFlagChecker } from "@service/StockFlagChecker";

import logger from "@utils/Logger";

class StockFlagger {
	private priceRepo: PriceRepository;
	private stockRepo: StockRepository;
	private stockFlags: IStockFlagChecker[];

	constructor(
		priceRepo: PriceRepository,
		stockRepo: StockRepository,
		stockFlags: IStockFlagChecker[],
	) {
		this.priceRepo = priceRepo;
		this.stockRepo = stockRepo;
		this.stockFlags = stockFlags;
	}

	async checkAllStocks(): Promise<FlaggedStock[]> {
		const stocks = await this.stockRepo.getStocks();
		const dates = this.generateLastXDays(20, false);

		const hits: FlaggedStock[] = [];

		for (const stock of stocks) {
			const { tickerSymbol } = stock;

			for (const date of dates) {
				const reasons = [];

				let meetsAllFlags = true;

				for (const stockFlag of this.stockFlags) {
					const isFlagged = await stockFlag.checkFlag(tickerSymbol, date);

					meetsAllFlags = meetsAllFlags && isFlagged;

					if (isFlagged) {
						reasons.push(stockFlag.getReason());
					}
				}

				logger.info(`Meets ${reasons.length} reasons`);

				if (meetsAllFlags) {
					const str = `Stock ${tickerSymbol}, currDay: ${date.getDay()} date: ${dayjs(
						date,
					).format("MM/DD/YYYY")}, reasons: ${reasons.join(", ")}`;

					logger.info(str);

					hits.push({
						name: stock.name,
						tickerSymbol,
						date: dayjs(date).format("MM/DD/YYYY"),
						reasons: reasons.join(", "),
					});
				}
			}
		}

		return hits;
	}

	private generateDateRange(): [Date, Date] {
		const today = dayjs(new Date()).startOf("d");
		const startDate = today.clone().subtract(20, "d");

		return [startDate.toDate(), today.toDate()];
	}

	private generateLastXDays(numOfDays: number, includeWeekend = false): Date[] {
		const results: Date[] = [];

		let currDay = dayjs().startOf("day");

		while (results.length <= numOfDays) {
			if (!includeWeekend) {
				while (
					currDay.day() === DayOfWeek.Sunday ||
					currDay.day() === DayOfWeek.Saturday
				) {
					currDay = currDay.subtract(1, "d");
				}
			}

			results.push(currDay.clone().toDate());
			currDay = currDay.subtract(1, "d");
		}

		return results.reverse();
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
