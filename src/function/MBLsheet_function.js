import functionlist from "./functionlist";

const MBLsheet_function = {};

for (let i = 0; i < functionlist.length; i++) {
  let func = functionlist[i];
  MBLsheet_function[func.n] = func;
}

window.MBLsheet_function = MBLsheet_function; //挂载window 用于 eval() 计算公式

export default MBLsheet_function;
