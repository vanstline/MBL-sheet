import Store from "../store";
import {
  replaceHtml,
  getObjType,
  chatatABC,
  MBLsheetactiveCell,
} from "../utils/util";
import {
  getSheetIndex,
  getMBLsheet_select_save,
  get_MBLsheetfile,
} from "../methods/get";
import locale from "../locale/locale";
import method from "./method";
import formula from "./formula";
import func_methods from "./func_methods";
import tooltip from "./tooltip";
import json from "./json";
import editor from "./editor";
import MBLsheetformula from "./formula";
import cleargridelement from "./cleargridelement";
import { genarate, update } from "./format";
import { setAccuracy, setcellvalue } from "./setdata";
import { orderbydata } from "./sort";
import { rowlenByRange } from "./getRowlen";
import { getdatabyselection, getcellvalue } from "./getdata";
import {
  MBLsheetrefreshgrid,
  jfrefreshgrid,
  jfrefreshgrid_rhcw,
} from "./refresh";
import {
  MBLsheetDeleteCell,
  MBLsheetextendtable,
  MBLsheetdeletetable,
} from "./extend";
import {
  isRealNull,
  valueIsError,
  isRealNum,
  isEditMode,
  hasPartMC,
} from "./validate";
import { isdatetime, diff } from "./datecontroll";
import { getBorderInfoCompute } from "./border";
import { MBLsheetDrawMain } from "./draw";
import pivotTable from "../controllers/pivotTable";
import server from "../controllers/server";
import menuButton from "../controllers/menuButton";
import selection from "../controllers/selection";
import MBLsheetConfigsetting from "../controllers/MBLsheetConfigsetting";
import MBLsheetFreezen from "../controllers/freezen";
import MBLsheetsizeauto from "../controllers/resize";
import sheetmanage from "../controllers/sheetmanage";
import conditionformat from "../controllers/conditionformat";
import { MBLsheet_searcharray } from "../controllers/sheetSearch";
import { selectHightlightShow, selectIsOverlap } from "../controllers/select";
import { sheetHTML, MBLsheetdefaultstyle } from "../controllers/constant";
import { createFilterOptions } from "../controllers/filter";
import controlHistory from "../controllers/controlHistory";
import { zoomRefreshView, zoomNumberDomBind } from "../controllers/zoom";
import dataVerificationCtrl from "../controllers/dataVerificationCtrl";
import imageCtrl from "../controllers/imageCtrl";
import dayjs from "dayjs";
import { getRangetxt } from "../methods/get";
import { MBLsheetupdateCell } from "../controllers/updateCell";
const IDCardReg =
  /^\d{6}(18|19|20)?\d{2}(0[1-9]|1[12])(0[1-9]|[12]\d|3[01])\d{3}(\d|X)$/i;

/**
 * 获取单元格的值
 * @param {Number} row 单元格所在行数；从0开始的整数，0表示第一行
 * @param {Number} column 单元格所在列数；从0开始的整数，0表示第一列
 * @param {Object} options 可选参数
 * @param {String} options.type 单元格的值类型，可以设置为原始值"v"或者显示值"m"；默认值为'v',表示获取单元格的实际值
 * @param {Number} options.order 工作表索引；默认值为当前工作表索引
 */
export function getCellValue(row, column, options = {}) {
  if (!isRealNum(row) || !isRealNum(column)) {
    return tooltip.info(
      "Arguments row or column cannot be null or undefined.",
      ""
    );
  }
  let curSheetOrder = getSheetIndex(Store.currentSheetIndex);
  let { type = "v", order = curSheetOrder } = { ...options };
  let targetSheetData = Store.MBLsheetfile[order].data;
  let cellData = targetSheetData[row][column];
  let return_v;

  if (getObjType(cellData) == "object") {
    return_v = cellData[type];

    if (type == "f" && return_v != null) {
      return_v = formula.functionHTMLGenerate(return_v);
    } else if (type == "f") {
      return_v = cellData["v"];
    } else if (cellData && cellData.ct) {
      if (cellData.ct.fa == "yyyy-MM-dd") {
        return_v = cellData.m;
      }
      // 修复当单元格内有换行获取不到值的问题
      else if (
        cellData.ct.hasOwnProperty("t") &&
        cellData.ct.t === "inlineStr"
      ) {
        let inlineStrValueArr = cellData.ct.s;
        if (inlineStrValueArr) {
          return_v = inlineStrValueArr.map((i) => i.v).join("");
        }
      }
    }
  }

  if (return_v == undefined) {
    return_v = null;
  }

  return return_v;
}

/**
 * 设置单元格的值
 *
 * 关键点：如果设置了公式，则需要更新公式链insertUpdateFunctionGroup，如果设置了不是公式，判断之前是公式，则需要清除公式delFunctionGroup
 *
 * @param {Number} row 单元格所在行数；从0开始的整数，0表示第一行
 * @param {Number} column 单元格所在列数；从0开始的整数，0表示第一列
 * @param {Object | String | Number} value 要设置的值；可以为字符串或数字，或为符合MBLsheet单元格格式的对象
 * @param {Object} options 可选参数
 * @param {Number} options.order 工作表索引；默认值为当前工作表索引
 * @param {Boolean} options.isRefresh 是否刷新界面；默认为`true`
 * @param {Function} options.success 操作结束的回调函数
 */
export function setCellValue(row, column, value, options = {}) {
  console.log("%c Line:136 🍞 row, column", "color:#33a5ff", row, column);
  let curv = Store.flowdata?.[row]?.[column];

  // Store old value for hook function
  const oldValue = JSON.stringify(curv);

  if (!isRealNum(row) || !isRealNum(column)) {
    return tooltip.info("The row or column parameter is invalid.", "");
  }

  let {
    order = getSheetIndex(Store.currentSheetIndex),
    isRefresh = true,
    success,
  } = { ...options };

  let file = Store.MBLsheetfile[order];

  if (file == null) {
    return tooltip.info("The order parameter is invalid.", "");
  }

  /* cell更新前触发  */
  if (
    !method.createHookFunction(
      "cellUpdateBefore",
      row,
      column,
      value,
      isRefresh
    )
  ) {
    /* 如果cellUpdateBefore函数返回false 则不执行后续的更新 */
    return;
  }

  let data = file.data;
  if (isRefresh) {
    data = $.extend(true, [], file.data);
  }
  if (data.length == 0) {
    data = sheetmanage.buildGridData(file);
  }

  // MBLsheetformula.updatecell(row, column, value);
  let formatList = {
    //ct:1, //celltype,Cell value format: text, time, etc.
    bg: 1, //background,#fff000
    ff: 1, //fontfamily,
    fc: 1, //fontcolor
    bl: 1, //Bold
    it: 1, //italic
    fs: 1, //font size
    cl: 1, //Cancelline, 0 Regular, 1 Cancelline
    un: 1, //underline, 0 Regular, 1 underlines, fonts
    vt: 1, //Vertical alignment, 0 middle, 1 up, 2 down
    ht: 1, //Horizontal alignment,0 center, 1 left, 2 right
    mc: 1, //Merge Cells
    tr: 1, //Text rotation,0: 0、1: 45 、2: -45、3 Vertical text、4: 90 、5: -90
    tb: 1, //Text wrap,0 truncation, 1 overflow, 2 word wrap
    //v: 1, //Original value
    //m: 1, //Display value
    rt: 1, //text rotation angle 0-180 alignment
    //f: 1, //formula
    qp: 1, //quotePrefix, show number as string
  };

  if (value == null || value.toString().length == 0) {
    formula.delFunctionGroup(row, column);
    setcellvalue(row, column, data, value);
  } else if (value instanceof Object) {
    let curv = {};
    if (isRealNull(data[row][column])) {
      data[row][column] = {};
    }
    let cell = data[row][column];
    if (value.f != null && value.v == null) {
      curv.f = value.f;
      if (value.ct != null) {
        curv.ct = value.ct;
      }
      data = MBLsheetformula.updatecell(row, column, curv, false).data; //update formula value
    } else {
      if (value.ct != null) {
        curv.ct = value.ct;
      }
      if (value.f != null) {
        curv.f = value.f;
      }
      if (value.v != null) {
        curv.v = value.v;
      } else {
        curv.v = cell.v;
      }
      if (value.m != null) {
        curv.m = value.m;
      }
      formula.delFunctionGroup(row, column);
      setcellvalue(row, column, data, curv); //update text value
    }
    for (let attr in value) {
      let v = value[attr];
      if (attr in formatList) {
        menuButton.updateFormatCell(data, attr, v, row, row, column, column); //change range format
      } else {
        cell[attr] = v;
      }
    }
    data[row][column] = cell;
  } else {
    if (
      value.toString().substr(0, 1) == "=" ||
      value.toString().substr(0, 5) == "<span"
    ) {
      data = MBLsheetformula.updatecell(row, column, value, false).data; //update formula value or convert inline string html to object
    } else {
      formula.delFunctionGroup(row, column);
      setcellvalue(row, column, data, value);
    }
  }

  /* cell更新后触发  */
  setTimeout(() => {
    // Hook function
    method.createHookFunction(
      "cellUpdated",
      row,
      column,
      oldValue === "undefined" ? JSON.parse(oldValue) : undefined,
      Store.flowdata[row][column],
      isRefresh
    );
  }, 0);

  if (file.index == Store.currentSheetIndex && isRefresh) {
    jfrefreshgrid(data, [{ row: [row, row], column: [column, column] }]); //update data, meanwhile refresh canvas and store data to history
  } else {
    file.data = data; //only update data
  }

  if (success && typeof success === "function") {
    success(data);
  }
}

/**
 * 清除指定工作表指定单元格的内容，返回清除掉的数据，不同于删除单元格的功能，不需要设定单元格移动情况
 * @param {Number} row 单元格所在行数；从0开始的整数，0表示第一行
 * @param {Number} column 单元格所在列数；从0开始的整数，0表示第一列
 * @param {Object} options 可选参数
 * @param {Number} options.order 工作表索引；默认值为当前工作表索引
 * @param {Function} options.success 操作结束的回调函数
 */
export function clearCell(row, column, options = {}) {
  if (!isRealNum(row) || !isRealNum(column)) {
    return tooltip.info(
      "Arguments row and column cannot be null or undefined.",
      ""
    );
  }

  let curSheetOrder = getSheetIndex(Store.currentSheetIndex);
  let { order = curSheetOrder, success } = { ...options };

  let targetSheetData = $.extend(true, [], Store.MBLsheetfile[order].data);
  let cell = targetSheetData[row][column];

  if (getObjType(cell) == "object") {
    delete cell["m"];
    delete cell["v"];

    if (cell["f"] != null) {
      delete cell["f"];
      formula.delFunctionGroup(row, column, order);

      delete cell["spl"];
    }
  } else {
    cell = null;
  }

  // 若操作为当前sheet页，则刷新当前sheet页
  if (order === curSheetOrder) {
    jfrefreshgrid(targetSheetData, [
      {
        row: [row, row],
        column: [column, column],
      },
    ]);
  } else {
    Store.MBLsheetfile[order].data = targetSheetData;
  }

  if (success && typeof success === "function") {
    success(cell);
  }
}

/**
 * 删除指定工作表指定单元格，返回删除掉的数据，同时，指定是右侧单元格左移还是下方单元格上移
 * @param {String} move 删除后，右侧还是下方的单元格移动。可选值为 'left'、'up'
 * @param {Number} row 单元格所在行数；从0开始的整数，0表示第一行
 * @param {Number} column 单元格所在列数；从0开始的整数，0表示第一列
 * @param {Object} options 可选参数
 * @param {Number} options.order 工作表索引；默认值为当前工作表索引
 * @param {Function} options.success 操作结束的回调函数
 */
export function deleteCell(move, row, column, options = {}) {
  let moveTypes = ["left", "up"];
  if (!move || moveTypes.indexOf(move) < 0) {
    return tooltip.info(
      "Arguments move cannot be null or undefined and its value must be 'left' or 'up'",
      ""
    );
  }

  if (!isRealNum(row) || !isRealNum(column)) {
    return tooltip.info(
      "Arguments row and column cannot be null or undefined.",
      ""
    );
  }

  let curSheetOrder = getSheetIndex(Store.currentSheetIndex);
  let { order = curSheetOrder, success } = { ...options };

  let moveType = "move" + move.replace(move[0], move[0].toUpperCase()); // left-moveLeft;  up-moveUp

  let sheetIndex;
  if (order) {
    if (Store.MBLsheetfile[order]) {
      sheetIndex = Store.MBLsheetfile[order].index;
    }
  }

  MBLsheetDeleteCell(moveType, row, row, column, column, sheetIndex);

  if (success && typeof success === "function") {
    success();
  }
}

/**
 * 设置某个单元格的属性，如果要设置单元格的值或者同时设置多个单元格属性，推荐使用setCellValue
 * @param {Number} row 单元格所在行数；从0开始的整数，0表示第一行
 * @param {Number} column 单元格所在列数；从0开始的整数，0表示第一列
 * @param {String} attr
 * @param {Number | String | Object} value 具体的设置值，一个属性会对应多个值，参考 单元格属性表的值示例，特殊情况：如果属性类型attr是单元格格式ct，则设置值value应提供ct.fa，比如设置A1单元格的格式为百分比格式：MBLsheet.setCellFormat(0, 0, "ct", "0.00%")
 * @param {Object} options 可选参数
 * @param {Number} options.order 工作表索引；默认值为当前工作表索引
 * @param {Function} options.success 操作结束的回调函数, callback参数为改变后的cell对象
 */
export function setCellFormat(row, column, attr, value, options = {}) {
  if (!isRealNum(row) || !isRealNum(column)) {
    return tooltip.info(
      "Arguments row or column cannot be null or undefined.",
      ""
    );
  }

  if (!attr) {
    return tooltip.info("Arguments attr cannot be null or undefined.", "");
  }

  let curSheetOrder = getSheetIndex(Store.currentSheetIndex);
  let { order = curSheetOrder, success } = { ...options };

  let file = Store.MBLsheetfile[order];

  if (file == null) {
    return tooltip.info("The order parameter is invalid.", "");
  }

  let targetSheetData = $.extend(true, [], file.data);
  if (targetSheetData.length == 0) {
    targetSheetData = sheetmanage.buildGridData(file);
  }

  let cellData = targetSheetData[row][column] || {};
  let cfg = $.extend(true, {}, file.config);

  // 特殊格式
  if (
    attr == "ct" &&
    (!value || !value.hasOwnProperty("fa") || !value.hasOwnProperty("t"))
  ) {
    return new TypeError(
      "While set attribute 'ct' to cell, the value must have property 'fa' and 't'"
    );
  }

  if (attr == "bd") {
    if (cfg["borderInfo"] == null) {
      cfg["borderInfo"] = [];
    }

    let borderInfo = {
      rangeType: "range",
      borderType: "border-all",
      color: "#000",
      style: "1",
      range: [
        {
          column: [column, column],
          row: [row, row],
        },
      ],
      ...value,
    };

    cfg["borderInfo"].push(borderInfo);
  } else {
    cellData[attr] = value;
  }

  targetSheetData[row][column] = cellData;

  // refresh
  if (file.index == Store.currentSheetIndex) {
    file.config = cfg;
    Store.config = cfg;
    jfrefreshgrid(targetSheetData, [
      { row: [row, row], column: [column, column] },
    ]);
  } else {
    file.config = cfg;
    file.data = targetSheetData;
  }

  if (success && typeof success === "function") {
    success(cellData);
  }
}

/**
 * 查找一个工作表中的指定内容，返回查找到的内容组成的单元格一位数组，数据格式同celldata
 * @param {String} content 要查找的内容 可以为正则表达式（不包含前后'/')
 * @param {Object} options 可选参数
 * @param {Boolean} options.isRegularExpression 是否正则表达式匹配；默认为 false. 注意：正则中的规则需要转义，如\S需要写成 \\S
 * @param {Boolean} options.isWholeWord 是否整词匹配；默认为 false
 * @param {Boolean} options.isCaseSensitive 是否区分大小写匹配；默认为 false
 * @param {Number} options.order 工作表索引；默认值为当前工作表索引
 * @param {String} options.type 单元格属性；默认值为m
 */
export function find(content, options = {}) {
  if (!content && content != 0) {
    return tooltip.info("Search content cannot be null or empty", "");
  }

  let curSheetOrder = getSheetIndex(Store.currentSheetIndex);
  let {
    isRegularExpression = false,
    isWholeWord = false,
    isCaseSensitive = false,
    order = curSheetOrder,
    type = "m",
  } = { ...options };
  let targetSheetData = Store.MBLsheetfile[order].data;

  let result = [];
  for (let i = 0; i < targetSheetData.length; i++) {
    const rowArr = targetSheetData[i];

    for (let j = 0; j < rowArr.length; j++) {
      const cell = rowArr[j];

      if (!cell) {
        continue;
      }

      // 添加cell的row, column属性
      // replace方法中的setCellValue中需要使用该属性
      cell.row = i;
      cell.column = j;

      if (isWholeWord) {
        if (isCaseSensitive) {
          if (content.toString() == cell[type]) {
            result.push(cell);
          }
        } else {
          if (
            cell[type] &&
            content.toString().toLowerCase() == cell[type].toLowerCase()
          ) {
            result.push(cell);
          }
        }
      } else if (isRegularExpression) {
        let reg;
        if (isCaseSensitive) {
          reg = new RegExp(func_methods.getRegExpStr(content), "g");
        } else {
          reg = new RegExp(func_methods.getRegExpStr(content), "ig");
        }
        if (reg.test(cell[type])) {
          result.push(cell);
        }
      } else if (isCaseSensitive) {
        let reg = new RegExp(func_methods.getRegExpStr(content), "g");
        if (reg.test(cell[type])) {
          result.push(cell);
        }
      } else {
        let reg = new RegExp(func_methods.getRegExpStr(content), "ig");
        if (reg.test(cell[type])) {
          result.push(cell);
        }
      }
    }
  }

  return result;
}

/**
 * 查找一个工作表中的指定内容并替换成新的内容，返回替换后的内容组成的单元格一位数组，数据格式同celldata。
 * @param {String} content 要查找的内容
 * @param {String} replaceContent 要替换的内容
 * @param {Object} options 可选参数
 * @param {Boolean} options.isRegularExpression 是否正则表达式匹配；默认为 false
 * @param {Boolean} options.isWholeWord 是否整词匹配；默认为 false
 * @param {Boolean} options.isCaseSensitive 是否区分大小写匹配；默认为 false
 * @param {Number} options.order 工作表索引；默认值为当前工作表索引
 * @param {Function} options.success 操作结束的回调函数, callback参数为替换后的cell集合
 */
export function replace(content, replaceContent, options = {}) {
  let matchCells = find(content, options);
  let curSheetOrder = getSheetIndex(Store.currentSheetIndex);
  let { order = curSheetOrder } = { ...options };

  let file = Store.MBLsheetfile[order];

  if (file == null) {
    return tooltip.info("The order parameter is invalid.", "");
  }
  let sheetData = $.extend(true, [], file.data);

  matchCells.forEach((cell) => {
    cell.m = replaceContent;
    setCellValue(cell.row, cell.column, replaceContent, {
      order: order,
      isRefresh: false,
    });
  });

  let fileData = $.extend(true, [], file.data);
  file.data.length = 0;
  file.data.push(...sheetData);

  if (file.index == Store.currentSheetIndex) {
    jfrefreshgrid(fileData, undefined, undefined, true, false);
  }

  MBLsheetrefreshgrid();

  if (options.success && typeof options.success === "function") {
    options.success(matchCells);
  }
  return matchCells;
}

/**
 * 手动触发退出编辑模式
 * @param {Object} options 可选参数
 * @param {Function} options.success 操作结束的回调函数
 */
export function exitEditMode(options = {}) {
  if (parseInt($("#MBLsheet-input-box").css("top")) > 0) {
    if (
      $("#MBLsheet-formula-search-c").is(":visible") &&
      formula.searchFunctionCell != null
    ) {
      formula.searchFunctionEnter(
        $("#MBLsheet-formula-search-c").find(
          ".MBLsheet-formula-search-item-active"
        )
      );
    } else {
      formula.updatecell(
        Store.MBLsheetCellUpdate[0],
        Store.MBLsheetCellUpdate[1]
      );
      Store.MBLsheet_select_save = [
        {
          row: [Store.MBLsheetCellUpdate[0], Store.MBLsheetCellUpdate[0]],
          column: [Store.MBLsheetCellUpdate[1], Store.MBLsheetCellUpdate[1]],
          row_focus: Store.MBLsheetCellUpdate[0],
          column_focus: Store.MBLsheetCellUpdate[1],
        },
      ];
    }

    //若有参数弹出框，隐藏
    if ($("#MBLsheet-search-formula-parm").is(":visible")) {
      $("#MBLsheet-search-formula-parm").hide();
    }
    //若有参数选取范围弹出框，隐藏
    if ($("#MBLsheet-search-formula-parm-select").is(":visible")) {
      $("#MBLsheet-search-formula-parm-select").hide();
    }
  }

  if (options.success && typeof options.success === "function") {
    options.success();
  }
}

/**
 * 手动触发进入编辑模式
 * @param {Object} options 可选参数
 * @param {Function} options.success 操作结束的回调函数
 */
export function enterEditMode(options = {}) {
  if ($("#MBLsheet-conditionformat-dialog").is(":visible")) {
    return;
  } else if ($("#MBLsheet-cell-selected").is(":visible")) {
    let last =
      Store.MBLsheet_select_save[Store.MBLsheet_select_save.length - 1];

    let row_index = last["row_focus"],
      col_index = last["column_focus"];

    MBLsheetupdateCell(row_index, col_index, Store.flowdata);
  }

  if (options.success && typeof options.success === "function") {
    options.success();
  }
}

/**
 * 冻结首行
 * 若设置冻结的sheet不是当前sheet页，只设置参数不渲染
 * @param {Number | String} order 工作表索引
 */
export function frozenFirstRow(order) {
  // store frozen
  MBLsheetFreezen.saveFrozen("freezenRow", order);

  // 冻结为当前sheet页
  if (!order || order == getSheetIndex(Store.currentSheetIndex)) {
    let freezenhorizontaldata, row_st, top;
    if (MBLsheetFreezen.freezenRealFirstRowColumn) {
      let row_st = 0;
      top = Store.visibledatarow[row_st] - 2 + Store.columnHeaderHeight;
      freezenhorizontaldata = [
        Store.visibledatarow[row_st],
        row_st + 1,
        0,
        MBLsheetFreezen.cutVolumn(Store.visibledatarow, row_st + 1),
        top,
      ];
    } else {
      let scrollTop = $("#MBLsheet-cell-main").scrollTop();
      row_st = MBLsheet_searcharray(Store.visibledatarow, scrollTop);
      if (row_st == -1) {
        row_st = 0;
      }

      top =
        Store.visibledatarow[row_st] - 2 - scrollTop + Store.columnHeaderHeight;
      freezenhorizontaldata = [
        Store.visibledatarow[row_st],
        row_st + 1,
        scrollTop,
        MBLsheetFreezen.cutVolumn(Store.visibledatarow, row_st + 1),
        top,
      ];
    }

    MBLsheetFreezen.saveFreezen(freezenhorizontaldata, top, null, null);

    if (MBLsheetFreezen.freezenverticaldata != null) {
      MBLsheetFreezen.cancelFreezenVertical();
      MBLsheetFreezen.createAssistCanvas();
      MBLsheetrefreshgrid();
    }

    MBLsheetFreezen.createFreezenHorizontal(freezenhorizontaldata, top);
    MBLsheetFreezen.createAssistCanvas();
    MBLsheetrefreshgrid();
  }
}

/**
 * 冻结首列
 * 若设置冻结的sheet不是当前sheet页，只设置参数不渲染
 * @param {Number | String} order 工作表索引
 */
export function frozenFirstColumn(order) {
  // store frozen
  MBLsheetFreezen.saveFrozen("freezenColumn", order);

  // 冻结为当前sheet页
  if (!order || order == getSheetIndex(Store.currentSheetIndex)) {
    let freezenverticaldata, col_st, left;
    if (MBLsheetFreezen.freezenRealFirstRowColumn) {
      col_st = 0;
      left = Store.visibledatacolumn[col_st] - 2 + Store.rowHeaderWidth;
      freezenverticaldata = [
        Store.visibledatacolumn[col_st],
        col_st + 1,
        0,
        MBLsheetFreezen.cutVolumn(Store.visibledatacolumn, col_st + 1),
        left,
      ];
    } else {
      let scrollLeft = $("#MBLsheet-cell-main").scrollLeft();

      col_st = MBLsheet_searcharray(Store.visibledatacolumn, scrollLeft);
      if (col_st == -1) {
        col_st = 0;
      }

      left =
        Store.visibledatacolumn[col_st] - 2 - scrollLeft + Store.rowHeaderWidth;
      freezenverticaldata = [
        Store.visibledatacolumn[col_st],
        col_st + 1,
        scrollLeft,
        MBLsheetFreezen.cutVolumn(Store.visibledatacolumn, col_st + 1),
        left,
      ];
    }

    MBLsheetFreezen.saveFreezen(null, null, freezenverticaldata, left);

    if (MBLsheetFreezen.freezenhorizontaldata != null) {
      MBLsheetFreezen.cancelFreezenHorizontal();
      MBLsheetFreezen.createAssistCanvas();
      MBLsheetrefreshgrid();
    }

    MBLsheetFreezen.createFreezenVertical(freezenverticaldata, left);
    MBLsheetFreezen.createAssistCanvas();
    MBLsheetrefreshgrid();
  }
}

/**
 * 冻结行选区
 * @param {Object} range 行选区范围的focus单元格的行列值构成的对象；格式为{ row_focus:0, column_focus:0 }
 * @param {Number | String} order 工作表索引
 */
