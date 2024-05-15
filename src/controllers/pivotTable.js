import { getSheetIndex, getRangetxt } from "../methods/get";
import {
  replaceHtml,
  getObjType,
  ABCatNum,
  numFormat,
  numfloatlen,
  showrightclickmenu,
  mouseclickposition,
} from "../utils/util";
import {
  getdatabyselectionD,
  getcellvalue,
  datagridgrowth,
} from "../global/getdata";
import {
  isdatetime,
  diff,
  isdatatypemulti,
  isdatatype,
} from "../global/datecontroll";
import { genarate, update } from "../global/format";
import { isRealNull, isEditMode } from "../global/validate";
import { orderbydata1D } from "../global/sort";
import { jfrefreshgrid, jfrefreshgridall } from "../global/refresh";
import tooltip from "../global/tooltip";
import editor from "../global/editor";
import cleargridelement from "../global/cleargridelement";
import MBLsheetArray from "../global/array";
import analysis from "../global/analysis";
import { selectHightlightShow } from "./select";
import { MBLsheet_searcharray } from "./sheetSearch";
import {
  modelHTML,
  filtermenuHTML,
  filtersubmenuHTML,
  pivottableconfigHTML,
  pivottablesumHTML,
  MBLsheetPivotTableHTML,
} from "./constant";
import sheetmanage from "./sheetmanage";
import MBLsheetsizeauto from "./resize";
import server from "./server";
import { checkProtectionAuthorityNormal } from "./protection";
import Store from "../store";
import locale from "../locale/locale";
import numeral from "numeral";
import { MBLsheetlodingHTML } from "../controllers/constant";

