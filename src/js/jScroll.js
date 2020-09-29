import { rangeValue, mapVal, lagrangeInterpolation } from "./number";

const easeStep = (vals, rate) => {
  if (typeof vals == "object" && vals instanceof Array) {
    return vals.map((val) => (val && typeof val[0] == "number" ? lagrangeInterpolation(val, rate) : val));
  }
  return vals;
};
const dataEaseStep = (el, dataList, rate, status, listDataFun) => {
  dataList.forEach((item) => {
    const data = easeStep(item.falseVal && status != 1 ? item.falseVal : item.val, rate);
    const uint = item.unit ? item.unit : "";
    let rule = item.rule ? item.rule : "${0}";
    rule = indexReplace(rule, (val) => data[val.replace(/\$\{(\d+)\}/g, "$1")]);
    const val = runFunction(rule, el, listDataFun) + uint;
    if (item.attr) {
      el.setAttribute(item.name, val);
    } else {
      el.style[item.name] = val;
    }
  });
};

const splitRandom = (val, changeFun) => {
  if (/\|/g.test(val)) {
    const nums = val.split(/\|/g).map((val_0) => (changeFun ? changeFun(val_0, true) : val_0));
    return lagrangeInterpolation(nums, Math.random());
  }
  return changeFun ? changeFun(val, false) : val;
};

const splitEl = (val, rate, changeFun) => {
  if (/\-\>/g.test(val)) {
    const nums = val.split(/\-\>/g).map((val_0) => (changeFun ? changeFun(val_0, true) : val_0));
    return lagrangeInterpolation(nums, rate);
  }
  return changeFun ? changeFun(val, false) : val;
};

const splitGroup = (val, changeFun) => {
  if (/\,/g.test(val)) {
    return val.split(/\,/g).map((val_0) => (changeFun ? changeFun(val_0, true) : val_0));
  }
  return changeFun ? changeFun(val, false) : val;
};
const splitTime = (val, changeFun) => {
  const list = [];
  val.replace(/\~|\_/g, (val) => {
    list.push(val == "_");
  });
  let data = val.split(/\~|\_/g).map((val_0) => (changeFun ? changeFun(val_0) : val_0));
  let temp;
  return data.map((val, index) => {
    if (typeof val == "object" && val instanceof Array) {
      if (index != 0 && list[index - 1]) {
        temp = temp.map((val_0, index) => val_0 + val[index]);
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
  return val.replace(/\$\{\d+\}/g, (val) => (changeFun ? changeFun(val) : val));
};
const runFunction = (val, el, funs) => {
  const res_f = /\$(\w+)\(([^\(\)]*)\)/g;
  if (res_f.test(val)) {
    //將字串用其他文字替換
    val = stringReplace(val, (val, restore) => {
      //切割出function並執行
      val = val.replace(res_f, (val, name, parameter) => {
        let p = [];
        if (parameter) {
          const res_parameter = /\,/g;
          p = parameter.split(res_parameter).map((val) => {
            //將替換文字換回原本字串
            if (restore) {
              return restore(val);
            }
            return numberConversion(val);
          });
        }
        return funs[name].apply(this, [el, ...p]);
      });
      //將替換文字換回原本字串
      if (restore) {
        return restore(val);
      }
      return val;
    });
  }
  return val;
};
const stringReplace = (val, changeFun) => {
  //先將字串取代為別的
  const tempString = [];
  const restore = (val) => {
    const res_s_d = /\'\$s(\d+)\'/g;
    return val.replace(res_s_d, (val) => {
      return tempString[val.replace(res_s_d, "$1")];
    });
  };
  const res_s_e = /\'[^\']*\'/g;
  if (res_s_e.test(val)) {
    val = val.replace(res_s_e, (val) => {
      tempString.push(val);
      return "'$s" + (tempString.length - 1) + "'";
    });
    return changeFun ? changeFun(val, restore) : val;
  }
  return changeFun ? changeFun(val) : val;
};

const splitStyle = (val, rate) => {
  const vals = splitTime(val, (val) => {
    return splitGroup(val, (val) => {
      return splitEl(val, rate, (val) => {
        return splitRandom(val, (val) => numberConversion(val));
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
const numberConversion = (val) => {
  if (/^\-?\d+(.\d*)?$/g.test(val)) {
    return parseFloat(val);
  }
  return val;
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
class jScroll {
  constructor() {
    this.data = [];
    this.dataStatus = [];
    this.dataFun = [];
  }
  setData(data, dataFun) {
    const listData = [];
    data.forEach((obj) => {
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
                const [A, B, unit] = splitStyleFull(vals, el, dataFun, elRate);
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
    this.data = listData;
    //console.log(listData);
    this.dataStatus = new Array(listData.length).fill(1);
    this.dataFun = dataFun;
  }
  update(rate) {
    this.data.forEach((obj, index) => {
      let status = 1;
      if (rate < obj.start) {
        status = 0;
      } else if (rate > obj.end) {
        status = 2;
      }
      if (this.dataStatus[index] != status) {
        this.dataStatus[index] = status;
        let rate0;
        if (status == 0) {
          rate0 = 0;
        } else if (status == 2) {
          rate0 = 1;
        } else {
          rate0 = obj.end - obj.start <= 0 ? 0 : mapVal(rate, obj.start, obj.end);
        }
        dataEaseStep(obj.el, obj.data, rate0, status, this.dataFun);
      } else if (status == 1) {
        const rate0 = obj.end - obj.start <= 0 ? 0 : mapVal(rate, obj.start, obj.end);
        dataEaseStep(obj.el, obj.data, rate0, status, this.dataFun);
      }
    });
  }
}
export default jScroll;
