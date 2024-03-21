import Store from "../store";
import { MBLsheetextendtable } from "./extend";

function sgInit(setting, config, MBLsheet) {
  MBLsheet._create = MBLsheet.create;

  delete MBLsheet.create;

  const sheet = {
    ...config,
    // column: ,
  };
  if (!config.columnHeaderArr) {
    throw new Error("columnHeaderArr 是必填字段");
    // columnHeaderArr;
  }
  sheet.column = config.columnHeaderArr.length;
  sheet.defaultColWidth = config.defaultColWidth || 150;

  MBLsheet._create({
    ...setting,
    sheetFormulaBar: false,
    showstatisticBarConfig: {
      count: false,
      view: false,
      zoom: false,
    },
    showsheetbar: false,
    // enableAddRow: false,
    enableAddBackTop: false,
    forceCalculation: false,
    plugins: ["chart"],
    fontList: [
      {
        fontName: "HanaleiFill",
        url: "./assets/iconfont/HanaleiFill-Regular.ttf",
      },
      {
        fontName: "Anton",
        url: "./assets/iconfont/Anton-Regular.ttf",
      },
      {
        fontName: "Pacifico",
        url: "./assets/iconfont/Pacifico-Regular.ttf",
      },
    ],
    data: [sheet],
  });

  MBLsheet.setRow = (len) => setLength(len, MBLsheet);
}

function setLength(len, MBLsheet) {
  const curLen = MBLsheet.getSheetData().length - 1;

  const finlayLen = len - curLen - 1;
  if (finlayLen === 0) return;
  if (finlayLen > 0) {
    MBLsheetextendtable("row", curLen, finlayLen);
  }
}

export { sgInit };
