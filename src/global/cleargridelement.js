import selection from "../controllers/selection";
import menuButton from "../controllers/menuButton";

export default function cleargridelement(event) {
  $("#MBLsheet-cols-h-hover").hide();
  $("#MBLsheet-rightclick-menu").hide();

  $("#MBLsheet-cell-selected-boxs .MBLsheet-cell-selected").hide();
  $("#MBLsheet-cols-h-selected .MBLsheet-cols-h-selected").hide();
  $("#MBLsheet-rows-h-selected .MBLsheet-rows-h-selected").hide();

  $("#MBLsheet-cell-selected-focus").hide();
  $("#MBLsheet-rows-h-hover").hide();
  $("#MBLsheet-selection-copy .MBLsheet-selection-copy").hide();
  $("#MBLsheet-cols-menu-btn").hide();
  $("#MBLsheet-row-count-show, #MBLsheet-column-count-show").hide();
  if (!event) {
    selection.clearcopy(event);
  }
  //else{
  //	selection.clearcopy();
  //}

  //选区下拉icon隐藏
  if ($("#MBLsheet-dropCell-icon").is(":visible")) {
    if (event) {
      $("#MBLsheet-dropCell-icon").remove();
    }
  }
  //格式刷
  if (menuButton.MBLsheetPaintModelOn && !event) {
    menuButton.cancelPaintModel();
  }
}
