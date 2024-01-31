export type LastXDaysCheck = {
    name: 'LAST_X_DAYS_CHECK';
    numOfDays: number;
}

export type SumOfXDaysCheck = {
    name: 'SUM_OF_X_DAYS_CHECK';
    numOfDays: number;
    // percentage by which the sum of last X days is greater than the X days prior
    threshold: number;
}

export type AvgXComparedLastYCheck = {
    name: '';
    // measured in days
    lengthOfAvg: number;
}

export type StockConditional = LastXDaysCheck | SumOfXDaysCheck;
