import MBLsheetFreezen from "../controllers/freezen";
import { MBLsheet_searcharray } from "../controllers/sheetSearch";
import { MBLsheetrefreshgrid } from "../global/refresh";
import Store from "../store";
import method from "../global/method";

let scrollRequestAnimationFrameIni = true,
  scrollRequestAnimationFrame = false,
  scrollTimeOutCancel = null;

function execScroll() {
  let scrollLeft = $("#MBLsheet-scrollbar-x").scrollLeft(),
    scrollTop = $("#MBLsheet-scrollbar-y").scrollTop();
  MBLsheetrefreshgrid(scrollLeft, scrollTop);
  scrollRequestAnimationFrame = window.requestAnimationFrame(execScroll);
}

//全局滚动事件
export default function MBLsheetscrollevent(isadjust) {
  let $t = $("#MBLsheet-cell-main");
  let scrollLeft = $("#MBLsheet-scrollbar-x").scrollLeft(),
    scrollTop = $("#MBLsheet-scrollbar-y").scrollTop(),
    canvasHeight = $("#MBLsheetTableContent").height(); // canvas高度

  // clearTimeout(scrollTimeOutCancel);

  // scrollTimeOutCancel = setTimeout(() => {
  //     scrollRequestAnimationFrameIni  = true;
  //     window.cancelAnimationFrame(scrollRequestAnimationFrame);
  // }, 500);

  // if (!!isadjust) {
  //     let scrollHeight = $t.get(0).scrollHeight;
  //     let windowHeight = $t.height();
  //     let scrollWidth = $t.get(0).scrollWidth;
  //     let windowWidth = $t.width();

  //     let maxScrollLeft = scrollWidth - windowWidth;
  //     let maxScrollTop = scrollHeight - windowHeight;

  //     let visibledatacolumn_c = Store.visibledatacolumn, visibledatarow_c = Store.visibledatarow;

  //     if (MBLsheetFreezen.freezenhorizontaldata != null) {
  //         visibledatarow_c = MBLsheetFreezen.freezenhorizontaldata[3];
  //     }

  //     if (MBLsheetFreezen.freezenverticaldata != null) {
  //         visibledatacolumn_c = MBLsheetFreezen.freezenverticaldata[3];
  //     }

  //     let col_ed = MBLsheet_searcharray(visibledatacolumn_c, scrollLeft);
  //     let row_ed = MBLsheet_searcharray(visibledatarow_c, scrollTop);

  //     let refreshLeft = scrollLeft , refreshTop = scrollTop;

  //     if (col_ed <= 0) {
  //         scrollLeft = 0;
  //     }
  //     else {
  //         scrollLeft = visibledatacolumn_c[col_ed - 1];
  //     }

  //     if (row_ed <= 0) {
  //         scrollTop = 0;
  //     }
  //     else {
  //         scrollTop = visibledatarow_c[row_ed - 1];
  //     }
  // }

  if (MBLsheetFreezen.freezenhorizontaldata != null) {
    if (scrollTop < MBLsheetFreezen.freezenhorizontaldata[2]) {
      scrollTop = MBLsheetFreezen.freezenhorizontaldata[2];
      $("#MBLsheet-scrollbar-y").scrollTop(scrollTop);
      return;
    }
  }

  if (MBLsheetFreezen.freezenverticaldata != null) {
    if (scrollLeft < MBLsheetFreezen.freezenverticaldata[2]) {
      scrollLeft = MBLsheetFreezen.freezenverticaldata[2];
      $("#MBLsheet-scrollbar-x").scrollLeft(scrollLeft);
      return;
    }
  }

  $("#MBLsheet-cols-h-c").scrollLeft(scrollLeft); //列标题
  $("#MBLsheet-rows-h").scrollTop(scrollTop); //行标题

  $t.scrollLeft(scrollLeft).scrollTop(scrollTop);

  $("#MBLsheet-input-box-index")
    .css({
      left: $("#MBLsheet-input-box").css("left"),
      top: parseInt($("#MBLsheet-input-box").css("top")) - 20 + "px",
      "z-index": $("#MBLsheet-input-box").css("z-index"),
    })
    .show();

  // if(scrollRequestAnimationFrameIni && Store.scrollRefreshSwitch){
  //     execScroll();
  //     scrollRequestAnimationFrameIni = false;
  // }

  MBLsheetrefreshgrid(scrollLeft, scrollTop);

  $("#MBLsheet-bottom-controll-row").css("left", scrollLeft);

  //有选区且有冻结时，滚动适应
  if (
    MBLsheetFreezen.freezenhorizontaldata != null ||
    MBLsheetFreezen.freezenverticaldata != null
  ) {
    MBLsheetFreezen.scrollAdapt();
  }

  if (
    !method.createHookFunction("scroll", {
      scrollLeft,
      scrollTop,
      canvasHeight,
    })
  ) {
    return;
  }
}
