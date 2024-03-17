import defaultSetting from "./config.js";
import { common_extend } from "./utils/util";
import Store from "./store";
import { locales } from "./locale/locale";
import server from "./controllers/server";
import MBLsheetConfigsetting from "./controllers/MBLsheetConfigsetting";
import sheetmanage from "./controllers/sheetmanage";
import MBLsheetsizeauto from "./controllers/resize";
import MBLsheetHandler from "./controllers/handler";
import { initialFilterHandler } from "./controllers/filter";
import { initialMatrixOperation } from "./controllers/matrixOperation";
import { initialSheetBar } from "./controllers/sheetBar";
import { formulaBarInitial } from "./controllers/formulaBar";
import { rowColumnOperationInitial } from "./controllers/rowColumnOperation";
import { keyboardInitial } from "./controllers/keyboard";
import { orderByInitial } from "./controllers/orderBy";
import { initPlugins } from "./controllers/expendPlugins";
import {
  get_MBLsheetfile,
  getMBLsheet_select_save,
  getconfig,
} from "./methods/get";
import { setMBLsheet_select_save } from "./methods/set";
import { MBLsheetrefreshgrid, jfrefreshgrid } from "./global/refresh";
import functionlist from "./function/functionlist";
import { MBLsheetlodingHTML } from "./controllers/constant";
import { getcellvalue, getdatabyselection } from "./global/getdata";
import { setcellvalue } from "./global/setdata";
import { selectHightlightShow } from "./controllers/select";
import { zoomInitial } from "./controllers/zoom";
import { printInitial } from "./controllers/print";
import method from "./global/method";

import * as api from "./global/api";

import flatpickr from "flatpickr";
import Mandarin from "flatpickr/dist/l10n/zh.js";
import { initListener } from "./controllers/listener";
import { hideloading, showloading } from "./global/loading.js";
import { MBLsheetextendData } from "./global/extend.js";

let MBLsheet = {};

// mount api
// MBLsheet.api = api;
// Object.assign(MBLsheet, api);

MBLsheet = common_extend(api, MBLsheet);

