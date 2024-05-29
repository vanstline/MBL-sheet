import { MBLsheet } from "../core";
import { getcellvalue } from "../global/getdata";
import formula from "../global/formula";
import { MBLsheetMoveHighlightCell } from "./sheetMove";
import Store from "../store";
import sheetmanage from "./sheetmanage";
import { exitEditMode } from "../global/api";
import { event } from "jquery";
import MBLsheetformula from "../global/formula";

// $(document).ready(function () {

// });

export function linseter() {
  Store.isEdit = false;

  setTimeout(() => {
    // 获取contenteditable元素
    var editableElement = document.querySelector("#MBLsheet-rich-text-editor");

    function processChange(event) {
      Store.isEdit = true;
      let c = Store.MBLsheet_select_save[0]["column_focus"];
      let r = Store.MBLsheet_select_save[0]["row_focus"];

      const curCell = Store?.flowdata?.[r]?.[c];
      if (curCell?.disabled) {
        return;
      }

      var currentContent = event.target.textContent || event.target.innerText; // 获取当前内容
      changeValue(r, c, currentContent);
    }

    function processBlur(event) {
      //
      if (Store.isEdit) {
        updateBlur(event);
      } else {
        //
        // ;
        // setTimeout(() => {
        // exitEditMode();
        // }, 200);
      }
    }

    if (editableElement) {
      editableElement?.removeEventListener("input", processChange);
      editableElement?.removeEventListener("blur", processBlur);

      // 如果需要兼容旧版IE浏览器（IE9及更低版本不支持input事件）
      if ("oninput" in document.createElement("div")) {
        // 使用input事件
      } else {
        editableElement?.removeEventListener("keyup", processChange);
      }
    }

    if (editableElement) {
      // 添加input事件监听器
      editableElement?.addEventListener("input", processChange);
      editableElement?.addEventListener("blur", processBlur);
      // editableElement?.addEventListener("keydown", function (event) {
      //   if (event.key === "Enter") {
      //     processBlur(event);
      //     // 这里可以执行你的其他操作
      //   }
      // });

      // 如果需要兼容旧版IE浏览器（IE9及更低版本不支持input事件）
      if ("oninput" in document.createElement("div")) {
        // 使用input事件
      } else {
        editableElement?.addEventListener("keyup", processChange);
      }
    }
  });
}

var multiEvent = null;

var element = $("#MBLsheet-dataVerification-dropdown-List");

// 创建MutationObserver实例
var observer = new MutationObserver(function (mutationsList) {
  mutationsList.forEach(function (mutation) {
    if (mutation.type === "attributes") {
      // 检查看是否是style属性变化，并且涉及到display或visibility
      if (
        mutation.attributeName === "style" &&
        (mutation.target.style.display === "none" ||
          mutation.target.style.visibility === "hidden")
      ) {
        updateBlur(event);
        observer.disconnect();
      }
    }
  });
});

// 配置观察属性变化
var config = { attributes: true, attributeFilter: ["style"] };

// 开始观察目标元素

export const observeMulti = (dom, event) => {
  multiEvent = event;
  observer.observe(dom, config);
};

export function getRowData(r, c, newVal, keyNumMap = {}) {
  const sheet = sheetmanage.getSheetByIndex();
  const curRowData = Store.flowdata[r];
  const rowData = {};
  const curKey = curRowData?.[c]?.dataIndex;

  sheet.columns.forEach((item, i) => {
    if (item.dataIndex) {
      keyNumMap[item.dataIndex] = i;
      const v = curRowData?.find((sub) => sub?.dataIndex === item.dataIndex)?.v;

      if (item.dataIndex === curKey) {
        if (typeof item?.fieldsProps?.options === "object") {
          const valueStr = newVal
            ?.split(",")
            .map((sub) => {
              const curOption = item.fieldsProps.options.find(
                (min) => min.label === sub
              );
              return curOption?.value || sub;
            })
            .join(",");
          rowData[item.dataIndex] = valueStr;
          newVal = valueStr;
        }
      } else {
        rowData[item.dataIndex] = v;
      }
    }
  });

  rowData[curKey] = newVal;
  return rowData;
}

