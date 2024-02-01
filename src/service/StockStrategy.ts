export interface IStrategy {
    checksOut: (tickerSymbol: string, startDate: Date, endDate: Date) => Promise<boolean>;
    getReason: (...args: any) => string;
}