export function frozenRowRange(range, order) {
  const locale_frozen = locale().freezen;

  if (
    !range ||
    (!range.hasOwnProperty("row_focus") && !formula.iscelldata(range))
  ) {
    if (isEditMode()) {
      alert(locale_frozen.noSeletionError);
    } else {
      tooltip.info(locale_frozen.noSeletionError, "");
    }
    return;
  }

  if (typeof range === "string" && formula.iscelldata(range)) {
    range = formula.getcellrange(range);
    range = {
      row_focus: range.row[0],
      column_focus: range.column[0],
    };
  }
  // store frozen
  MBLsheetFreezen.saveFrozen("freezenRowRange", order, range);

  if (!order || order == getSheetIndex(Store.currentSheetIndex)) {
    let scrollTop = $("#MBLsheet-cell-main").scrollTop();
    let row_st = MBLsheet_searcharray(Store.visibledatarow, scrollTop);

    let row_focus = range.row_focus;
    if (row_focus > row_st) {
      row_st = row_focus;
    }
    if (row_st == -1) {
      row_st = 0;
    }

    let top =
      Store.visibledatarow[row_st] - 2 - scrollTop + Store.columnHeaderHeight;
    let freezenhorizontaldata = [
      Store.visibledatarow[row_st],
      row_st + 1,
      scrollTop,
      MBLsheetFreezen.cutVolumn(Store.visibledatarow, row_st + 1),
      top,
    ];
    MBLsheetFreezen.saveFreezen(freezenhorizontaldata, top, null, null);

    if (MBLsheetFreezen.freezenverticaldata != null) {
      MBLsheetFreezen.cancelFreezenVertical();
      MBLsheetFreezen.createAssistCanvas();
      MBLsheetrefreshgrid();
    }

    MBLsheetFreezen.createFreezenHorizontal(freezenhorizontaldata, top);
    MBLsheetFreezen.createAssistCanvas();
    MBLsheetrefreshgrid();
  }
}

/**
 * 冻结列选区
 * @param {Object} range 列选区范围的focus单元格的行列值构成的对象；格式为{ row_focus:0, column_focus:0 }
 * @param {Number | String} order 工作表索引
 */
export function frozenColumnRange(range, order) {
  const locale_frozen = locale().freezen;
  let isStringRange = typeof range === "string" && formula.iscelldata(range);

  if (!range || (!range.hasOwnProperty("column_focus") && !isStringRange)) {
    if (isEditMode()) {
      alert(locale_frozen.noSeletionError);
    } else {
      tooltip.info(locale_frozen.noSeletionError, "");
    }
    return;
  }

  if (isStringRange) {
    range = formula.getcellrange(range);
    range = {
      row_focus: range.row[0],
      column_focus: range.column[0],
    };
  }
  // store frozen
  MBLsheetFreezen.saveFrozen("freezenColumnRange", order, range);

  if (!order || order == getSheetIndex(Store.currentSheetIndex)) {
    let scrollLeft = $("#MBLsheet-cell-main").scrollLeft();
    let col_st = MBLsheet_searcharray(Store.visibledatacolumn, scrollLeft);

    let column_focus = range.column_focus;
    if (column_focus > col_st) {
      col_st = column_focus;
    }
    if (col_st == -1) {
      col_st = 0;
    }

    let left =
      Store.visibledatacolumn[col_st] - 2 - scrollLeft + Store.rowHeaderWidth;
    let freezenverticaldata = [
      Store.visibledatacolumn[col_st],
      col_st + 1,
      scrollLeft,
      MBLsheetFreezen.cutVolumn(Store.visibledatacolumn, col_st + 1),
      left,
    ];
    MBLsheetFreezen.saveFreezen(null, null, freezenverticaldata, left);

    if (MBLsheetFreezen.freezenhorizontaldata != null) {
      MBLsheetFreezen.cancelFreezenHorizontal();
      MBLsheetFreezen.createAssistCanvas();
      MBLsheetrefreshgrid();
    }

    MBLsheetFreezen.createFreezenVertical(freezenverticaldata, left);
    MBLsheetFreezen.createAssistCanvas();
    MBLsheetrefreshgrid();
  }
}

/**
 * 取消冻结
 * @param {Number | String} order
 */
export function cancelFrozen(order) {
  MBLsheetFreezen.saveFrozen("freezenCancel", order);

  // 取消当前sheet冻结时，刷新canvas
  if (!order || order == getSheetIndex(Store.currentSheetIndex)) {
    if (MBLsheetFreezen.freezenverticaldata != null) {
      MBLsheetFreezen.cancelFreezenVertical();
    }
    if (MBLsheetFreezen.freezenhorizontaldata != null) {
      MBLsheetFreezen.cancelFreezenHorizontal();
    }
    MBLsheetFreezen.createAssistCanvas();
    MBLsheetrefreshgrid();
  }
}

/**
 * 冻结行操作。特别注意，只有在isRange设置为true的时候，才需要设置setting中的range，且与一般的range格式不同。
 * @param {Boolean} isRange 是否冻结行到选区 true-冻结行到选区  false-冻结首行
 * @param {Object} options 可选参数
 * @param {Object} options.range isRange为true的时候设置，开启冻结的单元格位置，格式为{ row_focus:0, column_focus:0 }，意为当前激活的单元格的行数和列数；默认从当前选区最后的一个选区中取得
 * @param {Number} options.order 工作表索引；默认值为当前工作表索引
 * @param {Function} options.success 操作结束的回调函数
 */
export function setHorizontalFrozen(isRange, options = {}) {
  let curSheetOrder = getSheetIndex(Store.currentSheetIndex);
  let { range, order = curSheetOrder, success } = { ...options };

  // 若已存在冻结，取消之前的冻结效果
  cancelFrozen(order);

  if (!isRange) {
    frozenFirstRow(order);
  } else {
    // 选区行冻结
    frozenRowRange(range, order);
  }

  if (success && typeof success === "function") {
    success();
  }
}

/**
 * 冻结列操作。特别注意，只有在isRange设置为true的时候，才需要设置setting中的range，且与一般的range格式不同。
 * @param {Boolean} isRange 是否冻结列到选区 true-冻结列到选区  false-冻结首列
 * @param {Object} options 可选参数
 * @param {Object} options.range isRange为true的时候设置，开启冻结的单元格位置，格式为{ row_focus:0, column_focus:0 }，意为当前激活的单元格的行数和列数；默认从当前选区最后的一个选区中取得
 * @param {Number} options.order 工作表索引；默认值为当前工作表索引
 * @param {Function} options.success 操作结束的回调函数
 */
export function setVerticalFrozen(isRange, options = {}) {
  let curSheetOrder = getSheetIndex(Store.currentSheetIndex);
  let { range, order = curSheetOrder, success } = { ...options };

  // 若已存在冻结，取消之前的冻结效果
  cancelFrozen(order);

  if (!isRange) {
    frozenFirstColumn(order);
  } else {
    frozenColumnRange(range, order);
  }

  if (success && typeof success === "function") {
    success();
  }
}

/**
 * 冻结行列操作。特别注意，只有在isRange设置为true的时候，才需要设置setting中的range，且与一般的range格式不同。
 * @param {Boolean} isRange 是否冻结行列到选区 true-冻结行列到选区  false-冻结首行列
 * @param {Object} options 可选参数
 * @param {Object} options.range isRange为true的时候设置，开启冻结的单元格位置，格式为{ row_focus:0, column_focus:0 }，意为当前激活的单元格的行数和列数；默认从当前选区最后的一个选区中取得
 * @param {Number} options.order 工作表索引；默认值为当前工作表索引
 * @param {Function} options.success 操作结束的回调函数
 */
export function setBothFrozen(isRange, options = {}) {
  let curSheetOrder = getSheetIndex(Store.currentSheetIndex);
  let { range, order = curSheetOrder, success } = { ...options };

  let isCurrentSheet =
    !order || order == getSheetIndex(Store.currentSheetIndex);
  const locale_frozen = locale().freezen;

  // 若已存在冻结，取消之前的冻结效果
  cancelFrozen(order);

  // 冻结首行列
  if (!isRange) {
    // store frozen
    MBLsheetFreezen.saveFrozen("freezenRC", order);

    if (isCurrentSheet) {
      let scrollTop = $("#MBLsheet-cell-main").scrollTop();
      let row_st = MBLsheet_searcharray(Store.visibledatarow, scrollTop);
      if (row_st == -1) {
        row_st = 0;
      }
      let top =
        Store.visibledatarow[row_st] - 2 - scrollTop + Store.columnHeaderHeight;
      let freezenhorizontaldata = [
        Store.visibledatarow[row_st],
        row_st + 1,
        scrollTop,
        MBLsheetFreezen.cutVolumn(Store.visibledatarow, row_st + 1),
        top,
      ];
      MBLsheetFreezen.saveFreezen(freezenhorizontaldata, top, null, null);

      MBLsheetFreezen.createFreezenHorizontal(freezenhorizontaldata, top);

      let scrollLeft = $("#MBLsheet-cell-main").scrollLeft();
      let col_st = MBLsheet_searcharray(Store.visibledatacolumn, scrollLeft);
      if (col_st == -1) {
        col_st = 0;
      }
      let left =
        Store.visibledatacolumn[col_st] - 2 - scrollLeft + Store.rowHeaderWidth;
      let freezenverticaldata = [
        Store.visibledatacolumn[col_st],
        col_st + 1,
        scrollLeft,
        MBLsheetFreezen.cutVolumn(Store.visibledatacolumn, col_st + 1),
        left,
      ];
      MBLsheetFreezen.saveFreezen(null, null, freezenverticaldata, left);

      MBLsheetFreezen.createFreezenVertical(freezenverticaldata, left);

      MBLsheetFreezen.createAssistCanvas();
      MBLsheetrefreshgrid();
    }
  } else {
    // 冻结行列到选区
    // store frozen
    MBLsheetFreezen.saveFrozen("freezenRCRange", order, range);

    let isStringRange = typeof range === "string" && formula.iscelldata(range);
    if (isCurrentSheet) {
      if (
        (!range ||
          !(
            range.hasOwnProperty("column_focus") &&
            range.hasOwnProperty("row_focus")
          )) &&
        !isStringRange
      ) {
        if (isEditMode()) {
          alert(locale_frozen.noSeletionError);
        } else {
          tooltip.info(locale_frozen.noSeletionError, "");
        }
        return;
      }

      if (isStringRange) {
        range = formula.getcellrange(range);
        range = {
          row_focus: range.row[0],
          column_focus: range.column[0],
        };
      }

      let scrollTop = $("#MBLsheet-cell-main").scrollTop();
      let row_st = MBLsheet_searcharray(Store.visibledatarow, scrollTop);

      let row_focus = range.row_focus;

      if (row_focus > row_st) {
        row_st = row_focus;
      }

      if (row_st == -1) {
        row_st = 0;
      }

      let top =
        Store.visibledatarow[row_st] - 2 - scrollTop + Store.columnHeaderHeight;
      let freezenhorizontaldata = [
        Store.visibledatarow[row_st],
        row_st + 1,
        scrollTop,
        MBLsheetFreezen.cutVolumn(Store.visibledatarow, row_st + 1),
        top,
      ];
      MBLsheetFreezen.saveFreezen(freezenhorizontaldata, top, null, null);

      MBLsheetFreezen.createFreezenHorizontal(freezenhorizontaldata, top);

      let scrollLeft = $("#MBLsheet-cell-main").scrollLeft();
      let col_st = MBLsheet_searcharray(Store.visibledatacolumn, scrollLeft);

      let column_focus = range.column_focus;

      if (column_focus > col_st) {
        col_st = column_focus;
      }

      if (col_st == -1) {
        col_st = 0;
      }

      let left =
        Store.visibledatacolumn[col_st] - 2 - scrollLeft + Store.rowHeaderWidth;
      let freezenverticaldata = [
        Store.visibledatacolumn[col_st],
        col_st + 1,
        scrollLeft,
        MBLsheetFreezen.cutVolumn(Store.visibledatacolumn, col_st + 1),
        left,
      ];
      MBLsheetFreezen.saveFreezen(null, null, freezenverticaldata, left);

      MBLsheetFreezen.createFreezenVertical(freezenverticaldata, left);

      MBLsheetFreezen.createAssistCanvas();
      MBLsheetrefreshgrid();
    }
  }
}

/**
 * 在第index行或列的位置，插入number行或列
 * @param {String} type 插入行或列 row-行  column-列
 * @param {Number} index 在第几行插入空白行，从0开始
 * @param {Object} options 可选参数
 * @param {Number} options.number 插入的空白行数；默认为 1
 * @param {Number} options.order 工作表索引；默认值为当前工作表索引
 * @param {Function} options.success 操作结束的回调函数
 */
export function insertRowOrColumn(type, index = 0, options = {}) {
  if (!isRealNum(index)) {
    return tooltip.info("The index parameter is invalid.", "");
  }

  let curSheetOrder = getSheetIndex(Store.currentSheetIndex);
  let { number = 1, order = curSheetOrder, success } = { ...options };

  let _locale = locale();
  let locale_info = _locale.info;
  if (!isRealNum(number)) {
    if (isEditMode()) {
      alert(locale_info.tipInputNumber);
    } else {
      tooltip.info(locale_info.tipInputNumber, "");
    }
    return;
  }

  number = parseInt(number);
  if (number < 1 || number > 100) {
    if (isEditMode()) {
      alert(locale_info.tipInputNumberLimit);
    } else {
      tooltip.info(locale_info.tipInputNumberLimit, "");
    }
    return;
  }

  // 默认在行上方增加行，列左侧增加列
  let sheetIndex;
  if (order) {
    if (Store.MBLsheetfile[order]) {
      sheetIndex = Store.MBLsheetfile[order].index;
    }
  }

  MBLsheetextendtable(type, index, number, "lefttop", sheetIndex);

  if (success && typeof success === "function") {
    success();
  }
}
/**
 * 在第index行或列的位置，插入number行或列
 * @param {String} type 插入行或列 row-行  column-列
 * @param {Number} index 在第几行插入空白行，从0开始
 * @param {Object} options 可选参数
 * @param {Number} options.number 插入的空白行数；默认为 1
 * @param {Number} options.order 工作表索引；默认值为当前工作表索引
 * @param {Function} options.success 操作结束的回调函数
 */
export function insertRowBottomOrColumnRight(type, index = 0, options = {}) {
  if (!isRealNum(index)) {
    return tooltip.info("The index parameter is invalid.", "");
  }

  let curSheetOrder = getSheetIndex(Store.currentSheetIndex);
  let { number = 1, order = curSheetOrder, success } = { ...options };

  let _locale = locale();
  let locale_info = _locale.info;
  if (!isRealNum(number)) {
    if (isEditMode()) {
      alert(locale_info.tipInputNumber);
    } else {
      tooltip.info(locale_info.tipInputNumber, "");
    }
    return;
  }

  number = parseInt(number);
  if (number < 1 || number > 100) {
    if (isEditMode()) {
      alert(locale_info.tipInputNumberLimit);
    } else {
      tooltip.info(locale_info.tipInputNumberLimit, "");
    }
    return;
  }

  // 默认在行上方增加行，列左侧增加列
  let sheetIndex;
  if (order) {
    if (Store.MBLsheetfile[order]) {
      sheetIndex = Store.MBLsheetfile[order].index;
    }
  }

  MBLsheetextendtable(type, index, number, "rightbottom", sheetIndex);

  if (success && typeof success === "function") {
    success();
  }
}
/**
 * 在第row行的位置，插入number行空白行
 * @param {Number} row 在第几行插入空白行，从0开始
 * @param {Object} options 可选参数
 * @param {Number} options.number 插入的空白行数；默认为 1
 * @param {Number} options.order 工作表索引；默认值为当前工作表索引
 * @param {Function} options.success 操作结束的回调函数
 */
export function insertRow(row = 0, options = {}) {
  insertRowOrColumn("row", row, options);
}
/**
 * 在第row行的位置，插入number行空白行
 * @param {Number} row 在第几行插入空白行，从0开始
 * @param {Object} options 可选参数
 * @param {Number} options.number 插入的空白行数；默认为 1
 * @param {Number} options.order 工作表索引；默认值为当前工作表索引
 * @param {Function} options.success 操作结束的回调函数
 */
export function insertRowBottom(row = 0, options = {}) {
  insertRowBottomOrColumnRight("row", row, options);
}
/**
 * 在第column列的位置，插入number列空白列
 * @param {Number} column 在第几列插入空白列，从0开始
 * @param {Object} options 可选参数
 * @param {Number} options.number 插入的空白列数；默认为 1
 * @param {Number} options.order 工作表索引；默认值为当前工作表索引
 * @param {Function} options.success 操作结束的回调函数
 */
export function insertColumn(column = 0, options = {}) {
  insertRowOrColumn("column", column, options);
}
/**
 * 在第column列的位置，插入number列空白列
 * @param {Number} column 在第几列插入空白列，从0开始
 * @param {Object} options 可选参数
 * @param {Number} options.number 插入的空白列数；默认为 1
 * @param {Number} options.order 工作表索引；默认值为当前工作表索引
 * @param {Function} options.success 操作结束的回调函数
 */
export function insertColumnRight(column = 0, options = {}) {
  insertRowBottomOrColumnRight("column", column, options);
}
/**
 * 删除指定的行或列。删除行列之后，行列的序号并不会变化，下面的行（右侧的列）会补充到上（左）面，注意观察数据是否被正确删除即可。
 * @param {String} type 删除行或列 row-行  column-列
 * @param {Number} startIndex 要删除的起始行或列
 * @param {Number} endIndex 要删除的结束行或列
 * @param {Object} options 可选参数
 * @param {Number} options.order 工作表索引；默认值为当前工作表索引
 * @param {Function} options.success 操作结束的回调函数
 */
export function deleteRowOrColumn(type, startIndex, endIndex, options = {}) {
  if (!isRealNum(startIndex) || !isRealNum(endIndex)) {
    return tooltip.info(
      "Please enter the index for deleting rows or columns correctly.",
      ""
    );
  }

  let curSheetOrder = getSheetIndex(Store.currentSheetIndex);
  let { order = curSheetOrder, success } = { ...options };

  let sheetIndex;
  if (order) {
    if (Store.MBLsheetfile[order]) {
      sheetIndex = Store.MBLsheetfile[order].index;
    }
  }
  MBLsheetdeletetable(type, startIndex, endIndex, sheetIndex);

  if (success && typeof success === "function") {
    success();
  }
}

/**
 * 删除指定的行。
 * @param {Number} rowStart 要删除的起始行
 * @param {Number} rowEnd 要删除的结束行
 * @param {Object} options 可选参数
 * @param {Number} options.order 工作表索引；默认值为当前工作表索引
 * @param {Function} options.success 操作结束的回调函数
 */
export function deleteRow(rowStart, rowEnd, options = {}) {
  deleteRowOrColumn("row", rowStart, rowEnd, options);
}

/**
 * 删除指定的列。
 * @param {Number} columnStart 要删除的起始列
 * @param {Number} columnEnd 要删除的结束列
 * @param {Object} options 可选参数
 * @param {Number} options.order 工作表索引；默认值为当前工作表索引
 * @param {Function} options.success 操作结束的回调函数
 */
export function deleteColumn(columnStart, columnEnd, options = {}) {
  deleteRowOrColumn("column", columnStart, columnEnd, options);
}

/**
 * 隐藏行或列
 * @param {String} type 隐藏行或列  row-隐藏行  column-隐藏列
 * @param {Number} startIndex 起始行或列
 * @param {Number} endIndex 结束行或列
 * @param {Object} options 可选参数
 * @param {Number} options.order 工作表索引；默认值为当前工作表索引
 * @param {Function} options.success 操作结束的回调函数
 */
export function hideRowOrColumn(type, startIndex, endIndex, options = {}) {
  if (!isRealNum(startIndex) || !isRealNum(endIndex)) {
    return tooltip.info(
      "Please enter the index for deleting rows or columns correctly.",
      ""
    );
  }

  let curSheetOrder = getSheetIndex(Store.currentSheetIndex);
  let { order = curSheetOrder, saveParam = true, success } = { ...options };

  let file = Store.MBLsheetfile[order];
  let cfgKey = type === "row" ? "rowhidden" : "colhidden";
  let cfg = $.extend(true, {}, file.config);
  if (cfg[cfgKey] == null) {
    cfg[cfgKey] = {};
  }

  for (let i = startIndex; i <= endIndex; i++) {
    cfg[cfgKey][i] = 0;
  }

  //保存撤销
  if (Store.clearjfundo) {
    let redo = {};
    redo["type"] = type === "row" ? "showHidRows" : "showHidCols";
    redo["sheetIndex"] = file.index;
    redo["config"] = $.extend(true, {}, file.config);
    redo["curconfig"] = cfg;

    Store.jfundo.length = 0;
    Store.jfredo.push(redo);
  }

  Store.MBLsheetfile[order].config = cfg;

  if (saveParam) {
    server.saveParam("cg", file.index, cfg[cfgKey], { k: cfgKey });
  }

  // 若操作sheet为当前sheet页，行高、列宽 刷新
  if (order == curSheetOrder) {
    //config
    Store.config = cfg;
    jfrefreshgrid_rhcw(Store.flowdata.length, Store.flowdata[0].length);
  }

  if (success && typeof success === "function") {
    success();
  }
}

/**
 * 显示隐藏的行或列
 * @param {String} type 显示行或列  row-显示行  column-显示列
 * @param {Number} startIndex 起始行或列
 * @param {Number} endIndex 结束行或列
 * @param {Object} options 可选参数
 * @param {Number} options.order 工作表索引；默认值为当前工作表索引
 * @param {Function} options.success 操作结束的回调函数
 */
export function showRowOrColumn(type, startIndex, endIndex, options = {}) {
  if (!isRealNum(startIndex) || !isRealNum(endIndex)) {
    return tooltip.info(
      "Please enter the index for deleting rows or columns correctly.",
      ""
    );
  }

  let curSheetOrder = getSheetIndex(Store.currentSheetIndex);
  let { order = curSheetOrder, saveParam = true, success } = { ...options };

  let file = Store.MBLsheetfile[order];
  let cfgKey = type === "row" ? "rowhidden" : "colhidden";
  let cfg = $.extend(true, {}, file.config);
  if (cfg[cfgKey] == null) {
    return;
  }

  for (let i = startIndex; i <= endIndex; i++) {
    delete cfg[cfgKey][i];
  }

  //保存撤销
  if (Store.clearjfundo) {
    let redo = {};
    redo["type"] = type === "row" ? "showHidRows" : "showHidCols";
    redo["sheetIndex"] = file.index;
    redo["config"] = $.extend(true, {}, file.config);
    redo["curconfig"] = cfg;

    Store.jfundo.length = 0;
    Store.jfredo.push(redo);
  }

  //config
  Store.MBLsheetfile[order].config = Store.config;

  if (saveParam) {
    server.saveParam("cg", file.index, cfg[cfgKey], { k: cfgKey });
  }

  // 若操作sheet为当前sheet页，行高、列宽 刷新
  if (order === curSheetOrder) {
    Store.config = cfg;
    jfrefreshgrid_rhcw(Store.flowdata.length, Store.flowdata[0].length);
  }

  if (success && typeof success === "function") {
    success();
  }
}

/**
 * 隐藏行
 * @param {Number} startIndex 起始行
 * @param {Number} endIndex 结束行
 * @param {Object} options 可选参数
 * @param {Number} options.order 工作表索引；默认值为当前工作表索引
 * @param {Function} options.success 操作结束的回调函数
 */
export function hideRow(startIndex, endIndex, options = {}) {
  hideRowOrColumn("row", startIndex, endIndex, options);
}

/**
 * 显示行
 * @param {Number} startIndex 起始行
 * @param {Number} endIndex 结束行
 * @param {Object} options 可选参数
 * @param {Number} options.order 工作表索引；默认值为当前工作表索引
 * @param {Function} options.success 操作结束的回调函数
 */
export function showRow(startIndex, endIndex, options = {}) {
  showRowOrColumn("row", startIndex, endIndex, options);
}

/**
 * 隐藏列
 * @param {Number} startIndex 起始列
 * @param {Number} endIndex 结束列
 * @param {Object} options 可选参数
 * @param {Number} options.order 工作表索引；默认值为当前工作表索引
 * @param {Function} options.success 操作结束的回调函数
 */
export function hideColumn(startIndex, endIndex, options = {}) {
  hideRowOrColumn("column", startIndex, endIndex, options);
}

/**
 * 显示列
 * @param {Number} startIndex 起始列
 * @param {Number} endIndex 结束列
 * @param {Object} options 可选参数
 * @param {Number} options.order 工作表索引；默认值为当前工作表索引
 * @param {Function} options.success 操作结束的回调函数
 */
export function showColumn(startIndex, endIndex, options = {}) {
  showRowOrColumn("column", startIndex, endIndex, options);
}

/**
 * 设置指定行的高度。优先级最高，高于默认行高和用户自定义行高。
 * @param {Object} rowInfo 行数和高度对应关系
 * @param {Object} options 可选参数
 * @param {Number} options.order 工作表索引；默认值为当前工作表索引
 * @param {Function} options.success 操作结束的回调函数
 */
