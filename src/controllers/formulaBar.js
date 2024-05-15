import menuButton from "./menuButton";
import { MBLsheetupdateCell } from "./updateCell";
import { keycode } from "./constant";
import { MBLsheetMoveHighlightCell } from "./sheetMove";

import insertFormula from "./insertFormula";
import { rowLocation, colLocation, mouseposition } from "../global/location";
import { isEditMode } from "../global/validate";
import formula from "../global/formula";
import tooltip from "../global/tooltip";
import locale from "../locale/locale";
import Store from "../store";

export function formulaBarInitial() {
  //公式栏处理

  const _locale = locale();
  const locale_formula = _locale.formula;

  $("#MBLsheet-functionbox-cell")
    .focus(function () {
      if (isEditMode()) {
        //此模式下禁用公式栏
        return;
      }

      if (Store.MBLsheet_select_save.length > 0) {
        let last =
          Store.MBLsheet_select_save[Store.MBLsheet_select_save.length - 1];

        let row_index = last["row_focus"],
          col_index = last["column_focus"];

        // let $input = $("#MBLsheet-rich-text-editor"),value = $input.text();
        // if(value) {
        //     formula.updatecell(row_index, col_index);
        // }
        MBLsheetupdateCell(row_index, col_index, Store.flowdata, null, true);
        formula.rangeResizeTo = $("#MBLsheet-functionbox-cell");
      }
    })
    .keydown(function (event) {
      if (isEditMode()) {
        //此模式下禁用公式栏
        return;
      }

      let ctrlKey = event.ctrlKey;
      let altKey = event.altKey;
      let shiftKey = event.shiftKey;
      let kcode = event.keyCode;
      let $inputbox = $("#MBLsheet-input-box");

      if (kcode == keycode.ENTER && parseInt($inputbox.css("top")) > 0) {
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
              column: [
                Store.MBLsheetCellUpdate[1],
                Store.MBLsheetCellUpdate[1],
              ],
              row_focus: Store.MBLsheetCellUpdate[0],
              column_focus: Store.MBLsheetCellUpdate[1],
            },
          ];
          MBLsheetMoveHighlightCell("down", 1, "rangeOfSelect");
          //$("#MBLsheet-functionbox-cell").blur();
          $("#MBLsheet-rich-text-editor").focus();
        }
        event.preventDefault();
      } else if (kcode == keycode.ESC && parseInt($inputbox.css("top")) > 0) {
        formula.dontupdate();
        MBLsheetMoveHighlightCell("down", 0, "rangeOfSelect");
        //$("#MBLsheet-functionbox-cell").blur();
        $("#MBLsheet-rich-text-editor").focus();
        event.preventDefault();
      } else if (kcode == keycode.F4 && parseInt($inputbox.css("top")) > 0) {
        formula.setfreezonFuc(event);
        event.preventDefault();
      } else if (kcode == keycode.UP && parseInt($inputbox.css("top")) > 0) {
        if ($("#MBLsheet-formula-search-c").is(":visible")) {
          let $up = $("#MBLsheet-formula-search-c")
            .find(".MBLsheet-formula-search-item-active")
            .prev();
          if ($up.length == 0) {
            $up = $("#MBLsheet-formula-search-c")
              .find(".MBLsheet-formula-search-item")
              .last();
          }
          $("#MBLsheet-formula-search-c")
            .find(".MBLsheet-formula-search-item")
            .removeClass("MBLsheet-formula-search-item-active");
          $up.addClass("MBLsheet-formula-search-item-active");
          event.preventDefault();
        }
      } else if (kcode == keycode.DOWN && parseInt($inputbox.css("top")) > 0) {
        if ($("#MBLsheet-formula-search-c").is(":visible")) {
          let $up = $("#MBLsheet-formula-search-c")
            .find(".MBLsheet-formula-search-item-active")
            .next();
          if ($up.length == 0) {
            $up = $("#MBLsheet-formula-search-c")
              .find(".MBLsheet-formula-search-item")
              .first();
          }
          $("#MBLsheet-formula-search-c")
            .find(".MBLsheet-formula-search-item")
            .removeClass("MBLsheet-formula-search-item-active");
          $up.addClass("MBLsheet-formula-search-item-active");
          event.preventDefault();
        }
      } else if (kcode == keycode.LEFT && parseInt($inputbox.css("top")) > 0) {
        formula.rangeHightlightselected($("#MBLsheet-functionbox-cell"));
      } else if (kcode == keycode.RIGHT && parseInt($inputbox.css("top")) > 0) {
        formula.rangeHightlightselected($("#MBLsheet-functionbox-cell"));
      } else if (
        !(
          (kcode >= 112 && kcode <= 123) ||
          kcode <= 46 ||
          kcode == 144 ||
          kcode == 108 ||
          event.ctrlKey ||
          event.altKey ||
          (event.shiftKey &&
            (kcode == 37 || kcode == 38 || kcode == 39 || kcode == 40))
        ) ||
        kcode == 8 ||
        kcode == 32 ||
        kcode == 46 ||
        (event.ctrlKey && kcode == 86)
      ) {
        formula.functionInputHanddler(
          $("#MBLsheet-rich-text-editor"),
          $("#MBLsheet-functionbox-cell"),
          kcode
        );
      }
    })
    .click(function () {
      if (isEditMode()) {
        //此模式下禁用公式栏
        return;
      }

      formula.rangeHightlightselected($("#MBLsheet-functionbox-cell"));
    });

  //公式栏 取消（X）按钮
  $("#MBLsheet-wa-functionbox-cancel").click(function () {
    if (!$(this).hasClass("MBLsheet-wa-calculate-active")) {
      return;
    }
    //若有参数弹出框，隐藏
    if ($("#MBLsheet-search-formula-parm").is(":visible")) {
      $("#MBLsheet-search-formula-parm").hide();
    }
    //若有参数选取范围弹出框，隐藏
    if ($("#MBLsheet-search-formula-parm-select").is(":visible")) {
      $("#MBLsheet-search-formula-parm-select").hide();
    }

    formula.dontupdate();
    MBLsheetMoveHighlightCell("down", 0, "rangeOfSelect");
  });

  //公式栏 确认（）按钮
  $("#MBLsheet-wa-functionbox-confirm").click(function () {
    if (!$(this).hasClass("MBLsheet-wa-calculate-active")) {
      return;
    }
    //若有参数弹出框，隐藏
    if ($("#MBLsheet-search-formula-parm").is(":visible")) {
      $("#MBLsheet-search-formula-parm").hide();
    }
    //若有参数选取范围弹出框，隐藏
    if ($("#MBLsheet-search-formula-parm-select").is(":visible")) {
      $("#MBLsheet-search-formula-parm-select").hide();
    }

    formula.updatecell(
      Store.MBLsheetCellUpdate[0],
      Store.MBLsheetCellUpdate[1]
    );
    MBLsheetMoveHighlightCell("down", 0, "rangeOfSelect");
  });

  //公式栏 fx按钮
  $("#MBLsheet-wa-functionbox-fx").click(function () {
    //点击函数查找弹出框
    if (Store.MBLsheet_select_save.length == 0) {
      if (isEditMode()) {
        alert(locale_formula.tipSelectCell);
      } else {
        tooltip.info(locale_formula.tipSelectCell, "");
      }

      return;
    }

    let last =
      Store.MBLsheet_select_save[Store.MBLsheet_select_save.length - 1];

    let row_index = last["row_focus"],
      col_index = last["column_focus"];

    MBLsheetupdateCell(row_index, col_index, Store.flowdata);

    let cell = Store.flowdata[row_index][col_index];
    if (cell != null && cell.f != null) {
      //单元格有计算
      let functionStr = formula.getfunctionParam(cell.f);
      if (functionStr.fn != null) {
        //有函数公式
        insertFormula.formulaParmDialog(functionStr.fn, functionStr.param);
      } else {
        //无函数公式
        insertFormula.formulaListDialog();
      }
    } else {
      //单元格无计算
      $("#MBLsheet-rich-text-editor").html(
        '<span dir="auto" class="MBLsheet-formula-text-color">=</span>'
      );
      $("#MBLsheet-functionbox-cell").html(
        $("#MBLsheet-rich-text-editor").html()
      );
      insertFormula.formulaListDialog();
    }

    insertFormula.init();
  });

  //公式选区操作
  $("#MBLsheet-formula-functionrange").on(
    "mousedown",
    ".MBLsheet-copy",
    function (event) {
      formula.rangeMove = true;
      Store.MBLsheet_scroll_status = true;
      formula.rangeMoveObj = $(this).parent();
      formula.rangeMoveIndex = $(this).parent().attr("rangeindex");

      let mouse = mouseposition(event.pageX, event.pageY);
      let x = mouse[0] + $("#MBLsheet-cell-main").scrollLeft();
      let y = mouse[1] + $("#MBLsheet-cell-main").scrollTop();
      $("#MBLsheet-formula-functionrange-highlight-" + formula.rangeMoveIndex)
        .find(".MBLsheet-selection-copy-hc")
        .css("opacity", 0.13);

      let type = $(this).data("type");
      if (type == "top") {
        y += 3;
      } else if (type == "right") {
        x -= 3;
      } else if (type == "bottom") {
        y -= 3;
      } else if (type == "left") {
        x += 3;
      }

      let row_index = rowLocation(y)[2];
      let col_index = colLocation(x)[2];

      formula.rangeMovexy = [row_index, col_index];
      $("#MBLsheet-sheettable").css("cursor", "move");
      event.stopPropagation();
    }
  );

  $("#MBLsheet-formula-functionrange").on(
    "mousedown",
    ".MBLsheet-highlight",
    function (event) {
      formula.rangeResize = $(this).data("type"); //开始状态resize
      formula.rangeResizeIndex = $(this).parent().attr("rangeindex");

      let mouse = mouseposition(event.pageX, event.pageY),
        scrollLeft = $("#MBLsheet-cell-main").scrollLeft(),
        scrollTop = $("#MBLsheet-cell-main").scrollTop();
      let x = mouse[0] + scrollLeft;
      let y = mouse[1] + scrollTop;
      formula.rangeResizeObj = $(this).parent();
      $("#MBLsheet-formula-functionrange-highlight-" + formula.rangeResizeIndex)
        .find(".MBLsheet-selection-copy-hc")
        .css("opacity", 0.13);

      if (formula.rangeResize == "lt") {
        x += 3;
        y += 3;
      } else if (formula.rangeResize == "lb") {
        x += 3;
        y -= 3;
      } else if (formula.rangeResize == "rt") {
        x -= 3;
        y += 3;
      } else if (formula.rangeResize == "rb") {
        x -= 3;
        y -= 3;
      }

      let row_location = rowLocation(y),
        row = row_location[1],
        row_pre = row_location[0],
        row_index = row_location[2];
      let col_location = colLocation(x),
        col = col_location[1],
        col_pre = col_location[0],
        col_index = col_location[2];

      let position = formula.rangeResizeObj.position();
      formula.rangeResizexy = [
        col_pre,
        row_pre,
        formula.rangeResizeObj.width(),
        formula.rangeResizeObj.height(),
        position.left + scrollLeft,
        position.top + scrollTop,
        col,
        row,
      ];
      formula.rangeResizeWinH = $("#MBLsheet-cell-main")[0].scrollHeight;
      formula.rangeResizeWinW = $("#MBLsheet-cell-main")[0].scrollWidth;
      Store.MBLsheet_scroll_status = true;
      event.stopPropagation();
    }
  );
}
