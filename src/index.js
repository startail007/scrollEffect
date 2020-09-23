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
  if (typeof vals == "object") {
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
  }
};
const sectionStyleEaseStep = (data, rate) => {
  if (data) {
    data.forEach((obj) => {
      let rate0 = cropNumber(obj.duration == 0 ? 0 : mapVal(rate, obj.start, obj.start + obj.duration));
      obj.el.style[obj.style] = easeStep(obj.num, rate0);
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
let listData = list.map((item) => {
  //console.log(item);
  let temp = {};
  for (let key in item) {
    temp[key] = [];
    item[key].forEach((obj) => {
      const elList = document.body.querySelectorAll(obj.selector);
      [...elList].forEach((el, index, array) => {
        let start = obj.time.start;
        let duration = obj.time.duration;
        if (typeof start == "string") {
          if (/\-\>/g.test(start)) {
            let nums = start.split(/\-\>/g).map((val) => {
              return parseFloat(val);
            });
            start = lagrangeInterpolation(nums, index / (array.length - 1));
          } else if (/\|/g.test(start)) {
            let nums = start.split(/\|/g).map((val) => {
              return parseFloat(val);
            });
            start = lagrangeInterpolation(nums, Math.random());
          }
        }
        if (typeof duration == "string") {
          if (/\-\>/g.test(duration)) {
            let nums = duration.split(/\-\>/g).map((val) => {
              return parseFloat(val);
            });
            duration = lagrangeInterpolation(nums, index / (array.length - 1));
          } else if (/\|/g.test(duration)) {
            let nums = duration.split(/\|/g).map((val) => {
              return parseFloat(val);
            });
            duration = lagrangeInterpolation(nums, Math.random());
          }
        }
        function splitRandom(val, changeNum) {
          if (/\|/g.test(val)) {
            let nums = val.split(/\|/g);
            if (changeNum) {
              nums = nums.map(changeNum);
            }
            return lagrangeInterpolation(nums, Math.random());
          } else {
            return changeNum ? changeNum(val) : val;
          }
        }
        for (let styleKey in obj.style) {
          let vals = obj.style[styleKey].val;
          if (typeof vals == "string") {
            vals = vals.split(/\~/g);
            vals = vals.map((val_0) => {
              if (/\,/g.test(val_0)) {
                return val_0.split(/\,/g).map((val_1) => {
                  return splitRandom(val_1, (val) => {
                    return parseFloat(val);
                  });
                });
              } else {
                return splitRandom(val_0, (val) => {
                  return parseFloat(val);
                });
              }
            });
            /*if (obj.selector == ".section01_text01") {
              console.log(vals);
            }*/
          } else if (typeof vals == "number") {
            vals = [vals];
          } else if (typeof vals == "object") {
            if (vals instanceof Array) {
              if (typeof vals[0] == "string") {
                vals = vals.map((val) => {
                  return val.split(/\,/g).map((val) => {
                    return parseFloat(val);
                  });
                });
              }
            }
          }
          temp[key].push({
            el: el,
            style: styleKey,
            start: start,
            duration: duration,
            num: {
              val: vals,
              calc: obj.style[styleKey].calc,
              rule: obj.style[styleKey].rule,
            },
          });
        }
      });
    });
  }
  return temp;
}); //資料轉換

//0.1~0.3 時間接續漸變 0~1秒變化對應0.1~0.3
//0.1|0.3 間隔亂數
//10,10 分組
//0.1->0.3 元素接續變化

//time 可使用符號 | ->
//style 可使用符號 ~ , |
//可使用 255,255,255~0,0,0

//style未添加功能 切割順序 ~ -> , |
//style未添加功能 0|255,255~4,0|255
//style未添加功能 0->5 設定元素分別假設有六個元素 每個分配到數值 0 1 2 3 4 5
//style未添加功能 0->5~10->15 設定元素分別假設有六個元素 每個分配到數值 0~10 1~11 2~12 3~13 4~14 5~15
//style未添加功能 0,0->5,5~10,10->20,15

const init = () => {
  const scrollTop = document.doctype ? document.documentElement.scrollTop : document.body.scrollTop;
  let sectionScrollData = getSectionScrollData(sectionList, scrollTop);
  rate = sectionScrollData.rate;
  cType = sectionScrollData.type;
  cIndex = sectionScrollData.index;
  for (let i = 0; i < cIndex + 1; i++) {
    if (i < cIndex) {
      sectionStyleEaseStep(listData[i]["start"], 1);
      sectionStyleEaseStep(listData[i]["process"], 1);
      sectionStyleEaseStep(listData[i]["end"], 1);
    } else {
      sectionStyleEaseStep(listData[i]["start"], 1);
      if (cType == "ease") {
        sectionStyleEaseStep(listData[i]["process"], 1);
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
      sectionStyleEaseStep(listData[cIndex]["process"], 1);
    } else if (cType == "ease") {
      if (cIndex == sectionScrollData.index) {
        sectionStyleEaseStep(listData[cIndex]["end"], 0);
        if (cIndex + 1 < list.length) {
          sectionStyleEaseStep(listData[cIndex + 1]["start"], 0);
        }
      } else {
        sectionStyleEaseStep(listData[cIndex]["end"], 1);
        if (cIndex + 1 < list.length) {
          sectionStyleEaseStep(listData[cIndex + 1]["start"], 1);
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
    sectionStyleEaseStep(listData[cIndex]["process"], rate);
  } else if (cType == "ease") {
    sectionStyleEaseStep(listData[cIndex]["end"], rate);
    if (cIndex + 1 < list.length) {
      sectionStyleEaseStep(listData[cIndex + 1]["start"], rate);
    }
  } //執行效果
};
window.addEventListener("scroll", scroll);
init();
scroll();
