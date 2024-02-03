import PriceRepository from "../../repository/PriceRepository";
import { IStockFlagChecker } from "../StockFlagChecker";

export type CurrDaysGreaterThanPreviousDayParams = {
	numOfDays: number;
};

export class CurrDaysGreaterThanPreviousDay implements IStockFlagChecker {
	private numOfDays: number;
	private priceRepo: PriceRepository;

	constructor(
		params: CurrDaysGreaterThanPreviousDayParams,
		priceRepo: PriceRepository,
	) {
		this.numOfDays = params.numOfDays;
		this.priceRepo = priceRepo;
	}

	public async checkFlag(tickerSymbol: string, date: Date): Promise<boolean> {
		const results = await this.priceRepo.getLastXStockPrices({
			startDate: date,
			tickerSymbol,
			numOfPrices: this.numOfDays * 2,
		});

		const precedingDays = results.slice(0, this.numOfDays);
		const currDays = results.slice(this.numOfDays, this.numOfDays * 2);

		for (const day of currDays) {
			for (const prevDay of precedingDays) {
				if (day.volume <= prevDay.volume) {
					return false;
				}
			}
		}

		return true;
	}

	public getReason(): string {
		return `Volume of last ${this.numOfDays} days each greater than preceding ${this.numOfDays}.`;
	}
}
