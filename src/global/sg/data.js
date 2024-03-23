import { transToCellData, transToCellDataV2 } from "../api";

function initDataSource(dataSource, sheet, MBLsheet) {
  const { columns } = sheet;
  const cMap = {};
  columns.forEach(({ dataIndex }, i) => {
    cMap[dataIndex] = i;
  });

  const fillArr = Array.from({ length: sheet.row })?.map((_, i) => {
    return dataSource[i] || {};
  });

  const curData = fillArr.map((item, r) => {
    return columns.map((sub) => {
      var v = item[sub.dataIndex];
      if (sub.render && typeof sub.render === "function") {
        v = sub.render(item[sub.dataIndex], sub, r);
      }
      return { ...sub, v, ct: sub.ct };
    });
  });

  const finallyData = transToCellDataV2(curData);
  sheet.celldata = finallyData;
}

export { initDataSource };