//创建MBLsheet表格
MBLsheet.create = function (setting) {
  method.destroy();
  // Store original parameters for api: toJson
  Store.toJsonOptions = {};
  for (let c in setting) {
    if (c !== "data") {
      Store.toJsonOptions[c] = setting[c];
    }
  }

  let extendsetting = common_extend(defaultSetting, setting);
  console.log("%c Line:62 🌶 extendsetting", "color:#e41a6a", extendsetting);

  let loadurl = extendsetting.loadUrl,
    menu = extendsetting.menu,
    title = extendsetting.title;

  let container = extendsetting.container;

  Store.container = container;
  Store.MBLsheetfile = extendsetting.data;
  Store.defaultcolumnNum = extendsetting.column;
  Store.defaultrowNum = extendsetting.row;
  Store.columnHeaderArr = extendsetting.data[0]?.columnHeaderArr;
  Store.defaultFontSize = extendsetting.defaultFontSize;
  Store.fullscreenmode = extendsetting.fullscreenmode;
  Store.lang = extendsetting.lang; //language
  Store.allowEdit = extendsetting.allowEdit;
  Store.limitSheetNameLength = extendsetting.limitSheetNameLength;
  Store.defaultSheetNameMaxLength = extendsetting.defaultSheetNameMaxLength;
  Store.fontList = extendsetting.fontList;
  server.gridKey = extendsetting.gridKey;
  server.loadUrl = extendsetting.loadUrl;
  server.updateUrl = extendsetting.updateUrl;
  server.updateImageUrl = extendsetting.updateImageUrl;
  server.title = extendsetting.title;
  server.loadSheetUrl = extendsetting.loadSheetUrl;
  server.allowUpdate = extendsetting.allowUpdate;

  MBLsheetConfigsetting.autoFormatw = extendsetting.autoFormatw;
  MBLsheetConfigsetting.accuracy = extendsetting.accuracy;
  MBLsheetConfigsetting.total = extendsetting.data[0].total;

  MBLsheetConfigsetting.loading = extendsetting.loading;
  MBLsheetConfigsetting.allowCopy = extendsetting.allowCopy;
  MBLsheetConfigsetting.showtoolbar = extendsetting.showtoolbar;
  MBLsheetConfigsetting.showtoolbarConfig = extendsetting.showtoolbarConfig;
  MBLsheetConfigsetting.showinfobar = extendsetting.showinfobar;
  MBLsheetConfigsetting.showsheetbar = extendsetting.showsheetbar;
  MBLsheetConfigsetting.showsheetbarConfig = extendsetting.showsheetbarConfig;
  MBLsheetConfigsetting.showstatisticBar = extendsetting.showstatisticBar;
  MBLsheetConfigsetting.showstatisticBarConfig =
    extendsetting.showstatisticBarConfig;
  MBLsheetConfigsetting.sheetFormulaBar = extendsetting.sheetFormulaBar;
  MBLsheetConfigsetting.cellRightClickConfig =
    extendsetting.cellRightClickConfig;
  MBLsheetConfigsetting.sheetRightClickConfig =
    extendsetting.sheetRightClickConfig;
  MBLsheetConfigsetting.pointEdit = extendsetting.pointEdit;
  MBLsheetConfigsetting.pointEditUpdate = extendsetting.pointEditUpdate;
  MBLsheetConfigsetting.pointEditZoom = extendsetting.pointEditZoom;

  MBLsheetConfigsetting.userInfo = extendsetting.userInfo;
  MBLsheetConfigsetting.userMenuItem = extendsetting.userMenuItem;
  MBLsheetConfigsetting.myFolderUrl = extendsetting.myFolderUrl;
  MBLsheetConfigsetting.functionButton = extendsetting.functionButton;

  MBLsheetConfigsetting.showConfigWindowResize =
    extendsetting.showConfigWindowResize;
  MBLsheetConfigsetting.enableAddRow = extendsetting.enableAddRow;
  MBLsheetConfigsetting.enableAddBackTop = extendsetting.enableAddBackTop;
  MBLsheetConfigsetting.addRowCount = extendsetting.addRowCount;
  MBLsheetConfigsetting.enablePage = extendsetting.enablePage;
  MBLsheetConfigsetting.pageInfo = extendsetting.pageInfo;

  MBLsheetConfigsetting.editMode = extendsetting.editMode;
  MBLsheetConfigsetting.beforeCreateDom = extendsetting.beforeCreateDom;
  MBLsheetConfigsetting.workbookCreateBefore =
    extendsetting.workbookCreateBefore;
  MBLsheetConfigsetting.workbookCreateAfter = extendsetting.workbookCreateAfter;
  MBLsheetConfigsetting.remoteFunction = extendsetting.remoteFunction;
  MBLsheetConfigsetting.customFunctions = extendsetting.customFunctions;

  MBLsheetConfigsetting.fireMousedown = extendsetting.fireMousedown;
  MBLsheetConfigsetting.forceCalculation = extendsetting.forceCalculation;
  MBLsheetConfigsetting.plugins = extendsetting.plugins;

  MBLsheetConfigsetting.rowHeaderWidth = extendsetting.rowHeaderWidth;
  MBLsheetConfigsetting.columnHeaderHeight = extendsetting.columnHeaderHeight;

  MBLsheetConfigsetting.defaultColWidth = extendsetting.defaultColWidth;
  MBLsheetConfigsetting.defaultRowHeight = extendsetting.defaultRowHeight;

  MBLsheetConfigsetting.title = extendsetting.title;
  MBLsheetConfigsetting.container = extendsetting.container;
  MBLsheetConfigsetting.hook = extendsetting.hook;

  MBLsheetConfigsetting.pager = extendsetting.pager;

  MBLsheetConfigsetting.initShowsheetbarConfig = false;

  MBLsheetConfigsetting.imageUpdateMethodConfig =
    extendsetting.imageUpdateMethodConfig;

  MBLsheetConfigsetting.showinfobar = false;
  MBLsheetConfigsetting.showtoolbar = false;

  if (Store.lang === "zh") flatpickr.localize(Mandarin.zh);

  // Store the currently used plugins for monitoring asynchronous loading
  Store.asyncLoad.push(...MBLsheetConfigsetting.plugins);

  // Register plugins
  initPlugins(extendsetting.plugins, extendsetting.data);

  // Store formula information, including internationalization
  // functionlist(extendsetting.customFunctions);

  let devicePixelRatio = extendsetting.devicePixelRatio;
  if (devicePixelRatio == null) {
    devicePixelRatio = 1;
  }
  Store.devicePixelRatio = Math.ceil(devicePixelRatio);

  //loading
  const loadingObj = MBLsheetlodingHTML("#" + container);
  Store.loadingObj = loadingObj;

  if (loadurl == "") {
    sheetmanage.initialjfFile(menu, title);
    // MBLsheetsizeauto();
    initialWorkBook();
  } else {
    $.post(loadurl, { gridKey: server.gridKey }, function (d) {
      let data = new Function("return " + d)();
      Store.MBLsheetfile = data;

      sheetmanage.initialjfFile(menu, title);
      // MBLsheetsizeauto();
      initialWorkBook();

      //需要更新数据给后台时，建立WebSocket连接
      if (server.allowUpdate) {
        server.openWebSocket();
      }
    });
  }
};

