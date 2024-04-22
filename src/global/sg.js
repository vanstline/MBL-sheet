import Store from "../store";
import { scroll } from "./api";
import { MBLsheetdeletetable, MBLsheetextendtable } from "./extend";
import { getData, initDataSource, setData } from "./sg/data";
import { changeValue, getRowData } from "../controllers/observer";
// import { iconPath } from "./sg/icons";
import { colLocation, mouseposition, rowLocationByIndex } from "./location";
import { checkProtectionAllSelected } from "../controllers/protection";
import { selectHelpboxFill, selectHightlightShow } from "../controllers/select";
import { countfunc } from "./count";
import { icons } from "../controllers/constant";
import sheetmanage from "../controllers/sheetmanage";
import { eventBus } from "./sg/event";
import { jfrefreshgrid } from "./refresh";

function sgInit(setting, config, MBLsheet) {
  if (MBLsheet.create) {
    MBLsheet._create = MBLsheet.create;
  }

  delete MBLsheet.create;

  const dataSource = _.cloneDeep(config.dataSource);

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

  initDataSource(dataSource, sheet, MBLsheet);

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

  MBLsheet.clearTable = (cb) => {
    const data = getData(sheet);
    const newData = data.map(() => {
      return config.columns;
    });
    setData(newData, sheet, MBLsheet);

    if (cb && typeof cb === "function") {
      cb();
    }
  };

  MBLsheet.setLength = (len) => setLength(len, MBLsheet);

  MBLsheet.delRow = (cur, length = cur) => {
    const data = getData(sheet);
    const needRm = length - cur;
    if (data.length <= needRm + 1) {
      MBLsheet.clearTable();
      throw new Error("至少保留一条数据");
    }
    //
    MBLsheetdeletetable("row", cur, length);
  };

  MBLsheet.addRow = (cur, length) => MBLsheetextendtable("row", cur, length);

  MBLsheet.verify = verify;
  MBLsheet.verifyRowFn = verifyRowFn;

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

  MBLsheet.setDisabledMap = (obj = {}) => setDisabledMap(obj, config, MBLsheet);
  MBLsheet.getDisabledMap = () => getDisabledMap(config);

  MBLsheet.changeSomeValue = (obj = {}) => changeSomeValue(obj, config);

  MBLsheet.addEventListener = (eventName, cb) =>
    eventBus.subscribe(eventName, cb);
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

function verifyRowFn(row) {
  // const sheet = sheetmanage.getSheetByIndex();
  // const fristValue = Store.flowdata[rows][0]?.v;

  // const keyNumMap = {};
  // const curRowData = getRowData(rows, 0, fristValue, keyNumMap);

  // const verifyArr = sheet.columns?.filter(
  //   (item) => typeof item.fieldsProps?.verifyFn === "function"
  // );

  // console.log("%c Line:186 🥓", "color:#ed9ec7", verifyArr);
  // return verifyArr.some((item, i) => {
  //   const cur = item.fieldsProps.verifyFn(curRowData[item.dataIndex], rows);
  //   console.log("%c Line:189 🍫 cur", "color:#b03734", cur);
  //   return !cur.status;
  // });
  const rows = Object.keys(Store.verifyMap)?.reduce((prev, next) => {
    const curR = next.split("_")[0];
    if (curR && !prev.includes(+curR)) {
      prev.push(+curR);
    }
    return prev;
  }, []);
  console.log("%c Line:200 🍏 rows", "color:#465975", rows);
  return rows.includes(row);
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
  let d = _.cloneDeep(Store.flowdata);

  const keyNumMap = d[0]?.reduce((p, n, i) => {
    p[n.dataIndex] = i;
    return p;
  }, {});
  Object.entries(obj).forEach(([k, v]) => {
    const [r, dataIndex] = k?.split("_") ?? [];
    if (d?.[+r]?.[keyNumMap?.[dataIndex]]) {
      d[+r][keyNumMap[dataIndex]].v = v;
      d[+r][keyNumMap[dataIndex]].m = v;
    }
  });
  jfrefreshgrid(d, Store.MBLsheet_select_save);
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

function createIconEle(coord, eventObj) {
  // MBLsheet-grid-window-1
  var ele = $("<div class='custom-icon-dom'><div>");
  ele.css({
    position: "absolute",
    top: coord.y,
    left: coord.x,
    width: coord.w,
    height: coord.h,
    cursor: "pointer",
    "z-index": 999,
  });
  if (eventObj.tips) {
    // var tipsDom = $('<div><div>')
    // tipsDom.text(eventObj.tips);
    ele.attr("title", eventObj.tips);
  }
  $("#MBLsheet-grid-window-1").append(ele);

  ele
    .mousedown(function (event) {
      if (!checkProtectionAllSelected(Store.currentSheetIndex)) {
        return;
      }

      let mouse = mouseposition(event.pageX, event.pageY);
      let x = mouse[0] + $(this).scrollLeft();

      let row_index = Store.visibledatarow.length - 1,
        row = Store.visibledatarow[row_index],
        row_pre = 0;
      let col_location = colLocation(x),
        col = col_location[1],
        col_pre = col_location[0],
        col_index = col_location[2];

      Store.orderbyindex = col_index; //排序全局函数

      $("#MBLsheet-rightclick-menu").hide();
      $("#MBLsheet-sheet-list, #MBLsheet-rightclick-sheet-menu").hide();
      $("#MBLsheet-filter-menu, #MBLsheet-filter-submenu").hide();

      //mousedown是右键
      if (event.which == "3") {
        let isright = false;

        for (let s = 0; s < Store.MBLsheet_select_save.length; s++) {
          let obj_s = Store.MBLsheet_select_save[s];

          if (
            obj_s["column"] != null &&
            col_index >= obj_s["column"][0] &&
            col_index <= obj_s["column"][1] &&
            obj_s["row"][0] == 0 &&
            obj_s["row"][1] == Store.flowdata.length - 1
          ) {
            isright = true;
            break;
          }
        }

        if (isright) {
          return;
        }
      }

      let left = col_pre,
        width = col - col_pre - 1;
      let columnseleted = [col_index, col_index];

      Store.MBLsheet_scroll_status = true;

      //公式相关
      let $input = $("#MBLsheet-input-box");
      if (parseInt($input.css("top")) > 0) {
        if (
          formula.rangestart ||
          formula.rangedrag_column_start ||
          formula.rangedrag_row_start ||
          formula.israngeseleciton() ||
          $("#MBLsheet-ifFormulaGenerator-multiRange-dialog").is(":visible")
        ) {
          //公式选区
          let changeparam = menuButton.mergeMoveMain(
            columnseleted,
            [0, row_index],
            { row_focus: 0, column_focus: col_index },
            row_pre,
            row,
            left,
            width
          );
          if (changeparam != null) {
            columnseleted = changeparam[0];
            //rowseleted= changeparam[1];
            //top = changeparam[2];
            //height = changeparam[3];
            left = changeparam[4];
            width = changeparam[5];
          }

          if (event.shiftKey) {
            let last = formula.func_selectedrange;

            let left = 0,
              width = 0,
              columnseleted = [];
            if (last.left > col_pre) {
              left = col_pre;
              width = last.left + last.width - col_pre;

              if (last.column[1] > last.column_focus) {
                last.column[1] = last.column_focus;
              }

              columnseleted = [col_index, last.column[1]];
            } else if (last.left == col_pre) {
              left = col_pre;
              width = last.left + last.width - col_pre;
              columnseleted = [col_index, last.column[0]];
            } else {
              left = last.left;
              width = col - last.left - 1;

              if (last.column[0] < last.column_focus) {
                last.column[0] = last.column_focus;
              }

              columnseleted = [last.column[0], col_index];
            }

            let changeparam = menuButton.mergeMoveMain(
              columnseleted,
              [0, row_index],
              { row_focus: 0, column_focus: col_index },
              row_pre,
              row,
              left,
              width
            );
            if (changeparam != null) {
              columnseleted = changeparam[0];
              //rowseleted= changeparam[1];
              //top = changeparam[2];
              //height = changeparam[3];
              left = changeparam[4];
              width = changeparam[5];
            }

            last["column"] = columnseleted;

            last["left_move"] = left;
            last["width_move"] = width;

            formula.func_selectedrange = last;
          } else if (
            event.ctrlKey &&
            $("#MBLsheet-rich-text-editor").find("span").last().text() != ","
          ) {
            //按住ctrl 选择选区时  先处理上一个选区
            let vText = $("#MBLsheet-rich-text-editor").text() + ",";
            if (vText.length > 0 && vText.substr(0, 1) == "=") {
              vText = formula.functionHTMLGenerate(vText);

              if (window.getSelection) {
                // all browsers, except IE before version 9
                let currSelection = window.getSelection();
                formula.functionRangeIndex = [
                  $(currSelection.anchorNode).parent().index(),
                  currSelection.anchorOffset,
                ];
              } else {
                // Internet Explorer before version 9
                let textRange = document.selection.createRange();
                formula.functionRangeIndex = textRange;
              }

              $("#MBLsheet-rich-text-editor").html(vText);

              formula.canceFunctionrangeSelected();
              formula.createRangeHightlight();
            }

            formula.rangestart = false;
            formula.rangedrag_column_start = false;
            formula.rangedrag_row_start = false;

            $("#MBLsheet-functionbox-cell").html(vText);
            formula.rangeHightlightselected($("#MBLsheet-rich-text-editor"));

            //再进行 选区的选择
            formula.israngeseleciton();
            formula.func_selectedrange = {
              left: left,
              width: width,
              top: rowLocationByIndex(0)[0],
              height: rowLocationByIndex(0)[1] - rowLocationByIndex(0)[0] - 1,
              left_move: left,
              width_move: width,
              top_move: row_pre,
              height_move: row - row_pre - 1,
              row: [0, row_index],
              column: columnseleted,
              row_focus: 0,
              column_focus: col_index,
            };
          } else {
            formula.func_selectedrange = {
              left: left,
              width: width,
              top: rowLocationByIndex(0)[0],
              height: rowLocationByIndex(0)[1] - rowLocationByIndex(0)[0] - 1,
              left_move: left,
              width_move: width,
              top_move: row_pre,
              height_move: row - row_pre - 1,
              row: [0, row_index],
              column: columnseleted,
              row_focus: 0,
              column_focus: col_index,
            };
          }

          if (
            formula.rangestart ||
            formula.rangedrag_column_start ||
            formula.rangedrag_row_start ||
            formula.israngeseleciton()
          ) {
            formula.rangeSetValue({ row: [null, null], column: columnseleted });
          } else if (
            $("#MBLsheet-ifFormulaGenerator-multiRange-dialog").is(":visible")
          ) {
            //if公式生成器
            let range = getRangetxt(
              Store.currentSheetIndex,
              { row: [0, row_index], column: columnseleted },
              Store.currentSheetIndex
            );
            $("#MBLsheet-ifFormulaGenerator-multiRange-dialog input").val(
              range
            );
          }

          formula.rangedrag_column_start = true;
          formula.rangestart = false;
          formula.rangedrag_row_start = false;

          $("#MBLsheet-formula-functionrange-select")
            .css({
              left: left,
              width: width,
              top: row_pre,
              height: row - row_pre - 1,
            })
            .show();
          $("#MBLsheet-formula-help-c").hide();

          MBLsheet_count_show(
            left,
            row_pre,
            width,
            row - row_pre - 1,
            [0, row_index],
            columnseleted
          );

          return;
        } else {
          formula.updatecell(
            Store.MBLsheetCellUpdate[0],
            Store.MBLsheetCellUpdate[1]
          );
          Store.MBLsheet_cols_selected_status = true;
        }
      } else {
        Store.MBLsheet_cols_selected_status = true;
      }

      if (Store.MBLsheet_cols_selected_status) {
        if (event.shiftKey) {
          //按住shift点击列索引选取范围
          let last = $.extend(
            true,
            {},
            Store.MBLsheet_select_save[Store.MBLsheet_select_save.length - 1]
          ); //选区最后一个

          let left = 0,
            width = 0,
            columnseleted = [];
          if (last.left > col_pre) {
            left = col_pre;
            width = last.left + last.width - col_pre;

            if (last.column[1] > last.column_focus) {
              last.column[1] = last.column_focus;
            }

            columnseleted = [col_index, last.column[1]];
          } else if (last.left == col_pre) {
            left = col_pre;
            width = last.left + last.width - col_pre;
            columnseleted = [col_index, last.column[0]];
          } else {
            left = last.left;
            width = col - last.left - 1;

            if (last.column[0] < last.column_focus) {
              last.column[0] = last.column_focus;
            }

            columnseleted = [last.column[0], col_index];
          }

          last["column"] = columnseleted;

          last["left_move"] = left;
          last["width_move"] = width;

          Store.MBLsheet_select_save[Store.MBLsheet_select_save.length - 1] =
            last;
        } else if (event.ctrlKey) {
          //选区添加
          Store.MBLsheet_select_save.push({
            left: left,
            width: width,
            top: rowLocationByIndex(0)[0],
            height: rowLocationByIndex(0)[1] - rowLocationByIndex(0)[0] - 1,
            left_move: left,
            width_move: width,
            top_move: row_pre,
            height_move: row - row_pre - 1,
            row: [0, row_index],
            column: columnseleted,
            row_focus: 0,
            column_focus: col_index,
            column_select: true,
          });
        } else {
          Store.MBLsheet_select_save.length = 0;
          Store.MBLsheet_select_save.push({
            left: left,
            width: width,
            top: rowLocationByIndex(0)[0],
            height: rowLocationByIndex(0)[1] - rowLocationByIndex(0)[0] - 1,
            left_move: left,
            width_move: width,
            top_move: row_pre,
            height_move: row - row_pre - 1,
            row: [0, row_index],
            column: columnseleted,
            row_focus: 0,
            column_focus: col_index,
            column_select: true,
          });
        }

        selectHightlightShow();
      }

      selectHelpboxFill();

      setTimeout(function () {
        clearTimeout(Store.countfuncTimeout);
        countfunc();
      }, 101);

      if (Store.MBLsheet_cols_menu_status) {
        $("#MBLsheet-rightclick-menu").hide();
        $("#MBLsheet-cols-h-hover").hide();
        $("#MBLsheet-cols-menu-btn").hide();
        Store.MBLsheet_cols_menu_status = false;
      }
      event.stopPropagation();
    })
    .mousemove(function (event) {
      if (Store.MBLsheet_cols_selected_status || Store.MBLsheet_select_status) {
        $("#MBLsheet-cols-h-hover").hide();
        $("#MBLsheet-cols-menu-btn").hide();
        return;
      }

      if (Store.MBLsheet_cols_menu_status || Store.MBLsheet_cols_change_size) {
        return;
      }

      let mouse = mouseposition(event.pageX, event.pageY);
      let x = mouse[0] + $("#MBLsheet-cols-h-c").scrollLeft();

      let col_location = colLocation(x),
        col = col_location[1],
        col_pre = col_location[0],
        col_index = col_location[2];

      $("#MBLsheet-cols-h-hover").css({
        left: col_pre,
        width: col - col_pre - 1,
        display: "block",
      });
      // 隐藏头部菜单
      // $("#MBLsheet-cols-menu-btn").css({ left: col - 19, display: "block" });

      $("#MBLsheet-cols-change-size").css({ left: col - 5 });
      if (x < col && x >= col - 5) {
        $("#MBLsheet-cols-change-size").css({ opacity: 0 });
        $("#MBLsheet-cols-menu-btn").hide();
      } else {
        $("#MBLsheet-change-size-line").hide();
        $("#MBLsheet-cols-change-size").css("opacity", 0);
      }
    })
    .mouseleave(function (event) {
      if (Store.MBLsheet_cols_menu_status || Store.MBLsheet_cols_change_size) {
        return;
      }

      $("#MBLsheet-cols-h-hover").hide();
      $("#MBLsheet-cols-menu-btn").hide();
      $("#MBLsheet-cols-change-size").css("opacity", 0);
    })
    .mouseup(function (event) {
      if (event.which === 1 && typeof eventObj.onclick === "function") {
        eventObj.onclick();
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
  ctx.stroke();
  ctx.closePath();
};

export async function renderIcon(icon, ctx, posi, obj, isHeader = true) {
  if (isHeader) {
    createIconEle(posi, obj);
    registerEvent(posi, obj);
  }

  const curImg = new Image();

  const x = transSzieForDPR(posi.x);
  const y = transSzieForDPR(posi.y);
  const w = transSzieForDPR(posi.w);
  const h = transSzieForDPR(posi.h);
  curImg.src = icons[icon];
  curImg.onload = function (e) {
    ctx.drawImage(curImg, x, y, w, h);
  };

  // debugDrawArea(ctx, { x, y, w, h });
}

const getBase64Image = (src) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "";
    img.src = src;
    img.onload = function () {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx?.drawImage(img, 0, 0, img.width, img.height);
      const ext = img.src.substring(img.src.lastIndexOf(".") + 1).toLowerCase();
      const dataURL = canvas.toDataURL("image/" + ext);
      resolve(dataURL);
    };
  });
};

function renderExtraIcon(curColumns, coord, curSheet, ctx) {
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

    // _.debounce(function () {
    //   console.log("%c Line:767 🥥", "color:#ea7e5c");
    // }, 200);

    // _.throttle(function () {
    renderIcon(
      extra?.icons,
      ctx,
      {
        x: drawStartC + left,
        y: drawStartR + top,
        w: iconWidth,
        h: iconHeigth,
      },
      extra,
      false
    );
    // }, 0);
  }
}

export { sgInit };
