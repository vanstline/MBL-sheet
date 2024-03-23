import { MBLsheet } from "../core";
import { getcellvalue } from "../global/getdata";
import { rowLocation, colLocation } from "../global/location";
import Store from "../store";

$(document).ready(function () {
  setTimeout(() => {
    // 获取contenteditable元素
    var editableElement = document.querySelector(".MBLsheet-cell-input");

    function processChange(event) {
      let c = Store.MBLsheet_select_save[0]["column_focus"];
      let r = Store.MBLsheet_select_save[0]["row_focus"];

      const onchange = getcellvalue(r, c, null, "onchange");
      var currentContent = event.target.textContent || event.target.innerText; // 获取当前内容
      // 在这里处理内容变更后的逻辑
      if (onchange && typeof onchange === "function") {
        onchange(currentContent, { r, c });
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
