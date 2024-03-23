var fieldsMap = {
  select: "dropdown",
  number: "number",
  int: "number_integer",
  decimal: "number_decimal",
  text: "text_length",
  textarea: "text_content",
  date: "date",
  validity: "validity",
  checkbox: "checkbox",
};

// number int decimal text 时 校验条件
var lengthMap = {
  /* (介于) */
  in: "bw",
  /* (不介于) */
  out: "nb",
  /* (等于) */
  "=": "eq",
  /* (不等于) */
  "!=": "ne",
  /* (大于) */
  ">": "gt",
  /* (小于) */
  "<": "lt",
  /* (大于等于) */
  ">=": "gte",
  /* (小于等于) */
  "<=": "lte",
};

// textarea  时 校验条件
var contentMap = {
  /* (包括) */
  include: "include",
  /* (不包括) */
  exclude: "exclude",
  /* (等于) */
  equal: "equal",
};

var validityMap = {
  /* (包括) */
  include: "include",
  /* (不包括) */
  exclude: "exclude",
  /* (等于) */
  equal: "equal",
};
