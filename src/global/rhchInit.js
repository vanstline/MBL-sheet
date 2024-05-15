import Store from "../store";
import { computeRowlenByContent, computeColWidthByContent } from "./getRowlen";
import MBLsheetConfigsetting from "../controllers/MBLsheetConfigsetting";

export default function rhchInit(rowheight, colwidth) {
  zoomSetting(); //Zoom sheet on first load
  //行高
  if (rowheight != null) {
    Store.visibledatarow = [];
    Store.rh_height = 0;

    for (let r = 0; r < rowheight; r++) {
      let rowlen = Store.defaultrowlen;

      if (Store.config["rowlen"] != null && Store.config["rowlen"][r] != null) {
        rowlen = Store.config["rowlen"][r];
      }

      if (
        Store.config["rowhidden"] != null &&
        Store.config["rowhidden"][r] != null
      ) {
        Store.visibledatarow.push(Store.rh_height);
        continue;
      }

      // 自动行高计算
      if (rowlen === "auto") {
        rowlen = computeRowlenByContent(Store.flowdata, r);
      }
      Store.rh_height += Math.round((rowlen + 1) * Store.zoomRatio);

      Store.visibledatarow.push(Store.rh_height); //行的临时长度分布
    }

    // 如果增加行和回到顶部按钮隐藏，则减少底部空白区域，但是预留足够空间给单元格下拉按钮
    console.log(
      "%c Line:39 🥔 MBLsheetConfigsetting",
      "color:#b03734",
      MBLsheetConfigsetting
    );
    if (
      !MBLsheetConfigsetting.enableAddRow &&
      !MBLsheetConfigsetting.enableAddBackTop
    ) {
      // let curHeight = 29
      const curHeight = 12;
      const sheetRowHeight = MBLsheetConfigsetting.showsheetbar
        ? 29
        : curHeight;
      console.log(
        "%c Line:49 🥛 sheetRowHeight",
        "color:#42b983",
        sheetRowHeight
      );
      Store.rh_height += sheetRowHeight;
    } else {
      Store.rh_height += 80; //最底部增加空白
    }
  }

  //列宽
  if (colwidth != null) {
    Store.visibledatacolumn = [];
    Store.ch_width = 0;

    let maxColumnlen = 0;

    for (let c = 0; c < colwidth; c++) {
      let firstcolumnlen = Store.defaultcollen;

      if (
        Store.config["columnlen"] != null &&
        Store.config["columnlen"][c] != null
      ) {
        firstcolumnlen = Store.config["columnlen"][c];
      } else {
        if (Store.flowdata[0] != null && Store.flowdata[0][c] != null) {
          if (firstcolumnlen > 300) {
            firstcolumnlen = 300;
          } else if (firstcolumnlen < Store.defaultcollen) {
            firstcolumnlen = Store.defaultcollen;
          }

          if (firstcolumnlen != Store.defaultcollen) {
            if (Store.config["columnlen"] == null) {
              Store.config["columnlen"] = {};
            }

            Store.config["columnlen"][c] = firstcolumnlen;
          }
        }
      }

      if (
        Store.config["colhidden"] != null &&
        Store.config["colhidden"][c] != null
      ) {
        Store.visibledatacolumn.push(Store.ch_width);
        continue;
      }

      // 自动行高计算
      if (firstcolumnlen === "auto") {
        firstcolumnlen = computeColWidthByContent(Store.flowdata, c, rowheight);
      }
      Store.ch_width += Math.round((firstcolumnlen + 1) * Store.zoomRatio);

      Store.visibledatacolumn.push(Store.ch_width); //列的临时长度分布

      // if(maxColumnlen < firstcolumnlen + 1){
      //     maxColumnlen = firstcolumnlen + 1;
      // }
    }

    // Store.ch_width += 120;
    Store.ch_width += maxColumnlen;
  }
}

export function zoomSetting() {
  //zoom
  Store.rowHeaderWidth = MBLsheetConfigsetting.rowHeaderWidth * Store.zoomRatio;
  Store.columnHeaderHeight =
    MBLsheetConfigsetting.columnHeaderHeight * Store.zoomRatio;
  $("#MBLsheet-rows-h").width(Store.rowHeaderWidth - 1.5);
  $("#MBLsheet-cols-h-c").height(Store.columnHeaderHeight - 1.5);
  $("#MBLsheet-left-top").css({
    width: Store.rowHeaderWidth - 1.5,
    height: Store.columnHeaderHeight - 1.5,
  });
}
