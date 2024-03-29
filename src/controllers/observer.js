import { MBLsheet } from "../core";
import { getcellvalue } from "../global/getdata";
import { rowLocation, colLocation } from "../global/location";
import Store from "../store";
import sheetmanage from "./sheetmanage";

$(document).ready(function () {
  setTimeout(() => {
    // 获取contenteditable元素
    var editableElement = document.querySelector(".MBLsheet-cell-input");
    const sheet = sheetmanage.getSheetByIndex();

    function processChange(event) {
      console.log("%c Line:14 🥔 event", "color:#ed9ec7", event);
      let c = Store.MBLsheet_select_save[0]["column_focus"];
      let r = Store.MBLsheet_select_save[0]["row_focus"];

      var currentContent = event.target.textContent || event.target.innerText; // 获取当前内容
      const curRowData = Store.flowdata[r];
      const rowData = {};
      const curKey = curRowData?.[c]?.dataIndex;
      const keyNumMap = {};

      sheet.columns.forEach((item, i) => {
        if (item.dataIndex) {
          const v = curRowData?.find(
            (sub) => sub?.dataIndex === item.dataIndex
          )?.v;

          keyNumMap[item.dataIndex] = i;

          rowData[item.dataIndex] = v;
        }
      });

      rowData[curKey] = currentContent;
      console.log(
        "%c Line:36 🍷 currentContent",
        "color:#93c0a4",
        currentContent
      );

      if (typeof sheet.dataVerification[`${r}_${c}`]?.verifyFn === "function") {
        const curVerifyInfo = sheet.dataVerification[`${r}_${c}`]?.verifyFn(
          currentContent,
          rowData
        );

        if (curVerifyInfo.status === true) {
          sheet.dataVerification[`${r}_${c}`] = {
            ...sheet.dataVerification[`${r}_${c}`],
            hintShow: curVerifyInfo.status,
            hintText: curVerifyInfo.message,
          };
        }
      }

      const setRowData = (obj) => {
        // setTimeout(() => {
        for (let key in obj) {
          const col = keyNumMap[key];
          MBLsheet.setCellValue(r, col, obj[key]);
        }
        // });
      };

      // 在这里处理内容变更后的逻辑
      const onchange = getcellvalue(r, c, null, "onchange");
      console.log("%c Line:63 🌽 onchange", "color:#93c0a4", onchange);
      if (onchange && typeof onchange === "function") {
        onchange(currentContent, rowData, { setRowData });
      }
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
