import { MBLsheet } from "../core";
import { getcellvalue } from "../global/getdata";
import formula from "../global/formula";
import { MBLsheetMoveHighlightCell } from "./sheetMove";
import Store from "../store";
import sheetmanage from "./sheetmanage";
import { exitEditMode } from "../global/api";

const nonexistentCell = [undefined, -1];

$(document).ready(function () {
  let isEdit = false;

  setTimeout(() => {
    // 获取contenteditable元素
    var editableElement = document.querySelector("#MBLsheet-rich-text-editor");

    function processChange(event) {
      isEdit = true;
      let c = Store.MBLsheet_select_save[0]["column_focus"];
      let r = Store.MBLsheet_select_save[0]["row_focus"];

      var currentContent = event.target.textContent || event.target.innerText; // 获取当前内容
      changeValue(r, c, currentContent);
    }

    function processBlur(event) {
      // console.log("%c Line:30 🍆 event", "color:#ffdd4d", event);
      if (isEdit) {
        updateBlur(event);
        isEdit = false;
      } else {
        // console.log("%c Line:35 🍎", "color:#b03734");
        // ;
        // setTimeout(() => {
        // exitEditMode();
        // }, 200);
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
});

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
  formula.updatecell(r, c);

  const curColumn = Store?.flowdata?.[0]?.[c];
  if (["autocomplete", "select"].includes(curColumn?.fieldsProps?.type)) {
    $("#MBLsheet-dataVerification-dropdown-List").hide();
  }
  const sheet = sheetmanage.getSheetByIndex();
  const curEle = Store?.flowdata?.[r]?.[c];
  const onblur = sheet?.columns?.[c]?.onblur;
  if (onblur && typeof onblur === "function") {
    const keyNumMap = {};
    let newVal = event.target.classList.contains("dropdown-List-item")
      ? event.target.innerText
      : curEle.v;

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

    isEdit = false;

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
