import Store from "../store";

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

export {
  setVerifyByKey,
  getVerifyByKey,
  clearVerify,
  getAllVerify,
  hasVerifyByKey,
};