export function setRowHeight(rowInfo, options = {}) {
  if (getObjType(rowInfo) != "object") {
    return tooltip.info("The rowInfo parameter is invalid.", "");
  }

  let { order = getSheetIndex(Store.currentSheetIndex), success } = {
    ...options,
  };

  let file = Store.MBLsheetfile[order];

  if (file == null) {
    return tooltip.info("The order parameter is invalid.", "");
  }

  let cfg = $.extend(true, {}, file.config);
  if (cfg["rowlen"] == null) {
    cfg["rowlen"] = {};
  }

  for (let r in rowInfo) {
    if (parseInt(r) >= 0) {
      let len = rowInfo[r];

      if (len === "auto") {
        cfg["rowlen"][parseInt(r)] = len;
      } else {
        if (Number(len) >= 0) {
          cfg["rowlen"][parseInt(r)] = Number(len);
        }
      }
    }
  }

  file.config = cfg;

  server.saveParam("cg", file.index, cfg["rowlen"], { k: "rowlen" });

  if (file.index == Store.currentSheetIndex) {
    Store.config = cfg;
    jfrefreshgrid_rhcw(Store.flowdata.length, Store.flowdata[0].length);
  }

  if (success && typeof success === "function") {
    success();
  }
}

/**
 * 设置指定列的宽度
 * @param {Object} columnInfo 行数和高度对应关系
 * @param {Object} options 可选参数
 * @param {Number} options.order 工作表索引；默认值为当前工作表索引
 * @param {Function} options.success 操作结束的回调函数
 */
export function setColumnWidth(columnInfo, options = {}) {
  if (getObjType(columnInfo) != "object") {
    return tooltip.info("The columnInfo parameter is invalid.", "");
  }

  let { order = getSheetIndex(Store.currentSheetIndex), success } = {
    ...options,
  };

  let file = Store.MBLsheetfile[order];

  if (file == null) {
    return tooltip.info("The order parameter is invalid.", "");
  }

  let cfg = $.extend(true, {}, file.config);
  if (cfg["columnlen"] == null) {
    cfg["columnlen"] = {};
  }

  for (let c in columnInfo) {
    if (parseInt(c) >= 0) {
      let len = columnInfo[c];

      if (len === "auto") {
        cfg["columnlen"][parseInt(c)] = len;
      } else {
        if (Number(len) >= 0) {
          cfg["columnlen"][parseInt(c)] = Number(len);
        }
      }
    }
  }

  file.config = cfg;

  server.saveParam("cg", file.index, cfg["columnlen"], { k: "columnlen" });

  if (file.index == Store.currentSheetIndex) {
    Store.config = cfg;
    jfrefreshgrid_rhcw(Store.flowdata.length, Store.flowdata[0].length);
  }

  if (success && typeof success === "function") {
    success();
  }
}

/**
 * 获取指定工作表指定行的高度，得到行号和高度对应关系的对象
 * @param {Array} rowInfo 行号下标组成的数组；行号下标从0开始；
 * @param {Object} options 可选参数
 * @param {Number} options.order 工作表索引；默认值为当前工作表索引
 * @param {Function} options.success 操作结束的回调函数
 */
export function getRowHeight(rowInfo, options = {}) {
  if (getObjType(rowInfo) != "array" || rowInfo.length == 0) {
    return tooltip.info("The rowInfo parameter is invalid.", "");
  }

  let { order = getSheetIndex(Store.currentSheetIndex), success } = {
    ...options,
  };

  let file = Store.MBLsheetfile[order];

  if (file == null) {
    return tooltip.info("The order parameter is invalid.", "");
  }

  let cfg = $.extend(true, {}, file.config);
  let rowlen = cfg["rowlen"] || {};

  let rowlenObj = {};

  rowInfo.forEach((item) => {
    if (parseInt(item) >= 0) {
      let size = rowlen[parseInt(item)] || Store.defaultrowlen;
      rowlenObj[parseInt(item)] = size;
    }
  });

  setTimeout(() => {
    if (success && typeof success === "function") {
      success();
    }
  }, 1);

  return rowlenObj;
}

/**
 * 获取指定工作表指定列的宽度，得到列号和宽度对应关系的对象
 * @param {Array} columnInfo 行号下标组成的数组；行号下标从0开始；
 * @param {Object} options 可选参数
 * @param {Number} options.order 工作表索引；默认值为当前工作表索引
 * @param {Function} options.success 操作结束的回调函数
 */
export function getColumnWidth(columnInfo, options = {}) {
  if (getObjType(columnInfo) != "array" || columnInfo.length == 0) {
    return tooltip.info("The columnInfo parameter is invalid.", "");
  }

  let { order = getSheetIndex(Store.currentSheetIndex), success } = {
    ...options,
  };

  let file = Store.MBLsheetfile[order];

  if (file == null) {
    return tooltip.info("The order parameter is invalid.", "");
  }

  let cfg = $.extend(true, {}, file.config);
  let columnlen = cfg["columnlen"] || {};

  let columnlenObj = {};

  columnInfo.forEach((item) => {
    if (parseInt(item) >= 0) {
      let size = columnlen[parseInt(item)] || Store.defaultcollen;
      columnlenObj[parseInt(item)] = size;
    }
  });

  setTimeout(() => {
    if (success && typeof success === "function") {
      success();
    }
  }, 1);

  return columnlenObj;
}

/**
 * 获取工作表的默认行高
 * @param {Object} options 可选参数
 * @param {Number} options.order 工作表索引；默认值为当前工作表索引
 * @param {Function} options.success 操作结束的回调函数
 */
export function getDefaultRowHeight(options = {}) {
  let { order = getSheetIndex(Store.currentSheetIndex), success } = {
    ...options,
  };

  setTimeout(() => {
    if (success && typeof success === "function") {
      success();
    }
  }, 1);

  // *返回指定的工作表默认行高，如果未配置就返回全局的默认行高
  return Store.MBLsheetfile[order].defaultRowHeight || Store.defaultrowlen;
}

/**
 * 获取工作表的默认列宽
 * @param {Object} options 可选参数
 * @param {Number} options.order 工作表索引；默认值为当前工作表索引
 * @param {Function} options.success 操作结束的回调函数
 */
export function getDefaultColWidth(options = {}) {
  let { order = getSheetIndex(Store.currentSheetIndex), success } = {
    ...options,
  };

  setTimeout(() => {
    if (success && typeof success === "function") {
      success();
    }
  }, 1);

  // *返回指定的工作表默认列宽，如果未配置就返回全局的默认列宽
  return Store.MBLsheetfile[order].defaultColWidth || Store.defaultcollen;
}

/**
 * 返回当前选区对象的数组，可能存在多个选区。
 * 每个选区的格式为row/column信息组成的对象{row:[0,1],column:[0,1]}
 * @returns {Array}
 */
export function getRange() {
  let rangeArr = JSON.parse(JSON.stringify(Store.MBLsheet_select_save));

  let result = [];

  for (let i = 0; i < rangeArr.length; i++) {
    let rangeItem = rangeArr[i];
    let temp = {
      row: rangeItem.row,
      column: rangeItem.column,
    };
    result.push(temp);
  }

  return result;
}

/**
 * 返回表示指定区域内所有单元格位置的数组，区别getRange方法，该方法以cell单元格(而非某块连续的区域)为单位来组织选区的数据
 * @param   {Array}   range 可选参数，默认为当前选中区域
 * @returns {Array}   对象数组
 */
export function getRangeWithFlatten(range) {
  range = range || getRange();

  let result = [];

  range.forEach((ele) => {
    // 这个data可能是个范围或者是单个cell
    let rs = ele.row;
    let cs = ele.column;
    for (let r = rs[0]; r <= rs[1]; r++) {
      for (let c = cs[0]; c <= cs[1]; c++) {
        // r c 当前的r和当前的c
        result.push({ r, c });
      }
    }
  });
  return result;
}

/**
 * 返回表示指定区域内所有单元格内容的对象数组
 * @param   {Array}   range 可选参数，默认为当前选中区域扁平化后的对象，结构形如[{r:0,c:0},{r:0,c:1}...]
 * @returns {Array}   对象数组
 */
export function getRangeValuesWithFlatte(range) {
  range = range || getRangeWithFlatten();

  let values = [];

  // 获取到的这个数据不是最新的数据
  range.forEach((item) => {
    values.push(Store.flowdata[item.r][item.c]);
  });
  return values;
}

/**
 * 返回对应当前选区的坐标字符串数组，可能存在多个选区。
 * 每个选区可能是单个单元格(如 A1)或多个单元格组成的矩形区域(如 D9:E12)
 * @returns {Array}
 */
export function getRangeAxis() {
  let result = [];
  let rangeArr = JSON.parse(JSON.stringify(Store.MBLsheet_select_save));
  let sheetIndex = Store.currentSheetIndex;

  rangeArr.forEach((ele) => {
    let axisText = getRangetxt(sheetIndex, {
      column: ele.column,
      row: ele.row,
    });
    result.push(axisText);
  });

  return result;
}

/**
 * 返回指定工作表指定范围的单元格二维数组数据，每个单元格为一个对象
 * @param {Object} options 可选参数
 * @param {Object | String} options.range 选区范围,支持选区的格式为"A1:B2"、"sheetName!A1:B2"或者{row:[0,1],column:[0,1]}，只能为单个选区；默认为当前选区
 * @param {Number} options.order 工作表索引；默认值为当前工作表索引
 */
export function getRangeValue(options = {}) {
  let curOrder = getSheetIndex(Store.currentSheetIndex);
  let { range, order = curOrder } = { ...options };

  let file = Store.MBLsheetfile[order];

  if (!range || typeof range === "object") {
    return getdatabyselection(range, file.index);
  } else if (typeof range === "string") {
    if (formula.iscelldata(range)) {
      return getdatabyselection(formula.getcellrange(range), file.index);
    } else {
      tooltip.info("The range is invalid, please check range parameter.", "");
    }
  }
}

/**
 * 复制指定工作表指定单元格区域的数据，返回包含`<table>`html格式的数据，可用于粘贴到excel中保持单元格样式。
 * @param {Object} options 可选参数
 * @param {Array | Object | String} options.range 选区范围
 * @param {order} options.order 工作表下标
 */
export function getRangeHtml(options = {}) {
  let {
    range = Store.MBLsheet_select_save,
    order = getSheetIndex(Store.currentSheetIndex),
    success,
  } = { ...options };
  range = JSON.parse(JSON.stringify(range));

  if (getObjType(range) == "string") {
    if (!formula.iscelldata(range)) {
      return tooltip.info("The range parameter is invalid.", "");
    }

    let cellrange = formula.getcellrange(range);
    range = [
      {
        row: cellrange.row,
        column: cellrange.column,
      },
    ];
  } else if (getObjType(range) == "object") {
    if (range.row == null || range.column == null) {
      return tooltip.info("The range parameter is invalid.", "");
    }

    range = [
      {
        row: range.row,
        column: range.column,
      },
    ];
  }

  if (getObjType(range) != "array") {
    return tooltip.info("The range parameter is invalid.", "");
  }

  let file = Store.MBLsheetfile[order];

  if (file == null) {
    return tooltip.info("The order parameter is invalid.", "");
  }

  //复制范围内包含部分合并单元格，提示
  let cfg = $.extend(true, {}, file.config);
  if (cfg["merge"] != null) {
    let has_PartMC = false;

    for (let s = 0; s < range.length; s++) {
      let r1 = range[s].row[0],
        r2 = range[s].row[1];
      let c1 = range[s].column[0],
        c2 = range[s].column[1];

      has_PartMC = hasPartMC(cfg, r1, r2, c1, c2);

      if (has_PartMC) {
        break;
      }
    }

    if (has_PartMC) {
      return tooltip.info(
        "Cannot perform this operation on partially merged cells",
        ""
      );
    }
  }

  //多重选区 有条件格式时 提示
  let cdformat = $.extend(true, [], file.MBLsheet_conditionformat_save);
  if (range.length > 1 && cdformat.length > 0) {
    let hasCF = false;
    let cf_compute = conditionformat.getComputeMap(file.index);

    for (let s = 0; s < range.length; s++) {
      let r1 = range[s].row[0],
        r2 = range[s].row[1];
      let c1 = range[s].column[0],
        c2 = range[s].column[1];

      for (let r = r1; r <= r2; r++) {
        for (let c = c1; c <= c2; c++) {
          if (conditionformat.checksCF(r, c, cf_compute) != null) {
            hasCF = true;
            break;
          }
        }

        if (hasCF) {
          break;
        }
      }

      if (hasCF) {
        break;
      }
    }

    if (hasCF) {
      return tooltip.info(
        "Cannot perform this operation on multiple selection areas, please select a single area",
        ""
      );
    }
  }

  //多重选区 行不一样且列不一样时 提示
  if (range.length > 1) {
    let isSameRow = true,
      str_r = range[0].row[0],
      end_r = range[0].row[1];
    let isSameCol = true,
      str_c = range[0].column[0],
      end_c = range[0].column[1];

    for (let s = 1; s < range.length; s++) {
      if (range[s].row[0] != str_r || range[s].row[1] != end_r) {
        isSameRow = false;
      }

      if (range[s].column[0] != str_c || range[s].column[1] != end_c) {
        isSameCol = false;
      }
    }

    if ((!isSameRow && !isSameCol) || selectIsOverlap(range)) {
      return tooltip.info(
        "Cannot perform this operation on multiple selection areas, please select a single area",
        ""
      );
    }
  }

  let rowIndexArr = [],
    colIndexArr = [];

  for (let s = 0; s < range.length; s++) {
    let r1 = range[s].row[0],
      r2 = range[s].row[1];
    let c1 = range[s].column[0],
      c2 = range[s].column[1];

    for (let r = r1; r <= r2; r++) {
      if (cfg["rowhidden"] != null && cfg["rowhidden"][r] != null) {
        continue;
      }

      if (!rowIndexArr.includes(r)) {
        rowIndexArr.push(r);
      }

      for (let c = c1; c <= c2; c++) {
        if (cfg["colhidden"] != null && cfg["colhidden"][c] != null) {
          continue;
        }

        if (!colIndexArr.includes(c)) {
          colIndexArr.push(c);
        }
      }
    }
  }

  let borderInfoCompute;
  if (cfg["borderInfo"] && cfg["borderInfo"].length > 0) {
    //边框
    borderInfoCompute = getBorderInfoCompute(file.index);
  }

  let d = file.data;
  if (d == null || d.length == 0) {
    d = sheetmanage.buildGridData(file);
  }

  let cpdata = "";
  let colgroup = "";

  rowIndexArr = rowIndexArr.sort((a, b) => a - b);
  colIndexArr = colIndexArr.sort((a, b) => a - b);

  for (let i = 0; i < rowIndexArr.length; i++) {
    let r = rowIndexArr[i];

    if (cfg["rowhidden"] != null && cfg["rowhidden"][r] != null) {
      continue;
    }

    cpdata += "<tr>";

    for (let j = 0; j < colIndexArr.length; j++) {
      let c = colIndexArr[j];

      if (cfg["colhidden"] != null && cfg["colhidden"][c] != null) {
        continue;
      }

      let column = '<td ${span} style="${style}">';

      if (d[r] != null && d[r][c] != null) {
        let style = "",
          span = "";

        if (r == rowIndexArr[0]) {
          if (
            cfg["columnlen"] == null ||
            cfg["columnlen"][c.toString()] == null
          ) {
            colgroup += '<colgroup width="72px"></colgroup>';
          } else {
            colgroup +=
              '<colgroup width="' +
              cfg["columnlen"][c.toString()] +
              'px"></colgroup>';
          }
        }

        if (c == colIndexArr[0]) {
          if (cfg["rowlen"] == null || cfg["rowlen"][r.toString()] == null) {
            style += "height:19px;";
          } else {
            style += "height:" + cfg["rowlen"][r.toString()] + "px;";
          }
        }

        let reg = /^(w|W)((0?)|(0\.0+))$/;
        let c_value;
        if (
          d[r][c].ct != null &&
          d[r][c].ct.fa != null &&
          d[r][c].ct.fa.match(reg)
        ) {
          c_value = getcellvalue(r, c, d);
        } else {
          c_value = getcellvalue(r, c, d, "m");
        }

        style += menuButton.getStyleByCell(d, r, c);

        if (getObjType(d[r][c]) == "object" && "mc" in d[r][c]) {
          if ("rs" in d[r][c]["mc"]) {
            span =
              'rowspan="' +
              d[r][c]["mc"].rs +
              '" colspan="' +
              d[r][c]["mc"].cs +
              '"';

            //边框
            if (borderInfoCompute && borderInfoCompute[r + "_" + c]) {
              let bl_obj = { color: {}, style: {} },
                br_obj = { color: {}, style: {} },
                bt_obj = { color: {}, style: {} },
                bb_obj = { color: {}, style: {} };

              for (let bd_r = r; bd_r < r + d[r][c]["mc"].rs; bd_r++) {
                for (let bd_c = c; bd_c < c + d[r][c]["mc"].cs; bd_c++) {
                  if (
                    bd_r == r &&
                    borderInfoCompute[bd_r + "_" + bd_c] &&
                    borderInfoCompute[bd_r + "_" + bd_c].t
                  ) {
                    let linetype = borderInfoCompute[bd_r + "_" + bd_c].t.style;
                    let bcolor = borderInfoCompute[bd_r + "_" + bd_c].t.color;

                    if (bt_obj["style"][linetype] == null) {
                      bt_obj["style"][linetype] = 1;
                    } else {
                      bt_obj["style"][linetype] = bt_obj["style"][linetype] + 1;
                    }

                    if (bt_obj["color"][bcolor] == null) {
                      bt_obj["color"][bcolor] = 1;
                    } else {
                      bt_obj["color"][bcolor] = bt_obj["color"][bcolor] + 1;
                    }
                  }

                  if (
                    bd_r == r + d[r][c]["mc"].rs - 1 &&
                    borderInfoCompute[bd_r + "_" + bd_c] &&
                    borderInfoCompute[bd_r + "_" + bd_c].b
                  ) {
                    let linetype = borderInfoCompute[bd_r + "_" + bd_c].b.style;
                    let bcolor = borderInfoCompute[bd_r + "_" + bd_c].b.color;

                    if (bb_obj["style"][linetype] == null) {
                      bb_obj["style"][linetype] = 1;
                    } else {
                      bb_obj["style"][linetype] = bb_obj["style"][linetype] + 1;
                    }

                    if (bb_obj["color"][bcolor] == null) {
                      bb_obj["color"][bcolor] = 1;
                    } else {
                      bb_obj["color"][bcolor] = bb_obj["color"][bcolor] + 1;
                    }
                  }

                  if (
                    bd_c == c &&
                    borderInfoCompute[bd_r + "_" + bd_c] &&
                    borderInfoCompute[bd_r + "_" + bd_c].l
                  ) {
                    let linetype = borderInfoCompute[r + "_" + c].l.style;
                    let bcolor = borderInfoCompute[bd_r + "_" + bd_c].l.color;

                    if (bl_obj["style"][linetype] == null) {
                      bl_obj["style"][linetype] = 1;
                    } else {
                      bl_obj["style"][linetype] = bl_obj["style"][linetype] + 1;
                    }

                    if (bl_obj["color"][bcolor] == null) {
                      bl_obj["color"][bcolor] = 1;
                    } else {
                      bl_obj["color"][bcolor] = bl_obj["color"][bcolor] + 1;
                    }
                  }

                  if (
                    bd_c == c + d[r][c]["mc"].cs - 1 &&
                    borderInfoCompute[bd_r + "_" + bd_c] &&
                    borderInfoCompute[bd_r + "_" + bd_c].r
                  ) {
                    let linetype = borderInfoCompute[bd_r + "_" + bd_c].r.style;
                    let bcolor = borderInfoCompute[bd_r + "_" + bd_c].r.color;

                    if (br_obj["style"][linetype] == null) {
                      br_obj["style"][linetype] = 1;
                    } else {
                      br_obj["style"][linetype] = br_obj["style"][linetype] + 1;
                    }

                    if (br_obj["color"][bcolor] == null) {
                      br_obj["color"][bcolor] = 1;
                    } else {
                      br_obj["color"][bcolor] = br_obj["color"][bcolor] + 1;
                    }
                  }
                }
              }

              let rowlen = d[r][c]["mc"].rs,
                collen = d[r][c]["mc"].cs;

              if (JSON.stringify(bl_obj).length > 23) {
                let bl_color = null,
                  bl_style = null;

                for (let x in bl_obj.color) {
                  if (bl_obj.color[x] >= rowlen / 2) {
                    bl_color = x;
                  }
                }

                for (let x in bl_obj.style) {
                  if (bl_obj.style[x] >= rowlen / 2) {
                    bl_style = x;
                  }
                }

                if (bl_color != null && bl_style != null) {
                  style +=
                    "border-left:" +
                    selection.getHtmlBorderStyle(bl_style, bl_color);
                }
              }

              if (JSON.stringify(br_obj).length > 23) {
                let br_color = null,
                  br_style = null;

                for (let x in br_obj.color) {
                  if (br_obj.color[x] >= rowlen / 2) {
                    br_color = x;
                  }
                }

                for (let x in br_obj.style) {
                  if (br_obj.style[x] >= rowlen / 2) {
                    br_style = x;
                  }
                }

                if (br_color != null && br_style != null) {
                  style +=
                    "border-right:" +
                    selection.getHtmlBorderStyle(br_style, br_color);
                }
              }

              if (JSON.stringify(bt_obj).length > 23) {
                let bt_color = null,
                  bt_style = null;

                for (let x in bt_obj.color) {
                  if (bt_obj.color[x] >= collen / 2) {
                    bt_color = x;
                  }
                }

                for (let x in bt_obj.style) {
                  if (bt_obj.style[x] >= collen / 2) {
                    bt_style = x;
                  }
                }

                if (bt_color != null && bt_style != null) {
                  style +=
                    "border-top:" +
                    selection.getHtmlBorderStyle(bt_style, bt_color);
                }
              }

              if (JSON.stringify(bb_obj).length > 23) {
                let bb_color = null,
                  bb_style = null;

                for (let x in bb_obj.color) {
                  if (bb_obj.color[x] >= collen / 2) {
                    bb_color = x;
                  }
                }

                for (let x in bb_obj.style) {
                  if (bb_obj.style[x] >= collen / 2) {
                    bb_style = x;
                  }
                }

                if (bb_color != null && bb_style != null) {
                  style +=
                    "border-bottom:" +
                    selection.getHtmlBorderStyle(bb_style, bb_color);
                }
              }
            }
          } else {
            continue;
          }
        } else {
          //边框
          if (borderInfoCompute && borderInfoCompute[r + "_" + c]) {
            //左边框
            if (borderInfoCompute[r + "_" + c].l) {
              let linetype = borderInfoCompute[r + "_" + c].l.style;
              let bcolor = borderInfoCompute[r + "_" + c].l.color;
              style +=
                "border-left:" + selection.getHtmlBorderStyle(linetype, bcolor);
            }

            //右边框
            if (borderInfoCompute[r + "_" + c].r) {
              let linetype = borderInfoCompute[r + "_" + c].r.style;
              let bcolor = borderInfoCompute[r + "_" + c].r.color;
              style +=
                "border-right:" +
                selection.getHtmlBorderStyle(linetype, bcolor);
            }

            //下边框
            if (borderInfoCompute[r + "_" + c].b) {
              let linetype = borderInfoCompute[r + "_" + c].b.style;
              let bcolor = borderInfoCompute[r + "_" + c].b.color;
              style +=
                "border-bottom:" +
                selection.getHtmlBorderStyle(linetype, bcolor);
            }

            //上边框
            if (borderInfoCompute[r + "_" + c].t) {
              let linetype = borderInfoCompute[r + "_" + c].t.style;
              let bcolor = borderInfoCompute[r + "_" + c].t.color;
              style +=
                "border-top:" + selection.getHtmlBorderStyle(linetype, bcolor);
            }
          }
        }

        column = replaceHtml(column, { style: style, span: span });

        if (c_value == null) {
          c_value = getcellvalue(r, c, d);
        }

        if (c_value == null) {
          c_value = " ";
        }

        column += c_value;
      } else {
        let style = "";

        //边框
        if (borderInfoCompute && borderInfoCompute[r + "_" + c]) {
          //左边框
          if (borderInfoCompute[r + "_" + c].l) {
            let linetype = borderInfoCompute[r + "_" + c].l.style;
            let bcolor = borderInfoCompute[r + "_" + c].l.color;
            style +=
              "border-left:" + selection.getHtmlBorderStyle(linetype, bcolor);
          }

          //右边框
          if (borderInfoCompute[r + "_" + c].r) {
            let linetype = borderInfoCompute[r + "_" + c].r.style;
            let bcolor = borderInfoCompute[r + "_" + c].r.color;
            style +=
              "border-right:" + selection.getHtmlBorderStyle(linetype, bcolor);
          }

          //下边框
          if (borderInfoCompute[r + "_" + c].b) {
            let linetype = borderInfoCompute[r + "_" + c].b.style;
            let bcolor = borderInfoCompute[r + "_" + c].b.color;
            style +=
              "border-bottom:" + selection.getHtmlBorderStyle(linetype, bcolor);
          }

          //上边框
          if (borderInfoCompute[r + "_" + c].t) {
            let linetype = borderInfoCompute[r + "_" + c].t.style;
            let bcolor = borderInfoCompute[r + "_" + c].t.color;
            style +=
              "border-top:" + selection.getHtmlBorderStyle(linetype, bcolor);
          }
        }

        column += "";

        if (r == rowIndexArr[0]) {
          if (
            cfg["columnlen"] == null ||
            cfg["columnlen"][c.toString()] == null
          ) {
            colgroup += '<colgroup width="72px"></colgroup>';
          } else {
            colgroup +=
              '<colgroup width="' +
              cfg["columnlen"][c.toString()] +
              'px"></colgroup>';
          }
        }

        if (c == colIndexArr[0]) {
          if (cfg["rowlen"] == null || cfg["rowlen"][r.toString()] == null) {
            style += "height:19px;";
          } else {
            style += "height:" + cfg["rowlen"][r.toString()] + "px;";
          }
        }

        column = replaceHtml(column, { style: style, span: "" });
        column += " ";
      }

      column += "</td>";
      cpdata += column;
    }

    cpdata += "</tr>";
  }

  cpdata =
    '<table data-type="MBLsheet_copy_action_table">' +
    colgroup +
    cpdata +
    "</table>";

  return cpdata;
}

