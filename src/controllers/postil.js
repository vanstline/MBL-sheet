import { rowLocation, colLocation, mouseposition } from "../global/location";
import editor from "../global/editor";
import formula from "../global/formula";
import { MBLsheetRangeLast } from "../global/cursorPos";
import { MBLsheetrefreshgrid } from "../global/refresh";
import { setMBLsheet_scroll_status } from "../methods/set";
import { getSheetIndex } from "../methods/get";
import { getObjType } from "../utils/util";
import MBLsheetFreezen from "./freezen";
import menuButton from "./menuButton";
import { checkProtectionAuthorityNormal } from "./protection";
import server from "./server";
import Store from "../store";
import method from "../global/method";

//批注
const MBLsheetPostil = {
  defaultWidth: 144,
  defaultHeight: 84,
  currentObj: null,
  currentWinW: null,
  currentWinH: null,
  resize: null,
  resizeXY: null,
  move: false,
  moveXY: null,
  init: function () {
    let _this = this;

    //点击批注框 聚焦
    $("#MBLsheet-postil-showBoxs")
      .off("mousedown.showPs")
      .on("mousedown.showPs", ".MBLsheet-postil-show", function (event) {
        if (
          !checkProtectionAuthorityNormal(
            Store.currentSheetIndex,
            "editObjects",
            false
          )
        ) {
          return;
        }

        _this.currentObj = $(this).find(".MBLsheet-postil-show-main");

        if ($(this).hasClass("MBLsheet-postil-show-active")) {
          event.stopPropagation();
          return;
        }

        _this.removeActivePs();

        $(this).addClass("MBLsheet-postil-show-active");
        $(this).find(".MBLsheet-postil-dialog-resize").show();
        $(this).find(".arrowCanvas").css("z-index", 200);
        $(this).find(".MBLsheet-postil-show-main").css("z-index", 200);

        event.stopPropagation();
      });
    $("#MBLsheet-postil-showBoxs")
      .off("mouseup.showPs")
      .on("mouseup.showPs", ".MBLsheet-postil-show", function (event) {
        if (event.which == "3") {
          event.stopPropagation();
        }
      });

    //批注框 改变大小
    $("#MBLsheet-postil-showBoxs")
      .off("mousedown.resize")
      .on(
        "mousedown.resize",
        ".MBLsheet-postil-show .MBLsheet-postil-dialog-resize .MBLsheet-postil-dialog-resize-item",
        function (event) {
          if (
            !checkProtectionAuthorityNormal(
              Store.currentSheetIndex,
              "editObjects",
              false
            )
          ) {
            return;
          }

          _this.currentObj = $(this).closest(".MBLsheet-postil-show-main");
          _this.currentWinW = $("#MBLsheet-cell-main")[0].scrollWidth;
          _this.currentWinH = $("#MBLsheet-cell-main")[0].scrollHeight;

          _this.resize = $(this).data("type");

          let scrollTop = $("#MBLsheet-cell-main").scrollTop(),
            scrollLeft = $("#MBLsheet-cell-main").scrollLeft();
          let mouse = mouseposition(event.pageX, event.pageY);
          let x = mouse[0] + scrollLeft;
          let y = mouse[1] + scrollTop;

          let position = _this.currentObj.position();
          let width = _this.currentObj.width();
          let height = _this.currentObj.height();

          _this.resizeXY = [
            x,
            y,
            width,
            height,
            position.left + scrollLeft,
            position.top + scrollTop,
            scrollLeft,
            scrollTop,
          ];

          setMBLsheet_scroll_status(true);

          if (
            $(this)
              .closest(".MBLsheet-postil-show")
              .hasClass("MBLsheet-postil-show-active")
          ) {
            event.stopPropagation();
            return;
          }

          _this.removeActivePs();

          $(this)
            .closest(".MBLsheet-postil-show")
            .addClass("MBLsheet-postil-show-active");
          $(this)
            .closest(".MBLsheet-postil-show")
            .find(".MBLsheet-postil-dialog-resize")
            .show();
          $(this)
            .closest(".MBLsheet-postil-show")
            .find(".arrowCanvas")
            .css("z-index", 200);
          $(this)
            .closest(".MBLsheet-postil-show")
            .find(".MBLsheet-postil-show-main")
            .css("z-index", 200);

          event.stopPropagation();
        }
      );

    //批注框 移动
    $("#MBLsheet-postil-showBoxs")
      .off("mousedown.move")
      .on(
        "mousedown.move",
        ".MBLsheet-postil-show .MBLsheet-postil-dialog-move .MBLsheet-postil-dialog-move-item",
        function (event) {
          if (
            !checkProtectionAuthorityNormal(
              Store.currentSheetIndex,
              "editObjects",
              false
            )
          ) {
            return;
          }

          _this.currentObj = $(this).closest(".MBLsheet-postil-show-main");
          _this.currentWinW = $("#MBLsheet-cell-main")[0].scrollWidth;
          _this.currentWinH = $("#MBLsheet-cell-main")[0].scrollHeight;

          _this.move = true;

          let scrollTop = $("#MBLsheet-cell-main").scrollTop(),
            scrollLeft = $("#MBLsheet-cell-main").scrollLeft();

          let offset = _this.currentObj.offset();
          let position = _this.currentObj.position();

          _this.moveXY = [
            event.pageX - offset.left,
            event.pageY - offset.top,
            position.left,
            position.top,
            scrollLeft,
            scrollTop,
          ];

          setMBLsheet_scroll_status(true);

          if (
            $(this)
              .closest(".MBLsheet-postil-show")
              .hasClass("MBLsheet-postil-show-active")
          ) {
            event.stopPropagation();
            return;
          }

          _this.removeActivePs();

          $(this)
            .closest(".MBLsheet-postil-show")
            .addClass("MBLsheet-postil-show-active");
          $(this)
            .closest(".MBLsheet-postil-show")
            .find(".MBLsheet-postil-dialog-resize")
            .show();
          $(this)
            .closest(".MBLsheet-postil-show")
            .find(".arrowCanvas")
            .css("z-index", 200);
          $(this)
            .closest(".MBLsheet-postil-show")
            .find(".MBLsheet-postil-show-main")
            .css("z-index", 200);

          event.stopPropagation();
        }
      );
  },
  overshow: function (event) {
    let _this = this;

    $("#MBLsheet-postil-overshow").remove();

    if ($(event.target).closest("#MBLsheet-cell-main").length == 0) {
      return;
    }

    let mouse = mouseposition(event.pageX, event.pageY);
    let scrollLeft = $("#MBLsheet-cell-main").scrollLeft();
    let scrollTop = $("#MBLsheet-cell-main").scrollTop();
    let x = mouse[0];
    let y = mouse[1];
    let offsetX = 0;
    let offsetY = 0;

    if (
      MBLsheetFreezen.freezenverticaldata != null &&
      mouse[0] <
        MBLsheetFreezen.freezenverticaldata[0] -
          MBLsheetFreezen.freezenverticaldata[2]
    ) {
      offsetX = scrollLeft;
    } else {
      x += scrollLeft;
    }

    if (
      MBLsheetFreezen.freezenhorizontaldata != null &&
      mouse[1] <
        MBLsheetFreezen.freezenhorizontaldata[0] -
          MBLsheetFreezen.freezenhorizontaldata[2]
    ) {
      offsetY = scrollTop;
    } else {
      y += scrollTop;
    }

    let row_index = rowLocation(y)[2];
    let col_index = colLocation(x)[2];

    let margeset = menuButton.mergeborer(Store.flowdata, row_index, col_index);
    if (!!margeset) {
      row_index = margeset.row[2];
      col_index = margeset.column[2];
    }

    if (
      Store.flowdata[row_index] == null ||
      Store.flowdata[row_index][col_index] == null ||
      Store.flowdata[row_index][col_index].ps == null
    ) {
      return;
    }

    let postil = Store.flowdata[row_index][col_index].ps;

    if (
      postil["isshow"] ||
      $("#MBLsheet-postil-show_" + row_index + "_" + col_index).length > 0
    ) {
      return;
    }

    let value = postil["value"] == null ? "" : postil["value"];

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

    let toX = col + offsetX;
    let toY = row_pre + offsetY;

    let fromX = toX + 18 * Store.zoomRatio;
    let fromY = toY - 18 * Store.zoomRatio;

    if (fromY < 0) {
      fromY = 2;
    }

    let width =
      postil["width"] == null
        ? _this.defaultWidth * Store.zoomRatio
        : postil["width"] * Store.zoomRatio;
    let height =
      postil["height"] == null
        ? _this.defaultHeight * Store.zoomRatio
        : postil["height"] * Store.zoomRatio;

    let size = _this.getArrowCanvasSize(fromX, fromY, toX, toY);

    let commentDivs = "";
    let valueLines = value.split("\n");
    for (let line of valueLines) {
      commentDivs += "<div>" + _this.htmlEscape(line) + "</div>";
    }

    let html =
      '<div id="MBLsheet-postil-overshow">' +
      '<canvas class="arrowCanvas" width="' +
      size[2] +
      '" height="' +
      size[3] +
      '" style="position:absolute;left:' +
      size[0] +
      "px;top:" +
      size[1] +
      'px;z-index:100;pointer-events:none;"></canvas>' +
      '<div style="width:' +
      (width - 12) +
      "px;min-height:" +
      (height - 12) +
      "px;color:#000;padding:5px;border:1px solid #000;background-color:rgb(255,255,225);position:absolute;left:" +
      fromX +
      "px;top:" +
      fromY +
      'px;z-index:100;">' +
      commentDivs +
      "</div>" +
      "</div>";

    $(html).appendTo($("#MBLsheet-cell-main"));

    let ctx = $("#MBLsheet-postil-overshow .arrowCanvas")
      .get(0)
      .getContext("2d");

    _this.drawArrow(ctx, size[4], size[5], size[6], size[7]);
  },
  getArrowCanvasSize: function (fromX, fromY, toX, toY) {
    let left = toX - 5;

    if (fromX < toX) {
      left = fromX - 5;
    }

    let top = toY - 5;

    if (fromY < toY) {
      top = fromY - 5;
    }

    let width = Math.abs(fromX - toX) + 10;
    let height = Math.abs(fromY - toY) + 10;

    let x1 = width - 5;
    let x2 = 5;

    if (fromX < toX) {
      x1 = 5;
      x2 = width - 5;
    }

    let y1 = height - 5;
    let y2 = 5;

    if (fromY < toY) {
      y1 = 5;
      y2 = height - 5;
    }

    return [left, top, width, height, x1, y1, x2, y2];
  },
  drawArrow: function (
    ctx,
    fromX,
    fromY,
    toX,
    toY,
    theta,
    headlen,
    width,
    color
  ) {
    theta = getObjType(theta) == "undefined" ? 30 : theta;
    headlen = getObjType(headlen) == "undefined" ? 6 : headlen;
    width = getObjType(width) == "undefined" ? 1 : width;
    color = getObjType(color) == "undefined" ? "#000" : color;

    // 计算各角度和对应的P2,P3坐标
    let angle = (Math.atan2(fromY - toY, fromX - toX) * 180) / Math.PI,
      angle1 = ((angle + theta) * Math.PI) / 180,
      angle2 = ((angle - theta) * Math.PI) / 180,
      topX = headlen * Math.cos(angle1),
      topY = headlen * Math.sin(angle1),
      botX = headlen * Math.cos(angle2),
      botY = headlen * Math.sin(angle2);

    ctx.save();
    ctx.beginPath();

    let arrowX = fromX - topX,
      arrowY = fromY - topY;

    ctx.moveTo(arrowX, arrowY);
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);

    ctx.lineWidth = width;
    ctx.strokeStyle = color;
    ctx.stroke();

    arrowX = toX + topX;
    arrowY = toY + topY;
    ctx.moveTo(arrowX, arrowY);
    ctx.lineTo(toX, toY);
    arrowX = toX + botX;
    arrowY = toY + botY;
    ctx.lineTo(arrowX, arrowY);

    ctx.fillStyle = color;
    ctx.fill();
    ctx.restore();
  },
  buildAllPs: function (data) {
    let _this = this;

    $("#MBLsheet-cell-main #MBLsheet-postil-showBoxs").empty();

    for (let r = 0; r < data.length; r++) {
      for (let c = 0; c < data[0].length; c++) {
        if (data[r][c] != null && data[r][c].ps != null) {
          let postil = data[r][c].ps;
          _this.buildPs(r, c, postil);
        }
      }
    }

    _this.init();
  },
  buildPs: function (r, c, postil) {
    if ($("#MBLsheet-postil-show_" + r + "_" + c).length > 0) {
      $("#MBLsheet-postil-show_" + r + "_" + c).remove();
    }

    if (postil == null) {
      return;
    }

    let _this = this;
    let isshow = postil["isshow"] == null ? false : postil["isshow"];

    if (isshow) {
      let row = Store.visibledatarow[r],
        row_pre = r - 1 == -1 ? 0 : Store.visibledatarow[r - 1];
      let col = Store.cloumnLenSum[c],
        col_pre = c - 1 == -1 ? 0 : Store.cloumnLenSum[c - 1];

      let margeset = menuButton.mergeborer(Store.flowdata, r, c);
      if (!!margeset) {
        row = margeset.row[1];
        row_pre = margeset.row[0];

        col = margeset.column[1];
        col_pre = margeset.column[0];
      }

      let toX = col;
      let toY = row_pre;

      let left =
        postil["left"] == null
          ? toX + 18 * Store.zoomRatio
          : postil["left"] * Store.zoomRatio;
      let top =
        postil["top"] == null
          ? toY - 18 * Store.zoomRatio
          : postil["top"] * Store.zoomRatio;
      let width =
        postil["width"] == null
          ? _this.defaultWidth * Store.zoomRatio
          : postil["width"] * Store.zoomRatio;
      let height =
        postil["height"] == null
          ? _this.defaultHeight * Store.zoomRatio
          : postil["height"] * Store.zoomRatio;
      let value = postil["value"] == null ? "" : postil["value"];

      if (top < 0) {
        top = 2;
      }

      let size = _this.getArrowCanvasSize(left, top, toX, toY);

      let commentDivs = "";
      let valueLines = value.split("\n");
      for (let line of valueLines) {
        commentDivs += "<div>" + _this.htmlEscape(line) + "</div>";
      }

      let html =
        '<div id="MBLsheet-postil-show_' +
        r +
        "_" +
        c +
        '" class="MBLsheet-postil-show">' +
        '<canvas class="arrowCanvas" width="' +
        size[2] +
        '" height="' +
        size[3] +
        '" style="position:absolute;left:' +
        size[0] +
        "px;top:" +
        size[1] +
        'px;z-index:100;pointer-events:none;"></canvas>' +
        '<div class="MBLsheet-postil-show-main" style="width:' +
        width +
        "px;height:" +
        height +
        "px;color:#000;padding:5px;border:1px solid #000;background-color:rgb(255,255,225);position:absolute;left:" +
        left +
        "px;top:" +
        top +
        'px;box-sizing:border-box;z-index:100;">' +
        '<div class="MBLsheet-postil-dialog-move">' +
        '<div class="MBLsheet-postil-dialog-move-item MBLsheet-postil-dialog-move-item-t" data-type="t"></div>' +
        '<div class="MBLsheet-postil-dialog-move-item MBLsheet-postil-dialog-move-item-r" data-type="r"></div>' +
        '<div class="MBLsheet-postil-dialog-move-item MBLsheet-postil-dialog-move-item-b" data-type="b"></div>' +
        '<div class="MBLsheet-postil-dialog-move-item MBLsheet-postil-dialog-move-item-l" data-type="l"></div>' +
        "</div>" +
        '<div class="MBLsheet-postil-dialog-resize" style="display:none;">' +
        '<div class="MBLsheet-postil-dialog-resize-item MBLsheet-postil-dialog-resize-item-lt" data-type="lt"></div>' +
        '<div class="MBLsheet-postil-dialog-resize-item MBLsheet-postil-dialog-resize-item-mt" data-type="mt"></div>' +
        '<div class="MBLsheet-postil-dialog-resize-item MBLsheet-postil-dialog-resize-item-lm" data-type="lm"></div>' +
        '<div class="MBLsheet-postil-dialog-resize-item MBLsheet-postil-dialog-resize-item-rm" data-type="rm"></div>' +
        '<div class="MBLsheet-postil-dialog-resize-item MBLsheet-postil-dialog-resize-item-rt" data-type="rt"></div>' +
        '<div class="MBLsheet-postil-dialog-resize-item MBLsheet-postil-dialog-resize-item-lb" data-type="lb"></div>' +
        '<div class="MBLsheet-postil-dialog-resize-item MBLsheet-postil-dialog-resize-item-mb" data-type="mb"></div>' +
        '<div class="MBLsheet-postil-dialog-resize-item MBLsheet-postil-dialog-resize-item-rb" data-type="rb"></div>' +
        "</div>" +
        '<div style="width:100%;height:100%;overflow:hidden;">' +
        '<div class="formulaInputFocus" style="width:' +
        (width - 12) +
        "px;height:" +
        (height - 12) +
        'px;line-height:20px;box-sizing:border-box;text-align: center;;word-break:break-all;" spellcheck="false" contenteditable="true">' +
        commentDivs +
        "</div>" +
        "</div>" +
        "</div>" +
        "</div>";

      $(html).appendTo($("#MBLsheet-cell-main #MBLsheet-postil-showBoxs"));

      let ctx = $("#MBLsheet-postil-show_" + r + "_" + c + " .arrowCanvas")
        .get(0)
        .getContext("2d");

      _this.drawArrow(ctx, size[4], size[5], size[6], size[7]);
    }
  },
  newPs: function (r, c) {
    if (
      !checkProtectionAuthorityNormal(Store.currentSheetIndex, "editObjects")
    ) {
      return;
    }

    // Hook function
    if (!method.createHookFunction("commentInsertBefore", r, c)) {
      return;
    }

    let _this = this;

    let row = Store.visibledatarow[r],
      row_pre = r - 1 == -1 ? 0 : Store.visibledatarow[r - 1];
    let col = Store.cloumnLenSum[c],
      col_pre = c - 1 == -1 ? 0 : Store.cloumnLenSum[c - 1];

    let margeset = menuButton.mergeborer(Store.flowdata, r, c);
    if (!!margeset) {
      row = margeset.row[1];
      row_pre = margeset.row[0];

      col = margeset.column[1];
      col_pre = margeset.column[0];
    }

    let toX = col;
    let toY = row_pre;

    let fromX = toX + 18 * Store.zoomRatio;
    let fromY = toY - 18 * Store.zoomRatio;

    if (fromY < 0) {
      fromY = 2;
    }

    let width = _this.defaultWidth * Store.zoomRatio;
    let height = _this.defaultHeight * Store.zoomRatio;

    let size = _this.getArrowCanvasSize(fromX, fromY, toX, toY);

    let html =
      '<div id="MBLsheet-postil-show_' +
      r +
      "_" +
      c +
      '" class="MBLsheet-postil-show MBLsheet-postil-show-active">' +
      '<canvas class="arrowCanvas" width="' +
      size[2] +
      '" height="' +
      size[3] +
      '" style="position:absolute;left:' +
      size[0] +
      "px;top:" +
      size[1] +
      'px;z-index:100;pointer-events:none;"></canvas>' +
      '<div class="MBLsheet-postil-show-main" style="width:' +
      width +
      "px;height:" +
      height +
      "px;color:#000;padding:5px;border:1px solid #000;background-color:rgb(255,255,225);position:absolute;left:" +
      fromX +
      "px;top:" +
      fromY +
      'px;box-sizing:border-box;z-index:100;">' +
      '<div class="MBLsheet-postil-dialog-move">' +
      '<div class="MBLsheet-postil-dialog-move-item MBLsheet-postil-dialog-move-item-t" data-type="t"></div>' +
      '<div class="MBLsheet-postil-dialog-move-item MBLsheet-postil-dialog-move-item-r" data-type="r"></div>' +
      '<div class="MBLsheet-postil-dialog-move-item MBLsheet-postil-dialog-move-item-b" data-type="b"></div>' +
      '<div class="MBLsheet-postil-dialog-move-item MBLsheet-postil-dialog-move-item-l" data-type="l"></div>' +
      "</div>" +
      '<div class="MBLsheet-postil-dialog-resize">' +
      '<div class="MBLsheet-postil-dialog-resize-item MBLsheet-postil-dialog-resize-item-lt" data-type="lt"></div>' +
      '<div class="MBLsheet-postil-dialog-resize-item MBLsheet-postil-dialog-resize-item-mt" data-type="mt"></div>' +
      '<div class="MBLsheet-postil-dialog-resize-item MBLsheet-postil-dialog-resize-item-lm" data-type="lm"></div>' +
      '<div class="MBLsheet-postil-dialog-resize-item MBLsheet-postil-dialog-resize-item-rm" data-type="rm"></div>' +
      '<div class="MBLsheet-postil-dialog-resize-item MBLsheet-postil-dialog-resize-item-rt" data-type="rt"></div>' +
      '<div class="MBLsheet-postil-dialog-resize-item MBLsheet-postil-dialog-resize-item-lb" data-type="lb"></div>' +
      '<div class="MBLsheet-postil-dialog-resize-item MBLsheet-postil-dialog-resize-item-mb" data-type="mb"></div>' +
      '<div class="MBLsheet-postil-dialog-resize-item MBLsheet-postil-dialog-resize-item-rb" data-type="rb"></div>' +
      "</div>" +
      '<div style="width:100%;height:100%;overflow:hidden;">' +
      '<div class="formulaInputFocus" style="width:132px;height:72px;line-height:20px;box-sizing:border-box;text-align: center;word-break:break-all;" spellcheck="false" contenteditable="true">' +
      "</div>" +
      "</div>" +
      "</div>" +
      "</div>";

    $(html).appendTo($("#MBLsheet-cell-main #MBLsheet-postil-showBoxs"));

    let ctx = $("#MBLsheet-postil-show_" + r + "_" + c + " .arrowCanvas")
      .get(0)
      .getContext("2d");

    _this.drawArrow(ctx, size[4], size[5], size[6], size[7]);

    $("#MBLsheet-postil-show_" + r + "_" + c + " .formulaInputFocus").focus();

    _this.init();

    let d = editor.deepCopyFlowData(Store.flowdata);
    let rc = [];

    if (d[r][c] == null) {
      d[r][c] = {};
    }

    d[r][c].ps = {
      left: null,
      top: null,
      width: null,
      height: null,
      value: "",
      isshow: false,
    };
    rc.push(r + "_" + c);

    _this.ref(d, rc);

    // Hook function
    setTimeout(() => {
      method.createHookFunction("commentInsertAfter", r, c, d[r][c]);
    }, 0);
  },
  editPs: function (r, c) {
    let _this = this;

    if (
      !checkProtectionAuthorityNormal(Store.currentSheetIndex, "editObjects")
    ) {
      return;
    }

    if ($("#MBLsheet-postil-show_" + r + "_" + c).length > 0) {
      $("#MBLsheet-postil-show_" + r + "_" + c).show();
      $("#MBLsheet-postil-show_" + r + "_" + c).addClass(
        "MBLsheet-postil-show-active"
      );
      $("#MBLsheet-postil-show_" + r + "_" + c)
        .find(".MBLsheet-postil-dialog-resize")
        .show();
    } else {
      let postil = Store.flowdata[r][c].ps;

      let row = Store.visibledatarow[r],
        row_pre = r - 1 == -1 ? 0 : Store.visibledatarow[r - 1];
      let col = Store.cloumnLenSum[c],
        col_pre = c - 1 == -1 ? 0 : Store.cloumnLenSum[c - 1];

      let margeset = menuButton.mergeborer(Store.flowdata, r, c);
      if (!!margeset) {
        row = margeset.row[1];
        row_pre = margeset.row[0];

        col = margeset.column[1];
        col_pre = margeset.column[0];
      }

      let toX = col;
      let toY = row_pre;

      let left =
        postil["left"] == null
          ? toX + 18 * Store.zoomRatio
          : postil["left"] * Store.zoomRatio;
      let top =
        postil["top"] == null
          ? toY - 18 * Store.zoomRatio
          : postil["top"] * Store.zoomRatio;
      let width =
        postil["width"] == null
          ? _this.defaultWidth * Store.zoomRatio
          : postil["width"] * Store.zoomRatio;
      let height =
        postil["height"] == null
          ? _this.defaultHeight * Store.zoomRatio
          : postil["height"] * Store.zoomRatio;
      let value = postil["value"] == null ? "" : postil["value"];

      if (top < 0) {
        top = 2;
      }

      let size = _this.getArrowCanvasSize(left, top, toX, toY);

      let commentDivs = "";
      let valueLines = value.split("\n");
      for (let line of valueLines) {
        commentDivs += "<div>" + _this.htmlEscape(line) + "</div>";
      }

      let html =
        '<div id="MBLsheet-postil-show_' +
        r +
        "_" +
        c +
        '" class="MBLsheet-postil-show MBLsheet-postil-show-active">' +
        '<canvas class="arrowCanvas" width="' +
        size[2] +
        '" height="' +
        size[3] +
        '" style="position:absolute;left:' +
        size[0] +
        "px;top:" +
        size[1] +
        'px;z-index:100;pointer-events:none;"></canvas>' +
        '<div class="MBLsheet-postil-show-main" style="width:' +
        width +
        "px;height:" +
        height +
        "px;color:#000;padding:5px;border:1px solid #000;background-color:rgb(255,255,225);position:absolute;left:" +
        left +
        "px;top:" +
        top +
        'px;box-sizing:border-box;z-index:100;">' +
        '<div class="MBLsheet-postil-dialog-move">' +
        '<div class="MBLsheet-postil-dialog-move-item MBLsheet-postil-dialog-move-item-t" data-type="t"></div>' +
        '<div class="MBLsheet-postil-dialog-move-item MBLsheet-postil-dialog-move-item-r" data-type="r"></div>' +
        '<div class="MBLsheet-postil-dialog-move-item MBLsheet-postil-dialog-move-item-b" data-type="b"></div>' +
        '<div class="MBLsheet-postil-dialog-move-item MBLsheet-postil-dialog-move-item-l" data-type="l"></div>' +
        "</div>" +
        '<div class="MBLsheet-postil-dialog-resize">' +
        '<div class="MBLsheet-postil-dialog-resize-item MBLsheet-postil-dialog-resize-item-lt" data-type="lt"></div>' +
        '<div class="MBLsheet-postil-dialog-resize-item MBLsheet-postil-dialog-resize-item-mt" data-type="mt"></div>' +
        '<div class="MBLsheet-postil-dialog-resize-item MBLsheet-postil-dialog-resize-item-lm" data-type="lm"></div>' +
        '<div class="MBLsheet-postil-dialog-resize-item MBLsheet-postil-dialog-resize-item-rm" data-type="rm"></div>' +
        '<div class="MBLsheet-postil-dialog-resize-item MBLsheet-postil-dialog-resize-item-rt" data-type="rt"></div>' +
        '<div class="MBLsheet-postil-dialog-resize-item MBLsheet-postil-dialog-resize-item-lb" data-type="lb"></div>' +
        '<div class="MBLsheet-postil-dialog-resize-item MBLsheet-postil-dialog-resize-item-mb" data-type="mb"></div>' +
        '<div class="MBLsheet-postil-dialog-resize-item MBLsheet-postil-dialog-resize-item-rb" data-type="rb"></div>' +
        "</div>" +
        '<div style="width:100%;height:100%;overflow:hidden;">' +
        '<div class="formulaInputFocus" style="width:' +
        (width - 12) +
        "px;height:" +
        (height - 12) +
        'px;line-height:20px;box-sizing:border-box;text-align: center;;word-break:break-all;" spellcheck="false" contenteditable="true">' +
        commentDivs +
        "</div>" +
        "</div>" +
        "</div>" +
        "</div>";

      $(html).appendTo($("#MBLsheet-cell-main #MBLsheet-postil-showBoxs"));

      let ctx = $("#MBLsheet-postil-show_" + r + "_" + c + " .arrowCanvas")
        .get(0)
        .getContext("2d");

      _this.drawArrow(ctx, size[4], size[5], size[6], size[7]);
    }

    $("#MBLsheet-postil-show_" + r + "_" + c + " .formulaInputFocus").focus();
    MBLsheetRangeLast(
      $("#MBLsheet-postil-show_" + r + "_" + c + " .formulaInputFocus").get(0)
    );

    _this.init();
  },
  delPs: function (r, c) {
    if (
      !checkProtectionAuthorityNormal(Store.currentSheetIndex, "editObjects")
    ) {
      return;
    }

    // Hook function
    if (
      !method.createHookFunction(
        "commentDeleteBefore",
        r,
        c,
        Store.flowdata[r][c]
      )
    ) {
      return;
    }

    if ($("#MBLsheet-postil-show_" + r + "_" + c).length > 0) {
      $("#MBLsheet-postil-show_" + r + "_" + c).remove();
    }

    let d = editor.deepCopyFlowData(Store.flowdata);
    let rc = [];

    delete d[r][c].ps;
    rc.push(r + "_" + c);

    this.ref(d, rc);

    // Hook function
    setTimeout(() => {
      method.createHookFunction(
        "commentDeleteAfter",
        r,
        c,
        Store.flowdata[r][c]
      );
    }, 0);
  },
  showHidePs: function (r, c) {
    let _this = this;

    let postil = Store.flowdata[r][c].ps;
    let isshow = postil["isshow"];

    let d = editor.deepCopyFlowData(Store.flowdata);
    let rc = [];

    if (isshow) {
      d[r][c].ps.isshow = false;

      $("#MBLsheet-postil-show_" + r + "_" + c).remove();
    } else {
      d[r][c].ps.isshow = true;

      let row = Store.visibledatarow[r],
        row_pre = r - 1 == -1 ? 0 : Store.visibledatarow[r - 1];
      let col = Store.cloumnLenSum[c],
        col_pre = c - 1 == -1 ? 0 : Store.cloumnLenSum[c - 1];

      let margeset = menuButton.mergeborer(Store.flowdata, r, c);
      if (!!margeset) {
        row = margeset.row[1];
        row_pre = margeset.row[0];

        col = margeset.column[1];
        col_pre = margeset.column[0];
      }

      let scrollLeft = $("#MBLsheet-cell-main").scrollLeft();
      let scrollTop = $("#MBLsheet-cell-main").scrollTop();

      let toX = col;
      let toY = row_pre;

      if (
        MBLsheetFreezen.freezenverticaldata != null &&
        toX <
          MBLsheetFreezen.freezenverticaldata[0] -
            MBLsheetFreezen.freezenverticaldata[2]
      ) {
        toX += scrollLeft;
      }
      if (
        MBLsheetFreezen.freezenhorizontaldata != null &&
        toY <
          MBLsheetFreezen.freezenhorizontaldata[0] -
            MBLsheetFreezen.freezenhorizontaldata[2]
      ) {
        toY += scrollTop;
      }

      let left =
        postil["left"] == null
          ? toX + 18 * Store.zoomRatio
          : postil["left"] * Store.zoomRatio;
      let top =
        postil["top"] == null
          ? toY - 18 * Store.zoomRatio
          : postil["top"] * Store.zoomRatio;
      let width =
        postil["width"] == null
          ? _this.defaultWidth * Store.zoomRatio
          : postil["width"] * Store.zoomRatio;
      let height =
        postil["height"] == null
          ? _this.defaultHeight * Store.zoomRatio
          : postil["height"] * Store.zoomRatio;
      let value = postil["value"] == null ? "" : postil["value"];

      if (top < 0) {
        top = 2;
      }

      let size = _this.getArrowCanvasSize(left, top, toX, toY);
      let commentDivs = "";
      let valueLines = value.split("\n");
      for (let line of valueLines) {
        commentDivs += "<div>" + _this.htmlEscape(line) + "</div>";
      }
      let html =
        '<div id="MBLsheet-postil-show_' +
        r +
        "_" +
        c +
        '" class="MBLsheet-postil-show">' +
        '<canvas class="arrowCanvas" width="' +
        size[2] +
        '" height="' +
        size[3] +
        '" style="position:absolute;left:' +
        size[0] +
        "px;top:" +
        size[1] +
        'px;z-index:100;pointer-events:none;"></canvas>' +
        '<div class="MBLsheet-postil-show-main" style="width:' +
        width +
        "px;height:" +
        height +
        "px;color:#000;padding:5px;border:1px solid #000;background-color:rgb(255,255,225);position:absolute;left:" +
        left +
        "px;top:" +
        top +
        'px;box-sizing:border-box;z-index:100;">' +
        '<div class="MBLsheet-postil-dialog-move">' +
        '<div class="MBLsheet-postil-dialog-move-item MBLsheet-postil-dialog-move-item-t" data-type="t"></div>' +
        '<div class="MBLsheet-postil-dialog-move-item MBLsheet-postil-dialog-move-item-r" data-type="r"></div>' +
        '<div class="MBLsheet-postil-dialog-move-item MBLsheet-postil-dialog-move-item-b" data-type="b"></div>' +
        '<div class="MBLsheet-postil-dialog-move-item MBLsheet-postil-dialog-move-item-l" data-type="l"></div>' +
        "</div>" +
        '<div class="MBLsheet-postil-dialog-resize" style="display:none;">' +
        '<div class="MBLsheet-postil-dialog-resize-item MBLsheet-postil-dialog-resize-item-lt" data-type="lt"></div>' +
        '<div class="MBLsheet-postil-dialog-resize-item MBLsheet-postil-dialog-resize-item-mt" data-type="mt"></div>' +
        '<div class="MBLsheet-postil-dialog-resize-item MBLsheet-postil-dialog-resize-item-lm" data-type="lm"></div>' +
        '<div class="MBLsheet-postil-dialog-resize-item MBLsheet-postil-dialog-resize-item-rm" data-type="rm"></div>' +
        '<div class="MBLsheet-postil-dialog-resize-item MBLsheet-postil-dialog-resize-item-rt" data-type="rt"></div>' +
        '<div class="MBLsheet-postil-dialog-resize-item MBLsheet-postil-dialog-resize-item-lb" data-type="lb"></div>' +
        '<div class="MBLsheet-postil-dialog-resize-item MBLsheet-postil-dialog-resize-item-mb" data-type="mb"></div>' +
        '<div class="MBLsheet-postil-dialog-resize-item MBLsheet-postil-dialog-resize-item-rb" data-type="rb"></div>' +
        "</div>" +
        '<div style="width:100%;height:100%;overflow:hidden;">' +
        '<div class="formulaInputFocus" style="width:' +
        (width - 12) +
        "px;height:" +
        (height - 12) +
        'px;line-height:20px;box-sizing:border-box;text-align: center;;word-break:break-all;" spellcheck="false" contenteditable="true">' +
        commentDivs +
        "</div>" +
        "</div>" +
        "</div>" +
        "</div>";

      $(html).appendTo($("#MBLsheet-cell-main #MBLsheet-postil-showBoxs"));

      let ctx = $("#MBLsheet-postil-show_" + r + "_" + c + " .arrowCanvas")
        .get(0)
        .getContext("2d");

      _this.drawArrow(ctx, size[4], size[5], size[6], size[7]);

      _this.init();
    }

    rc.push(r + "_" + c);

    _this.ref(d, rc);
  },
  showHideAllPs: function () {
    let _this = this;

    let d = editor.deepCopyFlowData(Store.flowdata);

    let isAllShow = true;
    let allPs = [];

    for (let r = 0; r < d.length; r++) {
      for (let c = 0; c < d[0].length; c++) {
        if (d[r] != null && d[r][c] != null && d[r][c].ps != null) {
          allPs.push(r + "_" + c);

          if (!d[r][c].ps.isshow) {
            isAllShow = false;
          }
        }
      }
    }

    let rc = [];
    if (allPs.length > 0) {
      if (isAllShow) {
        //全部显示，操作为隐藏所有批注
        $("#MBLsheet-cell-main #MBLsheet-postil-showBoxs").empty();

        for (let i = 0; i < allPs.length; i++) {
          let rowIndex = allPs[i].split("_")[0];
          let colIndex = allPs[i].split("_")[1];

          let postil = d[rowIndex][colIndex].ps;

          if (postil["isshow"]) {
            d[rowIndex][colIndex].ps.isshow = false;
            rc.push(allPs[i]);
          }
        }
      } else {
        //部分显示或全部隐藏，操作位显示所有批注
        for (let i = 0; i < allPs.length; i++) {
          let rowIndex = allPs[i].split("_")[0];
          let colIndex = allPs[i].split("_")[1];

          let postil = d[rowIndex][colIndex].ps;

          if (!postil["isshow"]) {
            let row = Store.visibledatarow[rowIndex],
              row_pre =
                rowIndex - 1 == -1 ? 0 : Store.visibledatarow[rowIndex - 1];
            let col = Store.cloumnLenSum[colIndex],
              col_pre =
                colIndex - 1 == -1 ? 0 : Store.cloumnLenSum[colIndex - 1];

            let margeset = menuButton.mergeborer(
              Store.flowdata,
              rowIndex,
              colIndex
            );
            if (!!margeset) {
              row = margeset.row[1];
              row_pre = margeset.row[0];

              col = margeset.column[1];
              col_pre = margeset.column[0];
            }

            let scrollLeft = $("#MBLsheet-cell-main").scrollLeft();
            let scrollTop = $("#MBLsheet-cell-main").scrollTop();

            let toX = col;
            let toY = row_pre;

            if (
              MBLsheetFreezen.freezenverticaldata != null &&
              toX <
                MBLsheetFreezen.freezenverticaldata[0] -
                  MBLsheetFreezen.freezenverticaldata[2]
            ) {
              toX += scrollLeft;
            }
            if (
              MBLsheetFreezen.freezenhorizontaldata != null &&
              toY <
                MBLsheetFreezen.freezenhorizontaldata[0] -
                  MBLsheetFreezen.freezenhorizontaldata[2]
            ) {
              toY += scrollTop;
            }

            let left =
              postil["left"] == null
                ? toX + 18 * Store.zoomRatio
                : postil["left"] * Store.zoomRatio;
            let top =
              postil["top"] == null
                ? toY - 18 * Store.zoomRatio
                : postil["top"] * Store.zoomRatio;
            let width =
              postil["width"] == null
                ? _this.defaultWidth * Store.zoomRatio
                : postil["width"] * Store.zoomRatio;
            let height =
              postil["height"] == null
                ? _this.defaultHeight * Store.zoomRatio
                : postil["height"] * Store.zoomRatio;
            let value = postil["value"] == null ? "" : postil["value"];

            if (top < 0) {
              top = 2;
            }

            let size = _this.getArrowCanvasSize(left, top, toX, toY);

            let commentDivs = "";
            let valueLines = value.split("\n");
            for (let line of valueLines) {
              commentDivs += "<div>" + _this.htmlEscape(line) + "</div>";
            }

            let html =
              '<div id="MBLsheet-postil-show_' +
              rowIndex +
              "_" +
              colIndex +
              '" class="MBLsheet-postil-show">' +
              '<canvas class="arrowCanvas" width="' +
              size[2] +
              '" height="' +
              size[3] +
              '" style="position:absolute;left:' +
              size[0] +
              "px;top:" +
              size[1] +
              'px;z-index:100;pointer-events:none;"></canvas>' +
              '<div class="MBLsheet-postil-show-main" style="width:' +
              width +
              "px;height:" +
              height +
              "px;color:#000;padding:5px;border:1px solid #000;background-color:rgb(255,255,225);position:absolute;left:" +
              left +
              "px;top:" +
              top +
              'px;box-sizing:border-box;z-index:100;">' +
              '<div class="MBLsheet-postil-dialog-move">' +
              '<div class="MBLsheet-postil-dialog-move-item MBLsheet-postil-dialog-move-item-t" data-type="t"></div>' +
              '<div class="MBLsheet-postil-dialog-move-item MBLsheet-postil-dialog-move-item-r" data-type="r"></div>' +
              '<div class="MBLsheet-postil-dialog-move-item MBLsheet-postil-dialog-move-item-b" data-type="b"></div>' +
              '<div class="MBLsheet-postil-dialog-move-item MBLsheet-postil-dialog-move-item-l" data-type="l"></div>' +
              "</div>" +
              '<div class="MBLsheet-postil-dialog-resize" style="display:none;">' +
              '<div class="MBLsheet-postil-dialog-resize-item MBLsheet-postil-dialog-resize-item-lt" data-type="lt"></div>' +
              '<div class="MBLsheet-postil-dialog-resize-item MBLsheet-postil-dialog-resize-item-mt" data-type="mt"></div>' +
              '<div class="MBLsheet-postil-dialog-resize-item MBLsheet-postil-dialog-resize-item-lm" data-type="lm"></div>' +
              '<div class="MBLsheet-postil-dialog-resize-item MBLsheet-postil-dialog-resize-item-rm" data-type="rm"></div>' +
              '<div class="MBLsheet-postil-dialog-resize-item MBLsheet-postil-dialog-resize-item-rt" data-type="rt"></div>' +
              '<div class="MBLsheet-postil-dialog-resize-item MBLsheet-postil-dialog-resize-item-lb" data-type="lb"></div>' +
              '<div class="MBLsheet-postil-dialog-resize-item MBLsheet-postil-dialog-resize-item-mb" data-type="mb"></div>' +
              '<div class="MBLsheet-postil-dialog-resize-item MBLsheet-postil-dialog-resize-item-rb" data-type="rb"></div>' +
              "</div>" +
              '<div style="width:100%;height:100%;overflow:hidden;">' +
              '<div class="formulaInputFocus" style="width:' +
              (width - 12) +
              "px;height:" +
              (height - 12) +
              'px;line-height:20px;box-sizing:border-box;text-align: center;;word-break:break-all;" spellcheck="false" contenteditable="true">' +
              commentDivs +
              "</div>" +
              "</div>" +
              "</div>" +
              "</div>";

            $(html).appendTo(
              $("#MBLsheet-cell-main #MBLsheet-postil-showBoxs")
            );

            let ctx = $(
              "#MBLsheet-postil-show_" +
                rowIndex +
                "_" +
                colIndex +
                " .arrowCanvas"
            )
              .get(0)
              .getContext("2d");

            _this.drawArrow(ctx, size[4], size[5], size[6], size[7]);

            d[rowIndex][colIndex].ps.isshow = true;
            rc.push(allPs[i]);
          }
        }
      }
    }

    _this.ref(d, rc);
    _this.init();
  },
  removeActivePs: function () {
    if (
      $("#MBLsheet-postil-showBoxs .MBLsheet-postil-show-active").length > 0
    ) {
      let id = $("#MBLsheet-postil-showBoxs .MBLsheet-postil-show-active").attr(
        "id"
      );
      let r = id.split("MBLsheet-postil-show_")[1].split("_")[0];
      let c = id.split("MBLsheet-postil-show_")[1].split("_")[1];

      // interpret <div> as new line
      let value = $("#" + id)
        .find(".formulaInputFocus")
        .html()
        .replaceAll("<div>", "\n")
        .replaceAll(/<(.*)>.*?|<(.*) \/>/g, "")
        .trim();
      // Hook function
      if (!method.createHookFunction("commentUpdateBefore", r, c, value)) {
        if (!Store.flowdata[r][c].ps.isshow) {
          $("#" + id).remove();
        }
        return;
      }

      const previousCell = $.extend(true, {}, Store.flowdata[r][c]);

      $("#" + id).removeClass("MBLsheet-postil-show-active");
      $("#" + id)
        .find(".MBLsheet-postil-dialog-resize")
        .hide();
      $("#" + id)
        .find(".arrowCanvas")
        .css("z-index", 100);
      $("#" + id)
        .find(".MBLsheet-postil-show-main")
        .css("z-index", 100);

      let d = editor.deepCopyFlowData(Store.flowdata);
      let rc = [];

      d[r][c].ps.value = value;
      rc.push(r + "_" + c);

      this.ref(d, rc);

      if (!d[r][c].ps.isshow) {
        $("#" + id).remove();
      }
      // Hook function
      setTimeout(() => {
        method.createHookFunction(
          "commentUpdateAfter",
          r,
          c,
          previousCell,
          d[r][c]
        );
      }, 0);
    }
  },
  ref: function (data, rc) {
    if (Store.clearjfundo) {
      Store.jfundo.length = 0;

      Store.jfredo.push({
        type: "postil",
        data: Store.flowdata,
        curdata: data,
        sheetIndex: Store.currentSheetIndex,
        rc: rc,
      });
    }

    //flowdata
    Store.flowdata = data;
    editor.webWorkerFlowDataCache(Store.flowdata); //worker存数据

    Store.MBLsheetfile[getSheetIndex(Store.currentSheetIndex)].data =
      Store.flowdata;
    // formula.execFunctionGroupData = Store.flowdata;

    //共享编辑模式
    if (server.allowUpdate) {
      for (let i = 0; i < rc.length; i++) {
        let r = rc[i].split("_")[0];
        let c = rc[i].split("_")[1];

        server.saveParam("v", Store.currentSheetIndex, Store.flowdata[r][c], {
          r: r,
          c: c,
        });
      }
    }

    //刷新表格
    setTimeout(function () {
      MBLsheetrefreshgrid();
    }, 1);
  },
  positionSync: function () {
    let _this = this;

    $("#MBLsheet-postil-showBoxs .MBLsheet-postil-show").each(function (i, e) {
      let id = $(e).attr("id");

      let r = id.split("MBLsheet-postil-show_")[1].split("_")[0];
      let c = id.split("MBLsheet-postil-show_")[1].split("_")[1];

      let cell = Store.flowdata[r][c];

      if (cell != null && cell.ps != null) {
        _this.buildPs(r, c, cell.ps);
      } else {
        $("#" + id).hide();
      }
    });
  },
  htmlEscape: function (text) {
    return text.replace(/[<>"&]/g, function (match, pos, originalText) {
      console.log(match, pos, originalText);
      switch (match) {
        case "<": {
          return "&lt";
        }
        case ">": {
          return "&gt";
        }
        case "&": {
          return "&amp";
        }
        case '"': {
          return "&quot;";
        }
      }
    });
  },
};

export default MBLsheetPostil;
