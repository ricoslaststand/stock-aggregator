import type { Knex } from "knex";

// Update with your config settings.

const config: { [key: string]: Knex.Config } = {
	development: {
		client: "sqlite3",
		connection: {
			filename: "./dev.sqlite3",
		},
	},

	staging: {
		client: "postgresql",
		connection: {
			host: "localhost",
			database: "postgres",
			user: "postgres",
			password: "password",
			port: 5432,
		},
		pool: {
			min: 2,
			max: 10,
		},
		migrations: {
			tableName: "migrations",
		},
	},

	production: {
		client: "postgresql",
		connection: {
			database: "my_db",
			user: "username",
			password: "password",
		},
		pool: {
			min: 2,
			max: 10,
		},
		migrations: {
			tableName: "migrations",
		},
	},
};

module.exports = config;
