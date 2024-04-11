import { MBLsheet } from "../core";
import { getcellvalue } from "../global/getdata";
import { rowLocation, colLocation } from "../global/location";
import Store from "../store";
import sheetmanage from "./sheetmanage";

$(document).ready(function () {
  setTimeout(() => {
    // 获取contenteditable元素
    var editableElement = document.querySelector(".MBLsheet-cell-input");

    function processChange(event) {
      let c = Store.MBLsheet_select_save[0]["column_focus"];
      let r = Store.MBLsheet_select_save[0]["row_focus"];

      var currentContent = event.target.textContent || event.target.innerText; // 获取当前内容
      changeValue(r, c, currentContent);
    }

    if (editableElement) {
      // 添加input事件监听器
      editableElement?.addEventListener("input", processChange);

      // 如果需要兼容旧版IE浏览器（IE9及更低版本不支持input事件）
      if ("oninput" in document.createElement("div")) {
        // 使用input事件
      } else {
        editableElement?.addEventListener("keyup", processChange);
      }
    }
  });
});

export function changeValue(r, c, value, falg = true) {
  if (c === 1) {
    console.log("%c Line:37 🍓", "color:#b03734", value);
  }
  const sheet = sheetmanage.getSheetByIndex();
  const curRowData = Store.flowdata[r];
  const rowData = {};
  const curKey = curRowData?.[c]?.dataIndex;
  const keyNumMap = {};
  let newVal = value;

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

  rowData[curKey] = value;

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
    const curSetRowData = (obj, dependence = []) =>
      setRowData(obj, r, keyNumMap, falg, dependence);
    onchange(newVal, rowData, r, { setRowData: curSetRowData });
  }
}

export function setRowData(obj, r, keyNumMap = {}, falg, dependence = []) {
  // if (dependence.includes("sampleTypeId1")) {
  //   debugger;
  // }
  for (let key in obj) {
    const c = keyNumMap[key];
    if (r !== undefined && c !== undefined) {
      if (falg && dependence.includes(key)) {
        console.log(
          "%c Line:95 🥤 obj",
          "color:#6ec1c2",
          obj,
          falg,
          key,
          dependence
        );
        changeValue(r, c, obj[key] ?? null, false);
      }
      MBLsheet.setCellValue(r, c, obj[key] ?? null, false);
    }
  }
}
