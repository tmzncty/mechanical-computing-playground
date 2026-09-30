# Mechanical Computing Playground

**Live exhibit:** <https://tmzncty.github.io/mechanical-computing-playground/> · 机械计算游乐场

> 目标不是做“复古计算器皮肤”，而是让人看见：**一个数学操作究竟怎样被齿轮、拨轮、棘轮、进位机构、曲柄、按键、位架和连续机械量做出来。**

## 项目目标

这个仓库用可交互模拟、最小机制模型和历史资料，把“计算”重新还原成机械动作。

我们关心的不是只有结果：

```text
27 × 4 = 108
```

而是：

```text
输入 27
→ 人执行一次或多次机械操作
→ 数值状态进入机构
→ 累加 / 进位 / 移位
→ 计数器或结果寄存器变化
→ 得到 108
```

更进一步，我们还会问：

- 数字到底存在于哪里：轮的位置、有效齿数、伸出的拨针、按键行程、轴角，还是控制板？
- 哪一部分“算法”由操作者记住，哪一部分被写进机器结构？
- 为什么同一个算术操作，在不同机械架构上会变成完全不同的人机操作协议？

## 当前状态

仓库已经越过“第一批脚手架”阶段：TypeScript/Vite/Vitest、确定性 state/event/replay 核心、carry fixtures、finite difference、carriage shift、revolution counter、stepped drum、pinwheel、continuous integrator、Stage A/B backprop，以及主要浏览器展项都已经存在。

当前最大缺口不再是“没有代码”，而是：**历史研究、来源定位和机制证据还没有跟上实现速度。**

请以这些文件为准：

- [`STATUS.md`](STATUS.md)：当前仓库做到了什么、还缺什么；
- [`docs/EVIDENCE_POLICY.md`](docs/EVIDENCE_POLICY.md)：区分数学事实、历史记录、工程复原和教学抽象；
- [`docs/RESEARCH_GAPS.md`](docs/RESEARCH_GAPS.md)：接下来最值得写的研究口子；
- [`ROADMAP.md`](ROADMAP.md)：前向路线，不再承担“现状账本”；
- [`TODO.md`](TODO.md)：下一批 bounded tasks。

`IMPLEMENTATION_PLAN.md` 仍然保留为设计/依赖规格，但其中很多旧 checkbox 早于后续实现，**不能再当作当前状态真相**。

## 明确不重复造轮子

Babbage Difference Engine、Analytical Engine、Curta 等已经存在不少模拟器和复原项目。本项目不以“再写一个只能算出同样结果的 emulator”为目标。

本仓库更强调：

- **机制可视化**：为什么这一状态会带动下一状态；
- **信息流**：数值在哪个机械部件中“存在”；
- **操作成本**：一次加法、乘法、进位到底需要多少机械动作；
- **人机协议**：是拨盘、设数后摇曲柄、直接按键累加，还是连续轴耦合；`#/arithmetic-labor` 用现有确定性事件流比较操作者与机器各自承担的算术责任，不做效率排名；
- **错误与限制**：卡位、进位链、位数、回差、无效状态、人工操作顺序；`#/mechanical-error-control` 用来源分离的资料卡比较 Thomas、Odhner/Talamini 与 Bush frontlash 责任，不伪造可靠性概率；
- **跨机器比较**：同一个计算，在不同机械架构上如何实现；
- **证据边界**：哪些来自实物/专利/手册，哪些来自复原，哪些只是教学模型；`#/source-atlas` 用差分机二号、Bush 微分分析机、Curta、分析机四条资料轨道，逐条展示具名档案/实物/专利/影印文献支持什么、不能确认什么。

## 机制优先，而不是整机优先

仓库已经具备或正在研究的机制包括：

- 十进制数字轮；
- 单级与连续进位；
- carriage shift（位架移位）；
- revolution counter（转数计数器）；
- Leibniz/Thomas 系 stepped drum 概念模型；
- Odhner 系 pinwheel 概念模型；
- finite differences（有限差分）列联动；
- continuous integrator（连续积分）最小模型；
- key-driven accumulation（按键即运算）研究线；
- direct multiplication（直接乘法）功能状态模型与可重放交互展项；
- operator-driven division（操作者驱动除法）：重复减法、越界、加回纠正、位架与分位商计数；
- setting–crank interlock（设定—曲柄互锁）：把合法阶段、锁定权限与周期边界做成可重放状态事件；
- punched/program cards 与离散控制的后续研究空间。

这些机制可以组合成机器，也可以脱离整机单独比较。

## 机器与案例

按“机制差异”而不是名气排序：

- Pascaline：十进制加法、sautoir carry、补数减法；
- Leibniz / Thomas Arithmometer 系：阶梯鼓轮与重复曲柄乘除；
- Odhner / Brunsviga 系：pinwheel；
- Comptometer：key-driven full keyboard，按键本身就是累加操作；
- Millionaire：把乘法表的一部分写进直接乘法控制机构；
- Curta：高度压缩的手摇十进制机械算法机器；
- Difference Engine：有限差分与自动制表；
- Analytical Engine：Store / Mill / cards / information flow；
- Differential Analyzer / mechanical integrators：连续量与机械积分。

