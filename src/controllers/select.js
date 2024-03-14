import menuButton from "./menuButton";
import formula from "../global/formula";
import { dynamicArrayHightShow } from "../global/dynamicArray";
import { rowLocationByIndex, colLocationByIndex } from "../global/location";
import browser from "../global/browser";
import dataVerificationCtrl from "./dataVerificationCtrl";
import { getSheetIndex, getRangetxt } from "../methods/get";
import Store from "../store";
import method from "../global/method";
import locale from "../locale/locale";
import { refreshMenuButtonFocus } from "../global/api";

//公式函数 选区实体框
function seletedHighlistByindex(id, r1, r2, c1, c2) {
  let row = Store.visibledatarow[r2],
    row_pre = r1 - 1 == -1 ? 0 : Store.visibledatarow[r1 - 1];
  let col = Store.visibledatacolumn[c2],
    col_pre = c1 - 1 == -1 ? 0 : Store.visibledatacolumn[c1 - 1];

  $("#" + id).css({
    left: col_pre,
    width: col - col_pre - 1,
    top: row_pre,
    height: row - row_pre - 1,
  });
}

//Set selection highlight
function selectHightlightShow(isRestore = false) {
  $("#MBLsheet-cell-selected-boxs").show();
  $("#MBLsheet-cell-selected-boxs #MBLsheet-cell-selected")
    .siblings(".MBLsheet-cell-selected")
    .remove();

  if (Store.MBLsheet_select_save.length > 0) {
    for (let i = 0; i < Store.MBLsheet_select_save.length; i++) {
      let r1 = Store.MBLsheet_select_save[i].row[0],
        r2 = Store.MBLsheet_select_save[i].row[1];
      let c1 = Store.MBLsheet_select_save[i].column[0],
        c2 = Store.MBLsheet_select_save[i].column[1];

      let rf, cf;
      if (Store.MBLsheet_select_save[i].row_focus == null) {
        rf = r1;
      } else {
        rf = Store.MBLsheet_select_save[i].row_focus;
      }

      if (Store.MBLsheet_select_save[i].column_focus == null) {
        cf = c1;
      } else {
        cf = Store.MBLsheet_select_save[i].column_focus;
      }

      let row = Store.visibledatarow[r2],
        row_pre = r1 - 1 == -1 ? 0 : Store.visibledatarow[r1 - 1];
      let col = Store.visibledatacolumn[c2],
        col_pre = c1 - 1 == -1 ? 0 : Store.visibledatacolumn[c1 - 1];

      let row_f = Store.visibledatarow[rf],
        row_pre_f = rf - 1 == -1 ? 0 : Store.visibledatarow[rf - 1];
      let col_f = Store.visibledatacolumn[cf],
        col_pre_f = cf - 1 == -1 ? 0 : Store.visibledatacolumn[cf - 1];

      let margeset = menuButton.mergeborer(Store.flowdata, rf, cf);
      if (!!margeset) {
        row_f = margeset.row[1];
        row_pre_f = margeset.row[0];

        col_f = margeset.column[1];
        col_pre_f = margeset.column[0];
      }

      Store.MBLsheet_select_save[i]["row"] = [r1, r2];
      Store.MBLsheet_select_save[i]["column"] = [c1, c2];

      Store.MBLsheet_select_save[i]["row_focus"] = rf;
      Store.MBLsheet_select_save[i]["column_focus"] = cf;

      Store.MBLsheet_select_save[i]["left"] = col_pre_f;
      Store.MBLsheet_select_save[i]["width"] = col_f - col_pre_f - 1;
      Store.MBLsheet_select_save[i]["top"] = row_pre_f;
      Store.MBLsheet_select_save[i]["height"] = row_f - row_pre_f - 1;

      Store.MBLsheet_select_save[i]["left_move"] = col_pre;
      Store.MBLsheet_select_save[i]["width_move"] = col - col_pre - 1;
      Store.MBLsheet_select_save[i]["top_move"] = row_pre;
      Store.MBLsheet_select_save[i]["height_move"] = row - row_pre - 1;

      if (i == 0) {
        if (Store.MBLsheet_select_save.length == 1) {
          if (browser.mobilecheck()) {
            //移动端
            $("#MBLsheet-cell-selected-boxs #MBLsheet-cell-selected")
              .css({
                left: Store.MBLsheet_select_save[i]["left_move"],
                width: Store.MBLsheet_select_save[i]["width_move"],
                top: Store.MBLsheet_select_save[i]["top_move"],
                height: Store.MBLsheet_select_save[i]["height_move"],
                display: "block",
                border: "1px solid #0188fb",
              })
              .find(".MBLsheet-cs-draghandle")
              .css("display", "block")
              .end()
              .find(".MBLsheet-cs-fillhandle")
              .css("display", "none")
              .end()
              .find(".MBLsheet-cs-touchhandle")
              .css("display", "block");
          } else {
            $("#MBLsheet-cell-selected-boxs #MBLsheet-cell-selected")
              .css({
                left: Store.MBLsheet_select_save[i]["left_move"],
                width: Store.MBLsheet_select_save[i]["width_move"],
                top: Store.MBLsheet_select_save[i]["top_move"],
                height: Store.MBLsheet_select_save[i]["height_move"],
                display: "block",
                border: "1px solid #0188fb",
              })
              .find(".MBLsheet-cs-draghandle")
              .css("display", "block")
              .end()
              .find(".MBLsheet-cs-fillhandle")
              .css("display", "block")
              .end()
              .find(".MBLsheet-cs-touchhandle")
              .css("display", "none");
          }
        } else {
          $("#MBLsheet-cell-selected-boxs #MBLsheet-cell-selected")
            .css({
              left: Store.MBLsheet_select_save[i]["left_move"],
              width: Store.MBLsheet_select_save[i]["width_move"],
              top: Store.MBLsheet_select_save[i]["top_move"],
              height: Store.MBLsheet_select_save[i]["height_move"],
              display: "block",
              border: "1px solid rgba(1, 136, 251, 0.15)",
            })
            .find(".MBLsheet-cs-draghandle")
            .css("display", "none")
            .end()
            .find(".MBLsheet-cs-fillhandle")
            .css("display", "none");
        }
      } else {
        $("#MBLsheet-cell-selected-boxs").append(
          '<div class="MBLsheet-cell-selected" style="left: ' +
            Store.MBLsheet_select_save[i]["left_move"] +
            "px; width: " +
            Store.MBLsheet_select_save[i]["width_move"] +
            "px; top: " +
            Store.MBLsheet_select_save[i]["top_move"] +
            "px; height: " +
            Store.MBLsheet_select_save[i]["height_move"] +
            'px; border: 1px solid rgba(1, 136, 251, 0.15); display: block;"></div>'
        );
      }

      if (i == Store.MBLsheet_select_save.length - 1) {
        //focus 取选区数组最后一个
        $("#MBLsheet-cell-selected-focus").css({
          left: Store.MBLsheet_select_save[i]["left"],
          width: Store.MBLsheet_select_save[i]["width"],
          top: Store.MBLsheet_select_save[i]["top"],
          height: Store.MBLsheet_select_save[i]["height"],
          display: "block",
        });
        //行列数
        MBLsheet_count_show(
          Store.MBLsheet_select_save[i]["left_move"],
          Store.MBLsheet_select_save[i]["top_move"],
          Store.MBLsheet_select_save[i]["width_move"],
          Store.MBLsheet_select_save[i]["height_move"],
          [r1, r2],
          [c1, c2]
        );
        //左上角选择区域框
        formula.fucntionboxshow(rf, cf);
        //focus单元格数据验证
        dataVerificationCtrl.cellFocus(rf, cf);
      }
    }

    //行列标题栏
    selectTitlesShow(Store.MBLsheet_select_save, isRestore);

    //左上角范围显示
    selectHelpboxFill();

    //动态数组显示
    if (
      Store.MBLsheet_select_save.length == 1 &&
      Store.MBLsheet_select_save[0].row[0] ==
        Store.MBLsheet_select_save[0].row[1] &&
      Store.MBLsheet_select_save[0].column[0] ==
        Store.MBLsheet_select_save[0].column[1]
    ) {
      dynamicArrayHightShow(
        Store.MBLsheet_select_save[0].row[0],
        Store.MBLsheet_select_save[0].column[0]
      );
    }

    /* 刷新当前状态栏 */
    refreshMenuButtonFocus();
  }

  Store.MBLsheetfile[
    getSheetIndex(Store.currentSheetIndex)
  ].MBLsheet_select_save = Store.MBLsheet_select_save;
  // Hook function, change the range selection box, selectHightlightShowillbe triggered multiple times when mousemove is moused, and thhistoricalvalue is used here to throttle
  const MBLsheet_select_save_previous = JSON.stringify(
    Store.MBLsheet_select_save
  );

  if (
    (Store.MBLsheet_select_save_previous == null) |
    (Store.MBLsheet_select_save_previous !== MBLsheet_select_save_previous)
  ) {
    method.createHookFunction(
      "rangeSelect",
      Store.MBLsheetfile[getSheetIndex(Store.currentSheetIndex)],
      Store.MBLsheet_select_save
    );
  }

  Store.MBLsheet_select_save_previous = MBLsheet_select_save_previous;
}