function initialWorkBook() {
  MBLsheetHandler(); //Overall dom initialization
  initialFilterHandler(); //Filter initialization
  initialMatrixOperation(); //Right click matrix initialization
  initialSheetBar(); //bottom sheet bar initialization
  formulaBarInitial(); //top formula bar initialization
  rowColumnOperationInitial(); //row and coloumn operate initialization
  keyboardInitial(); //Keyboard operate initialization
  orderByInitial(); //menu bar orderby function initialization
  zoomInitial(); //zoom method initialization
  printInitial(); //print initialization
  initListener();
}

//获取所有表格数据
MBLsheet.getMBLsheetfile = get_MBLsheetfile;

//获取当前表格 选区
MBLsheet.getMBLsheet_select_save = getMBLsheet_select_save;

//设置当前表格 选区
MBLsheet.setMBLsheet_select_save = setMBLsheet_select_save;

//获取当前表格 config配置
MBLsheet.getconfig = getconfig;

//二维数组数据 转化成 {r, c, v}格式 一维数组 (传入参数为二维数据data)
MBLsheet.getGridData = sheetmanage.getGridData;

//生成表格所需二维数组 （传入参数为表格数据对象file）
MBLsheet.buildGridData = sheetmanage.buildGridData;

// Refresh the canvas display data according to scrollHeight and scrollWidth
MBLsheet.MBLsheetrefreshgrid = MBLsheetrefreshgrid;

// Refresh canvas
MBLsheet.jfrefreshgrid = jfrefreshgrid;

// Get the value of the cell
MBLsheet.getcellvalue = getcellvalue;

// Set cell value
MBLsheet.setcellvalue = setcellvalue;

// Get selection range value
MBLsheet.getdatabyselection = getdatabyselection;

MBLsheet.sheetmanage = sheetmanage;

// Data of the current table
MBLsheet.flowdata = function () {
  return Store.flowdata;
};

// Set selection highlight
MBLsheet.selectHightlightShow = selectHightlightShow;

// Reset parameters after destroying the table
MBLsheet.destroy = method.destroy;

MBLsheet.showLoadingProgress = showloading;
MBLsheet.hideLoadingProgress = hideloading;
MBLsheet.MBLsheetextendData = MBLsheetextendData;

MBLsheet.locales = locales;

export { MBLsheet };
