import "./index.scss";
const rangeValue = (val, min, max) => {
  return min + val * (max - min);
};
const mapVal = (val, min, max) => {
  return (val - min) / (max - min);
};
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
      return data[0].map((el, index) => {
        return fun(
          data.map((val) => {
            return val[index];
          }),
          x
        );
      });
    }
  }
};

const easeStep = (el, vals, rule, unit = "", rate) => {
  if (typeof vals == "object" && vals instanceof Array) {
    vals = vals.map((val) => {
      if (val && typeof val[0] == "number") {
        return lagrangeInterpolation(val, rate);
      } else {
        return val;
      }
    });
    if (!rule) {
      rule = "${0}";
    }
    vals = runFunction(
      indexReplace(rule, (val) => {
        return vals[val.replace(/[\$\{\}]/g, "")];
      }),
      el,
      listDataFun
    );
    return vals + unit;
  }
};
const dataEaseStep = (el, dataList, rate, rangeBool) => {
  dataList.forEach((item) => {
    const data = easeStep(el, item.falseVal && !rangeBool ? item.falseVal : item.val, item.rule, item.unit, rate);
    if (item.attr) {
      el.setAttribute(item.name, data);
    } else {
      el.style[item.name] = data;
    }
  });
};

const splitRandom = (val, changeFun) => {
  if (/\|/g.test(val)) {
    const nums = val.split(/\|/g).map((val_0) => {
      return changeFun ? changeFun(val_0, true) : val_0;
    });
    return lagrangeInterpolation(nums, Math.random());
  }
  return changeFun ? changeFun(val, false) : val;
};

const splitEl = (val, rate, changeFun) => {
  if (/\-\>/g.test(val)) {
    const nums = val.split(/\-\>/g).map((val_0) => {
      return changeFun ? changeFun(val_0, true) : val_0;
    });
    return lagrangeInterpolation(nums, rate);
  }
  return changeFun ? changeFun(val, false) : val;
};

const splitGroup = (val, changeFun) => {
  if (/\,/g.test(val)) {
    return val.split(/\,/g).map((val_0) => {
      return changeFun ? changeFun(val_0, true) : val_0;
    });
  }
  return changeFun ? changeFun(val, false) : val;
};
const splitTime = (val, changeFun) => {
  const list = [];
  val.replace(/\~|\_/g, (val) => {
    list.push(val == "_");
  });
  let data = val.split(/\~|\_/g).map((val_0) => {
    return changeFun ? changeFun(val_0) : val_0;
  });
  let temp;
  return data.map((val, index) => {
    if (typeof val == "object" && val instanceof Array) {
      if (index != 0 && list[index - 1]) {
        temp = temp.map((val_0, index) => {
          return val_0 + val[index];
        });
      } else {
        temp = val;
      }
      return temp;
    } else {
      if (index != 0 && list[index - 1]) {
        temp += val;
      } else {
        temp = val;
      }
      return temp;
    }
  });
};
const splitSwitch = (val) => {
  if (/\!/g.test(val)) {
    return val.split(/\!/g);
  }
  return [val];
};