/**
 * 复制指定工作表指定单元格区域的数据，返回一维、二维或者自定义行列数的二维数组的数据。只有在dimensional设置为custom的时候，才需要设置setting中的row和column
 * @param {String} dimensional 数组维度。可选值为：oneDimensional-一维数组；twoDimensional-二维数组； custom-自定义行列数的二维数组
 * @param {Object} options 可选参数
 * @param {Number} options.row dimensional为custom的时候设置，多维数组的行数
 * @param {Number} options.column dimensional为custom的时候设置，多维数组的列数
 * @param {Object | String} options.range 选区范围,支持选区的格式为"A1:B2"、"sheetName!A1:B2"或者{row:[0,1],column:[0,1]}，只能为单个选区；默认为当前选区
 * @param {Number} options.order 工作表索引；默认值为当前工作表索引
 */
export function getRangeArray(dimensional, options = {}) {
  let dimensionalValues = ["oneDimensional", "twoDimensional"];

  if (!dimensionalValues.includes(dimensional)) {
    return tooltip.info("The dimensional parameter is invalid.", "");
  }

  let {
    range = Store.MBLsheet_select_save[Store.MBLsheet_select_save.length - 1],
    order = getSheetIndex(Store.currentSheetIndex),
  } = { ...options };

  let file = Store.MBLsheetfile[order];

  if (file == null) {
    return tooltip.info("The order parameter is invalid.", "");
  }

  if (getObjType(range) == "string") {
    if (!formula.iscelldata(range)) {
      return tooltip.info("The range parameter is invalid.", "");
    }

    range = formula.getcellrange(range);
  }

  if (
    getObjType(range) != "object" ||
    range.row == null ||
    range.column == null
  ) {
    return tooltip.info("The range parameter is invalid.", "");
  }

  let r1 = range.row[0],
    r2 = range.row[1];
  let c1 = range.column[0],
    c2 = range.column[1];

  //复制范围内包含部分合并单元格，提示
  let cfg = $.extend(true, {}, file.config);
  if (cfg["merge"] != null) {
    let has_PartMC = hasPartMC(cfg, r1, r2, c1, c2);

    if (has_PartMC) {
      return tooltip.info(
        "Cannot perform this operation on partially merged cells",
        ""
      );
    }
  }

  let data = file.data;
  if (data == null || data.length == 0) {
    data = sheetmanage.buildGridData(file);
  }

  let dataArr = [];

  if (dimensional == "oneDimensional") {
    //一维数组
    for (let r = r1; r <= r2; r++) {
      for (let c = c1; c <= c2; c++) {
        let cell = data[r][c];

        if (cell == null || cell.v == null) {
          dataArr.push(null);
        } else {
          dataArr.push(cell.v);
        }
      }
    }
  } else if (dimensional == "twoDimensional") {
    for (let r = r1; r <= r2; r++) {
      let row = [];

      for (let c = c1; c <= c2; c++) {
        let cell = data[r][c];

        if (cell == null || cell.v == null) {
          row.push(null);
        } else {
          row.push(cell.v);
        }
      }

      dataArr.push(row);
    }
  }

  return dataArr;
}

/**
 * 复制指定工作表指定单元格区域的数据，返回json格式的数据
 * @param {Boolean} isFirstRowTitle 是否首行为标题
 * @param {Object} options 可选参数
 * @param {Object | String} options.range 选区范围,支持选区的格式为"A1:B2"、"sheetName!A1:B2"或者{row:[0,1],column:[0,1]}，只能为单个选区；默认为当前选区
 * @param {Number} options.order 工作表索引；默认值为当前工作表索引
 */
export function getRangeJson(isFirstRowTitle, options = {}) {
  let curRange = Store.MBLsheet_select_save[0];
  let curSheetOrder = getSheetIndex(Store.currentSheetIndex);
  let { range = curRange, order = curSheetOrder } = { ...options };
  let file = Store.MBLsheetfile[order];
  let config = file.config;

  if (range && typeof range === "string" && formula.iscelldata(range)) {
    range = formula.getcellrange(range);
  }

  if (!range || range.length > 1) {
    if (isEditMode()) {
      alert(locale_drag.noMulti);
    } else {
      tooltip.info(locale_drag.noMulti, "");
    }
    return;
  }

  //复制范围内包含部分合并单元格，提示
  if (config["merge"] != null) {
    let has_PartMC = false;
    let r1 = range.row[0],
      r2 = range.row[1],
      c1 = range.column[0],
      c2 = range.column[1];
    has_PartMC = hasPartMC(config, r1, r2, c1, c2);

    if (has_PartMC) {
      if (isEditMode()) {
        alert(locale().drag.noPartMerge);
      } else {
        tooltip.info(locale().drag.noPartMerge, "");
      }
      return;
    }
  }
  let getdata = getdatabyselection(range, file.index);
  let arr = [];
  if (getdata.length === 0) {
    return;
  }
  if (isFirstRowTitle) {
    if (getdata.length === 1) {
      let obj = {};
      for (let i = 0; i < getdata[0].length; i++) {
        obj[getcellvalue(0, i, getdata)] = "";
      }
      arr.push(obj);
    } else {
      for (let r = 1; r < getdata.length; r++) {
        let obj = {};
        for (let c = 0; c < getdata[0].length; c++) {
          if (getcellvalue(0, c, getdata) == undefined) {
            obj[""] = getcellvalue(r, c, getdata);
          } else {
            obj[getcellvalue(0, c, getdata)] = getcellvalue(r, c, getdata);
          }
        }
        arr.push(obj);
      }
    }
  } else {
    let st = range["column"][0];
    for (let r = 0; r < getdata.length; r++) {
      let obj = {};
      for (let c = 0; c < getdata[0].length; c++) {
        obj[chatatABC(c + st)] = getcellvalue(r, c, getdata);
      }
      arr.push(obj);
    }
  }
  // selection.copybyformat(new Event('click'), JSON.stringify(arr));
  return arr;
}

/**
 *
 * @param {String} type 对角线还是对角线偏移 "normal"-对角线  "anti"-反对角线
"offset"-对角线偏移
 * @param {Object} options 可选参数
 * @param {Number} options.column type为offset的时候设置，对角偏移的列数
 * @param {Object | String} options.range 选区范围,支持选区的格式为"A1:B2"、"sheetName!A1:B2"或者{row:[0,1],column:[0,1]}，只能为单个选区；默认为当前选区
 * @param {Number} options.order 工作表索引；默认值为当前工作表索引
 */
export function getRangeDiagonal(type, options = {}) {
  let typeValues = ["normal", "anti", "offset"];
  if (typeValues.indexOf(type) < 0) {
    return tooltip.info(
      "The type parameter must be included in ['normal', 'anti', 'offset']",
      ""
    );
  }

  let curSheetOrder = getSheetIndex(Store.currentSheetIndex);
  let curRange = JSON.parse(JSON.stringify(Store.MBLsheet_select_save));
  let { column = 1, range = curRange, order = curSheetOrder } = { ...options };

  let file = Store.MBLsheetfile[order];
  let config = file.config;

  if (range && typeof range === "string" && formula.iscelldata(range)) {
    range = formula.getcellrange(range);
  }

  if (!range || range.length > 1) {
    if (isEditMode()) {
      alert(locale().drag.noMulti);
    } else {
      tooltip.info(locale().drag.noMulti, "");
    }
    return;
  }

  //复制范围内包含部分合并单元格，提示
  if (config["merge"] != null) {
    let has_PartMC = false;
    let r1 = range[0].row[0],
      r2 = range[0].row[1],
      c1 = range[0].column[0],
      c2 = range[0].column[1];
    has_PartMC = hasPartMC(config, r1, r2, c1, c2);

    if (has_PartMC) {
      if (isEditMode()) {
        alert(locale().drag.noPartMerge);
      } else {
        tooltip.info(locale().drag.noPartMerge, "");
      }
      return;
    }
  }
  let getdata = getdatabyselection(range, order);
  let arr = [];
  if (getdata.length === 0) {
    return;
  }

  let clen = getdata[0].length;
  switch (type) {
    case "normal":
      for (let r = 0; r < getdata.length; r++) {
        if (r >= clen) {
          break;
        }
        arr.push(getdata[r][r]);
      }
      break;
    case "anti":
      for (let r = 0; r < getdata.length; r++) {
        if (r >= clen) {
          break;
        }
        arr.push(getdata[r][clen - r - 1]);
      }
      break;
    case "offset":
      if (column.toString() == "NaN") {
        if (isEditMode()) {
          alert(locale().drag.inputCorrect);
        } else {
          tooltip.info(locale().drag.inputCorrect, "");
        }
        return;
      }

      if (column < 0) {
        if (isEditMode()) {
          alert(locale().drag.offsetColumnLessZero);
        } else {
          tooltip.info(locale().drag.offsetColumnLessZero, "");
        }
        return;
      }

      for (let r = 0; r < getdata.length; r++) {
        if (r + column >= clen) {
          break;
        }
        arr.push(getdata[r][r + column]);
      }
      break;
  }
  selection.copybyformat(new Event(), JSON.stringify(arr));
}

/**
 * 复制指定工作表指定单元格区域的数据，返回布尔值的数据
 * @param {Object} options 可选参数
 * @param {Object | String} options.range 选区范围,支持选区的格式为"A1:B2"、"sheetName!A1:B2"或者{row:[0,1],column:[0,1]}，只能为单个选区；默认为当前选区
 * @param {Number} options.order 工作表索引；默认值为当前工作表索引
 */
export function getRangeBoolean(options = {}) {
  let curSheetOrder = getSheetIndex(Store.currentSheetIndex);
  let curRange = JSON.parse(JSON.stringify(Store.MBLsheet_select_save));
  let { range = curRange, order = curSheetOrder } = { ...options };

  let file = Store.MBLsheetfile[order];
  let config = file.config;

  if (range && typeof range === "string" && formula.iscelldata(range)) {
    range = formula.getcellrange(range);
  }

  if (!range || range.length > 1) {
    if (isEditMode()) {
      alert(locale().drag.noMulti);
    } else {
      tooltip.info(locale().drag.noMulti, "");
    }
    return;
  }

  //复制范围内包含部分合并单元格，提示
  if (config["merge"] != null) {
    let has_PartMC = false;
    let r1 = range[0].row[0],
      r2 = range[0].row[1],
      c1 = range[0].column[0],
      c2 = range[0].column[1];
    has_PartMC = hasPartMC(config, r1, r2, c1, c2);

    if (has_PartMC) {
      if (isEditMode()) {
        alert(locale().drag.noPartMerge);
      } else {
        tooltip.info(locale().drag.noPartMerge, "");
      }
      return;
    }
  }
  let getdata = getdatabyselection(range, order);
  let arr = [];
  if (getdata.length === 0) {
    return;
  }
  for (let r = 0; r < getdata.length; r++) {
    let a = [];
    for (let c = 0; c < getdata[0].length; c++) {
      let bool = false;

      let v;
      if (getObjType(getdata[r][c]) == "object") {
        v = getdata[r][c].v;
      } else {
        v = getdata[r][c];
      }

      if (v == null || v == "") {
        bool = false;
      } else {
        v = parseInt(v);
        if (v == null || v > 0) {
          bool = true;
        } else {
          bool = false;
        }
      }
      a.push(bool);
    }
    arr.push(a);
  }

  selection.copybyformat(event, JSON.stringify(arr));
}

/**
 * 指定工作表选中一个或多个选区为选中状态并选择是否高亮，支持多种格式设置。
 * @param {Array | Object | String} range 选区范围
 * @param {Object} options 可选参数
 * @param {Boolean} options.show 是否显示高亮选中效果；默认值为 `true`
 * @param {Number} options.order 工作表下标；默认值为当前工作表下标
 * @param {Function} options.success 操作结束的回调函数
 */
export function setRangeShow(range, options = {}) {
  if (getObjType(range) == "string") {
    if (!formula.iscelldata(range)) {
      return tooltip.info("The range parameter is invalid.", "");
    }

    let cellrange = formula.getcellrange(range);
    range = [
      {
        row: cellrange.row,
        column: cellrange.column,
      },
    ];
  } else if (getObjType(range) == "object") {
    if (range.row == null || range.column == null) {
      return tooltip.info("The range parameter is invalid.", "");
    }

    range = [
      {
        row: range.row,
        column: range.column,
      },
    ];
  }

  if (getObjType(range) == "array") {
    for (let i = 0; i < range.length; i++) {
      if (getObjType(range[i]) === "string") {
        if (!formula.iscelldata(range[i])) {
          return tooltip.info("The range parameter is invalid.", "");
        }
        let cellrange = formula.getcellrange(range[i]);
        range[i] = {
          row: cellrange.row,
          column: cellrange.column,
        };
      } else if (getObjType(range) == "object") {
        if (range.row == null || range.column == null) {
          return tooltip.info("The range parameter is invalid.", "");
        }
        range = {
          row: range.row,
          column: range.column,
        };
      }
    }
  }

  if (getObjType(range) != "array") {
    return tooltip.info("The range parameter is invalid.", "");
  }

  let {
    show = true,
    order = getSheetIndex(Store.currentSheetIndex),
    success,
  } = { ...options };

  let file = Store.MBLsheetfile[order];

  if (file == null) {
    return tooltip.info("The order parameter is invalid.", "");
  }

  for (let i = 0; i < range.length; i++) {
    let changeparam = menuButton.mergeMoveMain(
      range[i].column,
      range[i].row,
      range[i]
    );
    if (changeparam) {
      range[i] = {
        row: changeparam[1],
        column: changeparam[0],
      };
    }
  }

  file.MBLsheet_select_save = range;

  if (file.index == Store.currentSheetIndex) {
    Store.MBLsheet_select_save = range;
    selectHightlightShow();

    if (!show) {
      $("#MBLsheet-cell-selected-boxs").hide();
      $("#MBLsheet-cell-selected-focus").hide();
      $("#MBLsheet-row-count-show").hide();
      $("#MBLsheet-column-count-show").hide();
      $("#MBLsheet-rows-h-selected").empty();
      $("#MBLsheet-cols-h-selected").empty();
    }
  }

  if (success && typeof success === "function") {
    success();
  }
}

/**
 * 将一个单元格数组数据赋值到指定的区域，数据格式同getRangeValue方法取到的数据。
 * @param {Array[Array]} data 要赋值的单元格二维数组数据，每个单元格的值，可以为字符串或数字，或为符合MBLsheet格式的对象
 * @param {Object} options 可选参数
 * @param {Object | String} options.range 选区范围,支持选区的格式为"A1:B2"、"sheetName!A1:B2"或者{row:[0,1],column:[0,1]}，只能为单个选区；默认为当前选区
 * @param {Boolean} options.isRefresh 是否刷新界面；默认为true
 * @param {Number} options.order 工作表索引；默认值为当前工作表索引
 * @param {Function} options.success 操作结束的回调函数
 */
export function setRangeValue(data, options = {}) {
  let curSheetOrder = getSheetIndex(Store.currentSheetIndex);
  let curRange =
    Store.MBLsheet_select_save[Store.MBLsheet_select_save.length - 1];
  let {
    range = curRange,
    isRefresh = true,
    order = curSheetOrder,
    success,
  } = { ...options };

  if (data == null) {
    return tooltip.info(
      "The data which will be set to range cannot be null.",
      ""
    );
  }

  if (range instanceof Array) {
    return tooltip.info("setRangeValue only supports a single selection.", "");
  }

  if (typeof range === "string" && formula.iscelldata(range)) {
    range = formula.getcellrange(range);
  }

  let rowCount = range.row[1] - range.row[0] + 1,
    columnCount = range.column[1] - range.column[0] + 1;

  if (data.length !== rowCount || data[0].length !== columnCount) {
    return tooltip.info("The data to be set does not match the selection.", "");
  }

  let file = Store.MBLsheetfile[order];

  if (file == null) {
    return tooltip.info("The order parameter is invalid.", "");
  }
  let sheetData = $.extend(true, [], file.data);

  for (let i = 0; i < rowCount; i++) {
    for (let j = 0; j < columnCount; j++) {
      let row = range.row[0] + i,
        column = range.column[0] + j;
      setCellValue(row, column, data[i][j], { order: order, isRefresh: false });
    }
  }

  let fileData = $.extend(true, [], file.data);
  file.data.length = 0;
  file.data.push(...sheetData);

  if (file.index == Store.currentSheetIndex) {
    jfrefreshgrid(
      fileData,
      [
        {
          row: range.row,
          column: range.column,
        },
      ],
      undefined,
      true,
      false
    );
  }

  if (isRefresh) {
    MBLsheetrefreshgrid();
  }

  if (success && typeof success === "function") {
    success();
  }
}

/**
 * 设置指定范围的单元格格式，一般用作处理格式，赋值操作推荐使用setRangeValue方法
 * @param {String} attr 要赋值的单元格二维数组数据，每个单元格的值，可以为字符串或数字，或为符合MBLsheet格式的对象
 * @param {Number | String | Object} value 具体的设置值
 * @param {Object} options 可选参数
 * @param {Object | String} options.range 设置参数的目标选区范围，支持选区的格式为"A1:B2"、"sheetName!A1:B2"或者{row:[0,1],column:[0,1]}，只能为单个选区；默认为当前选区
 * @param {Number} options.order 工作表索引；默认值为当前工作表索引
 */
export function setSingleRangeFormat(attr, value, options = {}) {
  let curSheetOrder = getSheetIndex(Store.currentSheetIndex);
  let curRange =
    Store.MBLsheet_select_save[Store.MBLsheet_select_save.length - 1];
  let { range = curRange, order = curSheetOrder } = { ...options };

  if (!attr) {
    tooltip.info("Arguments attr cannot be null or undefined.", "");
    return "error";
  }

  if (range instanceof Array) {
    tooltip.info("setRangeValue only supports a single selection.", "");
    return "error";
  }

  if (getObjType(range) == "string") {
    if (!formula.iscelldata(range)) {
      tooltip.info("The range parameter is invalid.", "");
      return "error";
    }

    range = formula.getcellrange(range);
  }

  if (
    getObjType(range) != "object" ||
    range.row == null ||
    range.column == null
  ) {
    tooltip.info("The range parameter is invalid.", "");
    return "error";
  }

  for (let r = range.row[0]; r <= range.row[1]; r++) {
    for (let c = range.column[0]; c <= range.column[1]; c++) {
      console.log("r", r);
      console.log("c", c);
      setCellValue(
        r,
        c,
        { [attr]: value },
        {
          order: order,
          isRefresh: false,
        }
      );
    }
  }
}

/**
 * 设置指定范围的单元格格式，一般用作处理格式。支持多选区设置
 * @param {String} attr 要赋值的单元格二维数组数据，每个单元格的值，可以为字符串或数字，或为符合MBLsheet格式的对象
 * @param {Number | String | Object} value 具体的设置值
 * @param {Object} options 可选参数
 * @param {Array | Object | String} options.range 设置参数的目标选区范围，支持选区的格式为"A1:B2"、"sheetName!A1:B2"或者{row:[0,1],column:[0,1]}，只能为单个选区；默认为当前选区
 * @param {Number} options.order 工作表索引；默认值为当前工作表索引
 * @param {Function} options.success 操作结束的回调函数
 */
export function setRangeFormat(attr, value, options = {}) {
  let curSheetOrder = getSheetIndex(Store.currentSheetIndex);
  let curRange = JSON.parse(JSON.stringify(Store.MBLsheet_select_save));
  let { range = curRange, order = curSheetOrder, success } = { ...options };

  if (getObjType(range) == "string") {
    if (!formula.iscelldata(range)) {
      return tooltip.info("The range parameter is invalid.", "");
    }

    let cellrange = formula.getcellrange(range);
    range = [
      {
        row: cellrange.row,
        column: cellrange.column,
      },
    ];
  } else if (getObjType(range) == "object") {
    if (range.row == null || range.column == null) {
      return tooltip.info("The range parameter is invalid.", "");
    }

    range = [
      {
        row: range.row,
        column: range.column,
      },
    ];
  }

  if (getObjType(range) != "array") {
    return tooltip.info("The range parameter is invalid.", "");
  }

  let file = Store.MBLsheetfile[order];

  let result = [];

  for (let i = 0; i < range.length; i++) {
    result.push(
      setSingleRangeFormat(attr, value, { range: range[i], order: order })
    );
  }

  let fileData = $.extend(true, [], file.data);
  if (result.some((i) => i === "error")) {
    file.data.length = 0;
    file.data.push(...fileData);
    return false;
  }

  file.data.length = 0;
  file.data.push(...fileData);

  if (file.index == Store.currentSheetIndex) {
    jfrefreshgrid(fileData, undefined, undefined, true, false);
  }

  MBLsheetrefreshgrid();

  if (success && typeof success === "function") {
  }
}

/**
 * 为指定索引的工作表，选定的范围开启或关闭筛选功能
 * @param {String} type 打开还是关闭筛选功能  open-打开筛选功能，返回当前筛选的范围对象；close-关闭筛选功能，返回关闭前筛选的范围对象
 * @param {Object} options 可选参数
 * @param {Object | String} options.range 选区范围
 * @param {Number} options.order 工作表下标；默认值为当前工作表下标
 * @param {Object} options.success 操作结束的回调函数
 */
export function setRangeFilter(type, options = {}) {
  let typeValues = ["open", "close"];

  if (!typeValues.includes(type)) {
    return tooltip.info("The type parameter is invalid.", "");
  }

  let {
    range = Store.MBLsheet_select_save[Store.MBLsheet_select_save.length - 1],
    order = getSheetIndex(Store.currentSheetIndex),
    success,
  } = { ...options };

  let file = Store.MBLsheetfile[order];

  if (file == null) {
    return tooltip.info("The order parameter is invalid.", "");
  }

  if (getObjType(range) == "string") {
    if (!formula.iscelldata(range)) {
      return tooltip.info("The range parameter is invalid.", "");
    }

    range = formula.getcellrange(range);
  }

  if (
    getObjType(range) != "object" ||
    range.row == null ||
    range.column == null
  ) {
    return tooltip.info("The range parameter is invalid.", "");
  }

  setTimeout(() => {
    if (success && typeof success === "function") {
      success();
    }
  }, 1);

  if (type == "open") {
    file.filter_select = range;

    if (file.index == Store.currentSheetIndex) {
      createFilterOptions(range, file.filter);
    }

    return {
      row: range.row,
      column: range.column,
    };
  } else if (type == "close") {
    let MBLsheet_filter_save = $.extend(true, {}, file.filter_select);

    file.filter_select = null;

    $("#MBLsheet-filter-selected-sheet" + file.index).remove();
    $("#MBLsheet-filter-options-sheet" + file.index).remove();

    return {
      row: MBLsheet_filter_save.row,
      column: MBLsheet_filter_save.column,
    };
  }
}

/**
 * 为指定索引的工作表，选定的范围设定合并单元格
 * @param {String} type 合并类型 all-全部合并  horizontal-水平合并  vertical-垂直合并
 * @param {Object} options 可选参数
 * @param {Object | String} options.range 选区范围
 * @param {Number} options.order 工作表索引；默认值为当前工作表索引
 * @param {Object} options.success 操作结束的回调函数
 */
