var excelDataSource = [
  {
    createDate: "2024-04-09 08:35:26.0",
    cxPrimerCartId: 1731596,
    cxPrimerCartInfo: [
      {
        baseNumber: 0,
        concentration: "",
        createDate: "2024-04-09 08:35:26.0",
        cxPrimerCode: "U1011203",
        cxPrimerId: 2253,
        endDate: null,
        id: 1731596,
        ids: null,
        isOldPrimer: 1,
        mark: null,
        name: "H15915",
        page: 1,
        primerTypeIds: null,
        reverseSequence: "",
        rows: 20,
        sequence: "CTCCGATCTCCGGATTACAAGAC",
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
    cxSampleCartId: 8684441,
    cxSampleCartInfo: {
      carrierId: 0,
      carrierName: "",
      createDate: "2024-04-09 08:35:26.0",
      cxSampleCode: "",
      cxSampleId: 0,
      endDate: null,
      id: 8684441,
      ids: null,
      isOldSample: 0,
      mark: null,
      maxFragmentLength: "",
      minFragmentLength: "",
      name: "1",
      note: "",
      page: 1,
      resistance: "",
      rows: 20,
      sampleSequence: "",
      sampleTypeId: 4,
      sampleTypeIds: null,
      sampleTypeName: "菌株",
      startDate: null,
      status: 0,
      updateMark: null,
      userId: 375760,
      userInfo: null,
    },
    endDate: null,
    id: 22956518,
    ids: null,
    mark: null,
    page: 1,
    rows: 20,
    seqMark: "",
    seqText: "单向",
    sequenceMethod: 0,
    sequenceQuest: 1,
    sort: 1,
    startDate: null,
    status: 0,
    updateMark: null,
    userId: 375760,
    userInfo: null,
  },
];

// 本地开发
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
      verifyFn: function (text, r) {
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

        return {
          status,
          message,
        };
        //
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
      //   //
      //   const d = {
      //     status: row?.sampleName !== "123123",
      //     message: `当前值为${text}，不符合规则`,
      //   };
      //
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
    placeholder: "我是占位符",
    fieldsProps: {
      required: true,
      type: "select",
      options: ["PCR未纯化", "PCR已纯化", "菌株", "质粒"],
    },
    onchange: (text, record, i, { setRowData }) => {
      console.log(
        "%c Line:282 🍐 text, record",
        "color:#465975",
        text,
        record,
        i
        // setRowData
      );
    },
    // render: (text, record, index) => {
    //   return record?.cxSampleCartInfo?.sampleTypeName;
    // },
  },
  {
    title: "操作",
    width: 100,
    render: () => "删除",
    extra: {
      style: {
        width: 100,
        left: 32,
        background: "#fff",
        color: "#4096ff",
      },
      onclick: (text, data, index) => {
        MBLsheet.delRow(index);
      },
    },
  },
  {
    title: "操作",
    width: 100,
    render: () => "删除",
    extra: {
      style: {
        width: 100,
        left: 32,
        background: "#fff",
        color: "#4096ff",
      },
      onclick: (text, data, index) => {
        MBLsheet.delRow(index, 1);
      },
    },
  },
  {
    title: "操作",
    width: 100,
    render: () => "删除",
    extra: {
      style: {
        width: 100,
        left: 32,
        background: "#fff",
        color: "#4096ff",
      },
      onclick: (text, data, index) => {
        MBLsheet.delRow(index, 1);
      },
    },
  },
];

// 调试使用
// var columns = [
//   {
//     dataIndex: "sampleName",

//     title: "样品名称",

//     fieldsProps: {
//       type: "text",

//       required: true,
//     },

//     extra: {
//       style: {
//         width: 30,

//         height: 30,

//         background: "pink",
//       },
//     },
//   },

//   {
//     dataIndex: "sampleTypeName",

//     title: "样本类型",

//     fieldsProps: {
//       type: "select",

//       required: true,

//       options: ["PCR未纯化", "PCR已纯化", "菌株", "质粒"],
//     },
//   },

//   {
//     dataIndex: "resistance",

//     title: "抗性",

//     fieldsProps: {
//       type: "autocomplete",

//       options: ["Kan", "Amp"],
//     },
//   },

//   {
//     dataIndex: "carrierName",

//     title: "载体",

//     fieldsProps: {
//       type: "autocomplete",

//       options: [
//         "PMD18-T",

//         "PMD19-T",

//         "PMD20-T",

//         "PET28",

//         "PET30",

//         "PET22a",

//         "PET22b",

//         "PET22c",

//         "PET15",

//         "PET32a",

//         "PET32b",

//         "PET32c",

//         "PET39",

//         "PET42a",

//         "PET42b",

//         "PET42c",

//         "PET44",

//         "PET50",

//         "PGEX4T-1",

//         "PGEX4T-2",

//         "PGEX4T-3",

//         "PGEX6P-1",

//         "PGEX6P-2",

//         "PGEX6P-3",

//         "PGEX5P-1",

//         "PGEX5P-2",

//         "PGEX5P-3",

//         "PCDNA3",

//         "PCDNA3.1",

//         "PCDNA4.0",

//         "PCDNA6/V5-His A",

//         "PCMV-SPORT2",

//         "PCMV-SPORT4",

//         "PCMV-SPORT1",

//         "PCMV6",

//         "PCMV6-entry",

//         "PCMV6-XL4",

//         "PCMV6-XL5",

//         "PCMV-Tag3C",

//         "PCMV-Tag3A",

//         "PCMV-Tag2B",

//         "PCMV-Tag2A",

//         "PCMV6-XL3",

//         "PCMV-MYC",

//         "PCMV-HA",

//         "PEGFP-N1",

//         "PEGFP-N2",

//         "PEGFP-N3",

//         "PECFP-N1",

//         "PECFP-N2",

//         "PECFP-N3",

//         "PEYFP-N1",

//         "PEYFP-N2",

//         "PEYFP-N3",

//         "PEGFP-C1",

//         "PEGFP-C2",

//         "PEGFP-C3",

//         "PECFP-C1",

//         "PECFP-C2",

//         "PECFP-C3",

//         "PEYFP-C1",

//         "PEYFP-C2",

//         "PEYFP-C3",

//         "PEASY-E1",

//         "PEASY-E2",

//         "PEASY-E3",

//         "PUC18",

//         "PUC19",

//         "PUC8",

//         "PUC9",

//         "PUC57",

//         "PGM-T",

//         "PGEM-T",

//         "PGEM-Teasy",

//         "PCR2.1",

//         "PCR4",

//         "PCR3.1",

//         "PENTR",

//         "PENTR221",

//         "PENTR-U6",

//         "TOPO",

//         "BLUNT",

//         "TEASY-BLUNT",

//         "PDNR-LIB",

//         "PDNR-CMV",

//         "PQE30",

//         "PQE40",

//         "PQE2",

//         "PGADT7",

//         "PGAD424",

//         "PGBKT7",

//         "pMAL-c2E",

//         "pMAL-p2X",

//         "pMAL-C2x",

//         "pBlueScript SK(+)",

//         "pBluescript II SK(+)",

//         "pBluescript II KS(-)",

//         "pBlue",

//         "pCDNA5.0",

//         "ppp1",

//         "ASIA2",

//         "ASIA001",
//       ],
//     },
//   },

//   {
//     dataIndex: "minFragmentLength",

//     title: "最小长度",

//     fieldsProps: {
//       type: "number",

//       compareInfo: {
//         sign: "in",

//         range: [
//           0,

//           999999,
//         ],
//       },
//     },
//   },

//   {
//     dataIndex: "maxFragmentLength",

//     title: "最大长度",

//     fieldsProps: {
//       type: "number",

//       compareInfo: {
//         sign: "in",

//         range: [
//           0,

//           999999,
//         ],
//       },
//     },
//   },

//   {
//     dataIndex: "seqMark",

//     title: "样品备注",

//     fieldsProps: {
//       type: "select",

//       options: [
//         "GC Rich",

//         "复杂结构",

//         "重复序列",

//         "低拷贝",

//         "病毒DNA",

//         "噬菌体质粒",
//       ],
//     },
//   },

//   {
//     dataIndex: "seqText",

//     title: "要求",

//     fieldsProps: {
//       type: "select",

//       options: ["单向", "测通", "双向", "多向"],
//     },
//   },

//   {
//     dataIndex: "primerName",

//     title: "引物名称",

//     fieldsProps: {
//       required: true,
//     },

//     extra: {
//       style: {
//         width: 30,

//         height: 30,

//         background: "pink",
//       },
//     },
//   },

//   {
//     dataIndex: "options",

//     title: "操作",

//     extra: {
//       style: {
//         width: 30,

//         height: 30,

//         background: "pink",
//       },
//     },
//   },
// ];
