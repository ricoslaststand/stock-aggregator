import knex from "knex";

import config from "@utils/config";

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

export default db;