export function setRangeMerge(type, options = {}) {
  let typeValues = ["all", "horizontal", "vertical"];
  if (typeValues.indexOf(type) < 0) {
    return tooltip.info(
      "The type parameter must be included in ['all', 'horizontal', 'vertical']",
      ""
    );
  }

  let curSheetOrder = getSheetIndex(Store.currentSheetIndex),
    curRange = JSON.parse(JSON.stringify(Store.MBLsheet_select_save));
  let { range = curRange, order = curSheetOrder, success } = { ...options };

  let file = Store.MBLsheetfile[order],
    cfg = $.extend(true, {}, file.config),
    data = $.extend(true, [], file.data);

  if (data.length == 0) {
    data = $.extend(true, [], sheetmanage.buildGridData(file));
  }

  if (getObjType(range) == "string") {
    if (!formula.iscelldata(range)) {
      return tooltip.info("Incorrect selection format", "");
    }

    let cellrange = formula.getcellrange(range);
    range = [
      {
        row: cellrange.row,
        column: cellrange.column,
      },
    ];
  } else if (getObjType(range) == "object") {
    if (!range.hasOwnProperty("row") || !range.hasOwnProperty("column")) {
      return tooltip.info("Incorrect selection format", "");
    }

    range = [
      {
        row: range.row,
        column: range.column,
      },
    ];
  }

  //不能合并重叠区域
  if (selectIsOverlap(range)) {
    return tooltip.info("Cannot merge overlapping range", "");
  }

  //选区是否含有 部分合并单元格
  if (cfg["merge"] != null) {
    let has_PartMC = false;

    for (let s = 0; s < range.length; s++) {
      let r1 = range[s].row[0],
        r2 = range[s].row[1];
      let c1 = range[s].column[0],
        c2 = range[s].column[1];

      has_PartMC = hasPartMC(cfg, r1, r2, c1, c2);

      if (has_PartMC) {
        break;
      }
    }

    if (has_PartMC) {
      return tooltip.info(
        "Cannot perform this operation on partially merged cells",
        ""
      );
    }
  } else {
    cfg.merge = {};
  }

  //选区是否含有 合并的单元格
  let isHasMc = false;

  for (let i = 0; i < range.length; i++) {
    let r1 = range[i].row[0],
      r2 = range[i].row[1];
    let c1 = range[i].column[0],
      c2 = range[i].column[1];

    for (let r = r1; r <= r2; r++) {
      for (let c = c1; c <= c2; c++) {
        let cell = data[r][c];

        if (getObjType(cell) == "object" && "mc" in cell) {
          isHasMc = true;
          break;
        }
      }

      if (isHasMc) {
        break;
      }
    }
  }

  if (isHasMc) {
    //选区有合并单元格（选区都执行 取消合并）
    cancelRangeMerge({
      range: range,
      order: order,
    });
  } else {
    for (let i = 0; i < range.length; i++) {
      let r1 = range[i].row[0],
        r2 = range[i].row[1];
      let c1 = range[i].column[0],
        c2 = range[i].column[1];

      if (r1 == r2 && c1 == c2) {
        continue;
      }

      if (type == "all") {
        let fv = {},
          isfirst = false;

        for (let r = r1; r <= r2; r++) {
          for (let c = c1; c <= c2; c++) {
            let cell = data[r][c];

            if (
              cell != null &&
              (!isRealNull(cell.v) || cell.f != null) &&
              !isfirst
            ) {
              fv = $.extend(true, {}, cell);
              isfirst = true;
            }

            data[r][c] = { mc: { r: r1, c: c1 } };
          }
        }

        data[r1][c1] = fv;
        data[r1][c1].mc = { r: r1, c: c1, rs: r2 - r1 + 1, cs: c2 - c1 + 1 };

        cfg["merge"][r1 + "_" + c1] = {
          r: r1,
          c: c1,
          rs: r2 - r1 + 1,
          cs: c2 - c1 + 1,
        };
      } else if (type == "vertical") {
        for (let c = c1; c <= c2; c++) {
          let fv = {},
            isfirst = false;

          for (let r = r1; r <= r2; r++) {
            let cell = data[r][c];

            if (
              cell != null &&
              (!isRealNull(cell.v) || cell.f != null) &&
              !isfirst
            ) {
              fv = $.extend(true, {}, cell);
              isfirst = true;
            }

            data[r][c] = { mc: { r: r1, c: c } };
          }

          data[r1][c] = fv;
          data[r1][c].mc = { r: r1, c: c, rs: r2 - r1 + 1, cs: 1 };

          cfg["merge"][r1 + "_" + c] = { r: r1, c: c, rs: r2 - r1 + 1, cs: 1 };
        }
      } else if (type == "horizontal") {
        for (let r = r1; r <= r2; r++) {
          let fv = {},
            isfirst = false;

          for (let c = c1; c <= c2; c++) {
            let cell = data[r][c];

            if (
              cell != null &&
              (!isRealNull(cell.v) || cell.f != null) &&
              !isfirst
            ) {
              fv = $.extend(true, {}, cell);
              isfirst = true;
            }

            data[r][c] = { mc: { r: r, c: c1 } };
          }

          data[r][c1] = fv;
          data[r][c1].mc = { r: r, c: c1, rs: 1, cs: c2 - c1 + 1 };

          cfg["merge"][r + "_" + c1] = { r: r, c: c1, rs: 1, cs: c2 - c1 + 1 };
        }
      }
    }

    if (order == curSheetOrder) {
      if (Store.clearjfundo) {
        Store.jfundo.length = 0;
        Store.jfredo.push({
          type: "mergeChange",
          sheetIndex: file.index,
          data: $.extend(true, [], file.data),
          curData: data,
          range: range,
          config: $.extend(true, {}, file.config),
          curConfig: cfg,
        });
      }

      Store.clearjfundo = false;
      jfrefreshgrid(data, range, { cfg: cfg });
      Store.clearjfundo = true;
    } else {
      file.data = data;
      file.config = cfg;
    }
  }

  if (success && typeof success === "function") {
    success();
  }
}

/**
 * 为指定索引的工作表，选定的范围取消合并单元格
 * @param {Object} options 可选参数
 * @param {Array | Object | String} options.range 选区范围
 * @param {Number} options.order 工作表索引；默认值为当前工作表索引
 * @param {Object} options.success 操作结束的回调函数
 */
export function cancelRangeMerge(options = {}) {
  let curRange = Store.MBLsheet_select_save,
    curSheetOrder = getSheetIndex(Store.currentSheetIndex);
  let { range = curRange, order = curSheetOrder, success } = { ...options };

  let file = Store.MBLsheetfile[order],
    cfg = $.extend(true, {}, file.config),
    data = $.extend(true, [], file.data);

  if (data.length == 0) {
    data = $.extend(true, [], sheetmanage.buildGridData(file));
  }

  if (getObjType(range) == "string") {
    if (!formula.iscelldata(range)) {
      return tooltip.info("Incorrect selection format", "");
    }

    let cellrange = formula.getcellrange(range);
    range = [
      {
        row: cellrange.row,
        column: cellrange.column,
      },
    ];
  } else if (getObjType(range) == "object") {
    if (!range.hasOwnProperty("row") || !range.hasOwnProperty("column")) {
      return tooltip.info("Incorrect selection format", "");
    }

    range = [
      {
        row: range.row,
        column: range.column,
      },
    ];
  }

  //不能合并重叠区域
  if (selectIsOverlap(range)) {
    return tooltip.info("Cannot merge overlapping range", "");
  }

  //选区是否含有 部分合并单元格
  if (cfg["merge"] != null) {
    let has_PartMC = false;

    for (let s = 0; s < range.length; s++) {
      let r1 = range[s].row[0],
        r2 = range[s].row[1];
      let c1 = range[s].column[0],
        c2 = range[s].column[1];

      has_PartMC = hasPartMC(cfg, r1, r2, c1, c2);

      if (has_PartMC) {
        break;
      }
    }

    if (has_PartMC) {
      return tooltip.info(
        "Cannot perform this operation on partially merged cells",
        ""
      );
    }
  }

  for (let i = 0; i < range.length; i++) {
    let r1 = range[i].row[0],
      r2 = range[i].row[1];
    let c1 = range[i].column[0],
      c2 = range[i].column[1];

    if (r1 == r2 && c1 == c2) {
      continue;
    }

    let fv = {};

    for (let r = r1; r <= r2; r++) {
      for (let c = c1; c <= c2; c++) {
        let cell = data[r][c];

        if (cell != null && cell.mc != null) {
          let mc_r = cell.mc.r,
            mc_c = cell.mc.c;

          if ("rs" in cell.mc) {
            delete cell.mc;
            delete cfg["merge"][mc_r + "_" + mc_c];

            fv[mc_r + "_" + mc_c] = $.extend(true, {}, cell);
          } else {
            // let cell_clone = fv[mc_r + "_" + mc_c];
            let cell_clone = JSON.parse(JSON.stringify(fv[mc_r + "_" + mc_c]));

            delete cell_clone.v;
            delete cell_clone.m;
            delete cell_clone.ct;
            delete cell_clone.f;
            delete cell_clone.spl;

            data[r][c] = cell_clone;
          }
        }
      }
    }
  }

  if (order == curSheetOrder) {
    if (Store.clearjfundo) {
      Store.jfundo.length = 0;
      Store.jfredo.push({
        type: "mergeChange",
        sheetIndex: file.index,
        data: $.extend(true, [], file.data),
        curData: data,
        range: range,
        config: $.extend(true, {}, file.config),
        curConfig: cfg,
      });
    }

    Store.clearjfundo = false;
    jfrefreshgrid(data, range, { cfg: cfg });
    Store.clearjfundo = true;
  } else {
    file.data = data;
    file.config = cfg;
  }
}

/**
 * 为指定索引的工作表，选定的范围开启排序功能，返回选定范围排序后的数据。
 * @param {String} type 排序类型 asc-升序 desc-降序
 * @param {Object} options 可选参数
 * @param {Object | String} options.range 选区范围,支持选区的格式为"A1:B2"、"sheetName!A1:B2"或者{row:[0,1],column:[0,1]}，只能为单个选区；默认为当前选区
 * @param {Number} options.order 工作表索引；默认值为当前工作表索引
 * @param {Function} options.success 操作结束的回调函数
 */
export function setRangeSort(type, options = {}) {
  let typeValues = ["asc", "desc"];
  if (typeValues.indexOf(type) < 0) {
    return tooltip.info(
      "The type parameter must be included in ['asc', 'desc'",
      ""
    );
  }

  let curSheetOrder = getSheetIndex(Store.currentSheetIndex),
    curRange = Store.MBLsheet_select_save[0];
  let { range = curRange, order = curSheetOrder, success } = { ...options };

  let file = Store.MBLsheetfile[order],
    cfg = $.extend(true, {}, file.config),
    fileData = $.extend(true, [], file.data);

  if (fileData.length == 0) {
    fileData = $.extend(true, [], sheetmanage.buildGridData(file));
  }

  if (range instanceof Array && range.length > 1) {
    tooltip.info(locale().sort.noRangeError, "");
    return;
  }

  if (range && typeof range === "string" && formula.iscelldata(range)) {
    range = formula.getcellrange(range);
  }

  let r1 = range.row[0],
    r2 = range.row[1],
    c1 = range.column[0],
    c2 = range.column[1];

  let hasMc = false; //Whether the sort selection has merged cells
  let data = [];
  for (let r = r1; r <= r2; r++) {
    let data_row = [];
    for (let c = c1; c <= c2; c++) {
      if (fileData[r][c] != null && fileData[r][c].mc != null) {
        hasMc = true;
        break;
      }
      data_row.push(fileData[r][c]);
    }
    data.push(data_row);
  }

  if (hasMc) {
    tooltip.info(locale().sort.mergeError, "");
    return;
  }

  data = orderbydata([].concat(data), 0, type === "asc");

  for (let r = r1; r <= r2; r++) {
    for (let c = c1; c <= c2; c++) {
      fileData[r][c] = data[r - r1][c - c1];
    }
  }

  let allParam = {};
  if (cfg["rowlen"] != null) {
    cfg = rowlenByRange(fileData, r1, r2, cfg);

    allParam = {
      cfg: cfg,
      RowlChange: true,
    };
  }

  if (file.index == Store.currentSheetIndex) {
    jfrefreshgrid(fileData, [{ row: [r1, r2], column: [c1, c2] }], allParam);
  } else {
    file.data = fileData;
    file.config = cfg;
  }

  if (success && typeof success === "function") {
    success();
  }
}

/**
 * 为指定索引的工作表，选定的范围开启多列自定义排序功能，返回选定范围排序后的数据。
 * @param {Boolean} hasTitle 数据是否具有标题行
 * @param {Array} sort 列设置，设置需要排序的列索引和排序方式，格式如：[{ i:0,sort:'asc' },{ i:1,sort:'des' }]
 * @param {Object} options 可选参数
 * @param {Object | String} options.range 选区范围,支持选区的格式为"A1:B2"、"sheetName!A1:B2"或者{row:[0,1],column:[0,1]}，只能为单个选区；默认为当前选区
 * @param {Number} options.order 工作表索引；默认值为当前工作表索引
 * @param {Function} options.success 操作结束的回调函数
 */
export function setRangeSortMulti(hasTitle, sort, options = {}) {
  if (!sort || !(sort instanceof Array)) {
    return tooltip.info("The sort parameter is invalid.", "");
  }

  let curSheetOrder = getSheetIndex(Store.currentSheetIndex),
    curRange = Store.MBLsheet_select_save[0];
  let { range = curRange, order = curSheetOrder, success } = { ...options };

  let file = Store.MBLsheetfile[order],
    cfg = $.extend(true, {}, file.config),
    fileData = $.extend(true, [], file.data);

  if (fileData.length == 0) {
    fileData = $.extend(true, [], sheetmanage.buildGridData(file));
  }

  if (range instanceof Array && range.length > 1) {
    tooltip.info(locale().sort.noRangeError, "");
    return;
  }

  if (range && typeof range === "string" && formula.iscelldata(range)) {
    range = formula.getcellrange(range);
  }

  let r1 = range.row[0],
    r2 = range.row[1],
    c1 = range.column[0],
    c2 = range.column[1];

  let str;
  if (hasTitle) {
    str = r1 + 1;
  } else {
    str = r1;
  }

  let hasMc = false; //Whether the sort selection has merged cells
  let data = [];
  for (let r = str; r <= r2; r++) {
    let data_row = [];
    for (let c = c1; c <= c2; c++) {
      if (fileData[r][c] != null && fileData[r][c].mc != null) {
        hasMc = true;
        break;
      }
      data_row.push(fileData[r][c]);
    }
    data.push(data_row);
  }

  if (hasMc) {
    tooltip.info(locale().sort.mergeError, "");
    return;
  }

  sort.forEach((sortItem) => {
    let i = sortItem.i;
    i -= c1;
    data = orderbydata([].concat(data), i, sortItem.sort === "asc");
  });

  for (let r = str; r <= r2; r++) {
    for (let c = c1; c <= c2; c++) {
      fileData[r][c] = data[r - str][c - c1];
    }
  }

  let allParam = {};
  if (cfg["rowlen"] != null) {
    cfg = rowlenByRange(fileData, str, r2, cfg);

    allParam = {
      cfg: cfg,
      RowlChange: true,
    };
  }

  if (file.index === Store.currentSheetIndex) {
    jfrefreshgrid(fileData, [{ row: [str, r2], column: [c1, c2] }], allParam);
  } else {
    file.data = fileData;
    file.config = cfg;
  }

  if (success && typeof success === "function") {
    success();
  }
}

/**
 *  为指定索引的工作表，选定的范围开启条件格式，根据设置的条件格式规则突出显示部分单元格，返回开启条件格式后的数据。
 * @param {String} conditionName 条件格式规则类型
 * @param {Object} conditionValue 可以设置条件单元格或者条件值
 * @param {Object} options 可选参数
 * @param {Object} options.format 颜色设置
 * @param {Array | Object | String} options.cellrange 选区范围
 * @param {Number} options.order 工作表索引；默认值为当前工作表索引
 * @param {Function} options.success 操作结束的回调函数
 */
export function setRangeConditionalFormatDefault(
  conditionName,
  conditionValue,
  options = {}
) {
  let conditionNameValues = [
    "greaterThan",
    "lessThan",
    "betweenness",
    "equal",
    "textContains",
    "occurrenceDate",
    "duplicateValue",
    "top10",
    "top10%",
    "last10",
    "last10%",
    "AboveAverage",
    "SubAverage",
  ];

  if (!conditionName || !conditionNameValues.includes(conditionName)) {
    return tooltip.info("The conditionName parameter is invalid.", "");
  }

  if (getObjType(conditionValue) != "array" || conditionValue.length == 0) {
    return tooltip.info("The conditionValue parameter is invalid.", "");
  }

  let {
    format = {
      textColor: "#000000",
      cellColor: "#ff0000",
    },
    cellrange = Store.MBLsheet_select_save,
    order = getSheetIndex(Store.currentSheetIndex),
    success,
  } = { ...options };

  cellrange = JSON.parse(JSON.stringify(cellrange));

  let file = Store.MBLsheetfile[order];
  let data = file.data;

  if (data == null || data.length == 0) {
    data = sheetmanage.buildGridData(file);
  }

  if (file == null) {
    return tooltip.info("Incorrect worksheet index", "");
  }

  const conditionformat_Text = locale().conditionformat;

  let conditionRange = [],
    conditionValue2 = [];

  if (conditionName == "betweenness") {
    let v1 = conditionValue[0];
    let v2 = conditionValue[1];

    //条件值是否是选区
    let rangeArr1 = conditionformat.getRangeByTxt(v1);
    if (rangeArr1.length > 1) {
      conditionformat.infoDialog(conditionformat_Text.onlySingleCell, "");
      return;
    } else if (rangeArr1.length == 1) {
      let r1 = rangeArr1[0].row[0],
        r2 = rangeArr1[0].row[1];
      let c1 = rangeArr1[0].column[0],
        c2 = rangeArr1[0].column[1];

      if (r1 == r2 && c1 == c2) {
        v1 = getcellvalue(r1, c1, data);

        conditionRange.push({
          row: rangeArr1[0].row,
          column: rangeArr1[0].column,
        });
        conditionValue2.push(v1);
      } else {
        conditionformat.infoDialog(conditionformat_Text.onlySingleCell, "");
        return;
      }
    } else if (rangeArr1.length == 0) {
      if (isNaN(v1) || v1 == "") {
        conditionformat.infoDialog(
          conditionformat_Text.conditionValueCanOnly,
          ""
        );
        return;
      } else {
        conditionValue2.push(v1);
      }
    }

    let rangeArr2 = conditionformat.getRangeByTxt(v2);
    if (rangeArr2.length > 1) {
      conditionformat.infoDialog(conditionformat_Text.onlySingleCell, "");
      return;
    } else if (rangeArr2.length == 1) {
      let r1 = rangeArr2[0].row[0],
        r2 = rangeArr2[0].row[1];
      let c1 = rangeArr2[0].column[0],
        c2 = rangeArr2[0].column[1];

      if (r1 == r2 && c1 == c2) {
        v2 = getcellvalue(r1, c1, data);

        conditionRange.push({
          row: rangeArr2[0].row,
          column: rangeArr2[0].column,
        });
        conditionValue2.push(v2);
      } else {
        conditionformat.infoDialog(conditionformat_Text.onlySingleCell, "");
        return;
      }
    } else if (rangeArr2.length == 0) {
      if (isNaN(v2) || v2 == "") {
        conditionformat.infoDialog(
          conditionformat_Text.conditionValueCanOnly,
          ""
        );
        return;
      } else {
        conditionValue2.push(v2);
      }
    }
  } else if (
    conditionName == "greaterThan" ||
    conditionName == "lessThan" ||
    conditionName == "equal"
  ) {
    let v = conditionValue[0];

    //条件值是否是选区
    let rangeArr = conditionformat.getRangeByTxt(v);
    if (rangeArr.length > 1) {
      conditionformat.infoDialog(conditionformat_Text.onlySingleCell, "");
      return;
    } else if (rangeArr.length == 1) {
      let r1 = rangeArr[0].row[0],
        r2 = rangeArr[0].row[1];
      let c1 = rangeArr[0].column[0],
        c2 = rangeArr[0].column[1];

      if (r1 == r2 && c1 == c2) {
        v = getcellvalue(r1, c1, data);

        conditionRange.push({
          row: rangeArr[0].row,
          column: rangeArr[0].column,
        });
        conditionValue2.push(v);
      } else {
        conditionformat.infoDialog(conditionformat_Text.onlySingleCell, "");
        return;
      }
    } else if (rangeArr.length == 0) {
      if (isNaN(v) || v == "") {
        conditionformat.infoDialog(
          conditionformat_Text.conditionValueCanOnly,
          ""
        );
        return;
      } else {
        conditionValue2.push(v);
      }
    }
  } else if (conditionName == "textContains") {
    let v = conditionValue[0];

    //条件值是否是选区
    let rangeArr = conditionformat.getRangeByTxt(v);
    if (rangeArr.length > 1) {
      conditionformat.infoDialog(conditionformat_Text.onlySingleCell, "");
      return;
    } else if (rangeArr.length == 1) {
      let r1 = rangeArr[0].row[0],
        r2 = rangeArr[0].row[1];
      let c1 = rangeArr[0].column[0],
        c2 = rangeArr[0].column[1];

      if (r1 == r2 && c1 == c2) {
        v = getcellvalue(r1, c1, data);

        conditionRange.push({
          row: rangeArr[0].row,
          column: rangeArr[0].column,
        });
        conditionValue2.push(v);
      } else {
        conditionformat.infoDialog(conditionformat_Text.onlySingleCell, "");
        return;
      }
    } else if (rangeArr.length == 0) {
      if (v == "") {
        conditionformat.infoDialog(
          conditionformat_Text.conditionValueCanOnly,
          ""
        );
        return;
      } else {
        conditionValue2.push(v);
      }
    }
  } else if (conditionName == "occurrenceDate") {
    let v1 = conditionValue[0];
    let v2 = conditionValue[1];

    if (!isdatetime(v1) || !isdatetime(v2)) {
      return tooltip.info("The conditionValue parameter is invalid.", "");
    }

    let v;
    if (diff(v1, v2) > 0) {
      v = dayjs(v2).format("YYYY/MM/DD") + "-" + dayjs(v1).format("YYYY/MM/DD");
    } else {
      v = dayjs(v1).format("YYYY/MM/DD") + "-" + dayjs(v2).format("YYYY/MM/DD");
    }

    conditionValue2.push(v);
  } else if (conditionName == "duplicateValue") {
    let v = conditionValue[0];

    if (v != "0" || v != "1") {
      return tooltip.info("The conditionValue parameter is invalid.", "");
    }

    conditionValue2.push(v);
  } else if (
    conditionName == "top10" ||
    conditionName == "top10%" ||
    conditionName == "last10" ||
    conditionName == "last10%"
  ) {
    let v = conditionValue[0];

    if (parseInt(v) != v || parseInt(v) < 1 || parseInt(v) > 1000) {
      conditionformat.infoDialog(conditionformat_Text.pleaseEnterInteger, "");
      return;
    }

    conditionValue2.push(parseInt(v));
  } else if (conditionName == "AboveAverage" || conditionName == "SubAverage") {
    conditionValue2.push(conditionName);
  }

  if (
    !format.hasOwnProperty("textColor") ||
    !format.hasOwnProperty("cellColor")
  ) {
    return tooltip.info("The format parameter is invalid.", "");
  }

  if (getObjType(cellrange) == "string") {
    cellrange = conditionformat.getRangeByTxt(cellrange);
  } else if (getObjType(cellrange) == "object") {
    cellrange = [cellrange];
  }

  if (getObjType(cellrange) != "array") {
    return tooltip.info("The cellrange parameter is invalid.", "");
  }

  let rule = {
    type: "default",
    cellrange: cellrange,
    format: format,
    conditionName: conditionName,
    conditionRange: conditionRange,
    conditionValue: conditionValue2,
  };

  //保存之前的规则
  let fileH = $.extend(true, [], Store.MBLsheetfile);
  let historyRules = conditionformat.getHistoryRules(fileH);

  //保存当前的规则
  let ruleArr = file["MBLsheet_conditionformat_save"] || [];
  ruleArr.push(rule);
  file["MBLsheet_conditionformat_save"] = ruleArr;

  let fileC = $.extend(true, [], Store.MBLsheetfile);
  let currentRules = conditionformat.getCurrentRules(fileC);

  //刷新一次表格
  conditionformat.ref(historyRules, currentRules);

  //发送给后台
  if (server.allowUpdate) {
    server.saveParam("all", file.index, ruleArr, {
      k: "MBLsheet_conditionformat_save",
    });
  }

  if (success && typeof success === "function") {
    success();
  }
}

/**
 * 为指定索引的工作表，选定的范围开启条件格式，返回开启条件格式后的数据。
 * @param {String} type 条件格式规则类型
 * @param {Object} options 可选参数
 * @param {Array | String} options.format 颜色设置
 * @param {Array | Object | String} options.cellrange 选区范围
 * @param {Number} options.order 工作表索引；默认值为当前工作表索引
 * @param {Function} options.success 操作结束的回调函数
 */
export function setRangeConditionalFormat(type, options = {}) {
  let typeValues = ["dataBar", "colorGradation", "icons"];

  if (!type || !typeValues.includes(type)) {
    return tooltip.info("The type parameter is invalid.", "");
  }

  let {
    format,
    cellrange = Store.MBLsheet_select_save,
    order = getSheetIndex(Store.currentSheetIndex),
    success,
  } = { ...options };

  cellrange = JSON.parse(JSON.stringify(cellrange));
  let file = Store.MBLsheetfile[order];

  if (file == null) {
    return tooltip.info("Incorrect worksheet index", "");
  }

  if (type == "dataBar") {
    if (format == null) {
      format = ["#638ec6", "#ffffff"];
    }

    if (
      getObjType(format) != "array" ||
      format.length < 1 ||
      format.length > 2
    ) {
      return tooltip.info("The format parameter is invalid.", "");
    }
  } else if (type == "colorGradation") {
    if (format == null) {
      format = [
        "rgb(99, 190, 123)",
        "rgb(255, 235, 132)",
        "rgb(248, 105, 107)",
      ];
    }

    if (
      getObjType(format) != "array" ||
      format.length < 2 ||
      format.length > 3
    ) {
      return tooltip.info("The format parameter is invalid.", "");
    }
  } else if (type == "icons") {
    if (format == null) {
      format = "threeWayArrowMultiColor";
    }

    let formatValues = [
      "threeWayArrowMultiColor",
      "threeTriangles",
      "fourWayArrowMultiColor",
      "fiveWayArrowMultiColor",
      "threeWayArrowGrayColor",
      "fourWayArrowGrayColor",
      "fiveWayArrowGrayColor",
      "threeColorTrafficLightRimless",
      "threeSigns",
      "greenRedBlackGradient",
      "threeColorTrafficLightBordered",
      "fourColorTrafficLight",
      "threeSymbolsCircled",
      "tricolorFlag",
      "threeSymbolsnoCircle",
      "threeStars",
      "fiveQuadrantDiagram",
      "fiveBoxes",
      "grade4",
      "grade5",
    ];

    if (getObjType(format) != "string" || !formatValues.includes(format)) {
      return tooltip.info("The format parameter is invalid.", "");
    }

    switch (format) {
      case "threeWayArrowMultiColor":
        format = {
          len: 3,
          leftMin: 0,
          top: 0,
        };
        break;
      case "threeTriangles":
        format = {
          len: 3,
          leftMin: 0,
          top: 1,
        };
        break;
      case "fourWayArrowMultiColor":
        format = {
          len: 4,
          leftMin: 0,
          top: 2,
        };
        break;
      case "fiveWayArrowMultiColor":
        format = {
          len: 5,
          leftMin: 0,
          top: 3,
        };
        break;
      case "threeWayArrowGrayColor":
        format = {
          len: 3,
          leftMin: 5,
          top: 0,
        };
        break;
      case "fourWayArrowGrayColor":
        format = {
          len: 4,
          leftMin: 5,
          top: 1,
        };
        break;
      case "fiveWayArrowGrayColor":
        format = {
          len: 5,
          leftMin: 5,
          top: 2,
        };
        break;
      case "threeColorTrafficLightRimless":
        format = {
          len: 3,
          leftMin: 0,
          top: 4,
        };
        break;
      case "threeSigns":
        format = {
          len: 3,
          leftMin: 0,
          top: 5,
        };
        break;
      case "greenRedBlackGradient":
        format = {
          len: 4,
          leftMin: 0,
          top: 6,
        };
        break;
      case "threeColorTrafficLightBordered":
        format = {
          len: 3,
          leftMin: 5,
          top: 4,
        };
        break;
      case "fourColorTrafficLight":
        format = {
          len: 4,
          leftMin: 5,
          top: 5,
        };
        break;
      case "threeSymbolsCircled":
        format = {
          len: 3,
          leftMin: 0,
          top: 7,
        };
        break;
      case "tricolorFlag":
        format = {
          len: 3,
          leftMin: 0,
          top: 8,
        };
        break;
      case "threeSymbolsnoCircle":
        format = {
          len: 3,
          leftMin: 5,
          top: 7,
        };
        break;
      case "threeStars":
        format = {
          len: 3,
          leftMin: 0,
          top: 9,
        };
        break;
      case "fiveQuadrantDiagram":
        format = {
          len: 5,
          leftMin: 0,
          top: 10,
        };
        break;
      case "fiveBoxes":
        format = {
          len: 5,
          leftMin: 0,
          top: 11,
        };
        break;
      case "grade4":
        format = {
          len: 4,
          leftMin: 5,
          top: 9,
        };
        break;
      case "grade5":
        format = {
          len: 5,
          leftMin: 5,
          top: 10,
        };
        break;
    }
  }

  if (getObjType(cellrange) == "string") {
    cellrange = conditionformat.getRangeByTxt(cellrange);
  } else if (getObjType(cellrange) == "object") {
    cellrange = [cellrange];
  }

  if (getObjType(cellrange) != "array") {
    return tooltip.info("The cellrange parameter is invalid.", "");
  }

  let rule = {
    type: type,
    cellrange: cellrange,
    format: format,
  };

  //保存之前的规则
  let fileH = $.extend(true, [], Store.MBLsheetfile);
  let historyRules = conditionformat.getHistoryRules(fileH);

  //保存当前的规则
  let ruleArr = file["MBLsheet_conditionformat_save"] || [];
  ruleArr.push(rule);
  file["MBLsheet_conditionformat_save"] = ruleArr;

  let fileC = $.extend(true, [], Store.MBLsheetfile);
  let currentRules = conditionformat.getCurrentRules(fileC);

  //刷新一次表格
  conditionformat.ref(historyRules, currentRules);

  //发送给后台
  if (server.allowUpdate) {
    server.saveParam("all", file.index, ruleArr, {
      k: "MBLsheet_conditionformat_save",
    });
  }

  if (success && typeof success === "function") {
    success();
  }
}

