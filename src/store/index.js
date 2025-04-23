const Store = {
  container: null,
  loadingObj: {},
  loadingObj2: {},
  MBLsheetfile: null,
  defaultcolumnNum: 60,
  defaultrowNum: 84,
  fullscreenmode: true,
  devicePixelRatio: 1,

  currentSheetIndex: 0,
  calculateSheetIndex: 0,
  flowdata: [],
  config: {},

  visibledatarow: [],
  visibledatacolumn: [],
  cloumnLenSum: [],
  cloumnLens: [],
  ch_width: 0,
  rh_height: 0,

  cellmainWidth: 0,
  cellmainHeight: 0,
  toolbarHeight: 0,
  infobarHeight: 0,
  calculatebarHeight: 0,
  rowHeaderWidth: 46,
  columnHeaderHeight: 20,
  iconMap: {},
  columnHeaderBackgroundColor: "#ffffff",
  cellMainSrollBarSize: 12,
  sheetBarHeight: 31,
  statisticBarHeight: 23,
  MBLsheetTableContentHW: [0, 0],

  defaultcollen: 73,
  defaultrowlen: 19,

  jfcountfuncTimeout: null,
  jfautoscrollTimeout: null,

  MBLsheet_select_status: false,
  MBLsheet_select_save: [{ row: [0, 0], column: [0, 0] }],
  MBLsheet_selection_range: [],

  MBLsheet_copy_save: {}, //复制粘贴
  MBLsheet_paste_iscut: false,

  filterchage: true, //筛选
  MBLsheet_filter_save: { row: [], column: [] },

  MBLsheet_sheet_move_status: false,
  MBLsheet_sheet_move_data: [],
  MBLsheet_scroll_status: false,

  MBLsheetisrefreshdetail: true,
  MBLsheetisrefreshtheme: true,
  MBLsheetcurrentisPivotTable: false,

  MBLsheet_rows_selected_status: false, //行列标题相关参
  MBLsheet_cols_selected_status: false,
  MBLsheet_rows_change_size: false,
  MBLsheet_rows_change_size_start: [],
  MBLsheet_cols_change_size: false,
  MBLsheet_cols_change_size_start: [],
  MBLsheet_cols_dbclick_timeout: null,
  MBLsheet_cols_dbclick_times: 0,

  MBLsheetCellUpdate: [],

  MBLsheet_shiftpositon: null,

  iscopyself: true,

  orderbyindex: 0, //排序下标

  MBLsheet_model_move_state: false, //模态框拖动
  MBLsheet_model_xy: [0, 0],
  MBLsheet_model_move_obj: null,

  MBLsheet_cell_selected_move: false, //选区拖动替换
  MBLsheet_cell_selected_move_index: [],

  MBLsheet_cell_selected_extend: false, //选区下拉
  MBLsheet_cell_selected_extend_index: [],
  MBLsheet_cell_selected_extend_time: null,

  clearjfundo: true,
  jfundo: [],
  jfredo: [],
  lang: "en", //language
  createChart: "",
  highlightChart: "",
  zIndex: 15,
  chartparam: {
    MBLsheetCurrentChart: null, //current chart_id
    MBLsheetCurrentChartActive: false,
    MBLsheetCurrentChartMove: null, // Debounce state
    MBLsheetCurrentChartMoveTimeout: null, //拖动图表框的节流定时器
    MBLsheetCurrentChartMoveObj: null, //chart DOM object
    MBLsheetCurrentChartMoveXy: null, //上一次操作结束的图表信息，x,y: chart框位置，scrollLeft1,scrollTop1: 滚动条位置
    MBLsheetCurrentChartMoveWinH: null, //左右滚动条滑动距离
    MBLsheetCurrentChartMoveWinW: null, //上下滚动条滑动距离
    MBLsheetCurrentChartResize: null,
    MBLsheetCurrentChartResizeObj: null,
    MBLsheetCurrentChartResizeXy: null,
    MBLsheetCurrentChartResizeWinH: null,
    MBLsheetCurrentChartResizeWinW: null,
    MBLsheetInsertChartTosheetChange: true, // 正在执行撤销
    MBLsheetCurrentChartZIndexRank: 100,
    MBLsheet_chart_redo_click: false, //撤销重做时标识
    MBLsheetCurrentChartMaxState: false, //图表全屏状态
    jfrefreshchartall: "",
    changeChartCellData: "",
    renderChart: "",
    getChartJson: "",
  },
  functionList: null, //function list explanation
  MBLsheet_function: null,
  chart_selection: {},
  currentChart: "",
  scrollRefreshSwitch: true,

  measureTextCache: {},
  measureTextCellInfoCache: {},
  measureTextCacheTimeOut: null,
  cellOverflowMapCache: {},

  zoomRatio: 1,

  visibledatacolumn_unique: null,
  visibledatarow_unique: null,

  showGridLines: true,

  toobarObject: {}, //toolbar constant
  inlineStringEditCache: null,
  inlineStringEditRange: null,

  fontList: [],
  defaultFontSize: 10,

  currentSheetView: "viewNormal",

  // cooperative editing
  cooperativeEdit: {
    usernameTimeout: {},
    changeCollaborationSize: [], //改变行高或者列宽时，协同提示框需要跟随改变所需数据
    allDataColumnlen: [], //列宽发生过改变的列
    merge_range: {}, //合并时单元格信息
    checkoutData: [], //切换表格页时所需数据
  },

  // Resources that currently need to be loaded asynchronously, especially plugins. 'Core' marks the core rendering process.
  asyncLoad: ["core"],
  // 默认单元格
  defaultCell: {
    bg: null,
    bl: 0,
    ct: { fa: "General", t: "n" },
    fc: "rgb(51, 51, 51)",
    ff: 0,
    fs: 11,
    ht: 1,
    it: 0,
    vt: 1,
    m: "",
    v: "",
  },

  // 验证数据集合
  verifyMap: {},
  // 自定义注册事件
  customEvents: {},
  // 自定义是否编辑状态
  isEdit: false,

  // 校验标记 {mark: boolean, status: boolean, msg: string}[][] | null
  // mark: 标记是否校验过，status: 校验状态，msg: 校验提示信息
  // 校验标记数组，每个元素为一个数组，数组中每个元素为一个对象，对象中包含 mark, status, msg 三个属性
  // 每个元素为一个数组，数组中每个元素为一个对象，对象中包含 mark, status, msg 三个属性
  checkMark: [],
};

export default Store;
