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
const easeStep = (data, rate) => {
  const vals = data.val;
  const calc = data.calc;
  const rule = data.rule;
  if (typeof vals[0] == "number") {
    let val = lagrangeInterpolation(vals, rate);
    if (calc) {
      val = eval(calc.replace(/\$\{\d\}/g, val));
    }
    if (rule) {
      return rule.replace(/\$\{\d\}/g, val);
    } else {
      return val;
    }
  } else if (typeof vals[0] == "object") {
    if (vals[0] instanceof Array) {
      const valList = [];
      for (let i = 0; i < vals[0].length; i++) {
        const temp = [];
        for (let j = 0; j < vals.length; j++) {
          temp.push(vals[j][i]);
        }
        valList[i] = lagrangeInterpolation(temp, rate);
      }

      const valList0 = [];
      for (let i = 0; i < vals[0].length; i++) {
        if (calc && calc[i]) {
          valList0[i] = eval(
            calc[i].replace(/\$\{\d\}/g, (val) => {
              return valList[val.replace(/[\$\{\}]/g, "")];
            })
          );
        } else {
          valList0[i] = valList[i];
        }
      }
      if (rule) {
        return rule.replace(/\$\{\d\}/g, (val) => {
          return valList0[val.replace(/[\$\{\}]/g, "")];
        });
      }
    }
  }
};
const styleEaseStep = (selector, style, rate) => {
  const el = document.body.querySelector(selector);
  for (let key in style) {
    el.style[key] = easeStep(style[key], rate);
  }
};
const sectionStyleEaseStep = (data, rate) => {
  if (data) {
    data.forEach((obj) => {
      styleEaseStep(
        obj.selector,
        obj.style,
        cropNumber(obj.time.duration == 0 ? 0 : mapVal(rate, obj.time.start, obj.time.start + obj.time.duration))
      );
    });
  }
};
const getSectionScrollData = (sectionList, scrollTop) => {
  for (let i = 0; i < sectionList.length; i++) {
    const el = sectionList[i];
    const compStyles = window.getComputedStyle(el);
    const h = el.clientHeight + parseFloat(compStyles.getPropertyValue("margin-bottom")) - window.innerHeight;
    let rate = 0;
    rate = h != 0 ? cropNumber((scrollTop - el.offsetTop) / h) : 0;

    if (rate >= 0 && rate < 1) {
      return { type: "run", index: i, rate: rate };
    }
    rate = cropNumber((scrollTop - el.offsetTop - h) / window.innerHeight);
    if (rate >= 0 && rate < 1) {
      return { type: "ease", index: i, rate: rate };
    }
  }
};

const sectionList = document.getElementsByClassName("section");

import list from "./data";

let rate = 0;
let cType = "run";
let cIndex = 0;

const init = () => {
  const scrollTop = document.doctype ? document.documentElement.scrollTop : document.body.scrollTop;
  let sectionScrollData = getSectionScrollData(sectionList, scrollTop);
  rate = sectionScrollData.rate;
  cType = sectionScrollData.type;
  cIndex = sectionScrollData.index;
  for (let i = 0; i < cIndex + 1; i++) {
    if (i < cIndex) {
      sectionStyleEaseStep(list[i]["start"], 1);
      sectionStyleEaseStep(list[i]["process"], 1);
      sectionStyleEaseStep(list[i]["end"], 1);
    } else {
      sectionStyleEaseStep(list[i]["start"], 1);
      if (cType == "ease") {
        sectionStyleEaseStep(list[i]["process"], 1);
      }
    }
  }
  //將所有元素設定好
};
const scroll = () => {
  const scrollTop = document.doctype ? document.documentElement.scrollTop : document.body.scrollTop;
  let sectionScrollData = getSectionScrollData(sectionList, scrollTop);
  rate = sectionScrollData.rate;
  if (cType != sectionScrollData.type || cIndex != sectionScrollData.index) {
    if (cType == "run") {
      sectionStyleEaseStep(list[cIndex]["process"], 1);
    } else if (cType == "ease") {
      if (cIndex == sectionScrollData.index) {
        sectionStyleEaseStep(list[cIndex]["end"], 0);
        if (cIndex + 1 < list.length) {
          sectionStyleEaseStep(list[cIndex + 1]["start"], 0);
        }
      } else {
        sectionStyleEaseStep(list[cIndex]["end"], 1);
        if (cIndex + 1 < list.length) {
          sectionStyleEaseStep(list[cIndex + 1]["start"], 1);
        }
      }
    }
    cType = sectionScrollData.type;
    cIndex = sectionScrollData.index;
  } //切換狀態與頁面時 把元素歸位準確
  for (let i = 0; i < sectionList.length; i++) {
    if (i >= cIndex && i <= cIndex + 1) {
      sectionList[i].style.visibility = "";
    } else {
      sectionList[i].style.visibility = "hidden";
    }
  } //隱藏頁面
  if (cType == "run") {
    sectionStyleEaseStep(list[cIndex]["process"], rate);
  } else if (cType == "ease") {
    sectionStyleEaseStep(list[cIndex]["end"], rate);
    if (cIndex + 1 < list.length) {
      sectionStyleEaseStep(list[cIndex + 1]["start"], rate);
    }
  } //執行效果
};
window.addEventListener("scroll", scroll);
init();
scroll();
