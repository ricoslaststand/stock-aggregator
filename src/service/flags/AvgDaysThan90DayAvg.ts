import PriceRepository from "@repository/PriceRepository";
import { IStockFlagChecker } from "../StockFlagChecker";

export type AvgDaysThan90DaysAvgParams = {
	margin: number;
};

export class AvgDaysThan90DaysAvg implements IStockFlagChecker {
	private margin: number;
	private priceRepo: PriceRepository;

	constructor(params: AvgDaysThan90DaysAvgParams, priceRepo: PriceRepository) {
		this.margin = params.margin;
		this.priceRepo = priceRepo;
	}

	async checkFlag(tickerSymbol: string, date: Date): Promise<boolean> {
		const [avgVolumeLast90, avgVolumeLastX] = await Promise.all([
			this.priceRepo.getAvgVolumeForLastXDays(tickerSymbol, 90, date),
			this.priceRepo.getAvgVolumeForLastXDays(tickerSymbol, 2, date),
		]);

		return (
			this.getPercentageIncrease(avgVolumeLastX, avgVolumeLast90) > this.margin
		);
	}

	public getReason(): string {
		return `The average of last two days is at least ${this.margin}% of the 90-day average volume.`;
	}

	private getPercentageIncrease(total: number, precedingTotal: number): number {
		return 100 * (total / precedingTotal);
	}
}