//选区标题栏
function selectTitlesShow(rangeArr, isRestore = false) {
  let s = $.extend(true, [], rangeArr);

  let rowTitleMap = {},
    columnTitleMap = {};
  for (let i = 0; i < s.length; i++) {
    let r1 = s[i]["row"][0],
      r2 = s[i]["row"][1],
      c1 = s[i]["column"][0],
      c2 = s[i]["column"][1];

    // if(isRestore){
    //     let margeset = menuButton.mergeborer(Store.flowdata, r1, c1);
    //     if(!!margeset){
    //         r1 = margeset.row[2];
    //         r2 = margeset.row[3];

    //         c1 = margeset.column[2];
    //         c2 = margeset.column[3];
    //     }
    // }

    //行、列标题栏
    rowTitleMap = selectTitlesMap(rowTitleMap, r1, r2);
    columnTitleMap = selectTitlesMap(columnTitleMap, c1, c2);
  }

  //行标题
  $("#MBLsheet-rows-h-selected").empty();

  let rowTitleRange = selectTitlesRange(rowTitleMap);
  for (let i = 0; i < rowTitleRange.length; i++) {
    let r1 = rowTitleRange[i][0],
      r2 = rowTitleRange[i][rowTitleRange[i].length - 1];
    let row = rowLocationByIndex(r2)[1],
      row_pre = rowLocationByIndex(r1)[0];

    $("#MBLsheet-rows-h-selected").append(
      '<div class="MBLsheet-rows-h-selected" style="top: ' +
        row_pre +
        "px; height: " +
        (row - row_pre - 1) +
        'px; display: block; background-color: rgba(76, 76, 76, 0.1);"></div>'
    );
  }

  //列标题
  $("#MBLsheet-cols-h-selected").empty();

  let columnTitleRange = selectTitlesRange(columnTitleMap);
  for (let j = 0; j < columnTitleRange.length; j++) {
    let c1 = columnTitleRange[j][0],
      c2 = columnTitleRange[j][columnTitleRange[j].length - 1];
    let col = colLocationByIndex(c2)[1],
      col_pre = colLocationByIndex(c1)[0];

    $("#MBLsheet-cols-h-selected").append(
      '<div class="MBLsheet-cols-h-selected" style="left: ' +
        col_pre +
        "px; width: " +
        (col - col_pre - 1) +
        'px; display: block; background-color: rgba(76, 76, 76, 0.1);"></div>'
    );
  }
}
function selectTitlesMap(rangeMap, range1, range2) {
  let map = $.extend(true, {}, rangeMap);

  for (let i = range1; i <= range2; i++) {
    if (i in map) {
      continue;
    }

    map[i] = 0;
  }

  return map;
}
function selectTitlesRange(map) {
  let mapArr = [];

  for (let i in map) {
    mapArr.push(i);
  }

  mapArr.sort(function (a, b) {
    return a - b;
  });

  let rangeArr = [];
  let item = [];

  if (mapArr.length > 1) {
    for (let j = 1; j < mapArr.length; j++) {
      if (mapArr[j] - mapArr[j - 1] == 1) {
        item.push(mapArr[j - 1]);

        if (j == mapArr.length - 1) {
          item.push(mapArr[j]);
          rangeArr.push(item);
        }
      } else {
        if (j == 1) {
          if (j == mapArr.length - 1) {
            item.push(mapArr[j - 1]);
            rangeArr.push(item);
            rangeArr.push([mapArr[j]]);
          } else {
            rangeArr.push(mapArr[0]);
          }
        } else if (j == mapArr.length - 1) {
          item.push(mapArr[j - 1]);
          rangeArr.push(item);
          rangeArr.push([mapArr[j]]);
        } else {
          item.push(mapArr[j - 1]);
          rangeArr.push(item);
          item = [];
        }
      }
    }
  } else {
    rangeArr.push([mapArr[0]]);
  }

  return rangeArr;
}

