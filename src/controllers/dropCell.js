import { rowLocationByIndex, colLocationByIndex } from "../global/location";
import { countfunc } from "../global/count";
import { getBorderInfoCompute } from "../global/border";
import { isRealNum } from "../global/validate";
import { genarate, update } from "../global/format";
import { jfrefreshgrid } from "../global/refresh";
import editor from "../global/editor";
import formula from "../global/formula";
import conditionformat from "./conditionformat";
import { checkProtectionLockedRangeList } from "./protection";
import { selectHightlightShow } from "./select";
import { getSheetIndex } from "../methods/get";
import { getObjType, replaceHtml } from "../utils/util";
import Store from "../store";
import locale from "../locale/locale";
import dayjs from "dayjs";
import { eventBus } from "../global/sg/event";

//选区下拉
const MBLsheetDropCell = {
  iconHtml:
    '<div id="MBLsheet-dropCell-icon" style="position: absolute;padding: 2px;background-color: #f1f1f1;z-index: 990;cursor: pointer;">' +
    '<div id="icon_dropCell"></div>' +
    "</div>",
  typeListHtml:
    '<div id="MBLsheet-dropCell-typeList" class="MBLsheet-cols-menu MBLsheet-rightgclick-menu MBLsheet-mousedown-cancel">' +
    '<div class="MBLsheet-cols-menuitem MBLsheet-mousedown-cancel" data-type="0">' +
    '<div class="MBLsheet-cols-menuitem-content MBLsheet-mousedown-cancel" style="padding: 3px 2px;">' +
    '<span style="margin-right:5px;width:13px;display:inline-block;" class="icon MBLsheet-mousedown-cancel"></span>${copyCell}' +
    "</div>" +
    "</div>" +
    '<div class="MBLsheet-cols-menuitem MBLsheet-mousedown-cancel" data-type="1">' +
    '<div class="MBLsheet-cols-menuitem-content MBLsheet-mousedown-cancel" style="padding: 3px 2px;">' +
    '<span style="margin-right:5px;width:13px;display:inline-block;" class="icon MBLsheet-mousedown-cancel"></span>${sequence}' +
    "</div>" +
    "</div>" +
    '<div class="MBLsheet-cols-menuitem MBLsheet-mousedown-cancel" data-type="2">' +
    '<div class="MBLsheet-cols-menuitem-content MBLsheet-mousedown-cancel" style="padding: 3px 2px;">' +
    '<span style="margin-right:5px;width:13px;display:inline-block;" class="icon MBLsheet-mousedown-cancel"></span>${onlyFormat}' +
    "</div>" +
    "</div>" +
    '<div class="MBLsheet-cols-menuitem MBLsheet-mousedown-cancel" data-type="3">' +
    '<div class="MBLsheet-cols-menuitem-content MBLsheet-mousedown-cancel" style="padding: 3px 2px;">' +
    '<span style="margin-right:5px;width:13px;display:inline-block;" class="icon MBLsheet-mousedown-cancel"></span>${noFormat}' +
    "</div>" +
    "</div>" +
    '<div class="MBLsheet-cols-menuitem MBLsheet-mousedown-cancel" data-type="4">' +
    '<div class="MBLsheet-cols-menuitem-content MBLsheet-mousedown-cancel" style="padding: 3px 2px;">' +
    '<span style="margin-right:5px;width:13px;display:inline-block;" class="icon MBLsheet-mousedown-cancel"></span>${day}' +
    "</div>" +
    "</div>" +
    '<div class="MBLsheet-cols-menuitem MBLsheet-mousedown-cancel" data-type="5">' +
    '<div class="MBLsheet-cols-menuitem-content MBLsheet-mousedown-cancel" style="padding: 3px 2px;">' +
    '<span style="margin-right:5px;width:13px;display:inline-block;" class="icon MBLsheet-mousedown-cancel"></span>${workDay}' +
    "</div>" +
    "</div>" +
    '<div class="MBLsheet-cols-menuitem MBLsheet-mousedown-cancel" data-type="6">' +
    '<div class="MBLsheet-cols-menuitem-content MBLsheet-mousedown-cancel" style="padding: 3px 2px;">' +
    '<span style="margin-right:5px;width:13px;display:inline-block;" class="icon MBLsheet-mousedown-cancel"></span>${month}' +
    "</div>" +
    "</div>" +
    '<div class="MBLsheet-cols-menuitem MBLsheet-mousedown-cancel" data-type="7">' +
    '<div class="MBLsheet-cols-menuitem-content MBLsheet-mousedown-cancel" style="padding: 3px 2px;">' +
    '<span style="margin-right:5px;width:13px;display:inline-block;" class="icon MBLsheet-mousedown-cancel"></span>${year}' +
    "</div>" +
    "</div>" +
    '<div class="MBLsheet-cols-menuitem MBLsheet-mousedown-cancel" data-type="8">' +
    '<div class="MBLsheet-cols-menuitem-content MBLsheet-mousedown-cancel" style="padding: 3px 2px;">' +
    '<span style="margin-right:5px;width:13px;display:inline-block;" class="icon MBLsheet-mousedown-cancel"></span>${chineseNumber}' +
    "</div>" +
    "</div>" +
    "</div>",
  copyRange: {}, //复制范围
  applyRange: {}, //应用范围
  applyType: null, //0复制单元格，1填充序列，2仅填充格式，3不带格式填充，4以天数填充，5以工作日填充，6以月填充，7以年填充，8以中文小写数字序列填充
  direction: null, //down-往下拖拽，right-往右拖拽，up-往上拖拽，left-往左拖拽
  chnNumChar: {
    零: 0,
    一: 1,
    二: 2,
    三: 3,
    四: 4,
    五: 5,
    六: 6,
    七: 7,
    八: 8,
    九: 9,
  },
  chnNameValue: {
    十: { value: 10, secUnit: false },
    百: { value: 100, secUnit: false },
    千: { value: 1000, secUnit: false },
    万: { value: 10000, secUnit: true },
    亿: { value: 100000000, secUnit: true },
  },
  ChineseToNumber: function (chnStr) {
    let _this = this;

    let rtn = 0;
    let section = 0;
    let number = 0;
    let secUnit = false;
    let str = chnStr.split("");

    for (let i = 0; i < str.length; i++) {
      let num = _this.chnNumChar[str[i]];

      if (typeof num != "undefined") {
        number = num;

        if (i == str.length - 1) {
          section += number;
        }
      } else {
        let unit = _this.chnNameValue[str[i]].value;
        secUnit = _this.chnNameValue[str[i]].secUnit;

        if (secUnit) {
          section = (section + number) * unit;
          rtn += section;
          section = 0;
        } else {
          section += number * unit;
        }

        number = 0;
      }
    }

    return rtn + section;
  },
  chnNumChar2: ["零", "一", "二", "三", "四", "五", "六", "七", "八", "九"],
  chnUnitSection: ["", "万", "亿", "万亿", "亿亿"],
  chnUnitChar: ["", "十", "百", "千"],
  SectionToChinese: function (section) {
    let _this = this;

    let strIns = "",
      chnStr = "";
    let unitPos = 0;
    let zero = true;

    while (section > 0) {
      let v = section % 10;

      if (v == 0) {
        if (!zero) {
          zero = true;
          chnStr = _this.chnNumChar2[v] + chnStr;
        }
      } else {
        zero = false;
        strIns = _this.chnNumChar2[v];
        strIns += _this.chnUnitChar[unitPos];
        chnStr = strIns + chnStr;
      }

      unitPos++;
      section = Math.floor(section / 10);
    }

    return chnStr;
  },
  NumberToChinese: function (num) {
    let _this = this;

    let unitPos = 0;
    let strIns = "",
      chnStr = "";
    let needZero = false;

    if (num == 0) {
      return _this.chnNumChar2[0];
    }
    while (num > 0) {
      let section = num % 10000;

      if (needZero) {
        chnStr = _this.chnNumChar2[0] + chnStr;
      }

      strIns = _this.SectionToChinese(section);
      strIns +=
        section != 0 ? _this.chnUnitSection[unitPos] : _this.chnUnitSection[0];
      chnStr = strIns + chnStr;
      needZero = section < 1000 && section > 0;
      num = Math.floor(num / 10000);
      unitPos++;
    }

    return chnStr;
  },
  isChnNumber: function (txt) {
    let _this = this;

    let isChnNumber = true;

    if (txt.length == 1) {
      if (txt == "日" || txt in _this.chnNumChar) {
        isChnNumber = true;
      } else {
        isChnNumber = false;
      }
    } else {
      let str = txt.split("");
      for (let i = 0; i < str.length; i++) {
        if (!(str[i] in _this.chnNumChar || str[i] in _this.chnNameValue)) {
          isChnNumber = false;
          break;
        }
      }
    }

    return isChnNumber;
  },
  isExtendNumber: function (txt) {
    let reg = /0|([1-9]+[0-9]*)/g;
    let isExtendNumber = reg.test(txt);

    if (isExtendNumber) {
      let match = txt.match(reg);
      let matchTxt = match[match.length - 1];
      let matchIndex = txt.lastIndexOf(matchTxt);
      let beforeTxt = txt.substr(0, matchIndex);
      let afterTxt = txt.substr(matchIndex + matchTxt.length);

      return [isExtendNumber, Number(matchTxt), beforeTxt, afterTxt];
    } else {
      return [isExtendNumber];
    }
  },
  isChnWeek1: function (txt) {
    let _this = this;

    let isChnWeek1;
    if (txt.length == 1) {
      if (txt == "日" || _this.ChineseToNumber(txt) < 7) {
        isChnWeek1 = true;
      } else {
        isChnWeek1 = false;
      }
    } else {
      isChnWeek1 = false;
    }

    return isChnWeek1;
  },
  isChnWeek2: function (txt) {
    let isChnWeek2;
    if (txt.length == 2) {
      if (
        txt == "周一" ||
        txt == "周二" ||
        txt == "周三" ||
        txt == "周四" ||
        txt == "周五" ||
        txt == "周六" ||
        txt == "周日"
      ) {
        isChnWeek2 = true;
      } else {
        isChnWeek2 = false;
      }
    } else {
      isChnWeek2 = false;
    }

    return isChnWeek2;
  },
  isChnWeek3: function (txt) {
    let isChnWeek3;
    if (txt.length == 3) {
      if (
        txt == "星期一" ||
        txt == "星期二" ||
        txt == "星期三" ||
        txt == "星期四" ||
        txt == "星期五" ||
        txt == "星期六" ||
        txt == "星期日"
      ) {
        isChnWeek3 = true;
      } else {
        isChnWeek3 = false;
      }
    } else {
      isChnWeek3 = false;
    }

    return isChnWeek3;
  },
  createIcon: function () {
    let _this = this;

    let copy_r = _this.copyRange["row"][1],
      copy_c = _this.copyRange["column"][1];
    let apply_r = _this.applyRange["row"][1],
      apply_c = _this.applyRange["column"][1];

    let row_index, col_index;
    if (apply_r >= copy_r && apply_c >= copy_c) {
      row_index = apply_r;
      col_index = apply_c;
    } else {
      row_index = copy_r;
      col_index = copy_c;
    }

    let row = rowLocationByIndex(row_index)[1],
      row_pre = rowLocationByIndex(row_index)[0];
    let col = colLocationByIndex(col_index)[1],
      col_pre = colLocationByIndex(col_index)[0];

    $("#MBLsheet-dropCell-icon").remove();
    $("#MBLsheet-cell-main").append(_this.iconHtml);
    $("#MBLsheet-dropCell-icon").css({ left: col, top: row });

    //点击icon
    $("#MBLsheet-dropCell-icon")
      .mouseover(function () {
        $(this).css("background-color", "#ffe8e8");
      })
      .mouseleave(function () {
        $(this).css("background-color", "#f1f1f1");
      })
      .mousedown(function (event) {
        $("#MBLsheet-dropCell-typeList").remove();
        const _locale = locale();
        const locale_dropCell = _locale.dropCell;
        $("body").append(
          replaceHtml(_this.typeListHtml, {
            copyCell: locale_dropCell.copyCell,
            sequence: locale_dropCell.sequence,
            onlyFormat: locale_dropCell.onlyFormat,
            noFormat: locale_dropCell.noFormat,
            day: locale_dropCell.day,
            workDay: locale_dropCell.workDay,
            month: locale_dropCell.month,
            year: locale_dropCell.year,
            chineseNumber: locale_dropCell.chineseNumber,
          })
        );

        let typeItemHide = _this.typeItemHide();
        if (
          !typeItemHide[0] &&
          !typeItemHide[1] &&
          !typeItemHide[2] &&
          !typeItemHide[3] &&
          !typeItemHide[4] &&
          !typeItemHide[5] &&
          !typeItemHide[6]
        ) {
          $(
            "#MBLsheet-dropCell-typeList .MBLsheet-cols-menuitem[data-type=1]"
          ).hide();
          $(
            "#MBLsheet-dropCell-typeList .MBLsheet-cols-menuitem[data-type=4]"
          ).hide();
          $(
            "#MBLsheet-dropCell-typeList .MBLsheet-cols-menuitem[data-type=5]"
          ).hide();
          $(
            "#MBLsheet-dropCell-typeList .MBLsheet-cols-menuitem[data-type=6]"
          ).hide();
          $(
            "#MBLsheet-dropCell-typeList .MBLsheet-cols-menuitem[data-type=7]"
          ).hide();
          $(
            "#MBLsheet-dropCell-typeList .MBLsheet-cols-menuitem[data-type=8]"
          ).hide();
        }

        if (!typeItemHide[2]) {
          $(
            "#MBLsheet-dropCell-typeList .MBLsheet-cols-menuitem[data-type=4]"
          ).hide();
          $(
            "#MBLsheet-dropCell-typeList .MBLsheet-cols-menuitem[data-type=5]"
          ).hide();
          $(
            "#MBLsheet-dropCell-typeList .MBLsheet-cols-menuitem[data-type=6]"
          ).hide();
          $(
            "#MBLsheet-dropCell-typeList .MBLsheet-cols-menuitem[data-type=7]"
          ).hide();
        }

        if (!typeItemHide[3]) {
          $(
            "#MBLsheet-dropCell-typeList .MBLsheet-cols-menuitem[data-type=8]"
          ).hide();
        }

        let left = $(this).offset().left;
        let top = $(this).offset().top + 25;
        let winH = $(window).height(),
          winW = $(window).width();
        let menuW = $("#MBLsheet-dropCell-typeList").width(),
          menuH = $("#MBLsheet-dropCell-typeList").height();

        if (left + menuW > winW) {
          left = left - menuW;
        }

        if (top + menuH > winH) {
          top = top - menuH - 38;
        }

        if (top < 0) {
          top = 0;
        }

        $("#MBLsheet-dropCell-typeList").css({ left: left, top: top }).show();
        $("#MBLsheet-dropCell-icon").mouseleave(function () {
          $(this).css("backgroundColor", "#ffe8e8");
        });

        let type = _this.applyType;
        $(
          "#MBLsheet-dropCell-typeList .MBLsheet-cols-menuitem[data-type=" +
            type +
            "]"
        )
          .find("span")
          .append('<i class="fa fa-check MBLsheet-mousedown-cancel"></i>');
        event.stopPropagation();
      });

    //点击数据填充类型
    $(document)
      .off("click.dCtypeList")
      .on(
        "click.dCtypeList",
        "#MBLsheet-dropCell-typeList .MBLsheet-cols-menuitem",
        function () {
          $("#MBLsheet-dropCell-typeList .fa-check").remove();
          $(this)
            .find("span")
            .append('<i class="fa fa-check MBLsheet-mousedown-cancel"></i>');

          let type = $(this).attr("data-type");
          _this.applyType = type;

          _this.update();

          $("#MBLsheet-dropCell-typeList").hide();
          $("#MBLsheet-dropCell-icon").css("backgroundColor", "#f1f1f1");
          $("#MBLsheet-dropCell-icon").mouseleave(function () {
            $(this).css("backgroundColor", "#f1f1f1");
          });

          countfunc();
        }
      );
  },
  typeItemHide: function () {
    let _this = this;

    let copyRange = _this.copyRange;
    let str_r = copyRange["row"][0],
      end_r = copyRange["row"][1];
    let str_c = copyRange["column"][0],
      end_c = copyRange["column"][1];

    let hasNumber = false,
      hasExtendNumber = false,
      hasDate = false,
      hasChn = false,
      hasChnWeek1 = false,
      hasChnWeek2 = false,
      hasChnWeek3 = false;

    for (let r = str_r; r <= end_r; r++) {
      for (let c = str_c; c <= end_c; c++) {
        if (!!Store.flowdata[r][c]) {
          let cell = Store.flowdata[r][c];

          if (
            getObjType(cell) == "object" &&
            cell["v"] != null &&
            cell["f"] == null
          ) {
            if (cell["ct"] != null && cell["ct"].t == "n") {
              hasNumber = true;
            } else if (cell["ct"] != null && cell["ct"].t == "d") {
              hasDate = true;
            } else if (_this.isExtendNumber(cell["m"])[0]) {
              hasExtendNumber = true;
            } else if (_this.isChnNumber(cell["m"]) && cell["m"] != "日") {
              hasChn = true;
            } else if (cell["m"] == "日") {
              hasChnWeek1 = true;
            } else if (_this.isChnWeek2(cell["m"])) {
              hasChnWeek2 = true;
            } else if (_this.isChnWeek3(cell["m"])) {
              hasChnWeek3 = true;
            }
          }
        }
      }
    }

    return [
      hasNumber,
      hasExtendNumber,
      hasDate,
      hasChn,
      hasChnWeek1,
      hasChnWeek2,
      hasChnWeek3,
    ];
  },
  update: function () {
    let _this = this;

    if (
      !checkProtectionLockedRangeList(
        [_this.applyRange],
        Store.currentSheetIndex
      )
    ) {
      return;
    }

    if (Store.allowEdit === false) {
      return;
    }

    // let d = editor.deepCopyFlowData(Store.flowdata);
    let d = _.cloneDeep(Store.flowdata);
    let file = Store.MBLsheetfile[getSheetIndex(Store.currentSheetIndex)];

    let cfg = $.extend(true, {}, Store.config);
    let borderInfoCompute = getBorderInfoCompute();
    let dataVerification = $.extend(true, {}, file["dataVerification"]);

    let direction = _this.direction;
    let type = _this.applyType;

    //复制范围
    let copyRange = _this.copyRange;
    let copy_str_r = copyRange["row"][0],
      copy_end_r = copyRange["row"][1];
    let copy_str_c = copyRange["column"][0],
      copy_end_c = copyRange["column"][1];
    let copyData = _this.getCopyData(
      d,
      copy_str_r,
      copy_end_r,
      copy_str_c,
      copy_end_c,
      direction
    );

    let csLen;
    if (direction == "down" || direction == "up") {
      csLen = copy_end_r - copy_str_r + 1;
    } else if (direction == "right" || direction == "left") {
      csLen = copy_end_c - copy_str_c + 1;
    }

    //应用范围
    let applyRange = _this.applyRange;
    let apply_str_r = applyRange["row"][0],
      apply_end_r = applyRange["row"][1];
    let apply_str_c = applyRange["column"][0],
      apply_end_c = applyRange["column"][1];

    // if (direction == "down" || direction == "up") {
    //   let asLen = apply_end_r - apply_str_r + 1;

    //   for (let i = apply_str_c; i <= apply_end_c; i++) {
    //     let copyD = copyData[i - apply_str_c];

    //     let applyData = _this.getApplyData(copyD, csLen, asLen);

    //     if (direction == "down") {
    //       for (let j = apply_str_r; j <= apply_end_r; j++) {
    //         let cell = applyData[j - apply_str_r];

    //         if (cell.f != null) {
    //           let f =
    //             "=" + formula.functionCopy(cell.f, "down", j - apply_str_r + 1);
    //           let v = formula.execfunction(f, j, i);

    //           formula.execFunctionGroup(j, i, v[1], undefined, d);

    //           cell.f = v[2];
    //           cell.v = v[1];

    //           if (cell.spl != null) {
    //             cell.spl = v[3].data;
    //           } else {
    //             if (
    //               isRealNum(cell.v) &&
    //               !/^\d{6}(18|19|20)?\d{2}(0[1-9]|1[12])(0[1-9]|[12]\d|3[01])\d{3}(\d|X)$/i.test(
    //                 cell.v
    //               )
    //             ) {
    //               if (cell.v == Infinity || cell.v == -Infinity) {
    //                 cell.m = cell.v.toString();
    //               } else {
    //                 if (cell.v.toString().indexOf("e") > -1) {
    //                   let len = cell.v
    //                     .toString()
    //                     .split(".")[1]
    //                     .split("e")[0].length;
    //                   if (len > 5) {
    //                     len = 5;
    //                   }

    //                   cell.m = cell.v.toExponential(len).toString();
    //                 } else {
    //                   let mask;
    //                   if (cell.ct.fa === "##0.00") {
    //                     /* 如果是数字类型 */
    //                     mask = genarate(
    //                       Math.round(cell.v * 1000000000) / 1000000000 + ".00"
    //                     );
    //                     cell.m = mask[0].toString();
    //                   } else {
    //                     mask = genarate(
    //                       Math.round(cell.v * 1000000000) / 1000000000
    //                     );
    //                     cell.m = mask[0].toString();
    //                   }
    //                 }
    //               }

    //               cell.ct = cell.ct || { fa: "General", t: "n" };
    //             } else {
    //               let mask = genarate(cell.v);
    //               cell.m = mask[0].toString();
    //               cell.ct = mask[1];
    //             }
    //           }
    //         }

    //         d[j][i] = cell;

    //         //边框
    //         let bd_r = copy_str_r + ((j - apply_str_r) % csLen);
    //         let bd_c = i;

    //         if (borderInfoCompute[bd_r + "_" + bd_c]) {
    //           let bd_obj = {
    //             rangeType: "cell",
    //             value: {
    //               row_index: j,
    //               col_index: i,
    //               l: borderInfoCompute[bd_r + "_" + bd_c].l,
    //               r: borderInfoCompute[bd_r + "_" + bd_c].r,
    //               t: borderInfoCompute[bd_r + "_" + bd_c].t,
    //               b: borderInfoCompute[bd_r + "_" + bd_c].b,
    //             },
    //           };

    //           cfg["borderInfo"].push(bd_obj);
    //         } else if (borderInfoCompute[j + "_" + i]) {
    //           let bd_obj = {
    //             rangeType: "cell",
    //             value: {
    //               row_index: j,
    //               col_index: i,
    //               l: null,
    //               r: null,
    //               t: null,
    //               b: null,
    //             },
    //           };

    //           cfg["borderInfo"].push(bd_obj);
    //         }

    //         //数据验证
    //         if (dataVerification[bd_r + "_" + bd_c]) {
    //           dataVerification[j + "_" + i] =
    //             dataVerification[bd_r + "_" + bd_c];
    //         }
    //       }
    //     }
    //     if (direction == "up") {
    //       for (let j = apply_end_r; j >= apply_str_r; j--) {
    //         let cell = applyData[apply_end_r - j];

    //         if (cell.f != null) {
    //           let f =
    //             "=" + formula.functionCopy(cell.f, "up", apply_end_r - j + 1);
    //           let v = formula.execfunction(f, j, i);

    //           formula.execFunctionGroup(j, i, v[1], undefined, d);

    //           cell.f = v[2];
    //           cell.v = v[1];

    //           if (cell.spl != null) {
    //             cell.spl = v[3].data;
    //           } else {
    //             if (
    //               isRealNum(cell.v) &&
    //               !/^\d{6}(18|19|20)?\d{2}(0[1-9]|1[12])(0[1-9]|[12]\d|3[01])\d{3}(\d|X)$/i.test(
    //                 cell.v
    //               )
    //             ) {
    //               if (cell.v == Infinity || cell.v == -Infinity) {
    //                 cell.m = cell.v.toString();
    //               } else {
    //                 if (cell.v.toString().indexOf("e") > -1) {
    //                   let len = cell.v
    //                     .toString()
    //                     .split(".")[1]
    //                     .split("e")[0].length;
    //                   if (len > 5) {
    //                     len = 5;
    //                   }

    //                   cell.m = cell.v.toExponential(len).toString();
    //                 } else {
    //                   let mask = genarate(
    //                     Math.round(cell.v * 1000000000) / 1000000000
    //                   );
    //                   cell.m = mask[0].toString();
    //                 }
    //               }

    //               cell.ct = { fa: "General", t: "n" };
    //             } else {
    //               let mask = genarate(cell.v);
    //               cell.m = mask[0].toString();
    //               cell.ct = mask[1];
    //             }
    //           }
    //         }

    //         d[j][i] = cell;

    //         //边框
    //         let bd_r = copy_end_r - ((apply_end_r - j) % csLen);
    //         let bd_c = i;

    //         if (borderInfoCompute[bd_r + "_" + bd_c]) {
    //           let bd_obj = {
    //             rangeType: "cell",
    //             value: {
    //               row_index: j,
    //               col_index: i,
    //               l: borderInfoCompute[bd_r + "_" + bd_c].l,
    //               r: borderInfoCompute[bd_r + "_" + bd_c].r,
    //               t: borderInfoCompute[bd_r + "_" + bd_c].t,
    //               b: borderInfoCompute[bd_r + "_" + bd_c].b,
    //             },
    //           };

    //           cfg["borderInfo"].push(bd_obj);
    //         } else if (borderInfoCompute[j + "_" + i]) {
    //           let bd_obj = {
    //             rangeType: "cell",
    //             value: {
    //               row_index: j,
    //               col_index: i,
    //               l: null,
    //               r: null,
    //               t: null,
    //               b: null,
    //             },
    //           };

    //           cfg["borderInfo"].push(bd_obj);
    //         }

    //         //数据验证
    //         if (dataVerification[bd_r + "_" + bd_c]) {
    //           dataVerification[j + "_" + i] =
    //             dataVerification[bd_r + "_" + bd_c];
    //         }
    //       }
    //     }
    //   }
    // } else if (direction == "right" || direction == "left") {
    //   let asLen = apply_end_c - apply_str_c + 1;

    //   for (let i = apply_str_r; i <= apply_end_r; i++) {
    //     let copyD = copyData[i - apply_str_r];

    //     let applyData = _this.getApplyData(copyD, csLen, asLen);

    //     if (direction == "right") {
    //       for (let j = apply_str_c; j <= apply_end_c; j++) {
    //         let cell = applyData[j - apply_str_c];

    //         if (cell.f != null) {
    //           let f =
    //             "=" +
    //             formula.functionCopy(cell.f, "right", j - apply_str_c + 1);
    //           let v = formula.execfunction(f, i, j);

    //           formula.execFunctionGroup(i, j, v[1], undefined, d);

    //           cell.f = v[2];
    //           cell.v = v[1];

    //           if (cell.spl != null) {
    //             cell.spl = v[3].data;
    //           } else {
    //             if (
    //               isRealNum(cell.v) &&
    //               !/^\d{6}(18|19|20)?\d{2}(0[1-9]|1[12])(0[1-9]|[12]\d|3[01])\d{3}(\d|X)$/i.test(
    //                 cell.v
    //               )
    //             ) {
    //               if (cell.v == Infinity || cell.v == -Infinity) {
    //                 cell.m = cell.v.toString();
    //               } else {
    //                 if (cell.v.toString().indexOf("e") > -1) {
    //                   let len = cell.v
    //                     .toString()
    //                     .split(".")[1]
    //                     .split("e")[0].length;
    //                   if (len > 5) {
    //                     len = 5;
    //                   }

    //                   cell.m = cell.v.toExponential(len).toString();
    //                 } else {
    //                   let mask = genarate(
    //                     Math.round(cell.v * 1000000000) / 1000000000
    //                   );
    //                   cell.m = mask[0].toString();
    //                 }
    //               }

    //               cell.ct = { fa: "General", t: "n" };
    //             } else {
    //               let mask = genarate(cell.v);
    //               cell.m = mask[0].toString();
    //               cell.ct = mask[1];
    //             }
    //           }
    //         }

    //         d[i][j] = cell;

    //         //边框
    //         let bd_r = i;
    //         let bd_c = copy_str_c + ((j - apply_str_c) % csLen);

    //         if (borderInfoCompute[bd_r + "_" + bd_c]) {
    //           let bd_obj = {
    //             rangeType: "cell",
    //             value: {
    //               row_index: i,
    //               col_index: j,
    //               l: borderInfoCompute[bd_r + "_" + bd_c].l,
    //               r: borderInfoCompute[bd_r + "_" + bd_c].r,
    //               t: borderInfoCompute[bd_r + "_" + bd_c].t,
    //               b: borderInfoCompute[bd_r + "_" + bd_c].b,
    //             },
    //           };

    //           cfg["borderInfo"].push(bd_obj);
    //         } else if (borderInfoCompute[i + "_" + j]) {
    //           let bd_obj = {
    //             rangeType: "cell",
    //             value: {
    //               row_index: i,
    //               col_index: j,
    //               l: null,
    //               r: null,
    //               t: null,
    //               b: null,
    //             },
    //           };

    //           cfg["borderInfo"].push(bd_obj);
    //         }

    //         //数据验证
    //         if (dataVerification[bd_r + "_" + bd_c]) {
    //           dataVerification[i + "_" + j] =
    //             dataVerification[bd_r + "_" + bd_c];
    //         }
    //       }
    //     }
    //     if (direction == "left") {
    //       for (let j = apply_end_c; j >= apply_str_c; j--) {
    //         let cell = applyData[apply_end_c - j];

    //         if (cell.f != null) {
    //           let f =
    //             "=" + formula.functionCopy(cell.f, "left", apply_end_c - j + 1);
    //           let v = formula.execfunction(f, i, j);

    //           formula.execFunctionGroup(i, j, v[1], undefined, d);

    //           cell.f = v[2];
    //           cell.v = v[1];

    //           if (cell.spl != null) {
    //             cell.spl = v[3].data;
    //           } else {
    //             if (
    //               isRealNum(cell.v) &&
    //               !/^\d{6}(18|19|20)?\d{2}(0[1-9]|1[12])(0[1-9]|[12]\d|3[01])\d{3}(\d|X)$/i.test(
    //                 cell.v
    //               )
    //             ) {
    //               if (cell.v == Infinity || cell.v == -Infinity) {
    //                 cell.m = cell.v.toString();
    //               } else {
    //                 if (cell.v.toString().indexOf("e") > -1) {
    //                   let len = cell.v
    //                     .toString()
    //                     .split(".")[1]
    //                     .split("e")[0].length;
    //                   if (len > 5) {
    //                     len = 5;
    //                   }

    //                   cell.m = cell.v.toExponential(len).toString();
    //                 } else {
    //                   let mask = genarate(
    //                     Math.round(cell.v * 1000000000) / 1000000000
    //                   );
    //                   cell.m = mask[0].toString();
    //                 }
    //               }

    //               cell.ct = { fa: "General", t: "n" };
    //             } else {
    //               let mask = genarate(cell.v);
    //               cell.m = mask[0].toString();
    //               cell.ct = mask[1];
    //             }
    //           }
    //         }

    //         d[i][j] = cell;

    //         //边框
    //         let bd_r = i;
    //         let bd_c = copy_end_c - ((apply_end_c - j) % csLen);

    //         if (borderInfoCompute[bd_r + "_" + bd_c]) {
    //           let bd_obj = {
    //             rangeType: "cell",
    //             value: {
    //               row_index: i,
    //               col_index: j,
    //               l: borderInfoCompute[bd_r + "_" + bd_c].l,
    //               r: borderInfoCompute[bd_r + "_" + bd_c].r,
    //               t: borderInfoCompute[bd_r + "_" + bd_c].t,
    //               b: borderInfoCompute[bd_r + "_" + bd_c].b,
    //             },
    //           };

    //           cfg["borderInfo"].push(bd_obj);
    //         } else if (borderInfoCompute[i + "_" + j]) {
    //           let bd_obj = {
    //             rangeType: "cell",
    //             value: {
    //               row_index: i,
    //               col_index: j,
    //               l: null,
    //               r: null,
    //               t: null,
    //               b: null,
    //             },
    //           };

    //           cfg["borderInfo"].push(bd_obj);
    //         }

    //         //数据验证
    //         if (dataVerification[bd_r + "_" + bd_c]) {
    //           dataVerification[i + "_" + j] =
    //             dataVerification[bd_r + "_" + bd_c];
    //         }
    //       }
    //     }
    //   }
    // }

    console.log(
      "%c Line:556 🍡",
      "color:#3f7cff",
      copyData,
      csLen,
      apply_str_r,
      apply_end_r,
      apply_str_c,
      apply_end_c,
      csLen
    );

    let publishArr = [];
    let m, v;
    for (let i = apply_str_r; i <= apply_end_r; i++) {
      var curArr = [];
      publishArr.push(curArr);
      for (let j = apply_str_c; j <= apply_end_c; j++) {
        const curObj = copyData?.[0] ?? {};
        const curData = Object.values(curObj)?.[0]?.[0]?.data?.[0];
        if (!isNaN(curData.m)) {
          if (m === undefined) {
            m = +curData.m + 1;
          } else {
            m++;
          }
        } else {
          m = curData.m;
        }

        if (!isNaN(curData.v)) {
          if (v === undefined) {
            v = +curData.v + 1;
          } else {
            v++;
          }
        } else {
          v = curData.v;
        }
        curArr.push(v);
        d[i][j] = { ...d[i][j], m, v };
      }
    }

    // // //条件格式
    // let cdformat = $.extend(true, [], file["MBLsheet_conditionformat_save"]);
    // if (cdformat != null && cdformat.length > 0) {
    //   for (let i = 0; i < cdformat.length; i++) {
    //     let cdformat_cellrange = cdformat[i].cellrange;

    //     let emptyRange = [];

    //     for (let j = 0; j < cdformat_cellrange.length; j++) {
    //       let range = conditionformat.CFSplitRange(
    //         cdformat_cellrange[j],
    //         { row: copyRange["row"], column: copyRange["column"] },
    //         { row: applyRange["row"], column: applyRange["column"] },
    //         "operatePart"
    //       );
    //       if (range.length > 0) {
    //         emptyRange = emptyRange.concat(range);
    //       }
    //     }

    //     if (emptyRange.length > 0) {
    //       cdformat[i].cellrange.push(applyRange);
    //     }
    //   }
    // }

    //刷新一次表格
    let allParam = {
      // cfg: cfg,
      // cdformat: cdformat,
      dataVerification: dataVerification,
    };
    jfrefreshgrid(d, Store.MBLsheet_select_save, allParam);

    selectHightlightShow();

    setTimeout(() => {
      eventBus.publish("paste", publishArr, {
        startR: apply_str_r,
        startC: apply_str_c,
        endR: apply_end_r,
        endC: apply_end_c,
      });
    }, 200);
  },
  getCopyData: function (d, r1, r2, c1, c2, direction) {
    let _this = this;

    let copyData = [];

    let a1, a2, b1, b2;
    if (direction == "down" || direction == "up") {
      a1 = c1;
      a2 = c2;
      b1 = r1;
      b2 = r2;
    } else if (direction == "right" || direction == "left") {
      a1 = r1;
      a2 = r2;
      b1 = c1;
      b2 = c2;
    }

    for (let a = a1; a <= a2; a++) {
      let obj = {};

      let arrData = [];
      let arrIndex = [];
      let text = "";
      let extendNumberBeforeStr = null;
      let extendNumberAfterStr = null;
      let isSameStr = true;

      for (let b = b1; b <= b2; b++) {
        //单元格
        let data;
        if (direction == "down" || direction == "up") {
          data = d[b][a];
        } else if (direction == "right" || direction == "left") {
          data = d[a][b];
        }

        //单元格值类型
        let str;
        if (!!data && !!data["v"] && data["f"] == null) {
          if (!!data["ct"] && data["ct"]["t"] == "n") {
            str = "number";
            extendNumberBeforeStr = null;
            extendNumberAfterStr = null;
          } else if (!!data["ct"] && data["ct"]["t"] == "d") {
            str = "date";
            extendNumberBeforeStr = null;
            extendNumberAfterStr = null;
          } else if (_this.isExtendNumber(data["m"])[0]) {
            str = "extendNumber";

            let isExtendNumber = _this.isExtendNumber(data["m"]);

            if (extendNumberBeforeStr == null || extendNumberAfterStr == null) {
              isSameStr = true;
              extendNumberBeforeStr = isExtendNumber[2];
              extendNumberAfterStr = isExtendNumber[3];
            } else {
              if (
                isExtendNumber[2] != extendNumberBeforeStr ||
                isExtendNumber[3] != extendNumberAfterStr
              ) {
                isSameStr = false;
                extendNumberBeforeStr = isExtendNumber[2];
                extendNumberAfterStr = isExtendNumber[3];
              } else {
                isSameStr = true;
              }
            }
          } else if (_this.isChnNumber(data["m"])) {
            str = "chnNumber";
            extendNumberBeforeStr = null;
            extendNumberAfterStr = null;
          } else if (_this.isChnWeek2(data["m"])) {
            str = "chnWeek2";
            extendNumberBeforeStr = null;
            extendNumberAfterStr = null;
          } else if (_this.isChnWeek3(data["m"])) {
            str = "chnWeek3";
            extendNumberBeforeStr = null;
            extendNumberAfterStr = null;
          } else {
            str = "other";
            extendNumberBeforeStr = null;
            extendNumberAfterStr = null;
          }
        } else {
          str = "other";
          extendNumberBeforeStr = null;
          extendNumberAfterStr = null;
        }

        if (str == "extendNumber") {
          if (b == b1) {
            if (b1 == b2) {
              text = str;
              arrData.push(data);
              arrIndex.push(b - b1 + 1);

              obj[text] = [];
              obj[text].push({ data: arrData, index: arrIndex });
            } else {
              text = str;
              arrData.push(data);
              arrIndex.push(b - b1 + 1);
            }
          } else if (b == b2) {
            if (text == str && isSameStr) {
              arrData.push(data);
              arrIndex.push(b - b1 + 1);

              if (text in obj) {
                obj[text].push({ data: arrData, index: arrIndex });
              } else {
                obj[text] = [];
                obj[text].push({ data: arrData, index: arrIndex });
              }
            } else {
              if (text in obj) {
                obj[text].push({ data: arrData, index: arrIndex });
              } else {
                obj[text] = [];
                obj[text].push({ data: arrData, index: arrIndex });
              }

              text = str;
              arrData = [];
              arrData.push(data);
              arrIndex = [];
              arrIndex.push(b - b1 + 1);

              if (text in obj) {
                obj[text].push({ data: arrData, index: arrIndex });
              } else {
                obj[text] = [];
                obj[text].push({ data: arrData, index: arrIndex });
              }
            }
          } else {
            if (text == str && isSameStr) {
              arrData.push(data);
              arrIndex.push(b - b1 + 1);
            } else {
              if (text in obj) {
                obj[text].push({ data: arrData, index: arrIndex });
              } else {
                obj[text] = [];
                obj[text].push({ data: arrData, index: arrIndex });
              }

              text = str;
              arrData = [];
              arrData.push(data);
              arrIndex = [];
              arrIndex.push(b - b1 + 1);
            }
          }
        } else {
          if (b == b1) {
            if (b1 == b2) {
              text = str;
              arrData.push(data);
              arrIndex.push(b - b1 + 1);

              obj[text] = [];
              obj[text].push({ data: arrData, index: arrIndex });
            } else {
              text = str;
              arrData.push(data);
              arrIndex.push(b - b1 + 1);
            }
          } else if (b == b2) {
            if (text == str) {
              arrData.push(data);
              arrIndex.push(b - b1 + 1);

              if (text in obj) {
                obj[text].push({ data: arrData, index: arrIndex });
              } else {
                obj[text] = [];
                obj[text].push({ data: arrData, index: arrIndex });
              }
            } else {
              if (text in obj) {
                obj[text].push({ data: arrData, index: arrIndex });
              } else {
                obj[text] = [];
                obj[text].push({ data: arrData, index: arrIndex });
              }

              text = str;
              arrData = [];
              arrData.push(data);
              arrIndex = [];
              arrIndex.push(b - b1 + 1);

              if (text in obj) {
                obj[text].push({ data: arrData, index: arrIndex });
              } else {
                obj[text] = [];
                obj[text].push({ data: arrData, index: arrIndex });
              }
            }
          } else {
            if (text == str) {
              arrData.push(data);
              arrIndex.push(b - b1 + 1);
            } else {
              if (text in obj) {
                obj[text].push({ data: arrData, index: arrIndex });
              } else {
                obj[text] = [];
                obj[text].push({ data: arrData, index: arrIndex });
              }

              text = str;
              arrData = [];
              arrData.push(data);
              arrIndex = [];
              arrIndex.push(b - b1 + 1);
            }
          }
        }
      }

      copyData.push(obj);
    }

    return copyData;
  },
  getApplyData: function (copyD, csLen, asLen) {
    let _this = this;

    let applyData = [];

    let direction = _this.direction;
    let type = _this.applyType;

    let num = Math.floor(asLen / csLen);
    let rsd = asLen % csLen;

    //纯数字类型
    let copyD_number = copyD["number"];
    let applyD_number = [];
    if (!!copyD_number) {
      for (let i = 0; i < copyD_number.length; i++) {
        let s = _this.getLenS(copyD_number[i]["index"], rsd);
        let len = copyD_number[i]["index"].length * num + s;

        let arrData;
        if (type == "1" || type == "3") {
          arrData = _this.getDataByType(
            copyD_number[i]["data"],
            len,
            direction,
            type,
            "number"
          );
        } else if (type == "2") {
          arrData = _this.getDataByType(
            copyD_number[i]["data"],
            len,
            direction,
            type
          );
        } else {
          arrData = _this.getDataByType(
            copyD_number[i]["data"],
            len,
            direction,
            "0"
          );
        }

        let arrIndex = _this.getDataIndex(
          csLen,
          asLen,
          copyD_number[i]["index"]
        );
        applyD_number.push({ data: arrData, index: arrIndex });
      }
    }

    //扩展数字型（即一串字符最后面的是数字）
    let copyD_extendNumber = copyD["extendNumber"];
    let applyD_extendNumber = [];
    if (!!copyD_extendNumber) {
      for (let i = 0; i < copyD_extendNumber.length; i++) {
        let s = _this.getLenS(copyD_extendNumber[i]["index"], rsd);
        let len = copyD_extendNumber[i]["index"].length * num + s;

        let arrData;
        if (type == "1" || type == "3") {
          arrData = _this.getDataByType(
            copyD_extendNumber[i]["data"],
            len,
            direction,
            type,
            "extendNumber"
          );
        } else if (type == "2") {
          arrData = _this.getDataByType(
            copyD_extendNumber[i]["data"],
            len,
            direction,
            type
          );
        } else {
          arrData = _this.getDataByType(
            copyD_extendNumber[i]["data"],
            len,
            direction,
            "0"
          );
        }

        let arrIndex = _this.getDataIndex(
          csLen,
          asLen,
          copyD_extendNumber[i]["index"]
        );
        applyD_extendNumber.push({ data: arrData, index: arrIndex });
      }
    }

    //日期类型
    let copyD_date = copyD["date"];
    let applyD_date = [];
    if (!!copyD_date) {
      for (let i = 0; i < copyD_date.length; i++) {
        let s = _this.getLenS(copyD_date[i]["index"], rsd);
        let len = copyD_date[i]["index"].length * num + s;

        let arrData;
        if (type == "1" || type == "3") {
          arrData = _this.getDataByType(
            copyD_date[i]["data"],
            len,
            direction,
            type,
            "date"
          );
        } else if (type == "8") {
          arrData = _this.getDataByType(
            copyD_date[i]["data"],
            len,
            direction,
            "0"
          );
        } else {
          arrData = _this.getDataByType(
            copyD_date[i]["data"],
            len,
            direction,
            type
          );
        }

        let arrIndex = _this.getDataIndex(csLen, asLen, copyD_date[i]["index"]);
        applyD_date.push({ data: arrData, index: arrIndex });
      }
    }

    //中文小写数字 或 一~日
    let copyD_chnNumber = copyD["chnNumber"];
    let applyD_chnNumber = [];
    if (!!copyD_chnNumber) {
      for (let i = 0; i < copyD_chnNumber.length; i++) {
        let s = _this.getLenS(copyD_chnNumber[i]["index"], rsd);
        let len = copyD_chnNumber[i]["index"].length * num + s;

        let arrData;
        if (type == "1" || type == "3") {
          arrData = _this.getDataByType(
            copyD_chnNumber[i]["data"],
            len,
            direction,
            type,
            "chnNumber"
          );
        } else if (type == "2" || type == "8") {
          arrData = _this.getDataByType(
            copyD_chnNumber[i]["data"],
            len,
            direction,
            type
          );
        } else {
          arrData = _this.getDataByType(
            copyD_chnNumber[i]["data"],
            len,
            direction,
            "0"
          );
        }

        let arrIndex = _this.getDataIndex(
          csLen,
          asLen,
          copyD_chnNumber[i]["index"]
        );
        applyD_chnNumber.push({ data: arrData, index: arrIndex });
      }
    }

    //周一~周日
    let copyD_chnWeek2 = copyD["chnWeek2"];
    let applyD_chnWeek2 = [];
    if (!!copyD_chnWeek2) {
      for (let i = 0; i < copyD_chnWeek2.length; i++) {
        let s = _this.getLenS(copyD_chnWeek2[i]["index"], rsd);
        let len = copyD_chnWeek2[i]["index"].length * num + s;

        let arrData;
        if (type == "1" || type == "3") {
          arrData = _this.getDataByType(
            copyD_chnWeek2[i]["data"],
            len,
            direction,
            type,
            "chnWeek2"
          );
        } else if (type == "2") {
          arrData = _this.getDataByType(
            copyD_chnWeek2[i]["data"],
            len,
            direction,
            type
          );
        } else {
          arrData = _this.getDataByType(
            copyD_chnWeek2[i]["data"],
            len,
            direction,
            "0"
          );
        }

        let arrIndex = _this.getDataIndex(
          csLen,
          asLen,
          copyD_chnWeek2[i]["index"]
        );
        applyD_chnWeek2.push({ data: arrData, index: arrIndex });
      }
    }

    //星期一~星期日
    let copyD_chnWeek3 = copyD["chnWeek3"];
    let applyD_chnWeek3 = [];
    if (!!copyD_chnWeek3) {
      for (let i = 0; i < copyD_chnWeek3.length; i++) {
        let s = _this.getLenS(copyD_chnWeek3[i]["index"], rsd);
        let len = copyD_chnWeek3[i]["index"].length * num + s;

        let arrData;
        if (type == "1" || type == "3") {
          arrData = _this.getDataByType(
            copyD_chnWeek3[i]["data"],
            len,
            direction,
            type,
            "chnWeek3"
          );
        } else if (type == "2") {
          arrData = _this.getDataByType(
            copyD_chnWeek3[i]["data"],
            len,
            direction,
            type
          );
        } else {
          arrData = _this.getDataByType(
            copyD_chnWeek3[i]["data"],
            len,
            direction,
            "0"
          );
        }

        let arrIndex = _this.getDataIndex(
          csLen,
          asLen,
          copyD_chnWeek3[i]["index"]
        );
        applyD_chnWeek3.push({ data: arrData, index: arrIndex });
      }
    }

    //其它
    let copyD_other = copyD["other"];
    let applyD_other = [];
    if (!!copyD_other) {
      for (let i = 0; i < copyD_other.length; i++) {
        let s = _this.getLenS(copyD_other[i]["index"], rsd);
        let len = copyD_other[i]["index"].length * num + s;

        let arrData;
        if (type == "2" || type == "3") {
          arrData = _this.getDataByType(
            copyD_other[i]["data"],
            len,
            direction,
            type
          );
        } else {
          arrData = _this.getDataByType(
            copyD_other[i]["data"],
            len,
            direction,
            "0"
          );
        }

        let arrIndex = _this.getDataIndex(
          csLen,
          asLen,
          copyD_other[i]["index"]
        );
        applyD_other.push({ data: arrData, index: arrIndex });
      }
    }

    for (let x = 1; x <= asLen; x++) {
      if (applyD_number.length > 0) {
        for (let y = 0; y < applyD_number.length; y++) {
          if (x in applyD_number[y]["index"]) {
            applyData.push(
              applyD_number[y]["data"][applyD_number[y]["index"][x]]
            );
          }
        }
      }

      if (applyD_extendNumber.length > 0) {
        for (let y = 0; y < applyD_extendNumber.length; y++) {
          if (x in applyD_extendNumber[y]["index"]) {
            applyData.push(
              applyD_extendNumber[y]["data"][applyD_extendNumber[y]["index"][x]]
            );
          }
        }
      }

      if (applyD_date.length > 0) {
        for (let y = 0; y < applyD_date.length; y++) {
          if (x in applyD_date[y]["index"]) {
            applyData.push(applyD_date[y]["data"][applyD_date[y]["index"][x]]);
          }
        }
      }

      if (applyD_chnNumber.length > 0) {
        for (let y = 0; y < applyD_chnNumber.length; y++) {
          if (x in applyD_chnNumber[y]["index"]) {
            applyData.push(
              applyD_chnNumber[y]["data"][applyD_chnNumber[y]["index"][x]]
            );
          }
        }
      }

      if (applyD_chnWeek2.length > 0) {
        for (let y = 0; y < applyD_chnWeek2.length; y++) {
          if (x in applyD_chnWeek2[y]["index"]) {
            applyData.push(
              applyD_chnWeek2[y]["data"][applyD_chnWeek2[y]["index"][x]]
            );
          }
        }
      }

      if (applyD_chnWeek3.length > 0) {
        for (let y = 0; y < applyD_chnWeek3.length; y++) {
          if (x in applyD_chnWeek3[y]["index"]) {
            applyData.push(
              applyD_chnWeek3[y]["data"][applyD_chnWeek3[y]["index"][x]]
            );
          }
        }
      }

      if (applyD_other.length > 0) {
        for (let y = 0; y < applyD_other.length; y++) {
          if (x in applyD_other[y]["index"]) {
            applyData.push(
              applyD_other[y]["data"][applyD_other[y]["index"][x]]
            );
          }
        }
      }
    }

    return applyData;
  },
  getLenS: function (indexArr, rsd) {
    let s = 0;

    for (let j = 0; j < indexArr.length; j++) {
      if (indexArr[j] <= rsd) {
        s++;
      } else {
        break;
      }
    }

    return s;
  },
  getDataIndex: function (csLen, asLen, indexArr) {
    let obj = {};

    let num = Math.floor(asLen / csLen);
    let rsd = asLen % csLen;

    let sum = 0;
    if (num > 0) {
      for (let i = 1; i <= num; i++) {
        for (let j = 0; j < indexArr.length; j++) {
          obj[indexArr[j] + (i - 1) * csLen] = sum;
          sum++;
        }
      }
      for (let a = 0; a < indexArr.length; a++) {
        if (indexArr[a] <= rsd) {
          obj[indexArr[a] + csLen * num] = sum;
          sum++;
        } else {
          break;
        }
      }
    } else {
      for (let a = 0; a < indexArr.length; a++) {
        if (indexArr[a] <= rsd) {
          obj[indexArr[a]] = sum;
          sum++;
        } else {
          break;
        }
      }
    }

    return obj;
  },
  getDataByType: function (data, len, direction, type, dataType) {
    let _this = this;

    let applyData = [];

    if (type == "0") {
      //复制单元格
      if (direction == "up" || direction == "left") {
        data.reverse();
      }

      applyData = _this.FillCopy(data, len);
    } else if (type == "1") {
      //填充序列
      if (dataType == "number") {
        //数据类型是 数字
        applyData = _this.FillSeries(data, len, direction);
      } else if (dataType == "extendNumber") {
        //扩展数字
        if (data.length == 1) {
          let step;
          if (direction == "down" || direction == "right") {
            step = 1;
          } else if (direction == "up" || direction == "left") {
            step = -1;
          }

          applyData = _this.FillExtendNumber(data, len, step);
        } else {
          let dataNumArr = [];

          for (let i = 0; i < data.length; i++) {
            let txt = data[i]["m"];
            dataNumArr.push(Number(_this.isExtendNumber(txt)[1]));
          }

          if (direction == "up" || direction == "left") {
            data.reverse();
            dataNumArr.reverse();
          }

          if (_this.isEqualDiff(dataNumArr)) {
            //等差数列，以等差为step
            let step = dataNumArr[1] - dataNumArr[0];
            applyData = _this.FillExtendNumber(data, len, step);
          } else {
            //不是等差数列，复制数据
            applyData = _this.FillCopy(data, len);
          }
        }
      } else if (dataType == "date") {
        //数据类型是 日期
        if (data.length == 1) {
          //以一天为step
          let step;
          if (direction == "down" || direction == "right") {
            step = 1;
          } else if (direction == "up" || direction == "left") {
            step = -1;
          }

          applyData = _this.FillDays(data, len, step);
        } else {
          if (direction == "up" || direction == "left") {
            data.reverse();
          }

          let judgeDate = _this.judgeDate(data);
          if (judgeDate[0] && judgeDate[3]) {
            //日一样，月差为等差数列，以月差为step
            let step = dayjs(data[1]["m"]).diff(dayjs(data[0]["m"]), "months");
            applyData = _this.FillMonths(data, len, step);
          } else if (!judgeDate[0] && judgeDate[2]) {
            //日不一样，日差为等差数列，以日差为step
            let step = dayjs(data[1]["m"]).diff(dayjs(data[0]["m"]), "days");
            applyData = _this.FillDays(data, len, step);
          } else {
            //其它，复制数据
            applyData = _this.FillCopy(data, len);
          }
        }
      } else if (dataType == "chnNumber") {
        //数据类型是 中文小写数字
        if (data.length == 1) {
          if (data[0]["m"] == "日" || _this.ChineseToNumber(data[0]["m"]) < 7) {
            //数字小于7，以周一~周日序列填充
            let step;
            if (direction == "down" || direction == "right") {
              step = 1;
            } else if (direction == "up" || direction == "left") {
              step = -1;
            }

            applyData = _this.FillChnWeek(data, len, step);
          } else {
            //数字大于7，以中文小写数字序列填充
            let step;
            if (direction == "down" || direction == "right") {
              step = 1;
            } else if (direction == "up" || direction == "left") {
              step = -1;
            }

            applyData = _this.FillChnNumber(data, len, step);
          }
        } else {
          let hasweek = false;
          for (let i = 0; i < data.length; i++) {
            if (data[i]["m"] == "日") {
              hasweek = true;
              break;
            }
          }

          let dataNumArr = [];
          let weekIndex = 0;
          for (let i = 0; i < data.length; i++) {
            if (data[i]["m"] == "日") {
              if (i == 0) {
                dataNumArr.push(0);
              } else {
                weekIndex++;
                dataNumArr.push(weekIndex * 7);
              }
            } else if (
              hasweek &&
              _this.ChineseToNumber(data[i]["m"]) > 0 &&
              _this.ChineseToNumber(data[i]["m"]) < 7
            ) {
              dataNumArr.push(
                _this.ChineseToNumber(data[i]["m"]) + weekIndex * 7
              );
            } else {
              dataNumArr.push(_this.ChineseToNumber(data[i]["m"]));
            }
          }

          if (direction == "up" || direction == "left") {
            data.reverse();
            dataNumArr.reverse();
          }

          if (_this.isEqualDiff(dataNumArr)) {
            if (
              hasweek ||
              (dataNumArr[dataNumArr.length - 1] < 6 && dataNumArr[0] > 0) ||
              (dataNumArr[0] < 6 && dataNumArr[dataNumArr.length - 1] > 0)
            ) {
              //以周一~周日序列填充
              let step = dataNumArr[1] - dataNumArr[0];
              applyData = _this.FillChnWeek(data, len, step);
            } else {
              //以中文小写数字序列填充
              let step = dataNumArr[1] - dataNumArr[0];
              applyData = _this.FillChnNumber(data, len, step);
            }
          } else {
            //不是等差数列，复制数据
            applyData = _this.FillCopy(data, len);
          }
        }
      } else if (dataType == "chnWeek2") {
        //周一~周日
        if (data.length == 1) {
          let step;
          if (direction == "down" || direction == "right") {
            step = 1;
          } else if (direction == "up" || direction == "left") {
            step = -1;
          }

          applyData = _this.FillChnWeek2(data, len, step);
        } else {
          let dataNumArr = [];
          let weekIndex = 0;

          for (let i = 0; i < data.length; i++) {
            let lastTxt = data[i]["m"].substr(data[i]["m"].length - 1, 1);
            if (data[i]["m"] == "周日") {
              if (i == 0) {
                dataNumArr.push(0);
              } else {
                weekIndex++;
                dataNumArr.push(weekIndex * 7);
              }
            } else {
              dataNumArr.push(_this.ChineseToNumber(lastTxt) + weekIndex * 7);
            }
          }

          if (direction == "up" || direction == "left") {
            data.reverse();
            dataNumArr.reverse();
          }

          if (_this.isEqualDiff(dataNumArr)) {
            //等差数列，以等差为step
            let step = dataNumArr[1] - dataNumArr[0];
            applyData = _this.FillChnWeek2(data, len, step);
          } else {
            //不是等差数列，复制数据
            applyData = _this.FillCopy(data, len);
          }
        }
      } else if (dataType == "chnWeek3") {
        //星期一~星期日
        if (data.length == 1) {
          let step;
          if (direction == "down" || direction == "right") {
            step = 1;
          } else if (direction == "up" || direction == "left") {
            step = -1;
          }

          applyData = _this.FillChnWeek3(data, len, step);
        } else {
          let dataNumArr = [];
          let weekIndex = 0;

          for (let i = 0; i < data.length; i++) {
            let lastTxt = data[i]["m"].substr(data[i]["m"].length - 1, 1);
            if (data[i]["m"] == "星期日") {
              if (i == 0) {
                dataNumArr.push(0);
              } else {
                weekIndex++;
                dataNumArr.push(weekIndex * 7);
              }
            } else {
              dataNumArr.push(_this.ChineseToNumber(lastTxt) + weekIndex * 7);
            }
          }

          if (direction == "up" || direction == "left") {
            data.reverse();
            dataNumArr.reverse();
          }

          if (_this.isEqualDiff(dataNumArr)) {
            //等差数列，以等差为step
            let step = dataNumArr[1] - dataNumArr[0];
            applyData = _this.FillChnWeek3(data, len, step);
          } else {
            //不是等差数列，复制数据
            applyData = _this.FillCopy(data, len);
          }
        }
      } else {
        //数据类型是 其它
        if (direction == "up" || direction == "left") {
          data.reverse();
        }

        applyData = _this.FillCopy(data, len);
      }
    } else if (type == "2") {
      //仅填充格式
      if (direction == "up" || direction == "left") {
        data.reverse();
      }

      applyData = _this.FillOnlyFormat(data, len);
    } else if (type == "3") {
      //不带格式填充
      let dataArr = _this.getDataByType(data, len, direction, "1", dataType);
      applyData = _this.FillWithoutFormat(dataArr);
    } else if (type == "4") {
      //以天数填充
      if (data.length == 1) {
        //以一天为step
        let step;
        if (direction == "down" || direction == "right") {
          step = 1;
        } else if (direction == "up" || direction == "left") {
          step = -1;
        }

        applyData = _this.FillDays(data, len, step);
      } else if (data.length == 2) {
        //以日差为step
        if (direction == "up" || direction == "left") {
          data.reverse();
        }

        let step = dayjs(data[1]["m"]).diff(dayjs(data[0]["m"]), "days");
        applyData = _this.FillDays(data, len, step);
      } else {
        if (direction == "up" || direction == "left") {
          data.reverse();
        }

        let judgeDate = _this.judgeDate(data);
        if (judgeDate[0] && judgeDate[3]) {
          //日一样，且月差为等差数列，以月差为step
          let step = dayjs(data[1]["m"]).diff(dayjs(data[0]["m"]), "months");
          applyData = _this.FillMonths(data, len, step);
        } else if (!judgeDate[0] && judgeDate[2]) {
          //日不一样，且日差为等差数列，以日差为step
          let step = dayjs(data[1]["m"]).diff(dayjs(data[0]["m"]), "days");
          applyData = _this.FillDays(data, len, step);
        } else {
          //日差不是等差数列，复制数据
          applyData = _this.FillCopy(data, len);
        }
      }
    } else if (type == "5") {
      //以工作日填充
      if (data.length == 1) {
        //以一天为step（若那天为休息日，则跳过）
        let step;
        if (direction == "down" || direction == "right") {
          step = 1;
        } else if (direction == "up" || direction == "left") {
          step = -1;
        }

        let newLen = Math.round(len * 1.5);
        for (let i = 1; i <= newLen; i++) {
          let d = $.extend(true, {}, data[0]);

          let day = dayjs(d["m"]).add(i, "days").day();
          if (day == 0 || day == 6) {
            continue;
          }

          let date = dayjs(d["m"])
            .add(step * i, "days")
            .format("YYYY-MM-DD");
          d["m"] = date;
          d["v"] = genarate(date)[2];
          applyData.push(d);

          if (applyData.length == len) {
            break;
          }
        }
      } else if (data.length == 2) {
        if (
          dayjs(data[1]["m"]).date() == dayjs(data[0]["m"]).date() &&
          dayjs(data[1]["m"]).diff(dayjs(data[0]["m"]), "months") != 0
        ) {
          //日一样，且月差大于一月，以月差为step（若那天为休息日，则向前取最近的工作日）
          if (direction == "up" || direction == "left") {
            data.reverse();
          }

          let step = dayjs(data[1]["m"]).diff(dayjs(data[0]["m"]), "months");

          for (let i = 1; i <= len; i++) {
            let index = (i - 1) % data.length;
            let d = $.extend(true, {}, data[index]);

            let day = dayjs(data[data.length - 1])
                .add(step * i, "months")
                .day(),
              date;
            if (day == 0) {
              date = dayjs(data[data.length - 1])
                .add(step * i, "months")
                .subtract(2, "days")
                .format("YYYY-MM-DD");
            } else if (day == 6) {
              date = dayjs(data[data.length - 1])
                .add(step * i, "months")
                .subtract(1, "days")
                .format("YYYY-MM-DD");
            } else {
              date = dayjs(data[data.length - 1])
                .add(step * i, "months")
                .format("YYYY-MM-DD");
            }

            d["m"] = date;
            d["v"] = genarate(date)[2];
            applyData.push(d);
          }
        } else {
          //日不一样
          if (Math.abs(dayjs(data[1]["m"]).diff(dayjs(data[0]["m"]))) > 7) {
            //若日差大于7天，以一月为step（若那天是休息日，则向前取最近的工作日）
            let step_month;
            if (direction == "down" || direction == "right") {
              step_month = 1;
            } else if (direction == "up" || direction == "left") {
              step_month = -1;
              data.reverse();
            }

            let step; //以数组第一个为对比
            for (let i = 1; i <= len; i++) {
              let index = (i - 1) % data.length;
              let d = $.extend(true, {}, data[index]);

              let num = Math.ceil(i / data.length);
              if (index == 0) {
                step = dayjs(d["m"])
                  .add(step_month * num, "months")
                  .diff(dayjs(d["m"]), "days");
              }

              let day = dayjs(d["m"]).add(step, "days").day(),
                date;
              if (day == 0) {
                date = dayjs(d["m"])
                  .add(step, "days")
                  .subtract(2, "days")
                  .format("YYYY-MM-DD");
              } else if (day == 6) {
                date = dayjs(d["m"])
                  .add(step, "days")
                  .subtract(1, "days")
                  .format("YYYY-MM-DD");
              } else {
                date = dayjs(d["m"]).add(step, "days").format("YYYY-MM-DD");
              }

              d["m"] = date;
              d["v"] = genarate(date)[2];
              applyData.push(d);
            }
          } else {
            //若日差小于等于7天，以7天为step（若那天是休息日，则向前取最近的工作日）
            let step_day;
            if (direction == "down" || direction == "right") {
              step_day = 7;
            } else if (direction == "up" || direction == "left") {
              step_day = -7;
              data.reverse();
            }

            let step; //以数组第一个为对比
            for (let i = 1; i <= len; i++) {
              let index = (i - 1) % data.length;
              let d = $.extend(true, {}, data[index]);

              let num = Math.ceil(i / data.length);
              if (index == 0) {
                step = dayjs(d["m"])
                  .add(step_day * num, "days")
                  .diff(dayjs(d["m"]), "days");
              }

              let day = dayjs(d["m"]).add(step, "days").day(),
                date;
              if (day == 0) {
                date = dayjs(d["m"])
                  .add(step, "days")
                  .subtract(2, "days")
                  .format("YYYY-MM-DD");
              } else if (day == 6) {
                date = dayjs(d["m"])
                  .add(step, "days")
                  .subtract(1, "days")
                  .format("YYYY-MM-DD");
              } else {
                date = dayjs(d["m"]).add(step, "days").format("YYYY-MM-DD");
              }

              d["m"] = date;
              d["v"] = genarate(date)[2];
              applyData.push(d);
            }
          }
        }
      } else {
        let judgeDate = _this.judgeDate(data);
        if (judgeDate[0] && judgeDate[3]) {
          //日一样，且月差为等差数列，以月差为step（若那天为休息日，则向前取最近的工作日）
          if (direction == "up" || direction == "left") {
            data.reverse();
          }

          let step = dayjs(data[1]["m"]).diff(dayjs(data[0]["m"]), "months");

          for (let i = 1; i <= len; i++) {
            let index = (i - 1) % data.length;
            let d = $.extend(true, {}, data[index]);

            let day = dayjs(data[data.length - 1]["m"])
                .add(step * i, "months")
                .day(),
              date;
            if (day == 0) {
              date = dayjs(data[data.length - 1]["m"])
                .add(step * i, "months")
                .subtract(2, "days")
                .format("YYYY-MM-DD");
            } else if (day == 6) {
              date = dayjs(data[data.length - 1]["m"])
                .add(step * i, "months")
                .subtract(1, "days")
                .format("YYYY-MM-DD");
            } else {
              date = dayjs(data[data.length - 1]["m"])
                .add(step * i, "months")
                .format("YYYY-MM-DD");
            }

            d["m"] = date;
            d["v"] = genarate(date)[2];
            applyData.push(d);
          }
        } else if (!judgeDate[0] && judgeDate[2]) {
          //日不一样，且日差为等差数列
          if (Math.abs(dayjs(data[1]["m"]).diff(dayjs(data[0]["m"]))) > 7) {
            //若日差大于7天，以一月为step（若那天是休息日，则向前取最近的工作日）
            let step_month;
            if (direction == "down" || direction == "right") {
              step_month = 1;
            } else if (direction == "up" || direction == "left") {
              step_month = -1;
              data.reverse();
            }

            let step; //以数组第一个为对比
            for (let i = 1; i <= len; i++) {
              let index = (i - 1) % data.length;
              let d = $.extend(true, {}, data[index]);

              let num = Math.ceil(i / data.length);
              if (index == 0) {
                step = dayjs(d["m"])
                  .add(step_month * num, "months")
                  .diff(dayjs(d["m"]), "days");
              }

              let day = dayjs(d["m"]).add(step, "days").day(),
                date;
              if (day == 0) {
                date = dayjs(d["m"])
                  .add(step, "days")
                  .subtract(2, "days")
                  .format("YYYY-MM-DD");
              } else if (day == 6) {
                date = dayjs(d["m"])
                  .add(step, "days")
                  .subtract(1, "days")
                  .format("YYYY-MM-DD");
              } else {
                date = dayjs(d["m"]).add(step, "days").format("YYYY-MM-DD");
              }

              d["m"] = date;
              d["v"] = genarate(date)[2];
              applyData.push(d);
            }
          } else {
            //若日差小于等于7天，以7天为step（若那天是休息日，则向前取最近的工作日）
            let step_day;
            if (direction == "down" || direction == "right") {
              step_day = 7;
            } else if (direction == "up" || direction == "left") {
              step_day = -7;
              data.reverse();
            }

            let step; //以数组第一个为对比
            for (let i = 1; i <= len; i++) {
              let index = (i - 1) % data.length;
              let d = $.extend(true, {}, data[index]);

              let num = Math.ceil(i / data.length);
              if (index == 0) {
                step = dayjs(d["m"])
                  .add(step_day * num, "days")
                  .diff(dayjs(d["m"]), "days");
              }

              let day = dayjs(d["m"]).add(step, "days").day(),
                date;
              if (day == 0) {
                date = dayjs(d["m"])
                  .add(step, "days")
                  .subtract(2, "days")
                  .format("YYYY-MM-DD");
              } else if (day == 6) {
                date = dayjs(d["m"])
                  .add(step, "days")
                  .subtract(1, "days")
                  .format("YYYY-MM-DD");
              } else {
                date = dayjs(d["m"]).add(step, "days").format("YYYY-MM-DD");
              }

              d["m"] = date;
              d["v"] = genarate(date)[2];
              applyData.push(d);
            }
          }
        } else {
          //日差不是等差数列，复制数据
          if (direction == "up" || direction == "left") {
            data.reverse();
          }

          applyData = _this.FillCopy(data, len);
        }
      }
    } else if (type == "6") {
      //以月填充
      if (data.length == 1) {
        //以一月为step
        let step;
        if (direction == "down" || direction == "right") {
          step = 1;
        } else if (direction == "up" || direction == "left") {
          step = -1;
        }

        applyData = _this.FillMonths(data, len, step);
      } else if (data.length == 2) {
        if (
          dayjs(data[1]["m"]).date() == dayjs(data[0]["m"]).date() &&
          dayjs(data[1]["m"]).diff(dayjs(data[0]["m"]), "months") != 0
        ) {
          //日一样，且月差大于一月，以月差为step
          if (direction == "up" || direction == "left") {
            data.reverse();
          }

          let step = dayjs(data[1]["m"]).diff(dayjs(data[0]["m"]), "months");
          applyData = _this.FillMonths(data, len, step);
        } else {
          //以一月为step
          let step_month;
          if (direction == "down" || direction == "right") {
            step_month = 1;
          } else if (direction == "up" || direction == "left") {
            step_month = -1;
            data.reverse();
          }

          let step; //以数组第一个为对比
          for (let i = 1; i <= len; i++) {
            let index = (i - 1) % data.length;
            let d = $.extend(true, {}, data[index]);

            let num = Math.ceil(i / data.length);
            if (index == 0) {
              step = dayjs(d["m"])
                .add(step_month * num, "months")
                .diff(dayjs(d["m"]), "days");
            }

            let date = dayjs(d["m"]).add(step, "days").format("YYYY-MM-DD");
            d["m"] = date;
            d["v"] = genarate(date)[2];
            applyData.push(d);
          }
        }
      } else {
        let judgeDate = _this.judgeDate(data);
        if (judgeDate[0] && judgeDate[3]) {
          //日一样，且月差为等差数列，以月差为step
          if (direction == "up" || direction == "left") {
            data.reverse();
          }

          let step = dayjs(data[1]["m"]).diff(dayjs(data[0]["m"]), "months");
          applyData = _this.FillMonths(data, len, step);
        } else if (!judgeDate[0] && judgeDate[2]) {
          //日不一样，且日差为等差数列，以一月为step
          let step_month;
          if (direction == "down" || direction == "right") {
            step_month = 1;
          } else if (direction == "up" || direction == "left") {
            step_month = -1;
            data.reverse();
          }

          let step; //以数组第一个为对比
          for (let i = 1; i <= len; i++) {
            let index = (i - 1) % data.length;
            let d = $.extend(true, {}, data[index]);

            let num = Math.ceil(i / data.length);
            if (index == 0) {
              step = dayjs(d["m"])
                .add(step_month * num, "months")
                .diff(dayjs(d["m"]), "days");
            }

            let date = dayjs(d["m"]).add(step, "days").format("YYYY-MM-DD");
            d["m"] = date;
            d["v"] = genarate(date)[2];
            applyData.push(d);
          }
        } else {
          //日差不是等差数列，复制数据
          if (direction == "up" || direction == "left") {
            data.reverse();
          }

          applyData = _this.FillCopy(data, len);
        }
      }
    } else if (type == "7") {
      //以年填充
      if (data.length == 1) {
        //以一年为step
        let step;
        if (direction == "down" || direction == "right") {
          step = 1;
        } else if (direction == "up" || direction == "left") {
          step = -1;
        }

        applyData = _this.FillYears(data, len, step);
      } else if (data.length == 2) {
        if (
          dayjs(data[1]["m"]).date() == dayjs(data[0]["m"]).date() &&
          dayjs(data[1]["m"]).month() == dayjs(data[0]["m"]).month() &&
          dayjs(data[1]["m"]).diff(dayjs(data[0]["m"]), "years") != 0
        ) {
          //日月一样，且年差大于一年，以年差为step
          if (direction == "up" || direction == "left") {
            data.reverse();
          }

          let step = dayjs(data[1]["m"]).diff(dayjs(data[0]["m"]), "years");
          applyData = _this.FillYears(data, len, step);
        } else {
          //以一年为step
          let step_year;
          if (direction == "down" || direction == "right") {
            step_year = 1;
          } else if (direction == "up" || direction == "left") {
            step_year = -1;
            data.reverse();
          }

          let step; //以数组第一个为对比
          for (let i = 1; i <= len; i++) {
            let index = (i - 1) % data.length;
            let d = $.extend(true, {}, data[index]);

            let num = Math.ceil(i / data.length);
            if (index == 0) {
              step = dayjs(d["m"])
                .add(step_year * num, "years")
                .diff(dayjs(d["m"]), "days");
            }

            let date = dayjs(d["m"]).add(step, "days").format("YYYY-MM-DD");
            d["m"] = date;
            d["v"] = genarate(date)[2];
            applyData.push(d);
          }
        }
      } else {
        let judgeDate = _this.judgeDate(data);
        if (judgeDate[0] && judgeDate[1] && judgeDate[4]) {
          //日月一样，且年差为等差数列，以年差为step
          if (direction == "up" || direction == "left") {
            data.reverse();
          }

          let step = dayjs(data[1]["m"]).diff(dayjs(data[0]["m"]), "years");
          applyData = _this.FillYears(data, len, step);
        } else if ((judgeDate[0] && judgeDate[3]) || judgeDate[2]) {
          //日一样且月差为等差数列，或天差为等差数列，以一年为step
          let step_year;
          if (direction == "down" || direction == "right") {
            step_year = 1;
          } else if (direction == "up" || direction == "left") {
            step_year = -1;
            data.reverse();
          }

          let step; //以数组第一个为对比
          for (let i = 1; i <= len; i++) {
            let index = (i - 1) % data.length;
            let d = $.extend(true, {}, data[index]);

            let num = Math.ceil(i / data.length);
            if (index == 0) {
              step = dayjs(d["m"])
                .add(step_year * num, "years")
                .diff(dayjs(d["m"]), "days");
            }

            let date = dayjs(d["m"]).add(step, "days").format("YYYY-MM-DD");
            d["m"] = date;
            d["v"] = genarate(date)[2];
            applyData.push(d);
          }
        } else {
          //日差不是等差数列，复制数据
          if (direction == "up" || direction == "left") {
            data.reverse();
          }

          applyData = _this.FillCopy(data, len);
        }
      }
    } else if (type == "8") {
      //以中文小写数字序列填充
      if (data.length == 1) {
        let step;
        if (direction == "down" || direction == "right") {
          step = 1;
        } else if (direction == "up" || direction == "left") {
          step = -1;
        }

        applyData = _this.FillChnNumber(data, len, step);
      } else {
        let dataNumArr = [];
        for (let i = 0; i < data.length; i++) {
          dataNumArr.push(_this.ChineseToNumber(data[i]["m"]));
        }

        if (direction == "up" || direction == "left") {
          data.reverse();
          dataNumArr.reverse();
        }

        if (_this.isEqualDiff(dataNumArr)) {
          let step = dataNumArr[1] - dataNumArr[0];
          applyData = _this.FillChnNumber(data, len, step);
        } else {
          //不是等差数列，复制数据
          applyData = _this.FillCopy(data, len);
        }
      }
    }

    return applyData;
  },
  FillCopy: function (data, len) {
    let applyData = [];

    for (let i = 1; i <= len; i++) {
      let index = (i - 1) % data.length;
      let d = $.extend(true, {}, data[index]);

      applyData.push(d);
    }

    return applyData;
  },
  FillSeries: function (data, len, direction) {
    let _this = this;

    let applyData = [];

    let dataNumArr = [];
    for (let j = 0; j < data.length; j++) {
      dataNumArr.push(Number(data[j]["v"]));
    }

    if (data.length > 2 && _this.isEqualRatio(dataNumArr)) {
      //等比数列
      for (let i = 1; i <= len; i++) {
        let index = (i - 1) % data.length;
        let d = $.extend(true, {}, data[index]);

        let num;
        if (direction == "down" || direction == "right") {
          num =
            Number(data[data.length - 1]["v"]) *
            Math.pow(Number(data[1]["v"]) / Number(data[0]["v"]), i);
        } else if (direction == "up" || direction == "left") {
          num =
            Number(data[0]["v"]) /
            Math.pow(Number(data[1]["v"]) / Number(data[0]["v"]), i);
        }

        d["v"] = num;
        d["m"] = update(d["ct"]["fa"], num);
        applyData.push(d);
      }
    } else {
      //线性数列
      let xArr = _this.getXArr(data.length);
      for (let i = 1; i <= len; i++) {
        let index = (i - 1) % data.length;
        let d = $.extend(true, {}, data[index]);

        let y;
        if (direction == "down" || direction == "right") {
          y = _this.forecast(data.length + i, dataNumArr, xArr);
        } else if (direction == "up" || direction == "left") {
          y = _this.forecast(1 - i, dataNumArr, xArr);
        }

        d["v"] = y;
        d["m"] = update(d["ct"]["fa"], y);
        applyData.push(d);
      }
    }

    return applyData;
  },
  FillExtendNumber: function (data, len, step) {
    let _this = this;

    let applyData = [];
    let reg = /0|([1-9]+[0-9]*)/g;

    for (let i = 1; i <= len; i++) {
      let index = (i - 1) % data.length;
      let d = $.extend(true, {}, data[index]);

      let last = data[data.length - 1]["m"];
      let match = last.match(reg);
      let lastTxt = match[match.length - 1];

      let num = Math.abs(Number(lastTxt) + step * i);
      let lastIndex = last.lastIndexOf(lastTxt);
      let valueTxt =
        last.substr(0, lastIndex) +
        num.toString() +
        last.substr(lastIndex + lastTxt.length);

      d["v"] = valueTxt;
      d["m"] = valueTxt;

      applyData.push(d);
    }

    return applyData;
  },
  FillOnlyFormat: function (data, len) {
    let applyData = [];

    for (let i = 1; i <= len; i++) {
      let index = (i - 1) % data.length;
      let d = $.extend(true, {}, data[index]);

      delete d["f"];
      delete d["m"];
      delete d["v"];

      applyData.push(d);
    }

    return applyData;
  },
  FillWithoutFormat: function (dataArr) {
    let applyData = [];

    for (let i = 0; i < dataArr.length; i++) {
      let d = $.extend(true, {}, dataArr[i]);

      let obj;
      if (d["f"] == null) {
        obj = { m: d["v"].toString(), v: d["v"] };
      } else {
        obj = { f: d["f"], m: d["v"].toString(), v: d["v"] };
      }

      applyData.push(obj);
    }

    return applyData;
  },
  FillDays: function (data, len, step) {
    let applyData = [];

    for (let i = 1; i <= len; i++) {
      let index = (i - 1) % data.length;
      let d = $.extend(true, {}, data[index]);

      let date = update("yyyy-MM-dd", d["v"]);
      date = dayjs(date)
        .add(step * i, "days")
        .format("YYYY-MM-DD");

      d["v"] = genarate(date)[2];
      d["m"] = update(d["ct"]["fa"], d["v"]);

      applyData.push(d);
    }

    return applyData;
  },
  FillMonths: function (data, len, step) {
    let applyData = [];

    for (let i = 1; i <= len; i++) {
      let index = (i - 1) % data.length;
      let d = $.extend(true, {}, data[index]);

      let date = update("yyyy-MM-dd", d["v"]);
      date = dayjs(date)
        .add(step * i, "months")
        .format("YYYY-MM-DD");

      d["v"] = genarate(date)[2];
      d["m"] = update(d["ct"]["fa"], d["v"]);

      applyData.push(d);
    }

    return applyData;
  },
  FillYears: function (data, len, step) {
    let applyData = [];

    for (let i = 1; i <= len; i++) {
      let index = (i - 1) % data.length;
      let d = $.extend(true, {}, data[index]);

      let date = update("yyyy-MM-dd", d["v"]);
      date = dayjs(date)
        .add(step * i, "years")
        .format("YYYY-MM-DD");

      d["v"] = genarate(date)[2];
      d["m"] = update(d["ct"]["fa"], d["v"]);

      applyData.push(d);
    }

    return applyData;
  },
  FillChnWeek: function (data, len, step) {
    let _this = this;

    let applyData = [];

    for (let i = 1; i <= len; i++) {
      let index = (i - 1) % data.length;
      let d = $.extend(true, {}, data[index]);

      let num;
      if (data[data.length - 1]["m"] == "日") {
        num = 7 + step * i;
      } else {
        num = _this.ChineseToNumber(data[data.length - 1]["m"]) + step * i;
      }

      if (num < 0) {
        num = Math.ceil(Math.abs(num) / 7) * 7 + num;
      }

      let rsd = num % 7;
      if (rsd == 0) {
        d["m"] = "日";
        d["v"] = "日";
      } else if (rsd == 1) {
        d["m"] = "一";
        d["v"] = "一";
      } else if (rsd == 2) {
        d["m"] = "二";
        d["v"] = "二";
      } else if (rsd == 3) {
        d["m"] = "三";
        d["v"] = "三";
      } else if (rsd == 4) {
        d["m"] = "四";
        d["v"] = "四";
      } else if (rsd == 5) {
        d["m"] = "五";
        d["v"] = "五";
      } else if (rsd == 6) {
        d["m"] = "六";
        d["v"] = "六";
      }

      applyData.push(d);
    }

    return applyData;
  },
  FillChnWeek2: function (data, len, step) {
    let _this = this;

    let applyData = [];

    for (let i = 1; i <= len; i++) {
      let index = (i - 1) % data.length;
      let d = $.extend(true, {}, data[index]);

      let num;
      if (data[data.length - 1]["m"] == "周日") {
        num = 7 + step * i;
      } else {
        let last = data[data.length - 1]["m"];
        let txt = last.substr(last.length - 1, 1);
        num = _this.ChineseToNumber(txt) + step * i;
      }

      if (num < 0) {
        num = Math.ceil(Math.abs(num) / 7) * 7 + num;
      }

      let rsd = num % 7;
      if (rsd == 0) {
        d["m"] = "周日";
        d["v"] = "周日";
      } else if (rsd == 1) {
        d["m"] = "周一";
        d["v"] = "周一";
      } else if (rsd == 2) {
        d["m"] = "周二";
        d["v"] = "周二";
      } else if (rsd == 3) {
        d["m"] = "周三";
        d["v"] = "周三";
      } else if (rsd == 4) {
        d["m"] = "周四";
        d["v"] = "周四";
      } else if (rsd == 5) {
        d["m"] = "周五";
        d["v"] = "周五";
      } else if (rsd == 6) {
        d["m"] = "周六";
        d["v"] = "周六";
      }

      applyData.push(d);
    }

    return applyData;
  },
  FillChnWeek3: function (data, len, step) {
    let _this = this;

    let applyData = [];

    for (let i = 1; i <= len; i++) {
      let index = (i - 1) % data.length;
      let d = $.extend(true, {}, data[index]);

      let num;
      if (data[data.length - 1]["m"] == "星期日") {
        num = 7 + step * i;
      } else {
        let last = data[data.length - 1]["m"];
        let txt = last.substr(last.length - 1, 1);
        num = _this.ChineseToNumber(txt) + step * i;
      }

      if (num < 0) {
        num = Math.ceil(Math.abs(num) / 7) * 7 + num;
      }

      let rsd = num % 7;
      if (rsd == 0) {
        d["m"] = "星期日";
        d["v"] = "星期日";
      } else if (rsd == 1) {
        d["m"] = "星期一";
        d["v"] = "星期一";
      } else if (rsd == 2) {
        d["m"] = "星期二";
        d["v"] = "星期二";
      } else if (rsd == 3) {
        d["m"] = "星期三";
        d["v"] = "星期三";
      } else if (rsd == 4) {
        d["m"] = "星期四";
        d["v"] = "星期四";
      } else if (rsd == 5) {
        d["m"] = "星期五";
        d["v"] = "星期五";
      } else if (rsd == 6) {
        d["m"] = "星期六";
        d["v"] = "星期六";
      }

      applyData.push(d);
    }

    return applyData;
  },
  FillChnNumber: function (data, len, step) {
    let _this = this;

    let applyData = [];

    for (let i = 1; i <= len; i++) {
      let index = (i - 1) % data.length;
      let d = $.extend(true, {}, data[index]);

      let num = _this.ChineseToNumber(data[data.length - 1]["m"]) + step * i,
        txt;
      if (num <= 0) {
        txt = "零";
      } else {
        txt = _this.NumberToChinese(num);
      }

      d["v"] = txt;
      d["m"] = txt.toString();
      applyData.push(d);
    }

    return applyData;
  },
  isEqualDiff: function (arr) {
    let diff = true;
    let step = arr[1] - arr[0];

    for (let i = 1; i < arr.length; i++) {
      if (arr[i] - arr[i - 1] != step) {
        diff = false;
        break;
      }
    }

    return diff;
  },
  isEqualRatio: function (arr) {
    let ratio = true;
    let step = arr[1] / arr[0];

    for (let i = 1; i < arr.length; i++) {
      if (arr[i] / arr[i - 1] != step) {
        ratio = false;
        break;
      }
    }

    return ratio;
  },
  getXArr: function (len) {
    let xArr = [];

    for (let i = 1; i <= len; i++) {
      xArr.push(i);
    }

    return xArr;
  },
  forecast: function (x, yArr, xArr) {
    function getAverage(arr) {
      let sum = 0;

      for (let i = 0; i < arr.length; i++) {
        sum += arr[i];
      }

      return sum / arr.length;
    }

    let ax = getAverage(xArr); //x数组 平均值
    let ay = getAverage(yArr); //y数组 平均值

    let sum_d = 0,
      sum_n = 0;
    for (let j = 0; j < xArr.length; j++) {
      //分母和
      sum_d += (xArr[j] - ax) * (yArr[j] - ay);
      //分子和
      sum_n += (xArr[j] - ax) * (xArr[j] - ax);
    }

    let b;
    if (sum_n == 0) {
      b = 1;
    } else {
      b = sum_d / sum_n;
    }

    let a = ay - b * ax;

    return Math.round((a + b * x) * 100000) / 100000;
  },
  judgeDate: function (data) {
    let isSameDay = true,
      isSameMonth = true,
      isEqualDiffDays = true,
      isEqualDiffMonths = true,
      isEqualDiffYears = true;
    let sameDay = dayjs(data[0]["m"]).date(),
      sameMonth = dayjs(data[0]["m"]).month();
    let equalDiffDays = dayjs(data[1]["m"]).diff(dayjs(data[0]["m"]), "days");
    let equalDiffMonths = dayjs(data[1]["m"]).diff(
      dayjs(data[0]["m"]),
      "months"
    );
    let equalDiffYears = dayjs(data[1]["m"]).diff(dayjs(data[0]["m"]), "years");

    for (let i = 1; i < data.length; i++) {
      //日是否一样
      if (dayjs(data[i]["m"]).date() != sameDay) {
        isSameDay = false;
      }
      //月是否一样
      if (dayjs(data[i]["m"]).month() != sameMonth) {
        isSameMonth = false;
      }
      //日差是否是 等差数列
      if (
        dayjs(data[i]["m"]).diff(dayjs(data[i - 1]["m"]), "days") !=
        equalDiffDays
      ) {
        isEqualDiffDays = false;
      }
      //月差是否是 等差数列
      if (
        dayjs(data[i]["m"]).diff(dayjs(data[i - 1]["m"]), "months") !=
        equalDiffMonths
      ) {
        isEqualDiffMonths = false;
      }
      //年差是否是 等差数列
      if (
        dayjs(data[i]["m"]).diff(dayjs(data[i - 1]["m"]), "years") !=
        equalDiffYears
      ) {
        isEqualDiffYears = false;
      }
    }

    if (equalDiffDays == 0) {
      isEqualDiffDays = false;
    }
    if (equalDiffMonths == 0) {
      isEqualDiffMonths = false;
    }
    if (equalDiffYears == 0) {
      isEqualDiffYears = false;
    }

    return [
      isSameDay,
      isSameMonth,
      isEqualDiffDays,
      isEqualDiffMonths,
      isEqualDiffYears,
    ];
  },
};

export default MBLsheetDropCell;
