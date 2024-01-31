import { Dayjs } from "dayjs";
import { Knex } from "knex";

class PriceRepository {
    private db: Knex

    constructor(db: Knex) {
        this.db = db
    }

    async getPriceChanges(symbol: string, dateFrom: Dayjs, dateTo: Dayjs) {
    
    }

    async getLastDaysOfPriceChange(date: Dayjs, numDays: number = 30) {
        return await this.db('daily_price_changes')
            .whereRaw('date <= ?', [date])
            .orderBy('date', 'desc')
            .limit(numDays);
    }
}