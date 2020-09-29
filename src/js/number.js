const rangeValue = (val, min, max) => min + val * (max - min);
const mapVal = (val, min, max) => (val - min) / (max - min);
const cropNumber = (val) => {
  if (val < 0) {
    return 0;
  }
  if (val > 1) {
    return 1;
  }
  return val;
};
/*let p = [
      [0, 32],
      [0.9, 60],
      [1, 66],
    ];
    
    let lagrangeInterpolation = (data, x) => {
      let y = 0;
      const len = data.length;
      for (let i = 0; i < len; ++i) {
        let a = 1,
          b = 1;
        for (let j = 0; j < len; ++j) {
          if (j == i) continue;
          a *= x - data[j][0];
          b *= data[i][0] - data[j][0];
        }
        y += (data[i][1] * a) / b;
      }
      return y;
    };*/

//內插法
const lagrangeInterpolation = (data, x) => {
  let fun = (data, x) => {
    let y = 0;
    const len = data.length;
    for (let i = 0; i < len; ++i) {
      let a = 1,
        b = 1;
      for (let j = 0; j < len; ++j) {
        if (j == i) continue;
        a *= x - j / (len - 1);
        b *= i / (len - 1) - j / (len - 1);
      }
      y += (data[i] * a) / b;
    }
    return y;
  };
  if (typeof data[0] == "number") {
    return fun(data, x);
  } else if (typeof data[0] == "object") {
    if (data[0] instanceof Array) {
      return data[0].map((el, index) =>
        fun(
          data.map((val) => val[index]),
          x
        )
      );
    }
  }
};
export { rangeValue, mapVal, lagrangeInterpolation };
