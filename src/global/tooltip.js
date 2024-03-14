import {
  modelHTML,
  MBLsheetchartpointconfigHTML,
  MBLsheetToolHTML,
} from "../controllers/constant";
import browser from "./browser";
import { replaceHtml } from "../utils/util";
import locale from "../locale/locale";
import server from "../controllers/server";

const tooltip = {
  info: function (title, content) {
    $("#MBLsheet-modal-dialog-mask").show();
    $("#MBLsheet-info").remove();

    let _locale = locale();
    let locale_button = _locale.button;

    $("body").append(
      replaceHtml(modelHTML, {
        id: "MBLsheet-info",
        addclass: "",
        title: title,
        content: content,
        botton:
          '<button class="btn btn-default MBLsheet-model-close-btn">&nbsp;&nbsp;' +
          locale_button.close +
          "&nbsp;&nbsp;</button>",
        style: "z-index:100003",
      })
    );
    let $t = $("#MBLsheet-info")
        .find(".MBLsheet-modal-dialog-content")
        .css("min-width", 300)
        .end(),
      myh = $t.outerHeight(),
      myw = $t.outerWidth();
    let winw = $(window).width(),
      winh = $(window).height();
    let scrollLeft = $(document).scrollLeft(),
      scrollTop = $(document).scrollTop();
    $("#MBLsheet-info")
      .css({
        left: (winw + scrollLeft - myw) / 2,
        top: (winh + scrollTop - myh) / 3,
      })
      .show();
  },
  confirm: function (title, content, func1, func2, name1, name2) {
    $("#MBLsheet-modal-dialog-mask").show();
    $("#MBLsheet-confirm").remove();

    const _locale = locale();
    const locale_button = _locale.button;

    if (name1 == null) {
      name1 = locale_button.confirm;
    }
    if (name2 == null) {
      name2 = locale_button.cancel;
    }

    $("body").append(
      replaceHtml(modelHTML, {
        id: "MBLsheet-confirm",
        addclass: "",
        style: "z-index:100003",
        title: title,
        content: content,
        botton:
          '<button class="btn btn-primary MBLsheet-model-conform-btn">&nbsp;&nbsp;' +
          name1 +
          '&nbsp;&nbsp;</button><button class="btn btn-default MBLsheet-model-cancel-btn">&nbsp;&nbsp;' +
          name2 +
          "&nbsp;&nbsp;</button>",
      })
    );
    let $t = $("#MBLsheet-confirm")
        .find(".MBLsheet-modal-dialog-content")
        .css("min-width", 300)
        .end(),
      myh = $t.outerHeight(),
      myw = $t.outerWidth();
    let winw = $(window).width(),
      winh = $(window).height();
    let scrollLeft = $(document).scrollLeft(),
      scrollTop = $(document).scrollTop();
    $("#MBLsheet-confirm")
      .css({
        left: (winw + scrollLeft - myw) / 2,
        top: (winh + scrollTop - myh) / 3,
      })
      .show();
    $t.find(".MBLsheet-model-conform-btn").click(function () {
      if (typeof func1 == "function") {
        func1();
      }
      server.keepHighLightBox();
      $("#MBLsheet-confirm").hide();
      $("#MBLsheet-modal-dialog-mask").hide();
    });
    $t.find(".MBLsheet-model-cancel-btn").click(function () {
      if (typeof func2 == "function") {
        func2();
      }
      $("#MBLsheet-confirm").hide();
      $("#MBLsheet-modal-dialog-mask").hide();
    });
  },
  screenshot: function (title, content, imgurl) {
    const _locale = locale();
    const locale_screenshot = _locale.screenshot;
    $("#MBLsheet-modal-dialog-mask").show();
    $("#MBLsheet-confirm").remove();
    $("body").append(
      replaceHtml(modelHTML, {
        id: "MBLsheet-confirm",
        addclass: "",
        style: "z-index:100003",
        title: title,
        content: content,
        botton:
          '<a style="text-decoration:none;color:#fff;" class="download btn btn-primary MBLsheet-model-conform-btn">&nbsp;&nbsp;' +
          locale_screenshot.downLoadBtn +
          '&nbsp;&nbsp;</a>&nbsp;&nbsp;<button class="btn btn-primary MBLsheet-model-copy-btn">&nbsp;&nbsp;' +
          locale_screenshot.downLoadCopy +
          '&nbsp;&nbsp;</button><button class="btn btn-default MBLsheet-model-cancel-btn">&nbsp;&nbsp;' +
          locale_screenshot.downLoadClose +
          "&nbsp;&nbsp;</button>",
      })
    );
    let $t = $("#MBLsheet-confirm")
        .find(".MBLsheet-modal-dialog-content")
        .css("min-width", 300)
        .end(),
      myh = $t.outerHeight(),
      myw = $t.outerWidth();
    let winw = $(window).width(),
      winh = $(window).height();
    let scrollLeft = $(document).scrollLeft(),
      scrollTop = $(document).scrollTop();
    $("#MBLsheet-confirm")
      .css({
        left: (winw + scrollLeft - myw) / 2,
        top: (winh + scrollTop - myh) / 3,
      })
      .show();
    $t.find(".MBLsheet-model-conform-btn").click(function () {
      if (browser.isIE() == "1") {
        alert(locale_screenshot.browserNotTip);
      } else {
        if (!!window.ActiveXObject || "ActiveXObject" in window) {
          if ($("#IframeReportImg").length === 0) {
            $(
              '<iframe style="display:none;" id="IframeReportImg" name="IframeReportImg" onload="downloadImg();" width="0" height="0" src="about:blank"></iframe>'
            ).appendTo("body");
          }
          if ($("#IframeReportImg").attr("src") != imgurl) {
            $("#IframeReportImg").attr("src", imgurl);
          } else {
            if ($("#IframeReportImg").src != "about:blank") {
              window.frames["IframeReportImg"].document.execCommand("SaveAs");
            }
          }
        }
      }
    });
    $t.find(".MBLsheet-model-cancel-btn").click(function () {
      $("#MBLsheet-confirm").hide();
      $("#MBLsheet-modal-dialog-mask").hide();
    });

    $("#MBLsheet-confirm .MBLsheet-model-copy-btn").click(function () {
      let dt = new clipboard.DT();
      dt.setData("text/html", "<img src='" + imgurl + "'>");
      if (browser.isIE() == "1") {
        alert(locale_screenshot.rightclickTip);
      } else {
        clipboard.write(dt);
        alert(locale_screenshot.successTip);
      }
    });
  },
  chartPointConfig: function (id, savefunc1, closefunc2) {
    $("body").append(
      replaceHtml(modelHTML, {
        id: id,
        addclass: "MBLsheet-chart-point-config-c",
        title: "数据点批量设置",
        content: MBLsheetchartpointconfigHTML,
        botton:
          '<button class="btn btn-danger MBLsheet-model-save-btn">&nbsp;&nbsp;保存设置&nbsp;&nbsp;</button><button class="btn btn-default MBLsheet-model-close-btn">&nbsp;&nbsp;取消&nbsp;&nbsp;</button>',
        style: "z-index:100003;height:80%;width:80%;top:10%;left:10%;",
      })
    );
    $("#MBLsheet-modal-dialog-mask").show();
    let winw = $(window).width(),
      winh = $(window).height();
    $("#" + id)
      .find(".MBLsheet-chart-point-config")
      .css("height", winh - 160);
    $("#" + id)
      .css({
        height: winh - 90,
        width: winw - 100,
        left: 7,
        top: 14,
      })
      .show()
      .find(".MBLsheet-model-save-btn")
      .click(function () {
        if (typeof savefunc1 == "function") {
          savefunc1();
        }

        $("#" + id).hide();
        $("#MBLsheet-modal-dialog-mask").hide();
      });

    $("#" + id)
      .find(".MBLsheet-model-save-btn")
      .click(function () {
        if (typeof closefunc2 == "function") {
          closefunc2();
        }

        $("#" + id).hide();
        $("#MBLsheet-modal-dialog-mask").hide();
      });
  },
  sheetConfig: function () {},
  hoverTipshowState: false,
  hoverTipshowTimeOut: null,
  createHoverTip: function (obj, to) {
    let _this = this;

    $(obj)
      .on("mouseover", to, function (e) {
        if (_this.hoverTipshowState) {
          return;
        }

        clearTimeout(_this.hoverTipshowTimeOut);
        _this.hoverTipshowTimeOut = setTimeout(function () {
          let $t = $(e.currentTarget),
            toffset = $t.offset(),
            $toolup = $("#MBLsheet-tooltip-up");

          let tips = $t.data("tips");
          if (tips == null || tips.length == 0) {
            tips = $t.prev().data("tips");

            if (tips == null || tips.length == 0) {
              return;
            }
          }

          if ($toolup.length == 0) {
            $("body").append(MBLsheetToolHTML);
            $toolup = $("#MBLsheet-tooltip-up");
          }

          $toolup
            .removeClass("jfk-tooltip-hide")
            .find("div.jfk-tooltip-contentId")
            .html(tips);
          let toolwidth = $toolup.outerWidth();
          $toolup.find("div.jfk-tooltip-arrow").css("left", toolwidth / 2);

          let toolleft = toffset.left + ($t.outerWidth() - toolwidth) / 2;
          if (toolleft < 2) {
            toolleft = 2;
            $toolup
              .find("div.jfk-tooltip-arrow")
              .css("left", $t.outerWidth() / 2);
          }

          $toolup.css({
            top: toffset.top + $t.outerHeight() + 1,
            left: toolleft,
          });
        }, 300);
      })
      .on("mouseout", to, function (e) {
        _this.hoverTipshowState = false;
        clearTimeout(_this.hoverTipshowTimeOut);
        $("#MBLsheet-tooltip-up").addClass("jfk-tooltip-hide");
      })
      .on("click", to, function (e) {
        _this.hoverTipshowState = true;
        clearTimeout(_this.hoverTipshowTimeOut);
        $("#MBLsheet-tooltip-up").addClass("jfk-tooltip-hide");
      });
  },
  popover: function (content, position, close, style, btntxt, exitsFuc) {
    let _locale = locale();
    let locale_button = _locale.button;
    let locale_paint = _locale.paint;

    if (btntxt == null) {
      btntxt = locale_button.close;
    }

    let htmldiv =
      '<div id="MBLsheetpopover" class="MBLsheetpopover"><div class="MBLsheetpopover-content">' +
      locale_paint.start +
      '</div><div class="MBLsheetpopover-btn">' +
      btntxt +
      "</div></div>";
    $("#MBLsheetpopover").remove();
    $("body").append(htmldiv);
    $("#MBLsheetpopover .MBLsheetpopover-content").html(content);

    let w = $("#MBLsheetpopover").outerWidth(),
      h = $("#MBLsheetpopover").outerHeight();
    let pcss = {};

    if (position == "topLeft") {
      pcss.top = "20px";
      pcss.left = "20px";
    } else if (position == "topCenter") {
      pcss.top = "20px";
      pcss.left = "50%";
      pcss["margin-left"] = -w / 2;
    } else if (position == "topRight") {
      pcss.top = "20px";
      pcss.right = "20px";
    } else if (position == "midLeft") {
      pcss.top = "50%";
      pcss["margin-top"] = -h / 2;
      pcss.left = "20px";
    } else if (position == "center") {
      pcss.top = "50%";
      pcss["margin-top"] = -h / 2;
      pcss.left = "50%";
      pcss["margin-left"] = -w / 2;
    } else if (position == "midRight") {
      pcss.top = "50%";
      pcss["margin-top"] = -h / 2;
      pcss.right = "20px";
    } else if (position == "bottomLeft") {
      pcss.bottom = "20px";
      pcss.left = "20px";
    } else if (position == "bottomCenter") {
      pcss.bottom = "20px";
      pcss.left = "50%";
      pcss["margin-left"] = -w / 2;
    } else if (position == "bottomRight") {
      pcss.bottom = "20px";
      pcss.right = "20px";
    } else {
      pcss.top = "20px";
      pcss.left = "50%";
      pcss["margin-left"] = -w / 2;
    }

    if (style == "white") {
      pcss.background = "rgba(255, 255, 255, 0.65)";
      pcss.color = "#000";
      $("#MBLsheetpopover .MBLsheetpopover-btn").css({
        border: "1px solid #000",
      });
    }

    setTimeout(function () {
      $("#MBLsheetpopover .MBLsheetpopover-content").css({
        "margin-left":
          -$("#MBLsheetpopover .MBLsheetpopover-btn").outerWidth() / 2,
      });
    }, 1);
    $("#MBLsheetpopover").css(pcss).fadeIn();
    $("#MBLsheetpopover .MBLsheetpopover-btn").click(function () {
      if (typeof exitsFuc == "function") {
        exitsFuc();
      }
    });

    if (close != null && typeof close == "number") {
      setTimeout(function () {
        $("#MBLsheetpopover").fadeOut().remove();
        if (typeof exitsFuc == "function") {
          exitsFuc();
        }
      }, close);
    }
  },
};

export default tooltip;