/**
 * 为指定下标的工作表，删除条件格式规则，返回被删除的条件格式规则
 * @param {Number} itemIndex 条件格式规则索引
 * @param {Object} options 可选参数
 * @param {Number} options.order 工作表下标；默认值为当前工作表下标
 * @param {Function} options.success 操作结束的回调函数
 */
export function deleteRangeConditionalFormat(itemIndex, options = {}) {
  if (!isRealNum(itemIndex)) {
    return tooltip.info("The itemIndex parameter is invalid.", "");
  }

  itemIndex = Number(itemIndex);

  let { order = getSheetIndex(Store.currentSheetIndex), success } = {
    ...options,
  };

  let file = Store.MBLsheetfile[order];

  if (file == null) {
    return tooltip.info("The order parameter is invalid.", "");
  }

  let cdformat = $.extend(true, [], file.MBLsheet_conditionformat_save);

  if (cdformat.length == 0) {
    return tooltip.info(
      "This worksheet has no conditional format to delete",
      ""
    );
  } else if (cdformat[itemIndex] == null) {
    return tooltip.info(
      "The conditional format of the index cannot be found",
      ""
    );
  }

  let cdformatItem = cdformat.splice(itemIndex, 1);

  //保存之前的规则
  let fileH = $.extend(true, [], Store.MBLsheetfile);
  let historyRules = conditionformat.getHistoryRules(fileH);

  //保存当前的规则
  file["MBLsheet_conditionformat_save"] = cdformat;

  let fileC = $.extend(true, [], Store.MBLsheetfile);
  let currentRules = conditionformat.getCurrentRules(fileC);

  //刷新一次表格
  conditionformat.ref(historyRules, currentRules);

  //发送给后台
  if (server.allowUpdate) {
    server.saveParam("all", file.index, ruleArr, {
      k: "MBLsheet_conditionformat_save",
    });
  }

  setTimeout(() => {
    if (success && typeof success === "function") {
      success();
    }
  }, 1);

  return cdformatItem;
}

/**
 * 清除指定工作表指定单元格区域的内容，不同于删除选区的功能，不需要设定单元格移动情况
 * @param {Object} options 可选参数
 * @param {Array | Object | String} options.range 要清除的选区范围
 * @param {Number} options.order 工作表下标；默认值为当前工作表下标
 * @param {Function} options.success 操作结束的回调函数
 */
export function clearRange(options = {}) {
  let {
    range = Store.MBLsheet_select_save,
    order = getSheetIndex(Store.currentSheetIndex),
    success,
  } = { ...options };

  range = JSON.parse(JSON.stringify(range));
  if (getObjType(range) == "string") {
    if (!formula.iscelldata(range)) {
      return tooltip.info("The range parameter is invalid.", "");
    }

    let cellrange = formula.getcellrange(range);
    range = [
      {
        row: cellrange.row,
        column: cellrange.column,
      },
    ];
  } else if (getObjType(range) == "object") {
    if (range.row == null || range.column == null) {
      return tooltip.info("The range parameter is invalid.", "");
    }

    range = [
      {
        row: range.row,
        column: range.column,
      },
    ];
  }

  if (getObjType(range) != "array") {
    return tooltip.info("The range parameter is invalid.", "");
  }

  let file = Store.MBLsheetfile[order];

  if (file == null) {
    return tooltip.info("The order parameter is invalid.", "");
  }

  let cfg = $.extend(true, {}, file.config);
  let has_PartMC = false;

  for (let s = 0; s < range.length; s++) {
    let r1 = range[s].row[0],
      r2 = range[s].row[1];
    let c1 = range[s].column[0],
      c2 = range[s].column[1];

    has_PartMC = hasPartMC(cfg, r1, r2, c1, c2);

    if (has_PartMC) {
      break;
    }
  }

  if (has_PartMC) {
    return tooltip.info(
      "Cannot perform this operation on partially merged cells",
      ""
    );
  }

  let d = $.extend(true, [], file.data);

  if (d.length == 0) {
    d = $.extend(true, [], sheetmanage.buildGridData(file));
  }

  for (let s = 0; s < range.length; s++) {
    let r1 = range[s].row[0],
      r2 = range[s].row[1];
    let c1 = range[s].column[0],
      c2 = range[s].column[1];

    for (let r = r1; r <= r2; r++) {
      for (let c = c1; c <= c2; c++) {
        let cell = d[r][c];

        if (getObjType(cell) == "object") {
          delete cell["m"];
          delete cell["v"];

          if (cell["f"] != null) {
            delete cell["f"];
            formula.delFunctionGroup(r, c, file.index);

            delete cell["spl"];
          }

          if (cell["ct"] != null && cell["ct"].t == "inlineStr") {
            delete cell["ct"];
          }
        } else {
          d[r][c] = null;
        }
      }
    }
  }

  if (file.index == Store.currentSheetIndex) {
    jfrefreshgrid(d, range);
  } else {
    file.data = d;
  }

  if (success && typeof success === "function") {
    success();
  }
}

/**
 * 删除指定工作表指定单元格区域，返回删除掉的数据，同时，指定是右侧单元格左移还是下方单元格上移
 * @param {String} move 删除后，单元格左移/上移
 * @param {Object} options 可选参数
 * @param {Object | String} options.range 要删除的选区范围
 * @param {Number} options.order 工作表下标；默认值为当前工作表下标
 * @param {Function} options.success 操作结束的回调函数
 */
export function deleteRange(move, options = {}) {
  let moveList = ["left", "up"];

  if (!moveList.includes(move)) {
    return tooltip.info("The move parameter is invalid.", "");
  }

  let {
    range = Store.MBLsheet_select_save[Store.MBLsheet_select_save.length - 1],
    order = getSheetIndex(Store.currentSheetIndex),
    success,
  } = { ...options };

  if (getObjType(range) == "string") {
    if (!formula.iscelldata(range)) {
      return tooltip.info("The range parameter is invalid.", "");
    }

    let cellrange = formula.getcellrange(range);
    range = {
      row: cellrange.row,
      column: cellrange.column,
    };
  }

  if (
    getObjType(range) != "object" ||
    range.row == null ||
    range.column == null
  ) {
    return tooltip.info("The range parameter is invalid.", "");
  }

  let file = Store.MBLsheetfile[order];

  if (file == null) {
    return tooltip.info("The order parameter is invalid.", "");
  }

  let str = range.row[0],
    edr = range.row[1],
    stc = range.column[0],
    edc = range.column[1];

  if (move == "left") {
    MBLsheetDeleteCell("moveLeft", str, edr, stc, edc, order);
  } else if (move == "up") {
    MBLsheetDeleteCell("moveUp", str, edr, stc, edc, order);
  }

  if (success && typeof success === "function") {
    success();
  }
}

/**
 * 指定工作表指定单元格区域的数据进行矩阵操作，返回操作成功后的结果数据
 * @param {String} type 矩阵操作的类型
 * @param {Object} options 可选参数
 * @param {Object | String} options.range 选区范围,支持选区的格式为"A1:B2"、"sheetName!A1:B2"或者{row:[0,1],column:[0,1]}，只能为单个选区；默认为当前选区
 * @param {Function} options.success 操作结束的回调函数
 */
export function matrixOperation(type, options = {}) {
  let typeValues = [
    "flipUpDown", // 上下翻转
    "flipLeftRight", // 左右翻转
    "flipClockwise", // 顺时针旋转
    "flipCounterClockwise", // 逆时针旋转
    "transpose", // 转置
    "deleteZeroByRow", // 按行删除两端0值
    "deleteZeroByColumn", // 按列删除两端0值
    "removeDuplicateByRow", // 按行删除重复值
    "removeDuplicateByColumn", // 按列删除重复值
    "newMatrix", // 生产新矩阵
  ];

  if (!type || typeValues.indexOf(type) < 0) {
    return tooltip.info("The type parameter is invalid.", "");
  }

  let curRange = Store.MBLsheet_select_save[0];
  let { range = curRange, success } = { ...options };

  if (range instanceof Array && range.length > 1) {
    tooltip.info(locale().drag.noMulti, "");
    return;
  }

  if (range && typeof range === "string" && formula.iscelldata(range)) {
    range = formula.getcellrange(range);
  }

  let getdata = getdatabyselection(range);
  let arr = [];
  if (getdata.length === 0) {
    return;
  }

  let getdatalen, collen, arr1;
  switch (type) {
    case "flipUpDown":
      for (let r = getdata.length - 1; r >= 0; r--) {
        let a = [];
        for (let c = 0; c < getdata[0].length; c++) {
          let value = "";
          if (getdata[r] != null && getdata[r][c] != null) {
            value = getdata[r][c];
          }
          a.push(value);
        }
        arr.push(a);
      }
      break;
    case "flipLeftRight":
      for (let r = 0; r < getdata.length; r++) {
        let a = [];
        for (let c = getdata[0].length - 1; c >= 0; c--) {
          let value = "";
          if (getdata[r] != null && getdata[r][c] != null) {
            value = getdata[r][c];
          }
          a.push(value);
        }
        arr.push(a);
      }
      break;
    case "flipClockwise":
      for (let c = 0; c < getdata[0].length; c++) {
        let a = [];
        for (let r = getdata.length - 1; r >= 0; r--) {
          let value = "";
          if (getdata[r] != null && getdata[r][c] != null) {
            value = getdata[r][c];
          }
          a.push(value);
        }
        arr.push(a);
      }
      break;
    case "flipCounterClockwise":
      for (let c = getdata[0].length - 1; c >= 0; c--) {
        let a = [];
        for (let r = 0; r < getdata.length; r++) {
          let value = "";
          if (getdata[r] != null && getdata[r][c] != null) {
            value = getdata[r][c];
          }
          a.push(value);
        }
        arr.push(a);
      }
      break;
    case "transpose":
      for (let c = 0; c < getdata[0].length; c++) {
        let a = [];
        for (let r = 0; r < getdata.length; r++) {
          let value = "";
          if (getdata[r] != null && getdata[r][c] != null) {
            value = getdata[r][c];
          }
          a.push(value);
        }
        arr.push(a);
      }
      break;
    case "deleteZeroByRow":
      getdatalen = getdata[0].length;
      for (let r = 0; r < getdata.length; r++) {
        let a = [],
          stdel = true,
          eddel = true;
        for (let c = 0; c < getdatalen; c++) {
          let value = "";
          if (getdata[r] != null && getdata[r][c] != null) {
            value = getdata[r][c];
            if ((value.v == "0" || value.v == 0) && stdel) {
              continue;
            } else {
              stdel = false;
            }
          }
          a.push(value);
        }

        let a1 = [];
        if (a.length == getdatalen) {
          a1 = a;
        } else {
          for (let c = a.length - 1; c >= 0; c--) {
            let value = "";
            if (a[c] != null) {
              value = a[c];
              if ((value.v == "0" || value.v == 0) && eddel) {
                continue;
              } else {
                eddel = false;
              }
            }
            a1.unshift(value);
          }

          let l = getdatalen - a1.length;
          for (let c1 = 0; c1 < l; c1++) {
            a1.push("");
          }
        }
        arr.push(a1);
      }
      break;
    case "deleteZeroByColumn":
      getdatalen = getdata.length;
      collen = getdata[0].length;
      for (let c = 0; c < collen; c++) {
        let a = [],
          stdel = true,
          eddel = true;
        for (let r = 0; r < getdatalen; r++) {
          let value = "";
          if (getdata[r] != null && getdata[r][c] != null) {
            value = getdata[r][c];
            if ((value.v == "0" || value.v == 0) && stdel) {
              continue;
            } else {
              stdel = false;
            }
          }
          a.push(value);
        }

        let a1 = [];
        if (a.length == getdatalen) {
          a1 = a;
        } else {
          for (let r = a.length - 1; r >= 0; r--) {
            let value = "";
            if (a[r] != null) {
              value = a[r];
              if ((value.v == "0" || value.v == 0) && eddel) {
                continue;
              } else {
                eddel = false;
              }
            }
            a1.unshift(value);
          }

          let l = getdatalen - a1.length;
          for (let r1 = 0; r1 < l; r1++) {
            a1.push("");
          }
        }
        arr.push(a1);
      }

      arr1 = [];
      for (let c = 0; c < arr[0].length; c++) {
        let a = [];
        for (let r = 0; r < arr.length; r++) {
          let value = "";
          if (arr[r] != null && arr[r][c] != null) {
            value = arr[r][c];
          }
          a.push(value);
        }
        arr1.push(a);
      }
      break;
    case "removeDuplicateByRow":
      getdatalen = getdata[0].length;
      for (let r = 0; r < getdata.length; r++) {
        let a = [],
          repeat = {};

        for (let c = 0; c < getdatalen; c++) {
          let value = null;
          if (getdata[r] != null && getdata[r][c] != null) {
            value = getdata[r][c];

            if (value.v in repeat) {
              repeat[value.v].push(value);
            } else {
              repeat[value.v] = [];
              repeat[value.v].push(value);
            }
          }
        }

        for (let c = 0; c < getdatalen; c++) {
          let value = null;
          if (getdata[r] != null && getdata[r][c] != null) {
            value = getdata[r][c];

            if (repeat[value.v].length == 1) {
              a.push(value);
            }
          }
        }

        let l = getdatalen - a.length;
        for (let c1 = 0; c1 < l; c1++) {
          a.push(null);
        }
        arr.push(a);
      }
      break;
    case "removeDuplicateByColumn":
      collen = getdata[0].length;
      getdatalen = getdata.length;
      for (let c = 0; c < collen; c++) {
        let a = [],
          repeat = {};

        for (let r = 0; r < getdatalen; r++) {
          let value = null;
          if (getdata[r] != null && getdata[r][c] != null) {
            value = getdata[r][c];

            if (value.v in repeat) {
              repeat[value.v].push(value);
            } else {
              repeat[value.v] = [];
              repeat[value.v].push(value);
            }
          }
        }

        for (let r = 0; r < getdatalen; r++) {
          let value = null;
          if (getdata[r] != null && getdata[r][c] != null) {
            value = getdata[r][c];

            if (repeat[value.v].length == 1) {
              a.push(value);
            }
          }
        }

        a1 = a;
        let l = getdatalen - a1.length;
        for (let r1 = 0; r1 < l; r1++) {
          a1.push(null);
        }
        arr.push(a1);
      }

      arr1 = [];
      for (let c = 0; c < arr[0].length; c++) {
        let a = [];
        for (let r = 0; r < arr.length; r++) {
          let value = null;
          if (arr[r] != null && arr[r][c] != null) {
            value = arr[r][c];
          }
          a.push(value);
        }
        arr1.push(a);
      }
      break;
    case "newMatrix":
      // TODO
      console.log("TODO");
      break;
  }
  editor.controlHandler(arr, range);

  if (success && typeof success === "function") {
    success();
  }
}

/**
 * 指定工作表指定单元格区域的数据进行矩阵计算，返回计算成功后的结果数据
 * @param {String} type 计算方式
 * @param {Number} number 计算数值
 * @param {Object} options 可选参数
 * @param {Object | String} options.range 选区范围,支持选区的格式为"A1:B2"、"sheetName!A1:B2"或者{row:[0,1],column:[0,1]}，只能为单个选区；默认为当前选区
 * @param {Function} options.success 操作结束的回调函数
 */
export function matrixCalculation(type, number, options = {}) {
  let typeValues = [
    "plus", // 加
    "minus", // 减
    "multiply", // 乘
    "divided", // 除
    "power", // 幂
    "root", // 次方根
    "log", // 对数log
  ];

  if (!type || typeValues.indexOf(type) < 0) {
    return tooltip.info("The type parameter is invalid.", "");
  }

  if (!isRealNum(number)) {
    return tooltip.info("The number parameter is invalid.", "");
  }

  let curRange = Store.MBLsheet_select_save[0];
  let { range = curRange, success } = { ...options };

  if (range instanceof Array && range.length > 1) {
    tooltip.info(locale().drag.noMulti, "");
    return;
  }

  if (range && typeof range === "string" && formula.iscelldata(range)) {
    range = formula.getcellrange(range);
  }

  let getdata = getdatabyselection(range);
  if (getdata.length == 0) {
    return;
  }

  let arr = [];
  for (let r = 0; r < getdata.length; r++) {
    let a = [];
    for (let c = 0; c < getdata[0].length; c++) {
      let value = "";
      if (getdata[r] != null && getdata[r][c] != null) {
        value = getdata[r][c];
        if (
          parseInt(value) != null &&
          getdata[r][c].ct != undefined &&
          getdata[r][c].ct.t == "n"
        ) {
          if (type == "minus") {
            value.v = value.v - number;
          } else if (type == "multiply") {
            value.v = value.v * number;
          } else if (type == "divided") {
            value.v = numFormat(value.v / number, 4);
          } else if (type == "power") {
            value.v = Math.pow(value.v, number);
          } else if (type == "root") {
            if (number == 2) {
              value.v = numFormat(Math.sqrt(value.v), 4);
            } else if (number == 3 && Math.cbrt) {
              value.v = numFormat(Math.cbrt(value.v), 4);
            } else {
              value.v = numFormat(jfnqrt(value.v, number), 4);
            }
          } else if (type == "log") {
            value.v = numFormat(
              (Math.log(value.v) * 10000) / Math.log(Math.abs(number)),
              4
            );
          } else {
            value.v = value.v + number;
          }

          if (value.v == null) {
            value.m = "";
          } else {
            value.m = value.v.toString();
          }
        }
      }
      a.push(value);
    }
    arr.push(a);
  }

  editor.controlHandler(arr, range);

  if (success && typeof success === "function") {
    success();
  }
}

/**
 * 新增一个sheet，返回新增的工作表对象
 * @param {Object} options 可选参数
 * @param {Object} options.sheetObject 新增的工作表的数据；默认值为空对象
 * @param {Number} options.order 新增的工作表索引；默认值为最后一个索引位置
 * @param {Function} options.success 操作结束的回调函数
 */
export function setSheetAdd(options = {}) {
  let lastOrder = Store.MBLsheetfile.length - 1;
  let { sheetObject = {}, order = lastOrder, success } = { ...options };

  if (!isRealNum(order)) {
    return tooltip.info("Parameter is not a table index", "");
  }

  order = Number(order);

  let index = sheetmanage.generateRandomSheetIndex();
  // calcChain公式链里的index也要跟着变化
  if (sheetObject.calcChain && sheetObject.calcChain.length > 0) {
    sheetObject.calcChain.forEach((item) => {
      item.index = index;
    });
  }
  let sheetname = sheetmanage.generateRandomSheetName(
    Store.MBLsheetfile,
    false
  );
  if (!!sheetObject.name) {
    let sameName = false;

    for (let i = 0; i < Store.MBLsheetfile.length; i++) {
      if (Store.MBLsheetfile[i].name == sheetObject.name) {
        sameName = true;
        break;
      }
    }

    if (!sameName) {
      sheetname = sheetObject.name;
    }
  }

  $("#MBLsheet-sheet-container-c").append(
    replaceHtml(sheetHTML, {
      index: index,
      active: "",
      name: sheetname,
      style: "",
      colorset: "",
    })
  );

  let sheetconfig = {
    name: "",
    color: "",
    status: "0",
    order: "",
    index: "",
    celldata: [],
    row: Store.defaultrowNum,
    column: Store.defaultcolumnNum,
    config: {},
    pivotTable: null,
    isPivotTable: false,
  };
  sheetconfig = $.extend(true, sheetconfig, sheetObject);

  sheetconfig.index = index;
  sheetconfig.name = sheetname;
  sheetconfig.order = order;

  if (order <= 0) {
    let beforeIndex = Store.MBLsheetfile[0].index;
    let beforeObj = $("#MBLsheet-sheets-item" + beforeIndex);
    $("#MBLsheet-sheets-item" + index).insertBefore(beforeObj);

    Store.MBLsheetfile.splice(0, 0, sheetconfig);
  } else {
    if (order > Store.MBLsheetfile.length) {
      order = Store.MBLsheetfile.length;
    }

    let afterIndex = Store.MBLsheetfile[order - 1].index;
    let afterObj = $("#MBLsheet-sheets-item" + afterIndex);
    $("#MBLsheet-sheets-item" + index).insertAfter(afterObj);

    Store.MBLsheetfile.splice(order, 0, sheetconfig);
  }

  let orders = {};

  Store.MBLsheetfile.forEach((item, i, arr) => {
    arr[i].order = i;
    orders[item.index.toString()] = i;
  });

  $("#MBLsheet-sheet-area div.MBLsheet-sheets-item").removeClass(
    "MBLsheet-sheets-item-active"
  );
  $("#MBLsheet-sheets-item" + index).addClass("MBLsheet-sheets-item-active");
  $("#MBLsheet-cell-main").append(
    '<div id="MBLsheet-datavisual-selection-set-' +
      index +
      '" class="MBLsheet-datavisual-selection-set"></div>'
  );
  cleargridelement(true);

  server.saveParam("sha", null, $.extend(true, {}, sheetconfig));
  server.saveParam("shr", null, orders);

  if (Store.clearjfundo) {
    Store.jfundo.length = 0;
    let redo = {};
    redo["type"] = "addSheet";
    redo["sheetconfig"] = $.extend(true, {}, sheetconfig);
    redo["index"] = index;
    redo["currentSheetIndex"] = Store.currentSheetIndex;
    Store.jfredo.push(redo);
  }

  sheetmanage.changeSheetExec(index, false, true);

  if (success && typeof success === "function") {
    success();
  }
  return sheetconfig;
}

/**
 * 删除指定下标的工作表，返回已删除的工作表对象
 * @param {Object} options 可选参数
 * @param {Number} options.order 工作表下标；默认值为当前工作表下标
 * @param {Function} options.success 操作结束的回调函数
 */
export function setSheetDelete(options = {}) {
  let { order = getSheetIndex(Store.currentSheetIndex), success } = {
    ...options,
  };

  let file = Store.MBLsheetfile[order];

  if (file == null) {
    return tooltip.info("The order parameter is invalid.", "");
  }

  if (Store.MBLsheetfile.length === 1) {
    return tooltip.info(locale().sheetconfig.noMoreSheet, "");
  }

  sheetmanage.deleteSheet(file.index);

  setTimeout(() => {
    if (success && typeof success === "function") {
      success();
    }
  }, 1);

  return file;
}

/**
 * 复制指定下标的工作表到指定下标位置
 * @param {Object} options 可选参数
 * @param {Number} options.targetOrder 新复制的工作表目标下标位置；默认值为当前工作表下标的下一个下标位置（递增）
 * @param {Number} options.order 被复制的工作表下标；默认值为当前工作表下标
 * @param {Function} options.success 操作结束的回调函数
 */
