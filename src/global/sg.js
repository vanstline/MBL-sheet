import Store from "../store";
import { scroll } from "./api";
import { MBLsheetdeletetable, MBLsheetextendtable } from "./extend";
import { getData, initDataSource, setData } from "./sg/data";
import { changeValue } from "../controllers/observer";
import { iconPath } from "./sg/icons";

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
    hook: {
      cellRenderAfter: renderExtraIcon,
      nuuCellRenderAfter: renderExtraIcon,
    },
  });

  MBLsheet.setLength = (len) => setLength(len, MBLsheet);

  MBLsheet.delRow = (cur, length = cur) => {
    const data = getData(sheet);
    const needRm = length - cur;
    if (data.length <= needRm + 1) {
      throw new Error("至少保留一条数据");
    }
    //
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

  MBLsheet.changeSomeValue = (obj = {}) => changeSomeValue(obj, config);
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

// 全局设置disabled状态
function setDisabledMap(obj, config, MBLsheet) {
  const keyNums = config.columns
    .map((item) => item?.dataIndex)
    ?.filter((item) => item);
  Object.entries(obj).forEach(([k, v]) => {
    const [r, dataIndex] = k?.split("_") ?? [];
    const c = keyNums.findIndex((item) => item === dataIndex);
    if (r > -1 && c !== -1 && Store.flowdata?.[r]?.[c]) {
      Store.flowdata[r][c].disabled = v;
    }
  });

  MBLsheet.refresh();
}

// 获取全局disabled状态
function getDisabledMap() {
  var flowdata = Store.flowdata;
  const newObj = {};
  flowdata.forEach((subData, i) => {
    subData?.forEach((item) => {
      if (item.hasOwnProperty("disabled")) {
        newObj[`${i}_${item.dataIndex}`] = item.disabled;
      }
    });
  });
  return newObj;
}

function changeSomeValue(obj, config) {
  const keyNums = config.columns
    .map((item) => item?.dataIndex)
    ?.filter((item) => item);

  Object.entries(obj).forEach(([k, v]) => {
    const [r, dataIndex] = k?.split("_") ?? [];
    const c = keyNums.findIndex((item) => item === dataIndex);
    if (r > -1 && c >= -1) {
      changeValue(r, c, v);
    }
  });
}
/**
 * 注册事件
 * @param {*} coord
 * @param {*} eventObj
 */
function registerEvent(coord, eventObj) {
  const { x = 0, y = 0, w = 0, h = 0 } = coord;
  const key = `${x}_${x + w}-${y}_${y + h}`;
  Store.customEvents[key] = eventObj;
}

/**
 * 执行自定义事件
 * @param {*} event
 */
export function execCustomEvent(event) {
  const offset = $("#" + Store.container).offset();
  const pageX = event.pageX - offset.left;
  const pageY = event.pageY - offset.top;
  const eventKeys = Object.keys(Store.customEvents);
  console.log("%c Line:219 🍐 eventKeys", "color:#2eafb0", eventKeys, event);

  eventKeys.forEach((keys) => {
    const [xK, yK] = keys.split("-");
    const [startC, endC] = xK.split("_");
    const [startR, endR] = yK.split("_");

    if (pageX >= startC && pageX <= endC && pageY >= startR && pageY <= endR) {
      console.log("%c Line:1089 🥟", "color:#ed9ec7");
      if (typeof Store.customEvents[keys].onclick === "function") {
        Store.customEvents[keys].onclick();
      }
    }
  });
}

const transSzieForDPR = (n) => n * Store.devicePixelRatio;

const debugDrawArea = (ctx, { x, y, w, h }) => {
  ctx.beginPath();

  // 左上起点
  ctx.moveTo(x, y);
  // 右上 向右移动
  ctx.lineTo(x + w, y);
  // 右下 向下移动
  ctx.lineTo(x + w, y + h);
  // 左下 向左移动
  ctx.lineTo(x, y + h);
  // 左上 回到起点
  ctx.lineTo(x, y);

  ctx.strokeStyle = "#1890ff";
  console.log("%c Line:225 🍣 ctx", "color:#ffdd4d", ctx);
  ctx.stroke();
  ctx.closePath();
};

export function renderIcon(icon, ctx, posi, obj) {
  registerEvent(posi, obj);
  const curIcon = `${iconPath}${icon}.png`;
  const curImg = new Image();

  const x = transSzieForDPR(posi.x);
  const y = transSzieForDPR(posi.y);
  const w = transSzieForDPR(posi.w);
  const h = transSzieForDPR(posi.h);
  curImg.src = curIcon;
  curImg.onload = function (e) {
    ctx.drawImage(curImg, x, y, w, h);
  };

  debugDrawArea(ctx, { x, y, w, h });
}

function renderExtraIcon(curColumns, coord, curSheet, ctx) {
  //
  const extra = curColumns?.extra;
  if (extra?.icons) {
    const [iconWidth = 20, iconHeigth = 20] = extra?.iconSize
      ? typeof extra.iconSize === "number"
        ? [extra.iconSize, extra.iconSize]
        : extra.iconSize
      : [];
    const style = extra?.style ?? {};
    const { start_r, end_c } = coord;
    const { width = 0, left = 0, top = 0 } = style;
    const drawStartR = start_r + 0;
    const drawStartC = end_c - width + 0 - 1;
    // const curIcon = `${iconPath}${extra?.icons}.png`;
    // const curImg = new Image();

    // curImg.src = curIcon;
    // curImg.onload = function (e) {
    //   ctx.drawImage(
    //     curImg,
    //     drawStartC + left,
    //     drawStartR + top,
    //     iconWidth,
    //     iconHeigth
    //   );
    // };
    renderIcon(
      extra?.icons,
      ctx,
      {
        x: drawStartC + left,
        y: drawStartR + top,
        w: iconWidth,
        h: iconHeigth,
      },
      extra
    );
  }
}

function cellMousedown() {
  console.log("%c Line:292 🍕", "color:#465975", arguments);
}

export { sgInit };
