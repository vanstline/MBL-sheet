import { replaceHtml, chatatABC } from "../utils/util";
import { getSheetIndex } from "../methods/get";
import { modelHTML, keycode } from "./constant";
import { selectHightlightShow } from "./select";
import sheetmanage from "./sheetmanage";
import { isEditMode } from "../global/validate";
import { valueShowEs } from "../global/format";
import { setcellvalue } from "../global/setdata";
import { jfrefreshgrid } from "../global/refresh";
import editor from "../global/editor";
import tooltip from "../global/tooltip";
import func_methods from "../global/func_methods";
import Store from "../store";
import locale from "../locale/locale";
import { checkProtectionLocked } from "./protection";
import escapeHtml from "escape-html";

//查找替换
const MBLsheetSearchReplace = {
  createDialog: function (source) {
    $("#MBLsheet-modal-dialog-mask").hide();
    $("#MBLsheet-search-replace").remove();

    const _locale = locale();
    const locale_findAndReplace = _locale.findAndReplace;
    const locale_button = _locale.button;

    let content =
      '<div class="tabBox">' +
      '<span id="searchTab">' +
      locale_findAndReplace.find +
      "</span>" +
      '<span id="replaceTab">' +
      locale_findAndReplace.replace +
      "</span>" +
      "</div>" +
      '<div class="ctBox">' +
      '<div class="inputBox">' +
      '<div class="textboxs" id="searchInput">' +
      locale_findAndReplace.findTextbox +
      '：<input class="formulaInputFocus" spellcheck="false" value=""/></div>' +
      '<div class="textboxs" id="replaceInput">' +
      locale_findAndReplace.replaceTextbox +
      '：<input class="formulaInputFocus" spellcheck="false" value=""/></div>' +
      '<div class="checkboxs">' +
      '<div id="regCheck">' +
      '<input type="checkbox"/>' +
      "<span>" +
      locale_findAndReplace.regexTextbox +
      "</span>" +
      "</div>" +
      '<div id="wordCheck">' +
      '<input type="checkbox"/>' +
      "<span>" +
      locale_findAndReplace.wholeTextbox +
      "</span>" +
      "</div>" +
      '<div id="caseCheck">' +
      '<input type="checkbox"/>' +
      "<span>" +
      locale_findAndReplace.distinguishTextbox +
      "</span>" +
      "</div>" +
      "</div>" +
      "</div>" +
      '<div class="btnBox">' +
      '<button id="replaceAllBtn" class="btn btn-default">' +
      locale_findAndReplace.allReplaceBtn +
      "</button>" +
      '<button id="replaceBtn" class="btn btn-default">' +
      locale_findAndReplace.replaceBtn +
      "</button>" +
      '<button id="searchAllBtn" class="btn btn-default">' +
      locale_findAndReplace.allFindBtn +
      "</button>" +
      '<button id="searchNextBtn" class="btn btn-default">' +
      locale_findAndReplace.findBtn +
      "</button>" +
      "</div>" +
      "</div>";

    $("body").append(
      replaceHtml(modelHTML, {
        id: "MBLsheet-search-replace",
        addclass: "MBLsheet-search-replace",
        title: "",
        content: content,
        botton:
          '<button class="btn btn-default MBLsheet-model-close-btn">' +
          locale_button.close +
          "</button>",
        style: "z-index:100003",
        close: locale_button.close,
      })
    );
    let $t = $("#MBLsheet-search-replace")
        .find(".MBLsheet-modal-dialog-content")
        .css("min-width", 500)
        .end(),
      myh = $t.outerHeight(),
      myw = $t.outerWidth();
    let winw = $(window).width(),
      winh = $(window).height();
    let scrollLeft = $(document).scrollLeft(),
      scrollTop = $(document).scrollTop();
    $("#MBLsheet-search-replace")
      .css({
        left: (winw + scrollLeft - myw) / 2,
        top: (winh + scrollTop - myh) / 3,
      })
      .show();

    if (source == "0") {
      $("#MBLsheet-search-replace #searchTab")
        .addClass("on")
        .siblings()
        .removeClass("on");
      $("#MBLsheet-search-replace #replaceInput").hide();
      $("#MBLsheet-search-replace #replaceAllBtn").hide();
      $("#MBLsheet-search-replace #replaceBtn").hide();
    } else if (source == "1") {
      $("#MBLsheet-search-replace #replaceTab")
        .addClass("on")
        .siblings()
        .removeClass("on");
      $("#MBLsheet-search-replace #replaceInput").show();
      $("#MBLsheet-search-replace #replaceAllBtn").show();
      $("#MBLsheet-search-replace #replaceBtn").show();
    }
  },
  init: function () {
    let _this = this;

    //查找替换 切换
    $(document)
      .off("click.SRtabBoxspan")
      .on(
        "click.SRtabBoxspan",
        "#MBLsheet-search-replace .tabBox span",
        function () {
          $(this).addClass("on").siblings().removeClass("on");

          let $id = $(this).attr("id");
          if ($id == "searchTab") {
            $("#MBLsheet-search-replace #replaceInput").hide();
            $("#MBLsheet-search-replace #replaceAllBtn").hide();
            $("#MBLsheet-search-replace #replaceBtn").hide();

            $("#MBLsheet-search-replace #searchInput input").focus();
          } else if ($id == "replaceTab") {
            $("#MBLsheet-search-replace #replaceInput").show();
            $("#MBLsheet-search-replace #replaceAllBtn").show();
            $("#MBLsheet-search-replace #replaceBtn").show();

            $("#MBLsheet-search-replace #replaceInput input").focus();
          }
        }
      );

    //查找下一个
    $(document)
      .off("keyup.SRsearchInput")
      .on(
        "keyup.SRsearchInput",
        "#MBLsheet-search-replace #searchInput input",
        function (event) {
          let kcode = event.keyCode;
          if (kcode == keycode.ENTER) {
            _this.searchNext();
          }
        }
      );
    $(document)
      .off("click.SRsearchNextBtn")
      .on(
        "click.SRsearchNextBtn",
        "#MBLsheet-search-replace #searchNextBtn",
        function () {
          _this.searchNext();
        }
      );

    //查找全部
    $(document)
      .off("click.SRsearchAllBtn")
      .on(
        "click.SRsearchAllBtn",
        "#MBLsheet-search-replace #searchAllBtn",
        function () {
          _this.searchAll();
        }
      );
    $(document)
      .off("click.SRsearchAllboxItem")
      .on(
        "click.SRsearchAllboxItem",
        "#MBLsheet-search-replace #searchAllbox .boxItem",
        function () {
          $(this).addClass("on").siblings().removeClass("on");

          let r = $(this).attr("data-row");
          let c = $(this).attr("data-col");
          let sheetIndex = $(this).attr("data-sheetIndex");

          if (sheetIndex != Store.currentSheetIndex) {
            sheetmanage.changeSheetExec(sheetIndex);
          }

          Store.MBLsheet_select_save = [{ row: [r, r], column: [c, c] }];

          selectHightlightShow();

          let scrollLeft = $("#MBLsheet-cell-main").scrollLeft(),
            scrollTop = $("#MBLsheet-cell-main").scrollTop();
          let winH = $("#MBLsheet-cell-main").height(),
            winW = $("#MBLsheet-cell-main").width();

          let row = Store.visibledatarow[r],
            row_pre = r - 1 == -1 ? 0 : Store.visibledatarow[r - 1];
          let col = Store.visibledatacolumn[c],
            col_pre = c - 1 == -1 ? 0 : Store.visibledatacolumn[c - 1];

          if (col - scrollLeft - winW + 20 > 0) {
            $("#MBLsheet-scrollbar-x").scrollLeft(col - winW + 20);
          } else if (col_pre - scrollLeft - 20 < 0) {
            $("#MBLsheet-scrollbar-x").scrollLeft(col_pre - 20);
          }

          if (row - scrollTop - winH + 20 > 0) {
            $("#MBLsheet-scrollbar-y").scrollTop(row - winH + 20);
          } else if (row_pre - scrollTop - 20 < 0) {
            $("#MBLsheet-scrollbar-y").scrollTop(row_pre - 20);
          }
        }
      );

    //替换
    $(document)
      .off("click.SRreplaceBtn")
      .on(
        "click.SRreplaceBtn",
        "#MBLsheet-search-replace #replaceBtn",
        function () {
          _this.replace();
        }
      );

    //全部替换
    $(document)
      .off("click.SRreplaceAllBtn")
      .on(
        "click.SRreplaceAllBtn",
        "#MBLsheet-search-replace #replaceAllBtn",
        function () {
          _this.replaceAll();
        }
      );
  },
  searchNext: function () {
    let _this = this;

    let searchText = $("#MBLsheet-search-replace #searchInput input").val();
    if (searchText == "" || searchText == null) {
      return;
    }
    const _locale = locale();
    const locale_findAndReplace = _locale.findAndReplace;
    let range;
    if (
      Store.MBLsheet_select_save.length == 0 ||
      (Store.MBLsheet_select_save.length == 1 &&
        Store.MBLsheet_select_save[0].row[0] ==
          Store.MBLsheet_select_save[0].row[1] &&
        Store.MBLsheet_select_save[0].column[0] ==
          Store.MBLsheet_select_save[0].column[1])
    ) {
      range = [
        {
          row: [0, Store.flowdata.length - 1],
          column: [0, Store.flowdata[0].length - 1],
        },
      ];
    } else {
      range = $.extend(true, [], Store.MBLsheet_select_save);
    }

    let searchIndexArr = _this.getSearchIndexArr(searchText, range);

    if (searchIndexArr.length == 0) {
      if (isEditMode()) {
        alert(locale_findAndReplace.noFindTip);
      } else {
        tooltip.info(locale_findAndReplace.noFindTip, "");
      }

      return;
    }

    let count = 0;

    if (
      Store.MBLsheet_select_save.length == 0 ||
      (Store.MBLsheet_select_save.length == 1 &&
        Store.MBLsheet_select_save[0].row[0] ==
          Store.MBLsheet_select_save[0].row[1] &&
        Store.MBLsheet_select_save[0].column[0] ==
          Store.MBLsheet_select_save[0].column[1])
    ) {
      if (Store.MBLsheet_select_save.length == 0) {
        count = 0;
      } else {
        for (let i = 0; i < searchIndexArr.length; i++) {
          if (
            searchIndexArr[i].r == Store.MBLsheet_select_save[0].row[0] &&
            searchIndexArr[i].c == Store.MBLsheet_select_save[0].column[0]
          ) {
            if (i == searchIndexArr.length - 1) {
              count = 0;
            } else {
              count = i + 1;
            }

            break;
          }
        }
      }

      Store.MBLsheet_select_save = [
        {
          row: [searchIndexArr[count].r, searchIndexArr[count].r],
          column: [searchIndexArr[count].c, searchIndexArr[count].c],
        },
      ];
    } else {
      let rf = range[range.length - 1].row_focus;
      let cf = range[range.length - 1].column_focus;

      for (let i = 0; i < searchIndexArr.length; i++) {
        if (searchIndexArr[i].r == rf && searchIndexArr[i].c == cf) {
          if (i == searchIndexArr.length - 1) {
            count = 0;
          } else {
            count = i + 1;
          }

          break;
        }
      }

      for (let s = 0; s < range.length; s++) {
        let r1 = range[s].row[0],
          r2 = range[s].row[1];
        let c1 = range[s].column[0],
          c2 = range[s].column[1];

        if (
          searchIndexArr[count].r >= r1 &&
          searchIndexArr[count].r <= r2 &&
          searchIndexArr[count].c >= c1 &&
          searchIndexArr[count].c <= c2
        ) {
          let obj = range[s];
          obj["row_focus"] = searchIndexArr[count].r;
          obj["column_focus"] = searchIndexArr[count].c;
          range.splice(s, 1);
          range.push(obj);

          break;
        }
      }

      Store.MBLsheet_select_save = range;
    }

    selectHightlightShow();

    let scrollLeft = $("#MBLsheet-cell-main").scrollLeft(),
      scrollTop = $("#MBLsheet-cell-main").scrollTop();
    let winH = $("#MBLsheet-cell-main").height(),
      winW = $("#MBLsheet-cell-main").width();

    let row = Store.visibledatarow[searchIndexArr[count].r],
      row_pre =
        searchIndexArr[count].r - 1 == -1
          ? 0
          : Store.visibledatarow[searchIndexArr[count].r - 1];
    let col = Store.visibledatacolumn[searchIndexArr[count].c],
      col_pre =
        searchIndexArr[count].c - 1 == -1
          ? 0
          : Store.visibledatacolumn[searchIndexArr[count].c - 1];

    if (col - scrollLeft - winW + 20 > 0) {
      $("#MBLsheet-scrollbar-x").scrollLeft(col - winW + 20);
    } else if (col_pre - scrollLeft - 20 < 0) {
      $("#MBLsheet-scrollbar-x").scrollLeft(col_pre - 20);
    }

    if (row - scrollTop - winH + 20 > 0) {
      $("#MBLsheet-scrollbar-y").scrollTop(row - winH + 20);
    } else if (row_pre - scrollTop - 20 < 0) {
      $("#MBLsheet-scrollbar-y").scrollTop(row_pre - 20);
    }

    if ($("#searchAllbox").is(":visible")) {
      $("#MBLsheet-search-replace #searchAllbox .boxItem").removeClass("on");
    }
  },
  searchAll: function () {
    let _this = this;

    const _locale = locale();
    const locale_findAndReplace = _locale.findAndReplace;

    $("#MBLsheet-search-replace #searchAllbox").remove();

    let searchText = $("#MBLsheet-search-replace #searchInput input").val();
    if (searchText == "" || searchText == null) {
      return;
    }

    let range;
    if (
      Store.MBLsheet_select_save.length == 0 ||
      (Store.MBLsheet_select_save.length == 1 &&
        Store.MBLsheet_select_save[0].row[0] ==
          Store.MBLsheet_select_save[0].row[1] &&
        Store.MBLsheet_select_save[0].column[0] ==
          Store.MBLsheet_select_save[0].column[1])
    ) {
      range = [
        {
          row: [0, Store.flowdata.length - 1],
          column: [0, Store.flowdata[0].length - 1],
        },
      ];
    } else {
      range = $.extend(true, [], Store.MBLsheet_select_save);
    }

    let searchIndexArr = _this.getSearchIndexArr(searchText, range);

    if (searchIndexArr.length == 0) {
      if (isEditMode()) {
        alert(locale_findAndReplace.noFindTip);
      } else {
        tooltip.info(locale_findAndReplace.noFindTip, "");
      }

      return;
    }

    let searchAllHtml = "";

    for (let i = 0; i < searchIndexArr.length; i++) {
      let value_ShowEs = valueShowEs(
        searchIndexArr[i].r,
        searchIndexArr[i].c,
        Store.flowdata
      ).toString();

      if (value_ShowEs.indexOf("</") > -1 && value_ShowEs.indexOf(">") > -1) {
        searchAllHtml +=
          '<div class="boxItem" data-row="' +
          searchIndexArr[i].r +
          '" data-col="' +
          searchIndexArr[i].c +
          '" data-sheetIndex="' +
          Store.currentSheetIndex +
          '">' +
          "<span>" +
          escapeHtml(
            Store.MBLsheetfile[getSheetIndex(Store.currentSheetIndex)].name
          ) +
          "</span>" +
          "<span>" +
          chatatABC(searchIndexArr[i].c) +
          (searchIndexArr[i].r + 1) +
          "</span>" +
          "<span>" +
          escapeHtml(value_ShowEs) +
          "</span>" +
          "</div>";
      } else {
        searchAllHtml +=
          '<div class="boxItem" data-row="' +
          searchIndexArr[i].r +
          '" data-col="' +
          searchIndexArr[i].c +
          '" data-sheetIndex="' +
          Store.currentSheetIndex +
          '">' +
          "<span>" +
          Store.MBLsheetfile[getSheetIndex(Store.currentSheetIndex)].name +
          "</span>" +
          "<span>" +
          chatatABC(searchIndexArr[i].c) +
          (searchIndexArr[i].r + 1) +
          "</span>" +
          '<span title="' +
          escapeHtml(value_ShowEs) +
          '">' +
          escapeHtml(value_ShowEs) +
          "</span>" +
          "</div>";
      }
    }

    $(
      `<div id="searchAllbox"><div class="boxTitle"><span>${locale_findAndReplace.searchTargetSheet}</span><span>${locale_findAndReplace.searchTargetCell}</span><span>${locale_findAndReplace.searchTargetValue}</span></div><div class="boxMain">${searchAllHtml}</div></div>`
    ).appendTo($("#MBLsheet-search-replace"));

    $("#MBLsheet-search-replace #searchAllbox .boxItem")
      .eq(0)
      .addClass("on")
      .siblings()
      .removeClass("on");

    Store.MBLsheet_select_save = [
      {
        row: [searchIndexArr[0].r, searchIndexArr[0].r],
        column: [searchIndexArr[0].c, searchIndexArr[0].c],
      },
    ];

    selectHightlightShow();
  },
  getSearchIndexArr: function (searchText, range) {
    const arr = [];
    const obj = {};

    const $container = $("#MBLsheet-search-replace");
    const isChecked = (inputId) =>
      $container.find(`#${inputId} input[type='checkbox']`).is(":checked");

    //正则表达式匹配
    const regCheck = isChecked("regCheck");
    //整词匹配
    const wordCheck = isChecked("wordCheck");
    //区分大小写匹配
    const caseCheck = isChecked("caseCheck");

    let regExpFlags = "g";
    if (!caseCheck) {
      searchText = searchText.toLowerCase();
      regExpFlags += "i";
    }

    const addResult = (r, c) => {
      if (!(r + "_" + c in obj)) {
        obj[r + "_" + c] = 0;
        arr.push({ r: r, c: c });
      }
    };

    for (let s = 0; s < range.length; s++) {
      const r1 = range[s].row[0],
        r2 = range[s].row[1];
      const c1 = range[s].column[0],
        c2 = range[s].column[1];

      for (let r = r1; r <= r2; r++) {
        for (let c = c1; c <= c2; c++) {
          const cell = Store.flowdata[r][c];

          if (cell != null) {
            let value = valueShowEs(r, c, Store.flowdata);

            if (value == 0) {
              value = value.toString();
            }

            if (value != null && value != "") {
              let wasFound = false;
              value = value.toString();
              value = caseCheck ? value : value.toLowerCase();

              if (wordCheck) {
                //整词
                wasFound = searchText == value;
              } else if (regCheck) {
                //正则表达式
                let reg = new RegExp(
                  func_methods.getRegExpStr(searchText),
                  regExpFlags
                );
                wasFound = reg.test(value);
              } else {
                wasFound = ~value.indexOf(searchText);
              }

              wasFound && addResult(r, c);
            }
          }
        }
      }
    }

    return arr;
  },
  replace: function () {
    let _this = this;

    const _locale = locale();
    const locale_findAndReplace = _locale.findAndReplace;

    if (!Store.allowEdit) {
      tooltip.info(locale_findAndReplace.modeTip, "");
      return;
    }

    let searchText = $("#MBLsheet-search-replace #searchInput input").val();
    if (searchText == "" || searchText == null) {
      if (isEditMode()) {
        alert(locale_findAndReplace.searchInputTip);
      } else {
        tooltip.info(locale_findAndReplace.searchInputTip, "");
      }

      return;
    }

    let range;
    if (
      Store.MBLsheet_select_save.length == 0 ||
      (Store.MBLsheet_select_save.length == 1 &&
        Store.MBLsheet_select_save[0].row[0] ==
          Store.MBLsheet_select_save[0].row[1] &&
        Store.MBLsheet_select_save[0].column[0] ==
          Store.MBLsheet_select_save[0].column[1])
    ) {
      range = [
        {
          row: [0, Store.flowdata.length - 1],
          column: [0, Store.flowdata[0].length - 1],
        },
      ];
    } else {
      range = $.extend(true, [], Store.MBLsheet_select_save);
    }

    let searchIndexArr = _this.getSearchIndexArr(searchText, range);

    if (searchIndexArr.length == 0) {
      if (isEditMode()) {
        alert(locale_findAndReplace.noReplceTip);
      } else {
        tooltip.info(locale_findAndReplace.noReplceTip, "");
      }

      return;
    }

    let count = null;

    let last =
      Store.MBLsheet_select_save[Store.MBLsheet_select_save.length - 1];
    let rf = last.row_focus;
    let cf = last.column_focus;

    for (let i = 0; i < searchIndexArr.length; i++) {
      if (searchIndexArr[i].r == rf && searchIndexArr[i].c == cf) {
        count = i;
        break;
      }
    }

    if (count == null) {
      if (searchIndexArr.length == 0) {
        if (isEditMode()) {
          alert(locale_findAndReplace.noMatchTip);
        } else {
          tooltip.info(locale_findAndReplace.noMatchTip, "");
        }

        return;
      } else {
        count = 0;
      }
    }

    //正则表达式匹配
    let regCheck = false;
    if (
      $("#MBLsheet-search-replace #regCheck input[type='checkbox']").is(
        ":checked"
      )
    ) {
      regCheck = true;
    }

    //整词匹配
    let wordCheck = false;
    if (
      $("#MBLsheet-search-replace #wordCheck input[type='checkbox']").is(
        ":checked"
      )
    ) {
      wordCheck = true;
    }

    //区分大小写匹配
    let caseCheck = false;
    if (
      $("#MBLsheet-search-replace #caseCheck input[type='checkbox']").is(
        ":checked"
      )
    ) {
      caseCheck = true;
    }

    let replaceText = $("#MBLsheet-search-replace #replaceInput input").val();

    let d = editor.deepCopyFlowData(Store.flowdata);

    let r, c;
    if (wordCheck) {
      r = searchIndexArr[count].r;
      c = searchIndexArr[count].c;

      let v = replaceText;

      if (!checkProtectionLocked(r, c, Store.currentSheetIndex)) {
        return;
      }

      setcellvalue(r, c, d, v);
    } else {
      let reg;
      if (caseCheck) {
        reg = new RegExp(func_methods.getRegExpStr(searchText), "g");
      } else {
        reg = new RegExp(func_methods.getRegExpStr(searchText), "ig");
      }

      r = searchIndexArr[count].r;
      c = searchIndexArr[count].c;

      if (!checkProtectionLocked(r, c, Store.currentSheetIndex)) {
        return;
      }

      let v = valueShowEs(r, c, d).toString().replace(reg, replaceText);

      setcellvalue(r, c, d, v);
    }

    Store.MBLsheet_select_save = [{ row: [r, r], column: [c, c] }];

    if ($("#MBLsheet-search-replace #searchAllbox").is(":visible")) {
      $("#MBLsheet-search-replace #searchAllbox").hide();
    }

    jfrefreshgrid(d, Store.MBLsheet_select_save);
    selectHightlightShow();

    let scrollLeft = $("#MBLsheet-cell-main").scrollLeft(),
      scrollTop = $("#MBLsheet-cell-main").scrollTop();
    let winH = $("#MBLsheet-cell-main").height(),
      winW = $("#MBLsheet-cell-main").width();

    let row = Store.visibledatarow[r],
      row_pre = r - 1 == -1 ? 0 : Store.visibledatarow[r - 1];
    let col = Store.visibledatacolumn[c],
      col_pre = c - 1 == -1 ? 0 : Store.visibledatacolumn[c - 1];

    if (col - scrollLeft - winW + 20 > 0) {
      $("#MBLsheet-scrollbar-x").scrollLeft(col - winW + 20);
    } else if (col_pre - scrollLeft - 20 < 0) {
      $("#MBLsheet-scrollbar-x").scrollLeft(col_pre - 20);
    }

    if (row - scrollTop - winH + 20 > 0) {
      $("#MBLsheet-scrollbar-y").scrollTop(row - winH + 20);
    } else if (row_pre - scrollTop - 20 < 0) {
      $("#MBLsheet-scrollbar-y").scrollTop(row_pre - 20);
    }
  },
  replaceAll: function () {
    let _this = this;

    const _locale = locale();
    const locale_findAndReplace = _locale.findAndReplace;

    if (!Store.allowEdit) {
      tooltip.info(locale_findAndReplace.modeTip, "");
      return;
    }

    let searchText = $("#MBLsheet-search-replace #searchInput input").val();
    if (searchText == "" || searchText == null) {
      if (isEditMode()) {
        alert(locale_findAndReplace.searchInputTip);
      } else {
        tooltip.info(locale_findAndReplace.searchInputTip, "");
      }

      return;
    }

    let range;
    if (
      Store.MBLsheet_select_save.length == 0 ||
      (Store.MBLsheet_select_save.length == 1 &&
        Store.MBLsheet_select_save[0].row[0] ==
          Store.MBLsheet_select_save[0].row[1] &&
        Store.MBLsheet_select_save[0].column[0] ==
          Store.MBLsheet_select_save[0].column[1])
    ) {
      range = [
        {
          row: [0, Store.flowdata.length - 1],
          column: [0, Store.flowdata[0].length - 1],
        },
      ];
    } else {
      range = $.extend(true, [], Store.MBLsheet_select_save);
    }

    let searchIndexArr = _this.getSearchIndexArr(searchText, range);

    if (searchIndexArr.length == 0) {
      if (isEditMode()) {
        alert(locale_findAndReplace.noReplceTip);
      } else {
        tooltip.info(locale_findAndReplace.noReplceTip, "");
      }

      return;
    }

    //正则表达式匹配
    let regCheck = false;
    if (
      $("#MBLsheet-search-replace #regCheck input[type='checkbox']").is(
        ":checked"
      )
    ) {
      regCheck = true;
    }

    //整词匹配
    let wordCheck = false;
    if (
      $("#MBLsheet-search-replace #wordCheck input[type='checkbox']").is(
        ":checked"
      )
    ) {
      wordCheck = true;
    }

    //区分大小写匹配
    let caseCheck = false;
    if (
      $("#MBLsheet-search-replace #caseCheck input[type='checkbox']").is(
        ":checked"
      )
    ) {
      caseCheck = true;
    }

    let replaceText = $("#MBLsheet-search-replace #replaceInput input").val();

    let d = editor.deepCopyFlowData(Store.flowdata);
    let replaceCount = 0;
    if (wordCheck) {
      for (let i = 0; i < searchIndexArr.length; i++) {
        let r = searchIndexArr[i].r;
        let c = searchIndexArr[i].c;

        if (!checkProtectionLocked(r, c, Store.currentSheetIndex, false)) {
          continue;
        }

        let v = replaceText;

        setcellvalue(r, c, d, v);

        range.push({ row: [r, r], column: [c, c] });
        replaceCount++;
      }
    } else {
      let reg;
      if (caseCheck) {
        reg = new RegExp(func_methods.getRegExpStr(searchText), "g");
      } else {
        reg = new RegExp(func_methods.getRegExpStr(searchText), "ig");
      }

      for (let i = 0; i < searchIndexArr.length; i++) {
        let r = searchIndexArr[i].r;
        let c = searchIndexArr[i].c;

        if (!checkProtectionLocked(r, c, Store.currentSheetIndex, false)) {
          continue;
        }

        let v = valueShowEs(r, c, d).toString().replace(reg, replaceText);

        setcellvalue(r, c, d, v);

        range.push({ row: [r, r], column: [c, c] });
        replaceCount++;
      }
    }

    if ($("#MBLsheet-search-replace #searchAllbox").is(":visible")) {
      $("#MBLsheet-search-replace #searchAllbox").hide();
    }

    jfrefreshgrid(d, range);

    Store.MBLsheet_select_save = $.extend(true, [], range);
    selectHightlightShow();

    let succeedInfo = replaceHtml(locale_findAndReplace.successTip, {
      xlength: replaceCount,
    });
    if (isEditMode()) {
      alert(succeedInfo);
    } else {
      tooltip.info(succeedInfo, "");
    }
  },
};

export default MBLsheetSearchReplace;
