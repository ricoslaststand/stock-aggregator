export type CurrDaysGreaterThanPreviousDayParams = {
	numOfDays: number;
};

export class CurrDaysGreaterThanPreviousDay implements IStockFlag {
	private numOfDays: number;

	constructor(params: CurrDaysGreaterThanPreviousDayParams) {
		this.numOfDays = params.numOfDays;
	}

	public async check(...args: any) {}

	public getReason() {
		return "";
	}
}
