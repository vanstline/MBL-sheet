import Store from "../../store";
import { transToCellData, transToCellDataV2 } from "../api";
import {
  fieldsMap,
  lengthMap,
  lengthVerArr,
  contentMap,
  AUTOCOMPLETE,
} from "./type";

function initDataSource(dataSource, sheet, MBLsheet) {
  const newCellData = processData(dataSource, sheet, MBLsheet);
  sheet.celldata = newCellData;
}

function initVerification(data, sheet, MBLsheet) {
  const { columns } = sheet;
  const curVerifyMap = {};

  for (let i = 0; i < data.length; i++) {
    for (let j = 0; j < columns.length; j++) {
      if (typeof columns?.[j]?.fieldsProps === "object") {
        const {
          type,
          type2,
          options,
          status,
          verifyText,
          compareInfo,
          verifyFn,
        } = columns[j].fieldsProps;
        const { sign, range, value } = compareInfo ?? {};

        // 自定义校验
        const curVerifyFn = typeof verifyFn === "function" ? verifyFn : null;

        var curVerifyInfo = {
          type: fieldsMap[type] === AUTOCOMPLETE ? "dropdown" : fieldsMap[type],
          hintShow: !!status,
          hintText: verifyText,
          verifyFn: curVerifyFn,
        };

        if (type === "select" || type === AUTOCOMPLETE) {
          // if ()
          curVerifyInfo.value1 = options
            .map((item) => item.label || item)
            .join(",");
          curVerifyInfo.type2 = type === AUTOCOMPLETE ? AUTOCOMPLETE : type2;
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
  console.log("%c Line:41 🍔 sheet", "color:#e41a6a", sheet);
}

function setData(data, sheet, MBLsheet) {
  const curData = processData(data, sheet, MBLsheet);
  curData.forEach((item) => {
    MBLsheet.setCellValue(item.r, item.c, item.v);
  });
}

function processData(dataSource, sheet, MBLsheet) {
  const { columns } = sheet;
  const cMap = {};
  columns.forEach(({ dataIndex }, i) => {
    cMap[dataIndex] = i;
  });

  const fillArr = Array.from({
    length: Math.max(dataSource.length, sheet.row),
  })?.map((_, i) => {
    return dataSource[i] || {};
  });

  initVerification(fillArr, sheet, MBLsheet);

  const curData = fillArr.map((item, r) => {
    return columns.map((sub) => {
      var v = item[sub.dataIndex];

      const fieldsProps = sub.fieldsProps || {};

      const dom = sub.render && sub.render(item[sub.dataIndex], item, r);
      // TODO: 未来可能会有更多的渲染方式
      // console.log(dom);
      if (sub.render && typeof sub.render === "function") {
        v = sub.render(item[sub.dataIndex], item, r);
      }

      if (v === undefined && fieldsProps?.defaultValue) {
        v = fieldsProps?.defaultValue;
      }

      var m = v;

      if (fieldsProps?.type === "select") {
        if (typeof v === "number") {
          m = fieldsProps?.options?.find((min) => min.value === v)?.label || v;
        } else {
          m = v
            ?.split(",")
            .map((min) => {
              return (
                fieldsProps?.options?.find((min) => min.value === m)?.label || v
              );
            })
            .join(",");
        }
      }

      if (lengthVerArr.includes(sub?.fieldsMap?.type)) {
        sub.ct = {
          fa: "0",
          t: "n",
        };
      }

      return { ...sub, v, m, ct: sub.ct };
    });
  });

  const finallyData = transToCellDataV2(curData);
  return finallyData;
}

export { initDataSource, initVerification, setData };
