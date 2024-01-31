import { Dayjs } from "dayjs";
import { Knex } from "knex";

class DailyStockPriceRepository {
    private db: Knex
    private tableName: string

    constructor(db: Knex) {
        this.db = db
        this.tableName = 'daily_stock_prices'
    }

    async getPriceChanges(symbol: string, dateFrom: Dayjs, dateTo: Dayjs) {
        
    }

    async getLastDaysOfPriceChange(date: Dayjs, numDays: number = 30) {
        return await this.db('daily_price_changes')
            .whereRaw('date <= ?', [date])
            .orderBy('date', 'desc')
            .limit(numDays);
    }

    async getAvgForLastXDays(numOfDays: number): Promise<number> {
        const result = await this.db(this.tableName)
            .avg('close')
            .limit(numOfDays)
            .first();

        return result?.['close'] || 0
    }
}