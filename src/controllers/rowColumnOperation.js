import pivotTable from "./pivotTable";
import MBLsheetPostil from "./postil";
import imageCtrl from "./imageCtrl";
import menuButton from "./menuButton";
import server from "./server";
import method from "../global/method";
import {
  selectHightlightShow,
  MBLsheet_count_show,
  selectHelpboxFill,
} from "./select";
import {
  getObjType,
  showrightclickmenu,
  MBLsheetContainerFocus,
  MBLsheetfontformat,
  $$,
} from "../utils/util";
import { getSheetIndex, getRangetxt } from "../methods/get";
import {
  rowLocation,
  rowLocationByIndex,
  colLocation,
  colLocationByIndex,
  mouseposition,
} from "../global/location";
import {
  isRealNull,
  isRealNum,
  hasPartMC,
  isEditMode,
  checkIsAllowEdit,
} from "../global/validate";
import { countfunc } from "../global/count";
import formula from "../global/formula";
import {
  MBLsheetextendtable,
  MBLsheetdeletetable,
  MBLsheetDeleteCell,
} from "../global/extend";
import {
  jfrefreshgrid,
  jfrefreshgridall,
  jfrefreshgrid_rhcw,
} from "../global/refresh";
import { getcellvalue } from "../global/getdata";
import tooltip from "../global/tooltip";
import editor from "../global/editor";
import locale from "../locale/locale";
import { getMeasureText, getCellTextInfo } from "../global/getRowlen";
import { MBLsheet_searcharray } from "../controllers/sheetSearch";
import { isInlineStringCell } from "./inlineString";
import {
  checkProtectionLockedRangeList,
  checkProtectionAllSelected,
  checkProtectionAuthorityNormal,
} from "./protection";
import Store from "../store";
import MBLsheetConfigsetting from "./MBLsheetConfigsetting";
import { eventBus } from "../global/sg/event";

