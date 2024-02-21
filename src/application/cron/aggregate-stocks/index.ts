import "module-alias/register";

import PromisePool from "@supercharge/promise-pool/dist";
import axios from "axios";
import dayjs from "dayjs";
import sleep from "sleep-promise";
import yahooFinance from "yahoo-finance2";

import db from "@db/index";
import Logger from "@utils/Logger";

type Stock = {
	ticker_symbol: string;
	name: string;
	sector?: string;
};

const DEFAULT_NUM_OF_DAYS = 1;

function getNumberOfDaysAgo(numOfDays: number): Date {
	return dayjs().subtract(numOfDays).startOf("day").toDate();
}

function getDateFormat(date: Date): string {
	return dayjs(date).format("YYYY-MM-DD");
}

async function retrieveStockSymbols(): Promise<Stock[]> {
	const results = await axios.get(
		"https://pkgstore.datahub.io/core/s-and-p-500-companies/constituents_json/data/297344d8dc0a9d86b8d107449c851cc8/constituents_json.json",
	);

	return results.data.map((stock: any): Stock => {
		return {
			ticker_symbol: stock.Symbol,
			name: stock.Name,
			sector: stock.Sector,
		};
	});
}

async function insertStockSymbols(stocks: Stock[]): Promise<void> {
	await db("stocks").insert(stocks).onConflict("ticker_symbol").ignore();
}

function addIndexes(stocks: Stock[]): Stock[] {
	stocks.push({
		ticker_symbol: "^GSPC",
		name: "S&P 500",
	});

	return stocks;
}

async function main(): Promise<void> {
	// Step 1: Retrieve all stocks
	// Step 2: Flag stocks that meet conditions
	try {
		const stockSymbols = await retrieveStockSymbols();
		await insertStockSymbols(addIndexes(stockSymbols));

		let numOfDays = DEFAULT_NUM_OF_DAYS;

		const numOfDaysIdx = process.argv.indexOf("--numOfDays");
		if (numOfDaysIdx > -1) {
			const argVal = Number(process.argv[numOfDaysIdx + 1]);

			if (!Number.isNaN(argVal) && argVal > 0) {
				numOfDays = argVal;
			}
		}

		const endDate = dayjs();
		const startDate = endDate.subtract(numOfDays, "d").startOf("d");

		await PromisePool.withConcurrency(1)
			.for(stockSymbols)
			.onTaskFinished((stock) => {
				console.log(
					`Processed daily stocks for ${stock.ticker_symbol} from ${startDate} to ${endDate}`,
				);
			})
			.handleError((err, stock) => {
				console.log(`Error failed for ${stock.ticker_symbol}: ${err.message}`);
			})
			.process(async (stock) => {
				const results = await yahooFinance.historical(stock.ticker_symbol, {
					period1: startDate.toDate(),
					period2: endDate.toDate(),
				});
				// getCalendarEvents('AAPL')

				await sleep(100);
				const formattedResults = results.map((dayPrice) => {
					dayPrice.adj_close = dayPrice.adjClose;
					dayPrice.adjClose = undefined;

					return {
						...dayPrice,
						// TODO: fix this hack to ensure that data is stored as date when in UTC time instead of local
						date: dayjs(dayPrice.date).add(23, "h").toDate(),
						ticker_symbol: stock.ticker_symbol,
					};
				});

				try {
					await db("daily_stock_prices")
						.insert(formattedResults)
						.onConflict(["ticker_symbol", "date"])
						.ignore();
				} catch (err) {
					Logger.error(err);
					Logger.info({
						formattedResults,
					});
				}
			});

		process.exit();
	} catch (err) {
		Logger.error(err);
	}
}

async function executeSQLQuery() {
	try {
		const results = await db.raw(`
        WITH sp500_returns AS (
            SELECT date, (daily_stock_prices.adjClose / lag(daily_stock_prices.adjClose) OVER (ORDER BY date ASC) - 1) AS daily_return
            FROM daily_stock_prices
            WHERE ticker_symbol = '^GSPC'
            ),
            stock_returns AS (
            SELECT ticker_symbol, date, (daily_stock_prices.adjClose / lag(daily_stock_prices.adjClose) OVER (PARTITION BY ticker_symbol ORDER BY date ASC) - 1) AS daily_return
            FROM daily_stock_prices
            WHERE ticker_symbol <> '^GSPC'
            )
            SELECT
            stock_returns.ticker_symbol,
            COVAR_POP(stock_returns.daily_return, sp500_returns.daily_return) / VAR_POP(sp500_returns.daily_return) AS beta
            FROM stock_returns
            JOIN sp500_returns ON stock_returns.date = sp500_returns.date
            GROUP BY stock_returns.ticker_symbol;
        `);

		return results;
	} catch (e) {
		console.log(e);
	}
}

async function getCalendarEvents(symbol: string) {
	const results = await yahooFinance.quoteSummary(symbol, {
		modules: ["calendarEvents"],
	});

	console.log("results =", JSON.stringify(results));
	return results;
}

// executeSQLQuery()

main();
