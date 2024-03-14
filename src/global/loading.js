export function showloading(txt) {
  $("#MBLsheet-cell-loading").find("span").text(txt).end().show();
}

export function hideloading() {
  $("#MBLsheet-cell-loading").hide();
}
