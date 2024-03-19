import { rowLocation, colLocation } from "../global/location";
import Store from "../store";

$(document).ready(function () {
  setTimeout(() => {
    // 获取contenteditable元素
    var editableElement = document.querySelector(".MBLsheet-cell-input");

    function processChange(event) {
      let column_focus = Store.MBLsheet_select_save[0]["column_focus"];
      let row_focus = Store.MBLsheet_select_save[0]["row_focus"];
      console.log(
        "%c Line:37 🍢 column_focus",
        "color:#93c0a4",
        "第 ",
        row_focus,
        " 行",
        "第 ",
        column_focus,
        " 列"
      );

      var currentContent = event.target.textContent || event.target.innerText; // 获取当前内容
      console.log("Content changed to:", currentContent);
      // 在这里处理内容变更后的逻辑
    }

    // 添加input事件监听器
    editableElement.addEventListener("input", processChange);

    // 如果需要兼容旧版IE浏览器（IE9及更低版本不支持input事件）
    if ("oninput" in document.createElement("div")) {
      // 使用input事件
    } else {
      editableElement.addEventListener("keyup", processChange);
    }
  });
});
