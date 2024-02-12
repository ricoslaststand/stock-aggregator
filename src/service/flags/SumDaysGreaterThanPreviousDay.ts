import PriceRepository from "../../repository/PriceRepository";
import { IStockFlagChecker } from "../StockFlagChecker";

export type SumDaysGreaterThanPreviousDayParams = {
	numOfDays: number;
	margin: number;
};

export class SumDaysGreaterThanPreviousDay implements IStockFlagChecker {
	private numOfDays: number;

	// As a percentage (e.g., 10% => margin: 10)
	private margin: number;
	private priceRepo: PriceRepository;

	constructor(
		params: SumDaysGreaterThanPreviousDayParams,
		priceRepo: PriceRepository,
	) {
		this.numOfDays = params.numOfDays;
		this.margin = params.margin;
		this.priceRepo = priceRepo;
	}

	async checkFlag(tickerSymbol: string, date: Date): Promise<boolean> {
		const numberOfPricesToRetrieve = this.numOfDays * 2;

		const results = await this.priceRepo.getLastXStockPrices({
			startDate: date,
			tickerSymbol,
			numOfPrices: numberOfPricesToRetrieve,
		});

		if (results.length < numberOfPricesToRetrieve) {
			return false;
		}

		const precedingDays = results.slice(0, this.numOfDays);
		const currDays = results.slice(this.numOfDays, this.numOfDays * 2);

		const precedingDaysVolumeSum = precedingDays.reduce(
			(total, price) => total + price.volume,
			0,
		);
		const currDaysVolumeSum = currDays.reduce(
			(total, price) => total + price.volume,
			0,
		);

		return (
			this.getPercentageIncrease(currDaysVolumeSum, precedingDaysVolumeSum) >
			this.margin
		);
	}

	public getReason(): string {
		return "";
	}

	private getPercentageIncrease(total: number, precedingTotal: number): number {
		return (100 * (total / precedingTotal)) / precedingTotal;
	}
}
