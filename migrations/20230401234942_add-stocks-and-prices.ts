import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
	console.log("Running migrations");
	await knex.schema.createTableIfNotExists("stocks", (table) => {
		table.string("ticker_symbol", 10).notNullable().primary();
		table.string("name", 255).notNullable();
		table.string("sector", 255);
		table.timestamp("created_at").defaultTo("NOW()");
		table.timestamp("updated_at").defaultTo("NOW()");
	});

	console.log("Ran migration");

	await knex.schema.createTableIfNotExists("daily_stock_prices", (table) => {
		table.increments("id").primary();
		table.string("ticker_symbol", 10).notNullable();
		table.date("date").notNullable();
		table.decimal("open", null).notNullable();
		table.decimal("high", null).notNullable();
		table.decimal("low", null).notNullable();
		table.decimal("close", null).notNullable();
		table.decimal("adj_close", null).notNullable();
		table.bigint("volume").notNullable();
		table.foreign("ticker_symbol").references("stocks.ticker_symbol");
		table.unique(["ticker_symbol", "date"], {
			indexName: "symbol_date_composite_index",
			useConstraint: true,
		});
		table.timestamp("created_at").defaultTo("NOW()");
		table.timestamp("updated_at").defaultTo("NOW()");
	});

	console.log("Ran migration");
}

export async function down(knex: Knex): Promise<void> {
	await knex.schema.dropTableIfExists("stocks");

	await knex.schema.dropTableIfExists("daily_stock_prices");
}
