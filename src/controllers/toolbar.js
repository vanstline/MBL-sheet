import locale from "../locale/locale";
import MBLsheetConfigsetting from "./MBLsheetConfigsetting";

import { getObjType, camel2split } from "../utils/util";

// 默认的工具栏按钮
export const defaultToolbar = [
  "undo",
  "redo",
  "paintFormat",
  "|",

  "currencyFormat",
  "percentageFormat",
  "numberIncrease",
  "numberDecrease",
  "moreFormats",
  "|",

  "font",
  "|",
  "fontSize",
  "|",

  "bold",
  "italic",
  "strikethrough",
  "underline",
  "textColor",
  "|",

  "fillColor",
  "border",
  "mergeCell",
  "|",

  "horizontalAlignMode",
  "verticalAlignMode",
  "textWrapMode",
  "textRotateMode",
  "|",

  "image",
  "link",
  "chart",
  "postil",
  "pivotTable",
  "|",

  "function",
  "frozenMode",
  "sortAndFilter",
  "conditionalFormat",
  "dataVerification",
  "splitColumn",
  "screenshot",
  "findAndReplace",
  "protection",
  "print",
];

// 工具栏按钮 id 关系
export const toolbarIdMap = {
  undo: "#MBLsheet-icon-undo", //Undo redo
  redo: "#MBLsheet-icon-redo",
  paintFormat: ["#MBLsheet-icon-paintformat"], //Format brush
  currencyFormat: "#MBLsheet-icon-currency", //currency format
  percentageFormat: "#MBLsheet-icon-percent", //Percentage format
  numberDecrease: "#MBLsheet-icon-fmt-decimal-decrease", //'Decrease the number of decimal places'
  numberIncrease: "#MBLsheet-icon-fmt-decimal-increase", //'Increase the number of decimal places
  moreFormats: "#MBLsheet-icon-fmt-other", //'More Formats'
  font: "#MBLsheet-icon-font-family", //'font'
  fontSize: "#MBLsheet-icon-font-size", //'Font size'
  bold: "#MBLsheet-icon-bold", //'Bold (Ctrl+B)'
  italic: "#MBLsheet-icon-italic", //'Italic (Ctrl+I)'
  strikethrough: "#MBLsheet-icon-strikethrough", //'Strikethrough (Alt+Shift+5)'
  underline: "#MBLsheet-icon-underline", //'Underline (Alt+Shift+6)'
  textColor: ["#MBLsheet-icon-text-color", "#MBLsheet-icon-text-color-menu"], //'Text color'
  fillColor: ["#MBLsheet-icon-cell-color", "#MBLsheet-icon-cell-color-menu"], //'Cell color'
  border: ["#MBLsheet-icon-border-all", "#MBLsheet-icon-border-menu"], //'border'
  mergeCell: ["#MBLsheet-icon-merge-button", "#MBLsheet-icon-merge-menu"], //'Merge cells'
  horizontalAlignMode: ["#MBLsheet-icon-align", "#MBLsheet-icon-align-menu"], //'Horizontal alignment'
  verticalAlignMode: ["#MBLsheet-icon-valign", "#MBLsheet-icon-valign-menu"], //'Vertical alignment'
  textWrapMode: ["#MBLsheet-icon-textwrap", "#MBLsheet-icon-textwrap-menu"], //'Wrap mode'
  textRotateMode: ["#MBLsheet-icon-rotation", "#MBLsheet-icon-rotation-menu"], //'Text Rotation Mode'
  image: "#MBLsheet-insertImg-btn-title", //'Insert link'
  link: "#MBLsheet-insertLink-btn-title", //'Insert picture'
  chart: "#MBLsheet-chart-btn-title", //'chart' (the icon is hidden, but if the chart plugin is configured, you can still create a new chart by right click)
  postil: "#MBLsheet-icon-postil", //'comment'
  pivotTable: ["#MBLsheet-pivot-btn-title"], //'PivotTable'
  function: ["#MBLsheet-icon-function", "#MBLsheet-icon-function-menu"], //'formula'
  frozenMode: [
    "#MBLsheet-freezen-btn-horizontal",
    "#MBLsheet-icon-freezen-menu",
  ], //'freeze mode'
  sortAndFilter: "#MBLsheet-icon-autofilter", //'sort and filter'
  conditionalFormat: "#MBLsheet-icon-conditionformat", //'Conditional Format'
  dataVerification: "#MBLsheet-dataVerification-btn-title", // 'Data Verification'
  splitColumn: "#MBLsheet-splitColumn-btn-title", //'Split column'
  screenshot: "#MBLsheet-chart-btn-screenshot", //'screenshot'
  findAndReplace: "#MBLsheet-icon-seachmore", //'Find and Replace'
  protection: "#MBLsheet-icon-protection", // 'Worksheet protection'
  print: "#MBLsheet-icon-print", // 'print'
};