const pivotTable = {
  pivotDatas: null,
  pivotSheetIndex: 0,
  pivotDataSheetIndex: 0,
  celldata: null,
  origindata: null,
  getCellData: function (cursheetindex, datasheetindex, data_select_save) {
    let _this = this;

    let sheetIndex;
    if (cursheetindex != null) {
      sheetIndex = cursheetindex;
    } else {
      sheetIndex = Store.currentSheetIndex;
    }

    let realIndex = getSheetIndex(sheetIndex);

    if (getObjType(Store.MBLsheetfile[realIndex].pivotTable) != "object") {
      Store.MBLsheetfile[realIndex].pivotTable = new Function(
        "return " + Store.MBLsheetfile[realIndex].pivotTable
      )();
    }

    if (Store.MBLsheetfile[realIndex].pivotTable != null) {
      _this.column = Store.MBLsheetfile[realIndex].pivotTable.column;
      _this.row = Store.MBLsheetfile[realIndex].pivotTable.row;
      _this.values = Store.MBLsheetfile[realIndex].pivotTable.values;
      _this.filter = Store.MBLsheetfile[realIndex].pivotTable.filter;
      _this.showType = Store.MBLsheetfile[realIndex].pivotTable.showType;

      _this.filterparm = Store.MBLsheetfile[realIndex].pivotTable.filterparm;

      if (Store.MBLsheetfile[realIndex].pivotTable.drawPivotTable != null) {
        _this.drawPivotTable =
          Store.MBLsheetfile[realIndex].pivotTable.drawPivotTable;
      } else {
        _this.drawPivotTable = true;
      }

      if (Store.MBLsheetfile[realIndex].pivotTable.pivotTableBoundary != null) {
        _this.pivotTableBoundary =
          Store.MBLsheetfile[realIndex].pivotTable.pivotTableBoundary;
      } else {
        _this.pivotTableBoundary = [12, 6];
      }

      if (data_select_save != null) {
        _this.pivot_select_save = data_select_save;
      } else {
        _this.pivot_select_save =
          Store.MBLsheetfile[realIndex].pivotTable.pivot_select_save;
      }

      if (datasheetindex != null) {
        _this.pivotDataSheetIndex = datasheetindex;
      } else {
        _this.pivotDataSheetIndex =
          Store.MBLsheetfile[realIndex].pivotTable.pivotDataSheetIndex;
      }
    } else {
      _this.column = null;
      _this.row = null;
      _this.values = null;
      _this.filter = null;
      _this.showType = null;

      _this.filterparm = null;

      _this.drawPivotTable = true;
      _this.pivotTableBoundary = [12, 6];

      if (data_select_save != null) {
        _this.pivot_select_save = data_select_save;
      } else {
        _this.pivot_select_save = Store.MBLsheet_select_save;
      }

      if (datasheetindex != null) {
        _this.pivotDataSheetIndex = datasheetindex;
      } else {
        _this.pivotDataSheetIndex = sheetIndex;
      }
    }

    let pivotrealIndex = getSheetIndex(_this.pivotDataSheetIndex);

    let otherfile = Store.MBLsheetfile[pivotrealIndex];
    if (otherfile["data"] == null) {
      otherfile["data"] = sheetmanage.buildGridData(otherfile);
    }
    _this.origindata = getdatabyselectionD(
      otherfile.data,
      _this.pivot_select_save
    );

    let rowhidden = {};
    if (_this.filterparm != null) {
      for (let f in _this.filterparm) {
        // 目的是取出rowhidden
        for (let h in _this.filterparm[f]) {
          if (h === "rowhidden" && _this.filterparm[f][h] != null) {
            rowhidden = $.extend(true, rowhidden, _this.filterparm[f][h]);
          }
        }
      }
    }
    _this.rowhidden = rowhidden;

    _this.pivotSheetIndex = sheetIndex;

    let newdata = [];
    for (let i = 0; i < _this.origindata.length; i++) {
      if (_this.rowhidden != null && _this.rowhidden[i] != null) {
        continue;
      }
      newdata.push([].concat(_this.origindata[i]));
    }
    _this.celldata = newdata;

    _this.pivot_data_type = {};
    for (let c = 0; c < _this.celldata[1].length; c++) {
      let type = isdatatype(_this.celldata[1][c]);
      _this.pivot_data_type[c.toString()] = type;
    }
  },
  pivot_data_type: {},
  pivot_select_save: null,
  column: null,
  row: null,
  values: null,
  filter: null,
  showType: null,
  rowhidden: null,
  selected: null,
  caljs: null,
  initial: true,
  filterparm: null,
  MBLsheet_pivotTable_select_state: false,
  jgridCurrentPivotInput: null,
  movestate: false,
  moveitemposition: [],
  movesave: {},
  showvaluecolrow: function () {
    let _this = this;

    if (
      $(
        "#MBLsheet-modal-dialog-config-value .MBLsheet-modal-dialog-slider-config-item"
      ).length >= 2
    ) {
      $("#MBLsheetpivottablevaluecolrowshow").show();

      if (_this.showType == "column") {
        $("#MBLsheetpivottablevaluecolrow").prop("checked", true);
        $(
          "#MBLsheetpivottablevaluecolrowshow label[for='MBLsheetpivottablevaluecolrow']"
        ).addClass("ui-state-active");

        $("#MBLsheetpivottablevaluecolrow1").prop("checked", false);
        $(
          "#MBLsheetpivottablevaluecolrowshow label[for='MBLsheetpivottablevaluecolrow1']"
        ).removeClass("ui-state-active");
      } else {
        $("#MBLsheetpivottablevaluecolrow1").prop("checked", true);
        $(
          "#MBLsheetpivottablevaluecolrowshow label[for='MBLsheetpivottablevaluecolrow1']"
        ).addClass("ui-state-active");

        $("#MBLsheetpivottablevaluecolrow").prop("checked", false);
        $(
          "#MBLsheetpivottablevaluecolrowshow label[for='MBLsheetpivottablevaluecolrow']"
        ).removeClass("ui-state-active");
      }
    } else {
      $("#MBLsheetpivottablevaluecolrowshow").hide();
    }
  },
  resetOrderby: function (obj) {
    let orderby = $(
      "#MBLsheet-modal-dialog-config-value .MBLsheet-modal-dialog-slider-config-item"
    ).index(obj);
    $("#MBLsheet-modal-dialog-config-row, #MBLsheet-modal-dialog-config-column")
      .find(".MBLsheet-modal-dialog-slider-config-item")
      .each(function () {
        if ($(this).data("orderby") == orderby) {
          $(this).data("orderby", "self");
        }
      });
  },
  MBLsheetsliderlistclearfilter: function ($filter) {
    let _this = this;

    let $t = $filter.parent();
    let cindex = $t.data("index");

    let rowhidden = {},
      selected = {},
      d = _this.origindata,
      filterdata = {};

    $t.data("rowhidden", "").find(".MBLsheet-slider-list-item-filtered").hide();
    _this.setDatatojsfile("selected", {}, cindex);
    _this.setDatatojsfile("rowhidden", null, cindex);

    let newdata = [];
    for (let i = 0; i < d.length; i++) {
      if (rowhidden[i] != null) {
        continue;
      }
      newdata.push([].concat(d[i]));
    }

    _this.celldata = newdata;
    _this.refreshPivotTable();
    $(
      "#MBLsheet-pivotTableFilter-menu, #MBLsheet-pivotTableFilter-submenu"
    ).hide();
  },
  MBLsheetsliderlistitemfilter: function ($filter) {
    let _this = this;

    const _locale = locale();
    const locale_filter = _locale.filter;

    let $t = $filter.parent(),
      toffset = $t.offset(),
      $menu = $("#MBLsheet-pivotTableFilter-menu"),
      winH = $(window).height(),
      winW = $(window).width();

    let cindex = $t.data("index");

    let rowhidden = $t.data("rowhidden");
    if (rowhidden == null || rowhidden == "") {
      rowhidden = {};
    } else if (getObjType(rowhidden) == "string") {
      rowhidden = JSON.parse(rowhidden);
    }

    $("body .MBLsheet-cols-menu").hide();
    $(
      "#MBLsheet-pivotTableFilter-menu, #MBLsheet-pivotTableFilter-submenu"
    ).hide();
    $("#MBLsheet-pivotTableFilter-byvalue-input").val("");
    $("#MBLsheet-pivotTableFilter-bycondition").next().hide();
    $("#MBLsheet-pivotTableFilter-byvalue").next().show();

    $menu.data("index", cindex);

    $(
      "#MBLsheet-pivotTableFilter-menu .MBLsheet-pivotTableFilter-selected-input"
    )
      .hide()
      .find("input")
      .val();
    $("#MBLsheet-pivotTableFilter-selected span")
      .data("type", "0")
      .data("type", null)
      .text(locale_filter.filiterInputNone);

    let byconditiontype = $t.data("byconditiontype");
    $("#MBLsheet-pivotTableFilter-selected span")
      .data("value", $t.data("byconditionvalue"))
      .data("type", byconditiontype)
      .text($t.data("byconditiontext"));

    if (byconditiontype == "2") {
      let $input = $(
        "#MBLsheet-pivotTableFilter-menu .MBLsheet-pivotTableFilter-selected-input2"
      )
        .show()
        .find("input");
      $input.eq(0).val($t.data("byconditionvalue1"));
      $input.eq(1).val($t.data("byconditionvalue2"));
    } else if (byconditiontype == "1") {
      $(
        "#MBLsheet-pivotTableFilter-menu .MBLsheet-pivotTableFilter-selected-input"
      )
        .eq(0)
        .show()
        .find("input")
        .val($t.data("byconditionvalue1"));
    }
    const loadingObj = MBLsheetlodingHTML(
      "#MBLsheet-pivotTableFilter-byvalue-select",
      { text: locale_filter.filiterMoreDataTip }
    );
    $("#MBLsheet-pivotTableFilter-byvalue-select")
      .empty()
      .append(loadingObj.el);

    let rowhiddenother = {}; //其它筛选列的隐藏行
    $(
      "#MBLsheet-modal-dialog-pivotTable-list .MBLsheet-modal-dialog-slider-list-item"
    )
      .not($t.get(0))
      .each(function () {
        let $t = $(this),
          rh = $t.data("rowhidden");

        if (rh == null || rh == "") {
          return true;
        }

        if (getObjType(rh) == "string") {
          rh = JSON.parse(rh);
        }

        for (let r in rh) {
          rowhiddenother[r] = 0;
        }
      });

    let data = _this.origindata;

    setTimeout(function () {
      //日期值
      let dvmap = {};
      let dvmap_uncheck = {};

      //除日期以外的值
      let vmap = {};
      let vmap_uncheck = {};

      for (let r = 1; r < data.length; r++) {
        if (r in rowhiddenother) {
          continue;
        }

        if (data[r] == null) {
          continue;
        }

        let cell = data[r][cindex];

        if (cell != null && cell.ct != null && cell.ct.t == "d") {
          //单元格是日期
          let v = update("YYYY-MM-DD", cell.v);

          let y = v.split("-")[0];
          let m = v.split("-")[1];
          let d = v.split("-")[2];

          if (!(y in dvmap)) {
            dvmap[y] = {};
          }

          if (!(m in dvmap[y])) {
            dvmap[y][m] = {};
          }

          if (!(d in dvmap[y][m])) {
            dvmap[y][m][d] = 0;
          }

          dvmap[y][m][d]++;

          if (r in rowhidden) {
            dvmap_uncheck[y] = 0;
            dvmap_uncheck[m] = 0;
            dvmap_uncheck[d] = 0;
          }
        } else {
          let v, m;
          if (cell == null || isRealNull(cell.v)) {
            v = null;
            m = null;
          } else {
            v = cell.v;
            m = cell.m;
          }

          if (!(v in vmap)) {
            vmap[v] = {};
          }

          if (!(m in vmap[v])) {
            vmap[v][m] = 0;
          }

          vmap[v][m]++;

          if (r in rowhidden) {
            vmap_uncheck[v + "#$$$#" + m] = 0;
          }
        }
      }

      //遍历数据加到页面
      let item = [];

      if (JSON.stringify(dvmap).length > 2) {
        for (let y in dvmap) {
          let ysum = 0;
          let monthHtml = "";

          for (let m in dvmap[y]) {
            let msum = 0;
            let dayHtml = "";

            for (let d in dvmap[y][m]) {
              let dayL = dvmap[y][m][d];
              msum += dayL;

              //月 小于 10
              let mT;
              if (Number(m) < 10) {
                mT = "0" + Number(m);
              } else {
                mT = m;
              }

              //日 小于 10
              let dT;
              if (Number(d) < 10) {
                dT = "0" + Number(d);
              } else {
                dT = d;
              }

              //日是否选中状态
              if (
                y in dvmap_uncheck &&
                m in dvmap_uncheck &&
                d in dvmap_uncheck
              ) {
                dayHtml +=
                  '<div class="day MBLsheet-mousedown-cancel cf" data-check="false" title="' +
                  y +
                  "-" +
                  mT +
                  "-" +
                  dT +
                  '">' +
                  '<input class="MBLsheet-mousedown-cancel" type="checkbox"/>' +
                  '<label class="MBLsheet-mousedown-cancel">' +
                  d +
                  "</label>" +
                  '<span class="count MBLsheet-mousedown-cancel">( ' +
                  dayL +
                  " )</span>" +
                  "</div>";
              } else {
                dayHtml +=
                  '<div class="day MBLsheet-mousedown-cancel cf" data-check="true" title="' +
                  y +
                  "-" +
                  mT +
                  "-" +
                  dT +
                  '">' +
                  '<input class="MBLsheet-mousedown-cancel" type="checkbox" checked="checked"/>' +
                  '<label class="MBLsheet-mousedown-cancel">' +
                  d +
                  "</label>" +
                  '<span class="count MBLsheet-mousedown-cancel">( ' +
                  dayL +
                  " )</span>" +
                  "</div>";
              }
            }

            ysum += msum;

            //月 小于 10
            let mT2;
            if (Number(m) < 10) {
              mT2 = "0" + Number(m);
            } else {
              mT2 = m;
            }

            //月是否选中状态
            if (y in dvmap_uncheck && m in dvmap_uncheck) {
              monthHtml +=
                '<div class="monthBox MBLsheet-mousedown-cancel">' +
                '<div class="month MBLsheet-mousedown-cancel cf" data-check="false" title="' +
                y +
                "-" +
                mT2 +
                '">' +
                '<i class="fa fa-caret-right MBLsheet-mousedown-cancel" aria-hidden="true"></i>' +
                '<input class="MBLsheet-mousedown-cancel" type="checkbox"/>' +
                '<label class="MBLsheet-mousedown-cancel">' +
                m +
                "" +
                locale_filter.filiterMonthText +
                "</label>" +
                '<span class="count MBLsheet-mousedown-cancel">( ' +
                msum +
                " )</span>" +
                "</div>" +
                '<div class="dayList MBLsheet-mousedown-cancel">' +
                dayHtml +
                "</div>" +
                "</div>";
            } else {
              monthHtml +=
                '<div class="monthBox MBLsheet-mousedown-cancel">' +
                '<div class="month MBLsheet-mousedown-cancel cf" data-check="true" title="' +
                y +
                "-" +
                mT2 +
                '">' +
                '<i class="fa fa-caret-right MBLsheet-mousedown-cancel" aria-hidden="true"></i>' +
                '<input class="MBLsheet-mousedown-cancel" type="checkbox" checked="checked"/>' +
                '<label class="MBLsheet-mousedown-cancel">' +
                m +
                "" +
                locale_filter.filiterMonthText +
                "</label>" +
                '<span class="count MBLsheet-mousedown-cancel">( ' +
                msum +
                " )</span>" +
                "</div>" +
                '<div class="dayList MBLsheet-mousedown-cancel">' +
                dayHtml +
                "</div>" +
                "</div>";
            }
          }

          //年是否选中状态
          let yearHtml;
          if (y in dvmap_uncheck) {
            yearHtml =
              '<div class="yearBox MBLsheet-mousedown-cancel">' +
              '<div class="year MBLsheet-mousedown-cancel cf" data-check="false" title="' +
              y +
              '">' +
              '<i class="fa fa-caret-right MBLsheet-mousedown-cancel" aria-hidden="true"></i>' +
              '<input class="MBLsheet-mousedown-cancel" type="checkbox"/>' +
              '<label class="MBLsheet-mousedown-cancel">' +
              y +
              "" +
              locale_filter.filiterYearText +
              "</label>" +
              '<span class="count MBLsheet-mousedown-cancel">( ' +
              ysum +
              " )</span>" +
              "</div>" +
              '<div class="monthList MBLsheet-mousedown-cancel">' +
              monthHtml +
              "</div>" +
              "</div>";
          } else {
            yearHtml =
              '<div class="yearBox MBLsheet-mousedown-cancel">' +
              '<div class="year MBLsheet-mousedown-cancel cf" data-check="true" title="' +
              y +
              '">' +
              '<i class="fa fa-caret-right MBLsheet-mousedown-cancel" aria-hidden="true"></i>' +
              '<input class="MBLsheet-mousedown-cancel" type="checkbox" checked="checked"/>' +
              '<label class="MBLsheet-mousedown-cancel">' +
              y +
              "" +
              locale_filter.filiterYearText +
              "</label>" +
              '<span class="count MBLsheet-mousedown-cancel">( ' +
              ysum +
              " )</span>" +
              "</div>" +
              '<div class="monthList MBLsheet-mousedown-cancel">' +
              monthHtml +
              "</div>" +
              "</div>";
          }

          item.unshift(yearHtml);
        }
      }

      if (JSON.stringify(vmap).length > 2) {
        let vmapKeys = Object.keys(vmap);
        vmapKeys = orderbydata1D(vmapKeys, true);

        for (let i = 0; i < vmapKeys.length; i++) {
          let v = vmapKeys[i];

          for (let x in vmap[v]) {
            let text;
            if (v + "#$$$#" + x == "null#$$$#null") {
              text = locale_filter.valueBlank;
            } else {
              text = x;
            }

            //是否选中状态
            let dataHtml;
            if (v + "#$$$#" + x in vmap_uncheck) {
              dataHtml =
                '<div class="textBox MBLsheet-mousedown-cancel cf" data-check="false" data-filter="' +
                (v + "#$$$#" + x) +
                '" title="' +
                x +
                '">' +
                '<input class="MBLsheet-mousedown-cancel" type="checkbox"/>' +
                '<label class="MBLsheet-mousedown-cancel">' +
                text +
                "</label>" +
                '<span class="MBLsheet-mousedown-cancel count">( ' +
                vmap[v][x] +
                " )</span>" +
                "</div>";
            } else {
              dataHtml =
                '<div class="textBox MBLsheet-mousedown-cancel cf" data-check="true" data-filter="' +
                (v + "#$$$#" + x) +
                '" title="' +
                x +
                '">' +
                '<input class="MBLsheet-mousedown-cancel" type="checkbox" checked="checked"/>' +
                '<label class="MBLsheet-mousedown-cancel">' +
                text +
                "</label>" +
                '<span class="MBLsheet-mousedown-cancel count">( ' +
                vmap[v][x] +
                " )</span>" +
                "</div>";
            }

            item.push(dataHtml);
          }
        }
      }

      // 适配小屏设备
      let containerH = winH - toffset.top - 350;
      if (containerH < 0) containerH = 100;
      //$("#MBLsheet-pivotTableFilter-byvalue-select").html("<div class='ListBox MBLsheet-mousedown-cancel' style='max-height:" + containerH + "px;overflow-y:auto;overflow-x:hidden;'>" + item.join("") + "</div>");

      $("#MBLsheet-pivotTableFilter-byvalue-select").append(
        "<div class='ListBox MBLsheet-mousedown-cancel' style='max-height:" +
          containerH +
          "px;overflow-y:auto;overflow-x:hidden;'>" +
          item.join("") +
          "</div>"
      );
      loadingObj.close();
    }, 1);

    showrightclickmenu($menu, toffset.left - 250, toffset.top);
  },
  getSumTypeName: function (type) {
    let name = "";

    const _locale = locale();
    const locale_pivotTable = _locale.pivotTable;

    if (type == "SUM") {
      name = locale_pivotTable.valueStatisticsSUM;
    } else if (type == "COUNT") {
      name = locale_pivotTable.valueStatisticsCOUNT;
    } else if (type == "COUNTA") {
      name = locale_pivotTable.valueStatisticsCOUNTA;
    } else if (type == "COUNTUNIQUE") {
      name = locale_pivotTable.valueStatisticsCOUNTUNIQUE;
    } else if (type == "AVERAGE") {
      name = locale_pivotTable.valueStatisticsAVERAGE;
    } else if (type == "MAX") {
      name = locale_pivotTable.valueStatisticsMAX;
    } else if (type == "MIN") {
      name = locale_pivotTable.valueStatisticsMIN;
    } else if (type == "MEDIAN") {
      name = locale_pivotTable.valueStatisticsMEDIAN;
    } else if (type == "PRODUCT") {
      name = locale_pivotTable.valueStatisticsPRODUCT;
    } else if (type == "STDEV") {
      name = locale_pivotTable.valueStatisticsSTDEV;
    } else if (type == "STDEVP") {
      name = locale_pivotTable.valueStatisticsSTDEVP;
    } else if (type == "let") {
      name = locale_pivotTable.valueStatisticslet;
    } else if (type == "VARP") {
      name = locale_pivotTable.valueStatisticsVARP;
    }

    return name;
  },
  setDatatojsfile: function (attr, value, cindex) {
    let _this = this;

    let index = getSheetIndex(_this.pivotSheetIndex);
    if (Store.MBLsheetfile[index]["pivotTable"] == null) {
      Store.MBLsheetfile[index]["pivotTable"] = {};
    }

    if (cindex == null) {
      Store.MBLsheetfile[index]["pivotTable"][attr] = value;
      _this[attr] = value;
    } else {
      if (Store.MBLsheetfile[index]["pivotTable"]["filterparm"] == null) {
        Store.MBLsheetfile[index]["pivotTable"]["filterparm"] = {};
      }

      if (
        Store.MBLsheetfile[index]["pivotTable"]["filterparm"][
          cindex.toString()
        ] == null
      ) {
        Store.MBLsheetfile[index]["pivotTable"]["filterparm"][
          cindex.toString()
        ] = {};
      }
      Store.MBLsheetfile[index]["pivotTable"]["filterparm"][cindex.toString()][
        attr
      ] = value;

      if (_this["filterparm"] == null) {
        _this["filterparm"] = {};
      }

      if (_this["filterparm"][cindex.toString()] == null) {
        _this["filterparm"][cindex.toString()] = {};
      }

      _this["filterparm"][cindex.toString()][attr] = value;
    }
  },
  createPivotTable: function (e) {
    if (isEditMode() || Store.allowEdit === false) {
      return;
    }
    let _this = this;

    let datasheetindex = Store.currentSheetIndex;

    const _locale = locale();
    const locale_pivotTable = _locale.pivotTable;

    if (isEditMode()) {
      alert(locale_pivotTable.errorNotAllowEdit);
      return;
    }

    if (Store.MBLsheet_select_save.length > 1) {
      tooltip.info("", locale_pivotTable.errorNotAllowMulti);
      return;
    }

    if (
      Store.MBLsheet_select_save.length == 0 ||
      Store.MBLsheet_select_save[0].row[0] ==
        Store.MBLsheet_select_save[0].row[1] ||
      Store.MBLsheet_select_save[0].column[0] ==
        Store.MBLsheet_select_save[0].column[1]
    ) {
      tooltip.info("", locale_pivotTable.errorSelectRange);
      return;
    }

    let select_save = $.extend(true, {}, Store.MBLsheet_select_save[0]);
    sheetmanage.addNewSheet(e, true);

    _this.getCellData(Store.currentSheetIndex, datasheetindex, select_save);

    _this.setDatatojsfile("pivot_select_save", select_save);
    _this.setDatatojsfile("pivotDataSheetIndex", datasheetindex);

    _this.initialPivotManage();
  },
  changePivotTable: function (index) {
    let _this = this;

    const _locale = locale();
    const locale_pivotTable = _locale.pivotTable;

    let pivotDataSheetIndex =
      Store.MBLsheetfile[getSheetIndex(index)].pivotTable.pivotDataSheetIndex;
    let real_pivotDataSheetIndex = getSheetIndex(pivotDataSheetIndex);

    if (real_pivotDataSheetIndex == null) {
      tooltip.info(locale_pivotTable.errorIsDamage, "");
      return;
    }

    _this.getCellData(index);
    _this.initialPivotManage(true);
    _this.refreshPivotTable(); //初始化在一个普通sheet页，从此普通sheet页切换到数据透视表页时，需要刷新下数据，否则还是旧数据
  },
  refreshPivotTable: function (isRefreshCanvas = true) {
    let _this = this;

    let redo = {};
    redo["pivotTable"] = pivotTable;
    redo["data"] = editor.deepCopyFlowData(Store.flowdata); //取数据

    _this.storePivotTableParam();
    let ret = _this.dataHandler(
      _this.column,
      _this.row,
      _this.values,
      _this.showType,
      _this.celldata
    );
    _this.setDatatojsfile("pivotDatas", ret);

    let d = $.extend(true, [], sheetmanage.nulldata);
    let data = d;

    let addr = 0,
      addc = 0;

    if (ret.length == 0) {
      _this.setDatatojsfile("drawPivotTable", true);
      _this.setDatatojsfile("pivotTableBoundary", [12, 6]);
    } else {
      _this.setDatatojsfile("drawPivotTable", false);
      _this.setDatatojsfile("pivotTableBoundary", [ret.length, ret[0].length]);

      let rlen = ret.length,
        clen = ret[0].length;

      addr = rlen - d.length;
      addc = clen - d[0].length;

      data = datagridgrowth(d, addr + 20, addc + 10, true);

      for (let r = 0; r < rlen; r++) {
        let x = [].concat(data[r]);
        for (let c = 0; c < clen; c++) {
          let value = "";
          if (ret[r] != null && ret[r][c] != null) {
            value = getcellvalue(r, c, ret);
          }
          x[c] = value;
        }
        data[r] = x;
      }
    }

    redo["type"] = "pivotTable_change";
    redo["curdata"] = $.extend(true, [], data);
    redo["sheetIndex"] = Store.currentSheetIndex;
    redo["pivotTablecur"] = _this.getPivotTableData();

    if (Store.clearjfundo) {
      Store.jfundo.length = 0;
      Store.jfredo.push(redo);
    }

    cleargridelement();
    Store.clearjfundo = false;

    if (addr > 0 || addc > 0) {
      jfrefreshgridall(
        data[0].length,
        data.length,
        data,
        null,
        Store.MBLsheet_select_save,
        "datachangeAll",
        undefined,
        undefined,
        isRefreshCanvas
      );
    } else {
      jfrefreshgrid(
        data,
        Store.MBLsheet_select_save,
        {},
        null,
        isRefreshCanvas
      );
      selectHightlightShow();
    }

    Store.clearjfundo = true;
  },
  drawPivotTable: true,
  pivotTableBoundary: [12, 6],
  pivotclick: function (row_index, col_index, index) {
    if (index == null) {
      index = Store.currentSheetIndex;
    }

    let file = Store.MBLsheetfile[getSheetIndex(index)];

    if (!file.isPivotTable) {
      return;
    }

    let pivotDataSheetIndex = file.pivotTable.pivotDataSheetIndex;
    let real_pivotDataSheetIndex = getSheetIndex(pivotDataSheetIndex);

    if (real_pivotDataSheetIndex == null) {
      return;
    }

    let slider = $("#MBLsheet-modal-dialog-slider-pivot");

    let isRangeClick = this.isPivotRange(row_index, col_index);
    if (isRangeClick && slider.is(":hidden")) {
      if (
        !checkProtectionAuthorityNormal(index, "usePivotTablereports", false)
      ) {
        // Store.MBLsheet_select_status = false;
        return;
      }
      slider.show();
      MBLsheetsizeauto();
      $("#MBLsheet-sta-content").css("padding-right", 260);
    } else if (!isRangeClick && slider.is(":visible")) {
      slider.hide();
      MBLsheetsizeauto();
      $("#MBLsheet-sta-content").css("padding-right", 10);
    }
  },
  isPivotRange: function (row_index, col_index) {
    let _this = this;

    if (!!Store.MBLsheetcurrentisPivotTable) {
      if (
        row_index < _this.pivotTableBoundary[0] &&
        col_index < _this.pivotTableBoundary[1]
      ) {
        return true;
      } else {
        return false;
      }
    }
  },
  storePivotTableParam: function () {
    let _this = this;
    let columnarr = [],
      rowarr = [],
      filterarr = [],
      valuesarr = [];

    $(
      "#MBLsheet-modal-dialog-config-filter .MBLsheet-modal-dialog-slider-config-item"
    ).each(function () {
      let item = {};
      item["index"] = $(this).data("index");
      item["name"] = $(this).data("name");
      item["fullname"] = $(this)
        .find(".MBLsheet-modal-dialog-slider-config-item-txt")
        .text();
      filterarr.push(item);
    });

    $(
      "#MBLsheet-modal-dialog-config-row .MBLsheet-modal-dialog-slider-config-item"
    ).each(function () {
      let item = {};
      item["index"] = $(this).data("index");
      item["name"] = $(this).data("name");
      item["fullname"] = $(this)
        .find(".MBLsheet-modal-dialog-slider-config-item-txt")
        .text();
      item["order"] = $(this).data("order");
      item["orderby"] = $(this).data("orderby");
      item["stastic"] = $(this).data("stastic");
      rowarr.push(item);
    });

    $(
      "#MBLsheet-modal-dialog-config-column .MBLsheet-modal-dialog-slider-config-item"
    ).each(function () {
      let item = {};
      item["index"] = $(this).data("index");
      item["name"] = $(this).data("name");
      item["fullname"] = $(this)
        .find(".MBLsheet-modal-dialog-slider-config-item-txt")
        .text();
      item["order"] = $(this).data("order");
      item["orderby"] = $(this).data("orderby");
      item["stastic"] = $(this).data("stastic");
      columnarr.push(item);
    });

    $(
      "#MBLsheet-modal-dialog-config-value .MBLsheet-modal-dialog-slider-config-item"
    ).each(function () {
      let item = {};
      item["index"] = $(this).data("index");
      item["name"] = $(this).data("name");
      item["fullname"] = $(this)
        .find(".MBLsheet-modal-dialog-slider-config-item-txt")
        .text();
      item["sumtype"] = $(this).data("sumtype");
      item["nameindex"] = $(this).data("nameindex");
      valuesarr.push(item);
    });

    _this.setDatatojsfile("column", columnarr);
    _this.setDatatojsfile("row", rowarr);
    _this.setDatatojsfile("filter", filterarr);
    _this.setDatatojsfile("values", valuesarr);
    let showtype = $(
      "#MBLsheetpivottablevaluecolrow:checked, #MBLsheetpivottablevaluecolrow1:checked"
    ).val();
    _this.setDatatojsfile("showType", showtype == "0" ? "row" : "column");

    let pivotTable = _this.getPivotTableData();
    delete pivotTable.pivotDatas;
    server.saveParam("all", _this.pivotSheetIndex, pivotTable, {
      k: "pivotTable",
    });
  },
  getPivotTableData: function (dataindex) {
    if (dataindex == null) {
      dataindex = this.pivotSheetIndex;
    }

    let index = getSheetIndex(dataindex);
    let pivotTable = Store.MBLsheetfile[index]["pivotTable"];

    if (getObjType(pivotTable) == "object") {
      pivotTable = $.extend(true, {}, Store.MBLsheetfile[index]["pivotTable"]);
    } else {
      pivotTable = new Function("return " + pivotTable)();
    }

    return pivotTable;
  },
  addValuesToTitle: function (titles, values) {
    let rowLen = titles.length * values.length,
      colLen = titles[0].length + 1;

    let retdata = [];
    if (titles.length == 0 && values.length > 0) {
      for (let v = 0; v < values.length; v++) {
        retdata.push(values[v].fullname);
      }

      return retdata;
    }

    if (values.length == 0 && titles.length > 0) {
      return titles;
    }

    for (let r = 0; r < rowLen; r++) {
      retdata[r] = new Array(colLen);

      for (let c = 0; c < colLen - 1; c++) {
        retdata[r][c] = titles[Math.floor(r / values.length)][c];
      }

      retdata[r][colLen - 1] = values[r % values.length].fullname;
    }

    return retdata;
  },
  initialPivotManage: function (restore) {
    let _this = this;
    const _locale = locale();
    const locale_pivotTable = _locale.pivotTable;
    const locale_button = _locale.button;
    const locale_filter = _locale.filter;

    if (_this.initial) {
      _this.initial = false;

      $("body").append(MBLsheetPivotTableHTML());
      $("#MBLsheet-modal-dialog-slider-close").click(function () {
        $("#MBLsheet-modal-dialog-slider-pivot").hide();
        MBLsheetsizeauto();
      });

      $("body").append(
        replaceHtml(modelHTML, {
          id: "MBLsheet-data-pivotTable-selection",
          addclass: "MBLsheet-data-pivotTable-selection",
          title: locale_pivotTable.titleSelectionDataRange,
          content:
            '<input id="MBLsheet-pivotTable-range-selection-input" class="MBLsheet-datavisual-range-container" style="font-size: 14px;padding:5px;max-width:none;" spellcheck="false" aria-label="' +
            locale_pivotTable.titleDataRange +
            '" placeholder="' +
            locale_pivotTable.titleDataRange +
            '">',
          botton:
            '<button id="MBLsheet-pivotTable-selection-confirm" class="btn btn-primary">' +
            locale_button.confirm +
            '</button><button class="btn btn-default MBLsheet-model-close-btn">' +
            locale_button.cancel +
            "</button>",
        })
      );

      $("body").append(
        replaceHtml(filtermenuHTML(), { menuid: "pivotTableFilter" })
      );
      $("body").append(
        replaceHtml(filtersubmenuHTML(), { menuid: "pivotTableFilter" })
      );
      $("body").append(pivottableconfigHTML());
      $("body").append(pivottablesumHTML());

      $("#MBLsheet-pivotTableFilter-orderby-asc").remove();
      $("#MBLsheet-pivotTableFilter-orderby-desc").next().remove();
      $("#MBLsheet-pivotTableFilter-orderby-desc").remove();
      $("#MBLsheet-pivotTableFilter-orderby-color").next().remove();
      $("#MBLsheet-pivotTableFilter-orderby-color").remove();

      $("#MBLsheetpivottablevaluecolrow, #MBLsheetpivottablevaluecolrow1")
        .checkboxradio({
          icon: false,
        })
        .change(function () {
          _this.refreshPivotTable();
        });

      let hidefilersubmenu = null;
      $("#MBLsheet-pivotTableFilter-menu").mouseover(function () {
        clearTimeout(hidefilersubmenu);
        hidefilersubmenu = setTimeout(function () {
          $("#MBLsheet-pivotTableFilter-submenu").hide();
        }, 500);
      });

      //点击复选框
      $(document)
        .off("click.ptFilterCheckbox1")
        .on(
          "click.ptFilterCheckbox1",
          "#MBLsheet-pivotTableFilter-byvalue-select .textBox",
          function () {
            if ($(this).attr("data-check") == "true") {
              $(this).attr("data-check", "false");
              $(this).find("input[type='checkbox']").removeAttr("checked");
            } else {
              $(this).attr("data-check", "true");
              $(this).find("input[type='checkbox']").prop("checked", true);
            }
          }
        );
      $(document)
        .off("click.ptFilterCheckbox2")
        .on(
          "click.ptFilterCheckbox2",
          "#MBLsheet-pivotTableFilter-byvalue-select .year",
          function () {
            if ($(this).attr("data-check") == "true") {
              $(this).attr("data-check", "false");
              $(this)
                .parents(".yearBox")
                .find(".month")
                .attr("data-check", "false");
              $(this)
                .parents(".yearBox")
                .find(".day")
                .attr("data-check", "false");
              $(this)
                .parents(".yearBox")
                .find("input[type='checkbox']")
                .removeAttr("checked");
            } else {
              $(this).attr("data-check", "true");
              $(this)
                .parents(".yearBox")
                .find(".month")
                .attr("data-check", "true");
              $(this)
                .parents(".yearBox")
                .find(".day")
                .attr("data-check", "true");
              $(this)
                .parents(".yearBox")
                .find("input[type='checkbox']")
                .prop("checked", true);
            }
          }
        );
      $(document)
        .off("click.ptFilterCheckbox3")
        .on(
          "click.ptFilterCheckbox3",
          "#MBLsheet-pivotTableFilter-byvalue-select .month",
          function () {
            //月份 对应的 天
            if ($(this).attr("data-check") == "true") {
              $(this).attr("data-check", "false");
              $(this)
                .parents(".monthBox")
                .find(".day")
                .attr("data-check", "false");
              $(this)
                .parents(".monthBox")
                .find("input[type='checkbox']")
                .removeAttr("checked");
            } else {
              $(this).attr("data-check", "true");
              $(this)
                .parents(".monthBox")
                .find(".day")
                .attr("data-check", "true");
              $(this)
                .parents(".monthBox")
                .find("input[type='checkbox']")
                .prop("checked", true);
            }
            //月份 对应的 年份
            let yearDayAllCheck = true;
            let $yearDay = $(this).parents(".yearBox").find(".day");
            $yearDay.each(function (i, e) {
              if ($(e).attr("data-check") == "true") {
              } else {
                yearDayAllCheck = false;
              }
            });
            if (yearDayAllCheck) {
              $(this)
                .parents(".yearBox")
                .find(".year")
                .attr("data-check", "true");
              $(this)
                .parents(".yearBox")
                .find(".year input[type='checkbox']")
                .prop("checked", true);
            } else {
              $(this)
                .parents(".yearBox")
                .find(".year")
                .attr("data-check", "false");
              $(this)
                .parents(".yearBox")
                .find(".year input[type='checkbox']")
                .removeAttr("checked");
            }
          }
        );
      $(document)
        .off("click.ptFilterCheckbox4")
        .on(
          "click.ptFilterCheckbox4",
          "#MBLsheet-pivotTableFilter-byvalue-select .day",
          function () {
            if ($(this).attr("data-check") == "true") {
              $(this).attr("data-check", "false");
              $(this).find("input[type='checkbox']").removeAttr("checked");
            } else {
              $(this).attr("data-check", "true");
              $(this).find("input[type='checkbox']").prop("checked", true);
            }
            //天 对应的 月份
            let monthDayAllCheck = true;
            let $monthDay = $(this).parents(".monthBox").find(".day");
            $monthDay.each(function (i, e) {
              if ($(e).attr("data-check") == "true") {
              } else {
                monthDayAllCheck = false;
              }
            });
            if (monthDayAllCheck) {
              $(this)
                .parents(".monthBox")
                .find(".month")
                .attr("data-check", "true");
              $(this)
                .parents(".monthBox")
                .find(".month input[type='checkbox']")
                .prop("checked", true);
            } else {
              $(this)
                .parents(".monthBox")
                .find(".month")
                .attr("data-check", "false");
              $(this)
                .parents(".monthBox")
                .find(".month input[type='checkbox']")
                .removeAttr("checked");
            }
            //天 对应的 年份
            let yearDayAllCheck = true;
            let $yearDay = $(this).parents(".yearBox").find(".day");
            $yearDay.each(function (i, e) {
              if ($(e).attr("data-check") == "true") {
              } else {
                yearDayAllCheck = false;
              }
            });
            if (yearDayAllCheck) {
              $(this)
                .parents(".yearBox")
                .find(".year")
                .attr("data-check", "true");
              $(this)
                .parents(".yearBox")
                .find(".year input[type='checkbox']")
                .prop("checked", true);
            } else {
              $(this)
                .parents(".yearBox")
                .find(".year")
                .attr("data-check", "false");
              $(this)
                .parents(".yearBox")
                .find(".year input[type='checkbox']")
                .removeAttr("checked");
            }
          }
        );

      //日期 三级下拉显示
      $(document)
        .off("click.ptFilterYearDropdown")
        .on(
          "click.ptFilterYearDropdown",
          "#MBLsheet-pivotTableFilter-byvalue-select .yearBox .fa-caret-right",
          function () {
            let $p = $(this).parents(".MBLsheet-mousedown-cancel");
            if ($p.hasClass("year")) {
              $(this).parents(".yearBox").find(".monthList").slideToggle();
            }
            if ($p.hasClass("month")) {
              $(this).parents(".monthBox").find(".dayList").slideToggle();
            }
          }
        );

      //全选
      $("#MBLsheet-pivotTableFilter-byvalue-btn-all").click(function () {
        $(
          "#MBLsheet-pivotTableFilter-byvalue-select .ListBox input[type='checkbox']"
        ).prop("checked", true);
        $(
          "#MBLsheet-pivotTableFilter-byvalue-select .ListBox input[type='checkbox']"
        )
          .parents(".MBLsheet-mousedown-cancel")
          .attr("data-check", "true");
      });

      //反选
      $("#MBLsheet-pivotTableFilter-byvalue-btn-contra").click(function () {
        let $input = $(
          "#MBLsheet-pivotTableFilter-byvalue-select .ListBox input[type='checkbox']"
        );
        $input.each(function (i, e) {
          if ($(e).is(":checked")) {
            $(e).removeAttr("checked");
            $(e)
              .parents(".MBLsheet-mousedown-cancel")
              .attr("data-check", "false");
          } else {
            $(e).prop("checked", true);
            $(e)
              .parents(".MBLsheet-mousedown-cancel")
              .attr("data-check", "true");
          }
        });
        //天 对应的 月份
        let $month = $(
          "#MBLsheet-pivotTableFilter-byvalue-select .ListBox .monthBox"
        );
        $month.each(function (index, event) {
          let monthDayAllCheck = true;
          let $monthDay = $(event).find(".day input[type='checkbox']");
          $monthDay.each(function (i, e) {
            if ($(e).is(":checked")) {
            } else {
              monthDayAllCheck = false;
            }
          });
          if (monthDayAllCheck) {
            $(event)
              .find(".month input[type='checkbox']")
              .prop("checked", true);
            $(event).attr("data-check", "true");
          } else {
            $(event)
              .find(".month input[type='checkbox']")
              .removeAttr("checked");
            $(event).attr("data-check", "false");
          }
        });
        //天 对应的 年份
        let $year = $(
          "#MBLsheet-pivotTableFilter-byvalue-select .ListBox .yearBox"
        );
        $year.each(function (index, event) {
          let yearDayAllCheck = true;
          let $yearDay = $(event).find(".day input[type='checkbox']");
          $yearDay.each(function (i, e) {
            if ($(e).is(":checked")) {
            } else {
              yearDayAllCheck = false;
            }
          });
          if (yearDayAllCheck) {
            $(event).find(".year input[type='checkbox']").prop("checked", true);
            $(event).attr("data-check", "true");
          } else {
            $(event).find(".year input[type='checkbox']").removeAttr("checked");
            $(event).attr("data-check", "false");
          }
        });
      });

      //清除
      $("#MBLsheet-pivotTableFilter-byvalue-btn-clear").click(function () {
        $(
          "#MBLsheet-pivotTableFilter-byvalue-select .ListBox input[type='checkbox']"
        ).removeAttr("checked");
        $(
          "#MBLsheet-pivotTableFilter-byvalue-select .ListBox input[type='checkbox']"
        )
          .parents(".MBLsheet-mousedown-cancel")
          .attr("data-check", "false");
      });

      //按照值进行筛选
      $("#MBLsheet-pivotTableFilter-byvalue-input").on(
        "input propertychange",
        function () {
          let v = $(this).val().toString();
          $(
            "#MBLsheet-pivotTableFilter-byvalue-select .ListBox .MBLsheet-mousedown-cancel"
          ).show();
          if (v != "") {
            let $check = $(
              "#MBLsheet-pivotTableFilter-byvalue-select .ListBox input[type='checkbox']"
            );
            $check.each(function (i, e) {
              let $p = $(e).parents(".MBLsheet-mousedown-cancel");
              if ($p.hasClass("day")) {
                //日期
                let day = $(e).siblings("label").text().toString();
                let month = $(e)
                  .parents(".monthBox")
                  .find(".month label")
                  .text()
                  .toString();
                let year = $(e)
                  .parents(".yearBox")
                  .find(".year label")
                  .text()
                  .toString();
                let itemV = year + "-" + month + "-" + day;

                if (itemV.indexOf(v) == -1) {
                  $(e).parents(".day").hide();
                  //天 对应的 月份
                  let $monthDay = $(e).parents(".dayList").find(".day:visible");
                  if ($monthDay.length == 0) {
                    $(e).parents(".monthBox").find(".month").hide();
                  }
                  //天 对应的 年份
                  let $yearDay = $(e)
                    .parents(".monthList")
                    .find(".day:visible");
                  if ($yearDay.length == 0) {
                    $(e).parents(".yearBox").find(".year").hide();
                  }
                }
              }
              if ($p.hasClass("textBox")) {
                //其它
                let itemV = $(e).siblings("label").text().toString();

                if (itemV.indexOf(v) == -1) {
                  $(e).parents(".textBox").hide();
                }
              }
            });
          }
        }
      );

      $(
        "#MBLsheet-pivotTableFilter-bycondition, #MBLsheet-pivotTableFilter-byvalue"
      ).click(function () {
        let $t = $(this);
        $t.next().slideToggle(200);
        setTimeout(function () {
          if (
            $t.attr("id") == "MBLsheet-pivotTableFilter-bycondition" &&
            $("#MBLsheet-pivotTableFilter-bycondition").next().is(":visible")
          ) {
            if (
              $("#MBLsheet-pivotTableFilter-selected span").text() !=
              locale_filter.filiterInputNone
            ) {
              $("#MBLsheet-pivotTableFilter-byvalue").next().slideUp(200);
            }
          }

          if ($t.is($("#MBLsheet-pivotTableFilter-bycondition"))) {
            if (
              $("#MBLsheet-pivotTableFilter-bycondition")
                .next()
                .is(":hidden") &&
              $("#MBLsheet-pivotTableFilter-byvalue").next().is(":hidden")
            ) {
              $("#MBLsheet-pivotTableFilter-byvalue").next().slideDown(200);
            }
          }
        }, 300);
      });

      //取消按钮
      $("#MBLsheet-pivotTableFilter-cancel").click(function () {
        $(
          "#MBLsheet-pivotTableFilter-menu, #MBLsheet-pivotTableFilter-submenu"
        ).hide();
      });

      $("#MBLsheet-pivotTableFilter-selected").click(function () {
        let $t = $(this),
          toffset = $t.offset(),
          $menu = $("#MBLsheet-pivotTableFilter-submenu");
        $menu.hide();
        let winH = $(window).height(),
          winW = $(window).width();
        let menuW = $menu.width(),
          menuH = $menu.height();
        let top = toffset.top,
          left = toffset.left,
          mheight = winH - toffset.top - 20;
        if (toffset.left + menuW > winW) {
          left = toffset.left - menuW;
        }

        if (toffset.top > winH / 2) {
          top = winH - toffset.top;
          if (top < 0) {
            top = 0;
          }

          mheight = toffset.top - 20;
        }

        $menu.css({ top: top, left: left, height: mheight }).show();
        clearTimeout(hidefilersubmenu);
      });

      //按条件过滤
      $("#MBLsheet-pivotTableFilter-submenu")
        .mouseover(function () {
          clearTimeout(hidefilersubmenu);
        })
        .find(".MBLsheet-cols-menuitem")
        .click(function (e) {
          $("#MBLsheet-pivotTableFilter-selected span")
            .html($(this).find(".MBLsheet-cols-menuitem-content").text())
            .data("value", $(this).data("value"));
          $(
            "#MBLsheet-pivotTableFilter-menu .MBLsheet-pivotTableFilter-selected-input"
          ).hide();
          if ($(this).data("type") == "2") {
            $("#MBLsheet-pivotTableFilter-selected span").data("type", "2");
            $(
              "#MBLsheet-pivotTableFilter-menu .MBLsheet-pivotTableFilter-selected-input2"
            ).show();
          } else if ($(this).data("type") == "0") {
            $("#MBLsheet-pivotTableFilter-selected span").data("type", "0");
          } else {
            $("#MBLsheet-pivotTableFilter-selected span").data("type", "1");
            $(
              "#MBLsheet-pivotTableFilter-menu .MBLsheet-pivotTableFilter-selected-input"
            )
              .eq(0)
              .show();
            //若是日期 改变input type类型为date
            if (
              $(this).attr("data-value") == "dateequal" ||
              $(this).attr("data-value") == "datelessthan" ||
              $(this).attr("data-value") == "datemorethan"
            ) {
              $(
                "#MBLsheet-pivotTableFilter-menu .MBLsheet-pivotTableFilter-selected-input input"
              ).prop("type", "date");
            } else {
              $(
                "#MBLsheet-pivotTableFilter-menu .MBLsheet-pivotTableFilter-selected-input input"
              ).prop("type", "text");
            }
          }
          $("#MBLsheet-pivotTableFilter-byvalue").next().slideUp();
          $("#MBLsheet-pivotTableFilter-submenu").hide();
        });

      $("#MBLsheet-modal-dialog-pivotTable-list").on(
        "click",
        " .MBLsheet-slider-list-item-filter",
        function (e) {
          _this.MBLsheetsliderlistitemfilter($(this));
          e.stopPropagation();
          return false;
        }
      );

      $("#MBLsheet-modal-dialog-pivotTable-list").on(
        "click",
        " .MBLsheet-slider-list-item-filtered",
        function (e) {
          _this.MBLsheetsliderlistclearfilter($(this).next());
          e.stopPropagation();
          return false;
        }
      );

      $("#MBLsheet-dialog-pivotTable-range-seleted").click(function () {
        $("#MBLsheet-modal-dialog-slider-pivot").hide();
        MBLsheetsizeauto();
        let $t = $("#MBLsheet-data-pivotTable-selection"),
          myh = $t.outerHeight(),
          myw = $t.outerWidth();
        let winw = $(window).width(),
          winh = $(window).height();
        let scrollLeft = $(document).scrollLeft(),
          scrollTop = $(document).scrollTop();

        $("#MBLsheet-data-pivotTable-selection")
          .css({
            left: (winw + scrollLeft - myw) / 2,
            top: (winh + scrollTop - myh) / 4,
          })
          .show();

        _this.jgridCurrentPivotInput = $(
          "#MBLsheet-dialog-pivotTable-range"
        ).html();
        $("#MBLsheet-pivotTable-range-selection-input").val(
          _this.jgridCurrentPivotInput
        );
        _this.MBLsheet_pivotTable_select_state = true;
      });

      //清除筛选按钮
      $("#MBLsheet-pivotTableFilter-initial").click(function () {
        $(
          "#MBLsheet-modal-dialog-pivotTable-list .MBLsheet-slider-list-item-filtered"
        ).hide();
        $(
          "#MBLsheet-modal-dialog-pivotTable-list .MBLsheet-modal-dialog-slider-list-item"
        ).data("rowhidden", "");
        $(
          "#MBLsheet-pivotTableFilter-menu, #MBLsheet-pivotTableFilter-submenu"
        ).hide();
        $(
          "#MBLsheet-pivotTableFilter-menu .MBLsheet-pivotTableFilter-selected-input"
        )
          .hide()
          .find("input")
          .val();
        $("#MBLsheet-pivotTableFilter-selected span")
          .data("type", "0")
          .data("type", null)
          .text(locale_filter.filiterInputNone);

        _this.setDatatojsfile("filterparm", null);
        _this.celldata = _this.origindata;

        _this.refreshPivotTable();
      });

      $(
        "#MBLsheet-modal-dialog-config-row, #MBLsheet-modal-dialog-config-column"
      ).on(
        "click",
        ".MBLsheet-modal-dialog-slider-config-item-icon",
        function (e) {
          let $t = $(e.target),
            $item = $t.closest(".MBLsheet-modal-dialog-slider-config-item"),
            cindex = $item.data("index"),
            toffset = $item.offset();
          let order = $item.data("order"),
            orderby = $item.data("orderby"),
            stastic = $item.data("stastic");

          if (order == null) {
            order = "default";
          }

          let option =
            '<option value="self">' +
            $item
              .find(".MBLsheet-modal-dialog-slider-config-item-txt")
              .data("name") +
            "</option>";

          $(
            "#MBLsheet-modal-dialog-config-value .MBLsheet-modal-dialog-slider-config-item"
          ).each(function (i) {
            option +=
              '<option value="' +
              i +
              '">' +
              $(this)
                .find(".MBLsheet-modal-dialog-slider-config-item-txt")
                .text() +
              "</option>";
          });
          $("#MBLsheet-pivotTable-config-option-orderby").empty().html(option);

          if (orderby == null) {
            orderby = "self";
          }

          if (stastic == null) {
            stastic = "1";
          }

          $("#MBLsheet-pivotTable-config-option-order")
            .val(order)
            .data("index", cindex);
          $("#MBLsheet-pivotTable-config-option-orderby")
            .val(orderby)
            .data("index", cindex);
          $("#MBLsheet-pivotTable-config-option-stastic")
            .val(stastic)
            .data("index", cindex);

          mouseclickposition(
            $("#MBLsheet-pivotTable-config-option"),
            toffset.left + $item.outerWidth(),
            toffset.top - 13,
            "rightbottom"
          );
          e.stopPropagation();
          return false;
        }
      );

      $(
        "#MBLsheet-pivotTable-config-option-order,#MBLsheet-pivotTable-config-option-orderby,#MBLsheet-pivotTable-config-option-stastic"
      ).change(function () {
        let $t = $(this),
          cindex = $t.data("index");

        $(
          "#MBLsheet-modal-dialog-config-row, #MBLsheet-modal-dialog-config-column"
        )
          .find(".MBLsheet-modal-dialog-slider-config-item")
          .each(function () {
            if ($(this).data("index") == cindex) {
              $(this).data(
                $t.attr("id").replace("MBLsheet-pivotTable-config-option-", ""),
                $t.val()
              );
            }
          });

        _this.refreshPivotTable();
      });

      $("#MBLsheet-modal-dialog-config-value").on(
        "click",
        ".MBLsheet-modal-dialog-slider-config-item-icon",
        function (e) {
          let $t = $(e.target),
            $item = $t.closest(".MBLsheet-modal-dialog-slider-config-item"),
            cindex = $item.data("index"),
            toffset = $item.offset(),
            sumtype = $item.data("sumtype");

          let type = _this.pivot_data_type[cindex.toString()];
          if (sumtype == null) {
            if (type == "num") {
              sumtype = "SUM";
            } else {
              sumtype = "COUNTA";
            }
          }

          let $menu = $("#MBLsheet-pivotTable-config-option-sumtype");
          $menu.find(".MBLsheet-submenu-arrow").hide();
          $menu
            .find(
              ".MBLsheet-cols-menuitem[sumtype='" +
                sumtype +
                "'] .MBLsheet-submenu-arrow"
            )
            .css("display", "inline");
          $menu.data("item", $item);

          mouseclickposition(
            $menu,
            toffset.left + $item.outerWidth(),
            toffset.top - 13,
            "rightbottom"
          );
          e.stopPropagation();
          return false;
        }
      );

      $(
        "#MBLsheet-pivotTable-config-option-sumtype .MBLsheet-cols-menuitem"
      ).click(function () {
        let $item = $("#MBLsheet-pivotTable-config-option-sumtype").data(
          "item"
        );
        let sumtype = $(this).attr("sumtype");
        $item.data("sumtype", $(this).attr("sumtype"));
        let name = _this.getSumTypeName(sumtype) + ":" + $item.data("name");
        $item
          .attr("title", name)
          .find(".MBLsheet-modal-dialog-slider-config-item-txt")
          .html(name);
        $("#MBLsheet-pivotTable-config-option-sumtype").hide();
        _this.refreshPivotTable();
      });

      $("#MBLsheet-modal-dialog-config-filter").on(
        "click",
        ".MBLsheet-modal-dialog-slider-config-item-icon",
        function (e) {
          let $t = $(e.target),
            cindex = $t
              .closest(".MBLsheet-modal-dialog-slider-config-item")
              .data("index");
          _this.MBLsheetsliderlistitemfilter(
            $(
              "#MBLsheet-modal-dialog-pivotTable-list .MBLsheet-modal-dialog-slider-list-item"
            )
              .eq(cindex)
              .find(".MBLsheet-slider-list-item-filter")
          );
          e.stopPropagation();
          return false;
        }
      );

      //确认按钮
      $("#MBLsheet-pivotTableFilter-confirm").click(function () {
        let $menu = $("#MBLsheet-pivotTableFilter-menu");
        let cindex = $menu.data("index");

        let rowhiddenother = {}; //其它筛选列的隐藏行
        $(
          "#MBLsheet-modal-dialog-pivotTable-list .MBLsheet-modal-dialog-slider-list-item"
        ).each(function () {
          let $t = $(this),
            rh = $t.data("rowhidden");

          if ($t.data("index") != cindex) {
            if (rh == null || rh == "") {
              return true;
            }

            if (getObjType(rh) == "string") {
              rh = JSON.parse(rh);
            }

            for (let r in rh) {
              rowhiddenother[r] = 0;
            }
          }
        });

        let d = _this.origindata;

        let filterdata = {};
        let rowhidden = {};
        let caljs = {};

        if (
          $("#MBLsheet-pivotTableFilter-bycondition").next().is(":visible") &&
          $("#MBLsheet-pivotTableFilter-byvalue").next().is(":hidden") &&
          $("#MBLsheet-pivotTableFilter-selected span").data("value") != "null"
        ) {
          let $t = $("#MBLsheet-pivotTableFilter-selected span");
          let type = $t.data("type"),
            value = $t.data("value");

          caljs["value"] = value;
          caljs["text"] = $t.text();

          if (type == "0") {
            caljs["type"] = "0";
          } else if (type == "2") {
            let $input = $(
              "#MBLsheet-pivotTableFilter-menu .MBLsheet-pivotTableFilter-selected-input2 input"
            );
            caljs["type"] = "2";
            caljs["value1"] = $input.eq(0).val();
            caljs["value2"] = $input.eq(1).val();
          } else {
            caljs["type"] = "1";
            caljs["value1"] = $(
              "#MBLsheet-pivotTableFilter-menu .MBLsheet-pivotTableFilter-selected-input"
            )
              .eq(0)
              .find("input")
              .val();
          }

          for (let r = 1; r < d.length; r++) {
            if (r in rowhiddenother) {
              continue;
            }

            if (d[r] == null) {
              continue;
            }

            let cell = d[r][cindex];

            if (value == "cellnull") {
              //单元格为空
              if (cell != null && !isRealNull(cell.v)) {
                rowhidden[r] = 0;
              }
            } else if (value == "cellnonull") {
              //单元格有数据
              if (cell == null || isRealNull(cell.v)) {
                rowhidden[r] = 0;
              }
            } else if (value == "textinclude") {
              //文本包含
              let value1 = caljs["value1"];

              if (cell == null || isRealNull(cell.v)) {
                rowhidden[r] = 0;
              } else {
                if (cell.m.indexOf(value1) == -1) {
                  rowhidden[r] = 0;
                }
              }
            } else if (value == "textnotinclude") {
              //文本不包含
              let value1 = caljs["value1"];

              if (cell == null || isRealNull(cell.v)) {
              } else {
                if (cell.m.indexOf(value1) > -1) {
                  rowhidden[r] = 0;
                }
              }
            } else if (value == "textstart") {
              //文本开头为
              let value1 = caljs["value1"],
                valuelen = value1.length;

              if (cell == null || isRealNull(cell.v)) {
                rowhidden[r] = 0;
              } else {
                if (cell.m.substr(0, valuelen) != value1) {
                  rowhidden[r] = 0;
                }
              }
            } else if (value == "textend") {
              //文本结尾为
              let value1 = caljs["value1"],
                valuelen = value1.length;

              if (cell == null || isRealNull(cell.v)) {
                rowhidden[r] = 0;
              } else {
                if (
                  valuelen > cell.m.length ||
                  cell.m.substr(cell.m.length - valuelen, valuelen) != value1
                ) {
                  rowhidden[r] = 0;
                }
              }
            } else if (value == "textequal") {
              //文本等于
              let value1 = caljs["value1"];

              if (cell == null || isRealNull(cell.v)) {
                rowhidden[r] = 0;
              } else {
                if (cell.m != value1) {
                  rowhidden[r] = 0;
                }
              }
            } else if (value == "dateequal") {
              //日期等于
              let value1 = genarate(caljs["value1"])[2];

              if (cell == null || isRealNull(cell.v)) {
                rowhidden[r] = 0;
              } else if (cell.ct != null && cell.ct.t == "d") {
                if (parseInt(cell.v) != value1) {
                  rowhidden[r] = 0;
                }
              } else {
                rowhidden[r] = 0;
              }
            } else if (value == "datelessthan") {
              //日期早于
              let value1 = genarate(caljs["value1"])[2];

              if (cell == null || isRealNull(cell.v)) {
                rowhidden[r] = 0;
              } else if (cell.ct != null && cell.ct.t == "d") {
                if (parseInt(cell.v) >= value1) {
                  rowhidden[r] = 0;
                }
              } else {
                rowhidden[r] = 0;
              }
            } else if (value == "datemorethan") {
              //日期晚于
              let value1 = genarate(caljs["value1"])[2];

              if (cell == null || isRealNull(cell.v)) {
                rowhidden[r] = 0;
              } else if (cell.ct != null && cell.ct.t == "d") {
                if (parseInt(cell.v) <= value1) {
                  rowhidden[r] = 0;
                }
              } else {
                rowhidden[r] = 0;
              }
            } else if (value == "morethan") {
              //大于
              let value1 = parseFloat(caljs["value1"]);

              if (cell == null || isRealNull(cell.v)) {
                rowhidden[r] = 0;
              } else if (cell.ct != null && cell.ct.t == "n") {
                if (cell.v <= value1) {
                  rowhidden[r] = 0;
                }
              } else {
                rowhidden[r] = 0;
              }
            } else if (value == "moreequalthan") {
              //大于等于
              let value1 = parseFloat(caljs["value1"]);

              if (cell == null || isRealNull(cell.v)) {
                rowhidden[r] = 0;
              } else if (cell.ct != null && cell.ct.t == "n") {
                if (cell.v < value1) {
                  rowhidden[r] = 0;
                }
              } else {
                rowhidden[r] = 0;
              }
            } else if (value == "lessthan") {
              //小于
              let value1 = parseFloat(caljs["value1"]);

              if (cell == null || isRealNull(cell.v)) {
                rowhidden[r] = 0;
              } else if (cell.ct != null && cell.ct.t == "n") {
                if (cell.v >= value1) {
                  rowhidden[r] = 0;
                }
              } else {
                rowhidden[r] = 0;
              }
            } else if (value == "lessequalthan") {
              //小于等于
              let value1 = parseFloat(caljs["value1"]);

              if (cell == null || isRealNull(cell.v)) {
                rowhidden[r] = 0;
              } else if (cell.ct != null && cell.ct.t == "n") {
                if (cell.v > value1) {
                  rowhidden[r] = 0;
                }
              } else {
                rowhidden[r] = 0;
              }
            } else if (value == "equal") {
              //等于
              let value1 = parseFloat(caljs["value1"]);

              if (cell == null || isRealNull(cell.v)) {
                rowhidden[r] = 0;
              } else if (cell.ct != null && cell.ct.t == "n") {
                if (cell.v != value1) {
                  rowhidden[r] = 0;
                }
              } else {
                rowhidden[r] = 0;
              }
            } else if (value == "noequal") {
              //不等于
              let value1 = parseFloat(caljs["value1"]);

              if (cell == null || isRealNull(cell.v)) {
                rowhidden[r] = 0;
              } else if (cell.ct != null && cell.ct.t == "n") {
                if (cell.v == value1) {
                  rowhidden[r] = 0;
                }
              } else {
                rowhidden[r] = 0;
              }
            } else if (value == "include") {
              //介于
              let value1 = parseFloat(caljs["value1"]),
                value2 = parseFloat(caljs["value2"]);

              let min, max;
              if (value1 < value2) {
                min = value1;
                max = value2;
              } else {
                max = value1;
                min = value2;
              }

              if (cell == null || isRealNull(cell.v)) {
                rowhidden[r] = 0;
              } else if (cell.ct != null && cell.ct.t == "n") {
                if (cell.v < min || cell.v > max) {
                  rowhidden[r] = 0;
                }
              } else {
                rowhidden[r] = 0;
              }
            } else if (value == "noinclude") {
              //不在其中
              let value1 = parseFloat(caljs["value1"]),
                value2 = parseFloat(caljs["value2"]);

              let min, max;
              if (value1 < value2) {
                min = value1;
                max = value2;
              } else {
                max = value1;
                min = value2;
              }

              if (cell == null || isRealNull(cell.v)) {
                rowhidden[r] = 0;
              } else if (cell.ct != null && cell.ct.t == "n") {
                if (cell.v >= min && cell.v <= max) {
                  rowhidden[r] = 0;
                }
              } else {
                rowhidden[r] = 0;
              }
            }
          }
        } else {
          $(
            "#MBLsheet-pivotTableFilter-byvalue-select .ListBox input[type='checkbox']"
          ).each(function (i, e) {
            if ($(e).is(":visible") && $(e).is(":checked")) {
              return true;
            }

            if ($(e).closest(".day").length > 0) {
              let day = $(e).siblings("label").text();
              if (Number(day) < 10) {
                day = "0" + day;
              }

              let month = $(e)
                .closest(".monthBox")
                .find(".month label")
                .text()
                .replace(locale_filter.filiterMonthText, "");
              if (Number(month) < 10) {
                month = "0" + month;
              }

              let year = $(e)
                .closest(".yearBox")
                .find(".year label")
                .text()
                .replace(locale_filter.filiterYearText, "");

              let itemV =
                locale_filter.filterDateFormatTip +
                "#$$$#" +
                year +
                "-" +
                month +
                "-" +
                day;

              filterdata[itemV] = "1";
            }

            if ($(e).closest(".textBox").length > 0) {
              let itemV = $(e).closest(".textBox").data("filter");

              filterdata[itemV] = "1";
            }
          });

          for (let r = 1; r < d.length; r++) {
            if (r in rowhiddenother) {
              continue;
            }

            if (d[r] == null) {
              continue;
            }

            let cell = d[r][cindex];

            let value;
            if (cell == null || isRealNull(cell.v)) {
              value = "null#$$$#null";
            } else if (cell.ct != null && cell.ct.t == "d") {
              let fmt = update("YYYY-MM-DD", cell.v);
              value = locale_filter.filterDateFormatTip + "#$$$#" + fmt;
            } else {
              value = cell.v + "#$$$#" + cell.m;
            }

            if (value in filterdata) {
              rowhidden[r] = 0;
            }
          }
        }

        let $top = $(
          "#MBLsheet-modal-dialog-pivotTable-list .MBLsheet-modal-dialog-slider-list-item"
        ).eq(cindex);
        if (
          $(
            "#MBLsheet-pivotTableFilter-byvalue-select .ListBox input[type='checkbox']:visible:checked"
          ).length <
            $(
              "#MBLsheet-pivotTableFilter-byvalue-select .ListBox input[type='checkbox']:visible"
            ).length ||
          $("#MBLsheet-pivotTableFilter-byvalue-input").val().length > 0 ||
          ($("#MBLsheet-pivotTableFilter-bycondition").next().is(":visible") &&
            $("#MBLsheet-pivotTableFilter-byvalue").next().is(":hidden") &&
            $("#MBLsheet-pivotTableFilter-selected span").data("value") !=
              "null")
        ) {
          $top
            .data("rowhidden", JSON.stringify(rowhidden))
            .find(".MBLsheet-slider-list-item-filtered")
            .show();
          _this.setDatatojsfile("rowhidden", rowhidden, cindex);

          if (caljs != null) {
            $top
              .data("byconditionvalue", caljs["value"])
              .data("byconditiontype", caljs["type"])
              .data("byconditiontext", caljs["text"]);

            if (caljs["value1"] != null) {
              $top.data("byconditionvalue1", caljs["value1"]);
            }

            if (caljs["value2"] != null) {
              $top.data("byconditionvalue2", caljs["value2"]);
            }

            _this.setDatatojsfile("caljs", caljs, cindex);
          }
        } else {
          $top
            .data("rowhidden", "")
            .find(".MBLsheet-slider-list-item-filtered")
            .hide();
          _this.setDatatojsfile("rowhidden", null, cindex);
        }

        let newdata = [];
        for (let i = 0; i < d.length; i++) {
          if (i in rowhidden || i in rowhiddenother) {
            continue;
          }

          newdata.push([].concat(d[i]));
        }

        _this.celldata = newdata;
        _this.refreshPivotTable();
        $(
          "#MBLsheet-pivotTableFilter-menu, #MBLsheet-pivotTableFilter-submenu"
        ).hide();

        cleargridelement();
      });

      $(
        "#MBLsheet-data-pivotTable-selection .MBLsheet-model-close-btn, #MBLsheet-data-pivotTable-selection .MBLsheet-modal-dialog-title-close"
      ).click(function () {
        $("#MBLsheet-modal-dialog-slider-pivot").show();
        MBLsheetsizeauto();
        $("#MBLsheet-cell-main .MBLsheet-pivotTable-selection-set div").show();

        $("#MBLsheet-data-pivotTable-selection").hide();

        sheetmanage.changeSheetExec(_this.pivotSheetIndex);

        _this.MBLsheet_pivotTable_select_state = false;

        cleargridelement();
      });

      $("#MBLsheet-pivotTable-selection-confirm").click(function () {
        let $input = $("#MBLsheet-pivotTable-range-selection-input"),
          val = $input.val();

        if (
          $.trim(val).length == 0 ||
          $.trim(val).toUpperCase() ==
            _this.jgridCurrentPivotInput.toUpperCase()
        ) {
          $input.val(_this.jgridCurrentPivotInput);
          $(
            "#MBLsheet-data-pivotTable-selection .MBLsheet-model-close-btn"
          ).click();
          return;
        } else {
          let val1 = val.split("!");
          let sheettxt = "",
            rangetxt = "",
            sheetIndex = -1;

          if (val1.length > 1) {
            sheettxt = val1[0];
            rangetxt = val1[1];

            for (let i in Store.MBLsheetfile) {
              if (sheettxt == Store.MBLsheetfile[i].name) {
                sheetIndex = Store.MBLsheetfile[i].index;
                break;
              }
            }

            if (sheetIndex == -1) {
              sheetIndex = 0;
            }
          } else {
            let index = getSheetIndex(Store.currentSheetIndex);
            sheettxt = Store.MBLsheetfile[index].name;
            sheetIndex = Store.MBLsheetfile[index].index;
            rangetxt = val1[0];
          }

          if (Store.MBLsheetfile[getSheetIndex(sheetIndex)].isPivotTable) {
            if (isEditMode()) {
              alert(locale_pivotTable.errorNotAllowPivotData);
            } else {
              tooltip.info("", locale_pivotTable.errorNotAllowPivotData);
            }
            $input.val(_this.jgridCurrentPivotInput);
            return;
          }

          if (rangetxt.indexOf(":") == -1) {
            if (isEditMode()) {
              alert(locale_pivotTable.errorSelectionRange);
            } else {
              tooltip.info("", locale_pivotTable.errorSelectionRange);
            }
            $input.val(_this.jgridCurrentPivotInput);
            return;
          }

          rangetxt = rangetxt.split(":");
          let row = [],
            col = [];

          row[0] = parseInt(rangetxt[0].replace(/[^0-9]/g, "")) - 1;
          row[1] = parseInt(rangetxt[1].replace(/[^0-9]/g, "")) - 1;

          if (row[0] > row[1]) {
            if (isEditMode()) {
              alert(locale_pivotTable.errorSelectionRange);
            } else {
              tooltip.info("", locale_pivotTable.errorSelectionRange);
            }
            $input.val(_this.jgridCurrentPivotInput);
            return;
          }

          col[0] = ABCatNum(rangetxt[0].replace(/[^A-Za-z]/g, ""));
          col[1] = ABCatNum(rangetxt[1].replace(/[^A-Za-z]/g, ""));

          if (col[0] > col[1]) {
            if (isEditMode()) {
              alert(locale_pivotTable.errorSelectionRange);
            } else {
              tooltip.info(locale_pivotTable.errorSelectionRange);
            }
            $input.val(_this.jgridCurrentPivotInput);
            return;
          }
          sheetmanage.changeSheetExec(_this.pivotSheetIndex);

          _this.setDatatojsfile("pivot_select_save", { row: row, column: col });
          _this.setDatatojsfile("pivotDataSheetIndex", sheetIndex);

          _this.getCellData(_this.pivotSheetIndex, sheetIndex, {
            row: row,
            column: col,
          });

          _this.initialPivotManage();

          $("#MBLsheet-dialog-pivotTable-range").html(val);

          $("#MBLsheet-modal-dialog-slider-pivot").show();

          $("#MBLsheet-data-pivotTable-selection").hide();

          _this.MBLsheet_pivotTable_select_state = false;

          _this.refreshPivotTable();

          MBLsheetsizeauto();

          cleargridelement();
        }
      });

      $("#MBLsheet-modal-dialog-slider-pivot").on(
        "mousedown",
        ".MBLsheet-slider-list-item-name, .MBLsheet-modal-dialog-slider-config-item-txt",
        function (e) {
          let $cur = $(e.target);
          _this.movestate = true;
          _this.movesave.obj = $cur.parent();
          _this.movesave.name = $cur.data("name");
          _this.movesave.containerid = $cur.parent().parent().attr("id");
          _this.movesave.index = $cur.data("index");

          if ($("#MBLsheet-modal-dialog-slider-pivot-move").length == 0) {
            $("body").append(
              '<div id="MBLsheet-modal-dialog-slider-pivot-move">' +
                _this.movesave.name +
                "</div>"
            );
          }

          _this.movesave.width = $(
            "#MBLsheet-modal-dialog-slider-pivot-move"
          ).outerWidth();
          _this.movesave.height = $(
            "#MBLsheet-modal-dialog-slider-pivot-move"
          ).outerHeight();

          $(
            "#MBLsheet-modal-dialog-pivotTable-list, #MBLsheet-modal-dialog-config-filter, #MBLsheet-modal-dialog-config-row, #MBLsheet-modal-dialog-config-column, #MBLsheet-modal-dialog-config-value"
          ).css("cursor", "default");
        }
      );

      $(
        "#MBLsheet-modal-dialog-config-filter, #MBLsheet-modal-dialog-config-row, #MBLsheet-modal-dialog-config-column, #MBLsheet-modal-dialog-config-value"
      )
        .mousemove(function (e) {
          if (_this.movestate) {
            if (_this.moveitemposition.length == 0) {
              _this.moveitemposition = [0];

              $(this)
                .find(".MBLsheet-modal-dialog-slider-config-item")
                .each(function (i) {
                  let $t = $(this),
                    h = $t.outerHeight();
                  _this.moveitemposition.push(
                    _this.moveitemposition[i] + h + 2
                  );
                });
              $(this).append(
                '<div id="MBLsheet-modal-dialog-config-order-help" style="position:absolute;height:3px;width:100%;background:#007ACC;z-index:1;pointer-events: none;user-select:none;"></div>'
              );
            }

            $("#MBLsheet-modal-dialog-slider-pivot-move").css({
              background: "#FD8585",
              color: "#fff",
              border: "1px solid #FD7070",
            });
            let x = event.pageX,
              y = event.pageY,
              $container = $(this);
            let curtop = y - $container.offset().top + $container.scrollTop();
            let position = _this.moveitemposition;
            let row_index = MBLsheet_searcharray(position, curtop);

            if (row_index == -1) {
              $("#MBLsheet-modal-dialog-config-order-help").css({
                top: position[position.length - 1],
              });
            } else if (
              curtop - position[row_index - 1] >
              (position[row_index] - position[row_index - 1]) / 2
            ) {
              $("#MBLsheet-modal-dialog-config-order-help").css({
                top: position[row_index],
              });
            } else {
              $("#MBLsheet-modal-dialog-config-order-help").css({
                top: position[row_index - 1],
              });
            }
          }
        })
        .mouseleave(function () {
          if (_this.movestate) {
            $("#MBLsheet-modal-dialog-slider-pivot-move").css({
              background: "#fff",
              color: "#000",
              border: "1px dotted #000",
            });
            _this.moveitemposition = [];
            $("#MBLsheet-modal-dialog-config-order-help").remove();
          }
        })
        .mouseup(function (e) {
          if (_this.movestate) {
            let $t = $(this);
            let itemHTML;

            if (_this.movesave.containerid == $t.attr("id")) {
              itemHTML = _this.movesave.obj.clone();
            } else {
              let name = _this.movesave.name,
                sumtype = "",
                nameindex = "";

              if ($t.attr("id") == "MBLsheet-modal-dialog-config-value") {
                let type =
                  _this.pivot_data_type[_this.movesave.index.toString()];

                if (type == "num") {
                  name = locale_pivotTable.valueStatisticsSUM + ":" + name;
                  sumtype = "data-sumtype='SUM'";
                  nameindex = "data-nameindex='0'";
                } else {
                  name = locale_pivotTable.valueStatisticsCOUNTA + ":" + name;
                  sumtype = "data-sumtype='COUNTA'";
                  nameindex = "data-nameindex='0'";
                }

                $("#MBLsheet-modal-dialog-config-value")
                  .find(".MBLsheet-modal-dialog-slider-config-item")
                  .each(function () {
                    if (
                      $(this)
                        .find(".MBLsheet-modal-dialog-slider-config-item-txt")
                        .text() == name
                    ) {
                      let ni = parseFloat($(this).data("nameindex")) + 1;
                      name = name + ni.toString();
                      $(this).data("nameindex", ni);
                      return false;
                    }
                  });
              }

              itemHTML =
                '<div title="' +
                name +
                '" class="MBLsheet-modal-dialog-slider-config-item" ' +
                nameindex +
                " " +
                sumtype +
                ' data-index="' +
                _this.movesave.index +
                '" data-name="' +
                _this.movesave.name +
                '"><div class="MBLsheet-modal-dialog-slider-config-item-txt" ' +
                nameindex +
                " " +
                sumtype +
                ' data-index="' +
                _this.movesave.index +
                '" data-name="' +
                _this.movesave.name +
                '">' +
                name +
                '</div><div class="MBLsheet-modal-dialog-slider-config-item-icon"><i class="fa fa-sort-desc" aria-hidden="true"></i></div></div>';
            }

            let x = event.pageX,
              y = event.pageY,
              $container = $(this);
            let curtop = y - $container.offset().top + $container.scrollTop();
            let position = _this.moveitemposition;
            let row_index = MBLsheet_searcharray(position, curtop);

            if (
              _this.movesave.containerid ==
                "MBLsheet-modal-dialog-pivotTable-list" ||
              (_this.movesave.containerid ==
                "MBLsheet-modal-dialog-config-value" &&
                _this.movesave.containerid != $t.attr("id"))
            ) {
              $(
                "#MBLsheet-modal-dialog-config-filter, #MBLsheet-modal-dialog-config-row, #MBLsheet-modal-dialog-config-column"
              )
                .find(".MBLsheet-modal-dialog-slider-config-item")
                .each(function () {
                  if ($(this).data("index") == _this.movesave.index) {
                    $(this).remove();
                  }
                });
            }

            if (row_index == -1) {
              if (
                $t.find(".MBLsheet-modal-dialog-slider-config-item").length == 0
              ) {
                $t.append(itemHTML);
              } else {
                $t.find(".MBLsheet-modal-dialog-slider-config-item")
                  .last()
                  .after(itemHTML);
              }
            } else if (
              curtop - position[row_index - 1] >
              (position[row_index] - position[row_index - 1]) / 2
            ) {
              $t.find(".MBLsheet-modal-dialog-slider-config-item")
                .eq(row_index - 1)
                .after(itemHTML);
            } else {
              $t.find(".MBLsheet-modal-dialog-slider-config-item")
                .eq(row_index - 1)
                .before(itemHTML);
            }

            if (
              _this.movesave.containerid ==
              "MBLsheet-modal-dialog-pivotTable-list"
            ) {
            } else if (
              _this.movesave.containerid ==
                "MBLsheet-modal-dialog-config-value" &&
              _this.movesave.containerid != $t.attr("id")
            ) {
            } else {
              _this.movesave.obj.remove();
            }

            $("#MBLsheet-modal-dialog-pivotTable-list")
              .find(".MBLsheet-modal-dialog-slider-list-item")
              .each(function () {
                let $seleted = $(this).find(
                  ".MBLsheet-slider-list-item-selected"
                );
                if (
                  $(this).data("index") == _this.movesave.index &&
                  $seleted.find("i").length == 0
                ) {
                  $seleted.append(
                    '<i class="fa fa-check MBLsheet-mousedown-cancel"></i>'
                  );
                }
              });

            _this.refreshPivotTable();

            $("#MBLsheet-modal-dialog-slider-pivot-move").remove();
            _this.movestate = false;
            $(
              "#MBLsheet-modal-dialog-pivotTable-list, #MBLsheet-modal-dialog-config-filter, #MBLsheet-modal-dialog-config-row, #MBLsheet-modal-dialog-config-column, #MBLsheet-modal-dialog-config-value"
            ).css("cursor", "default");
            _this.moveitemposition = [];
            $("#MBLsheet-modal-dialog-config-order-help").remove();
            _this.showvaluecolrow();
            e.stopPropagation();
          }
        });

      $("#MBLsheet-modal-dialog-pivotTable-list").on(
        "click",
        ".MBLsheet-slider-list-item-selected",
        function () {
          let $t = $(this),
            $item = $t.parent(),
            index = $item.data("index"),
            name = $item.data("name");

          if ($t.find("i").length == 0) {
            $t.append('<i class="fa fa-check MBLsheet-mousedown-cancel"></i>');

            let type = _this.pivot_data_type[index.toString()],
              itemHTML;

            if (type == "num") {
              itemHTML =
                '<div title="' +
                name +
                '" class="MBLsheet-modal-dialog-slider-config-item" data-nameindex="0" data-sumtype="SUM" data-index="' +
                index +
                '" data-name="' +
                name +
                '"><div class="MBLsheet-modal-dialog-slider-config-item-txt" data-nameindex="0" data-sumtype="SUM" data-index="' +
                index +
                '" data-name="' +
                name +
                '">求和:' +
                name +
                '</div><div class="MBLsheet-modal-dialog-slider-config-item-icon"><i class="fa fa-sort-desc" aria-hidden="true"></i></div></div>';
              $("#MBLsheet-modal-dialog-config-value").append(itemHTML);
            } else {
              itemHTML =
                '<div title="' +
                name +
                '" class="MBLsheet-modal-dialog-slider-config-item" data-index="' +
                index +
                '" data-name="' +
                name +
                '"><div class="MBLsheet-modal-dialog-slider-config-item-txt" data-index="' +
                index +
                '" data-name="' +
                name +
                '">' +
                name +
                '</div><div class="MBLsheet-modal-dialog-slider-config-item-icon"><i class="fa fa-sort-desc" aria-hidden="true"></i></div></div>';

              let $column = $("#MBLsheet-modal-dialog-config-column"),
                $row = $("#MBLsheet-modal-dialog-config-row");
              let columnitem = $column.find(
                  ".MBLsheet-modal-dialog-slider-config-item"
                ),
                rowitem = $row.find(
                  ".MBLsheet-modal-dialog-slider-config-item"
                );

              if (columnitem.length < 2) {
                $column.append(itemHTML);
              } else if (rowitem.length < 2) {
                $row.append(itemHTML);
              } else {
                $column.append(itemHTML);
              }
            }
          } else {
            $t.find("i").remove();
            $(
              "#MBLsheet-modal-dialog-config-filter, #MBLsheet-modal-dialog-config-row, #MBLsheet-modal-dialog-config-column, #MBLsheet-modal-dialog-config-value"
            )
              .find(".MBLsheet-modal-dialog-slider-config-item")
              .each(function () {
                if ($(this).data("index") == index) {
                  if (
                    $(this).parent().attr("id") ==
                    "MBLsheet-modal-dialog-config-value"
                  ) {
                    _this.resetOrderby($(this));
                  }
                  $(this).remove();
                }
              });
          }

          _this.refreshPivotTable();
          _this.showvaluecolrow();
        }
      );

      $("#MBLsheet-dialog-pivotTable-clearitem").click(function () {
        $(
          "#MBLsheet-modal-dialog-config-filter, #MBLsheet-modal-dialog-config-row, #MBLsheet-modal-dialog-config-column, #MBLsheet-modal-dialog-config-value"
        )
          .find(".MBLsheet-modal-dialog-slider-config-item")
          .each(function () {
            $(this).remove();
          });

        $("#MBLsheet-modal-dialog-pivotTable-list")
          .find(".MBLsheet-modal-dialog-slider-list-item")
          .each(function () {
            $(this)
              .find(".MBLsheet-slider-list-item-selected")
              .find("i")
              .remove();
          });

        _this.refreshPivotTable();
        _this.showvaluecolrow();
      });
    }

    if (restore == null) {
      restore = false;
    }

    if (_this.celldata.length <= 1 && _this.celldata[0].length <= 1) {
      if (isEditMode()) {
        alert(locale_pivotTable.errorIncreaseRange);
      } else {
        tooltip.info("", locale_pivotTable.errorIncreaseRange);
      }
    }

    let selecteditem = "",
      selecteditemIndex = 1,
      selecteditemtest = {},
      selecteditemNullIndex = 1;

    for (let i = 0; i < _this.celldata[0].length; i++) {
      let name;
      if (!!_this.celldata[0][i] && !!_this.celldata[0][i]["m"]) {
        name = _this.celldata[0][i]["m"];
      } else {
        name = getcellvalue(0, i, _this.celldata);
      }

      if (name != null) {
        name = name.toString();
      }

      if (name == null || $.trim(name.toString()).length == 0) {
        name = locale_pivotTable.titleColumn + " " + selecteditemNullIndex;
      }
      selecteditemNullIndex++;

      if (name in selecteditemtest) {
        name = name + selecteditemIndex++;
        if (name in selecteditemtest) {
          name = name + selecteditemIndex++;
          if (name in selecteditemtest) {
            name = name + selecteditemIndex++;
          }
        }
      }
      selecteditemtest[name] = 1;

      let dataother = "",
        style = "";

      if (restore && _this.filterparm != null) {
        if (_this.filterparm[i.toString()] != null) {
          let itemset = _this.filterparm[i.toString()];
          if (itemset.rowhidden != null) {
            dataother +=
              "data-rowhidden='" + JSON.stringify(itemset.rowhidden) + "'";
          }

          if (itemset.selected != null) {
            dataother +=
              "data-selected='" + JSON.stringify(itemset.selected) + "'";
          }

          if (itemset.caljs != null) {
            let caljsset = itemset.caljs;
            if (caljsset.value != null) {
              dataother += "data-byconditionvalue='" + caljsset.value + "'";
            }

            if (caljsset.type != null) {
              dataother += "data-byconditiontype='" + caljsset.type + "'";
            }

            if (caljsset.text != null) {
              dataother += "data-byconditiontext='" + caljsset.text + "'";
            }

            if (caljsset.value1 != null) {
              dataother += "data-byconditionvalue1='" + caljsset.value1 + "'";
            }

            if (caljsset.value2 != null) {
              dataother += "data-byconditionvalue2='" + caljsset.value2 + "'";
            }
          }
        }
      }

      if (dataother.length > 0) {
        style = "display:block;";
      }

      selecteditem +=
        '<div class="MBLsheet-modal-dialog-slider-list-item" ' +
        dataother +
        ' data-index="' +
        i +
        '" data-name="' +
        name +
        '"><div title="' +
        locale_pivotTable.titleAddColumn +
        '" class="MBLsheet-slider-list-item-selected"><div></div></div><div title="' +
        locale_pivotTable.titleMoveColumn +
        '" class="MBLsheet-slider-list-item-name" ' +
        dataother +
        ' data-index="' +
        i +
        '" data-name="' +
        name +
        '">' +
        name +
        '</div><div title="' +
        locale_pivotTable.titleClearColumnFilter +
        '" class="MBLsheet-slider-list-item-filtered" style="' +
        style +
        '"><i class="fa fa-filter MBLsheet-mousedown-cancel" aria-hidden="true"></i><i class="fa fa-times" aria-hidden="true"></i></div><div title="' +
        locale_pivotTable.titleFilterColumn +
        '" class="MBLsheet-slider-list-item-filter"><i class="fa fa-sort-desc" aria-hidden="true"></i></div></div>';
    }
    $("#MBLsheet-modal-dialog-pivotTable-list").html(selecteditem);

    $("#MBLsheetpivottablevaluecolrowshow").hide();
    $("#MBLsheetpivottablevaluecolrow").prop("checked", true);
    $("#MBLsheetpivottablevaluecolrow1").prop("checked", false);

    $(
      "#MBLsheet-modal-dialog-config-filter, #MBLsheet-modal-dialog-config-row, #MBLsheet-modal-dialog-config-column, #MBLsheet-modal-dialog-config-value"
    ).empty();

    if (restore) {
      if (_this.filter != null && _this.filter.length > 0) {
        for (let i = 0; i < _this.filter.length; i++) {
          let item = _this.filter[i];

          let itemHTML =
            '<div title="' +
            name +
            '" class="MBLsheet-modal-dialog-slider-config-item" data-index="' +
            item.index +
            '" data-name="' +
            item.name +
            '"><div class="MBLsheet-modal-dialog-slider-config-item-txt" data-index="' +
            item.index +
            '" data-name="' +
            item.name +
            '">' +
            item.name +
            '</div><div class="MBLsheet-modal-dialog-slider-config-item-icon"><i class="fa fa-sort-desc" aria-hidden="true"></i></div></div>';

          $("#MBLsheet-modal-dialog-config-filter").append(itemHTML);

          let $seleted = $(
            "#MBLsheet-modal-dialog-pivotTable-list .MBLsheet-modal-dialog-slider-list-item"
          )
            .eq(item.index)
            .find(".MBLsheet-slider-list-item-selected");
          if ($seleted.find("i").length == 0) {
            $seleted.append(
              '<i class="fa fa-check MBLsheet-mousedown-cancel"></i>'
            );
          }
        }
      }

      if (_this.row != null && _this.row.length > 0) {
        for (let i = 0; i < _this.row.length; i++) {
          let item = _this.row[i];
          let otherset = "";

          if (item.order != null) {
            otherset += "data-order = '" + item.order + "'";
          }

          if (item.orderby != null) {
            otherset += "data-orderby = '" + item.orderby + "'";
          }

          if (item.order != null) {
            otherset += "data-stastic = '" + item.stastic + "'";
          }

          let itemHTML =
            '<div title="' +
            name +
            '" class="MBLsheet-modal-dialog-slider-config-item" ' +
            otherset +
            ' data-index="' +
            item.index +
            '" data-name="' +
            item.name +
            '"><div class="MBLsheet-modal-dialog-slider-config-item-txt" ' +
            otherset +
            ' data-index="' +
            item.index +
            '" data-name="' +
            item.name +
            '">' +
            item.name +
            '</div><div class="MBLsheet-modal-dialog-slider-config-item-icon"><i class="fa fa-sort-desc" aria-hidden="true"></i></div></div>';

          $("#MBLsheet-modal-dialog-config-row").append(itemHTML);

          let $seleted = $(
            "#MBLsheet-modal-dialog-pivotTable-list .MBLsheet-modal-dialog-slider-list-item"
          )
            .eq(item.index)
            .find(".MBLsheet-slider-list-item-selected");
          if ($seleted.find("i").length == 0) {
            $seleted.append(
              '<i class="fa fa-check MBLsheet-mousedown-cancel"></i>'
            );
          }
        }
      }

      if (_this.column != null && _this.column.length > 0) {
        for (let i = 0; i < _this.column.length; i++) {
          let item = _this.column[i];
          let otherset = "";

          if (item.order != null) {
            otherset += "data-order = '" + item.order + "'";
          }

          if (item.orderby != null) {
            otherset += "data-orderby = '" + item.orderby + "'";
          }

          if (item.order != null) {
            otherset += "data-stastic = '" + item.stastic + "'";
          }

          let itemHTML =
            '<div title="' +
            name +
            '" class="MBLsheet-modal-dialog-slider-config-item" ' +
            otherset +
            ' data-index="' +
            item.index +
            '" data-name="' +
            item.name +
            '"><div class="MBLsheet-modal-dialog-slider-config-item-txt" ' +
            otherset +
            ' data-index="' +
            item.index +
            '" data-name="' +
            item.name +
            '">' +
            item.name +
            '</div><div class="MBLsheet-modal-dialog-slider-config-item-icon"><i class="fa fa-sort-desc" aria-hidden="true"></i></div></div>';

          $("#MBLsheet-modal-dialog-config-column").append(itemHTML);

          let $seleted = $(
            "#MBLsheet-modal-dialog-pivotTable-list .MBLsheet-modal-dialog-slider-list-item"
          )
            .eq(item.index)
            .find(".MBLsheet-slider-list-item-selected");
          if ($seleted.find("i").length == 0) {
            $seleted.append(
              '<i class="fa fa-check MBLsheet-mousedown-cancel"></i>'
            );
          }
        }
      }

      if (_this.values != null && _this.values.length > 0) {
        for (let i = 0; i < _this.values.length; i++) {
          let item = _this.values[i];
          let otherset = "";

          if (item.sumtype != null) {
            otherset += "data-sumtype = '" + item.sumtype + "'";
          }

          if (item.nameindex != null) {
            otherset += "data-nameindex = '" + item.nameindex + "'";
          }

          let itemHTML =
            '<div title="' +
            name +
            '" class="MBLsheet-modal-dialog-slider-config-item" ' +
            otherset +
            ' data-index="' +
            item.index +
            '" data-name="' +
            item.name +
            '"><div class="MBLsheet-modal-dialog-slider-config-item-txt" ' +
            otherset +
            ' data-index="' +
            item.index +
            '" data-name="' +
            item.name +
            '">' +
            _this.getSumTypeName(item.sumtype) +
            ":" +
            item.name +
            '</div><div class="MBLsheet-modal-dialog-slider-config-item-icon"><i class="fa fa-sort-desc" aria-hidden="true"></i></div></div>';

          $("#MBLsheet-modal-dialog-config-value").append(itemHTML);

          let $seleted = $(
            "#MBLsheet-modal-dialog-pivotTable-list .MBLsheet-modal-dialog-slider-list-item"
          )
            .eq(item.index)
            .find(".MBLsheet-slider-list-item-selected");
          if ($seleted.find("i").length == 0) {
            $seleted.append(
              '<i class="fa fa-check MBLsheet-mousedown-cancel"></i>'
            );
          }
        }

        if (_this.values.length >= 2) {
          $("#MBLsheetpivottablevaluecolrowshow").show();
          if (_this.showType == "column") {
            $("#MBLsheetpivottablevaluecolrow").prop("checked", true);
            $(
              "#MBLsheetpivottablevaluecolrowshow label[for='MBLsheetpivottablevaluecolrow']"
            ).addClass("ui-state-active");

            $("#MBLsheetpivottablevaluecolrow1").prop("checked", false);
            $(
              "#MBLsheetpivottablevaluecolrowshow label[for='MBLsheetpivottablevaluecolrow1']"
            ).removeClass("ui-state-active");
          } else {
            $("#MBLsheetpivottablevaluecolrow1").prop("checked", true);
            $(
              "#MBLsheetpivottablevaluecolrowshow label[for='MBLsheetpivottablevaluecolrow1']"
            ).addClass("ui-state-active");

            $("#MBLsheetpivottablevaluecolrow").prop("checked", false);
            $(
              "#MBLsheetpivottablevaluecolrowshow label[for='MBLsheetpivottablevaluecolrow']"
            ).removeClass("ui-state-active");
          }
        }
      }
    }

    $("#MBLsheet-dialog-pivotTable-range").html(
      getRangetxt(_this.pivotDataSheetIndex, _this.pivot_select_save)
    );
    $("#MBLsheet-modal-dialog-slider-pivot").show();

    MBLsheetsizeauto(false);
  },
  getComposeArray: function (data) {
    if (data.length == 0) {
      return [];
    }

    let ret = [];
    for (let i = 0; i < data.length; i++) {
      let name = "";
      for (let x = 0; x <= i; x++) {
        if (!!data[x] && !!data[x]["m"]) {
          name += data[x]["m"];
        } else {
          name += getcellvalue(x, null, data);
        }
      }

      ret.push(name);
    }

    return ret;
  },
  getnameArray: function (data, field) {
    if (data.length == 0) {
      return [];
    }

    if (field.length == 0) {
      return [];
    }

    let ret = [];
    for (let i = 0; i < field.length; i++) {
      let c_value;
      if (!!data[field[i].index] && !!data[field[i].index]["m"]) {
        c_value = data[field[i].index]["m"];
      } else {
        c_value = getcellvalue(field[i].index, null, data);
      }

      ret.push(c_value);
    }

    return ret;
  },
  getTitleFromGroup: function (group, config, dataposition) {
    let _this = this;
    let orderbygroup = _this.orderbygroup(group, config, dataposition);

    return _this.generategrouparraymain(orderbygroup, config);
  },
  orderbygroup: function (group, config, dataposition) {
    let _this = this;

    let stackset = [];
    if (group.length == 0) {
      return [];
    }
    stackset = group;

    let d = null,
      alllength = stackset.length,
      alllengthInital = stackset.length,
      a = 0;

    while (alllength != 0) {
      d = stackset[a++];
      alllength--;

      if (d.children != null && d.children.length > 0) {
        d.children = _this.orderbygroupchildren(
          d.children,
          config[d.index].orderby,
          config[d.index].order,
          dataposition
        );

        for (let i = 0; i < d.children.length; i++) {
          stackset.push(d.children[i]);
          alllength++;
        }
      }
    }

    return group.splice(0, alllengthInital);
  },
  orderbygroupchildren: function (childrens, orderby, order, dataposition) {
    if (childrens.length == 0) {
      return [];
    }

    let isAsc = false;
    if (order == null || order == "asc") {
      isAsc = true;
    }

    const _locale = locale();
    const locale_filter = _locale.filter;

    let a = function (x, y) {
      let f = null,
        s = null;

      if (orderby == "self" || orderby == null) {
        if (x.name == null) {
          f = locale_filter.valueBlank;
        } else {
          f = x.name.toString();
        }

        if (y.name == null) {
          s = locale_filter.valueBlank;
        } else {
          s = y.name.toString();
        }

        if (isdatetime(f) && isdatetime(s)) {
          return diff(f, s);
        }
      } else {
        f = parseFloat(dataposition[x.orderby].result);
        s = parseFloat(dataposition[y.orderby].result);
      }

      if (!isNaN(f) && !isNaN(s)) {
        return numeral(f).value() - numeral(s).value();
      } else if (isNaN(f) && isNaN(s)) {
        return f.localeCompare(s);
      } else if (isNaN(f)) {
        return 1;
      } else if (isNaN(s)) {
        return -1;
      }
    };

    let d = function (x, y) {
      let f = null,
        s = null;

      if (orderby == "self" || orderby == null) {
        if (x.name == null) {
          f = locale_filter.valueBlank;
        } else {
          f = x.name.toString();
        }

        if (y.name == null) {
          s = locale_filter.valueBlank;
        } else {
          s = y.name.toString();
        }

        if (isdatetime(f) && isdatetime(s)) {
          return diff(f, s);
        }
      } else {
        f = parseFloat(dataposition[x.orderby].result);
        s = parseFloat(dataposition[y.orderby].result);
      }

      if (!isNaN(f) && !isNaN(s)) {
        return numeral(s).value() - numeral(f).value();
      } else if (isNaN(f) && isNaN(s)) {
        return s.localeCompare(f);
      } else if (isNaN(f)) {
        return -1;
      } else if (isNaN(s)) {
        return 1;
      }
    };

    if (isAsc) {
      return childrens.sort(a);
    } else {
      return childrens.sort(d);
    }
  },
  generategroupaddstatic: function (arr, name) {
    let stasticarr = [];
    const _locale = locale();
    const locale_pivotTable = _locale.pivotTable;
    for (let a = 0; a < arr[0].length; a++) {
      if (a == 0) {
        if (name == locale_pivotTable.valueSum) {
          stasticarr.push(name);
        } else {
          stasticarr.push({ name: name, issum: true });
        }
      } else {
        stasticarr.push("");
      }
    }

    return stasticarr;
  },
  generategrouparraymain: function (group, config) {
    let _this = this;

    //生成数组
    let ret = [];
    for (let i = 0; i < group.length; i++) {
      let name = group[i].name;
      let arr = _this.generategrouparray(group[i].children, config, 1);

      if (config[0].stastic == "1" || config[0].stastic == null) {
        arr.push(_this.generategroupaddstatic(arr, name));
      }

      ret = ret.concat(arr);
    }

    return ret;
  },
  generategrouparray: function (group, config, level) {
    let _this = this;

    let ret = [];
    for (let i = 0; i < group.length; i++) {
      let name = group[i].name;
      let arr;

      if (group[i].children == 0 || group[i].children.length == 0) {
        arr = [name];
        ret.push(arr);
      } else {
        arr = _this.generategrouparray(group[i].children, config, level + 1);

        for (let a = 0; a < arr.length; a++) {
          arr[a].unshift(name);
        }

        if (config[level].stastic == "1" || config[level].stastic == null) {
          arr.push(_this.generategroupaddstatic(arr, name));
        }

        ret = ret.concat(arr);
      }
    }

    return ret;
  },
  addStatisticsData: function (dataposition, valueobj, indicator, d_value) {
    if (dataposition[indicator] == null) {
      dataposition[indicator] = {
        data: [],
        count: 0,
        max: -Infinity,
        min: Infinity,
        counta: 0,
        countunique: 0,
        countuniquedata: {},
        sum: 0,
        digitaldata: [],
        sumtype: valueobj.sumtype,
        index: valueobj.index,
        name: valueobj.fullname,
        acc: 0,
      };
    }

    if (isdatatypemulti(d_value)["num"] === true) {
      //fix issue 265
      let num = numFormat(d_value, 6);
      dataposition[indicator]["digitaldata"].push(num);
      dataposition[indicator]["count"] += 1;
      dataposition[indicator]["sum"] += num;

      if (num > dataposition[indicator]["max"]) {
        dataposition[indicator]["max"] = num;
      }

      if (num < dataposition[indicator]["min"]) {
        dataposition[indicator]["min"] = num;
      }

      let newAcc = numfloatlen(num);

      if (newAcc > dataposition[indicator]["acc"]) {
        dataposition[indicator]["acc"] = newAcc;
      }
    }

    if (d_value != "") {
      dataposition[indicator]["data"].push(d_value);
      dataposition[indicator]["counta"] += 1;
      if (!(d_value in dataposition[indicator]["countuniquedata"])) {
        dataposition[indicator]["countuniquedata"][d_value] = 1;
        dataposition[indicator]["countunique"] += 1;
      }
    }
  },
  dataHandler: function (column, row, values, showType, celldata) {
    //column:[{"index":1, name:"列1", "order":"asc", "orderby":"self/0/1/2", "stastic":"0/1"}]
    //row:[{"index":1, name:"列3", "order":"asc", "orderby":"self/0/1/2", "stastic":"0/1"}]
    //values:[{"index":1, "sumtype":"SUM/COUNT/COUNTA/COUNTUNIQUE/AVERAGE/MAX/MIN/MEDIAN/PRODUCT/STDEV/STDEVP/let/VARP", "name":"求和:fyc"}]
    let _this = this;

    const _locale = locale();
    const locale_filter = _locale.filter;
    const locale_pivotTable = _locale.pivotTable;

    if (showType == null) {
      showType = "column";
    }

    if (
      (column.length == 0 && row.length == 0 && values.length == 0) ||
      celldata.length == 0
    ) {
      _this.pivotDatas = [];
      return [];
    }

    //生成透视表值及定位
    let dataposition = {},
      data = celldata,
      datarowtitle = [],
      datarowtitlegroup = [],
      datarowposition = {},
      datarowposition_i = 0,
      datacoltitle = [],
      datacoltitlegroup = [],
      datacolposition = {},
      datacolposition_i = 0;

    for (let i = 1; i < data.length; i++) {
      let d = data[i];
      let groupbyrowtxt = "",
        groupbycoltxt = "",
        rowtxt = "",
        rowtitle = [],
        rowtitlename = [],
        coltxt = "",
        coltitle = [],
        coltitlename = [];

      //["四川", "成都", "邛崃"] 转换为 ["四川", "四川成都", "四川成都邛崃"]
      rowtitlename = _this.getnameArray(d, row);
      coltitlename = _this.getnameArray(d, column);

      rowtitle = _this.getComposeArray(rowtitlename);
      coltitle = _this.getComposeArray(coltitlename);

      if (rowtitle.length > 0) {
        rowtitle.unshift(locale_pivotTable.valueSum);
      }

      if (coltitle.length > 0) {
        coltitle.unshift(locale_pivotTable.valueSum);
      }

      let curentLevelobj_row = datarowposition,
        curentLevelarr_row = datarowtitlegroup;

      for (let r = 0; r < rowtitle.length; r++) {
        let item = rowtitle[r],
          name = r == 0 ? locale_pivotTable.valueSum : rowtitlename[r - 1]; //修改

        if (
          curentLevelobj_row[r.toString()] != null &&
          curentLevelobj_row[r.toString()][item] != null
        ) {
          //修改
          curentLevelarr_row =
            curentLevelarr_row[curentLevelobj_row[r.toString()][item]].children;
        } else {
          let orderby =
            r == 0
              ? "self"
              : row[r - 1].orderby == "self" || row[r - 1].orderby == null
              ? item
              : showType == "column"
              ? item + values[parseInt(row[r - 1].orderby)].fullname
              : item + locale_pivotTable.valueSum;

          if (name == null) {
            name = locale_filter.valueBlank;
          }

          curentLevelarr_row.push({
            name: name,
            fullname: item,
            index: r,
            orderby: orderby,
            children: [],
          });

          if (curentLevelobj_row[r.toString()] == null) {
            curentLevelobj_row[r.toString()] = {};
          }

          if (curentLevelobj_row[r.toString()][item] == null) {
            curentLevelobj_row[r.toString()][item] =
              curentLevelarr_row.length - 1;
          }

          curentLevelarr_row =
            curentLevelarr_row[curentLevelarr_row.length - 1].children;
        }
      }

      let curentLevelobj_col = datacolposition,
        curentLevelarr_col = datacoltitlegroup;

      for (let r = 0; r < coltitle.length; r++) {
        let item = coltitle[r],
          name = r == 0 ? locale_pivotTable.valueSum : coltitlename[r - 1];

        if (
          curentLevelobj_col[r.toString()] != null &&
          curentLevelobj_col[r.toString()][item] != null
        ) {
          curentLevelarr_col =
            curentLevelarr_col[curentLevelobj_col[r.toString()][item]].children;
        } else {
          let orderby =
            r == 0
              ? "self"
              : column[r - 1].orderby == "self" || column[r - 1].orderby == null
              ? item
              : showType == "column"
              ? locale_pivotTable.valueSum + item
              : values[parseInt(column[r - 1].orderby)].fullname + item;

          if (name == null) {
            name = locale_filter.valueBlank;
          }

          curentLevelarr_col.push({
            name: name,
            fullname: item,
            index: r,
            orderby: orderby,
            children: [],
          });

          if (curentLevelobj_col[r.toString()] == null) {
            curentLevelobj_col[r.toString()] = {};
          }

          if (curentLevelobj_col[r.toString()][item] == null) {
            curentLevelobj_col[r.toString()][item] =
              curentLevelarr_col.length - 1;
          }

          curentLevelarr_col =
            curentLevelarr_col[curentLevelarr_col.length - 1].children;
        }
      }

      let v_str = "";
      for (let v = 0; v < values.length; v++) {
        let d_value = getcellvalue(values[v].index, null, d);

        let coltitle_c = [].concat(coltitle),
          rowtitle_c = [].concat(rowtitle);
        if (showType == "column") {
          if (coltitle_c.length > 0) {
            coltitle_c.push("");
            coltitle_c = coltitle_c
              .join(values[v].fullname + "|||")
              .split("|||")
              .slice(0, coltitle_c.length - 1);
          } else {
            coltitle_c.push(values[v].fullname);
          }
        } else {
          if (rowtitle_c.length > 0) {
            rowtitle_c.push("");
            rowtitle_c = rowtitle_c
              .join(values[v].fullname + "|||")
              .split("|||")
              .slice(0, rowtitle_c.length - 1);
          } else {
            rowtitle_c.push(values[v].fullname);
          }
        }

        if (coltitle_c.length == 0) {
          coltitle_c.push("");
        }

        if (rowtitle_c.length == 0) {
          rowtitle_c.push("");
        }

        for (let r = 0; r < rowtitle_c.length; r++) {
          for (let c = 0; c < coltitle_c.length; c++) {
            let indicator = rowtitle_c[r] + coltitle_c[c];
            _this.addStatisticsData(
              dataposition,
              values[v],
              indicator,
              d_value
            );
          }
        }
      }
    }

    //计算值列
    //SUM/COUNT/COUNTA/COUNTUNIQUE/AVERAGE/MAX/MIN/MEDIAN/PRODUCT/STDEV/STDEVP/let/VARP
    for (let indicator in dataposition) {
      let json = dataposition[indicator];

      if (json.sumtype == "SUM") {
        json.result = json.sum;
      } else if (json.sumtype == "COUNT") {
        json.result = json.count;
      } else if (json.sumtype == "COUNTA") {
        json.result = json.counta;
      } else if (json.sumtype == "COUNTUNIQUE") {
        json.result = json.countunique;
      } else if (json.sumtype == "AVERAGE") {
        json.result = numFormat(json.sum / json.count);
      } else if (json.sumtype == "MAX") {
        json.result = json.max;
      } else if (json.sumtype == "MIN") {
        json.result = json.min;
      } else if (json.sumtype == "MEDIAN") {
        let numArr = json.digitaldata.sort(function (a, b) {
          return a - b;
        });
        let numLen = numArr.length;
        let numindex = parseInt(numLen / 2);

        if (numLen % 2 == 0) {
          json.result = (numArr[numindex - 1] + numArr[numindex]) / 2;
        } else {
          json.result = numArr[numindex];
        }
      } else if (json.sumtype == "PRODUCT") {
        json.result = new Function("return " + json.digitaldata.join("*"))();
      } else if (json.sumtype == "STDEV") {
        let mean = json.sum / json.count;
        json.result = analysis.STDEV(mean, json.digitaldata);
      } else if (json.sumtype == "STDEVP") {
        let mean = json.sum / json.count;
        json.result = analysis.STDEVP(mean, json.digitaldata);
      } else if (json.sumtype == "let") {
        let mean = json.sum / json.count;
        json.result = analysis.let(mean, json.digitaldata);
      } else if (json.sumtype == "VARP") {
        let mean = json.sum / json.count;
        json.result = analysis.VARP(mean, json.digitaldata);
      }

      let newAcc = numfloatlen(json.result);
      if (newAcc > json.acc) {
        json.acc = newAcc;
      }

      json.result = numFormat(json.result, json.acc);
    }

    datarowtitle = _this.getTitleFromGroup(
      datarowtitlegroup,
      row,
      dataposition
    );
    datacoltitle = _this.getTitleFromGroup(
      datacoltitlegroup,
      column,
      dataposition
    );

    //加入值到列/行形成新的表头
    if (showType == "column") {
      if (datacoltitle.length > 0 && datacoltitle[0].length > 0) {
        datacoltitle = _this.addValuesToTitle(datacoltitle, values);
      } else {
        for (let v = 0; v < values.length; v++) {
          datacoltitle.push([values[v].fullname]);
        }
      }
    } else {
      if (datarowtitle.length > 0 && datarowtitle[0].length > 0) {
        datarowtitle = _this.addValuesToTitle(datarowtitle, values);
      } else {
        for (let v = 0; v < values.length; v++) {
          datarowtitle.push([values[v].fullname]);
        }
      }
    }

    let datacoltitle_index = datacoltitle;
    datacoltitle = MBLsheetArray.transpose(datacoltitle, false);

    let valuenslen = values.length == 0 ? 0 : 1;
    let rowLen =
        (datacoltitle.length == 0 ? valuenslen : datacoltitle.length) +
        (datarowtitle.length == 0 ? valuenslen : datarowtitle.length),
      colLen =
        (datacoltitle.length == 0 ? valuenslen : datacoltitle[0].length) +
        (datarowtitle.length == 0 ? valuenslen : datarowtitle[0].length);

    let rowOver = datacoltitle.length,
      colOver = datarowtitle.length == 0 ? 0 : datarowtitle[0].length;

    let retdata = [];
    for (let r = 0; r < rowLen; r++) {
      retdata[r] = new Array(colLen);

      for (let c = 0; c < colLen; c++) {
        let drt = datarowtitle[r - rowOver];

        if (r < rowOver && c < colOver) {
          //空白列头
          retdata[r][c] = "";
        } else if (r < rowOver && c >= colOver) {
          //列标题
          if (datacoltitle[r] != null) {
            if (getObjType(datacoltitle[r][c - colOver]) == "object") {
              retdata[r][c] =
                datacoltitle[r][c - colOver].name + locale_pivotTable.valueSum;
            } else {
              retdata[r][c] = datacoltitle[r][c - colOver];
            }
          } else {
            retdata[r][c] = "";
          }
        } else if (r >= rowOver && c < colOver) {
          //行标题
          if (drt != null) {
            if (getObjType(drt[c]) == "object") {
              retdata[r][c] = drt[c].name + locale_pivotTable.valueSum;
            } else {
              retdata[r][c] = drt[c];
            }
          } else {
            retdata[r][c] = "";
          }
        } else {
          //单元格内容
          let prefix = "";
          if (drt != null) {
            if (!(drt instanceof Array) || drt.length == 1) {
              if (drt instanceof Array) {
                prefix = drt[0];
              } else {
                prefix = drt;
              }
            } else {
              for (let x = 0; x < drt.length; x++) {
                if (getObjType(drt[x]) == "object") {
                  prefix += drt[x].name;
                } else {
                  prefix += drt[x];
                }
              }
            }
          }

          let suffix = "";
          let dct = datacoltitle_index[c - colOver];
          if (dct != null) {
            if (!(dct instanceof Array) || dct.length == 1) {
              if (dct instanceof Array) {
                suffix = dct[0];
              } else {
                suffix = dct;
              }
            } else {
              for (let x = 0; x < dct.length; x++) {
                if (getObjType(dct[x]) == "object") {
                  suffix += dct[x].name;
                } else {
                  suffix += dct[x];
                }
              }
            }
          }

          let indicator = prefix;

          if (prefix != "" && suffix != "") {
            indicator = prefix + suffix;
          } else if (prefix == "") {
            indicator = suffix;
          }

          if (dataposition[indicator] == null) {
            retdata[r][c] = "";
          } else {
            retdata[r][c] = dataposition[indicator].result;
          }
        }
      }
    }

    if (values.length == 1 && column.length > 0 && row.length > 0) {
      retdata[0][0] = values[0].fullname;
      retdata.splice(column.length, 1);
    } else if (values.length == 1 && column.length > 0) {
      // 0: (6) ["English", "foreign language", "mathematics", "science", "Sum", undefined]
      // 1: (6) ["CountA:score", "CountA:score", "CountA:score", "CountA:score", "CountA:score", undefined]
      // 2: (6) [3, 3, 3, 3, 12, ""]
      //The above format does not meet viewing habits,Process retdata into the correct format
      let titleRow = retdata.splice(column.length, 1);
      let newRetdata = [];
      for (let r = 0; r < retdata.length; r++) {
        let row = [];
        if (r == retdata.length - 1) {
          row.push(titleRow[0][0]);
        } else {
          row.push("");
        }
        for (let c = 0; c < retdata[r].length - 1; c++) {
          row.push(retdata[r][c]);
        }
        newRetdata.push(row);
      }
      retdata = newRetdata;
    }

    _this.pivotDatas = retdata;

    return retdata;
  },
  drillDown: function (row_index, col_index) {
    if (
      !checkProtectionAuthorityNormal(
        Store.currentSheetIndex,
        "usePivotTablereports"
      )
    ) {
      return;
    }
    let _this = this;

    let cell = _this.pivotDatas[row_index][col_index];
    let d = $.extend(true, [], sheetmanage.nulldata);

    const _locale = locale();
    const locale_filter = _locale.filter;
    const locale_pivotTable = _locale.pivotTable;

    let selecteditemNullIndex = 1;
    for (let i = 0; i < _this.celldata[0].length; i++) {
      let name;
      if (!!_this.celldata[0][i] && !!_this.celldata[0][i]["m"]) {
        name = _this.celldata[0][i]["m"];
      } else {
        name = getcellvalue(0, i, _this.celldata);
      }

      if (name != null) {
        name = name.toString();
      }

      if (name == null || $.trim(name.toString()).length == 0) {
        name = locale_pivotTable.titleColumn + " " + selecteditemNullIndex;
      }
      selecteditemNullIndex++;

      d[0][i] = name;
    }

    let obj = {};

    //行
    if (_this.row != null && _this.row.length > 0) {
      for (let a = 0; a < _this.row.length; a++) {
        obj[_this.row[a]["index"]] = _this.pivotDatas[row_index][a];
      }
    }

    //列
    if (_this.column != null && _this.column.length > 0) {
      for (let b = 0; b < _this.column.length; b++) {
        obj[_this.column[b]["index"]] = _this.pivotDatas[b][col_index];
      }
    }

    let rowArr = [];
    for (let j = 1; j < _this.celldata.length; j++) {
      let isEqual = true;

      for (let x in obj) {
        let value;
        if (!!_this.celldata[j][x] && !!_this.celldata[j][x]["m"]) {
          value = _this.celldata[j][x]["m"];
        } else {
          value = getcellvalue(j, x, _this.celldata);
        }

        if (value != null) {
          value = value.toString();
        } else {
          value = locale_filter.valueBlank;
        }

        if (value != obj[x]) {
          isEqual = false;
          break;
        }
      }

      if (isEqual) {
        rowArr.push(j);
      }
    }

    for (let r = 0; r < rowArr.length; r++) {
      for (let c = 0; c < _this.celldata[0].length; c++) {
        let value;
        if (
          !!_this.celldata[rowArr[r]][c] &&
          !!_this.celldata[rowArr[r]][c]["m"]
        ) {
          value = _this.celldata[rowArr[r]][c]["m"];
        } else {
          value = getcellvalue(rowArr[r], c, _this.celldata);
        }

        if (value != null) {
          value = value.toString();
        } else {
          value = "";
        }

        d[r + 1][c] = value;
      }
    }

    Store.MBLsheet_select_save = [
      { row: [0, rowArr.length], column: [0, _this.celldata[0].length - 1] },
    ];

    Store.clearjfundo = false;
    jfrefreshgrid(d, Store.MBLsheet_select_save);
    selectHightlightShow();
    Store.clearjfundo = true;
  },
};

export default pivotTable;
