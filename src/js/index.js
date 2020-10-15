import "../css/index.scss";
import { lagrangeInterpolation } from "./number";
import jScroll from "../js/jScroll";

import list from "../res/data";
import { cropNumber } from "../js/number";
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
      s += ` L ${lagrangeInterpolation([-r, w + r], rate) + x},${r + y}`;
    }
    return `M ${w},${h} L 0,${h}` + s;
  },
  wave_texture: (el, x, y, rate) => {
    x += 10 * Math.sin(2.4 * rate * 2 * Math.PI);
    y += 15 * Math.cos(4 * rate * 2 * Math.PI);
    return x + "," + y;
  },
  bubble: (el, val, rate, r) => {
    return val + r * Math.sin(2 * rate * 2 * Math.PI);
  },
  wave_text: (el, val, y) => {
    return 20 * Math.sin(val * 2 * Math.PI) + y;
  },
  transform: function (el, w, h) {
    let rate = 1;
    if (window.innerWidth / window.innerHeight > w / h) {
      rate = window.innerWidth / w;
    } else {
      rate = window.innerHeight / h;
    }
    const x = window.innerWidth * 0.5 - w * rate * 0.5;
    const y = window.innerHeight * 0.5 - h * rate * 0.5;
    //console.log(rateW, rateH);
    return `translate(${x},${y}) scale(${rate})`;
  },
};
const jScroll01 = new jScroll();
jScroll01.setData(list, listDataFun);

const init = () => {
  scroll();
};

const rateEl = document.getElementById("rate");
const wrapEl = document.getElementById("wrap");
const scrollTarget = document.getElementById("scroll");
console.log();
const scroll = () => {
  const target = scrollTarget == document.body ? document.documentElement : scrollTarget;
  const scrollTop = target.scrollTop;
  const max = wrapEl.offsetHeight / scrollTarget.offsetHeight - 1;
  const cRate = cropNumber(scrollTop / scrollTarget.offsetHeight, 0, max);
  rateEl.textContent = scrollTarget.offsetHeight + "-" + cRate;
  console.log(cRate);
  jScroll01.update(cRate);
};
window.addEventListener("resize", () => {
  scroll();
});
if (scrollTarget == document.body) {
  scrollTarget.onscroll = scroll;
} else {
  scrollTarget.addEventListener("scroll", scroll);
}
init();
