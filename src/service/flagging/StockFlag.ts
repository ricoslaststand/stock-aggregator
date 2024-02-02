interface IStockFlag {
	check: (...args: any) => Promise<void>;
	getReason: () => string;
}
