import PriceRepository from "../../repository/PriceRepository";
import { IStockFlagChecker } from "../StockFlagChecker";

export type AvgDaysThan90DaysAvgParams = {
	margin: number;
};

export class AvgDaysThan90DaysAvg implements IStockFlagChecker {
	private margin: number;
	private priceRepo: PriceRepository;

	constructor(params: AvgDaysThan90DaysAvg, priceRepo: PriceRepository) {
		this.margin = params.margin;
		this.priceRepo = priceRepo;
	}

	async checkFlag(tickerSymbol: string, date: Date): Promise<boolean> {
		return true;
	}

	getReason(): string {
		return "";
	}
}
