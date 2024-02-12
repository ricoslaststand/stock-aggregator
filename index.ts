import PromisePool from "@supercharge/promise-pool/dist";
import axios from "axios";
import dayjs from "dayjs";
import sleep from "sleep-promise";
import yahooFinance from "yahoo-finance2";

import knex from "knex";

import config from "./src/config";

type Stock = {
	ticker_symbol: string;
	name: string;
	sector?: string;
};

const db = knex({
	client: "postgres",
	connection: {
		host: "127.0.0.1",
		port: 5432,
		user: config.POSTGRES_USER,
		password: config.POSTGRES_PASSWORD,
		database: config.POSTGRES_DATABASE,
	},
	pool: { min: 0, max: 7 },
});

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

		const startDate = "2023-09-01";
		const endDate = "2024-04-05";

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
			.process(async (stock, index) => {
				const results = await yahooFinance.historical(stock.ticker_symbol, {
					period1: startDate,
					period2: endDate,
				});
				// getCalendarEvents('AAPL')
				

				await sleep(100);

				const formattedResults = results.map((dayPrice) => {
					dayPrice.adj_close = dayPrice.adjClose;
					delete dayPrice.adjClose;

					return {
						ticker_symbol: stock.ticker_symbol,
						...dayPrice,
					};
				});

				try {
					await db("daily_stock_prices")
						.insert(formattedResults)
						.onConflict(["ticker_symbol", "date"])
						.ignore();
				} catch (err) {
					console.log(err);
					console.log("formattedResults");
				}
			});
	} catch (e) {
		console.log(e);
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
