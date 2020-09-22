import "./index.css";
let rangeValue = (val, min, max) => {
  return min + val * (max - min);
};
let mapVal = (val, min, max) => {
  return (val - min) / (max - min);
};
let cropNumber = (val) => {
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
let lagrangeInterpolation = (data, x) => {
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
}; //內插法

let styleEase = (el, styleAttr, time, timeS, timeE, vals, calc, rule) => {
  if (typeof vals[0] == "number") {
    let val = lagrangeInterpolation(vals, cropNumber(mapVal(time, timeS, timeE)));
    if (calc) {
      val = eval(calc.replace(/\$\{\d\}/g, val));
    }
    if (rule) {
      el.style[styleAttr] = rule.replace(/\$\{\d\}/g, val);
    } else {
      el.style[styleAttr] = val;
    }
  } else if (typeof vals[0] == "object") {
    if (vals[0] instanceof Array) {
      let valList = [];
      for (let i = 0; i < vals[0].length; i++) {
        let temp = [];
        for (let j = 0; j < vals.length; j++) {
          temp.push(vals[j][i]);
        }
        valList[i] = lagrangeInterpolation(temp, cropNumber(mapVal(time, timeS, timeE)));
      }

      let valList0 = [];
      for (let i = 0; i < vals[0].length; i++) {
        if (calc && calc[i]) {
          valList0[i] = eval(
            calc[i].replace(/\$\{\d\}/g, (val) => {
              let key = val.replace(/[\$\{\}]/g, "");
              return valList[key];
            })
          );
        } else {
          valList0[i] = valList[i];
        }
      }
      if (rule) {
        el.style[styleAttr] = rule.replace(/\$\{\d\}/g, (val) => {
          let key = val.replace(/[\$\{\}]/g, "");
          return valList0[key];
        });
      }
    }
  }
};
let styleEaseGo = (selector) => {
  return {
    data: {},
    setEl(selector) {
      this.data.selector = selector;
      this.data.el = document.body.querySelector(selector);
      return this;
    },
    setTime(start, total) {
      this.data.timeS = start;
      this.data.timeE = start + total;
      return this;
    },
    setTimeStoE(start, end) {
      this.data.timeS = start;
      this.data.timeE = end;
      return this;
    },
    clone() {
      let data = Object.assign({}, this.data); //JSON.parse(JSON.stringify(this.data));
      //let data = JSON.parse(JSON.stringify(this.data));
      data.el = this.data.el;
      var copy = Object.assign({}, this);
      copy.data = data;
      return copy;
    },
    setParameter(styleAttr, vals, calc, rule) {
      this.data.styleAttr = styleAttr;
      this.data.parameters = vals;
      this.data.calc = calc;
      this.data.rule = rule;
      //console.log(this.data.fun);
      return this;
    },
    setData(data) {
      this.data = data;
      return this;
    },
    update(rate) {
      //console.log(this.data);
      styleEase(
        this.data.el,
        this.data.styleAttr,
        rate,
        this.data.timeS,
        this.data.timeE,
        this.data.parameters,
        this.data.calc,
        this.data.rule
      );
      return this;
    },
  }.setEl(selector);
};
//window.addEventListener("load", () => {

let sectionList = document.getElementsByClassName("section");

let styleEaseData = [];
for (let i = 0; i < sectionList.length; i++) {
  styleEaseData[i] = [[], [], []];
}
import list from "./data";
/*import aaa from "./rgb_text.svg";
console.log(aaa);*/
let styleEaseGo01 = styleEaseGo();
let keyMap = { start: 0, process: 1, end: 2 };
for (let i = 0; i < sectionList.length; i++) {
  if (list[i]) {
    for (const name in list[i]) {
      const el = list[i][name];
      const index = keyMap[name];
      el.forEach((obj) => {
        styleEaseGo01.setEl(obj.selector).setTime(...obj.time);
        for (let key in obj.style) {
          styleEaseGo01.setParameter(key, obj.style[key].val, obj.style[key].calc, obj.style[key].rule);
          styleEaseData[i][index].push(Object.assign({}, styleEaseGo01.data));
        }
      });
    }
  }
}
//資料轉換

let rateList = [];
let BoolList = [];
for (let i = 0; i < sectionList.length * 2; i++) {
  rateList[i] = 0;
}
for (let i = 0; i < sectionList.length; i++) {
  BoolList[i] = [false, false, false];
}

let scroll = () => {
  let scrollTop = document.doctype ? document.documentElement.scrollTop : document.body.scrollTop;
  for (let i = 0; i < sectionList.length; i++) {
    let el = sectionList[i];
    let compStyles = window.getComputedStyle(el);
    let h = el.clientHeight + parseFloat(compStyles.getPropertyValue("margin-bottom")) - window.innerHeight;

    rateList[i * 2] = h != 0 ? cropNumber((scrollTop - el.offsetTop) / h) : 0;
    rateList[i * 2 + 1] = cropNumber((scrollTop - el.offsetTop - h) / window.innerHeight);
  }

  console.log(rateList);
  let runFun = (rates, bools, fun) => {
    rates.forEach((val, index, array) => {
      if (index - 1 < 0 || array[index - 1] >= 1) {
        if (!bools[index] && val >= 0) {
          if (val >= 1) {
            bools[index] = true;
          }
          if (fun) {
            fun.call(this, val, bools[index], index);
          }
        } else if (bools[index] && val < 1) {
          bools[index] = false;
        }
      }
    });
  };

  for (let i = 0; i < sectionList.length; i++) {
    runFun(
      [i * 2 - 1 >= 0 ? rateList[i * 2 - 1] : 1, rateList[i * 2], rateList[i * 2 + 1]],
      BoolList[i],
      (rate, bool, index) => {
        let styleEaseGo01 = styleEaseGo();
        styleEaseData[i][index].forEach((data) => {
          styleEaseGo01.setData(data);
          styleEaseGo01.update(rate);
        });
      }
    );
  }
  let count = 2;
  for (let i = 0; i < sectionList.length; i++) {
    let bool = BoolList[i].reduce((p, c) => p + (c ? 1 : 0), 0) == 3;
    if (!bool && count > 0) {
      count--;
      sectionList[i].style.visibility = "";
    } else {
      sectionList[i].style.visibility = "hidden";
    }
  }
};
window.addEventListener("scroll", scroll);
scroll();
//});
