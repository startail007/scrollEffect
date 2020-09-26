import "./index.css";
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
}; //內插法

const easeStep = (el, vals, rule, unit = "", rate) => {
  if (typeof vals == "object") {
    if (typeof vals[0] == "string") {
      return vals;
    } else if (typeof vals[0] == "number") {
      let val = lagrangeInterpolation(vals, rate);
      if (rule) {
        val = runFunction(
          indexReplace(rule, () => {
            return val + unit;
          }),
          el,
          listDataFun
        );
      }
      return val + unit;
    } else if (typeof vals[0] == "object") {
      if (vals[0] instanceof Array) {
        if (rule) {
          const valList = [];
          for (let i = 0; i < vals[0].length; i++) {
            const temp = [];
            for (let j = 0; j < vals.length; j++) {
              temp.push(vals[j][i]);
            }
            if (temp.length > 1) {
              valList[i] = lagrangeInterpolation(temp, rate);
            } else if (temp.length >= 0) {
              valList[i] = temp[0];
            }
          }

          const val = runFunction(
            indexReplace(rule, (val) => {
              return valList[val.replace(/[\$\{\}]/g, "")];
            }),
            el,
            listDataFun
          );

          return val + unit;
        }
      }
    }
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
/*const attrEaseStep = (el, attrList, rate, rangeBool) => {
  attrList.forEach((item) => {
    el.setAttribute(
      item.name,
      easeStep(el, item.falseVal && !rangeBool ? item.falseVal : item.val, item.rule, item.unit, rate)
    );
  });
};*/

const splitRandom = (val, changeNum) => {
  if (/\|/g.test(val)) {
    const nums = val.split(/\|/g).map((val_0) => {
      return changeNum ? changeNum(val_0, true) : val_0;
    });
    return lagrangeInterpolation(nums, Math.random());
  } else {
    return changeNum ? changeNum(val, false) : val;
  }
};

const splitEl = (val, rate, changeNum) => {
  if (/\-\>/g.test(val)) {
    const nums = val.split(/\-\>/g).map((val_0) => {
      return changeNum ? changeNum(val_0, true) : val_0;
    });
    return lagrangeInterpolation(nums, rate);
  } else {
    return changeNum ? changeNum(val, false) : val;
  }
};

const splitGroup = (val, changeNum) => {
  if (/\,/g.test(val)) {
    return val.split(/\,/g).map((val_0) => {
      return changeNum ? changeNum(val_0, true) : val_0;
    });
  } else {
    return changeNum ? changeNum(val, false) : val;
  }
};
const splitTime = (val, changeNum) => {
  return val.split(/\~/g).map((val_0) => {
    return changeNum ? changeNum(val_0) : val_0;
  });
};
const indexReplace = (val, changeNum) => {
  return val.replace(/\$\{\d\}/g, (val) => {
    return changeNum ? changeNum(val) : val;
  });
};
const runFunction = (val, el, funs) => {
  if (/\$f/g.test(val)) {
    let vals = val.split(/\$f/g);
    vals = vals.filter((val) => val !== "").map((val) => "$f" + val);

    return vals
      .map((val) => {
        return val.replace(/\$f\{.*\}/g, (ss) => {
          const s = ss.replace(/^\$f\{(.*)\}$/g, "$1");
          const s0 = s.replace(/^(.+)\(.*\)$/g, "$1");

          if (funs[s0]) {
            let s1_data = [];
            if (/^.+\((.+)\)$/g.test(s)) {
              s1_data = s
                .replace(/^.+\((.+)\)$/g, "$1")
                .split(/\,/g)
                .map(eval);
            }
            return funs[s0].apply(this, [el, ...s1_data]);
          } else {
            return ss;
          }
        });
      })
      .join("");
  } else {
    return val;
  }
};

const splitStyle = (val, rate) => {
  return splitTime(val, (val) => {
    return splitGroup(val, (val) => {
      return splitEl(val, rate, (val) => {
        return splitRandom(val, (val) => {
          return numberConversion(val);
        });
      });
    });
  });
};
const numberConversion = (val, changeNum) => {
  if (/^\-?\d+(.\d*)?$/g.test(val)) {
    return changeNum ? changeNum(parseFloat(val), true) : parseFloat(val);
  } else {
    return changeNum ? changeNum(val, false) : val;
  }
};

const timeDecomposition = (time, rate) => {
  if (time) {
    let time01 = 0;
    let time02 = 0;
    let duration = false;
    if (typeof time == "string") {
      if (/\_/g.test(time)) {
        const timeData = time.split(/\_/g);
        time01 = timeData[0];
        time02 = timeData[1];
        duration = true;
      } else if (/\~/g.test(time)) {
        const timeData = time.split(/\~/g);
        time01 = timeData[0];
        time02 = timeData[1];
        duration = false;
      }
    }
    if (typeof time01 == "string") {
      time01 = splitEl(time01, rate, (val) => {
        return splitRandom(val, (val) => {
          return parseFloat(val);
        });
      });
    }
    if (typeof time02 == "string") {
      time02 = splitEl(time02, rate, (val) => {
        return splitRandom(val, (val) => {
          return parseFloat(val);
        });
      });
    }
    return { start: time01, end: duration ? time01 + time02 : time02 };
  }
  return time;
};

import list from "./data";
const listDataFun = {
  getTotalLength: (el) => {
    return el.getTotalLength();
  },
  wave: (el, val) => {
    return 20 * Math.sin(val * 2 * Math.PI);
  },
  wave01: (el, val) => {
    //console.log(el, val);
    const w = window.innerWidth;
    const h = 70;
    let s = "";
    const n = 20;
    const r = 30 * lagrangeInterpolation([0.5, 0.75, 0.9, 1, 0], val);
    //const r = 30;
    const m = w / 800;
    for (let i = 0; i <= n; i++) {
      const rate = i / n;
      const angle = (6 * val + m * rate) * 2 * Math.PI;
      const x = r * Math.cos(angle);
      const y = r * Math.sin(angle);
      s += ` L ${lagrangeInterpolation([-r, w + r], rate) + x} ${r + y}`;
    }
    return `M ${w} ${h} L 0 ${h}` + s;
  },
};
let cRate = 0;
const listData = [];
list.forEach((obj) => {
  const elList = document.body.querySelectorAll(obj.selector);
  [...elList].forEach((el, index, array) => {
    const elRate = index / (array.length - 1);
    let time = timeDecomposition(obj["time"], elRate);
    let timeProportion = timeDecomposition(obj["timeProportion"], elRate);
    if (timeProportion) {
      time.start = rangeValue(time.start, timeProportion.start, timeProportion.end);
      time.end = rangeValue(time.end, timeProportion.start, timeProportion.end);
    }

    const item = {
      el: el,
      start: time.start,
      end: time.end,
      data: [],
    };
    //const style = [];
    for (let styleKey in obj) {
      if (styleKey != "selector" && styleKey != "time" && styleKey != "timeProportion") {
        let unit;
        let vals = obj[styleKey];
        let falseVals;
        let switchBool = false;

        if (typeof vals == "object") {
          vals = vals.val;
        }
        if (vals != undefined) {
          if (typeof vals == "string") {
            const data = vals.split(/\_/g);
            vals = data[0];
            unit = data[1] || unit;
            switchBool = /\&/g.test(vals);

            if (switchBool) {
              vals = vals.split(/\&/g);

              vals[1] = runFunction(vals[1], el, listDataFun);
              falseVals = splitStyle(vals[1], elRate);

              vals[0] = runFunction(vals[0], el, listDataFun);
              vals = splitStyle(vals[0], elRate);
            } else {
              vals = runFunction(vals, el, listDataFun);
              vals = splitStyle(vals, elRate);
            }
          } else if (typeof vals == "number") {
            vals = [vals];
          }
          const attr = /^attr\_/g.test(styleKey);
          item.data.push({
            name: attr ? styleKey.replace(/^attr\_/g, "") : styleKey,
            val: vals,
            rule: obj[styleKey].rule,
            unit: unit,
            falseVal: falseVals,
            attr: attr,
          });
        }
      }
    }
    listData.push(item);
  });
}); //資料轉換
const listDataBool = listData.map(() => false);
console.log(listData, listDataBool);
//time 可使用符號 | -> _ ~ 切割順序 (~ _) -> |
//----------------------
//0.1|0.3 間隔亂數 0.1到0.3之間亂數
//0.1->0.3 元件接續變化 假設3個元件 分配到0.1秒 0.2秒 0.3秒
//0.1_0.3 時間範圍 開始0.1秒 持續0.3秒
//0.1~0.3 時間範圍 開始0.1秒 結束0.3秒

//style 可使用符號 & ~ , -> | 切割順序 & ~ , -> |
//----------------------
//123&456 範圍開關 在進入時間範圍時 顯示123 反之456
//0.1~0.3 時間接續漸變 假設時間0~1秒變化對應0.1~0.3
//10,5 分組 ${0} = 10 ${1} = 5
//0.1->0.3 元件接續變化 假設3個元件 分配到0.1 0.2 0.3
//0.1|0.3 間隔亂數

//style 屬性 val rule 可用符號
//$f{XXX(0.5,0.75)}

//style未加入 0.5:10 占比
//style未加入 0.0:0~0.2:50~1.0:100 占比分配

const init = () => {
  scroll();
};

const scroll = () => {
  const scrollTop = document.doctype ? document.documentElement.scrollTop : document.body.scrollTop;
  cRate = scrollTop / window.innerHeight;
  console.log(cRate);
  listData.forEach((obj, index) => {
    if (!listDataBool[index]) {
      if (cRate < obj.start) {
        listDataBool[index] = true;
        dataEaseStep(obj.el, obj.data, 0, false);
        //attrEaseStep(obj.el, obj.attr, 0, false);
      } else if (cRate > obj.end) {
        listDataBool[index] = true;
        dataEaseStep(obj.el, obj.data, 1, false);
        //attrEaseStep(obj.el, obj.attr, 1, false);
      } else {
        const rate0 = obj.end - obj.start <= 0 ? 0 : mapVal(cRate, obj.start, obj.end);
        dataEaseStep(obj.el, obj.data, rate0, true);
        //styleEaseStep(obj.el, obj.attr, rate0, true);
      }
    } else {
      if (cRate >= obj.start && cRate <= obj.end) {
        listDataBool[index] = false;
      }
    }
  });
};
window.addEventListener("scroll", scroll);
init();