export function changeValue(r, c, value, falg = true) {
  const keyNumMap = {};
  let newVal = value;

  const rowData = getRowData(r, c, newVal);
  MBLsheet.setCellValue(r, c, newVal ?? null, false);

  const sheet = sheetmanage.getSheetByIndex();

  if (typeof sheet.dataVerification[`${r}_${c}`]?.verifyFn === "function") {
    const curVerifyInfo = sheet.dataVerification[`${r}_${c}`]?.verifyFn(
      value,
      r
    );

    if (curVerifyInfo.status !== true) {
      sheet.dataVerification[`${r}_${c}`] = {
        ...sheet.dataVerification[`${r}_${c}`],
        hintShow: curVerifyInfo.status,
        hintText: curVerifyInfo.message,
      };
    }
  }

  // 在这里处理内容变更后的逻辑
  const onchange = sheet?.columns?.[c]?.onchange;

  if (onchange && typeof onchange === "function") {
    const curSetDisabled = (disabledMap) =>
      setDisabled(disabledMap, r, keyNumMap, falg);

    const curSetRowData = (obj, dependence = []) =>
      setRowData(obj, r, keyNumMap, falg, dependence);
    onchange(newVal, rowData, r, {
      setRowData: curSetRowData,
      setDisabled: curSetDisabled,
    });
  }
}

export function setRowData(obj, r, keyNumMap = {}, falg, dependence = []) {
  for (let key in obj) {
    const c = keyNumMap[key];
    if (r !== undefined && c !== undefined) {
      if (falg && dependence.includes(key)) {
        changeValue(r, c, obj[key] ?? null, false);
      }
      MBLsheet.setCellValue(r, c, obj[key] ?? null, false);
    }
  }
}

export function setDisabled(obj, r, keyNumMap = {}, falg) {
  if (!falg || !Store) {
    return;
  }
  const curData = Store.flowdata[r];
  for (let key in obj) {
    const c = keyNumMap[key];
    if (r !== undefined && c !== undefined && falg) {
      if (curData[c]?.hasOwnProperty("disabled")) {
        curData[c].disabled = obj[key];
      } else {
        curData[c] = {
          ...curData[c],
          disabled: obj[key],
        };
      }
    }
  }
}

export function updateBlur(event) {
  const [r, c] = Store.MBLsheetCellUpdate;
  const curColumn = Store?.flowdata?.[0]?.[c];

  if (["autocomplete", "select"].includes(curColumn?.fieldsProps?.type)) {
    $("#MBLsheet-rich-text-editor").html("");
    $("#MBLsheet-dataVerification-dropdown-List").hide();
  }

  if (!Store.isEdit) {
    // 修复异常情况下进入的 不做任务处理
    // formula.updatecell(r, c, null);
    MBLsheetformula.cancelNormalSelected();
    return;
  }
  Store.isEdit = false;

  const sheet = sheetmanage.getSheetByIndex();
  const curEle = Store?.flowdata?.[r]?.[c];

  const onblur = sheet?.columns?.[c]?.onblur;
  let newVal = event.target?.classList?.contains("dropdown-List-item")
    ? event.target.innerText
    : curEle?.v ?? null;

  formula.updatecell(r, c, newVal);

  if (onblur && typeof onblur === "function") {
    const keyNumMap = {};

    const rowData = getRowData(r, c, newVal, keyNumMap);

    if (typeof sheet.dataVerification[`${r}_${c}`]?.verifyFn === "function") {
      const curVerifyInfo = sheet.dataVerification[`${r}_${c}`]?.verifyFn(
        newVal,
        r
      );

      if (curVerifyInfo.status !== true) {
        sheet.dataVerification[`${r}_${c}`] = {
          ...sheet.dataVerification[`${r}_${c}`],
          hintShow: curVerifyInfo.status,
          hintText: curVerifyInfo.message,
        };
      }
    }

    const curSetDisabled = (disabledMap) =>
      setDisabled(disabledMap, r, keyNumMap, true);

    const curSetRowData = (obj, dependence = []) =>
      setRowData(obj, r, keyNumMap, true, dependence);

    setTimeout(() => {
      curColumn.onblur(newVal, rowData, r, {
        setRowData: curSetRowData,
        setDisabled: curSetDisabled,
      });
    }, 200);
  }

  MBLsheetMoveHighlightCell("down", 0, "rangeOfSelect");
  // }
}
