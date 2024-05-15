import { replaceHtml } from "../utils/util";
import { getcellvalue } from "../global/getdata";
import { MBLsheetrefreshgrid } from "../global/refresh";
import { rowLocation, colLocation, mouseposition } from "../global/location";
import formula from "../global/formula";
import tooltip from "../global/tooltip";
import editor from "../global/editor";
import { modelHTML } from "./constant";
import { selectHightlightShow } from "./select";
import server from "./server";
import sheetmanage from "./sheetmanage";
import MBLsheetFreezen from "./freezen";
import menuButton from "./menuButton";
import { getSheetIndex } from "../methods/get";
import locale from "../locale/locale";
import Store from "../store";

const hyperlinkCtrl = {
  item: {
    linkType: "external", //链接类型 external外部链接，internal内部链接
    linkAddress: "", //链接地址 网页地址或工作表单元格引用
    linkTooltip: "", //提示
  },
  hyperlink: null,
  createDialog: function () {
    let _this = this;

    const _locale = locale();
    const hyperlinkText = _locale.insertLink;
    const toolbarText = _locale.toolbar;
    const buttonText = _locale.button;

    $("#MBLsheet-modal-dialog-mask").show();
    $("#MBLsheet-insertLink-dialog").remove();

    let sheetListOption = "";
    Store.MBLsheetfile.forEach((item) => {
      sheetListOption += `<option value="${item.name}">${item.name}</option>`;
    });

    let content = `<div class="box">
                            <div class="box-item">
                                <label for="MBLsheet-insertLink-dialog-linkText">${hyperlinkText.linkText}：</label>
                                <input type="text" id="MBLsheet-insertLink-dialog-linkText"/>
                            </div>
                            <div class="box-item">
                                <label for="MBLsheet-insertLink-dialog-linkType">${hyperlinkText.linkType}：</label>
                                <select id="MBLsheet-insertLink-dialog-linkType">
                                    <option value="external">${hyperlinkText.external}</option>
                                    <option value="internal">${hyperlinkText.internal}</option>
                                </select>
                            </div>
                            <div class="show-box show-box-external">
                                <div class="box-item">
                                    <label for="MBLsheet-insertLink-dialog-linkAddress">${hyperlinkText.linkAddress}：</label>
                                    <input type="text" id="MBLsheet-insertLink-dialog-linkAddress" placeholder="${hyperlinkText.placeholder1}" />
                                </div>
                            </div>
                            <div class="show-box show-box-internal">
                                <div class="box-item">
                                    <label for="MBLsheet-insertLink-dialog-linkSheet">${hyperlinkText.linkSheet}：</label>
                                    <select id="MBLsheet-insertLink-dialog-linkSheet">
                                        ${sheetListOption}
                                    </select>
                                </div>
                                <div class="box-item">
                                    <label for="MBLsheet-insertLink-dialog-linkCell">${hyperlinkText.linkCell}：</label>
                                    <input type="text" id="MBLsheet-insertLink-dialog-linkCell" value="A1" placeholder="${hyperlinkText.placeholder2}" />
                                </div>
                            </div>
                            <div class="box-item">
                                <label for="MBLsheet-insertLink-dialog-linkTooltip">${hyperlinkText.linkTooltip}：</label>
                                <input type="text" id="MBLsheet-insertLink-dialog-linkTooltip" placeholder="${hyperlinkText.placeholder3}" />
                            </div>
                        </div>`;

    $("body").append(
      replaceHtml(modelHTML, {
        id: "MBLsheet-insertLink-dialog",
        addclass: "MBLsheet-insertLink-dialog",
        title: toolbarText.insertLink,
        content: content,
        botton: `<button id="MBLsheet-insertLink-dialog-confirm" class="btn btn-primary">${buttonText.confirm}</button>
                        <button class="btn btn-default MBLsheet-model-close-btn">${buttonText.cancel}</button>`,
        style: "z-index:100003",
      })
    );
    let $t = $("#MBLsheet-insertLink-dialog")
        .find(".MBLsheet-modal-dialog-content")
        .css("min-width", 350)
        .end(),
      myh = $t.outerHeight(),
      myw = $t.outerWidth();
    let winw = $(window).width(),
      winh = $(window).height();
    let scrollLeft = $(document).scrollLeft(),
      scrollTop = $(document).scrollTop();
    $("#MBLsheet-insertLink-dialog")
      .css({
        left: (winw + scrollLeft - myw) / 2,
        top: (winh + scrollTop - myh) / 3,
      })
      .show();

    _this.dataAllocation();
  },
  init: function () {
    let _this = this;

    const _locale = locale();
    const hyperlinkText = _locale.insertLink;

    //链接类型
    $(document)
      .off("change.linkType")
      .on(
        "change.linkType",
        "#MBLsheet-insertLink-dialog-linkType",
        function (e) {
          let value = this.value;

          $("#MBLsheet-insertLink-dialog .show-box").hide();
          $("#MBLsheet-insertLink-dialog .show-box-" + value).show();
        }
      );

    //确认按钮
    $(document)
      .off("click.confirm")
      .on("click.confirm", "#MBLsheet-insertLink-dialog-confirm", function (e) {
        let last =
          Store.MBLsheet_select_save[Store.MBLsheet_select_save.length - 1];
        let rowIndex = last.row_focus || last.row[0];
        let colIndex = last.column_focus || last.column[0];

        //文本
        let linkText = $("#MBLsheet-insertLink-dialog-linkText").val();

        let linkType = $("#MBLsheet-insertLink-dialog-linkType").val();
        let linkAddress = $("#MBLsheet-insertLink-dialog-linkAddress").val();
        let linkSheet = $("#MBLsheet-insertLink-dialog-linkSheet").val();
        let linkCell = $("#MBLsheet-insertLink-dialog-linkCell").val();
        let linkTooltip = $("#MBLsheet-insertLink-dialog-linkTooltip").val();

        if (linkType == "external") {
          if (!/^http[s]?:\/\//.test(linkAddress)) {
            linkAddress = "https://" + linkAddress;
          }

          if (
            !/^http[s]?:\/\/([\w\-\.]+)+[\w-]*([\w\-\.\/\?%&=]+)?$/gi.test(
              linkAddress
            )
          ) {
            tooltip.info(
              '<i class="fa fa-exclamation-triangle"></i>',
              hyperlinkText.tooltipInfo1
            );
            return;
          }
        } else {
          if (!formula.iscelldata(linkCell)) {
            tooltip.info(
              '<i class="fa fa-exclamation-triangle"></i>',
              hyperlinkText.tooltipInfo2
            );
            return;
          }

          linkAddress = linkSheet + "!" + linkCell;
        }

        if (linkText == null || linkText.replace(/\s/g, "") == "") {
          linkText = linkAddress;
        }

        let item = {
          linkType: linkType,
          linkAddress: linkAddress,
          linkTooltip: linkTooltip,
        };

        let historyHyperlink = $.extend(true, {}, _this.hyperlink);
        let currentHyperlink = $.extend(true, {}, _this.hyperlink);

        currentHyperlink[rowIndex + "_" + colIndex] = item;

        let d = editor.deepCopyFlowData(Store.flowdata);
        let cell = d[rowIndex][colIndex];

        if (cell == null) {
          cell = {};
        }

        cell.fc = "rgb(0, 0, 255)";
        cell.un = 1;
        cell.v = cell.m = linkText;

        d[rowIndex][colIndex] = cell;

        _this.ref(
          historyHyperlink,
          currentHyperlink,
          Store.currentSheetIndex,
          d,
          [{ row: [rowIndex, rowIndex], column: [colIndex, colIndex] }]
        );

        $("#MBLsheet-modal-dialog-mask").hide();
        $("#MBLsheet-insertLink-dialog").hide();
      });
  },
  dataAllocation: function () {
    let _this = this;

    let last =
      Store.MBLsheet_select_save[Store.MBLsheet_select_save.length - 1];
    let rowIndex = last.row_focus || last.row[0];
    let colIndex = last.column_focus || last.column[0];

    let hyperlink = _this.hyperlink || {};
    let item = hyperlink[rowIndex + "_" + colIndex] || {};

    //文本
    let text = getcellvalue(rowIndex, colIndex, null, "m");
    $("#MBLsheet-insertLink-dialog-linkText").val(text);

    //链接类型
    let linkType = item.linkType || "external";
    $("#MBLsheet-insertLink-dialog-linkType").val(linkType);

    $("#MBLsheet-insertLink-dialog .show-box").hide();
    $("#MBLsheet-insertLink-dialog .show-box-" + linkType).show();

    //链接地址
    let linkAddress = item.linkAddress || "";

    if (linkType == "external") {
      $("#MBLsheet-insertLink-dialog-linkAddress").val(linkAddress);
    } else {
      if (formula.iscelldata(linkAddress)) {
        let sheettxt = linkAddress.split("!")[0];
        let rangetxt = linkAddress.split("!")[1];

        $("#MBLsheet-insertLink-dialog-linkSheet").val(sheettxt);
        $("#MBLsheet-insertLink-dialog-linkCell").val(rangetxt);
      }
    }

    //提示
    let linkTooltip = item.linkTooltip || "";
    $("#MBLsheet-insertLink-dialog-linkTooltip").val(linkTooltip);
  },
  cellFocus: function (r, c) {
    let _this = this;

    if (_this.hyperlink == null || _this.hyperlink[r + "_" + c] == null) {
      return;
    }

    let item = _this.hyperlink[r + "_" + c];

    if (item.linkType == "external") {
      window.open(item.linkAddress);
    } else {
      let cellrange = formula.getcellrange(item.linkAddress);
      let sheetIndex = cellrange.sheetIndex;
      let range = [
        {
          row: cellrange.row,
          column: cellrange.column,
        },
      ];

      if (sheetIndex != Store.currentSheetIndex) {
        $("#MBLsheet-sheet-area div.MBLsheet-sheets-item").removeClass(
          "MBLsheet-sheets-item-active"
        );
        $("#MBLsheet-sheets-item" + sheetIndex).addClass(
          "MBLsheet-sheets-item-active"
        );

        sheetmanage.changeSheet(sheetIndex);
      }

      Store.MBLsheet_select_save = range;
      selectHightlightShow(true);

      let row_pre =
        cellrange.row[0] - 1 == -1
          ? 0
          : Store.visibledatarow[cellrange.row[0] - 1];
      let col_pre =
        cellrange.column[0] - 1 == -1
          ? 0
          : Store.cloumnLenSum[cellrange.column[0] - 1];

      $("#MBLsheet-scrollbar-x").scrollLeft(col_pre);
      $("#MBLsheet-scrollbar-y").scrollTop(row_pre);
    }
  },
  overshow: function (event) {
    let _this = this;

    $("#MBLsheet-hyperlink-overshow").remove();

    if ($(event.target).closest("#MBLsheet-cell-main").length == 0) {
      return;
    }

    let mouse = mouseposition(event.pageX, event.pageY);
    let scrollLeft = $("#MBLsheet-cell-main").scrollLeft();
    let scrollTop = $("#MBLsheet-cell-main").scrollTop();
    let x = mouse[0] + scrollLeft;
    let y = mouse[1] + scrollTop;

    if (
      MBLsheetFreezen.freezenverticaldata != null &&
      mouse[0] <
        MBLsheetFreezen.freezenverticaldata[0] -
          MBLsheetFreezen.freezenverticaldata[2]
    ) {
      return;
    }

    if (
      MBLsheetFreezen.freezenhorizontaldata != null &&
      mouse[1] <
        MBLsheetFreezen.freezenhorizontaldata[0] -
          MBLsheetFreezen.freezenhorizontaldata[2]
    ) {
      return;
    }

    let row_index = rowLocation(y)[2];
    let col_index = colLocation(x)[2];

    let margeset = menuButton.mergeborer(Store.flowdata, row_index, col_index);
    if (!!margeset) {
      row_index = margeset.row[2];
      col_index = margeset.column[2];
    }

    if (
      _this.hyperlink == null ||
      _this.hyperlink[row_index + "_" + col_index] == null
    ) {
      return;
    }

    let item = _this.hyperlink[row_index + "_" + col_index];
    let linkTooltip = item.linkTooltip;

    if (linkTooltip == null || linkTooltip.replace(/\s/g, "") == "") {
      linkTooltip = item.linkAddress;
    }

    let row = Store.visibledatarow[row_index],
      row_pre = row_index - 1 == -1 ? 0 : Store.visibledatarow[row_index - 1];
    let col = Store.cloumnLenSum[col_index],
      col_pre =
        col_index - 1 == -1 ? 0 : Store.cloumnLenSum[col_index - 1];

    if (!!margeset) {
      row = margeset.row[1];
      row_pre = margeset.row[0];

      col = margeset.column[1];
      col_pre = margeset.column[0];
    }

    let html = `<div id="MBLsheet-hyperlink-overshow" style="background:#fff;padding:5px 10px;border:1px solid #000;box-shadow:2px 2px #999;position:absolute;left:${col_pre}px;top:${
      row + 5
    }px;z-index:100;">
                        <div>${linkTooltip}</div>
                        <div>单击鼠标可以追踪</div>
                    </div>`;

    $(html).appendTo($("#MBLsheet-cell-main"));
  },
  ref: function (historyHyperlink, currentHyperlink, sheetIndex, d, range) {
    let _this = this;

    if (Store.clearjfundo) {
      Store.jfundo.length = 0;

      let redo = {};
      redo["type"] = "updateHyperlink";
      redo["sheetIndex"] = sheetIndex;
      redo["historyHyperlink"] = historyHyperlink;
      redo["currentHyperlink"] = currentHyperlink;
      redo["data"] = Store.flowdata;
      redo["curData"] = d;
      redo["range"] = range;
      Store.jfredo.push(redo);
    }

    _this.hyperlink = currentHyperlink;
    Store.MBLsheetfile[getSheetIndex(sheetIndex)].hyperlink = currentHyperlink;

    Store.flowdata = d;
    editor.webWorkerFlowDataCache(Store.flowdata); //worker存数据
    Store.MBLsheetfile[getSheetIndex(sheetIndex)].data = Store.flowdata;

    //共享编辑模式
    if (server.allowUpdate) {
      server.saveParam("all", sheetIndex, currentHyperlink, { k: "hyperlink" });
      server.historyParam(Store.flowdata, sheetIndex, range[0]);
    }

    setTimeout(function () {
      MBLsheetrefreshgrid();
    }, 1);
  },
};

export default hyperlinkCtrl;
