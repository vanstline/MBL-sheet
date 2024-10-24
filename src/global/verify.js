import dataVerificationCtrl from "../controllers/dataVerificationCtrl";
import Store from "../store";
import { getRowFlowData } from "./sg/getFlowData";

/**
 * 设置验证
 *
 * @param {*} k
 * @param {*} v
 */
const setVerifyByKey = (k, v) => {
  Store.verifyMap[k] = v;
};

/**
 * 获取验证
 *
 * @param {*} k
 * @param {*} v
 */
const getVerifyByKey = (k, v) => Store.verifyMap[k];

/**
 * 清除验证
 *
 * @param {*} k
 */
const clearVerify = (k) => {
  if (k) {
    delete Store.verifyMap[k];
  } else {
    Store.verifyMap = {};
  }
};

/**
 * 是否有验证
 *
 * @param {*} k
 */
const hasVerifyByKey = (k) => Store.verifyMap.hasOwnProperty(k);

/**
 * 获取所有验证
 *
 * @param {*} k
 * @param {*} v
 */
const getAllVerify = (k, v) => Store.verifyMap;

/**
 * 执行验证
 *
 * @param {number} r 行
 * @param {number} c 列
 * @param {any} val 值
 * @return {*}
 */
const execVerify = (r, c, val) => {
  // if (Store?.checkMark?.[r]?.[c]?.mark) {
  //   return Store.checkMark[r][c];
  // }
  const { dataVerification, validateCellDataCustom: verifyFn } =
    dataVerificationCtrl;
  if (dataVerification?.[r + "_" + c]?.verifyFn) {
    // console.log("%c Line:67 🥥 r, c", "color:#f5ce50", r, c);
    if (!Store.checkMark?.[r]?.[c]?.mark && verifyFn) {
      const result = verifyFn(
        val,
        dataVerification[r + "_" + c],
        r,
        getRowFlowData(r)
      );
      Store.checkMark[r][c] = { ...result, mark: true };
    }

    if (!Store.checkMark[r][c].status) {
      setVerifyByKey(r + "_" + c, val);
    } else {
      clearVerify(r + "_" + c);
    }

    return Store.checkMark[r][c];
  } else {
    clearVerify(r + "_" + c);
    return { status: true, msg: "", mark: true };
  }
};

export {
  setVerifyByKey,
  getVerifyByKey,
  clearVerify,
  getAllVerify,
  hasVerifyByKey,
  execVerify,
};
