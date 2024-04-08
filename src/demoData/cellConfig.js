var excelDataSource = [
    // {
    //   createDate: "2024-03-25 19:44:36.0",
    //   cxPrimerCartId: 1731287,
    //   cxPrimerCartInfo: [
    //     {
    //       baseNumber: 0,
    //       concentration: "",
    //       createDate: "2024-03-25 19:44:36.0",
    //       cxPrimerCode: "U1011200",
    //       cxPrimerId: 2250,
    //       endDate: null,
    //       id: 1731287,
    //       ids: null,
    //       isOldPrimer: 1,
    //       mark: null,
    //       name: "ITS3",
    //       page: 1,
    //       primerTypeIds: null,
    //       reverseSequence: "",
    //       rows: 20,
    //       sequence: "GCATCGATGAAGAACGCAGC",
    //       startDate: null,
    //       status: 0,
    //       targetLength: 0,
    //       type: 1,
    //       typeName: "通用",
    //       updateMark: null,
    //       userId: 375760,
    //       userInfo: null,
    //     },
    //   ],
    //   cxPrimerCartList: [],
    //   cxSampleCartId: 8684104,
    //   cxSampleCartInfo: [
    //     {
    //       carrierId: 0,
    //       carrierName: "1212",
    //       createDate: "2024-03-25 19:44:36.0",
    //       cxSampleCode: "31224032500002",
    //       cxSampleId: 32208228,
    //       endDate: null,
    //       id: 8684104,
    //       ids: null,
    //       isOldSample: 1,
    //       mark: null,
    //       maxFragmentLength: "23",
    //       minFragmentLength: "12",
    //       name: "qwer",
    //       note: "",
    //       page: 1,
    //       resistance: "12",
    //       rows: 20,
    //       sampleSequence: "",
    //       sampleTypeId: 1,
    //       sampleTypeIds: null,
    //       sampleTypeName: "PCR产物(已纯化)",
    //       startDate: null,
    //       status: 0,
    //       updateMark: null,
    //       userId: 375760,
    //       userInfo: null,
    //     },
    //   ],
    //   endDate: null,
    //   id: 22955773,
    //   ids: null,
    //   mark: null,
    //   page: 1,
    //   rows: 20,
    //   seqMark: "噬菌体质粒",
    //   seqText: "单向",
    //   sequenceMethod: 0,
    //   sequenceQuest: 1,
    //   sort: 1,
    //   startDate: null,
    //   status: 0,
    //   updateMark: null,
    //   userId: 375760,
    //   userInfo: null,
    // },
    {
        createDate: "2024-03-25 19:44:36.0",
        cxPrimerCartId: 1731287,
        cxPrimerCartInfo: [
        {
            baseNumber: 0,
            concentration: "",
            createDate: "2024-03-25 19:44:36.0",
            cxPrimerCode: "U1011200",
            cxPrimerId: 2250,
            endDate: null,
            id: 1731287,
            ids: null,
            isOldPrimer: 1,
            mark: null,
            name: "ITS3",
            page: 1,
            primerTypeIds: null,
            reverseSequence: "",
            rows: 20,
            sequence: "GCATCGATGAAGAACGCAGC",
            startDate: null,
            status: 0,
            targetLength: 0,
            type: 1,
            typeName: "通用",
            updateMark: null,
            userId: 375760,
            userInfo: null,
        },
        ],
        cxPrimerCartList: [],
        cxSampleCartId: 8684105,
        cxSampleCartInfo: {
        carrierId: 0,
        carrierName: "123",
        createDate: "2024-03-25 19:44:36.0",
        cxSampleCode: "31224032500001",
        cxSampleId: 32208227,
        endDate: null,
        id: 8684105,
        ids: null,
        isOldSample: 1,
        mark: null,
        maxFragmentLength: "34",
        minFragmentLength: "12",
        name: "12312312",
        note: "",
        page: 1,
        resistance: "123",
        rows: 20,
        sampleSequence: "",
        sampleTypeId: 1,
        sampleTypeIds: null,
        sampleTypeName: "菌株",
        startDate: null,
        status: 0,
        updateMark: null,
        userId: 375760,
        userInfo: null,
        },
        endDate: null,
        id: 22955774,
        ids: null,
        mark: null,
        page: 1,
        rows: 20,
        seqMark: "",
        seqText: "单向",
        sequenceMethod: 0,
        sequenceQuest: 1,
        sort: 2,
        startDate: null,
        status: 0,
        updateMark: null,
        userId: 375760,
        userInfo: null,
    },
];
var columns = [
  {
    dataIndex: "sampleName",
    width: 100,
    title: "样本名称11",
    fieldsProps: {
      required: true,
      type: "text",
      range: [-1, 999999],
      influence: ["sampleTypeId"],
      verifyFn: function (text) {
        var status = false;
        var message = "";
        if (text == "1") {
          status = false;
          message = "请输入样品名称";
        } else {
          if (!/^(\w|#|\(|\)|\.|\-|\+)+$/.test(text)) {
            status = false;
            message =
              "样品名称不合法（规则：A-Z、a-z、0-9、#、.、()、-、+,限制长度22个字符）";
          } else {
            status = true;
            message = "";
          }
        }

        console.log("%c Line:270 🍢", "color:#ed9ec7", text, status, message);

        return {
          status,
          message,
        };
        // console.log("%c Line:458 🥃 text", "color:#93c0a4", text);
        // return {
        //   status: text === "123123",
        //   message: `当前值为${text}，不符合规则`,
        // };
      },
    },
    extra: {
      style: {
        width: 30,
        // background: "red",
      },
      onclick: (text, data, index) => {
        console.log(
          "%c Line:409 🧀 text, index   jjljl",
          "color:#7f2b82",
          text,
          data,
          index
        );
      },
    },
    render: (text, record, index) => {
      return record.cxSampleCartInfo?.name;
    },
    onchange: (text, record, i, { setRowData }) => {
      console.log(
        "%c Line:282 🍐 text, record",
        "color:#465975",
        text,
        record,
        i,
        setRowData
      );
      setRowData({
        sampleName: text,
        sampleTypeId: text,
      });
    },
  },
  {
    // dataIndex: "sampleTypeName",
    // title: "样本类型",
    // fieldsProps: {
    //   type: "select",
    //   type2: "multi",
    //   defaultValue: "PCR已纯化-Value",
    //   options: [
    //     // "PCR已纯化", "PCR未纯化", "菌株", "质粒"
    //     { label: "PCR已纯化111", value: "PCR已纯化-Value" },
    //     { label: "PCR未纯化", value: "PCR未纯化-Value" },
    //     { label: "菌株", value: "菌株-Value" },
    //     { label: "质粒", value: "质粒-Value" },
    //   ],
    // },
    // render: (text, record, index) => {
    //   return record.cxSampleCartInfo?.sampleTypeName;
    // },
    dataIndex: "sampleTypeId",
    title: "样本类型",
    width: 200,
    fieldsProps: {
      // defaultValue: '菌株',
      type: "select",
      // type2: "multi",
      options: ["PCR已纯化", "PCR未纯化", "菌株", "质粒"],
      // options: [
      //   { label: "菌株", value: "4" },
      //   { label: "PCR产物(已纯化)", value: 1 },
      // ],
      // verifyFn(text, row) {
      //   console.log(
      //     "%c Line:352 🍫 text, row",
      //     "color:#ffdd4d",
      //     text,
      //     row
      //   );
      //   // console.log("%c Line:458 🥃 text", "color:#93c0a4", text);
      //   const d = {
      //     status: row?.sampleName !== "123123",
      //     message: `当前值为${text}，不符合规则`,
      //   };
      //   console.log("%c Line:365 🥪 d", "color:#93c0a4", d);
      //   return d;
      // },
    },
    render: (text, record, index) => {
      return record?.cxSampleCartInfo?.sampleTypeId;
    },
    onchange: (text, record, i, config) => {
      // console.log(
      //   "%c Line:318 🌮 text, record, i, config",
      //   "color:#e41a6a",
      //   text,
      //   record,
      //   i,
      //   config
      // );
    },
  },
  {
    dataIndex: "sampleTypeNamed",
    title: "样本类型",
    width: 300,
    fieldsProps: {
      required: true,
      type: "select",
      options: ["PCR未纯化", "PCR已纯化", "菌株", "质粒"],
    },
    // render: (text, record, index) => {
    //   return record?.cxSampleCartInfo?.sampleTypeName;
    // },
  },
  // {
  //   dataIndex: "resistance",
  //   title: "抗性",
  //   fieldsProps: {
  //     type: "autocomplete",
  //     type2: "multi",
  //     // type: "select",
  //     // type2: "select",
  //     options: ["Kan", "Amp"],
  //   },
  //   render: (text, record, index) => {
  //     return record.cxSampleCartInfo?.resistance;
  //   },
  // },
  // {
  //   dataIndex: "carrierName",
  //   title: "载体",
  //   render: (text, record, index) => {
  //     return record.cxSampleCartInfo?.carrierName;
  //   },
  // },
  // {
  //   dataIndex: "minFragmentLength",

  //   title: "最小长度",

  //   fieldsProps: {
  //     type: "text",

  //     compareInfo: {
  //       sign: "in", // 比较符

  //       range: [0, 999999],
  //     },
  //   },

  //   render: (text, record, index) => {
  //     return record.cxSampleCartInfo?.minFragmentLength;
  //   },
  // },

  // {
  //   dataIndex: "maxFragmentLength",

  //   title: "最大长度",

  //   fieldsProps: {
  //     type: "text",

  //     compareInfo: {
  //       sign: "in", // 比较符

  //       range: [0, 999999],
  //     },
  //   },

  //   render: (text, record, index) => {
  //     return record.cxSampleCartInfo?.maxFragmentLength;
  //   },
  // },

  // {
  //   dataIndex: "sampleConcentration",

  //   title: "样品备注",

  //   fieldsProps: {
  //     type: "select",

  //     options: [
  //       "GC Rich",
  //       "复杂结构",
  //       "重复序列",
  //       "低拷贝",
  //       "病毒DNA",
  //       "噬菌体质粒",
  //     ],
  //   },
  // },

  // {
  //   dataIndex: "sampleConcentration",

  //   title: "要求",

  //   fieldsProps: {
  //     type: "select",

  //     options: ["单向", "测通", "双向", "多向"],
  //   },

  //   render: (text, record, index) => {
  //     return record.seqText;
  //   },
  // },

  // {
  //   dataIndex: "primerTypeName",

  //   title: "引物类型",

  //   fieldsProps: {
  //     type: "select",

  //     options: ["通用", "自带", "合成", "暂存引物"],
  //   },

  //   render: (text, record, index) => {
  //     return record.cxPrimerCartInfo?.[0]?.typeName;
  //   },
  // },

  // {
  //   dataIndex: "primerName",

  //   title: "引物名称",

  //   // render: (text, record, index) => {
  //   //   return record.cxPrimerCartInfo?.[0]?.name;
  //   // },
  // },

  // {
  //   dataIndex: "options",
  //   title: "操作",
  //   fieldsProps: {
  //     // defaultValue: "菌株",

  //     verifyFn(text) {
  //       // console.log("%c Line:458 🥃 text", "color:#93c0a4", text);
  //       return {
  //         status: text === "123123",
  //         message: `当前值为${text}，不符合规则`,
  //       };
  //     },
  //   },
  //   onchange: (text, record, i, { setRowData }) => {
  //     setRowData({
  //       sampleName: text * 2,
  //       sampleTypeId: text,
  //       options: text,
  //     });
  //   },
  //   render: () => "删除",
  //   extra: {
  //     style: {
  //       width: 100,
  //       background: "red",
  //     },
  //     onclick: (text, data, index) => {
  //       console.log(
  //         "%c Line:409 🧀 text, index   jjljl",
  //         "color:#7f2b82",
  //         text,
  //         data,
  //         index
  //       );
  //       MBLsheet.deleteRow(index, 1);
  //     },
  //   },
  // },
];


console.log("%c Line:162 🍬 columns", "color:#465975", columns);