其中并不是每一个都要变成完整 emulator。

## 架构原则

不要为了“像机器”就先上复杂 3D 物理引擎。

```text
Mechanism state model
        ↓
Deterministic transition / event engine
        ↓
Evidence-aware interpretation layer
        ↓
2D/3D visualization adapter
        ↓
Interactive controls
```

核心状态应该可测试，例如：

```json
{
  "mechanism": "decimal-wheel",
  "position": 9,
  "input_steps": 1,
  "next_position": 0,
  "carry": true
}
```

这样“机械逻辑”和“动画”不会绑死，也不会因为动画画了一根连杆就反过来把它当成历史事实。

## 证据规则

旧版仓库曾用 A–D 同时表达“史料强弱”和“是不是教学抽象”，这会混淆不同问题。

新规则见 [`docs/EVIDENCE_POLICY.md`](docs/EVIDENCE_POLICY.md)：

```text
M = mathematical / computational
H = historical record
R = reconstruction / engineering interpretation
P = pedagogical / counterfactual model
```

历史/复原 claim 再单独标：

```text
E1 = direct / primary
E2 = authoritative reconstruction / institutional synthesis
E3 = reliable secondary
E4 = open / inference
```

例如“有限差分的数学性质”是 M，不是“历史证据 A”；“网站上的 generic carry arrow”是 P，不是“历史证据很差”。

## 每个重要机器/机制至少要说明

```text
question
claim type
sources
what the source directly establishes
what is reconstructed/inferred
state model
operations
limitations
what this project simplifies
open uncertainties
```

命名历史机器仍建议维护：

```text
machines/<name>/
├── README.md
├── mechanism.md
├── state-model.md
├── operations.md
├── limitations.md
└── sources.md
```

但不要为了满足目录形状制造空文档。

## 已有核心实验

### Visible Carry

用 `0099 + 1` 看见多级 carry，而不是数字瞬间变成 `0100`。

`#/visible-carry` 在原有 `0099 + 1` 串行 P/M 事件下方比较 Pascal/Felt、Odhner/Talamini 与 Thomas 1820/1865/1880 的来源边界。页面用同一组三段递增 P/M 序数槽说明依赖顺序，同时明确 Thomas 1865 阶梯鼓错相不等于 Odhner/Marchant 旋转进位螺旋；这些槽不是历史角度、毫秒、齿位、安全转速或失效概率。研究入口：[`research/carry-is-the-hard-part.md`](research/carry-is-the-hard-part.md)、[`research/carry-architecture-source-map.md`](research/carry-architecture-source-map.md)、[`research/rotary-carry-scheduling-source-map.md`](research/rotary-carry-scheduling-source-map.md)、[`research/stepped-drum-carry-source-map.md`](research/stepped-drum-carry-source-map.md)。

### Finite Difference

通过平方数/立方数 preset 展示恒定高阶差分如何把多项式制表变成重复加法；`#/finite-difference` 还把“数值已计算”与“检查副本/母版输出角色”分开单步呈现。

数学模型、Babbage 设计、1991/2002 现代复原、Scheutz 实际建成的打印差分机与本仓 P/M 输出流必须分开。来源地图：[`research/difference-engine-source-map.md`](research/difference-engine-source-map.md)。

### Persistent Output Contracts

`#/output-contracts` 把工作累加器与持久记录分开：`+12`、`+8`、小计、`+5`、总计形成结构化记录；小计保留累加器，总计清零，但纸面式记录不会随之消失。它是经过测试和重放验证的 P/M 台账，不是 Burroughs 打印机构复原。页面同时分开比较非打印结果寄存器、已识别的 Burroughs 打印对象、US 885,202 的总计/小计语义与差分机持久输出问题。研究入口：[`research/output-and-audit-trail.md`](research/output-and-audit-trail.md)。

### Multiplication Compare

仓库已有 repeated addition / stepped drum / pinwheel / direct multiplication 四路比较。直接乘法分支把 Otto Steiger / Millionaire 所代表的架构差异变成可单步、可重放的功能模型：乘法表的一部分不再由操作者通过重复曲柄提供，而由机器的选择机构承载。模型刻意不宣称复原 Millionaire 控制板的具体几何。详见 [`research/multiplication-mechanisms.md`](research/multiplication-mechanisms.md)。

### Operator-Driven Division

`8478 ÷ 314` 不由隐藏的 `divide()` 直接给出 27，而由按数位重复减法、显式越界、加回纠正、位架下移和商/转数计数逐步产生。它是 P/M 通用操作者流程，不声称复原 Thomas、Burkhardt 或 Curta 的内部几何。研究入口：[`research/subtraction-and-division.md`](research/subtraction-and-division.md)。

### Controls and Interlocks