export function setSheetCopy(options = {}) {
  let {
    targetOrder,
    order = getSheetIndex(Store.currentSheetIndex),
    success,
  } = { ...options };

  let file = Store.MBLsheetfile[order];

  if (file == null) {
    return tooltip.info("The order parameter is invalid.", "");
  }

  if (targetOrder == null) {
    targetOrder = order + 1;
  }

  if (!isRealNum(targetOrder)) {
    return tooltip.info("The targetOrder parameter is invalid.", "");
  }

  let copyindex = file.index;
  let index = sheetmanage.generateRandomSheetIndex();

  let copyjson = $.extend(true, {}, file);
  copyjson.order = Store.MBLsheetfile.length;
  copyjson.index = index;
  copyjson.name = sheetmanage.generateCopySheetName(
    Store.MBLsheetfile,
    copyjson.name
  );

  let colorset = "";
  if (copyjson.color != null) {
    colorset =
      '<div class="MBLsheet-sheets-item-color" style=" position: absolute; width: 100%; height: 3px; bottom: 0px; left: 0px; background-color: ' +
      copyjson.color +
      ';"></div>';
  }

  let afterObj = $("#MBLsheet-sheets-item" + copyindex);
  if (isRealNum(targetOrder)) {
    afterObj = $(
      "#MBLsheet-sheets-item" + Store.MBLsheetfile[targetOrder - 1].index
    );
  }

  $("#MBLsheet-sheet-container-c").append(
    replaceHtml(sheetHTML, {
      index: copyjson.index,
      active: "",
      name: copyjson.name,
      order: copyjson.order,
      style: "",
      colorset: colorset,
    })
  );
  $("#MBLsheet-sheets-item" + copyjson.index).insertAfter(afterObj);
  Store.MBLsheetfile.splice(targetOrder, 0, copyjson);

  $("#MBLsheet-sheet-area div.MBLsheet-sheets-item").removeClass(
    "MBLsheet-sheets-item-active"
  );
  $("#MBLsheet-sheets-item" + index).addClass("MBLsheet-sheets-item-active");
  $("#MBLsheet-cell-main").append(
    '<div id="MBLsheet-datavisual-selection-set-' +
      index +
      '" class="MBLsheet-datavisual-selection-set"></div>'
  );
  cleargridelement(true);

  server.saveParam("shc", index, { copyindex: copyindex, name: copyjson.name });

  sheetmanage.changeSheetExec(index);
  sheetmanage.reOrderAllSheet();

  if (Store.clearjfundo) {
    Store.jfredo.push({
      type: "copySheet",
      copyindex: copyindex,
      index: copyjson.index,
      sheetIndex: copyjson.index,
    });
  } else if (Store.jfredo.length > 0) {
    let jfredostr = Store.jfredo[Store.jfredo.length - 1];

    if (jfredostr.type == "copySheet") {
      jfredostr.index = copyjson.index;
      jfredostr.sheetIndex = copyjson.index;
    }
  }

  setTimeout(() => {
    if (success && typeof success === "function") {
      success();
    }
  }, 1);

  return copyjson;
}

/**
 * 隐藏指定下标的工作表，返回被隐藏的工作表对象
 * @param {Object} options 可选参数
 * @param {Number} options.order 工作表下标；默认值为当前工作表下标
 * @param {Function} options.success 操作结束的回调函数
 */
export function setSheetHide(options = {}) {
  let { order = getSheetIndex(Store.currentSheetIndex), success } = {
    ...options,
  };

  let file = Store.MBLsheetfile[order];

  if (file == null) {
    return tooltip.info("The order parameter is invalid.", "");
  }

  sheetmanage.setSheetHide(file.index);

  setTimeout(() => {
    if (success && typeof success === "function") {
      success();
    }
  }, 1);

  return file;
}

/**
 * 取消隐藏指定下标的工作表，返回被取消隐藏的工作表对象
 * @param {Object} options 可选参数
 * @param {Number} options.order 工作表下标；默认值为当前工作表下标
 * @param {Function} options.success 操作结束的回调函数
 */
export function setSheetShow(options = {}) {
  let { order = getSheetIndex(Store.currentSheetIndex), success } = {
    ...options,
  };

  let file = Store.MBLsheetfile[order];

  if (file == null) {
    return tooltip.info("The order parameter is invalid.", "");
  }

  sheetmanage.setSheetShow(file.index);

  setTimeout(() => {
    if (success && typeof success === "function") {
      success();
    }
  }, 1);

  return file;
}

/**
 * 设置指定下标的工作表为当前工作表（激活态），即切换到指定的工作表，返回被激活的工作表对象
 * @param {Number} order 要激活的工作表下标
 * @param {Object} options 可选参数
 * @param {Function} options.success 操作结束的回调函数
 */
export function setSheetActive(order, options = {}) {
  if (order == null || !isRealNum(order) || Store.MBLsheetfile[order] == null) {
    return tooltip.info("The order parameter is invalid.", "");
  }

  let file = Store.MBLsheetfile[order];

  let { success } = { ...options };

  $("#MBLsheet-sheet-area div.MBLsheet-sheets-item").removeClass(
    "MBLsheet-sheets-item-active"
  );
  $("#MBLsheet-sheets-item" + file.index).addClass(
    "MBLsheet-sheets-item-active"
  );

  sheetmanage.changeSheet(file.index);

  setTimeout(() => {
    if (success && typeof success === "function") {
      success();
    }
  }, 1);
  server.multipleRangeShow();
  return file;
}

/**
 * 修改工作表名称
 * @param {String} name 工作表名称
 * @param {Object} options 可选参数
 * @param {Number} options.order 工作表下标；默认值为当前工作表下标
 * @param {Function} options.success 操作结束的回调函数
 */
export function setSheetName(name, options = {}) {
  if (getObjType(name) != "string" || name.toString().length == 0) {
    return tooltip.info("The name parameter is invalid.", "");
  }

  let { order = getSheetIndex(Store.currentSheetIndex), success } = {
    ...options,
  };

  let file = Store.MBLsheetfile[order];

  if (file == null) {
    return tooltip.info("The order parameter is invalid.", "");
  }

  let oldtxt = file.name;
  file.name = name;

  $("#MBLsheet-sheets-item" + file.index + " .MBLsheet-sheets-item-name").text(
    name
  );

  server.saveParam("all", file.index, name, { k: "name" });

  if (Store.clearjfundo) {
    let redo = {};
    redo["type"] = "sheetName";
    redo["sheetIndex"] = file.index;

    redo["oldtxt"] = oldtxt;
    redo["txt"] = name;

    Store.jfundo.length = 0;
    Store.jfredo.push(redo);
  }

  if (success && typeof success === "function") {
    success();
  }
}

/**
 * 设置工作表名称处的颜色
 * @param {String} color 工作表颜色
 * @param {Object} options 可选参数
 * @param {Number} options.order 工作表下标；默认值为当前工作表下标
 * @param {Function} options.success 操作结束的回调函数
 */
export function setSheetColor(color, options = {}) {
  if (getObjType(color) != "string" || color.toString().length == 0) {
    return tooltip.info("The color parameter is invalid.", "");
  }

  let { order = getSheetIndex(Store.currentSheetIndex), success } = {
    ...options,
  };

  let file = Store.MBLsheetfile[order];

  if (file == null) {
    return tooltip.info("The order parameter is invalid.", "");
  }

  let oldcolor = file.color;
  file.color = color;

  $("#MBLsheet-sheets-item" + file.index)
    .find(".MBLsheet-sheets-item-color")
    .remove();
  $("#MBLsheet-sheets-item" + file.index).append(
    '<div class="MBLsheet-sheets-item-color" style=" position: absolute; width: 100%; height: 3px; bottom: 0px; left: 0px; background-color: ' +
      color +
      ';"></div>'
  );

  server.saveParam("all", file.index, color, { k: "color" });

  if (Store.clearjfundo) {
    let redo = {};
    redo["type"] = "sheetColor";
    redo["sheetIndex"] = file.index;

    redo["oldcolor"] = oldcolor;
    redo["color"] = color;

    Store.jfundo.length = 0;
    Store.jfredo.push(redo);
  }

  if (success && typeof success === "function") {
    success();
  }
}

/**
 * 指定工作表向左边或右边移动一个位置，或者指定索引，返回指定的工作表对象
 * @param {String | Number} type 工作表移动方向或者移动的目标索引
 * @param {Object} options 可选参数
 * @param {Number} options.order 工作表索引；默认值为当前工作表索引
 * @param {Function} options.success 操作结束的回调函数
 */
export function setSheetMove(type, options = {}) {
  if (type != "left" && type != "right" && !isRealNum(type)) {
    return tooltip.info("Type parameter not available", "");
  }

  if (isRealNum(type)) {
    type = parseInt(type);
  }

  let curOrder = getSheetIndex(Store.currentSheetIndex);
  let { order = curOrder, success } = { ...options };

  let file = Store.MBLsheetfile[order];

  if (file == null) {
    return tooltip.info("ncorrect worksheet index", "");
  }

  let sheetIndex = file.index;

  if (type == "left") {
    if (order == 0) {
      return;
    }

    let prevIndex = Store.MBLsheetfile[order - 1].index;
    $("#MBLsheet-sheets-item" + sheetIndex).insertBefore(
      $("#MBLsheet-sheets-item" + prevIndex)
    );

    Store.MBLsheetfile.splice(order, 1);
    Store.MBLsheetfile.splice(order - 1, 0, file);
  } else if (type == "right") {
    if (order == Store.MBLsheetfile.length - 1) {
      return;
    }

    let nextIndex = Store.MBLsheetfile[order + 1].index;
    $("#MBLsheet-sheets-item" + sheetIndex).insertAfter(
      $("#MBLsheet-sheets-item" + nextIndex)
    );

    Store.MBLsheetfile.splice(order, 1);
    Store.MBLsheetfile.splice(order + 1, 0, file);
  } else {
    if (type < 0) {
      type = 0;
    }

    if (type > Store.MBLsheetfile.length - 1) {
      type = Store.MBLsheetfile.length - 1;
    }

    if (type == order) {
      return;
    }

    if (type < order) {
      let prevIndex = Store.MBLsheetfile[type].index;
      $("#MBLsheet-sheets-item" + sheetIndex).insertBefore(
        $("#MBLsheet-sheets-item" + prevIndex)
      );
    } else {
      let nextIndex = Store.MBLsheetfile[type].index;
      $("#MBLsheet-sheets-item" + sheetIndex).insertAfter(
        $("#MBLsheet-sheets-item" + nextIndex)
      );
    }

    Store.MBLsheetfile.splice(order, 1);
    Store.MBLsheetfile.splice(type, 0, file);
  }

  let orders = {};

  Store.MBLsheetfile.forEach((item, i, arr) => {
    arr[i].order = i;
    orders[item.index.toString()] = i;
  });

  server.saveParam("shr", null, orders);

  if (success && typeof success === "function") {
    success();
  }
}

/**
 * 重新排序所有工作表的位置，指定工作表顺序的数组。
 * @param {Array} orderList 工作表顺序，设置工作表的index和order来指定位置
 * @param {Object} options 可选参数
 * @param {Function} options.success 操作结束的回调函数
 */
export function setSheetOrder(orderList, options = {}) {
  if (orderList == null || orderList.length == 0) {
    return tooltip.info("Type orderList not available", "");
  }

  let orderListMap = {};
  orderList.forEach((item) => {
    orderListMap[item.index.toString()] = item.order;
  });

  Store.MBLsheetfile.sort((x, y) => {
    let order_x = orderListMap[x.index.toString()];
    let order_y = orderListMap[y.index.toString()];

    if (order_x != null && order_y != null) {
      return order_x - order_y;
    } else if (order_x != null) {
      return -1;
    } else if (order_y != null) {
      return 1;
    } else {
      return 1;
    }
  });

  let orders = {};

  Store.MBLsheetfile.forEach((item, i, arr) => {
    arr[i].order = i;
    orders[item.index.toString()] = i;

    if (i > 0) {
      let preIndex = arr[i - 1].index;
      $("#MBLsheet-sheets-item" + item.index).insertAfter(
        $("#MBLsheet-sheets-item" + preIndex)
      );
    }
  });

  server.saveParam("shr", null, orders);

  let { success } = { ...options };

  if (success && typeof success === "function") {
    success();
  }
}

/**
 * 设置工作表缩放比例
 * @param {Number} zoom 工作表缩放比例，值范围为0.1 ~ 4；
 * @param {Object} options 可选参数
 * @param {Number} options.order 工作表下标；默认值为当前工作表下标
 * @param {Function} options.success 操作结束的回调函数
 */
export function setSheetZoom(zoom, options = {}) {
  if (!isRealNum(zoom) || zoom < 0.1 || zoom > 4) {
    return tooltip.info("The zoom parameter is invalid.", "");
  }

  let { order = getSheetIndex(Store.currentSheetIndex), success } = {
    ...options,
  };

  let file = Store.MBLsheetfile[order];

  if (file == null) {
    return tooltip.info("The order parameter is invalid.", "");
  }

  file["zoomRatio"] = zoom;

  server.saveParam("all", file.index, zoom, { k: "zoomRatio" });

  if (file.index == Store.currentSheetIndex) {
    Store.zoomRatio = zoom;
    // 图片
    let currentSheet = sheetmanage.getSheetByIndex();
    imageCtrl.images = currentSheet.images;
    imageCtrl.allImagesShow();
    imageCtrl.init();

    zoomNumberDomBind();
    zoomRefreshView();
  }

  if (success && typeof success === "function") {
    success();
  }
}

/**
 * 显示指定下标工作表的网格线，返回操作的工作表对象
 * @param {Object} options 可选参数
 * @param {Number} options.order 需要显示网格线的工作表下标；默认值为当前工作表下标
 * @param {Function} options.success 操作结束的回调函数
 */
export function showGridLines(options = {}) {
  let { order = getSheetIndex(Store.currentSheetIndex), success } = {
    ...options,
  };

  let file = Store.MBLsheetfile[order];

  if (file == null) {
    return tooltip.info("The order parameter is invalid.", "");
  }

  file.showGridLines = true;

  if (file.index == Store.currentSheetIndex) {
    Store.showGridLines = true;

    setTimeout(function () {
      MBLsheetrefreshgrid();
    }, 1);
  }

  setTimeout(() => {
    if (success && typeof success === "function") {
      success();
    }
  }, 1);

  return file;
}

/**
 * 隐藏指定下标工作表的网格线，返回操作的工作表对象
 * @param {Object} options 可选参数
 * @param {Number} options.order 需要显示网格线的工作表下标；默认值为当前工作表下标
 * @param {Function} options.success 操作结束的回调函数
 */
export function hideGridLines(options = {}) {
  let { order = getSheetIndex(Store.currentSheetIndex), success } = {
    ...options,
  };

  let file = Store.MBLsheetfile[order];

  if (file == null) {
    return tooltip.info("The order parameter is invalid.", "");
  }

  file.showGridLines = false;

  if (file.index == Store.currentSheetIndex) {
    Store.showGridLines = false;

    setTimeout(function () {
      MBLsheetrefreshgrid();
    }, 1);
  }

  setTimeout(() => {
    if (success && typeof success === "function") {
      success();
    }
  }, 1);

  return file;
}

/**
 * 刷新canvas
 * @param {Object} options 可选参数
 * @param {Function} options.success 操作结束的回调函数
 */
export function refresh(options = {}) {
  // MBLsheetrefreshgrid();
  jfrefreshgrid();

  let { success } = { ...options };

  if (success && typeof success === "function") {
    success();
  }
}

/**
 * 滚动当前工作表位置
 * @param {Object} options 可选参数
 * @param {Number} options.scrollLeft 横向滚动值
 * @param {Number} options.scrollTop 纵向滚动值
 * @param {Number} options.targetRow 纵向滚动到指定的行号
 * @param {Number} options.targetColumn 横向滚动到指定的列号
 * @param {Function} options.success 操作结束的回调函数
 */
export function scroll(options = {}) {
  let { scrollLeft, scrollTop, targetRow, targetColumn, success } = {
    ...options,
  };

  if (scrollLeft != null) {
    if (!isRealNum(scrollLeft)) {
      return tooltip.info("The scrollLeft parameter is invalid.", "");
    }

    $("#MBLsheet-scrollbar-x").scrollLeft(scrollLeft);
  } else if (targetColumn != null) {
    if (!isRealNum(targetColumn)) {
      return tooltip.info("The targetColumn parameter is invalid.", "");
    }

    let col = Store.visibledatacolumn[targetColumn],
      col_pre =
        targetColumn <= 0 ? 0 : Store.visibledatacolumn[targetColumn - 1];

    $("#MBLsheet-scrollbar-x").scrollLeft(col_pre);
  }

  if (scrollTop != null) {
    if (!isRealNum(scrollTop)) {
      return tooltip.info("The scrollTop parameter is invalid.", "");
    }

    $("#MBLsheet-scrollbar-y").scrollTop(scrollTop);
  } else if (targetRow != null) {
    if (!isRealNum(targetRow)) {
      return tooltip.info("The targetRow parameter is invalid.", "");
    }

    let row = Store.visibledatarow[targetRow],
      row_pre = targetRow <= 0 ? 0 : Store.visibledatarow[targetRow - 1];

    $("#MBLsheet-scrollbar-y").scrollTop(row_pre);
  }

  if (success && typeof success === "function") {
    success();
  }
}

/**
 * 根据窗口大小自动resize画布
 * @param {Object} options 可选参数
 * @param {Function} options.success 操作结束的回调函数
 */
export function resize(options = {}) {
  MBLsheetsizeauto();

  let { success } = { ...options };

  if (success && typeof success === "function") {
    success();
  }
}

/**
 * 返回指定选区截图后生成的base64格式的图片
 * @param {Object} options 可选参数
 * @param {Object | String} options.range 选区范围，只能为单个选区；默认为当前选区
 */
export function getScreenshot(options = {}) {
  let {
    range = Store.MBLsheet_select_save[Store.MBLsheet_select_save.length - 1],
  } = { ...options };

  if (getObjType(range) == "string") {
    if (!formula.iscelldata(range)) {
      return tooltip.info("The range parameter is invalid.", "");
    }

    let cellrange = formula.getcellrange(range);
    range = {
      row: cellrange.row,
      column: cellrange.column,
    };
  }

  if (
    getObjType(range) != "object" ||
    range.row == null ||
    range.column == null
  ) {
    return tooltip.info("The range parameter is invalid.", "");
  }

  let str = range.row[0],
    edr = range.row[1],
    stc = range.column[0],
    edc = range.column[1];

  let has_PartMC = hasPartMC(Store.config, str, edr, stc, edc);

  if (has_PartMC) {
    return tooltip.info(
      "Cannot perform this operation on partially merged cells",
      ""
    );
  }

  let visibledatarow = Store.visibledatarow;
  let visibledatacolumn = Store.visibledatacolumn;

  let scrollHeight, rh_height;
  if (str - 1 < 0) {
    scrollHeight = 0;
    rh_height = visibledatarow[edr];
  } else {
    scrollHeight = visibledatarow[str - 1];
    rh_height = visibledatarow[edr] - visibledatarow[str - 1];
  }

  let scrollWidth, ch_width;
  if (stc - 1 < 0) {
    scrollWidth = 0;
    ch_width = visibledatacolumn[edc];
  } else {
    scrollWidth = visibledatacolumn[stc - 1];
    ch_width = visibledatacolumn[edc] - visibledatacolumn[stc - 1];
  }

  let newCanvas = $("<canvas>")
    .attr({
      width: Math.ceil(ch_width * Store.devicePixelRatio),
      height: Math.ceil(rh_height * Store.devicePixelRatio),
    })
    .css({ width: ch_width, height: rh_height });

  MBLsheetDrawMain(
    scrollWidth,
    scrollHeight,
    ch_width,
    rh_height,
    1,
    1,
    null,
    null,
    newCanvas
  );
  let ctx_newCanvas = newCanvas.get(0).getContext("2d");

  //补上 左边框和上边框
  ctx_newCanvas.beginPath();
  ctx_newCanvas.moveTo(0, 0);
  ctx_newCanvas.lineTo(0, Store.devicePixelRatio * rh_height);
  ctx_newCanvas.lineWidth = Store.devicePixelRatio * 2;
  ctx_newCanvas.strokeStyle = MBLsheetdefaultstyle.strokeStyle;
  ctx_newCanvas.stroke();
  ctx_newCanvas.closePath();

  ctx_newCanvas.beginPath();
  ctx_newCanvas.moveTo(0, 0);
  ctx_newCanvas.lineTo(Store.devicePixelRatio * ch_width, 0);
  ctx_newCanvas.lineWidth = Store.devicePixelRatio * 2;
  ctx_newCanvas.strokeStyle = MBLsheetdefaultstyle.strokeStyle;
  ctx_newCanvas.stroke();
  ctx_newCanvas.closePath();

  let url = newCanvas.get(0).toDataURL("image/png");

  return url;
}

/**
 * 设置工作簿名称
 * @param {String} name 工作簿名称
 * @param {Object} options 可选参数
 * @param {Function} options.success 操作结束的回调函数
 */
export function setWorkbookName(name, options = {}) {
  if (name == null || name.toString().length == 0) {
    return tooltip.info("The name parameter is invalid.", "");
  }

  $("#MBLsheet_info_detail_input").val(name);

  let { success } = { ...options };

  if (success && typeof success === "function") {
    success();
  }
}

/**
 * 获取工作簿名称
 * @param   {Object}    options         可选参数
 * @param   {Function}  options.success 操作结束的回调函数
 * @returns {String}    返回工作簿名称，如果读取失败则返回空字符串并弹窗提示
 */
export function getWorkbookName(options = {}) {
  let name = "";
  let element = $("#MBLsheet_info_detail_input");

  if (element.length == 0) {
    tooltip.info("Failed to get workbook name, label loading failed!");
    return name;
  }

  name = $.trim(element.val());

  let { success } = { ...options };

  setTimeout(() => {
    if (success && typeof success === "function") {
      success();
    }
  }, 1);

  return name;
}

/**
 * 撤销当前操作，返回刚刚撤销的操作对象
 * @param {Object} options 可选参数
 * @param {Function} options.success 操作结束的回调函数
 */
export function undo(options = {}) {
  let ctr = $.extend(true, {}, Store.jfredo[Store.jfredo.length - 1]);

  controlHistory.redo(new Event("custom"));
  MBLsheetactiveCell();

  let { success } = { ...options };

  setTimeout(() => {
    if (success && typeof success === "function") {
      success();
    }
  }, 1);

  return ctr;
}

/**
 * 重做当前操作，返回刚刚重做的操作对象
 * @param {Object} options 可选参数
 * @param {Function} options.success 操作结束的回调函数
 */
export function redo(options = {}) {
  let ctr = $.extend(true, {}, Store.jfundo[Store.jfundo.length - 1]);

  controlHistory.undo(new Event("custom"));
  MBLsheetactiveCell();

  let { success } = { ...options };

  setTimeout(() => {
    if (success && typeof success === "function") {
      success();
    }
  }, 1);

  return ctr;
}

/**
 * 返回所有工作表配置
 */
export function getAllSheets() {
  let data = $.extend(true, [], Store.MBLsheetfile);
  // FIXME: 这里的取值有问题 导致初始话 select 没有展示 对应的label
  data.forEach((item, index, arr) => {
    if (item.data != null && item.data.length > 0) {
      item.celldata = sheetmanage.getGridData(item.data);
    }

    delete item.load;
    delete item.freezen;
  });

  return data;
}

/**
 * 根据index获取sheet页配置
 *
 * @param {Object} options 可选参数
 * @param {String} options.index 工作表index
 * @param {Number} options.order 工作表order
 * @param {String} options.name 工作表name
 */
export function getSheet(options = {}) {
  let { index, order, name } = { ...options };

  if (index != null) {
    return sheetmanage.getSheetByIndex(index);
  } else if (order != null) {
    return Store.MBLsheetfile[order];
  } else if (name != null) {
    return sheetmanage.getSheetByName(name);
  }

  return sheetmanage.getSheetByIndex();
}

/**
 * 快捷返回指定工作表的数据
 * @param {Object} options 可选参数
 * @param {Number} options.order 工作表下标；默认值为当前工作表下标
 */
export function getSheetData(options = {}) {
  let { order = getSheetIndex(Store.currentSheetIndex) } = { ...options };

  let file = Store.MBLsheetfile[order];

  if (file == null) {
    return tooltip.info("The order parameter is invalid.", "");
  }

  let data = $.extend(true, [], file.data);

  if (data == null || data.length == 0) {
    data = $.extend(true, [], sheetmanage.buildGridData(file));
  }

  return data;
}

/**
 * 快捷返回指定工作表的config配置
 * @param {Object} options 可选参数
 * @param {Number} options.order 工作表下标；默认值为当前工作表下标
 */
export function getConfig(options = {}) {
  let { order = getSheetIndex(Store.currentSheetIndex) } = { ...options };

  let file = Store.MBLsheetfile[order];

  if (file == null) {
    return tooltip.info("The order parameter is invalid.", "");
  }

  let config = $.extend(true, {}, file.config);

  return config;
}

/**
 * 快捷设置指定工作表config配置
 * @param {Object} options 可选参数
 * @param {Number} options.order 工作表下标；默认值为当前工作表下标
 * @param {Function} options.success 操作结束的回调函数
 */
export function setConfig(cfg, options = {}) {
  if (getObjType(cfg) != "object") {
    return tooltip.info("The cfg parameter is invalid.", "");
  }

  let { order = getSheetIndex(Store.currentSheetIndex), success } = {
    ...options,
  };

  let file = Store.MBLsheetfile[order];

  if (file == null) {
    return tooltip.info("The order parameter is invalid.", "");
  }

  file.config = cfg;

  if (file.index == Store.currentSheetIndex) {
    Store.config = cfg;

    if (
      "rowhidden" in cfg ||
      "colhidden" in cfg ||
      "rowlen" in cfg ||
      "columnlen" in cfg
    ) {
      jfrefreshgrid_rhcw(Store.flowdata.length, Store.flowdata[0].length);
    }

    setTimeout(function () {
      MBLsheetrefreshgrid();
    }, 1);
  }

  if (success && typeof success === "function") {
    success();
  }
}

