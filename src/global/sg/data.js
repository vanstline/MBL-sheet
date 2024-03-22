import { transToCellData } from "../api";

function initDataSource(dataSource, sheet) {
  const { columns } = sheet;
  const cMap = {};
  columns.forEach(({ dataIndex }, i) => (cMap[dataIndex] = i));

  const curData = dataSource.map((item, r) => {
    return columns.map((sub) => {
      return item[sub.dataIndex];
    });
  });

  const finallyData = transToCellData(curData);

  sheet.celldata = finallyData;
}

export { initDataSource };
