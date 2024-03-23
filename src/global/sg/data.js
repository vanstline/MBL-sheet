import { transToCellData, transToCellDataV2 } from "../api";
import { fieldsMap, lengthMap, lengthVerArr, contentMap } from "./type";

function initDataSource(dataSource, sheet, MBLsheet) {
  const { columns } = sheet;
  const cMap = {};
  columns.forEach(({ dataIndex }, i) => {
    cMap[dataIndex] = i;
  });

  const fillArr = Array.from({ length: sheet.row })?.map((_, i) => {
    return dataSource[i] || {};
  });

  initVerification(fillArr, sheet, MBLsheet);

  const curData = fillArr.map((item, r) => {
    return columns.map((sub) => {
      var v = item[sub.dataIndex];
      if (sub.render && typeof sub.render === "function") {
        v = sub.render(item[sub.dataIndex], sub, r);
      }

      if (lengthVerArr.includes(sub?.fieldsMap?.type)) {
        sub.ct = {
          fa: "0",
          t: "n",
        };
      }
      return { ...sub, v, ct: sub.ct };
    });
  });

  const finallyData = transToCellDataV2(curData);
  sheet.celldata = finallyData;
}

function initVerification(data, sheet, MBLsheet) {
  const { columns } = sheet;
  const curVerifyMap = {};

  for (let i = 0; i < data.length; i++) {
    for (let j = 0; j < columns.length; j++) {
      if (typeof columns?.[j]?.fieldsProps === "object") {
        const { type, options, status, verifyText, compareInfo } =
          columns[j].fieldsProps;
        const { sign, range, value } = compareInfo ?? {};
        var curVerifyInfo = {
          type: fieldsMap[type],
          hintShow: !!status,
          hintText: verifyText,
        };

        if (type === "select") {
          curVerifyInfo.value1 = options?.join(",");
        } else if (lengthVerArr.includes(type) && range != null) {
          const [v1, v2] = range || [];
          curVerifyInfo.type2 = lengthMap[sign];
          curVerifyInfo.value1 = v1;
          curVerifyInfo.value2 = v2;
        } else if (type === "textarea") {
          curVerifyInfo.type2 = contentMap[sign];
          curVerifyInfo.value1 = value;
        }

        curVerifyMap[`${i}_${j}`] = curVerifyInfo;
      }
    }
  }
  sheet.dataVerification = curVerifyMap;
  // console.log("%c Line:41 🍔 sheet", "color:#e41a6a", sheet);
}

export { initDataSource, initVerification };