/**
 * 返回所有表格数据结构的一维数组MBLsheetfile
 */
export function getMBLsheetfile() {
  return get_MBLsheetfile();
}

/**
 * 指定工作表范围设置数据验证功能，并设置参数
 * @param {Object} optionItem 数据验证的配置信息
 * @param {String} optionItem.type 类型
 * @param {String | Null} optionItem.type2 条件类型
 * @param {String | Number} optionItem.value1 条件值1
 * @param {String | Number} optionItem.value2 条件值2
 * @param {Boolean} optionItem.checked 选中状态
 * @param {Boolean} optionItem.remote 自动远程获取选项
 * @param {Boolean} optionItem.prohibitInput 输入数据无效时禁止输入
 * @param {Boolean} optionItem.hintShow 选中单元格时显示提示语
 * @param {String} optionItem.hintText 提示语文本
 * @param {Object} options 可选参数
 * @param {Array | Object | String} options.range 选区范围；默认为当前选区
 * @param {Number} options.order 工作表下标；默认值为当前工作表下标
 * @param {Function} options.success 操作结束的回调函数
 */
export function setDataVerification(optionItem, options = {}) {
  if (getObjType(optionItem) != "object") {
    return tooltip.info("The optionItem parameter is invalid.", "");
  }

  let {
    type,
    type2 = null,
    value1 = "",
    value2 = "",
    remote = false,
    prohibitInput = false,
    hintShow = false,
    hintText = "",
    checked = false,
  } = { ...optionItem };

  let typeValues = [
    "dropdown",
    "checkbox",
    "number",
    "number_integer",
    "number_decimal",
    "text_content",
    "text_length",
    "date",
    "validity",
  ];
  let type2Values_1 = ["bw", "nb", "eq", "ne", "gt", "lt", "gte", "lte"];
  let type2Values_2 = ["include", "exclude", "equal"];
  let type2Values_3 = ["bw", "nb", "eq", "ne", "bf", "nbf", "af", "naf"];
  let type2Values_4 = ["card", "phone"];

  if (!typeValues.includes(type)) {
    return tooltip.info("The optionItem.type parameter is invalid.", "");
  }

  let dvText = locale().dataVerification;

  if (type == "dropdown") {
    if (value1.length == 0) {
      tooltip.info(
        '<i class="fa fa-exclamation-triangle"></i>',
        dvText.tooltipInfo1
      );
      return;
    }
  } else if (type == "checkbox") {
    if (value1.length == 0 || value2.length == 0) {
      tooltip.info(
        '<i class="fa fa-exclamation-triangle"></i>',
        dvText.tooltipInfo2
      );
      return;
    }
  } else if (
    type == "number" ||
    type == "number_integer" ||
    type == "number_decimal"
  ) {
    if (!type2Values_1.includes(type2)) {
      return tooltip.info("The optionItem.type2 parameter is invalid.", "");
    }

    if (!isRealNum(value1)) {
      tooltip.info(
        '<i class="fa fa-exclamation-triangle"></i>',
        dvText.tooltipInfo3
      );
      return;
    }

    if (type2 == "bw" || type2 == "nb") {
      if (!isRealNum(value2)) {
        tooltip.info(
          '<i class="fa fa-exclamation-triangle"></i>',
          dvText.tooltipInfo3
        );
        return;
      }

      if (Number(value2) < Number(value1)) {
        tooltip.info(
          '<i class="fa fa-exclamation-triangle"></i>',
          dvText.tooltipInfo4
        );
        return;
      }
    }
  } else if (type == "text_content") {
    if (!type2Values_2.includes(type2)) {
      return tooltip.info("The optionItem.type2 parameter is invalid.", "");
    }

    if (value1.length == 0) {
      tooltip.info(
        '<i class="fa fa-exclamation-triangle"></i>',
        dvText.tooltipInfo5
      );
      return;
    }
  } else if (type == "text_length") {
    if (!type2Values_1.includes(type2)) {
      return tooltip.info("The optionItem.type2 parameter is invalid.", "");
    }

    if (!isRealNum(value1)) {
      tooltip.info(
        '<i class="fa fa-exclamation-triangle"></i>',
        dvText.tooltipInfo3
      );
      return;
    }

    if (type2 == "bw" || type2 == "nb") {
      if (!isRealNum(value2)) {
        tooltip.info(
          '<i class="fa fa-exclamation-triangle"></i>',
          dvText.tooltipInfo3
        );
        return;
      }

      if (Number(value2) < Number(value1)) {
        tooltip.info(
          '<i class="fa fa-exclamation-triangle"></i>',
          dvText.tooltipInfo4
        );
        return;
      }
    }
  } else if (type == "date") {
    if (!type2Values_3.includes(type2)) {
      return tooltip.info("The optionItem.type2 parameter is invalid.", "");
    }

    if (!isdatetime(value1)) {
      tooltip.info(
        '<i class="fa fa-exclamation-triangle"></i>',
        dvText.tooltipInfo6
      );
      return;
    }

    if (type2 == "bw" || type2 == "nb") {
      if (!isdatetime(value2)) {
        tooltip.info(
          '<i class="fa fa-exclamation-triangle"></i>',
          dvText.tooltipInfo6
        );
        return;
      }

      if (diff(value1, value2) > 0) {
        tooltip.info(
          '<i class="fa fa-exclamation-triangle"></i>',
          dvText.tooltipInfo7
        );
        return;
      }
    }
  } else if (type == "validity") {
    if (!type2Values_4.includes(type2)) {
      return tooltip.info("The optionItem.type2 parameter is invalid.", "");
    }
  }

  if (getObjType(remote) != "boolean") {
    return tooltip.info("The optionItem.remote parameter is invalid.", "");
  }

  if (getObjType(prohibitInput) != "boolean") {
    return tooltip.info(
      "The optionItem.prohibitInput parameter is invalid.",
      ""
    );
  }

  if (getObjType(hintShow) != "boolean") {
    return tooltip.info("The optionItem.hintShow parameter is invalid.", "");
  }

  let {
    range = Store.MBLsheet_select_save[Store.MBLsheet_select_save.length - 1],
    order = getSheetIndex(Store.currentSheetIndex),
    success,
  } = { ...options };

  if (getObjType(range) == "string") {
    if (!formula.iscelldata(range)) {
      return tooltip.info("The range parameter is invalid.", "");
    }

    let cellrange = formula.getcellrange(range);
    range = {
      row: cellrange.row,
      column: cellrange.column,
    };
  }

  if (
    getObjType(range) != "object" ||
    range.row == null ||
    range.column == null
  ) {
    return tooltip.info("The range parameter is invalid.", "");
  }

  let file = Store.MBLsheetfile[order];

  if (file == null) {
    return tooltip.info("The order parameter is invalid.", "");
  }

  let item = {
    type: type,
    type2: type2,
    value1: value1,
    value2: value2,
    checked: checked,
    remote: remote,
    prohibitInput: prohibitInput,
    hintShow: hintShow,
    hintText: hintText,
  };

  let currentDataVerification = $.extend(true, {}, file.dataVerification);

  let data = $.extend(true, [], file.data);
  if (data.length == 0) {
    data = sheetmanage.buildGridData(file);
  }

  let str = range.row[0],
    edr = range.row[1],
    stc = range.column[0],
    edc = range.column[1];

  for (let r = str; r <= edr; r++) {
    for (let c = stc; c <= edc; c++) {
      currentDataVerification[r + "_" + c] = item;

      if (type == "checkbox") {
        item.checked
          ? setcellvalue(r, c, data, item.value1)
          : setcellvalue(r, c, data, item.value2);
      }
    }
  }

  if (file.index == Store.currentSheetIndex) {
    let historyDataVerification = $.extend(true, {}, file.dataVerification);

    if (type == "checkbox") {
      dataVerificationCtrl.refOfCheckbox(
        historyDataVerification,
        currentDataVerification,
        Store.currentSheetIndex,
        data,
        range
      );
    } else {
      dataVerificationCtrl.ref(
        historyDataVerification,
        currentDataVerification,
        Store.currentSheetIndex
      );
    }
  } else {
    file.dataVerification = currentDataVerification;
    file.data = data;
  }

  if (success && typeof success === "function") {
    success();
  }
}

/**
 * 指定工作表范围删除数据验证功能
 * @param {Object} options 可选参数
 * @param {Array | Object | String} options.range 选区范围；默认为当前选区
 * @param {Number} options.order 工作表下标；默认值为当前工作表下标
 * @param {Function} options.success 操作结束的回调函数
 */
export function deleteDataVerification(options = {}) {
  let {
    range = Store.MBLsheet_select_save[Store.MBLsheet_select_save.length - 1],
    order = getSheetIndex(Store.currentSheetIndex),
    success,
  } = { ...options };

  if (getObjType(range) == "string") {
    if (!formula.iscelldata(range)) {
      return tooltip.info("The range parameter is invalid.", "");
    }

    let cellrange = formula.getcellrange(range);
    range = {
      row: cellrange.row,
      column: cellrange.column,
    };
  }

  if (
    getObjType(range) != "object" ||
    range.row == null ||
    range.column == null
  ) {
    return tooltip.info("The range parameter is invalid.", "");
  }

  let file = Store.MBLsheetfile[order];

  if (file == null) {
    return tooltip.info("The order parameter is invalid.", "");
  }

  let currentDataVerification = $.extend(true, {}, file.dataVerification);

  let str = range.row[0],
    edr = range.row[1],
    stc = range.column[0],
    edc = range.column[1];

  for (let r = str; r <= edr; r++) {
    for (let c = stc; c <= edc; c++) {
      delete currentDataVerification[r + "_" + c];
    }
  }

  if (file.index == Store.currentSheetIndex) {
    let historyDataVerification = $.extend(true, {}, file.dataVerification);
    dataVerificationCtrl.ref(
      historyDataVerification,
      currentDataVerification,
      Store.currentSheetIndex
    );
  } else {
    file.dataVerification = currentDataVerification;
  }

  if (success && typeof success === "function") {
    success();
  }
}

/**
 * 在指定的工作表中指定单元格位置插入图片
 * @param {String} src 图片src
 * @param {Object} options 可选参数
 * @param {Number} options.order 工作表下标；默认值为当前工作表下标
 * @param {Number} options.rowIndex 要插入图片的单元格行下标；默认为0
 * @param {Number} options.colIndex 要插入图片的单元格列下标；默认为0
 * @param {Function} options.success 操作结束的回调函数
 */
export function insertImage(src, options = {}) {
  let {
    order = getSheetIndex(Store.currentSheetIndex),
    rowIndex,
    colIndex,
    success,
  } = { ...options };

  let file = Store.MBLsheetfile[order];

  if (file == null) {
    return tooltip.info("The order parameter is invalid.", "");
  }

  if (file.index == Store.currentSheetIndex) {
    let last =
      Store.MBLsheet_select_save[Store.MBLsheet_select_save.length - 1];

    if (rowIndex == null) {
      rowIndex = last.row_focus || 0;
    }

    if (rowIndex < 0) {
      rowIndex = 0;
    }

    if (rowIndex > Store.visibledatarow.length) {
      rowIndex = Store.visibledatarow.length;
    }

    if (colIndex == null) {
      colIndex = last.column_focus || 0;
    }

    if (colIndex < 0) {
      colIndex = 0;
    }

    if (colIndex > Store.visibledatacolumn.length) {
      colIndex = Store.visibledatacolumn.length;
    }

    let left = colIndex == 0 ? 0 : Store.visibledatacolumn[colIndex - 1];
    let top = rowIndex == 0 ? 0 : Store.visibledatarow[rowIndex - 1];

    let image = new Image();
    image.onload = function () {
      let width = image.width,
        height = image.height;

      let img = {
        src: src,
        left: left,
        top: top,
        originWidth: width,
        originHeight: height,
      };

      imageCtrl.addImgItem(img);

      if (success && typeof success === "function") {
        success();
      }
    };
    image.src = src;
  } else {
    let images = file.images || {};
    let config = file.config;
    let zoomRatio = file.zoomRatio || 1;

    let rowheight = file.row;
    let visibledatarow = file.visibledatarow || [];
    if (visibledatarow.length === 0) {
      let rh_height = 0;

      for (let r = 0; r < rowheight; r++) {
        let rowlen = Store.defaultrowlen;

        if (config["rowlen"] != null && config["rowlen"][r] != null) {
          rowlen = config["rowlen"][r];
        }

        if (config["rowhidden"] != null && config["rowhidden"][r] != null) {
          visibledatarow.push(rh_height);
          continue;
        }

        rh_height += Math.round((rowlen + 1) * zoomRatio);

        visibledatarow.push(rh_height); //行的临时长度分布
      }
    }

    let colwidth = file.column;
    let visibledatacolumn = file.visibledatacolumn || [];
    if (visibledatacolumn.length === 0) {
      let ch_width = 0;

      for (let c = 0; c < colwidth; c++) {
        let firstcolumnlen = Store.defaultcollen;

        if (config["columnlen"] != null && config["columnlen"][c] != null) {
          firstcolumnlen = config["columnlen"][c];
        }

        if (config["colhidden"] != null && config["colhidden"][c] != null) {
          visibledatacolumn.push(ch_width);
          continue;
        }

        ch_width += Math.round((firstcolumnlen + 1) * zoomRatio);

        visibledatacolumn.push(ch_width); //列的临时长度分布
      }
    }

    if (rowIndex == null) {
      rowIndex = 0;
    }

    if (rowIndex < 0) {
      rowIndex = 0;
    }

    if (rowIndex > visibledatarow.length) {
      rowIndex = visibledatarow.length;
    }

    if (colIndex == null) {
      colIndex = 0;
    }

    if (colIndex < 0) {
      colIndex = 0;
    }

    if (colIndex > visibledatacolumn.length) {
      colIndex = visibledatacolumn.length;
    }

    let left = colIndex == 0 ? 0 : visibledatacolumn[colIndex - 1];
    let top = rowIndex == 0 ? 0 : visibledatarow[rowIndex - 1];

    let image = new Image();
    image.onload = function () {
      let img = {
        src: src,
        left: left,
        top: top,
        originWidth: image.width,
        originHeight: image.height,
      };

      let width, height;
      let max = 400;

      if (img.originHeight < img.originWidth) {
        height = Math.round(img.originHeight * (max / img.originWidth));
        width = max;
      } else {
        width = Math.round(img.originWidth * (max / img.originHeight));
        height = max;
      }

      let imgItem = $.extend(true, {}, imageCtrl.imgItem);
      imgItem.src = img.src;
      imgItem.originWidth = img.originWidth;
      imgItem.originHeight = img.originHeight;
      imgItem.default.width = width;
      imgItem.default.height = height;
      imgItem.default.left = img.left;
      imgItem.default.top = img.top;
      imgItem.crop.width = width;
      imgItem.crop.height = height;

      let id = imageCtrl.generateRandomId();
      images[id] = imgItem;

      file.images = images;

      if (success && typeof success === "function") {
        success();
      }
    };
    image.src = src;
  }
}

/**
 * 删除指定工作表中的图片
 * @param {Object} options 可选参数
 * @param {Number} options.order 工作表下标；默认值为当前工作表下标
 * @param {String | Array} options.idList 要删除图片的id集合，也可为字符串`"all"`，all为所有的字符串；默认为`"all"`
 * @param {Function} options.success 操作结束的回调函数
 */
export function deleteImage(options = {}) {
  let {
    order = getSheetIndex(Store.currentSheetIndex),
    idList = "all",
    success,
  } = { ...options };

  let file = Store.MBLsheetfile[order];

  if (file == null) {
    return tooltip.info("The order parameter is invalid.", "");
  }

  let images = file.images;

  if (images == null) {
    return tooltip.info("The worksheet has no pictures to delete.", "");
  }

  if (idList != "all" && getObjType(idList) != "array") {
    return tooltip.info("The idList parameter is invalid.", "");
  }

  if (getObjType(idList) == "array") {
    idList.forEach((item) => {
      delete images[item];
    });
  } else {
    images = null;
  }

  file.images = images;

  if (file.index == Store.currentSheetIndex) {
    if (
      imageCtrl.currentImgId != null &&
      (idList == "all" || idList.includes(imageCtrl.currentImgId))
    ) {
      $("#MBLsheet-modal-dialog-activeImage").hide();
      $("#MBLsheet-modal-dialog-cropping").hide();
      $("#MBLsheet-modal-dialog-slider-imageCtrl").hide();
    }

    imageCtrl.images = images;
    imageCtrl.allImagesShow();
    imageCtrl.init();
  }

  if (success && typeof success === "function") {
    success();
  }
}

/**
 * 获取指定工作表的图片配置
 * @param {Object} options 可选参数
 * @param {Number} options.order 工作表下标；默认值为当前工作表下标
 * @param {Function} options.success 操作结束的回调函数
 */
export function getImageOption(options = {}) {
  let { order = getSheetIndex(Store.currentSheetIndex), success } = {
    ...options,
  };

  let file = Store.MBLsheetfile[order];

  if (file == null) {
    return tooltip.info("The order parameter is invalid.", "");
  }

  setTimeout(function () {
    if (success && typeof success === "function") {
      success();
    }
  }, 1);

  return file.images;
}

/**
 * data => celldata ，data二维数组数据转化成 {r, c, v}格式一维数组
 *
 * @param {Array} data 二维数组数据
 * @param {Object} options 可选参数
 * @param {Function} options.success 操作结束的回调函数
 */
export function transToCellData(data, options = {}) {
  console.log(
    "%c Line:6827 🥒 data",
    "color:#33a5ff",
    JSON.parse(JSON.stringify(data))
  );
  let { success } = { ...options };

  setTimeout(() => {
    if (success && typeof success === "function") {
      success();
    }
  }, 0);

  return sheetmanage.getGridData(data);
}

/**
 * data => celldata ，data二维数组数据转化成 {r, c, v}格式一维数组
 *
 * @param {Array} data 二维数组数据
 * @param {Object} options 可选参数
 * @param {Function} options.success 操作结束的回调函数
 */
export function transToCellDataV2(data, options = {}) {
  let { success } = { ...options };

  setTimeout(() => {
    if (success && typeof success === "function") {
      success();
    }
  }, 0);

  data?.forEach((item) => {
    item.forEach((it) => {
      if (!it?.ct) {
        it.ct = { fa: "@", t: "s" };
      }
    });
  });

  return sheetmanage.getGridData(data);
}

/**
 * celldata => data ，celldata一维数组数据转化成表格所需二维数组
 *
 * @param {Array} celldata 二维数组数据
 * @param {Object} options 可选参数
 * @param {Function} options.success 操作结束的回调函数
 */
export function transToData(celldata, options = {}) {
  let { success } = { ...options };

  setTimeout(() => {
    if (success && typeof success === "function") {
      success();
    }
  }, 0);

  return sheetmanage.buildGridData({
    celldata: celldata,
  });
}

/**
 * 导出的json字符串可以直接当作`MBLsheet.create(options)`初始化工作簿时的参数`options`使用
 *
 */
export function toJson() {
  const toJsonOptions = Store.toJsonOptions;

  // Workbook name
  toJsonOptions.title = $("#MBLsheet_info_detail_input").val();

  toJsonOptions.data = getAllSheets();

  // row and column
  get_MBLsheetfile().forEach((file, index) => {
    if (file.data == undefined) {
      return;
    }
    toJsonOptions.data[index].row =
      getObjType(file.data) === "array" ? file.data.length : 0;
    toJsonOptions.data[index].column =
      getObjType(file.data[0]) === "array" ? file.data[0].length : 0;
  });

  return toJsonOptions;
}

/**
 * 传入目标语言，切换到对应的语言界面
 * @param {String} lang 可选参数；暂支持`"zh"`、`"en"`、`"es"`；默认为`"zh"`；
 */
export function changLang(lang = "zh") {
  if (!["zh", "en", "es"].includes(lang)) {
    return tooltip.info("The lang parameter is invalid.", "");
  }

  let options = toJson();
  options.lang = lang;
  MBLsheet.create(options);
}

/**
 * 关闭websocket连接
 */
export function closeWebsocket() {
  if (server.websocket == null) {
    return;
  }
  server.websocket.close(1000);
}

/**
 * 根据范围字符串转换为range数组
 * @param {String} txt 范围字符串
 */
export function getRangeByTxt(txt) {
  // 默认取当前第一个范围
  if (txt == null) {
    return {
      column:
        Store.MBLsheet_select_save[Store.MBLsheet_select_save.length - 1]
          .column,
      row: Store.MBLsheet_select_save[Store.MBLsheet_select_save.length - 1]
        .row,
    };
  }

  const range = conditionformat.getRangeByTxt(txt);

  return {
    column: range[0].column,
    row: range[0].row,
  };
}

/**
 * 根据范围数组转换为范围字符串
 * @param {Object | Array} range 范围数组
 */
export function getTxtByRange(range = Store.MBLsheet_select_save) {
  // 单个范围
  if (getObjType(range) === "object") {
    range = [range];
  }
  return conditionformat.getTxtByRange(range);
}

/**
 * 初始化分页器
 * @param {Object} config 分页器配置
 * @param {Number} config.pageIndex 当前的页码
 * @param {Number} config.pageSize 每页显示多少条数据
 * @param {Array} config.selectOption 选择每页的条数
 * @param {Number} config.total 总条数
 */
export function pagerInit(config) {
  const { prevPage, nextPage, total } = locale().button;
  $("#MBLsheet-bottom-pager").remove();
  $("#MBLsheet-sheet-content").after(
    '<div id="MBLsheet-bottom-pager" style="font-size: 14px; margin-left: 10px; display: inline-block;"></div>'
  );
  $("#MBLsheet-bottom-pager").sPage({
    page: config.pageIndex, //当前页码，必填
    total: config.total, //数据总条数，必填
    selectOption: config.selectOption, // 选择每页的行数，
    pageSize: config.pageSize, //每页显示多少条数据，默认10条
    showTotal: config.showTotal, // 是否显示总数，默认关闭：false
    showSkip: config.showSkip, //是否显示跳页，默认关闭：false
    showPN: config.showPN, //是否显示上下翻页，默认开启：true
    prevPage: config.prevPage || prevPage, //上翻页文字描述，默认"上一页"
    nextPage: config.nextPage || nextPage, //下翻页文字描述，默认"下一页"
    totalTxt: config.totalTxt || total + config.total, // 数据总条数文字描述，{total}为占位符，默认"总共：{total}"
    backFun: function (page) {
      page.pageIndex = page.page;
      if (!method.createHookFunction("onTogglePager", page)) {
        return;
      }
    },
  });
}

/**
 * 刷新公式
 * @param {Function} success 回调函数
 */
export function refreshFormula(success) {
  formula.execFunctionGroupForce(true);
  MBLsheetrefreshgrid();
  setTimeout(() => {
    if (success && typeof success === "function") {
      success();
    }
  });
}

/**
 * 更新sheet数据
 * @param {Array} data 工作簿配置，可以包含多个表
 * @param {Object} options 可选参数
 * @param {Function} options.success 操作结束的回调函数
 *
 */
export function updataSheet(options = {}) {
  let { data, success } = options;
  let files = Store.MBLsheetfile;
  for (let i = 0; i < data.length; i++) {
    for (let j = 0; j < files.length; j++) {
      if (files[j].index === data[i].index) {
        files[j] = data[i];
      }
    }
  }
  let file = files[sheetmanage.getSheetIndex(Store.currentSheetIndex)],
    sheetData = sheetmanage.buildGridData(file);
  file.data = sheetData;

  if (!!file.isPivotTable) {
    Store.MBLsheetcurrentisPivotTable = true;
    if (!isPivotInitial) {
      pivotTable.changePivotTable(index);
    }
  } else {
    Store.MBLsheetcurrentisPivotTable = false;
    $("#MBLsheet-modal-dialog-slider-pivot").hide();
    MBLsheetsizeauto(false);
  }
  sheetmanage.mergeCalculation(file["index"]);
  sheetmanage.setSheetParam();
  setTimeout(function () {
    sheetmanage.showSheet();
    sheetmanage.restoreCache();
    formula.execFunctionGroupForce(MBLsheetConfigsetting.forceCalculation);
    sheetmanage.restoreSheetAll(Store.currentSheetIndex);
    MBLsheetrefreshgrid();
    if (success && typeof success === "function") {
      success();
    }
  }, 1);
  server.saveParam("shs", null, Store.currentSheetIndex);
}

/**
 * 刷新状态栏的状态
 * @param {Array}  data             操作数据
 * @param {Number} r                指定的行
 * @param {Number} c                指定的列
 * @param {Function} success        回调函数
 */
export function refreshMenuButtonFocus(data, r, c, success) {
  data = data || Store.flowdata;
  if (r == null && c == null) {
    /* 获取选取范围 */
    let last =
      Store.MBLsheet_select_save[Store.MBLsheet_select_save.length - 1];

    r = last.row_focus || last.row[0];
    c = last.column_focus || last.column[0];
  }

  menuButton.menuButtonFocus(data, r, c);

  setTimeout(() => {
    if (success && typeof success === "function") {
      success();
    }
  });
}

/**
 * 检查选区内所有cell指定类型的状态是否满足条件（主要是粗体、斜体、删除线和下划线等等）
 * @param {String}  type            类型
 * @param {String}  status          目标状态值
 */
export function checkTheStatusOfTheSelectedCells(type, status) {
  /* 获取选区内所有的单元格-扁平后的处理 */
  let cells = getRangeWithFlatten();

  let flag = cells.every(({ r, c }) => {
    let cell = Store.flowdata[r][c];
    if (cell == null) {
      return false;
    }
    return cell[type] == status;
  });

  return flag;
}
