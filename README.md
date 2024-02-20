# Stock Aggregator

## Purpose

Tool used for the sake of identifying stocks that might be potential buy/short options based on custom criteria.

## Technologies

- TypeScript
- NodeJS
  - Biome for linting and formatting
- PostgreSQL: storing stocks and daily stock prices

## Commands

Retrieves S&P 500 stocks
```shell
npm run aggregate
```

Flag stocks that meet criteria
```shell
npm run flag
```

Lint files
```shell
npm run lint
```

Format files
```shell
npm run format
```