const indexReplace = (val, changeFun) => {
  return val.replace(/\$\{\d+\}/g, (val) => {
    return changeFun ? changeFun(val) : val;
  });
};
const stringReplace = (val, changeFun) => {
  //先將字串取代為別的
  if (/\'/g.test(val)) {
    const list = val.split(/\'/g);
    const stringList = list.filter((val, index) => index % 2 == 1);
    val = list.map((val, index) => (index % 2 == 1 ? "'$s" + Math.floor(index / 2) + "'" : val)).join("");
    return changeFun ? changeFun(val, stringList) : val;
  }
  return changeFun ? changeFun(val, []) : val;
};
const splitFunction = (val, changeFun) => {
  const re_f = /\$f/g;
  if (re_f.test(val)) {
    return val
      .split(re_f)
      .filter((val) => val !== "")
      .map((val) =>
        val.replace(/^\{(\w+)\((.*)\)\}/g, (val, name, parameter) => {
          return changeFun ? changeFun(val, name, parameter.split(/\,/g)) : val;
        })
      )
      .join("");
  }
  return val;
};
const runFunction = (val, el, funs) => {
  const re_f = /\$f/g;
  if (re_f.test(val)) {
    return stringReplace(val, (val, stringList) => {
      return splitFunction(val, (val, name, parameter) => {
        const p = parameter.map((val) => {
          const re_s = /\'\$s(\d+)\'/g;
          if (re_s.test(val)) {
            return "'" + stringList[val.replace(re_s, "$1")] + "'";
          }
          try {
            return eval(val);
          } catch (error) {
            return val;
          }
        });
        if (funs[name]) {
          return funs[name].apply(this, [el, ...p]);
        } else {
          return val;
        }
      });
    });
  }
  return val;
};

const splitStyle = (val, rate) => {
  const vals = splitTime(val, (val) => {
    return splitGroup(val, (val) => {
      return splitEl(val, rate, (val) => {
        return splitRandom(val, (val) => {
          return numberConversion(val);
        });
      });
    });
  });
  if (typeof vals[0] == "object" && vals[0] instanceof Array) {
    //將數組方式改成 各線數據 [255,255,0],[128,128,128] >> [255,128],[255,128],[0,128]
    const valList = [];
    for (let i = 0; i < vals[0].length; i++) {
      valList[i] = [];
      for (let j = 0; j < vals.length; j++) {
        valList[i].push(vals[j][i]);
      }
    }
    return valList;
  } else {
    return [vals];
  }
};
const splitStyleFull = (vals, el, listDataFun, elRate) => {
  //function轉換,切割switch
  const fun = (vals, el, listDataFun, elRate) => {
    let [A, B] = splitSwitch(vals);
    A = splitStyle(runFunction(A, el, listDataFun), elRate);
    if (B) {
      B = splitStyle(runFunction(B, el, listDataFun), elRate);
      /*if (B.every((val) => val == undefined)) {
        B = undefined;
      }*/
    }
    return [A, B];
  };

  if (typeof vals == "string") {
    const data = vals.split(/\?/g); //切割unit
    if (/\;/g.test(data[0])) {
      const listA = [];
      let listB = [];
      data[0].split(/\;/g).forEach((val, index) => {
        const d = fun(val, el, listDataFun, elRate);
        listA.push(...d[0]);
        if (d[1]) {
          listB.push(...d[1]);
        } else {
          listB.push(d[1]);
        }
      });
      if (listB.every((val) => val == undefined)) {
        listB = undefined;
      }
      //console.log(listA, listB);
      return [listA, listB, data[1]];
    } else {
      const [A, B] = fun(data[0], el, listDataFun, elRate);
      //console.log(A, B);
      return [A, B, data[1]];
    }
  } else if (typeof vals == "number") {
    return [[[vals]]];
  }
};
const numberConversion = (val, changeFun) => {
  if (/^\-?\d+(.\d*)?$/g.test(val)) {
    return changeFun ? changeFun(parseFloat(val), true) : parseFloat(val);
  } else {
    return changeFun ? changeFun(val, false) : val;
  }
};
const timeDecomposition = (val, elRate) => {
  if (val) {
    const time = splitTime(val, (val) => {
      return splitEl(val, elRate, (val) => {
        return splitRandom(val, (val) => {
          return parseFloat(val);
        });
      });
    });
    return { start: time[0], end: time[1] };
  }
  return val;
};

import list from "./data";
const listDataFun = {
  getTotalLength: (el) => {
    return el.getTotalLength();
  },
  wave: (el, val) => {
    const w = window.innerWidth;
    const h = 70;
    let s = "";
    const n = 20;
    const r = 30 * lagrangeInterpolation([0.5, 0.7, 0.85, 0.95, 0.4], val);
    //const r = 30;
    const m = w / (600 + 400 * val);
    for (let i = 0; i <= n; i++) {
      const rate = i / n;
      const angle = (6 * val + m * rate) * 2 * Math.PI;
      const x = r * Math.cos(angle);
      const y = r * Math.sin(angle);
      s += ` L ${lagrangeInterpolation([-r, w + r], rate) + x} ${r + y}`;
    }
    return `M ${w} ${h} L 0 ${h}` + s;
  },
  wave_texture: (el, x, y, rate) => {
    x += 10 * Math.sin(2.4 * rate * 2 * Math.PI);
    y += 15 * Math.cos(4 * rate * 2 * Math.PI);
    return x + "," + y;
  },
  bubble: (el, val, rate, r) => {
    return val + r * Math.sin(2 * rate * 2 * Math.PI);
  },
  wave_text: (el, val, y, s) => {
    //console.log(s);
    return 20 * Math.sin(val * 2 * Math.PI) + y;
  },
};
let cRate = 0;
const listData = [];
//資料轉換
list.forEach((obj) => {
  const elList = document.body.querySelectorAll(obj.selector);
  [...elList].forEach((el, index, array) => {
    const elRate = index / (array.length - 1);
    let time = timeDecomposition(obj.time, elRate);
    let timeRange = timeDecomposition(obj.timeRange, elRate);
    if (timeRange) {
      time.start = rangeValue(time.start, timeRange.start, timeRange.end);
      time.end = rangeValue(time.end, timeRange.start, timeRange.end);
    }
    const count = obj.count == undefined ? 1 : obj.count;
    const duration = (time.end - time.start) / count;
    for (let i = 0; i < count; i++) {
      const item = {
        el: el,
        start: time.start,
        end: time.end,
        data: [],
      };
      if (count > 1) {
        item.start = time.start + duration * i;
        item.end = time.start + duration * (i + 1);
      }
      const exclude = ["selector", "time", "timeRange", "count"];
      for (let styleKey in obj) {
        if (!(exclude.indexOf(styleKey) >= 0)) {
          let vals = obj[styleKey];
          if (typeof vals == "object") {
            vals = vals.val;
          }
          if (vals != undefined) {
            const [A, B, unit] = splitStyleFull(vals, el, listDataFun, elRate);
            const attr = /^attr\_/g.test(styleKey);
            item.data.push({
              name: attr ? styleKey.replace(/^attr\_/g, "") : styleKey,
              val: A,
              rule: obj[styleKey].rule,
              unit: unit,
              falseVal: B,
              attr: attr,
            });
          }
        }
      }
      listData.push(item);
    }
  });
});
const listDataBool = listData.map(() => false);
console.log(listData, listDataBool);

const init = () => {
  scroll();
};
let m_scrollTop = document.doctype ? document.documentElement.scrollTop : document.body.scrollTop;
const scroll = () => {
  const scrollTop = document.doctype ? document.documentElement.scrollTop : document.body.scrollTop;
  if (Math.abs(scrollTop - m_scrollTop) > 300) {
    for (let i = 0; i < listDataBool.length; i++) {
      listDataBool[i] = false;
    }
  }
  m_scrollTop = scrollTop;
  cRate = scrollTop / window.innerHeight;
  //console.log(cRate);
  listData.forEach((obj, index) => {
    if (!listDataBool[index]) {
      if (cRate < obj.start) {
        listDataBool[index] = true;
        dataEaseStep(obj.el, obj.data, 0, false);
      } else if (cRate > obj.end) {
        listDataBool[index] = true;
        dataEaseStep(obj.el, obj.data, 1, false);
      } else {
        const rate0 = obj.end - obj.start <= 0 ? 0 : mapVal(cRate, obj.start, obj.end);
        dataEaseStep(obj.el, obj.data, rate0, true);
      }
    } else {
      if (cRate >= obj.start && cRate <= obj.end) {
        listDataBool[index] = false;
      }
    }
  });
};
window.addEventListener("resize", () => {
  for (let i = 0; i < listDataBool.length; i++) {
    listDataBool[i] = false;
  }
  scroll();
});
window.addEventListener("scroll", scroll);
init();