export function rowColumnOperationInitial() {
  //表格行标题 mouse事件
  $("#MBLsheet-rows-h")
    .mousedown(function (event) {
      if (!checkProtectionAllSelected(Store.currentSheetIndex)) {
        return;
      }
      //有批注在编辑时
      MBLsheetPostil.removeActivePs();

      //图片 active/cropping
      if (
        $("#MBLsheet-modal-dialog-activeImage").is(":visible") ||
        $("#MBLsheet-modal-dialog-cropping").is(":visible")
      ) {
        imageCtrl.cancelActiveImgItem();
      }

      let mouse = mouseposition(event.pageX, event.pageY);
      let y = mouse[1] + $("#MBLsheet-rows-h").scrollTop();

      let row_location = rowLocation(y),
        row = row_location[1],
        row_pre = row_location[0],
        row_index = row_location[2];
      let col_index = Store.cloumnLenSum.length - 1,
        col = Store.cloumnLenSum[col_index],
        col_pre = 0;

      $("#MBLsheet-rightclick-menu").hide();
      $("#MBLsheet-sheet-list, #MBLsheet-rightclick-sheet-menu").hide();

      //mousedown是右键
      if (event.which == "3") {
        let isright = false;

        for (let s = 0; s < Store.MBLsheet_select_save.length; s++) {
          let obj_s = Store.MBLsheet_select_save[s];

          if (
            obj_s["row"] != null &&
            row_index >= obj_s["row"][0] &&
            row_index <= obj_s["row"][1] &&
            obj_s["column"][0] == 0 &&
            obj_s["column"][1] == Store.flowdata[0].length - 1
          ) {
            isright = true;
            break;
          }
        }

        if (isright) {
          return;
        }
      }

      let top = row_pre,
        height = row - row_pre - 1;
      let rowseleted = [row_index, row_index];

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
            [0, col_index],
            rowseleted,
            { row_focus: row_index, column_focus: 0 },
            top,
            height,
            col_pre,
            col
          );
          if (changeparam != null) {
            //columnseleted = changeparam[0];
            rowseleted = changeparam[1];
            top = changeparam[2];
            height = changeparam[3];
            //left = changeparam[4];
            //width = changeparam[5];
          }

          if (event.shiftKey) {
            let last = formula.func_selectedrange;

            let top = 0,
              height = 0,
              rowseleted = [];
            if (last.top > row_pre) {
              top = row_pre;
              height = last.top + last.height - row_pre;

              if (last.row[1] > last.row_focus) {
                last.row[1] = last.row_focus;
              }

              rowseleted = [row_index, last.row[1]];
            } else if (last.top == row_pre) {
              top = row_pre;
              height = last.top + last.height - row_pre;
              rowseleted = [row_index, last.row[0]];
            } else {
              top = last.top;
              height = row - last.top - 1;

              if (last.row[0] < last.row_focus) {
                last.row[0] = last.row_focus;
              }

              rowseleted = [last.row[0], row_index];
            }

            let changeparam = menuButton.mergeMoveMain(
              [0, col_index],
              rowseleted,
              { row_focus: row_index, column_focus: 0 },
              top,
              height,
              col_pre,
              col
            );
            if (changeparam != null) {
              // columnseleted = changeparam[0];
              rowseleted = changeparam[1];
              top = changeparam[2];
              height = changeparam[3];
              // left = changeparam[4];
              // width = changeparam[5];
            }

            last["row"] = rowseleted;

            last["top_move"] = top;
            last["height_move"] = height;

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
              left: colLocationByIndex(0)[0],
              width: colLocationByIndex(0)[1] - colLocationByIndex(0)[0] - 1,
              top: top,
              height: height,
              left_move: col_pre,
              width_move: col - col_pre - 1,
              top_move: top,
              height_move: height,
              row: rowseleted,
              column: [0, col_index],
              row_focus: row_index,
              column_focus: 0,
            };
          } else {
            formula.func_selectedrange = {
              left: colLocationByIndex(0)[0],
              width: colLocationByIndex(0)[1] - colLocationByIndex(0)[0] - 1,
              top: top,
              height: height,
              left_move: col_pre,
              width_move: col - col_pre - 1,
              top_move: top,
              height_move: height,
              row: rowseleted,
              column: [0, col_index],
              row_focus: row_index,
              column_focus: 0,
            };
          }

          if (
            formula.rangestart ||
            formula.rangedrag_column_start ||
            formula.rangedrag_row_start ||
            formula.israngeseleciton()
          ) {
            formula.rangeSetValue({ row: rowseleted, column: [null, null] });
          } else if (
            $("#MBLsheet-ifFormulaGenerator-multiRange-dialog").is(":visible")
          ) {
            //if公式生成器
            let range = getRangetxt(
              Store.currentSheetIndex,
              { row: rowseleted, column: [0, col_index] },
              Store.currentSheetIndex
            );
            $("#MBLsheet-ifFormulaGenerator-multiRange-dialog input").val(
              range
            );
          }

          formula.rangedrag_row_start = true;
          formula.rangestart = false;
          formula.rangedrag_column_start = false;

          $("#MBLsheet-formula-functionrange-select")
            .css({
              left: col_pre,
              width: col - col_pre - 1,
              top: top,
              height: height,
            })
            .show();
          $("#MBLsheet-formula-help-c").hide();

          MBLsheet_count_show(
            col_pre,
            top,
            col - col_pre - 1,
            height,
            rowseleted,
            [0, col_index]
          );

          setTimeout(function () {
            let currSelection = window.getSelection();
            let anchorOffset = currSelection.anchorNode;

            let $editor;
            if (
              $("#MBLsheet-search-formula-parm").is(":visible") ||
              $("#MBLsheet-search-formula-parm-select").is(":visible")
            ) {
              $editor = $("#MBLsheet-rich-text-editor");
              formula.rangechangeindex = formula.data_parm_index;
            } else {
              $editor = $(anchorOffset).closest("div");
            }

            let $span = $editor.find(
              "span[rangeindex='" + formula.rangechangeindex + "']"
            );

            formula.setCaretPosition($span.get(0), 0, $span.html().length);
          }, 1);

          return;
        } else {
          formula.updatecell(
            Store.MBLsheetCellUpdate[0],
            Store.MBLsheetCellUpdate[1]
          );
          Store.MBLsheet_rows_selected_status = true;
        }
      } else {
        Store.MBLsheet_rows_selected_status = true;
      }

      if (Store.MBLsheet_rows_selected_status) {
        if (event.shiftKey) {
          //按住shift点击行索引选取范围
          let last = $.extend(
            true,
            {},
            Store.MBLsheet_select_save[Store.MBLsheet_select_save.length - 1]
          ); //选区最后一个

          let top = 0,
            height = 0,
            rowseleted = [];
          if (last.top > row_pre) {
            top = row_pre;
            height = last.top + last.height - row_pre;

            if (last.row[1] > last.row_focus) {
              last.row[1] = last.row_focus;
            }

            rowseleted = [row_index, last.row[1]];
          } else if (last.top == row_pre) {
            top = row_pre;
            height = last.top + last.height - row_pre;
            rowseleted = [row_index, last.row[0]];
          } else {
            top = last.top;
            height = row - last.top - 1;

            if (last.row[0] < last.row_focus) {
              last.row[0] = last.row_focus;
            }

            rowseleted = [last.row[0], row_index];
          }

          last["row"] = rowseleted;

          last["top_move"] = top;
          last["height_move"] = height;

          Store.MBLsheet_select_save[Store.MBLsheet_select_save.length - 1] =
            last;
        } else if (event.ctrlKey) {
          Store.MBLsheet_select_save.push({
            left: colLocationByIndex(0)[0],
            width: colLocationByIndex(0)[1] - colLocationByIndex(0)[0] - 1,
            top: top,
            height: height,
            left_move: col_pre,
            width_move: col - col_pre - 1,
            top_move: top,
            height_move: height,
            row: rowseleted,
            column: [0, col_index],
            row_focus: row_index,
            column_focus: 0,
            row_select: true,
          });
        } else {
          Store.MBLsheet_select_save.length = 0;
          Store.MBLsheet_select_save.push({
            left: colLocationByIndex(0)[0],
            width: colLocationByIndex(0)[1] - colLocationByIndex(0)[0] - 1,
            top: top,
            height: height,
            left_move: col_pre,
            width_move: col - col_pre - 1,
            top_move: top,
            height_move: height,
            row: rowseleted,
            column: [0, col_index],
            row_focus: row_index,
            column_focus: 0,
            row_select: true,
          });
        }

        selectHightlightShow();

        //允许编辑后的后台更新时
        server.saveParam(
          "mv",
          Store.currentSheetIndex,
          Store.MBLsheet_select_save
        );
      }

      selectHelpboxFill();

      setTimeout(function () {
        clearTimeout(Store.countfuncTimeout);
        countfunc();
      }, 101);
    })
    .mousemove(function (event) {
      if (
        Store.MBLsheet_rows_selected_status ||
        Store.MBLsheet_rows_change_size ||
        Store.MBLsheet_select_status
      ) {
        $("#MBLsheet-rows-h-hover").hide();
        return;
      }

      let mouse = mouseposition(event.pageX, event.pageY);
      let y = mouse[1] + $("#MBLsheet-rows-h").scrollTop();

      let row_location = rowLocation(y),
        row = row_location[1],
        row_pre = row_location[0],
        row_index = row_location[2];

      $("#MBLsheet-rows-h-hover").css({
        top: row_pre,
        height: row - row_pre - 1,
        display: "block",
      });

      if (y < row - 1 && y >= row - 5) {
        $("#MBLsheet-rows-change-size").css({ top: row - 3, opacity: 0 });
      } else {
        $("#MBLsheet-rows-change-size").css("opacity", 0);
      }
    })
    .mouseleave(function (event) {
      $("#MBLsheet-rows-h-hover").hide();
      $("#MBLsheet-rows-change-size").css("opacity", 0);
    })
    .mouseup(function (event) {
      if (event.which == 3) {
        // *如果禁止前台编辑，则中止下一步操作
        if (!checkIsAllowEdit()) {
          return;
        }
        if (isEditMode()) {
          //非编辑模式下禁止右键功能框
          return;
        }

        $("#MBLsheet-cols-rows-shift").hide();
        Store.MBLsheetRightHeadClickIs = "row";
        $("#MBLsheet-rightclick-menu .MBLsheet-cols-rows-shift-word").text(
          locale().rightclick.row
        );
        $("#MBLsheet-rightclick-menu .MBLsheet-cols-rows-shift-size").text(
          locale().rightclick.height
        );
        $("#MBLsheet-rightclick-menu .MBLsheet-cols-rows-shift-left").text(
          locale().rightclick.top
        );
        $("#MBLsheet-rightclick-menu .MBLsheet-cols-rows-shift-right").text(
          locale().rightclick.bottom
        );

        $("#MBLsheet-cols-rows-add").show();
        $("#MBLsheet-cols-rows-data").show();
        $("#MBLsheet-cols-rows-shift").hide();
        $("#MBLsheet-cols-rows-handleincell").hide();

        $$("#MBLsheet-cols-rows-add .MBLsheet-menuseparator").style.display =
          "block";
        $$("#MBLsheet-cols-rows-data .MBLsheet-menuseparator").style.display =
          "block";

        // 自定义右键菜单：向上向下增加行，删除行，隐藏显示行，设置行高
        const cellRightClickConfig = MBLsheetConfigsetting.cellRightClickConfig;

        // 如果全部按钮都隐藏，则整个菜单容器也要隐藏
        if (
          !cellRightClickConfig.copy &&
          !cellRightClickConfig.copyAs &&
          !cellRightClickConfig.paste &&
          !cellRightClickConfig.insertRow &&
          !cellRightClickConfig.deleteRow &&
          !cellRightClickConfig.hideRow &&
          !cellRightClickConfig.rowHeight &&
          !cellRightClickConfig.clear &&
          !cellRightClickConfig.matrix &&
          !cellRightClickConfig.sort &&
          !cellRightClickConfig.filter &&
          !cellRightClickConfig.chart &&
          !cellRightClickConfig.image &&
          !cellRightClickConfig.link &&
          !cellRightClickConfig.data &&
          !cellRightClickConfig.cellFormat
        ) {
          return;
        }

        $$("#MBLsheet-top-left-add-selected").style.display =
          cellRightClickConfig.insertRow ? "block" : "none";
        $$("#MBLsheet-bottom-right-add-selected").style.display =
          cellRightClickConfig.insertRow ? "block" : "none";
        $$("#MBLsheet-del-selected").style.display =
          cellRightClickConfig.deleteRow ? "block" : "none";
        $$("#MBLsheet-hide-selected").style.display =
          cellRightClickConfig.hideRow ? "block" : "none";
        $$("#MBLsheet-show-selected").style.display =
          cellRightClickConfig.hideRow ? "block" : "none";
        $$("#MBLsheet-column-row-width-selected").style.display =
          cellRightClickConfig.rowHeight ? "block" : "none";

        // 1. 当一个功能菜单块上方的功能块按钮都隐藏的时候，下方的功能块的顶部分割线也需要隐藏
        if (
          !cellRightClickConfig.copy &&
          !cellRightClickConfig.copyAs &&
          !cellRightClickConfig.paste
        ) {
          $$("#MBLsheet-cols-rows-add .MBLsheet-menuseparator").style.display =
            "none";

          if (
            !cellRightClickConfig.insertRow &&
            !cellRightClickConfig.deleteRow &&
            !cellRightClickConfig.hideRow &&
            !cellRightClickConfig.rowHeight
          ) {
            $$(
              "#MBLsheet-cols-rows-data .MBLsheet-menuseparator"
            ).style.display = "none";
          }
        }

        // 2. 当一个功能菜单块内所有的按钮都隐藏的时候，它顶部的分割线也需要隐藏掉
        if (
          !cellRightClickConfig.insertRow &&
          !cellRightClickConfig.deleteRow &&
          !cellRightClickConfig.hideRow &&
          !cellRightClickConfig.rowHeight
        ) {
          $$("#MBLsheet-cols-rows-add .MBLsheet-menuseparator").style.display =
            "none";
        }

        if (
          !cellRightClickConfig.clear &&
          !cellRightClickConfig.matrix &&
          !cellRightClickConfig.sort &&
          !cellRightClickConfig.filter &&
          !cellRightClickConfig.chart &&
          !cellRightClickConfig.image &&
          !cellRightClickConfig.link &&
          !cellRightClickConfig.data &&
          !cellRightClickConfig.cellFormat
        ) {
          $$("#MBLsheet-cols-rows-data .MBLsheet-menuseparator").style.display =
            "none";
        }

        showrightclickmenu(
          $("#MBLsheet-rightclick-menu"),
          $(this).offset().left + 46,
          event.pageY
        );
        Store.MBLsheet_cols_menu_status = true;

        //行高默认值
        let cfg = $.extend(true, {}, Store.config);
        if (cfg["rowlen"] == null) {
          cfg["rowlen"] = {};
        }

        let first_rowlen =
          cfg["rowlen"][Store.MBLsheet_select_save[0].row[0]] == null
            ? Store.defaultrowlen
            : cfg["rowlen"][Store.MBLsheet_select_save[0].row[0]];
        let isSame = true;

        for (let i = 0; i < Store.MBLsheet_select_save.length; i++) {
          let s = Store.MBLsheet_select_save[i];
          let r1 = s.row[0],
            r2 = s.row[1];

          for (let r = r1; r <= r2; r++) {
            let rowlen =
              cfg["rowlen"][r] == null ? Store.defaultrowlen : cfg["rowlen"][r];

            if (rowlen != first_rowlen) {
              isSame = false;
              break;
            }
          }
        }

        if (isSame) {
          $("#MBLsheet-cols-rows-add")
            .find("input[type='number'].rcsize")
            .val(first_rowlen);
        } else {
          $("#MBLsheet-cols-rows-add")
            .find("input[type='number'].rcsize")
            .val("");
        }
      }
    });

  //表格列标题 mouse事件
  $("#MBLsheet-cols-h-c")
    .mousedown(function (event) {
      if (!checkProtectionAllSelected(Store.currentSheetIndex)) {
        return;
      }
      //有批注在编辑时
      MBLsheetPostil.removeActivePs();

      //图片 active/cropping
      if (
        $("#MBLsheet-modal-dialog-activeImage").is(":visible") ||
        $("#MBLsheet-modal-dialog-cropping").is(":visible")
      ) {
        imageCtrl.cancelActiveImgItem();
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

        //允许编辑后的后台更新时
        server.saveParam(
          "mv",
          Store.currentSheetIndex,
          Store.MBLsheet_select_save
        );
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
      if (event.which == 3) {
        return;

        // *如果禁止前台编辑，则中止下一步操作
        if (!checkIsAllowEdit()) {
          return;
        }
        if (isEditMode()) {
          //非编辑模式下禁止右键功能框
          return;
        }

        Store.MBLsheetRightHeadClickIs = "column";
        $("#MBLsheet-rightclick-menu .MBLsheet-cols-rows-shift-word").text(
          locale().rightclick.column
        );
        $("#MBLsheet-rightclick-menu .MBLsheet-cols-rows-shift-size").text(
          locale().rightclick.width
        );
        $("#MBLsheet-rightclick-menu .MBLsheet-cols-rows-shift-left").text(
          locale().rightclick.left
        );
        $("#MBLsheet-rightclick-menu .MBLsheet-cols-rows-shift-right").text(
          locale().rightclick.right
        );

        $("#MBLsheet-cols-rows-add").show();
        $("#MBLsheet-cols-rows-data").show();
        $("#MBLsheet-cols-rows-shift").hide();
        $("#MBLsheet-cols-rows-handleincell").hide();

        $$("#MBLsheet-cols-rows-add .MBLsheet-menuseparator").style.display =
          "block";
        $$("#MBLsheet-cols-rows-data .MBLsheet-menuseparator").style.display =
          "block";

        // 自定义右键菜单：向左向右增加列，删除列，隐藏显示列，设置列宽
        const cellRightClickConfig = MBLsheetConfigsetting.cellRightClickConfig;

        // 如果全部按钮都隐藏，则整个菜单容器也要隐藏
        if (
          !cellRightClickConfig.copy &&
          !cellRightClickConfig.copyAs &&
          !cellRightClickConfig.paste &&
          !cellRightClickConfig.insertColumn &&
          !cellRightClickConfig.deleteColumn &&
          !cellRightClickConfig.hideColumn &&
          !cellRightClickConfig.columnWidth &&
          !cellRightClickConfig.clear &&
          !cellRightClickConfig.matrix &&
          !cellRightClickConfig.sort &&
          !cellRightClickConfig.filter &&
          !cellRightClickConfig.chart &&
          !cellRightClickConfig.image &&
          !cellRightClickConfig.link &&
          !cellRightClickConfig.data &&
          !cellRightClickConfig.cellFormat
        ) {
          return;
        }

        $$("#MBLsheet-top-left-add-selected").style.display =
          cellRightClickConfig.insertColumn ? "block" : "none";
        $$("#MBLsheet-bottom-right-add-selected").style.display =
          cellRightClickConfig.insertColumn ? "block" : "none";
        $$("#MBLsheet-del-selected").style.display =
          cellRightClickConfig.deleteColumn ? "block" : "none";
        $$("#MBLsheet-hide-selected").style.display =
          cellRightClickConfig.hideColumn ? "block" : "none";
        $$("#MBLsheet-show-selected").style.display =
          cellRightClickConfig.hideColumn ? "block" : "none";
        $$("#MBLsheet-column-row-width-selected").style.display =
          cellRightClickConfig.columnWidth ? "block" : "none";

        // 1. 当一个功能菜单块上方的功能块按钮都隐藏的时候，下方的功能块的顶部分割线也需要隐藏
        if (
          !cellRightClickConfig.copy &&
          !cellRightClickConfig.copyAs &&
          !cellRightClickConfig.paste
        ) {
          $$("#MBLsheet-cols-rows-add .MBLsheet-menuseparator").style.display =
            "none";

          if (
            !cellRightClickConfig.insertColumn &&
            !cellRightClickConfig.deleteColumn &&
            !cellRightClickConfig.hideColumn &&
            !cellRightClickConfig.columnWidth
          ) {
            $$(
              "#MBLsheet-cols-rows-data .MBLsheet-menuseparator"
            ).style.display = "none";
          }
        }

        // 2. 当一个功能菜单块内所有的按钮都隐藏的时候，它顶部的分割线也需要隐藏掉
        if (
          !cellRightClickConfig.insertColumn &&
          !cellRightClickConfig.deleteColumn &&
          !cellRightClickConfig.hideColumn &&
          !cellRightClickConfig.columnWidth
        ) {
          $$("#MBLsheet-cols-rows-add .MBLsheet-menuseparator").style.display =
            "none";
        }

        if (
          !cellRightClickConfig.clear &&
          !cellRightClickConfig.matrix &&
          !cellRightClickConfig.sort &&
          !cellRightClickConfig.filter &&
          !cellRightClickConfig.chart &&
          !cellRightClickConfig.image &&
          !cellRightClickConfig.link &&
          !cellRightClickConfig.data &&
          !cellRightClickConfig.cellFormat
        ) {
          $$("#MBLsheet-cols-rows-data .MBLsheet-menuseparator").style.display =
            "none";
        }

        showrightclickmenu(
          $("#MBLsheet-rightclick-menu"),
          event.pageX,
          $(this).offset().top + 18
        );
        Store.MBLsheet_cols_menu_status = true;

        //列宽默认值
        let cfg = $.extend(true, {}, Store.config);
        if (cfg["columnlen"] == null) {
          cfg["columnlen"] = {};
        }

        let first_collen =
          cfg["columnlen"][Store.MBLsheet_select_save[0].column[0]] == null
            ? Store.defaultcollen
            : cfg["columnlen"][Store.MBLsheet_select_save[0].column[0]];
        let isSame = true;

        for (let i = 0; i < Store.MBLsheet_select_save.length; i++) {
          let s = Store.MBLsheet_select_save[i];
          let c1 = s.column[0],
            c2 = s.column[1];

          for (let c = c1; c <= c2; c++) {
            let collen =
              cfg["columnlen"][c] == null
                ? Store.defaultcollen
                : cfg["columnlen"][c];

            if (collen != first_collen) {
              isSame = false;
              break;
            }
          }
        }

        if (isSame) {
          $("#MBLsheet-cols-rows-add")
            .find("input[type='number'].rcsize")
            .val(first_collen);
        } else {
          $("#MBLsheet-cols-rows-add")
            .find("input[type='number'].rcsize")
            .val("");
        }
      }
    });

  //表格行标题 改变行高按钮
  $("#MBLsheet-rows-change-size").mousedown(function (event) {
    // *如果禁止前台编辑，则中止下一步操作
    if (!checkIsAllowEdit()) {
      return;
    }
    //有批注在编辑时
    MBLsheetPostil.removeActivePs();

    //图片 active/cropping
    if (
      $("#MBLsheet-modal-dialog-activeImage").is(":visible") ||
      $("#MBLsheet-modal-dialog-cropping").is(":visible")
    ) {
      imageCtrl.cancelActiveImgItem();
    }

    $("#MBLsheet-input-box").hide();
    $("#MBLsheet-rows-change-size").css({ opacity: 1 });

    let mouse = mouseposition(event.pageX, event.pageY);
    let y = mouse[1] + $("#MBLsheet-rows-h").scrollTop();

    let scrollLeft = $("#MBLsheet-cell-main").scrollLeft();
    let winW = $("#MBLsheet-cell-main").width();

    let row_location = rowLocation(y),
      row = row_location[1],
      row_pre = row_location[0],
      row_index = row_location[2];

    Store.MBLsheet_rows_change_size = true;
    Store.MBLsheet_scroll_status = true;
    $("#MBLsheet-change-size-line").css({
      height: "1px",
      "border-width": "0 0px 1px 0",
      top: row - 3,
      left: 0,
      width: scrollLeft + winW,
      display: "block",
      cursor: "ns-resize",
    });
    $("#MBLsheet-sheettable, #MBLsheet-rows-h, #MBLsheet-rows-h canvas").css(
      "cursor",
      "ns-resize"
    );
    Store.MBLsheet_rows_change_size_start = [row_pre, row_index];
    $("#MBLsheet-rightclick-menu").hide();
    $("#MBLsheet-rows-h-hover").hide();
    $("#MBLsheet-cols-menu-btn").hide();
    event.stopPropagation();
  });

  //表格列标题 改变列宽按钮
  $("#MBLsheet-cols-change-size")
    .mousedown(function (event) {
      // *如果禁止前台编辑，则中止下一步操作
      if (!checkIsAllowEdit()) {
        return;
      }
      //有批注在编辑时
      MBLsheetPostil.removeActivePs();

      //图片 active/cropping
      if (
        $("#MBLsheet-modal-dialog-activeImage").is(":visible") ||
        $("#MBLsheet-modal-dialog-cropping").is(":visible")
      ) {
        imageCtrl.cancelActiveImgItem();
      }

      $("#MBLsheet-input-box").hide();
      $("#MBLsheet-cols-change-size").css({ opacity: 1 });

      let mouse = mouseposition(event.pageX, event.pageY);
      let scrollLeft = $("#MBLsheet-cols-h-c").scrollLeft();
      let scrollTop = $("#MBLsheet-cell-main").scrollTop();
      let winH = $("#MBLsheet-cell-main").height();
      let x = mouse[0] + scrollLeft;

      let row_index = Store.visibledatarow.length - 1,
        row = Store.visibledatarow[row_index],
        row_pre = 0;
      let col_location = colLocation(x),
        col = col_location[1],
        col_pre = col_location[0],
        col_index = col_location[2];

      Store.MBLsheet_cols_change_size = true;
      Store.MBLsheet_scroll_status = true;
      $("#MBLsheet-change-size-line").css({
        height: winH + scrollTop,
        "border-width": "0 1px 0 0",
        top: 0,
        left: col - 3,
        width: "1px",
        display: "block",
        cursor: "ew-resize",
      });
      $(
        "#MBLsheet-sheettable, #MBLsheet-cols-h-c, .MBLsheet-cols-h-cells, .MBLsheet-cols-h-cells canvas"
      ).css("cursor", "ew-resize");
      Store.MBLsheet_cols_change_size_start = [col_pre, col_index];
      $("#MBLsheet-rightclick-menu").hide();
      $("#MBLsheet-cols-h-hover").hide();
      $("#MBLsheet-cols-menu-btn").hide();
      Store.MBLsheet_cols_dbclick_times = 0;
      event.stopPropagation();
    })
    .dblclick(function () {
      MBLsheetcolsdbclick();
    });

  // 列标题的下拉箭头
  $("#MBLsheet-cols-menu-btn").click(function (event) {
    // *如果禁止前台编辑，则中止下一步操作
    if (!checkIsAllowEdit()) {
      tooltip.info("", locale().pivotTable.errorNotAllowEdit);
      return;
    }
    let $menu = $("#MBLsheet-rightclick-menu");
    let offset = $(this).offset();
    $("#MBLsheet-cols-rows-shift").show();
    Store.MBLsheetRightHeadClickIs = "column";
    $("#MBLsheet-rightclick-menu .MBLsheet-cols-rows-shift-word").text(
      locale().rightclick.column
    );
    $("#MBLsheet-rightclick-menu .MBLsheet-cols-rows-shift-left").text(
      locale().rightclick.left
    );
    $("#MBLsheet-rightclick-menu .MBLsheet-cols-rows-shift-right").text(
      locale().rightclick.right
    );

    $("#MBLsheet-cols-rows-add").show();
    $("#MBLsheet-cols-rows-data").hide();
    $("#MBLsheet-cols-rows-shift").show();
    $("#MBLsheet-cols-rows-handleincell").hide();

    $$("#MBLsheet-cols-rows-add .MBLsheet-menuseparator").style.display =
      "block";
    $$("#MBLsheet-cols-rows-shift .MBLsheet-menuseparator").style.display =
      "block";

    // 自定义右键菜单：向左向右增加列，删除列，隐藏显示列，设置列宽
    const cellRightClickConfig = MBLsheetConfigsetting.cellRightClickConfig;

    // 如果全部按钮都隐藏，则整个菜单容器也要隐藏
    if (
      !cellRightClickConfig.copy &&
      !cellRightClickConfig.copyAs &&
      !cellRightClickConfig.paste &&
      !cellRightClickConfig.insertColumn &&
      !cellRightClickConfig.deleteColumn &&
      !cellRightClickConfig.hideColumn &&
      !cellRightClickConfig.columnWidth &&
      !cellRightClickConfig.sort
    ) {
      return;
    }

    $$("#MBLsheet-top-left-add-selected").style.display =
      cellRightClickConfig.insertColumn ? "block" : "none";
    $$("#MBLsheet-bottom-right-add-selected").style.display =
      cellRightClickConfig.insertColumn ? "block" : "none";
    $$("#MBLsheet-del-selected").style.display =
      cellRightClickConfig.deleteColumn ? "block" : "none";
    $$("#MBLsheet-hide-selected").style.display =
      cellRightClickConfig.hideColumn ? "block" : "none";
    $$("#MBLsheet-show-selected").style.display =
      cellRightClickConfig.hideColumn ? "block" : "none";
    $$("#MBLsheet-column-row-width-selected").style.display =
      cellRightClickConfig.columnWidth ? "block" : "none";

    // 1. 当一个功能菜单块上方的功能块按钮都隐藏的时候，下方的功能块的顶部分割线也需要隐藏
    if (
      !cellRightClickConfig.copy &&
      !cellRightClickConfig.copyAs &&
      !cellRightClickConfig.paste
    ) {
      $$("#MBLsheet-cols-rows-add .MBLsheet-menuseparator").style.display =
        "none";

      if (
        !cellRightClickConfig.insertColumn &&
        !cellRightClickConfig.deleteColumn &&
        !cellRightClickConfig.hideColumn &&
        !cellRightClickConfig.columnWidth
      ) {
        $$("#MBLsheet-cols-rows-shift .MBLsheet-menuseparator").style.display =
          "none";
      }
    }

    // 2. 当一个功能菜单块内所有的按钮都隐藏的时候，它顶部的分割线也需要隐藏掉
    if (
      !cellRightClickConfig.insertColumn &&
      !cellRightClickConfig.deleteColumn &&
      !cellRightClickConfig.hideColumn &&
      !cellRightClickConfig.columnWidth
    ) {
      $$("#MBLsheet-cols-rows-add .MBLsheet-menuseparator").style.display =
        "none";
    }

    if (!cellRightClickConfig.sort) {
      $$("#MBLsheet-cols-rows-shift .MBLsheet-menuseparator").style.display =
        "none";
    }

    showrightclickmenu($menu, offset.left, offset.top + 18);
    Store.MBLsheet_cols_menu_status = true;
  });

  //向左增加列，向上增加行
  // $("#MBLsheet-add-lefttop, #MBLsheet-add-lefttop_t").click(function (event) {
  $("#MBLsheet-top-left-add-selected").click(function (event) {
    // Click input element, don't comfirm
    if (event.target.nodeName === "INPUT") {
      return;
    }

    $("#MBLsheet-rightclick-menu").hide();
    MBLsheetContainerFocus();

    const _locale = locale();
    const locale_drag = _locale.drag;
    const locale_info = _locale.info;

    if (Store.MBLsheet_select_save.length > 1) {
      if (isEditMode()) {
        alert(locale_drag.noMulti);
      } else {
        tooltip.info(locale_drag.noMulti, "");
      }

      return;
    }

    let $t = $(this),
      value = $t.find("input").val();
    if (!isRealNum(value)) {
      if (isEditMode()) {
        alert(locale_info.tipInputNumber);
      } else {
        tooltip.info(locale_info.tipInputNumber, "");
      }

      return;
    }

    value = parseInt(value);

    if (value < 1 || value > 100) {
      if (isEditMode()) {
        alert(locale_info.tipInputNumberLimit);
      } else {
        tooltip.info(locale_info.tipInputNumberLimit, "");
      }
      return;
    }

    let st_index =
      Store.MBLsheet_select_save[0][Store.MBLsheetRightHeadClickIs][0];
    if (
      !method.createHookFunction("rowInsertBefore", st_index, value, "lefttop")
    ) {
      return;
    }
    MBLsheetextendtable(
      Store.MBLsheetRightHeadClickIs,
      st_index,
      value,
      "lefttop"
    );
  });

  // When you right-click a cell, a row is inserted before the row by default
  $("#MBLsheetColsRowsHandleAdd_row").click(function (event) {
    $("#MBLsheet-rightclick-menu").hide();
    MBLsheetContainerFocus();

    if (Store.allowEdit === false) {
      return;
    }

    let st_index = Store.MBLsheet_select_save[0].row[0];
    if (!method.createHookFunction("rowInsertBefore", st_index, 1, "lefttop")) {
      return;
    }
    MBLsheetextendtable("row", st_index, 1, "lefttop");
  });
  $("#MBLsheetColsRowsHandleAdd_column").click(function (event) {
    $("#MBLsheet-rightclick-menu").hide();
    MBLsheetContainerFocus();

    if (Store.allowEdit === false) {
      return;
    }

    let st_index = Store.MBLsheet_select_save[0].column[0];
    MBLsheetextendtable("column", st_index, 1, "lefttop");
  });

  // custom right-click a cell buttton click
  $(".MBLsheetColsRowsHandleAdd_custom").click(function (clickEvent) {
    $("#MBLsheet-rightclick-menu").hide();
    const cellRightClickConfig = MBLsheetConfigsetting.cellRightClickConfig;
    const rowIndex = Store.MBLsheet_select_save[0].row[0];
    const columnIndex = Store.MBLsheet_select_save[0].column[0];
    if (
      cellRightClickConfig.customs[
        Number(clickEvent.currentTarget.dataset.index)
      ]
    ) {
      try {
        cellRightClickConfig.customs[
          Number(clickEvent.currentTarget.dataset.index)
          // ].onClick(clickEvent, event, { rowIndex, columnIndex }); // 不需要回传两个event
        ].onClick(clickEvent, { rowIndex, columnIndex });
      } catch (e) {
        console.error("custom click error", e);
      }
    }
  });
  // Add the row up, and click the text area to trigger the confirmation instead of clicking the confirmation button to enhance the experience
  // $("#MBLsheet-addTopRows").click(function (event) {
  // $("#MBLsheetColsRowsHandleAdd_sub .MBLsheet-cols-menuitem:first-child").click(function (event) {

  //     // Click input element, don't comfirm
  //     if(event.target.nodeName === 'INPUT'){
  //         return;
  //     }

  //     $("#MBLsheet-rightclick-menu").hide();
  //     MBLsheetContainerFocus();

  //     const _locale = locale();
  //     const locale_drag = _locale.drag;
  //     const locale_info = _locale.info;

  //     if(Store.MBLsheet_select_save.length > 1){
  //         if(isEditMode()){
  //             alert(locale_drag.noMulti);
  //         }
  //         else{
  //             tooltip.info(locale_drag.noMulti, "");
  //         }

  //         return;
  //     }

  //     let $t = $(this), value = $t.find("input").val();
  //     if (!isRealNum(value)) {
  //         if(isEditMode()){
  //             alert(locale_info.tipInputNumber);
  //         }
  //         else{
  //             tooltip.info(locale_info.tipInputNumber, "");
  //         }

  //         return;
  //     }

  //     value = parseInt(value);

  //     if (value < 1 || value > 100) {
  //         if(isEditMode()){
  //             alert(locale_info.tipInputNumberLimit);
  //         }
  //         else{
  //             tooltip.info(locale_info.tipInputNumberLimit, "");
  //         }
  //         return;
  //     }

  //     let st_index = Store.MBLsheet_select_save[0].row[0];
  //     MBLsheetextendtable('row', st_index, value, "lefttop");

  //     $("#MBLsheetColsRowsHandleAdd_sub").hide();
  // })

  // // input输入时阻止冒泡，禁止父级元素的确认事件触发
  // $("input.MBLsheet-mousedown-cancel").click(function(event) {
  //     event.stopPropagation;
  // })

  // $("#MBLsheet-addLeftCols").click(function (event) {
  // $("#MBLsheetColsRowsHandleAdd_sub .MBLsheet-cols-menuitem:nth-child(3)").click(function (event) {

  //     // Click input element, don't comfirm
  //     if(event.target.nodeName === 'INPUT'){
  //         return;
  //     }

  //     $("#MBLsheet-rightclick-menu").hide();
  //     MBLsheetContainerFocus();

  //     const _locale = locale();
  //     const locale_drag = _locale.drag;
  //     const locale_info = _locale.info;

  //     if(Store.MBLsheet_select_save.length > 1){
  //         if(isEditMode()){
  //             alert(locale_drag.noMulti);
  //         }
  //         else{
  //             tooltip.info(locale_drag.noMulti, "");
  //         }

  //         return;
  //     }

  //     let $t = $(this), value = $t.find("input").val();
  //     if (!isRealNum(value)) {
  //         if(isEditMode()){
  //             alert(locale_info.tipInputNumber);
  //         }
  //         else{
  //             tooltip.info(locale_info.tipInputNumber, "");
  //         }

  //         return;
  //     }

  //     value = parseInt(value);

  //     if (value < 1 || value > 100) {
  //         if(isEditMode()){
  //             alert(locale_info.tipInputNumberLimit);
  //         }
  //         else{
  //             tooltip.info(locale_info.tipInputNumberLimit, "");
  //         }
  //         return;
  //     }

  //     let st_index = Store.MBLsheet_select_save[0].column[0];
  //     MBLsheetextendtable('column', st_index, value, "lefttop");

  //     $("#MBLsheetColsRowsHandleAdd_sub").hide();

  // })

  //向右增加列，向下增加行
  // $("#MBLsheet-add-rightbottom, #MBLsheet-add-rightbottom_t").click(function (event) {
  $("#MBLsheet-bottom-right-add-selected").click(function (event) {
    // Click input element, don't comfirm
    if (event.target.nodeName === "INPUT") {
      return;
    }

    $("#MBLsheet-rightclick-menu").hide();
    MBLsheetContainerFocus();

    const _locale = locale();
    const locale_drag = _locale.drag;
    const locale_info = _locale.info;

    if (Store.MBLsheet_select_save.length > 1) {
      if (isEditMode()) {
        alert(locale_drag.noMulti);
      } else {
        tooltip.info(locale_drag.noMulti, "");
      }

      return;
    }

    let $t = $(this),
      value = $t.find("input").val();
    if (!isRealNum(value)) {
      if (isEditMode()) {
        alert(locale_info.tipInputNumber);
      } else {
        tooltip.info(locale_info.tipInputNumber, "");
      }

      return;
    }

    value = parseInt(value);

    if (value < 1 || value > 100) {
      if (isEditMode()) {
        alert(locale_info.tipInputNumberLimit);
      } else {
        tooltip.info(locale_info.tipInputNumberLimit, "");
      }

      return;
    }

    let st_index =
      Store.MBLsheet_select_save[0][Store.MBLsheetRightHeadClickIs][1];
    if (
      !method.createHookFunction(
        "rowInsertBefore",
        st_index,
        value,
        "rightbottom"
      )
    ) {
      return;
    }
    MBLsheetextendtable(
      Store.MBLsheetRightHeadClickIs,
      st_index,
      value,
      "rightbottom"
    );
  });

  // $("#MBLsheet-addBottomRows").click(function (event) {
  // $("#MBLsheetColsRowsHandleAdd_sub .MBLsheet-cols-menuitem:nth-child(2)").click(function (event) {

  //      // Click input element, don't comfirm
  //      if(event.target.nodeName === 'INPUT'){
  //         return;
  //     }

  //     $("#MBLsheet-rightclick-menu").hide();
  //     MBLsheetContainerFocus();

  //     const _locale = locale();
  //     const locale_drag = _locale.drag;
  //     const locale_info = _locale.info;

  //     if(Store.MBLsheet_select_save.length > 1){
  //         if(isEditMode()){
  //             alert(locale_drag.noMulti);
  //         }
  //         else{
  //             tooltip.info(locale_drag.noMulti, "");
  //         }

  //         return;
  //     }

  //     let $t = $(this), value = $t.find("input").val();
  //     if (!isRealNum(value)) {
  //         if(isEditMode()){
  //             alert(locale_info.tipInputNumber);
  //         }
  //         else{
  //             tooltip.info(locale_info.tipInputNumber, "");
  //         }

  //         return;
  //     }

  //     value = parseInt(value);

  //     if (value < 1 || value > 100) {
  //         if(isEditMode()){
  //             alert(locale_info.tipInputNumberLimit);
  //         }
  //         else{
  //             tooltip.info(locale_info.tipInputNumberLimit, "");
  //         }

  //         return;
  //     }

  //     let st_index = Store.MBLsheet_select_save[0].row[1];
  //     MBLsheetextendtable('row', st_index, value, "rightbottom");

  //     $("#MBLsheetColsRowsHandleAdd_sub").hide();

  // });
  // $("#MBLsheet-addRightCols").click(function (event) {
  // $("#MBLsheetColsRowsHandleAdd_sub .MBLsheet-cols-menuitem:nth-child(4)").click(function (event) {

  //     // Click input element, don't comfirm
  //     if(event.target.nodeName === 'INPUT'){
  //         return;
  //     }
  //     $("#MBLsheet-rightclick-menu").hide();
  //     MBLsheetContainerFocus();

  //     const _locale = locale();
  //     const locale_drag = _locale.drag;
  //     const locale_info = _locale.info;

  //     if(Store.MBLsheet_select_save.length > 1){
  //         if(isEditMode()){
  //             alert(locale_drag.noMulti);
  //         }
  //         else{
  //             tooltip.info(locale_drag.noMulti, "");
  //         }

  //         return;
  //     }

  //     let $t = $(this), value = $t.find("input").val();
  //     if (!isRealNum(value)) {
  //         if(isEditMode()){
  //             alert(locale_info.tipInputNumber);
  //         }
  //         else{
  //             tooltip.info(locale_info.tipInputNumber, "");
  //         }

  //         return;
  //     }

  //     value = parseInt(value);

  //     if (value < 1 || value > 100) {
  //         if(isEditMode()){
  //             alert(locale_info.tipInputNumberLimit);
  //         }
  //         else{
  //             tooltip.info(locale_info.tipInputNumberLimit, "");
  //         }

  //         return;
  //     }

  //     let st_index = Store.MBLsheet_select_save[0].column[1];
  //     MBLsheetextendtable('column', st_index, value, "rightbottom");

  //     $("#MBLsheetColsRowsHandleAdd_sub").hide();

  // });

  //删除选中行列
  $("#MBLsheet-del-selected, #MBLsheet-del-selected_t").click(function (event) {
    $("#MBLsheet-rightclick-menu").hide();
    MBLsheetContainerFocus();

    const locale_drag = locale().drag;

    if (Store.MBLsheet_select_save.length > 1) {
      if (Store.MBLsheetRightHeadClickIs == "row") {
        if (isEditMode()) {
          alert(locale_drag.noMulti);
        } else {
          tooltip.info(locale_drag.noMulti, "");
        }
      } else if (Store.MBLsheetRightHeadClickIs == "column") {
        if (isEditMode()) {
          alert(locale_drag.noMulti);
        } else {
          tooltip.info(locale_drag.noMulti, "");
        }
      }
      return;
    }

    let st_index =
        Store.MBLsheet_select_save[0][Store.MBLsheetRightHeadClickIs][0],
      ed_index =
        Store.MBLsheet_select_save[0][Store.MBLsheetRightHeadClickIs][1];
    if (!method.createHookFunction("rowDeleteBefore", st_index, ed_index)) {
      return;
    }
    MBLsheetdeletetable(Store.MBLsheetRightHeadClickIs, st_index, ed_index);
  });
  $("#MBLsheet-delRows").click(function (event) {
    $("#MBLsheet-rightclick-menu").hide();
    MBLsheetContainerFocus();

    const locale_drag = locale().drag;

    if (Store.MBLsheet_select_save.length > 1) {
      if (Store.MBLsheetRightHeadClickIs == "row") {
        if (isEditMode()) {
          alert(locale_drag.noMulti);
        } else {
          tooltip.info(locale_drag.noMulti, "");
        }
      } else if (Store.MBLsheetRightHeadClickIs == "column") {
        if (isEditMode()) {
          alert(locale_drag.noMulti);
        } else {
          tooltip.info(locale_drag.noMulti, "");
        }
      }
      return;
    }

    let st_index = Store.MBLsheet_select_save[0].row[0],
      ed_index = Store.MBLsheet_select_save[0].row[1];
    if (!method.createHookFunction("rowDeleteBefore", st_index, ed_index)) {
      return;
    }
    MBLsheetdeletetable("row", st_index, ed_index);
  });
  $("#MBLsheet-delCols").click(function (event) {
    $("#MBLsheet-rightclick-menu").hide();
    MBLsheetContainerFocus();

    const locale_drag = locale().drag;

    if (Store.MBLsheet_select_save.length > 1) {
      if (Store.MBLsheetRightHeadClickIs == "row") {
        if (isEditMode()) {
          alert(locale_drag.noMulti);
        } else {
          tooltip.info(locale_drag.noMulti, "");
        }
      } else if (Store.MBLsheetRightHeadClickIs == "column") {
        if (isEditMode()) {
          alert(locale_drag.noMulti);
        } else {
          tooltip.info(locale_drag.noMulti, "");
        }
      }
      return;
    }

    let st_index = Store.MBLsheet_select_save[0].column[0],
      ed_index = Store.MBLsheet_select_save[0].column[1];
    MBLsheetdeletetable("column", st_index, ed_index);
  });

  //隐藏选中行列
  $("#MBLsheet-hide-selected").click(function (event) {
    $("#MBLsheet-rightclick-menu").hide();
    MBLsheetContainerFocus();

    const locale_drag = locale().drag;

    if (Store.MBLsheet_select_save.length > 1) {
      if (Store.MBLsheetRightHeadClickIs == "row") {
        if (isEditMode()) {
          alert(locale_drag.noMulti);
        } else {
          tooltip.info(locale_drag.noMulti, "");
        }
      } else if (Store.MBLsheetRightHeadClickIs == "column") {
        if (isEditMode()) {
          alert(locale_drag.noMulti);
        } else {
          tooltip.info(locale_drag.noMulti, "");
        }
      }
      return;
    }

    // 隐藏行
    if (Store.MBLsheetRightHeadClickIs == "row") {
      if (
        !checkProtectionAuthorityNormal(Store.currentSheetIndex, "formatRows")
      ) {
        return;
      }

      let cfg = $.extend(true, {}, Store.config);
      if (cfg["rowhidden"] == null) {
        cfg["rowhidden"] = {};
      }

      for (let s = 0; s < Store.MBLsheet_select_save.length; s++) {
        let r1 = Store.MBLsheet_select_save[s].row[0],
          r2 = Store.MBLsheet_select_save[s].row[1];

        for (let r = r1; r <= r2; r++) {
          cfg["rowhidden"][r] = 0;
        }
      }

      //保存撤销
      if (Store.clearjfundo) {
        let redo = {};
        redo["type"] = "showHidRows";
        redo["sheetIndex"] = Store.currentSheetIndex;
        redo["config"] = $.extend(true, {}, Store.config);
        redo["curconfig"] = cfg;

        Store.jfundo.length = 0;
        Store.jfredo.push(redo);
      }

      //config
      Store.config = cfg;
      Store.MBLsheetfile[getSheetIndex(Store.currentSheetIndex)].config =
        Store.config;

      server.saveParam("cg", Store.currentSheetIndex, cfg["rowhidden"], {
        k: "rowhidden",
      });

      //行高、列宽 刷新
      jfrefreshgrid_rhcw(Store.flowdata.length, Store.flowdata[0].length);
    }
    // 隐藏列
    else if (Store.MBLsheetRightHeadClickIs == "column") {
      if (
        !checkProtectionAuthorityNormal(
          Store.currentSheetIndex,
          "formatColumns"
        )
      ) {
        return;
      }

      let cfg = $.extend(true, {}, Store.config);
      if (cfg["colhidden"] == null) {
        cfg["colhidden"] = {};
      }

      for (let s = 0; s < Store.MBLsheet_select_save.length; s++) {
        let c1 = Store.MBLsheet_select_save[s].column[0],
          c2 = Store.MBLsheet_select_save[s].column[1];

        for (let c = c1; c <= c2; c++) {
          cfg["colhidden"][c] = 0;
        }
      }

      //保存撤销
      if (Store.clearjfundo) {
        let redo = {};
        redo["type"] = "showHidCols";
        redo["sheetIndex"] = Store.currentSheetIndex;
        redo["config"] = $.extend(true, {}, Store.config);
        redo["curconfig"] = cfg;

        Store.jfundo.length = 0;
        Store.jfredo.push(redo);
      }

      //config
      Store.config = cfg;
      Store.MBLsheetfile[getSheetIndex(Store.currentSheetIndex)].config =
        Store.config;

      server.saveParam("cg", Store.currentSheetIndex, cfg["colhidden"], {
        k: "colhidden",
      });

      //行高、列宽 刷新
      jfrefreshgrid_rhcw(Store.flowdata.length, Store.flowdata[0].length);
    }
  });

  //取消隐藏选中行列
  $("#MBLsheet-show-selected").click(function (event) {
    $("#MBLsheet-rightclick-menu").hide();
    MBLsheetContainerFocus();

    const locale_drag = locale().drag;

    if (Store.MBLsheet_select_save.length > 1) {
      if (Store.MBLsheetRightHeadClickIs == "row") {
        if (isEditMode()) {
          alert(locale_drag.noMulti);
        } else {
          tooltip.info(locale_drag.noMulti, "");
        }
      } else if (Store.MBLsheetRightHeadClickIs == "column") {
        if (isEditMode()) {
          alert(locale_drag.noMulti);
        } else {
          tooltip.info(locale_drag.noMulti, "");
        }
      }
      return;
    }

    // 取消隐藏行
    if (Store.MBLsheetRightHeadClickIs == "row") {
      if (
        !checkProtectionAuthorityNormal(Store.currentSheetIndex, "formatRows")
      ) {
        return;
      }

      let cfg = $.extend(true, {}, Store.config);
      if (cfg["rowhidden"] == null) {
        return;
      }

      for (let s = 0; s < Store.MBLsheet_select_save.length; s++) {
        let r1 = Store.MBLsheet_select_save[s].row[0],
          r2 = Store.MBLsheet_select_save[s].row[1];

        for (let r = r1; r <= r2; r++) {
          delete cfg["rowhidden"][r];
        }
      }

      //保存撤销
      if (Store.clearjfundo) {
        let redo = {};
        redo["type"] = "showHidRows";
        redo["sheetIndex"] = Store.currentSheetIndex;
        redo["config"] = $.extend(true, {}, Store.config);
        redo["curconfig"] = cfg;

        Store.jfundo.length = 0;
        Store.jfredo.push(redo);
      }

      //config
      Store.config = cfg;
      Store.MBLsheetfile[getSheetIndex(Store.currentSheetIndex)].config =
        Store.config;

      server.saveParam("cg", Store.currentSheetIndex, cfg["rowhidden"], {
        k: "rowhidden",
      });

      //行高、列宽 刷新
      jfrefreshgrid_rhcw(Store.flowdata.length, Store.flowdata[0].length);
    } else if (Store.MBLsheetRightHeadClickIs == "column") {
      if (
        !checkProtectionAuthorityNormal(
          Store.currentSheetIndex,
          "formatColumns"
        )
      ) {
        return;
      }

      let cfg = $.extend(true, {}, Store.config);
      if (cfg["colhidden"] == null) {
        return;
      }

      for (let s = 0; s < Store.MBLsheet_select_save.length; s++) {
        let c1 = Store.MBLsheet_select_save[s].column[0],
          c2 = Store.MBLsheet_select_save[s].column[1];

        for (let c = c1; c <= c2; c++) {
          delete cfg["colhidden"][c];
        }
      }

      //保存撤销
      if (Store.clearjfundo) {
        let redo = {};
        redo["type"] = "showHidCols";
        redo["sheetIndex"] = Store.currentSheetIndex;
        redo["config"] = $.extend(true, {}, Store.config);
        redo["curconfig"] = cfg;

        Store.jfundo.length = 0;
        Store.jfredo.push(redo);
      }

      //config
      Store.config = cfg;
      Store.MBLsheetfile[getSheetIndex(Store.currentSheetIndex)].config =
        Store.config;

      server.saveParam("cg", Store.currentSheetIndex, cfg["colhidden"], {
        k: "colhidden",
      });

      //行高、列宽 刷新
      jfrefreshgrid_rhcw(Store.flowdata.length, Store.flowdata[0].length);
    }
  });
  //隐藏、显示行
  // $("#MBLsheet-hidRows").click(function (event) {
  //     if(!checkProtectionAuthorityNormal(Store.currentSheetIndex, "formatRows")){
  //         return;
  //     }

  //     $("#MBLsheet-rightclick-menu").hide();
  //     MBLsheetContainerFocus();

  //     let cfg = $.extend(true, {}, Store.config);
  //     if(cfg["rowhidden"] == null){
  //         cfg["rowhidden"] = {};
  //     }

  //     for(let s = 0; s < Store.MBLsheet_select_save.length; s++){
  //         let r1 = Store.MBLsheet_select_save[s].row[0],
  //             r2 = Store.MBLsheet_select_save[s].row[1];

  //         for(let r = r1; r <= r2; r++){
  //             cfg["rowhidden"][r] = 0;
  //         }
  //     }

  //     //保存撤销
  //     if(Store.clearjfundo){
  //         let redo = {};
  //         redo["type"] = "showHidRows";
  //         redo["sheetIndex"] = Store.currentSheetIndex;
  //         redo["config"] = $.extend(true, {}, Store.config);
  //         redo["curconfig"] = cfg;

  //         Store.jfundo.length  = 0;
  //         Store.jfredo.push(redo);
  //     }

  //     //config
  //     Store.config = cfg;
  //     Store.MBLsheetfile[getSheetIndex(Store.currentSheetIndex)].config = Store.config;

  //     server.saveParam("cg", Store.currentSheetIndex, cfg["rowhidden"], { "k": "rowhidden" });

  //     //行高、列宽 刷新
  //     jfrefreshgrid_rhcw(Store.flowdata.length, Store.flowdata[0].length);
  // })
  // $("#MBLsheet-showHidRows").click(function (event) {
  //     if(!checkProtectionAuthorityNormal(Store.currentSheetIndex, "formatRows")){
  //         return;
  //     }
  //     $("#MBLsheet-rightclick-menu").hide();
  //     MBLsheetContainerFocus();

  //     let cfg = $.extend(true, {}, Store.config);
  //     if(cfg["rowhidden"] == null){
  //         return;
  //     }

  //     for(let s = 0; s < Store.MBLsheet_select_save.length; s++){
  //         let r1 = Store.MBLsheet_select_save[s].row[0],
  //             r2 = Store.MBLsheet_select_save[s].row[1];

  //         for(let r = r1; r <= r2; r++){
  //             delete cfg["rowhidden"][r];
  //         }
  //     }

  //     //保存撤销
  //     if(Store.clearjfundo){
  //         let redo = {};
  //         redo["type"] = "showHidRows";
  //         redo["sheetIndex"] = Store.currentSheetIndex;
  //         redo["config"] = $.extend(true, {}, Store.config);
  //         redo["curconfig"] = cfg;

  //         Store.jfundo.length  = 0;
  //         Store.jfredo.push(redo);
  //     }

  //     //config
  //     Store.config = cfg;
  //     Store.MBLsheetfile[getSheetIndex(Store.currentSheetIndex)].config = Store.config;

  //     server.saveParam("cg", Store.currentSheetIndex, cfg["rowhidden"], { "k": "rowhidden" });

  //     //行高、列宽 刷新
  //     jfrefreshgrid_rhcw(Store.flowdata.length, Store.flowdata[0].length);
  // })

  //隐藏、显示列
  // $("#MBLsheet-hidCols").click(function (event) {
  //     if(!checkProtectionAuthorityNormal(Store.currentSheetIndex, "formatColumns")){
  //         return;
  //     }
  //     $("#MBLsheet-rightclick-menu").hide();
  //     MBLsheetContainerFocus();

  //     let cfg = $.extend(true, {}, Store.config);
  //     if(cfg["colhidden"] == null){
  //         cfg["colhidden"] = {};
  //     }

  //     for(let s = 0; s < Store.MBLsheet_select_save.length; s++){
  //         let c1 = Store.MBLsheet_select_save[s].column[0],
  //             c2 = Store.MBLsheet_select_save[s].column[1];

  //         for(let c = c1; c <= c2; c++){
  //             cfg["colhidden"][c] = 0;
  //         }
  //     }

  //     //保存撤销
  //     if(Store.clearjfundo){
  //         let redo = {};
  //         redo["type"] = "showHidCols";
  //         redo["sheetIndex"] = Store.currentSheetIndex;
  //         redo["config"] = $.extend(true, {}, Store.config);
  //         redo["curconfig"] = cfg;

  //         Store.jfundo.length  = 0;
  //         Store.jfredo.push(redo);
  //     }

  //     //config
  //     Store.config = cfg;
  //     Store.MBLsheetfile[getSheetIndex(Store.currentSheetIndex)].config = Store.config;

  //     server.saveParam("cg", Store.currentSheetIndex, cfg["colhidden"], { "k": "colhidden" });

  //     //行高、列宽 刷新
  //     jfrefreshgrid_rhcw(Store.flowdata.length, Store.flowdata[0].length);
  // })
  // $("#MBLsheet-showHidCols").click(function (event) {
  //     if(!checkProtectionAuthorityNormal(Store.currentSheetIndex, "formatColumns")){
  //         return;
  //     }
  //     $("#MBLsheet-rightclick-menu").hide();
  //     MBLsheetContainerFocus();

  //     let cfg = $.extend(true, {}, Store.config);
  //     if(cfg["colhidden"] == null){
  //         return;
  //     }

  //     for(let s = 0; s < Store.MBLsheet_select_save.length; s++){
  //         let c1 = Store.MBLsheet_select_save[s].column[0],
  //             c2 = Store.MBLsheet_select_save[s].column[1];

  //         for(let c = c1; c <= c2; c++){
  //             delete cfg["colhidden"][c];
  //         }
  //     }

  //     //保存撤销
  //     if(Store.clearjfundo){
  //         let redo = {};
  //         redo["type"] = "showHidCols";
  //         redo["sheetIndex"] = Store.currentSheetIndex;
  //         redo["config"] = $.extend(true, {}, Store.config);
  //         redo["curconfig"] = cfg;

  //         Store.jfundo.length  = 0;
  //         Store.jfredo.push(redo);
  //     }

  //     //config
  //     Store.config = cfg;
  //     Store.MBLsheetfile[getSheetIndex(Store.currentSheetIndex)].config = Store.config;

  //     server.saveParam("cg", Store.currentSheetIndex, cfg["colhidden"], { "k": "colhidden" });

  //     //行高、列宽 刷新
  //     jfrefreshgrid_rhcw(Store.flowdata.length, Store.flowdata[0].length);
  // })

  //删除单元格（左移、上移）
  $("#MBLsheet-delCellsMoveLeft").click(function (event) {
    $("body .MBLsheet-cols-menu").hide();
    MBLsheetContainerFocus();

    const locale_drag = locale().drag;

    if (Store.MBLsheet_select_save.length > 1) {
      if (isEditMode()) {
        alert(locale_drag.noMulti);
      } else {
        tooltip.info(locale_drag.noMulti, "");
      }
      return;
    }

    let str = Store.MBLsheet_select_save[0].row[0],
      edr = Store.MBLsheet_select_save[0].row[1],
      stc = Store.MBLsheet_select_save[0].column[0],
      edc = Store.MBLsheet_select_save[0].column[1];

    MBLsheetDeleteCell("moveLeft", str, edr, stc, edc);
  });
  $("#MBLsheet-delCellsMoveUp").click(function (event) {
    $("body .MBLsheet-cols-menu").hide();
    MBLsheetContainerFocus();

    const locale_drag = locale().drag;

    if (Store.MBLsheet_select_save.length > 1) {
      if (isEditMode()) {
        alert(locale_drag.noMulti);
      } else {
        tooltip.info(locale_drag.noMulti, "");
      }
      return;
    }

    let str = Store.MBLsheet_select_save[0].row[0],
      edr = Store.MBLsheet_select_save[0].row[1],
      stc = Store.MBLsheet_select_save[0].column[0],
      edc = Store.MBLsheet_select_save[0].column[1];

    MBLsheetDeleteCell("moveUp", str, edr, stc, edc);
  });

  //清除单元格内容
  $("#MBLsheet-delete-text").click(function () {
    if (
      !checkProtectionLockedRangeList(
        Store.MBLsheet_select_save,
        Store.currentSheetIndex
      )
    ) {
      return;
    }

    $("#MBLsheet-rightclick-menu").hide();
    MBLsheetContainerFocus();

    if (Store.allowEdit === false) {
      return;
    }

    if (Store.MBLsheet_select_save.length > 0) {
      let d = editor.deepCopyFlowData(Store.flowdata);

      let has_PartMC = false;

      for (let s = 0; s < Store.MBLsheet_select_save.length; s++) {
        let r1 = Store.MBLsheet_select_save[s].row[0],
          r2 = Store.MBLsheet_select_save[s].row[1];
        let c1 = Store.MBLsheet_select_save[s].column[0],
          c2 = Store.MBLsheet_select_save[s].column[1];

        if (hasPartMC(Store.config, r1, r2, c1, c2)) {
          has_PartMC = true;
          break;
        }
      }

      if (has_PartMC) {
        const locale_drag = locale().drag;

        if (isEditMode()) {
          alert(locale_drag.noPartMerge);
        } else {
          tooltip.info(locale_drag.noPartMerge, "");
        }

        return;
      }

      const file = Store.MBLsheetfile[getSheetIndex(Store.currentSheetIndex)];

      const hyperlink = file.hyperlink && $.extend(true, {}, file.hyperlink);
      let hyperlinkUpdated;

      const delPosiArr = [];

      console.log(
        "%c Line:2473 🍪 Store.MBLsheet_select_save",
        "color:#f5ce50",
        Store.MBLsheet_select_save
      );
      for (let s = 0; s < Store.MBLsheet_select_save.length; s++) {
        let r1 = Store.MBLsheet_select_save[s].row[0],
          r2 = Store.MBLsheet_select_save[s].row[1];
        let c1 = Store.MBLsheet_select_save[s].column[0],
          c2 = Store.MBLsheet_select_save[s].column[1];

        for (let r = r1; r <= r2; r++) {
          for (let c = c1; c <= c2; c++) {
            if (pivotTable.isPivotRange(r, c)) {
              continue;
            }

            if (getObjType(d[r][c]) == "object") {
              // delete d[r][c]["m"];
              // delete d[r][c]["v"];
              d[r][c] = {
                ...file.columns[c],
                m: file.columns[c]?.fieldsProps?.defaultValue,
                v: file.columns[c]?.fieldsProps?.defaultValue,
              };

              // if (d[r][c]["f"] != null) {
              //   delete d[r][c]["f"];
              //   formula.delFunctionGroup(r, c, Store.currentSheetIndex);

              //   delete d[r][c]["spl"];
              // }

              // if (d[r][c]["ct"] != null && d[r][c]["ct"].t == "inlineStr") {
              //   delete d[r][c]["ct"];
              // }

              delPosiArr.push({ r, c });
            } else {
              d[r][c] = null;
            }
            // 同步清除 hyperlink
            if (hyperlink?.[`${r}_${c}`]) {
              delete hyperlink[`${r}_${c}`];
              hyperlinkUpdated = true;
            }
          }
        }
      }

      jfrefreshgrid(
        d,
        Store.MBLsheet_select_save,
        hyperlinkUpdated && { hyperlink }
      );

      if (delPosiArr?.length) {
        eventBus.publish("deleteCell", delPosiArr);
      }

      // 清空编辑框的内容
      // 备注：在functionInputHanddler方法中会把该标签的内容拷贝到 #MBLsheet-functionbox-cell
      $("#MBLsheet-rich-text-editor").html("");
    }
  });

  //行高列宽设置
  // $("#MBLsheet-rows-cols-changesize").click(function(){
  $("#MBLsheet-column-row-width-selected").click(function (event) {
    // Click input element, don't comfirm
    if (event.target.nodeName === "INPUT") {
      return;
    }

    $("#MBLsheet-rightclick-menu").hide();
    MBLsheetContainerFocus();

    // let size = parseInt($(this).siblings("input[type='number']").val().trim());
    let size = parseInt(
      $(this)
        .closest(".MBLsheet-cols-menuitem")
        .find("input[type='number']")
        .val()
        .trim()
    );

    const locale_info = locale().info;

    /* 对异常情况进行判断：NaN */
    if (isNaN(size)) {
      tooltip.info("只允许使用数字来设置行列的宽高!", "");
      return;
    }

    let cfg = $.extend(true, {}, Store.config);
    let type;
    let images = null;

    if (Store.MBLsheetRightHeadClickIs == "row") {
      if (
        !checkProtectionAuthorityNormal(Store.currentSheetIndex, "formatRows")
      ) {
        return;
      }

      if (size < 0 || size > 545) {
        if (isEditMode()) {
          alert(locale_info.tipRowHeightLimit);
        } else {
          tooltip.info(locale_info.tipRowHeightLimit, "");
        }
        return;
      }

      type = "resizeR";

      if (cfg["rowlen"] == null) {
        cfg["rowlen"] = {};
      }

      for (let s = 0; s < Store.MBLsheet_select_save.length; s++) {
        let r1 = Store.MBLsheet_select_save[s].row[0];
        let r2 = Store.MBLsheet_select_save[s].row[1];

        for (let r = r1; r <= r2; r++) {
          cfg["rowlen"][r] = size;

          images = imageCtrl.moveChangeSize("row", r, size);
        }
      }
    } else if (Store.MBLsheetRightHeadClickIs == "column") {
      if (
        !checkProtectionAuthorityNormal(
          Store.currentSheetIndex,
          "formatColumns"
        )
      ) {
        return;
      }

      if (size < 0 || size > 2038) {
        if (isEditMode()) {
          alert(locale_info.tipColumnWidthLimit);
        } else {
          tooltip.info(locale_info.tipColumnWidthLimit, "");
        }
        return;
      }

      type = "resizeC";

      if (cfg["columnlen"] == null) {
        cfg["columnlen"] = {};
      }

      for (let s = 0; s < Store.MBLsheet_select_save.length; s++) {
        let c1 = Store.MBLsheet_select_save[s].column[0];
        let c2 = Store.MBLsheet_select_save[s].column[1];

        for (let c = c1; c <= c2; c++) {
          cfg["columnlen"][c] = size;

          images = imageCtrl.moveChangeSize("column", c, size);
        }
      }
    }

    if (Store.clearjfundo) {
      Store.jfundo.length = 0;
      Store.jfredo.push({
        type: "resize",
        ctrlType: type,
        sheetIndex: Store.currentSheetIndex,
        config: $.extend(true, {}, Store.config),
        curconfig: $.extend(true, {}, cfg),
        images: $.extend(true, {}, imageCtrl.images),
        curImages: $.extend(true, {}, images),
      });
    }

    //config
    Store.config = cfg;
    Store.MBLsheetfile[getSheetIndex(Store.currentSheetIndex)].config =
      Store.config;

    //images
    Store.MBLsheetfile[getSheetIndex(Store.currentSheetIndex)].images = images;
    server.saveParam("all", Store.currentSheetIndex, images, { k: "images" });
    imageCtrl.images = images;
    imageCtrl.allImagesShow();

    if (Store.MBLsheetRightHeadClickIs == "row") {
      server.saveParam("cg", Store.currentSheetIndex, cfg["rowlen"], {
        k: "rowlen",
      });
      jfrefreshgrid_rhcw(Store.flowdata.length, null);
    } else if (Store.MBLsheetRightHeadClickIs == "column") {
      server.saveParam("cg", Store.currentSheetIndex, cfg["columnlen"], {
        k: "columnlen",
      });
      jfrefreshgrid_rhcw(null, Store.flowdata[0].length);
    }
  });
}

