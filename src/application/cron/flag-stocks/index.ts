import "module-alias/register";

import db from "@db/index";
import PriceRepository from "@repository/PriceRepository";
import StockRepository from "@repository/StockRepository";
import { IStockFlagChecker } from "@service/StockFlagChecker";
import StockFlagger from "@service/StockFlagger";
import { AvgDaysThan90DaysAvg } from "@service/flags/AvgDaysThan90DayAvg";
import { CurrDaysGreaterThanPreviousDay } from "@service/flags/CurrDaysGreaterThanPreviousDay";
import { SumDaysGreaterThanPreviousDay } from "@service/flags/SumDaysGreaterThanPreviousDay";

async function main() {
	console.log("Starting to flag stocks...");

	const priceRepo = new PriceRepository(db);
	const stockRepo = new StockRepository(db);

	const stockFlags: IStockFlagChecker[] = [
		new CurrDaysGreaterThanPreviousDay(
			{
				numOfDays: 2,
			},
			priceRepo,
		),
		new SumDaysGreaterThanPreviousDay(
			{
				numOfDays: 2,
				margin: 10,
			},
			priceRepo,
		),
		new AvgDaysThan90DaysAvg(
			{
				margin: 80,
			},
			priceRepo,
		),
	];

	const stockFlagger = new StockFlagger(priceRepo, stockRepo, stockFlags);

	await stockFlagger.checkAllStocks();

	console.log("Finishing flagging stocks!");
}

main();
