import { Workbook } from "exceljs";

class ExcelWriter {
	generateFlaggedStocksExcelFile(): Workbook {
		return new Workbook();
	}
}

export default ExcelWriter;
