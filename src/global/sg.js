import Store from "../store";
import { scroll, transToData } from "./api";
import formula from "../global/formula";
import { MBLsheetdeletetable, MBLsheetextendtable } from "./extend";
import { getData, initDataSource, setData } from "./sg/data";

function sgInit(setting, config, MBLsheet) {
  if (MBLsheet.create) {
    MBLsheet._create = MBLsheet.create;
  }

  delete MBLsheet.create;

  const sheet = { ...config };
  if (!config.columns) {
    throw new Error("columns 是必填字段");
    // columns;
  }

  config.columns.forEach((item, i) => {
    if (Store.cloumnLens) {
      Store.cloumnLens[i] = item.width;
    } else {
      Store.cloumnLens = [item.width];
    }
  });

  Store.cloumnLenSum = Store.cloumnLens.reduce((prev, next, i) => {
    const curNext = next ?? config.defaultColWidth ?? 73;
    const prevW = i == 0 ? 0 : prev[i - 1];
    const sum = prevW + curNext;
    prev.push(sum + 1);
    return prev;
  }, []);

  sheet.row = config.row;
  sheet.column = config.columns.length;
  sheet.columnHeaderArr = config.columns.map((item) => item.title);
  sheet.defaultColWidth = config.defaultColWidth || 150;
  setting.lang = setting.lang || "zh";

  initDataSource(config.dataSource, sheet, MBLsheet);

  // sheet.celldata = dataSource || [];

  MBLsheet._create({
    ...setting,
    sheetFormulaBar: false,
    showstatisticBarConfig: {
      count: false,
      view: false,
      zoom: false,
    },
    showsheetbar: false,
    enableAddRow: false,
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

  MBLsheet.setLength = (len) => setLength(len, MBLsheet);

  MBLsheet.delRow = (cur, length = cur) => {
    const data = getData(sheet);
    const needRm = length - cur;
    if (data.length <= needRm + 1) {
      throw new Error("至少保留一条数据");
    }
    MBLsheetdeletetable("row", cur, length);
  };
  MBLsheet.addRow = (cur, length) => MBLsheetextendtable("row", cur, length);

  MBLsheet.verify = verify;

  MBLsheet.getData = (filterVerify) => {
    const data = getData(sheet);
    if (!filterVerify) {
      return data;
    }

    const rows = Object.keys(Store.verifyMap)?.reduce((prev, next) => {
      const curR = next.split("_")[0];
      if (curR && !prev.includes(+curR)) {
        prev.push(+curR);
      }
      return prev;
    }, []);

    return { data, rows };
  };

  MBLsheet.setData = (data) => setData(data, sheet, MBLsheet);

  MBLsheet.clearTable = () => {
    const data = getData(sheet);
    const newData = data.map(() => {
      return config.columns;
    });
    setData(newData, sheet, MBLsheet);
  };

  MBLsheet.setDisabledMap = (obj = {}) => setDisabledMap(obj, config, MBLsheet);
  MBLsheet.getDisabledMap = () => getDisabledMap(config);
}

function setLength(len, MBLsheet) {
  if (len == 0) {
    throw new Error("length 不能为0");
  }
  const curLen = MBLsheet.getSheetData().length - 1;

  const finlayLen = len - curLen - 1;
  if (finlayLen === 0) return;
  if (finlayLen > 0) {
    MBLsheetextendtable("row", curLen, finlayLen);
  } else {
    MBLsheetdeletetable("row", curLen + finlayLen + 1, curLen);
  }
}

function verify() {
  const m = Object.keys(Store.verifyMap);

  if (m.length) {
    const [targetRow, targetColumn] = m[0]?.split("_") ?? [];
    scroll({ targetRow, targetColumn });
    return true;
  }
  return false;
}

function setDisabledMap(obj, config, MBLsheet) {
  var newObj = {};
  const keyNums = config.columns
    .map((item) => item?.dataIndex)
    ?.filter((item) => item);
  Object.entries(obj).forEach(([k, v]) => {
    const [r, c] = k?.split("_") ?? [];
    const curI = keyNums.findIndex((item) => item === c);
    if (r > -1 && curI !== -1) {
      newObj[`${r}_${curI}`] = v;
    }
  });
  config.disabled = newObj;
  for (let rc in newObj) {
    const [r, c] = rc?.split("_");
    formula.updatecell(r, c);
  }
}

function getDisabledMap(config) {
  var disabledMap = config.disabled ?? {};
  const keyNums = config.columns
    .map((item) => item?.dataIndex)
    ?.filter((item) => item);
  const newObj = {};
  Object.entries(disabledMap).forEach(([k, v]) => {
    const [r, c] = k?.split("_") ?? [];
    newObj[`${r}_${keyNums[c]}`] = v;
  });
  return newObj;
}

export { sgInit };