//选区是否重叠
function selectIsOverlap(range) {
  if (range == null) {
    range = Store.MBLsheet_select_save;
  }
  range = JSON.parse(JSON.stringify(range));

  let overlap = false;
  let map = {};

  for (let s = 0; s < range.length; s++) {
    let str_r = range[s].row[0],
      end_r = range[s].row[1];
    let str_c = range[s].column[0],
      end_c = range[s].column[1];

    for (let r = str_r; r <= end_r; r++) {
      for (let c = str_c; c <= end_c; c++) {
        if (r + "_" + c in map) {
          overlap = true;
          break;
        } else {
          map[r + "_" + c] = 0;
        }
      }
    }
  }

  return overlap;
}
// 协同提示框
function collaborativeEditBox() {
  let all_width = Store.visibledatacolumn; //当前操作页的所有列距离左边的距离
  let all_height = Store.visibledatarow; //当前操作页的所有列距离顶部的距离

  Store.cooperativeEdit.changeCollaborationSize.forEach((value) => {
    if (value.i == Store.currentSheetIndex) {
      let count_col = value.v.column; //系统提示框所在的列范围
      let change_width = all_width[count_col[0]] - 1; //提示框所在列号为0时要改变的宽
      if (value.v.column[0] !== 0) {
        //用提示框右边框到图表最左的距离减去左边框到图表左边距离再减去边框值
        change_width =
          all_width[count_col[1]] -
          all_width[count_col[0] - 1] -
          (count_col[1] - count_col[0] + 1);
      }
      let count_row = value.v.row; //系统提示框所在的行范围
      let change_height = all_height[count_row[0]] - 1;
      if (value.v.row[0] !== 0) {
        change_height =
          all_height[count_row[1]] -
          all_height[count_row[0] - 1] -
          (count_row[1] - count_row[0] + 1);
      }
      let range = Store.cooperativeEdit.merge_range; //获取单元格合并后的数据
      let change_left = all_width[value.v.column[0] - 1] - 1; //提示框离图表最左边的距离
      let change_top = all_height[value.v.row[0] - 1] - 1; //提示框离图表最右边的距离
      if (Store.config.columnlen !== null) {
        //当改变宽的列不在提示框范围内时，将改变列的初始位置改为在提示框范围内
        for (let k in Store.config.columnlen) {
          if (value.v.column[0] <= k && k <= value.v.column[1]) {
            Store.MBLsheet_cols_change_size_start[1] = k - 0;
            break;
          }
        }
      }
      if (Store.config.rowlen !== null) {
        for (let k in Store.config.rowlen) {
          if (value.v.row[0] <= k && k <= value.v.row[1]) {
            Store.MBLsheet_rows_change_size_start[1] = k - 0;
            break;
          }
        }
      }
      // 改变列宽的位置在提示框范围内
      let flag_width =
        value.v.column[0] <= Store.MBLsheet_cols_change_size_start[1] &&
        Store.MBLsheet_cols_change_size_start[1] <= value.v.column[1];
      if (flag_width) {
        if (Store.MBLsheet_cols_change_size_start[1] == 0) {
          change_width = all_width[0] - 1;
        } else {
          // 不在提示框范围内
          let counts = value.v.column;
          change_width =
            all_width[counts[1]] -
            all_width[counts[0] - 1] -
            (counts[1] - counts[0] + 1);
        }
      }
      let flag_height =
        value.v.row[0] <= Store.MBLsheet_rows_change_size_start[1] &&
        Store.MBLsheet_rows_change_size_start[1] <= value.v.row[1];
      if (flag_height) {
        if (Store.MBLsheet_rows_change_size_start[1] == 0) {
          change_height = all_height[0] - 1;
        } else {
          let counts = value.v.row;
          change_height =
            all_height[counts[1]] -
            all_height[counts[0] - 1] -
            (counts[1] - counts[0] + 1);
        }
      }
      //合并单元格时执行
      if (Object.keys(range).length > 0) {
        let flag_sure_merge = false;
        if (range.v.length > 1) {
          flag_sure_merge =
            range.v[1][0] == null || Object.keys(range.v[1][0]).length > 0;
        }
        if (range.v[0].length > 1) {
          flag_sure_merge =
            range.v[0][1] == null || Object.keys(range.v[0][1]).length > 0;
        }
        if (flag_sure_merge) {
          // 合并成一个时执行
          let flag_merge_width =
            range.column[0] <= value.v.column[0] &&
            range.column[1] >= value.v.column[1];
          change_left = all_width[range.column[0] - 1] - 1;
          change_top = all_height[range.row[0] - 1] - 1;
          change_width = all_width[range.column[1]] - 1;
          change_height = all_height[range.row[1]] - 1;
          if (flag_merge_width) {
            if (range.column[0] !== 0) {
              let counts = range.column;
              change_width =
                all_width[counts[1]] -
                all_width[counts[0] - 1] -
                (counts[1] - counts[0] + 1);
            } else {
              change_left = 0;
            }
            value.v.column = range.column;
          }
          let flag_merge_height =
            range.row[0] <= value.v.row[0] && range.row[1] >= value.v.row[1];
          if (flag_merge_height) {
            if (range.row[0] !== 0) {
              let counts = range.row;
              change_height =
                all_height[counts[1]] -
                all_height[counts[0] - 1] -
                (counts[1] - counts[0] + 1);
            } else {
              change_top = 0;
            }
            value.v.row = range.row;
          }
        } else {
          // 合并取消变成多个单元格时执行
          change_width =
            all_width[count_col[0]] - all_width[count_col[0] - 1] - 1;
          if (count_col[0] === 0) {
            change_width = all_width[count_col[0]] - 1;
          }
          change_height =
            all_height[count_row[0]] - all_height[count_row[0] - 1] - 1;
          if (count_row[0] === 0) {
            change_height = all_height[count_row[0]] - 1;
          }
        }
      }
      $("#MBLsheet-multipleRange-show-" + value.id).css({
        height: change_height,
        width: change_width,
        top: change_top + "px",
        left: change_left + "px",
      });
      let change_bottom =
        $("#MBLsheet-multipleRange-show-" + value.id)[0].offsetHeight - 1;
      $("#MBLsheet-multipleRange-show-" + value.id + ">.username").css({
        bottom: change_bottom + "px",
      });
    }
  });
}
//复制选区虚线框
function selectionCopyShow(range) {
  $("#MBLsheet-selection-copy").empty();

  if (range == null) {
    range = Store.MBLsheet_selection_range;
  }
  range = JSON.parse(JSON.stringify(range));

  if (range.length > 0) {
    for (let s = 0; s < range.length; s++) {
      let r1 = range[s].row[0],
        r2 = range[s].row[1];
      let c1 = range[s].column[0],
        c2 = range[s].column[1];

      let row = Store.visibledatarow[r2],
        row_pre = r1 - 1 == -1 ? 0 : Store.visibledatarow[r1 - 1];
      let col = Store.visibledatacolumn[c2],
        col_pre = c1 - 1 == -1 ? 0 : Store.visibledatacolumn[c1 - 1];

      let copyDomHtml =
        '<div class="MBLsheet-selection-copy" style="display: block; left: ' +
        col_pre +
        "px; width: " +
        (col - col_pre - 1) +
        "px; top: " +
        row_pre +
        "px; height: " +
        (row - row_pre - 1) +
        'px;">' +
        '<div class="MBLsheet-selection-copy-top MBLsheet-copy"></div>' +
        '<div class="MBLsheet-selection-copy-right MBLsheet-copy"></div>' +
        '<div class="MBLsheet-selection-copy-bottom MBLsheet-copy"></div>' +
        '<div class="MBLsheet-selection-copy-left MBLsheet-copy"></div>' +
        '<div class="MBLsheet-selection-copy-hc"></div>' +
        "</div>";
      $("#MBLsheet-selection-copy").append(copyDomHtml);
    }
  }
}

