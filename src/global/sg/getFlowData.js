import Store from "../../store";

export function getRowFlowData(r) {
  return Store.flowdata?.[r]?.reduce(
    (p, n) => ({ ...p, [n.dataIndex]: getCellFlowData(n) }),
    {}
  );
}

export function getCellFlowData(info) {
  return info.fieldsProps ? getFieldsInfoVal(info) : info.v;
}

export function getFlowData(r, c) {
  return Store.flowdata?.[r]?.[c].fieldsProps
    ? getFieldsInfoVal(Store.flowdata?.[r]?.[c])
    : Store.flowdata?.[r]?.[c].v;
}

function getFieldsInfoVal(info) {
  return info.fieldsProps?.type !== "select" &&
    info.fieldsProps?.type !== "autocomplete"
    ? info.v
    : getDropdownInfoVal(info);
}

function getDropdownInfoVal(info) {
  return info.fieldsProps?.type === "select"
    ? getSelectInfoVal(info)
    : getAutocompleteInfoVal(info);
}

function getSelectInfoVal(info) {
  return info.fieldsProps?.type2 !== "multi"
    ? info.fieldsProps?.options?.find((item) => item.label === info.v)?.value
    : info.fieldsProps?.options
        ?.find((item) => item.label === info.v)
        ?.value.join(",");
}

function getAutocompleteInfoVal(info) {
  return (
    info.fieldsProps?.options?.find((item) => item.label === info.v)?.value ||
    info.v
  );
}