`#/controls` 展示一个不承担数值运算、却保护运算正确性的 P/M 机制：原位允许设定；开始曲柄周期时先锁住设定，再释放曲柄；运转中修改设定会被拒绝；完成后曲柄回到原位并重新开放设定。页面下方另以带来源边界的资料卡比较 Thomas 模式/计数/归零、Odhner 曲柄原位锁、Felt 取消与进位张力释放、Turck 按键即时驱动及 Pascaline 补数边界；这些资料不把通用事件顺序冒充为历史复原。来源地图：[`research/control-and-zeroing-source-map.md`](research/control-and-zeroing-source-map.md)。

### Continuous Mechanical Integration

`#/continuous` 把两个输入量的加法关系、独立坐标推进、积分贡献与描迹输出做成可单步、可重放的 P/M 检查链。Smithsonian 组件记录只支持历史部件角色；本仓的连接、数值和停格式顺序不是 Bush Differential Analyzer 的几何或真实时序。研究入口：[`research/differential-analyzer.md`](research/differential-analyzer.md)。

跨机器查看“数字和控制在哪里、由什么动作推进”：[`docs/REPRESENTATION_AND_PROTOCOL.md`](docs/REPRESENTATION_AND_PROTOCOL.md)。

### Computation Before Bits / 比特之前的计算

[`research/computation-before-bits.md`](research/computation-before-bits.md) 把机械计算、连续模拟、雷达测量/伺服、磁芯 RAM 与 Apollo core-rope 放进同一条架构谱系里：**数学关系不一定先变成数字再交给 CPU，材料、几何、频率、相位、轴角、磁化状态和布线拓扑本身都可以承担表示与计算。** 这条研究线重点比较 representation / transformation / control / readout，不把教学类比冒充历史机器的精确几何。

### Key-Driven Computation

新研究线：Comptometer 说明“输入”和“执行”不一定是两步。按键本身就可以是计算循环。详见 [`research/key-driven-computation.md`](research/key-driven-computation.md)。

### Hand-Crank Backpropagation

这是一个**反事实教学机械**，不是历史复原。

设想把一个极小神经网络的：

```text
forward
→ output
→ error
→ gradient
→ weight update
```

全部变成可手摇、可单步、可查看内部状态的机械过程。

完整边界：[`docs/ANCIENT_BACKPROP.md`](docs/ANCIENT_BACKPROP.md)。已有真正的机械神经网络与 physical learning 研究必须与本项目的教学翻译严格区分。

## 展示方式

普通访客不应该为了看一个机械展品先 clone 仓库。

```text
GitHub Pages = 展厅
Git repository = 实验室
```

Pages workflow 已存在；最近一次验证记录显示仓库设置仍曾阻挡真正部署。最新发布状态见 [`STATUS.md`](STATUS.md) 与 [`docs/VERIFICATION.md`](docs/VERIFICATION.md)。

## 现在最值得写的内容

优先级见 [`docs/RESEARCH_GAPS.md`](docs/RESEARCH_GAPS.md)。最重要的几条是：

1. Pascaline / Comptometer 等真实 carry 架构；
2. stepped drum / pinwheel / Millionaire 的乘法算法分工比较；
3. Comptometer 式 key-driven computation；
4. subtraction / complement / division / zeroing / correction / interlock；
5. Curta、Analytical Engine、Differential Analyzer 的页码/图号/专利级来源地图；
6. “数字在哪里存在”的跨机器 representation comparison；
7. human-machine division of arithmetic labor；
8. printing / paper tape / output audit trail；
9. reliability / torque / tolerance / wear，但必须有史料或工程实验再做。

## AI 施工入口

后续 coding/research agent 的读序应是：

1. [`README.md`](README.md)
2. [`STATUS.md`](STATUS.md)
3. [`docs/EVIDENCE_POLICY.md`](docs/EVIDENCE_POLICY.md)
4. [`docs/RESEARCH_GAPS.md`](docs/RESEARCH_GAPS.md)
5. [`docs/PRIOR_ART.md`](docs/PRIOR_ART.md)
6. [`ROADMAP.md`](ROADMAP.md)
7. [`TODO.md`](TODO.md)
8. 相关源码 / tests / research

历史的 [`IMPLEMENTATION_PLAN.md`](IMPLEMENTATION_PLAN.md) 继续作为设计规格参考，但不要按过期 checkbox 重做已经存在的代码。

## 项目原则

**先把机械逻辑和证据边界讲明白，再追求漂亮的齿轮动画。**

如果一个 demo 把所有齿轮隐藏掉但仍能清楚展示状态转换，它比一个视觉很酷却解释不了进位的 3D 模型更接近本项目目标。

如果一个齿轮动画看起来很真实，却说不出它对应哪份实物、专利、图纸、手册或复原依据，它就应该退回教学抽象。

这个仓库最终最好能回答的不只是：

> 这台机器算出了什么？

而是：

> **数字在哪里？谁提供了算法步骤？什么部件动了？为什么按这个顺序动？哪些是史实，哪些是我们为了理解而画出的模型？**
