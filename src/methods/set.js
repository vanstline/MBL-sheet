import { getSheetIndex } from "../methods/get";
import Store from "../store";

function setMBLsheet_select_save(v) {
  Store.MBLsheet_select_save = v;
}

function setMBLsheet_scroll_status(v) {
  Store.MBLsheet_scroll_status = v;
}

function setMBLsheetfile(d) {
  Store.MBLsheetfile = d;
}

function setconfig(v) {
  Store.config = v;

  if (Store.MBLsheetfile != null) {
    Store.MBLsheetfile[getSheetIndex(Store.currentSheetIndex)].config = v;
  }
}

function setvisibledatarow(v) {
  Store.visibledatarow = v;

  if (Store.MBLsheetfile != null) {
    Store.MBLsheetfile[getSheetIndex(Store.currentSheetIndex)].visibledatarow =
      v;
  }
}

function setvisibledatacolumn(v) {
  Store.visibledatacolumn = v;

  if (Store.MBLsheetfile != null) {
    Store.MBLsheetfile[
      getSheetIndex(Store.currentSheetIndex)
    ].visibledatacolumn = v;
  }
}

export {
  setMBLsheet_select_save,
  setMBLsheet_scroll_status,
  setMBLsheetfile,
  setconfig,
  setvisibledatarow,
  setvisibledatacolumn,
};