//选区行列数显示
function MBLsheet_count_show(
  left,
  top,
  width,
  height,
  rowseleted,
  columnseleted
) {
  let rowl = rowseleted[1] - rowseleted[0] + 1,
    coll = columnseleted[1] - columnseleted[0] + 1;
  let drawWidth = Store.MBLsheetTableContentHW[0],
    drawHeight = Store.MBLsheetTableContentHW[1];
  let scrollWidth = $("#MBLsheet-cell-main").scrollLeft(),
    scrollHeight = $("#MBLsheet-cell-main").scrollTop();

  const _locale = locale();
  const locale_info = _locale.info;

  if (rowl >= 4) {
    let leftv = left - 25;
    if (leftv < 0) {
      leftv = left + 5;
    }

    if (leftv < scrollWidth) {
      leftv = scrollWidth + 10;
    }

    let topv = top + height / 2;
    if (height > drawHeight) {
      topv = scrollHeight + drawHeight / 2;
    }

    $("#MBLsheet-row-count-show")
      .css({ left: leftv, top: topv, display: "block", width: "11px" })
      .html(
        "<div>" +
          rowl.toString().split("").join("</div><div>") +
          "</div><div>" +
          locale_info.row +
          "</div>"
      );
  } else {
    $("#MBLsheet-row-count-show").hide();
  }

  if (coll >= 4) {
    let topv = top - 25;
    if (topv < 0) {
      topv = top + 5;
    }

    if (topv < scrollHeight) {
      topv = scrollHeight + 10;
    }

    let leftv = left + width / 2;
    if (width > drawWidth) {
      leftv = scrollWidth + drawWidth / 2;
    }

    $("#MBLsheet-column-count-show")
      .css({ left: leftv, top: topv, display: "block" })
      .text(coll + locale_info.column);
  } else {
    $("#MBLsheet-column-count-show").hide();
  }
}

function selectHelpboxFill() {
  let range = Store.MBLsheet_select_save[Store.MBLsheet_select_save.length - 1];
  let rf = range["row_focus"],
    cf = range["column_focus"];
  if (Store.config["merge"] != null && rf + "_" + cf in Store.config["merge"]) {
    $("#MBLsheet-helpbox-cell").text(
      getRangetxt(Store.currentSheetIndex, {
        column: [cf, cf],
        row: [rf, rf],
      })
    );
  } else {
    $("#MBLsheet-helpbox-cell").text(
      getRangetxt(Store.currentSheetIndex, range)
    );
  }
}

export {
  seletedHighlistByindex,
  selectHightlightShow,
  selectIsOverlap,
  selectionCopyShow,
  collaborativeEditBox,
  MBLsheet_count_show,
  selectHelpboxFill,
};