// 创建工具栏按钮的html
export function createToolbarHtml() {
  const toolbar = locale().toolbar;
  const fontarray = locale().fontarray;
  const defaultFmtArray = locale().defaultFmt;
  const htmlMap = {
    undo: `<div class="MBLsheet-toolbar-button MBLsheet-inline-block disabled" data-tips="${toolbar.undo}"
        id="MBLsheet-icon-undo" role="button" style="user-select: none;">
            <div class="MBLsheet-toolbar-button-outer-box MBLsheet-inline-block"
            style="user-select: none;">
                <div class="MBLsheet-toolbar-button-inner-box MBLsheet-inline-block"
                style="user-select: none;">
                    <div class="MBLsheet-icon MBLsheet-inline-block " style="user-select: none;">
                        <div aria-hidden="true" class="MBLsheet-icon-img-container MBLsheet-icon-img MBLsheet-icon-undo iconfont MBLsheet-iconfont-qianjin"
                        style="user-select: none;">
                        </div>
                    </div>
                </div>
            </div>
        </div>`,
    redo: `<div class="MBLsheet-toolbar-button MBLsheet-inline-block disabled" data-tips="${toolbar.redo}"
        id="MBLsheet-icon-redo" role="button" style="user-select: none;">
            <div class="MBLsheet-toolbar-button-outer-box MBLsheet-inline-block"
            style="user-select: none;">
                <div class="MBLsheet-toolbar-button-inner-box MBLsheet-inline-block"
                style="user-select: none;">
                    <div class="MBLsheet-icon MBLsheet-inline-block " style="user-select: none;">
                        <div aria-hidden="true" class="MBLsheet-icon-img-container MBLsheet-icon-img MBLsheet-icon-redo iconfont MBLsheet-iconfont-houtui"
                        style="user-select: none;">
                        </div>
                    </div>
                </div>
            </div>
        </div>`,
    paintFormat: `<div class="MBLsheet-toolbar-button MBLsheet-inline-block" data-tips="${toolbar.paintFormat}"
        id="MBLsheet-icon-paintformat" role="button" style="user-select: none;">
            <div class="MBLsheet-toolbar-button-outer-box MBLsheet-inline-block"
            style="user-select: none;">
                <div class="MBLsheet-toolbar-button-inner-box MBLsheet-inline-block"
                style="user-select: none;">
                    <div class="MBLsheet-icon MBLsheet-inline-block " style="user-select: none;">
                        <div aria-hidden="true" class="MBLsheet-icon-img-container MBLsheet-icon-img iconfont MBLsheet-iconfont-geshishua"
                        style="user-select: none;">
                        </div>
                    </div>
                </div>
            </div>
        </div>`,
    currencyFormat: `<div class="MBLsheet-toolbar-button MBLsheet-inline-block" data-tips="${toolbar.currencyFormat}"
        id="MBLsheet-icon-currency" role="button" style="user-select: none;">
            <div class="MBLsheet-toolbar-button-outer-box MBLsheet-inline-block"
            style="user-select: none;">
                <div class="MBLsheet-toolbar-button-inner-box MBLsheet-inline-block"
                style="user-select: none;">
                    <div class="MBLsheet-icon MBLsheet-inline-block " style="user-select: none;">
                        <div aria-hidden="true" class="MBLsheet-icon-img-container MBLsheet-icon-img iconfont MBLsheet-iconfont-jine"
                        style="user-select: none;">
                        </div>
                    </div>
                </div>
            </div>
        </div>`,
    percentageFormat: `<div class="MBLsheet-toolbar-button MBLsheet-inline-block" data-tips="${toolbar.percentageFormat}"
        id="MBLsheet-icon-percent" role="button" style="user-select: none;">
            <div class="MBLsheet-toolbar-button-outer-box MBLsheet-inline-block"
            style="user-select: none;">
                <div class="MBLsheet-toolbar-button-inner-box MBLsheet-inline-block"
                style="user-select: none;">
                    <div class="MBLsheet-icon MBLsheet-inline-block " style="user-select: none;">
                        <div aria-hidden="true" class="MBLsheet-icon-img-container MBLsheet-icon-img iconfont MBLsheet-iconfont-baifenhao"
                        style="user-select: none;">
                        </div>
                    </div>
                </div>
            </div>
        </div>`, //Percentage format
    numberDecrease: `<div class="MBLsheet-toolbar-button MBLsheet-inline-block" data-tips="${toolbar.numberDecrease}"
        id="MBLsheet-icon-fmt-decimal-decrease" role="button" style="user-select: none;">
            <div class="MBLsheet-toolbar-button-outer-box MBLsheet-inline-block"
            style="user-select: none;">
                <div class="MBLsheet-toolbar-button-inner-box MBLsheet-inline-block"
                style="user-select: none;">
                    <div class="MBLsheet-icon MBLsheet-inline-block toolbar-decimal-icon"
                    style="user-select: none;">
                        <div aria-hidden="true" class="MBLsheet-icon-img-container MBLsheet-icon-img MBLsheet-icon-decimal-decrease iconfont MBLsheet-iconfont-zengjiaxiaoshuwei"
                        style="user-select: none;">
                        </div>
                    </div>
                </div>
            </div>
        </div>`, //'Decrease the number of decimal places'
    numberIncrease: `<div class="MBLsheet-toolbar-button MBLsheet-inline-block" data-tips="${toolbar.numberIncrease}"
        id="MBLsheet-icon-fmt-decimal-increase" role="button" style="user-select: none;">
            <div class="MBLsheet-toolbar-button-outer-box MBLsheet-inline-block"
            style="user-select: none;">
                <div class="MBLsheet-toolbar-button-inner-box MBLsheet-inline-block"
                style="user-select: none;">
                    <div class="MBLsheet-icon MBLsheet-inline-block toolbar-decimal-icon"
                    style="user-select: none;">
                        <div aria-hidden="true" class="MBLsheet-icon-img-container MBLsheet-icon-img MBLsheet-icon-decimal-increase iconfont MBLsheet-iconfont-jianxiaoxiaoshuwei"
                        style="user-select: none;">
                        </div>
                    </div>
                </div>
            </div>
        </div>`, //'Increase the number of decimal places
    moreFormats: `<div class="MBLsheet-toolbar-select MBLsheet-toolbar-menu-button MBLsheet-inline-block" data-tips="${toolbar.moreFormats}"
        id="MBLsheet-icon-fmt-other" role="button" style="user-select: none;">
            <div class="MBLsheet-toolbar-menu-button-outer-box MBLsheet-inline-block"
            style="user-select: none;">
                <div class="MBLsheet-toolbar-menu-button-inner-box MBLsheet-inline-block"
                style="user-select: none;">
                    <div class="MBLsheet-toolbar-menu-button-caption MBLsheet-inline-block"
                    style="user-select: none;">
                        ${defaultFmtArray[0].text}
                    </div>
                    <div class="MBLsheet-toolbar-menu-button-dropdown MBLsheet-inline-block iconfont MBLsheet-iconfont-xiayige"
                    style="user-select: none;">
                    </div>
                </div>
            </div>
        </div>`, //'More Formats'
    font: `<div class="MBLsheet-toolbar-select MBLsheet-toolbar-menu-button MBLsheet-inline-block"
        data-tips="${toolbar.font}" id="MBLsheet-icon-font-family" role="button" style="user-select: none;">
            <div class="MBLsheet-toolbar-menu-button-outer-box MBLsheet-inline-block"
            style="user-select: none;">
                <div class="MBLsheet-toolbar-menu-button-inner-box MBLsheet-inline-block"
                style="user-select: none;">
                    <div class="MBLsheet-toolbar-menu-button-caption MBLsheet-inline-block"
                    style="user-select: none;">
                        ${fontarray[0]}
                    </div>
                    <div class="MBLsheet-toolbar-menu-button-dropdown MBLsheet-inline-block iconfont MBLsheet-iconfont-xiayige"
                    style="user-select: none;">
                    </div>
                </div>
            </div>
        </div>`, //'font'
    fontSize: `<div class="MBLsheet-toolbar-select MBLsheet-toolbar-zoom-combobox MBLsheet-toolbar-combo-button MBLsheet-inline-block"
        data-tips="${toolbar.fontSize}" id="MBLsheet-icon-font-size" style="user-select: none;">
            <div class="MBLsheet-toolbar-combo-button-outer-box MBLsheet-inline-block"
            style="user-select: none;">
                <div class="MBLsheet-toolbar-combo-button-inner-box MBLsheet-inline-block"
                style="user-select: none;">
                    <div aria-posinset="4" aria-setsize="7" class="MBLsheet-inline-block MBLsheet-toolbar-combo-button-caption"
                    style="user-select: none;">
                        <input aria-label="${toolbar.fontSize}" class="MBLsheet-toolbar-combo-button-input MBLsheet-toolbar-textinput"
                        role="combobox" style="user-select: none;" tabindex="-1" type="text" value="10"
                        />
                    </div>
                    <div class="MBLsheet-toolbar-combo-button-dropdown MBLsheet-inline-block iconfont MBLsheet-iconfont-xiayige"
                    style="user-select: none;">
                    </div>
                </div>
            </div>
        </div>`, //'Font size'
    bold: `<div class="MBLsheet-toolbar-button MBLsheet-inline-block" data-tips="${toolbar.bold}"
        id="MBLsheet-icon-bold" role="button" style="user-select: none;">
            <div class="MBLsheet-toolbar-button-outer-box MBLsheet-inline-block"
            style="user-select: none;">
                <div class="MBLsheet-toolbar-button-inner-box MBLsheet-inline-block"
                style="user-select: none;">
                    <div class="MBLsheet-icon MBLsheet-inline-block " style="user-select: none;">
                        <div aria-hidden="true" class="MBLsheet-icon-img-container MBLsheet-icon-img MBLsheet-icon-bold iconfont MBLsheet-iconfont-jiacu"
                        style="user-select: none;">
                        </div>
                    </div>
                </div>
            </div>
        </div>`, //'Bold (Ctrl+B)'
    italic: `<div class="MBLsheet-toolbar-button MBLsheet-inline-block" data-tips="${toolbar.italic}"
        id="MBLsheet-icon-italic" role="button" style="user-select: none;">
            <div class="MBLsheet-toolbar-button-outer-box MBLsheet-inline-block"
            style="user-select: none;">
                <div class="MBLsheet-toolbar-button-inner-box MBLsheet-inline-block"
                style="user-select: none;">
                    <div class="MBLsheet-icon MBLsheet-inline-block " style="user-select: none;">
                        <div aria-hidden="true" class="MBLsheet-icon-img-container MBLsheet-icon-img MBLsheet-icon-italic iconfont MBLsheet-iconfont-wenbenqingxie1"
                        style="user-select: none;">
                        </div>
                    </div>
                </div>
            </div>
        </div>`, //'Italic (Ctrl+I)'
    strikethrough: `<div class="MBLsheet-toolbar-button MBLsheet-inline-block" data-tips="${toolbar.strikethrough}"
        id="MBLsheet-icon-strikethrough" role="button" style="user-select: none;">
            <div class="MBLsheet-toolbar-button-outer-box MBLsheet-inline-block"
            style="user-select: none;">
                <div class="MBLsheet-toolbar-button-inner-box MBLsheet-inline-block"
                style="user-select: none;">
                    <div class="MBLsheet-icon MBLsheet-inline-block " style="user-select: none;">
                        <div aria-hidden="true" class="MBLsheet-icon-img-container MBLsheet-icon-img MBLsheet-icon-strikethrough iconfont MBLsheet-iconfont-wenbenshanchuxian"
                        style="user-select: none;">
                        </div>
                    </div>
                </div>
            </div>
        </div>`, //'Strikethrough (Alt+Shift+5)'
    underline: `<div class="MBLsheet-toolbar-button MBLsheet-inline-block" data-tips="${toolbar.underline}"
        id="MBLsheet-icon-underline" role="button" style="user-select: none;">
            <div class="MBLsheet-toolbar-button-outer-box MBLsheet-inline-block"
            style="user-select: none;">
                <div class="MBLsheet-toolbar-button-inner-box MBLsheet-inline-block"
                style="user-select: none;">
                    <div class="MBLsheet-icon MBLsheet-inline-block " style="user-select: none;">
                        <div aria-hidden="true" class="MBLsheet-icon-img-container MBLsheet-icon-img MBLsheet-icon-underline iconfont MBLsheet-iconfont-wenbenxiahuaxian"
                        style="user-select: none;">
                        </div>
                    </div>
                </div>
            </div>
        </div>`, //'Underline (Alt+Shift+6)'
    textColor: `<div class="MBLsheet-toolbar-button-split-left MBLsheet-toolbar-button MBLsheet-inline-block MBLsheet-icon-text-color"
        data-tips="${toolbar.textColor}" id="MBLsheet-icon-text-color" role="button" style="user-select: none;">
            <div class="MBLsheet-toolbar-button-outer-box MBLsheet-inline-block"
            style="user-select: none;">
                <div class="MBLsheet-toolbar-menu-button-inner-box MBLsheet-inline-block"
                style="user-select: none;">
                    <div class="MBLsheet-toolbar-menu-button-caption MBLsheet-inline-block"
                    style="user-select: none;">
                        <div class="MBLsheet-color-menu-button-indicator" style="border-bottom-color: rgb(0, 0, 0); user-select: none;">
                            <div class="MBLsheet-icon MBLsheet-inline-block " style="user-select: none;">
                                <div class="text-color-bar" style="background-color:${MBLsheetConfigsetting.defaultTextColor}"></div>
                                <div aria-hidden="true" class="MBLsheet-icon-img-container MBLsheet-icon-img MBLsheet-icon-text-color iconfont MBLsheet-iconfont-wenbenyanse"
                                style="user-select: none;">
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="MBLsheet-toolbar-button-split-right MBLsheet-toolbar-menu-button MBLsheet-inline-block"
        data-tips="${toolbar.chooseColor}..." id="MBLsheet-icon-text-color-menu" role="button"
        style="user-select: none;">
            <div class="MBLsheet-toolbar-menu-button-outer-box MBLsheet-inline-block"
            style="user-select: none;">
                <div class="MBLsheet-toolbar-menu-button-inner-box MBLsheet-inline-block"
                style="user-select: none;">
                    <div class="MBLsheet-toolbar-menu-button-dropdown MBLsheet-inline-block iconfont MBLsheet-iconfont-xiayige"
                    style="user-select: none;">
                    </div>
                </div>
            </div>
        </div>`, //'Text color'
    fillColor: `<div class="MBLsheet-toolbar-button-split-left MBLsheet-toolbar-button MBLsheet-inline-block MBLsheet-icon-cell-color"
        data-tips="${toolbar.fillColor}" id="MBLsheet-icon-cell-color" role="button" style="user-select: none;">
            <div class="MBLsheet-toolbar-button-outer-box MBLsheet-inline-block"
            style="user-select: none;">
                <div class="MBLsheet-toolbar-menu-button-inner-box MBLsheet-inline-block"
                style="user-select: none;">
                    <div class="MBLsheet-toolbar-menu-button-caption MBLsheet-inline-block"
                    style="user-select: none;">
                        <div class="MBLsheet-color-menu-button-indicator" style="border-bottom-color: rgb(255, 255, 255); user-select: none;">
                            <div class="MBLsheet-icon MBLsheet-inline-block " style="user-select: none;">
                                <div class="text-color-bar" style="background-color:${MBLsheetConfigsetting.defaultCellColor}"></div>
                                <div aria-hidden="true" class="MBLsheet-icon-img-container MBLsheet-icon-img MBLsheet-icon-cell-color iconfont MBLsheet-iconfont-tianchong"
                                style="user-select: none;">
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="MBLsheet-toolbar-button-split-right MBLsheet-toolbar-menu-button MBLsheet-inline-block"
        data-tips="${toolbar.chooseColor}..." id="MBLsheet-icon-cell-color-menu" role="button"
        style="user-select: none;">
            <div class="MBLsheet-toolbar-menu-button-outer-box MBLsheet-inline-block"
            style="user-select: none;">
                <div class="MBLsheet-toolbar-menu-button-inner-box MBLsheet-inline-block"
                style="user-select: none;">
                    <div class="MBLsheet-toolbar-menu-button-dropdown MBLsheet-inline-block iconfont MBLsheet-iconfont-xiayige"
                    style="user-select: none;">
                    </div>
                </div>
            </div>
        </div>`, //'Cell color'
    border: `<div class="MBLsheet-toolbar-button-split-left MBLsheet-toolbar-button MBLsheet-inline-block MBLsheet-icon-border-all"
        data-tips="${toolbar.border}" id="MBLsheet-icon-border-all" role="button" style="user-select: none;">
            <div class="MBLsheet-toolbar-button-outer-box MBLsheet-inline-block"
            style="user-select: none;">
                <div class="MBLsheet-toolbar-button-inner-box MBLsheet-inline-block"
                style="user-select: none;">
                    <div class="MBLsheet-icon MBLsheet-inline-block " style="user-select: none;">
                        <div aria-hidden="true" class="MBLsheet-icon-img-container MBLsheet-icon-img MBLsheet-icon-border-all iconfont MBLsheet-iconfont-quanjiabiankuang"
                        style="user-select: none;">
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="MBLsheet-toolbar-button-split-right MBLsheet-toolbar-menu-button MBLsheet-inline-block"
        data-tips="${toolbar.borderStyle}..." id="MBLsheet-icon-border-menu" role="button" style="user-select: none;">
            <div class="MBLsheet-toolbar-menu-button-outer-box MBLsheet-inline-block"
            style="user-select: none;">
                <div class="MBLsheet-toolbar-menu-button-inner-box MBLsheet-inline-block"
                style="user-select: none;">
                    <div class="MBLsheet-toolbar-menu-button-dropdown MBLsheet-inline-block iconfont MBLsheet-iconfont-xiayige"
                    style="user-select: none;">
                    </div>
                </div>
            </div>
        </div>`, //'border'
    mergeCell: `<div class="MBLsheet-toolbar-button-split-left MBLsheet-toolbar-button MBLsheet-inline-block MBLsheet-icon-merge-button"
        data-tips="${toolbar.mergeCell}" id="MBLsheet-icon-merge-button" role="button" style="user-select: none;">
            <div class="MBLsheet-toolbar-button-outer-box MBLsheet-inline-block"
            style="user-select: none;">
                <div class="MBLsheet-toolbar-button-inner-box MBLsheet-inline-block"
                style="user-select: none;">
                    <div class="MBLsheet-icon MBLsheet-inline-block " style="user-select: none;">
                        <div aria-hidden="true" class="MBLsheet-icon-img-container MBLsheet-icon-img MBLsheet-icon-merge iconfont MBLsheet-iconfont-hebing"
                        style="user-select: none;">
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="MBLsheet-toolbar-button-split-right MBLsheet-toolbar-menu-button MBLsheet-inline-block"
        data-tips="${toolbar.chooseMergeType}..." id="MBLsheet-icon-merge-menu" role="button" style="user-select: none;">
            <div class="MBLsheet-toolbar-menu-button-outer-box MBLsheet-inline-block"
            style="user-select: none;">
                <div class="MBLsheet-toolbar-menu-button-inner-box MBLsheet-inline-block"
                style="user-select: none;">
                    <div class="MBLsheet-toolbar-menu-button-dropdown MBLsheet-inline-block iconfont MBLsheet-iconfont-xiayige"
                    style="user-select: none;">
                    </div>
                </div>
            </div>
        </div>`, //'Merge cells'
    horizontalAlignMode: `<div class="MBLsheet-toolbar-button-split-left MBLsheet-toolbar-button MBLsheet-inline-block MBLsheet-icon-align"
        data-tips="${toolbar.horizontalAlign}" id="MBLsheet-icon-align" role="button" style="user-select: none;">
            <div class="MBLsheet-toolbar-button-outer-box MBLsheet-inline-block"
            style="user-select: none;">
                <div class="MBLsheet-toolbar-menu-button-inner-box MBLsheet-inline-block"
                style="user-select: none;">
                    <div class="MBLsheet-toolbar-menu-button-caption MBLsheet-inline-block"
                    style="user-select: none;">
                        <div class="MBLsheet-icon MBLsheet-inline-block " style="user-select: none;">
                            <div aria-hidden="true" class="MBLsheet-icon-img-container MBLsheet-icon-img MBLsheet-icon-align-left iconfont MBLsheet-iconfont-wenbenzuoduiqi"
                            style="user-select: none;">
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="MBLsheet-toolbar-button-split-right MBLsheet-toolbar-menu-button MBLsheet-inline-block"
        data-tips="${toolbar.alignment}..." id="MBLsheet-icon-align-menu" role="button" style="user-select: none;">
            <div class="MBLsheet-toolbar-menu-button-outer-box MBLsheet-inline-block"
            style="user-select: none;">
                <div class="MBLsheet-toolbar-menu-button-inner-box MBLsheet-inline-block"
                style="user-select: none;">
                    <div class="MBLsheet-toolbar-menu-button-dropdown MBLsheet-inline-block iconfont MBLsheet-iconfont-xiayige"
                    style="user-select: none;">
                    </div>
                </div>
            </div>
        </div>`, //'Horizontal alignment'
    verticalAlignMode: `<div class="MBLsheet-toolbar-button-split-left MBLsheet-toolbar-button MBLsheet-inline-block MBLsheet-icon-valign"
        data-tips="${toolbar.verticalAlign}" id="MBLsheet-icon-valign" role="button" style="user-select: none;">
            <div class="MBLsheet-toolbar-button-outer-box MBLsheet-inline-block"
            style="user-select: none;">
                <div class="MBLsheet-toolbar-menu-button-inner-box MBLsheet-inline-block"
                style="user-select: none;">
                    <div class="MBLsheet-toolbar-menu-button-caption MBLsheet-inline-block"
                    style="user-select: none;">
                        <div class="MBLsheet-icon MBLsheet-inline-block " style="user-select: none;">
                            <div aria-hidden="true" class="MBLsheet-icon-img-container MBLsheet-icon-img MBLsheet-icon-valign-bottom iconfont MBLsheet-iconfont-dibuduiqi"
                            style="user-select: none;">
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="MBLsheet-toolbar-button-split-right MBLsheet-toolbar-menu-button MBLsheet-inline-block"
        data-tips="${toolbar.alignment}..." id="MBLsheet-icon-valign-menu" role="button" style="user-select: none;">
            <div class="MBLsheet-toolbar-menu-button-outer-box MBLsheet-inline-block"
            style="user-select: none;">
                <div class="MBLsheet-toolbar-menu-button-inner-box MBLsheet-inline-block"
                style="user-select: none;">
                    <div class="MBLsheet-toolbar-menu-button-dropdown MBLsheet-inline-block iconfont MBLsheet-iconfont-xiayige"
                    style="user-select: none;">
                    </div>
                </div>
            </div>
        </div>`, //'Vertical alignment'
    textWrapMode: `<div class="MBLsheet-toolbar-button-split-left MBLsheet-toolbar-button MBLsheet-inline-block MBLsheet-icon-textwrap"
        data-tips="${toolbar.textWrap}" id="MBLsheet-icon-textwrap" role="button" style="user-select: none;">
            <div class="MBLsheet-toolbar-button-outer-box MBLsheet-inline-block"
            style="user-select: none;">
                <div class="MBLsheet-toolbar-menu-button-inner-box MBLsheet-inline-block"
                style="user-select: none;">
                    <div class="MBLsheet-toolbar-menu-button-caption MBLsheet-inline-block"
                    style="user-select: none;">
                        <div class="MBLsheet-icon MBLsheet-inline-block " style="user-select: none;">
                            <div aria-hidden="true" class="MBLsheet-icon-img-container MBLsheet-icon-img MBLsheet-icon-textwrap-clip iconfont MBLsheet-iconfont-jieduan"
                            style="user-select: none;">
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="MBLsheet-toolbar-button-split-right MBLsheet-toolbar-menu-button MBLsheet-inline-block"
        data-tips="${toolbar.textWrapMode}..." id="MBLsheet-icon-textwrap-menu" role="button" style="user-select: none;">
            <div class="MBLsheet-toolbar-menu-button-outer-box MBLsheet-inline-block"
            style="user-select: none;">
                <div class="MBLsheet-toolbar-menu-button-inner-box MBLsheet-inline-block"
                style="user-select: none;">
                    <div class="MBLsheet-toolbar-menu-button-dropdown MBLsheet-inline-block iconfont MBLsheet-iconfont-xiayige"
                    style="user-select: none;">
                    </div>
                </div>
            </div>
        </div>`, //'Wrap mode'
    textRotateMode: `<div class="MBLsheet-toolbar-button-split-left MBLsheet-toolbar-button MBLsheet-inline-block MBLsheet-icon-rotation"
        data-tips="${toolbar.textRotate}" id="MBLsheet-icon-rotation" role="button" style="user-select: none;">
            <div class="MBLsheet-toolbar-button-outer-box MBLsheet-inline-block"
            style="user-select: none;">
                <div class="MBLsheet-toolbar-menu-button-inner-box MBLsheet-inline-block"
                style="user-select: none;">
                    <div class="MBLsheet-toolbar-menu-button-caption MBLsheet-inline-block"
                    style="user-select: none;">
                        <div class="MBLsheet-icon MBLsheet-inline-block " style="user-select: none;">
                            <div aria-hidden="true" class="MBLsheet-icon-img-container MBLsheet-icon-img MBLsheet-icon-rotation-none iconfont MBLsheet-iconfont-wuxuanzhuang"
                            style="user-select: none;">
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="MBLsheet-toolbar-button-split-right MBLsheet-toolbar-menu-button MBLsheet-inline-block"
        data-tips="${toolbar.textRotateMode}..." id="MBLsheet-icon-rotation-menu" role="button" style="user-select: none;">
            <div class="MBLsheet-toolbar-menu-button-outer-box MBLsheet-inline-block"
            style="user-select: none;">
                <div class="MBLsheet-toolbar-menu-button-inner-box MBLsheet-inline-block"
                style="user-select: none;">
                    <div class="MBLsheet-toolbar-menu-button-dropdown MBLsheet-inline-block iconfont MBLsheet-iconfont-xiayige"
                    style="user-select: none;">
                    </div>
                </div>
            </div>
        </div>`, //'Text Rotation Mode'
    image: `<div class="MBLsheet-toolbar-button-split-left MBLsheet-toolbar-button MBLsheet-inline-block"
        data-tips="${toolbar.insertImage}" id="MBLsheet-insertImg-btn-title" role="button" style="user-select: none;">
            <div class="MBLsheet-toolbar-button-outer-box MBLsheet-inline-block"
            style="user-select: none;">
                <div class="MBLsheet-toolbar-menu-button-inner-box MBLsheet-inline-block"
                style="user-select: none;">
                    <div class="MBLsheet-toolbar-menu-button-caption MBLsheet-inline-block"
                    style="user-select: none;">
                        <div class="MBLsheet-icon MBLsheet-inline-block " style="user-select: none;">
                            <div aria-hidden="true" class="MBLsheet-icon-img-container MBLsheet-icon-img MBLsheet-icon-rotation-none iconfont MBLsheet-iconfont-tupian"
                            style="user-select: none;">
                                <input id="MBLsheet-imgUpload" type="file" accept="image/*" style="display:none;"></input>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>`, // 'Insert picture'
    link: `<div class="MBLsheet-toolbar-button-split-left MBLsheet-toolbar-button MBLsheet-inline-block"
        data-tips="${toolbar.insertLink}" id="MBLsheet-insertLink-btn-title" role="button" style="user-select: none;">
            <div class="MBLsheet-toolbar-button-outer-box MBLsheet-inline-block"
            style="user-select: none;">
                <div class="MBLsheet-toolbar-menu-button-inner-box MBLsheet-inline-block"
                style="user-select: none;">
                    <div class="MBLsheet-toolbar-menu-button-caption MBLsheet-inline-block"
                    style="user-select: none;">
                        <div class="MBLsheet-icon MBLsheet-inline-block " style="user-select: none;">
                            <div aria-hidden="true" class="MBLsheet-icon-img-container MBLsheet-icon-img MBLsheet-icon-rotation-none iconfont MBLsheet-iconfont-lianjie"
                            style="user-select: none;">
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>`, // 'Insert link'(TODO)
    chart: `<div class="MBLsheet-toolbar-button-split-left MBLsheet-toolbar-button MBLsheet-inline-block"
        data-tips="${toolbar.chart}" id="MBLsheet-chart-btn-title" role="button" style="user-select: none;">
            <div class="MBLsheet-toolbar-button-outer-box MBLsheet-inline-block"
            style="user-select: none;">
                <div class="MBLsheet-toolbar-menu-button-inner-box MBLsheet-inline-block"
                style="user-select: none;">
                    <div class="MBLsheet-toolbar-menu-button-caption MBLsheet-inline-block"
                    style="user-select: none;">
                        <div class="MBLsheet-icon MBLsheet-inline-block " style="user-select: none;">
                            <div aria-hidden="true" class="MBLsheet-icon-img-container MBLsheet-icon-img MBLsheet-icon-rotation-none iconfont MBLsheet-iconfont-tubiao"
                            style="user-select: none;">
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>`, //'chart' (the icon is hidden, but if the chart plugin is configured, you can still create a new chart by right click)
    postil: `<div class="MBLsheet-toolbar-select MBLsheet-toolbar-menu-button MBLsheet-inline-block" data-tips="${toolbar.postil}"
        id="MBLsheet-icon-postil" role="button" style="user-select: none;">
            <div class="MBLsheet-toolbar-menu-button-outer-box MBLsheet-inline-block"
            style="user-select: none;">
                <div class="MBLsheet-toolbar-menu-button-inner-box MBLsheet-inline-block"
                style="user-select: none;">
                    <div class="MBLsheet-icon-img-container MBLsheet-toolbar-menu-button-caption MBLsheet-inline-block iconfont MBLsheet-iconfont-zhushi"
                    style="user-select: none;">
                    </div>
                    <div class="MBLsheet-toolbar-menu-button-dropdown MBLsheet-inline-block iconfont MBLsheet-iconfont-xiayige"
                    style="user-select: none;">
                    </div>
                </div>
            </div>
        </div>`, //'comment'
    pivotTable: `<div class="MBLsheet-toolbar-button-split-left MBLsheet-toolbar-button MBLsheet-inline-block"
        data-tips="${toolbar.pivotTable}" id="MBLsheet-pivot-btn-title" role="button" style="user-select: none;">
            <div class="MBLsheet-toolbar-button-outer-box MBLsheet-inline-block"
            style="user-select: none;">
                <div class="MBLsheet-toolbar-menu-button-inner-box MBLsheet-inline-block"
                style="user-select: none;">
                    <div class="MBLsheet-toolbar-menu-button-caption MBLsheet-inline-block"
                    style="user-select: none;">
                        <div class="MBLsheet-icon MBLsheet-inline-block " style="user-select: none;">
                            <div aria-hidden="true" class="MBLsheet-icon-img-container MBLsheet-icon-img MBLsheet-icon-rotation-none iconfont MBLsheet-iconfont-shujutoushi"
                            style="user-select: none;">
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>`, //'PivotTable'
    function: `<div class="MBLsheet-toolbar-button-split-left MBLsheet-toolbar-button MBLsheet-inline-block MBLsheet-icon-function"
        data-tips="${toolbar.autoSum}" id="MBLsheet-icon-function" role="button" style="user-select: none;">
            <div class="MBLsheet-toolbar-button-outer-box MBLsheet-inline-block"
            style="user-select: none;">
                <div class="MBLsheet-toolbar-button-inner-box MBLsheet-inline-block"
                style="user-select: none;">
                    <div class="MBLsheet-icon MBLsheet-inline-block " style="user-select: none;">
                        <div aria-hidden="true" class="MBLsheet-icon-img-container MBLsheet-icon-img MBLsheet-icon-function iconfont MBLsheet-iconfont-jisuan"
                        style="user-select: none;">
                        </div>
                    </div>
                    <div class="MBLsheet-toolbar-menu-button-caption MBLsheet-inline-block"
                    style="user-select: none;">
                        ${toolbar.sum}
                    </div>
                </div>
            </div>
        </div>
        <div class="MBLsheet-toolbar-button-split-right MBLsheet-toolbar-menu-button MBLsheet-inline-block"
        data-tips="${toolbar.moreFunction}..." id="MBLsheet-icon-function-menu" role="button" style="user-select: none;">
            <div class="MBLsheet-toolbar-menu-button-outer-box MBLsheet-inline-block"
            style="user-select: none;">
                <div class="MBLsheet-toolbar-menu-button-inner-box MBLsheet-inline-block"
                style="user-select: none;">
                    <div class="MBLsheet-toolbar-menu-button-dropdown MBLsheet-inline-block iconfont MBLsheet-iconfont-xiayige"
                    style="user-select: none;">
                    </div>
                </div>
            </div>
        </div>`, //'formula'
    frozenMode: `<div class="MBLsheet-toolbar-button-split-left MBLsheet-toolbar-button MBLsheet-inline-block MBLsheet-freezen-btn-horizontal"
        data-tips="${toolbar.freezeTopRow}" id="MBLsheet-freezen-btn-horizontal" role="button" style="user-select: none;">
            <div class="MBLsheet-toolbar-button-outer-box MBLsheet-inline-block"
            style="user-select: none;">
                <div class="MBLsheet-toolbar-menu-button-inner-box MBLsheet-inline-block"
                style="user-select: none;">

                    <div class="MBLsheet-toolbar-menu-button-caption MBLsheet-inline-block"
                    style="user-select: none;">
                        <div class="MBLsheet-icon MBLsheet-inline-block " style="user-select: none;">
                            <div aria-hidden="true" class="MBLsheet-icon-img-container MBLsheet-icon-img MBLsheet-icon-rotation-none iconfont MBLsheet-iconfont-dongjie1"
                            style="user-select: none;">
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
        <div class="MBLsheet-toolbar-button-split-right MBLsheet-toolbar-menu-button MBLsheet-inline-block"
        data-tips="${toolbar.moreOptions}..." id="MBLsheet-icon-freezen-menu" role="button" style="user-select: none;">
            <div class="MBLsheet-toolbar-menu-button-outer-box MBLsheet-inline-block"
            style="user-select: none;">
                <div class="MBLsheet-toolbar-menu-button-inner-box MBLsheet-inline-block"
                style="user-select: none;">
                    <div class="MBLsheet-toolbar-menu-button-dropdown MBLsheet-inline-block iconfont MBLsheet-iconfont-xiayige"
                    style="user-select: none;">
                    </div>
                </div>
            </div>
        </div>`, //'freeze mode'
    sortAndFilter: `<div class="MBLsheet-toolbar-select MBLsheet-toolbar-menu-button MBLsheet-inline-block" data-tips="${toolbar.sortAndFilter}"
        id="MBLsheet-icon-autofilter" role="button" style="user-select: none;">
            <div class="MBLsheet-toolbar-menu-button-outer-box MBLsheet-inline-block"
            style="user-select: none;">
                <div class="MBLsheet-toolbar-button-inner-box MBLsheet-inline-block"
                style="user-select: none;">
                    <div class="MBLsheet-icon MBLsheet-inline-block " style="user-select: none;">
                        <div aria-hidden="true" class="MBLsheet-icon-img-container MBLsheet-icon-img MBLsheet-icon-autofilter iconfont MBLsheet-iconfont-shaixuan"
                        style="user-select: none;">
                        </div>
                    </div>
                    <div class="MBLsheet-toolbar-menu-button-dropdown MBLsheet-inline-block iconfont MBLsheet-iconfont-xiayige"
                    style="user-select: none;margin-left: 0px;margin-right: 4px;">
                    </div>
                </div>
            </div>
        </div>`, //'Sort and filter'
    conditionalFormat: `<div class="MBLsheet-toolbar-select MBLsheet-toolbar-menu-button MBLsheet-inline-block" data-tips="${toolbar.conditionalFormat}"
        id="MBLsheet-icon-conditionformat" role="button" style="user-select: none;">
            <div class="MBLsheet-toolbar-menu-button-outer-box MBLsheet-inline-block"
            style="user-select: none;">
                <div class="MBLsheet-toolbar-menu-button-inner-box MBLsheet-inline-block"
                style="user-select: none;">

                    <div class="MBLsheet-icon MBLsheet-inline-block " style="user-select: none;">
                        <div aria-hidden="true" class="MBLsheet-icon-img-container MBLsheet-icon-img MBLsheet-icon-autofilter iconfont MBLsheet-iconfont-geshitiaojian"
                        style="user-select: none;">
                        </div>
                    </div>
                    <div class="MBLsheet-toolbar-menu-button-dropdown MBLsheet-inline-block iconfont MBLsheet-iconfont-xiayige"
                    style="user-select: none;">
                    </div>
                </div>
            </div>
        </div>`, //'Conditional Format'
    dataVerification: `<div class="MBLsheet-toolbar-button-split-left MBLsheet-toolbar-button MBLsheet-inline-block"
        data-tips="${toolbar.dataVerification}" id="MBLsheet-dataVerification-btn-title" role="button" style="user-select: none;">
            <div class="MBLsheet-toolbar-button-outer-box MBLsheet-inline-block"
            style="user-select: none;">
                <div class="MBLsheet-toolbar-menu-button-inner-box MBLsheet-inline-block"
                style="user-select: none;">
                    <div class="MBLsheet-toolbar-menu-button-caption MBLsheet-inline-block"
                    style="user-select: none;">
                        <div class="MBLsheet-icon MBLsheet-inline-block " style="user-select: none;">
                            <div aria-hidden="true" class="MBLsheet-icon-img-container MBLsheet-icon-img MBLsheet-icon-rotation-none iconfont MBLsheet-iconfont-shujuyanzheng"
                            style="user-select: none;">
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>`, // 'Data Verification'
    splitColumn: `<div class="MBLsheet-toolbar-button-split-left MBLsheet-toolbar-button MBLsheet-inline-block"
        data-tips="${toolbar.splitColumn}" id="MBLsheet-splitColumn-btn-title" role="button" style="user-select: none;">
            <div class="MBLsheet-toolbar-button-outer-box MBLsheet-inline-block"
            style="user-select: none;">
                <div class="MBLsheet-toolbar-menu-button-inner-box MBLsheet-inline-block"
                style="user-select: none;">
                    <div class="MBLsheet-toolbar-menu-button-caption MBLsheet-inline-block"
                    style="user-select: none;">
                        <div class="MBLsheet-icon MBLsheet-inline-block " style="user-select: none;">
                            <div aria-hidden="true" class="MBLsheet-icon-img-container MBLsheet-icon-img MBLsheet-icon-rotation-none iconfont MBLsheet-iconfont-wenbenfenge"
                            style="user-select: none;">
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>`, //'Split column'
    screenshot: `<div class="MBLsheet-toolbar-button-split-left MBLsheet-toolbar-button MBLsheet-inline-block"
        data-tips="${toolbar.screenshot}" id="MBLsheet-chart-btn-screenshot" role="button" style="user-select: none;">
            <div class="MBLsheet-toolbar-button-outer-box MBLsheet-inline-block"
            style="user-select: none;">
                <div class="MBLsheet-toolbar-menu-button-inner-box MBLsheet-inline-block"
                style="user-select: none;">
                    <div class="MBLsheet-toolbar-menu-button-caption MBLsheet-inline-block"
                    style="user-select: none;">
                        <div class="MBLsheet-icon MBLsheet-inline-block " style="user-select: none;">
                            <div aria-hidden="true" class="MBLsheet-icon-img-container MBLsheet-icon-img MBLsheet-icon-rotation-none iconfont MBLsheet-iconfont-jieping"
                            style="user-select: none;">
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>`, //'screenshot'
    findAndReplace: `<div class="MBLsheet-toolbar-select MBLsheet-toolbar-menu-button MBLsheet-inline-block" data-tips="${toolbar.findAndReplace}"
        id="MBLsheet-icon-seachmore" role="button" style="user-select: none;">
            <div class="MBLsheet-toolbar-menu-button-outer-box MBLsheet-inline-block"
            style="user-select: none;">
                <div class="MBLsheet-toolbar-button-inner-box MBLsheet-inline-block"
                style="user-select: none;">

                    <div class="MBLsheet-icon MBLsheet-inline-block " style="user-select: none;">
                        <div aria-hidden="true" class="MBLsheet-icon-img-container MBLsheet-icon-img MBLsheet-icon-autofilter iconfont MBLsheet-iconfont-sousuo"
                        style="user-select: none;">
                        </div>
                    </div>
                    <div class="MBLsheet-toolbar-menu-button-dropdown MBLsheet-inline-block iconfont MBLsheet-iconfont-xiayige"
                    style="user-select: none;margin-left: 0px;margin-right: 4px;">
                    </div>
                </div>
            </div>
        </div>`, //'Find and Replace'
    protection: `<div class="MBLsheet-toolbar-button-split-left MBLsheet-toolbar-button MBLsheet-inline-block"
        data-tips="${toolbar.protection}" id="MBLsheet-icon-protection" role="button" style="user-select: none;">
            <div class="MBLsheet-toolbar-button-outer-box MBLsheet-inline-block"
            style="user-select: none;">
                <div class="MBLsheet-toolbar-menu-button-inner-box MBLsheet-inline-block"
                style="user-select: none;">
                    <div class="MBLsheet-toolbar-menu-button-caption MBLsheet-inline-block"
                    style="user-select: none;">
                        <div class="MBLsheet-icon MBLsheet-inline-block " style="user-select: none;">
                            <div aria-hidden="true" class="MBLsheet-icon-img-container MBLsheet-icon-img MBLsheet-icon-rotation-none iconfont MBLsheet-iconfont-biaogesuoding"
                            style="user-select: none;">
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>`, // 'Worksheet protection'
    print: `<div class="MBLsheet-toolbar-select MBLsheet-toolbar-menu-button MBLsheet-inline-block" data-tips="${toolbar.print}"
        id="MBLsheet-icon-print" role="button" style="user-select: none;">
            <div class="MBLsheet-toolbar-menu-button-outer-box MBLsheet-inline-block"
            style="user-select: none;">
                <div class="MBLsheet-toolbar-button-inner-box MBLsheet-inline-block"
                style="user-select: none;">

                    <div class="MBLsheet-icon MBLsheet-inline-block " style="user-select: none;">
                        <div aria-hidden="true" class="MBLsheet-icon-img-container MBLsheet-icon-img MBLsheet-icon-autofilter iconfont MBLsheet-iconfont-dayin"
                        style="user-select: none;">
                        </div>
                    </div>
                    <div class="MBLsheet-toolbar-menu-button-dropdown MBLsheet-inline-block iconfont MBLsheet-iconfont-xiayige"
                    style="user-select: none;margin-left: 0px;margin-right: 4px;">
                    </div>
                </div>
            </div>
        </div>`, // 'print'
  };

  const showtoolbar = MBLsheetConfigsetting.showtoolbar;
  const showtoolbarConfig = MBLsheetConfigsetting.showtoolbarConfig;

  const buttonHTML = ['<div class="MBLsheet-toolbar-left-theme"></div>'];

  // 数组形式直接生成
  if (getObjType(showtoolbarConfig) === "array") {
    // 此时不根据 showtoolbar=false，showtoolbarConfig为某几个进行适配，此时showtoolbarConfig本身就是全部要显示的按钮
    if (!showtoolbar) {
      return "";
    }
    let i = 0;
    showtoolbarConfig.forEach(function (key, i) {
      if (key === "|") {
        const nameKeys = showtoolbarConfig[i - 1];
        if (nameKeys !== "|") {
          buttonHTML.push(
            `<div id="toolbar-separator-${camel2split(
              nameKeys
            )}" class="MBLsheet-toolbar-separator MBLsheet-inline-block" style="user-select: none;"></div>`
          );
        }
      } else {
        buttonHTML.push(htmlMap[key]);
      }
    });
    return buttonHTML.join("");
  }

  const config = defaultToolbar.reduce(function (total, curr) {
    if (curr !== "|") {
      total[curr] = true;
    }
    return total;
  }, {});

  if (!showtoolbar) {
    for (let s in config) {
      config[s] = false;
    }
  }

  // 对象模式 则从里面挑选 true 保留 false 删掉
  if (JSON.stringify(showtoolbarConfig) !== "{}") {
    if (showtoolbarConfig.hasOwnProperty("undoRedo")) {
      config.undo = config.redo = showtoolbarConfig.undoRedo;
    }
    Object.assign(config, showtoolbarConfig);
  }
  for (let i = 0; i < defaultToolbar.length; i++) {
    let key = defaultToolbar[i];
    if (!config[key] && key !== "|") {
      // 如果当前元素隐藏 按照之前的规则 后面紧跟的 | 分割也不需要显示了
      if (defaultToolbar[i + 1] === "|") {
        i++;
      }
      continue;
    }
    if (key === "|") {
      const nameKeys = defaultToolbar[i - 1];
      if (nameKeys !== "|") {
        buttonHTML.push(
          `<div id="toolbar-separator-${camel2split(
            nameKeys
          )}" class="MBLsheet-toolbar-separator MBLsheet-inline-block" style="user-select: none;"></div>`
        );
      }
    } else {
      buttonHTML.push(htmlMap[key]);
    }
  }
  return buttonHTML.join("");
}
