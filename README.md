# 滾動效果

[線上觀看](https://virtools.github.io/scrollEffect/)

#### time 可使用符號 順序 [~ or _] -> |

<table>
  <tr>
    <th>符號</th>
    <th>範例</th>
    <th>說明</th>
  </tr>
  <tr>
    <td>~</td>
    <td>0.1~0.3</td>
    <td>數據過度：開始0.1秒，結束0.3秒</td>
  </tr>
  <tr>
    <td>_</td>
    <td>0.1_0.3</td>
    <td>前數據添加：開始0.1秒，持續0.3秒</td>
  </tr>
  <tr>
    <td>-></td>
    <td>0.1->0.3</td>
    <td>元件接續變化：假設3個元件，分配到0.1秒,0.2秒,0.3秒</td>
  </tr>
  <tr>
    <td>|</td>
    <td>0.1|0.3</td>
    <td>間隔亂數：0.1秒到0.3秒之間亂數</td>
  </tr>
</table>

#### style,attr 可使用符號 順序 \$f{name(p0[,p1...pN])} ; ? ! [~ or _] , -> |

<table>
  <tr>
    <th>符號</th>
    <th>範例</th>
    <th>說明</th>
  </tr>
  <tr>
    <td>$f{name(p0[,p1...pN])}</td>
    <td>$f{aaa(10,20)}</td>
    <td>執行方法：aaa(10,20)</td>
  </tr>
  <tr>
    <td>;</td>
    <td>123;400</td>
    <td>分組：${0}=123,${1}=400</td>
  </tr>
  <tr>
    <td>?</td>
    <td>123~400?px</td>
    <td>單位：123px~400px</td>
  </tr>
  <tr>
    <td>!</td>
    <td>123!456</td>
    <td>範圍開關：在進入時間範圍時，顯示123，反之456</td>
  </tr>
  <tr>
    <td>~</td>
    <td>0.1~0.3</td>
    <td>數據過度：假設時間0~1秒變化對應0.1~0.3</td>
  </tr>
  <tr>
    <td>_</td>
    <td>0.1_0.3</td>
    <td>前數據添加：假設時間0~1秒變化對應0.1~0.4(0.1+0.3)</td>
  </tr>
  <tr>
    <td>,</td>
    <td>10,5</td>
    <td>分組：${0}=10,${1}=5</td>
  </tr>
  <tr>
    <td>-></td>
    <td>0.1->0.3</td>
    <td>元件接續變化：假設3個元件，分配到0.1,0.2,0.3</td>
  </tr>
  <tr>
    <td>|</td>
    <td>0.1|0.3</td>
    <td>間隔亂數：0.1到0.3之間亂數</td>
  </tr>
</table>

#### rule 可使用符號 ${N} \$f{name(p0[,p1...pN])}

<table>
  <tr>
    <th>符號</th>
    <th>範例</th>
    <th>說明</th>
  </tr>
  <tr>
    <td>${N}</td>
    <td>${0}</td>
    <td>參數：分組的第一個數值</td>
  </tr>
  <tr>
    <td>$f{name(p0[,p1...pN])}</td>
    <td>$f{aaa(10,${0})}</td>
    <td>執行方法：aaa(10,${0})</td>
  </tr>
</table>

---

#### 待完成紀錄

<ol>
  <li>style 0.5:10 占比</li>
  <li>style 0.0:0~0.2:50~1.0:100 占比分配</li>
</ol>
