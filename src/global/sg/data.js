import Store from "../../store";
import { transToCellData, transToCellDataV2 } from "../api";
import { jfrefreshgrid } from "../refresh";
import { setVerifyByKey, clearVerify, execVerify } from "../verify";
import dataVerificationCtrl from "../../controllers/dataVerificationCtrl";
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
  // MBLsheet.setData(newCellData);
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
          required,
          width,
        } = columns[j].fieldsProps;
        const { sign, range, value } = compareInfo ?? {};

        // 自定义校验
        const curVerifyFn = typeof verifyFn === "function" ? verifyFn : null;

        var curVerifyInfo = {
          type: fieldsMap[type] === AUTOCOMPLETE ? "dropdown" : fieldsMap[type],
          hintShow: !!status,
          hintText: verifyText,
          verifyFn: curVerifyFn,
          required: required,
          width,
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
}

function setData(data, sheet, MBLsheet) {
  const curData = processData(data, sheet, MBLsheet);
  let dataVerification = dataVerificationCtrl.dataVerification;

  let d = _.cloneDeep(Store.flowdata);
  if (!d?.length) {
    d = sheet.celldata?.reduce((p, n, i) => {
      if (i % sheet.column === 0) {
        p.push([n.v]);
      } else {
        const curI = Math.floor(i / sheet.column);
        p[curI].push(n.v);
      }
      return p;
    }, []);
  }
  curData.forEach((item) => {
    const { r, c, v: V } = item;
    if (d?.[r]?.[c]) {
      d[r][c] = V ?? d[r][v];
      let value = d[r][c]?.v;

      if (!Store.checkMark[r]) {
        Store.checkMark[r] = [];
      }
      Store.checkMark[r][c] = { mark: false };

      // console.log("%c Line:97 🍪, setData 时手动执行 校验 ", "color:#ffdd4d");
      execVerify(r, c, value);
      // if (
      //   dataVerification != null &&
      //   dataVerification[r + "_" + c] != null &&
      //   !dataVerificationCtrl.validateCellDataCustom(
      //     value,
      //     dataVerification[r + "_" + c],
      //     r
      //   ).status
      // ) {
      //   setVerifyByKey(r + "_" + c, true);
      // } else {
      //   clearVerify(r + "_" + c);
      // }
    }
  });

  jfrefreshgrid(d, Store.MBLsheet_select_save);
}

/**
 * 执行数据校验
 *
 * @param {*} rowList
 * @param {boolean} [flag=false]
 * @param {*} sheet
 * @param {*} MBLsheet
 */
function execVerifyRow(rowList, flag = false, sheet, MBLsheet) {
  if (Array.isArray(rowList)) {
    let dataVerification = dataVerificationCtrl.dataVerification;

    var verifyDataList = [];
    var dataSource = processData(getData(sheet), sheet, MBLsheet)?.forEach(
      (item) => {
        if (verifyDataList[item.r]) {
          verifyDataList[item.r].push(item);
        } else {
          verifyDataList[item.r] = [item];
        }
      }
    );

    let d = _.cloneDeep(Store.flowdata);
    if (!d?.length) {
      d = sheet.celldata?.reduce((p, n, i) => {
        if (i % sheet.column === 0) {
          p.push([n.v]);
        } else {
          const curI = Math.floor(i / sheet.column);
          p[curI].push(n.v);
        }
        return p;
      }, []);
    }

    for (const curList of verifyDataList) {
      inner: for (const curItem of curList) {
        const { r, c, v: V } = curItem;
        if (d?.[r]?.[c]) {
          d[r][c] = V ?? d[r][v];
          let value = d[r][c]?.v;
          if (
            dataVerification != null &&
            dataVerification[r + "_" + c] != null &&
            !dataVerificationCtrl.validateCellDataCustom(
              value,
              dataVerification[r + "_" + c],
              r
            ).status
          ) {
            setVerifyByKey(r + "_" + c, true);
            if (!flag) {
              break inner;
            }
          } else {
            clearVerify(r + "_" + c);
          }
        }
      }
    }
  }
}

/**
 * 手动校验指定行，
 *
 * @param {number[]} rowList 行数组
 * @param {boolean} [flag=false] flag 校验的目（是否需要通过校验）； true 通过校验，false 不通过校验，
 *        不通过校验的话 单行只需出现一次即可跳出（性能优化）
 * @param {*} sheet
 * @param {*} MBLsheet
 */
export async function forceVerifyRows(rowList, flag = false, sheet, MBLsheet) {
  Store.loadingObj2.show();

  console.time("forceVerifyRows");
  return new Promise((resolve) => {
    new Promise(function (res) {
      setTimeout(function () {
        execVerifyRow(rowList, flag, sheet, MBLsheet);
        res();
      }, 0);
    }).then(() => {
      console.timeEnd("forceVerifyRows");
      Store.loadingObj2.close();
      resolve();
    });
  });
}

function getData(sheet) {
  // console.log("%c Line:191 🍑 Store.flowdata", "color:#33a5ff", Store.flowdata);
  const data = MBLsheet.getSheetData()?.map((item) => {
    // console.log("%c Line:192 🍬 item", "color:#ea7e5c", item);
    const obj = {};
    sheet.columns.forEach((col, index) => {
      const fieldsProps = item?.[index]?.fieldsProps;

      if (fieldsProps?.type === "select" && fieldsProps.options) {
        let curVal = item?.[index]?.v;
        const valueArr =
          typeof curVal === "string" ? curVal?.split(",") : curVal;
        if (valueArr?.length > 1) {
          curVal = valueArr
            ?.map((sub) => {
              return (
                fieldsProps.options.find((min) => {
                  return min.label === sub;
                })?.value || sub
              );
            })
            .join(",");
        } else {
          curVal =
            fieldsProps.options.find((min) => min.label === curVal)?.value ||
            curVal;
        }
        obj[col.dataIndex] = curVal;
      } else {
        obj[col.dataIndex] = item?.[index]?.v;
      }
    });
    return obj;
  });

  return data;
}

function processData(dataSource, sheet, MBLsheet) {
  dataSource = dataSource.splice(0, Store.flowdata.length);
  sheet.row = Store.flowdata.length || sheet.row;

  const { columns } = sheet;
  const cMap = {};
  columns.forEach(({ dataIndex }, i) => {
    cMap[dataIndex] = i;
  });

  const fillArr = Array.from({
    length: Math.max(dataSource.length, Store.flowdata.length || sheet.row),
  })?.map((_, i) => {
    return dataSource[i] || {};
  });

  initVerification(fillArr, sheet, MBLsheet);

  const curData = fillArr.map((item, r) => {
    Store.checkMark.push([]);
    return columns.map((sub) => {
      Store.checkMark[r].push({ mark: false });

      var v = item[sub.dataIndex];

      const fieldsProps = sub.fieldsProps || {};

      // const dom = sub.render && sub.render(item[sub.dataIndex], item, r);
      // TODO: 未来可能会有更多的渲染方式
      //
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
          m =
            v
              ?.split(",")
              .map((min) => {
                const findOpt = fieldsProps?.options?.find(
                  (min) => min.value === m
                );
                return findOpt?.label || min;
              })
              ?.join(",") ?? v;
        }
      }

      if (lengthVerArr.includes(sub?.fieldsMap?.type)) {
        sub.ct = {
          fa: "0",
          t: "n",
        };
      }

      return { ...sub, v: m, m, ct: sub.ct };
    });
  });

  const finallyData = transToCellDataV2(curData);
  return finallyData;
}

export { initDataSource, initVerification, setData, getData };