function MBLsheetcolsdbclick() {
  Store.MBLsheet_cols_change_size = false;

  $("#MBLsheet-change-size-line").hide();
  $("#MBLsheet-cols-change-size").css("opacity", 0);
  $(
    "#MBLsheet-sheettable, #MBLsheet-cols-h-c, .MBLsheet-cols-h-cells, .MBLsheet-cols-h-cells canvas"
  ).css("cursor", "default");

  let mouse = mouseposition(event.pageX, event.pageY);
  let scrollLeft = $("#MBLsheet-cols-h-c").scrollLeft();
  let x = mouse[0] + scrollLeft;

  let colIndex = colLocation(x)[2];
  let d = editor.deepCopyFlowData(Store.flowdata);
  let canvas = $("#MBLsheetTableContent").get(0).getContext("2d");

  let cfg = $.extend(true, {}, Store.config);
  if (cfg["columnlen"] == null) {
    cfg["columnlen"] = {};
  }

  let matchColumn = {};
  let scrollTop = $("#MBLsheet-cell-main").scrollTop(),
    drawHeight = Store.MBLsheetTableContentHW[1];
  let dataset_row_st = MBLsheet_searcharray(Store.visibledatarow, scrollTop);
  let dataset_row_ed = MBLsheet_searcharray(
    Store.visibledatarow,
    scrollTop + drawHeight
  );
  dataset_row_ed += dataset_row_ed - dataset_row_st;
  if (dataset_row_ed >= d.length) {
    dataset_row_ed = d.length - 1;
  }

  for (let s = 0; s < Store.MBLsheet_select_save.length; s++) {
    let c1 = Store.MBLsheet_select_save[s].column[0],
      c2 = Store.MBLsheet_select_save[s].column[1];

    if (colIndex < c1 || colIndex > c2) {
      if (colIndex in matchColumn) {
        //此列已计算过
        continue;
      }

      let currentColLen = Store.defaultcollen;

      for (let r = dataset_row_st; r <= dataset_row_ed; r++) {
        let cell = d[r][colIndex];

        if (cell == null || (isRealNull(cell.v) && !isInlineStringCell(cell))) {
          continue;
        }

        // let fontset = MBLsheetfontformat(cell);
        // canvas.font = fontset;

        // let value = getcellvalue(r, colIndex, d, "m").toString(); //单元格文本
        // let textMetrics = getMeasureText(value, canvas).width; //文本宽度
        let cellWidth =
          colLocationByIndex(colIndex)[1] - colLocationByIndex(colIndex)[0] - 2;
        let textInfo = getCellTextInfo(cell, canvas, {
          r: r,
          c: colIndex,
          cellWidth: cellWidth,
        });

        let computeRowlen = 0;
        //
        if (textInfo != null) {
          computeRowlen = textInfo.textWidthAll;
        }

        if (computeRowlen + 6 > currentColLen) {
          currentColLen = computeRowlen + 6;
        }
      }

      if (currentColLen != Store.defaultcollen) {
        cfg["columnlen"][colIndex] = currentColLen;
        if (cfg["customWidth"]) {
          delete cfg["customWidth"][colIndex];
        }
      }

      matchColumn[colIndex] = 1;
    } else {
      for (let c = c1; c <= c2; c++) {
        if (c in matchColumn) {
          //此列已计算过
          continue;
        }

        let currentColLen = Store.defaultcollen;

        for (let r = dataset_row_st; r <= dataset_row_ed; r++) {
          let cell = d[r][c];

          if (
            cell == null ||
            (isRealNull(cell.v) && !isInlineStringCell(cell))
          ) {
            continue;
          }

          // let fontset = MBLsheetfontformat(cell);
          // canvas.font = fontset;

          // let value = getcellvalue(r, c, d, "m").toString(); //单元格文本
          // let textMetrics = getMeasureText(value, canvas).width; //文本宽度

          // if(textMetrics + 6 > currentColLen){
          //     currentColLen = textMetrics + 6;
          // }

          let cellWidth =
            colLocationByIndex(c)[1] - colLocationByIndex(c)[0] - 2;
          let textInfo = getCellTextInfo(cell, canvas, {
            r: r,
            c: c,
            cellWidth: cellWidth,
          });

          let computeRowlen = 0;
          //
          if (textInfo != null) {
            computeRowlen = textInfo.textWidthAll;
          }

          if (computeRowlen + 6 > currentColLen) {
            currentColLen = computeRowlen + 6;
          }
        }

        if (currentColLen != Store.defaultcollen) {
          cfg["columnlen"][c] = currentColLen;
          if (cfg["customWidth"]) {
            delete cfg["customWidth"][c];
          }
        }

        matchColumn[c] = 1;
      }
    }
  }

  jfrefreshgridall(
    Store.flowdata[0].length,
    Store.flowdata.length,
    Store.flowdata,
    cfg,
    Store.MBLsheet_select_save,
    "resizeC",
    "columnlen"
  );
}

/**
 *
 * @param {String} type:delete type,
 * @param {*} st_index
 * @param {*} ed_index
 */
// Delete row api
export function deleteRows(type, st_index, ed_index) {
  Store.MBLsheetRightHeadClickIs = "column";
}

// Delete column api
export function deleteColumns() {}
