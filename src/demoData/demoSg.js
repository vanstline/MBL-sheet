window.sgCell = {
  name: "一代测序111111",
  row: 100,
  column: 15,
  defaultColWidth: 150,
  defaultRowHeight: 40,
  celldata: [
    {
      r: 0,
      c: 0,
      v: {
        ct: { fa: "General", t: "g" },
        m: "value1",
        v: "value1",
      },
    },
    {
      r: 0,
      c: 1,
      v: {
        ct: { fa: "General", t: "g" },
        m: "value2",
        v: "value2",
      },
    },
  ],
  config: {
    merge: {
      "6_5": {
        r: 6,
        c: 5,
        rs: 2,
        cs: 2,
      },
    },
    rowlen: {
      0: 30,
      1: 30,
    },
    columnlen: {
      0: 100,
      1: 100,
    },
    borderInfo: [
      {
        rangeType: "cell",
        value: {
          row_index: 3,
          col_index: 3,
          l: {
            style: 7,
            color: "#FF0000",
          },
          r: {
            style: 7,
            color: "#FF0000",
          },
          t: {
            style: 7,
            color: "#FF0000",
          },
          b: {
            style: 7,
            color: "#FF0000",
          },
        },
      },
      {
        rangeType: "range",
        borderType: "border-all",
        style: 7,
        color: "#ff0000",
        range: [
          {
            row: [6, 7],
            column: [5, 6],
          },
        ],
      },
    ],

    scrollLeft: 0,
    scrollTop: 0,

    // frozen: [
    //   {
    //     type: "rangeColumn",
    //     range: { c },
    //   },
    // ],
  },
  frozen: {
    type: "rangeColumn",
    range: { row_focus: 1, column_focus: 5 },
  },
};
// export default sheetCell
