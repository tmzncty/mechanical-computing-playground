# Computation Before Bits / 比特之前的计算

> 主题：**数学关系不一定先被翻译成数字，再交给通用 CPU。物理结构本身也可以承担表示、运算、存储和控制。**

Checked 2026-10-01.

## Question

在晶体管、现代 RAM 和通用处理器之前，人类如何让机器“计算”？机械、模拟、电磁和早期数字系统之间，哪些概念其实是连续的？

本条目不把“旧机器”当作现代计算机的低配替代品，而把它们看成另一种架构选择：

```text
物理量
  ↓
结构 / 材料 / 电路把关系直接实现
  ↓
另一个物理量
```

例如：

```text
轴角 → 齿轮比 → 新轴角
频率差 → 混频器 → 拍频
左右回波强度差 → 差分电路 → 角度误差
圆盘/滚轮位移 → 机械积分器 → 积分量
磁芯/穿线拓扑 → 读出脉冲 → 存储数据
```

这条线与本仓库现有的 stepped drum、pinwheel、finite difference、continuous integrator、human-machine protocol 不是新项目，而是它们的共同上位问题：

> **信息在哪里？算法写在哪里？哪一部分工作由材料、几何、操作者或通用计算机承担？**

---

## Claim types

### M — Mathematical / computational

- 对数刻度可以把乘法转化为长度的加法。
- 机械积分器可以用连续运动表示积分关系。
- 雷达测距可由往返时间差映射到距离：(R=cDelta t/2)。
- 多普勒频移可编码径向速度。
- 差分、混频、积分、比较等操作都不要求以离散二进制软件实现。

### H — Historical record

- 19–20 世纪的 planimeter、integrator、differential analyzer 以连续物理量承担计算。
- Project Mercury 的全球跟踪网络把雷达观测与地面 IBM 7090 计算结合起来。
- Apollo Guidance Computer 同时使用可擦写磁芯存储和固定 core-rope memory。
- core-rope 的固定程序必须在制造阶段物理实现，软件变更意味着重新制造 rope memory。

### R — Engineering interpretation

- 可以把凸轮轮廓视为“函数的物理编码”、把齿轮连接关系视为“程序拓扑”、把轴角视为“寄存器状态”；这些类比有解释价值，但不是历史使用者的统一术语。
- “物理结构即算法”是跨机器比较框架，不应被反写成某一历史机器设计者的原话。

### P — Pedagogical model

- 本仓库未来可以把同一个抽象操作分别映射到机械、模拟、电磁和数字实现，以显示“数学不变、承载介质变化”。
- 任何简化雷达、磁芯或积分器动画都必须明确标为 P，除非具体几何得到原始图纸或实物证据支持。

---

## 1. 计算不等于 CPU 执行指令

现代计算的默认直觉通常是：

```text
现实
→ 传感器
→ ADC
→ RAM
→ CPU
→ 数值结果
→ 控制输出
```

但更早、也更广泛的一类系统是：

```text
现实物理量
→ 另一个经过设计的物理系统
→ 结果物理量
```

中间未必存在“27.3”“0x3F2A”或任何显式数字。

例如双金属片恒温器可以直接完成：

```text
温度
→ 不同热膨胀率
→ 弯曲
→ 触点开 / 关
```

没有变量 `temperature`，但控制关系仍然存在。

这提示本仓库应该把“计算”至少拆成四个问题：

1. **Representation**：量如何存在？
2. **Transformation**：什么结构实现变换？
3. **Control**：谁决定何时执行？
4. **Readout**：结果如何被机器或人取得？

---

## 2. 机械结构可以直接承载数学关系

### 2.1 齿轮、轴角和比例

如果一个轴角 (	heta_1) 通过固定齿数比驱动另一个轴，那么几何关系可以直接实现：

[
	heta_2 = k	heta_1
]

这里没有“乘法指令”。

齿数比本身就是比例常数 (k)。

因此从教学角度，可以把：

- 轴角看作状态变量；
- 齿轮比看作固定乘法；
- 差动机构看作加减组合；
- 凸轮轮廓看作预先制造的函数映射；
- 机械限位和互锁看作控制逻辑。

这些是跨架构解释，不等于特定历史机器的精确复原。

### 2.2 连续积分

Smithsonian 保存和整理的 mechanical integrator / differential analyzer 资料说明，模拟计算长期使用长度、转角、位移等连续量表示数值；20 世纪 differential analyzer 则把 wheel-and-disc integrator 等部件组合起来求解工程微分方程。

对本仓库最重要的不是“房间大的老计算机”这个视觉奇观，而是：

[
y=int x,dt
]

可以被实现为**接触几何和连续运动的累计关系**。

也就是说，“积分器”可以先是一件机械部件，后来才是软件库里的函数。

---

## 3. 雷达：测量与计算长在同一个系统里

雷达特别适合作为“物理结构与逻辑计算合体”的案例。

### 3.1 距离

雷达发射脉冲，再测回波时间：

[
R=rac{cDelta t}{2}
]

早期显示系统可以把时间轴直接映射到 CRT 扫描位置，因此“回波晚多少”直接变成“亮点离原点多远”。

这里的一部分“计算”由：

- 已知传播速度；
- 定时电路；
- 扫描电路；
- 显示几何；

共同完成，而不是由通用软件逐条执行。

### 3.2 速度

多普勒关系把径向速度编码进频率变化。混频器可把发射信号和回波结合，产生较低的差频 / 拍频。

从计算抽象看：

```text
两个高频输入
→ 非线性混频
→ 和频 / 差频
→ 取差频
→ 速度信息
```

所以“减法”不一定表现为 ALU 里的 SUB 指令；它也可能表现为电路和波的叠加关系。

### 3.3 方向与闭环跟踪

两个或多个接收通道可形成角度误差信号。若左右通道强度分别为 (S_L,S_R)，可构造：

[
e=S_L-S_R
]

再把误差信号送入伺服系统，驱动天线回到零误差方向。

于是完整链条是：

```text
目标方向
→ 回波幅度差
→ 电压误差
→ 伺服电机
→ 天线转动
→ 误差减小
```

这已经是一个闭环控制器，即使系统中没有现代 CPU。

### 3.4 Mercury：传感器、地面大型机和飞船的分工

NASA 的 Mercury 历史资料记载，Goddard 的两台 IBM 7090 并行工作，根据跟踪数据持续计算平滑后的位置、预测未来位置，并为各跟踪站生成捕获信息。

这非常适合本仓库的“human-machine / subsystem division of labor”主题：

```text
雷达 / 无线电测量现实
        ↓
地面网络传输观测
        ↓
IBM 7090 求轨道状态与预测
        ↓
下一站提前准备捕获
        ↓
飞船执行有限的实时控制
```

这不是“飞船上的小电脑独自完成一切”，而是一个分层计算系统。

---

## 4. 磁芯：同一种材料可以承担两种完全不同的“记忆”

Apollo 是理解“存储不一定长得像现代 RAM”的好案例。

### 4.1 Erasable core memory

AGC 的 erasable memory 使用铁氧体磁芯的磁化状态保存可写数据。

一个磁芯的两种稳定磁化方向可以表示二进制状态。经典磁芯 RAM 的读取通常是破坏性的：检测磁芯是否在强制写入某方向时发生翻转，再把原值恢复。

这里：

> **磁化方向就是状态。**

### 4.2 Fixed core-rope memory

core-rope 不应和普通磁芯 RAM 混为一谈。

NASA 的 Apollo 资料给出：

- erasable memory：2,048 个 16-bit words；
- fixed memory：36,864 个 16-bit words；
- fixed memory 由 core-rope modules 构成，读出非破坏性。

MIT 对 Apollo 工程的回顾进一步强调：rope memory 中的程序是制造出来的；单个位不能像普通 RAM 一样事后改写，软件修改需要重新制造新的 rope。

在最适合本仓库的抽象层上：

> **程序不是“装进一个空白介质”，而是被做进介质的物理拓扑。**

因此可以把这条线与机械计算并置：

```text
凸轮轮廓      → 固定函数
齿轮连接      → 固定变换拓扑
core-rope 穿线 → 固定程序 / 常量
RAM 磁化状态  → 可变状态
```

这种并置是 R/P 级跨架构解释，不是说历史设计者把它们视为同一种东西。


### 4.3 FeRAM / FRAM：让铁电极化成为可保持的 bit

磁芯 RAM 之后还有一个很适合放进这条谱系的现代案例：**ferroelectric RAM（FeRAM / F-RAM / FRAM）**。

它与磁芯 RAM 的共同点不是材料相同，而是更抽象的一件事：

> **利用材料本身可以长期停留的两个物理状态表示二进制信息。**

传统 1T1C FeRAM 单元由一个访问晶体管和一个铁电电容组成。二进制信息保存在铁电材料的两种稳定极化方向中；写入脉冲使极化切换，撤掉外部电场后仍保留剩余极化，因此掉电后数据不会像普通 DRAM 那样立即消失。

从本仓库的表示框架看：

```text
magnetic-core RAM:
    magnetic orientation
        ↓
      bit state

1T1C FeRAM:
    remanent ferroelectric polarization
        ↓
      bit state
```

“中心离子落入两个势阱”可以作为某些铁电材料的教学图像，但不应被写成所有商用 FRAM 材料与器件的统一微观模型。更稳妥的表述是：**器件利用可翻转并可保持的铁电极化态编码信息。**

#### 4.3.1 读取：知道状态的同时，可能把状态改掉

传统 1T1C FeRAM 的读取很像经典磁芯 RAM，也具有破坏性。

读操作给铁电电容施加一个读取脉冲：

- 若原有极化与读取方向一致，主要出现非翻转响应；
- 若原有极化方向相反，就会发生极化翻转，并产生更大的 switching charge；
- sense amplifier 通过两种响应的差异判断原来的 0 / 1；
- 因为其中一种状态在检测过程中已经被翻转，随后必须执行 restore / write-back。

因此：

```text
stored polarization
      ↓
read pulse
      ↓
switching charge or non-switching response
      ↓
sense amplifier
      ↓
logical 0 / 1
      ↓
restore original state if needed
```

这与磁芯 RAM 的历史连续性很值得强调：

> **“非易失”并不自动意味着“无扰动读取”。**

磁芯 RAM 和经典 1T1C FeRAM 都说明，存储可以由材料状态承担，而读取本身仍可能是一个会改变被测状态的物理过程。

#### 4.3.2 “151 年 / 100 万亿次”必须绑定到具体器件

Infineon 当前的 FM25V02A 是一个很好的工程例子。其官方资料给出的规格包括：

- 256 Kbit，逻辑组织为 32K × 8，也就是 32 KiB；
- SPI 最高 40 MHz；
- endurance：`10^14` 次 read/write cycles；
- data retention：65 °C 下至少 151 年；
- 同一数据表同时给出 85 °C 下至少 10 年；
- 写入没有 Flash / EEPROM 那类 erase/program 等待，数据可在总线传输完成后立即保持。

所以“永久存储”“无限擦写”只能当作工程宣传式简称，不能作为严格结论。

更准确的说法是：

> **某些商用 F-RAM 在规定温度和工作条件下具有极高的写入耐久与很长的数据保持时间。**

同时，`10^14` 次也不是所有 FeRAM 器件、所有材料体系和所有温度条件下的统一数字。

#### 4.3.3 为什么它没有替代 NAND Flash

FRAM 的优势非常适合：

- 高频计数器；
- 配置和校准数据；
- 设备状态；
- 掉电前最后状态；
- 日志与事件记录；
- 高频 checkpoint；
- 工业控制中需要频繁持久化的小块数据。

但高耐久并不等于高密度。FM25V02A 总容量只有 256 Kbit / 32 KiB，而现代 NAND Flash、SD 卡和 SSD 的容量已经进入 GB–TB 级。

因此两类器件优化的是不同问题：

```text
FRAM:
    frequent small persistent updates
    fast writes
    very high endurance
    modest density

NAND Flash:
    very high density
    large bulk storage
    erase/program management
    lower per-cell endurance
```

这也是一个很好的“架构约束”案例：**最适合保存一个 bit 的物理机制，不一定最适合把数十亿、数万亿个 bit 压进最低成本的面积里。**

#### 4.3.4 与本仓库主题的连接

把磁芯、core-rope 和 FRAM 放在一起，可以看到三种完全不同的“信息在哪里”：

| 技术 | 信息主要存在于哪里 | 可改写 | 典型读取特征 |
|---|---|---:|---|
| magnetic-core RAM | 磁芯磁化方向 | 是 | 经典实现通常破坏性读取后恢复 |
| core-rope memory | 导线与磁芯的制造拓扑 | 否（现场） | 固定信息，非破坏读取 |
| 1T1C FeRAM | 铁电电容剩余极化方向 | 是 | 传统实现破坏性读取后恢复 |

所以从机械计算一路走到现代非易失存储，仍然可以用同一个问题追问：

> **一个 bit 到底是什么？**

在逻辑层，它只是 0 或 1；在物理层，它可以是：

- 一个磁芯朝哪个方向磁化；
- 一根导线是否穿过某组磁芯；
- 一个铁电电容保持哪一个极化方向。

这使“bit”不再像脱离材料的抽象符号，而是变成一个工程问题：

> **找出两个足够稳定、可区分、可切换、可读出的物理状态，然后建立可靠的寻址、感测和恢复机制。**

#### 4.3.5 Contemporary open-source demonstration

用户提供的 OSHWHub 开源项目：

- <https://oshwhub.com/fangs233/project_blcrwqhk>

把 FRAM 包装成一个可实际使用的小型存储项目，适合作为本仓库未来交互展项或硬件复现的 contemporary demonstration。

但它在证据体系中的位置应当明确：

- 可以作为 **E1 contemporary artifact** 证明今天的爱好者可以直接使用商用 FRAM 做设备；
- 不应单独用来证明铁电物理机制、耐久或保持时间；
- 器件规格应回到芯片原厂数据表；
- “永久”“无限”等项目宣传措辞不能不加限定地进入历史/工程结论。

此外，不能仅凭“FRAM”这一类别推断任意器件都具有航天级抗辐射能力；radiation-hardness 必须绑定到具体器件、工艺与辐照测试。


---

## 5. 为什么几 KB 也能上天

“内存小”不等于“数学简单”。

一个导航 / 制导系统真正反复维护的核心状态可能只是：

```text
位置
速度
姿态
角速度
时间
传感器测量
目标状态
若干控制量
```

也就是一个很小但不断更新的状态向量。

Apollo 的固定程序、常量大量放在 fixed memory，可变状态才占用 erasable memory。NASA 对 Apollo 11 程序告警的回顾明确提到：因为 erasable memory 很小，同一地址会在不同阶段承担不同变量用途。

所以一个有用的区分是：

> **计算量、程序规模、工作集大小、长期数据量不是同一个问题。**

现代软件经常同时承担 GUI、文件系统、网络栈、动态运行时、大规模缓存和历史数据；早期航天计算机承担的是高度限定、预先定义、实时性很强的一组状态转换。

它们不能仅以“RAM 有多少”做能力比较。

---

## 6. 一条连续的架构谱系

本仓库可以把这些对象放在同一条连续谱上，而不必另开项目：

| 层级 | 状态表示 | 运算在哪里 | “程序”可能在哪里 |
|---|---|---|---|
| 机械 | 齿轮位置、轴角、滑块位置 | 几何、啮合、连续运动 | 齿轮拓扑、凸轮、操作顺序 |
| 模拟机电 | 电压、频率、相位、轴角 | 运放、滤波、混频、伺服 | 接线、元件参数、机构连接 |
| 早期数字 | 磁芯状态、寄存器 | 逻辑门、微逻辑 | core rope、固定逻辑、指令 |
| 现代数字 | bits / words / tensors | CPU/GPU/ASIC | 软件、固件、模型参数 |
| 可重构数字逻辑 | flip-flop / BRAM / distributed state | LUT、DSP、状态机、可配置互连 | HDL + synthesis/place-and-route + bitstream |

关键不是做“古代 vs 现代”的价值排名，而是问：

> **同一个抽象数学关系，在不同材料和工程约束下，被放进了哪里？**

---


## 7. From Wiring the Algorithm to Compiling the Wiring

FPGA 给这条谱系补上了一个很有意思的现代回环。

如果把通用 CPU 的典型工作方式高度简化，可以写成：

```text
一组通用执行资源
→ 取指 / 译码 / 调度
→ 在时间上反复执行不同操作
```

FPGA 则允许设计者把一部分计算直接展开为空间中的数字逻辑：

```text
HDL / hardware description
→ elaboration / synthesis
→ logic network
→ place & route
→ configured FPGA
```

于是多个计数器、状态机、滤波器、串行接口或算术单元可以在芯片上作为彼此独立的硬件结构同时存在。

这里的区别不能夸张成“CPU 没有并行、FPGA 没有时序”。现代 CPU 本身包含大量并行执行单元，FPGA 设计也常有时钟、流水线和状态机。更准确的 R 级解释是：

> **CPU 倾向于让通用硬件在时间上复用；FPGA 允许把特定数据通路和控制逻辑在空间上展开。**

这与早期机械 / 模拟计算形成一种跨时代的结构类比：计算关系再次明显地“长在结构里”，只是结构从齿轮、凸轮、接线和运放网络，变成了 LUT、flip-flop、DSP block、BRAM 与可配置互连。

### 7.1 Zynq：把软件世界和可编程逻辑放在一颗芯片里

AMD/Xilinx Zynq-7000 把两类计算资源集成在同一 SoC：

- **PS (Processing System)**：包含 Arm Cortex-A9 处理器系统，可运行常规软件和操作系统；
- **PL (Programmable Logic)**：7-series FPGA 可编程逻辑。

UG585 列出的 PS–PL 接口包括：

- 2 个 PS→PL General Purpose AXI master；
- 2 个 PL→PS General Purpose AXI slave；
- 4 个面向 DDR/OCM 高带宽访问的 AXI_HP 接口；
- 1 个 Accelerator Coherency Port (AXI_ACP)。

因此，Zynq 不是简单地“CPU 旁边挂一块 FPGA”。PS 与 PL 被设计成可以共享数据、内存访问和中断/控制路径的一个系统。

对本仓库最重要的不是某个具体带宽数字，而是这种分工：

```text
PS / software
  负责策略、配置、文件、网络、复杂控制流
        ↕ AXI / memory / interrupts
PL / hardware
  负责确定时序的数据通路、状态机、I/O 与并行逻辑
```

这让“软件定义行为”和“结构实现行为”不再是二选一，而可以同时存在。

### 7.2 Amaranth：Python 不是在 FPGA 上“运行”

Amaranth 官方文档把它定义为一种用 Python 构造同步数字逻辑的硬件描述语言 / 工具链。普通 Python 代码在 elaboration 阶段构造 RTL 级数字电路 netlist；该设计可以被模拟、综合，或转换成 Verilog 后进入常规 FPGA 工具链。

因此：

```text
Python program
≠
FPGA runtime program
```

更接近：

```text
Python executes during design/elaboration
          ↓
constructs a hardware description
          ↓
netlist / Verilog / synthesis
          ↓
FPGA configuration
```

这和在 CPU 上运行 Python、C 或 Rust 是完全不同的关系。

从本仓库的比较框架看，可以把 HDL 看作一种“制造结构的描述语言”：它描述的不是下一条要执行的业务指令，而是寄存器、组合逻辑、状态转移和连接关系应该如何形成。

### 7.3 Excessive Motion controller：一个当代的软硬件分工案例

Excessive Motion 的 controller repository 把工程明确拆成：

- `controller-firmware`：FPGA HDL generation；
- `controller-software`：运行在控制器上的核心程序；
- `em-os`：生成控制器基础 Linux 系统的 PetaLinux 工程。

用户提供的 Excessive Overkill 视频和 fork 正是在解释这一类结构。

这个案例的价值不在于证明“FPGA 比 MCU/CPU 更好”，而在于它把两个不同层级同时摆在桌面上：

```text
Linux / processor:
    policy, orchestration, configuration

FPGA fabric:
    counters, interfaces, timing, state machines,
    application-specific datapaths
```

对于机器控制，这意味着一些对时序敏感的工作不必全部表现为：

```text
interrupt
→ software handler
→ instruction sequence
→ next interrupt
```

而可以表现为长期存在的硬件状态机和数据通路。

### 7.4 “编译布线”只是一个解释性简称

“From Wiring the Algorithm to Compiling the Wiring” 很适合做本节标题，但必须说明它是 **R/P 级比喻**。

现代 SRAM FPGA 并不是每次综合后真的把金属导线重新制造。bitstream 配置的是芯片里已经制造好的可编程资源，例如：

- LUT 的逻辑函数；
- flip-flop 和时钟相关配置；
- 可编程 routing / switch matrix；
- BRAM、DSP、I/O 等专用资源的工作方式。

所以更严谨的链条是：

```text
algorithm / control relation
        ↓
HDL structure
        ↓
synthesis + place & route
        ↓
configuration bits
        ↓
pre-fabricated programmable resources
become one particular digital machine
```

也就是说，“编译布线”不是字面上的重新布线，而是：

> **编译出一组配置，使预先制造好的可编程结构表现成这一台特定的数字机器。**

### 7.5 这条线为什么能接回机械计算

现在可以把整条谱系重新写成：

```text
mechanical:
    geometry / gear topology carries the relation

analog:
    component values / wiring / continuous physics carry the relation

fixed digital logic:
    gates and wiring carry the relation

stored-program CPU:
    general hardware repeatedly interprets instructions

FPGA:
    a stored description is compiled into a configured logic topology
```

因此 FPGA 并不是“回到机械时代”，也不是取消 stored-program computing。

真正值得比较的是一个更抽象的问题：

> **算法中有多少东西留在时间序列里，又有多少被展开进空间结构里？**

这也是为什么 FPGA retro-computing 很值得以后单独扩展：它并不只是让现代 CPU 更快地模拟旧机器，而可以重新实现旧 CPU、视频时序、音频逻辑和外设状态机，使“模拟一台机器”与“重新构造它的数字结构”之间出现新的边界问题。

---

## What the sources directly establish


### AMD — Zynq-7000 PS/PL architecture

直接支持：

- Zynq-7000 存在 Processing System 与 Programmable Logic 两个主要域；
- PS–PL 之间提供 GP、HP、ACP 等 AXI 接口；
- 四个 AXI_HP 接口为 PL master 提供通往 DDR/OCM 的高带宽数据路径；
- ACP 为 PL master 提供与处理器缓存体系相关的低延迟 / 可选一致性访问路径。

不直接支持：

- “CPU 是时间、FPGA 是空间”作为严格分类；
- “编译布线”作为芯片制造商术语；
- FPGA 在任何任务上都比 CPU/MCU 更适合。

### Amaranth — hardware description in Python

直接支持：

- Amaranth 是用 Python 构造同步数字逻辑的开源工具链；
- Amaranth 代码构造 RTL 级数字电路 netlist；
- 设计可被模拟、综合，或转换为 Verilog。

不直接支持：

- Python 代码本身作为 FPGA runtime workload 运行；
- 本仓库把 HDL 称为“制造结构的描述语言”的解释性类比。

### Excessive Motion — universal machine controller repository

直接支持：

- repository 自述为 open-source universal machine controller；
- repository 将 `controller-firmware` 描述为 FPGA HDL generation；
- 将 `controller-software` 描述为控制器核心程序；
- 将 `em-os` 描述为用于生成基础 Linux OS 的 PetaLinux project。

不直接支持：

- 所有低层实时控制均由 FPGA 完成；
- FPGA 相对 STM32/其他 MCU 的普遍性能优越性；
- 本节任何未由代码或文档逐项核对的具体寄存器映射。

### Smithsonian — Mechanical Integrators and Differential Analyzers

直接支持：

- analog device 以连续量（如长度）表示数值；
- planimeter / integrator 是长期存在的机械计算对象；
- 1930 年前后 MIT 的 differential analyzer 用于求解工程微分方程；
- Smithsonian 现存 wheel-and-disc integrator 等实物组件。

不直接支持：

- 本仓库任何简化动画的具体几何；
- “某个轴就是寄存器”这种现代计算机术语类比。

### NASA — Project Mercury history

直接支持：

- Goddard 的两台 IBM 7090 并行工作；
- 它们计算平滑位置、预测未来位置，并给跟踪站提供 acquisition 信息；
- Mercury tracking network 使用雷达、通信与地面计算协同工作。

不直接支持：

- 把整个系统概括成“云计算”或“瘦客户端”；这些只能是教学类比。

### NASA / MIT — Apollo Guidance Computer memory

直接支持：

- 2,048-word erasable magnetic core memory；
- 36,864-word fixed core memory / rope memory；
- fixed rope 不像普通 RAM 一样逐位现场改写；
- 软件变更需要重新制造 rope memory。

不直接支持：

- “rope = ROM PCB”这种完全等同；只能说功能上接近固定只读程序存储。

---

## What is reconstructed / inferred

1. **“拓扑就是程序”**  
   是跨机械、模拟和数字系统的解释框架。它适合教学，但不能冒充历史术语。

2. **“物理量本身在计算”**  
   指运算关系由材料、几何、电路或波传播直接实现；并不意味着系统无需设计、校准或人工解释。

3. **“计算机不需要数字”**  
   应更严谨地表述为：计算过程不必以离散数字编码实现。模拟计算仍然在表示和变换数量关系。

---

## What this repository should simplify

若做成可交互展项，建议只展示最小可验证关系：

### Panel A — Mechanical

```text
input shaft angle
→ gear ratio
→ output shaft angle
```

只说明比例映射，不冒充任何命名历史机器。

### Panel B — Radar / analog

```text
echo delay → range
left/right amplitude difference → pointing error
frequency difference → radial velocity
```

用理想化信号，不伪造真实 Mercury 雷达内部电路。

### Panel C — Memory

并排展示：

```text
core RAM:
magnetic state = mutable bit

core rope:
wiring topology = fixed information
```

重点是“状态存在在哪里”，不是做一个假的 Apollo AGC emulator。

### Panel D — Modern comparison

同一个抽象关系：

```text
y = kx
```

分别由：

- 齿轮比；
- 模拟电路；
- 数字乘法指令；

实现。

用户应该能看见：

> **数学关系没有变，承载它的物理机制变了。**

---

## Implementation consequence

本条目建议进入现有仓库，不另开 repo。

可新增一个未来页面：

```text
#/computation-before-bits
```

目标不是扩大历史机器清单，而是提供一个“架构桥梁”：

```text
mechanical representation
      ↓
continuous analog representation
      ↓
electromagnetic measurement/control
      ↓
fixed / mutable digital memory
      ↓
software-defined computation
      ↓
reconfigurable / spatial digital computation
```

与现有页面的关系：

- `#/continuous`：连续积分的具体入口；
- `#/arithmetic-labor`：操作者和机器如何分工；
- `#/mechanical-error-control`：物理误差与控制边界；
- `docs/REPRESENTATION_AND_PROTOCOL.md`：数字/状态到底存在在哪里；
- 本条目：解释为什么这些看似不同的机器仍然属于同一部“计算史”。

---

## Uncertainties / research gaps

- 需要更精确的一手材料说明不同早期雷达中“测距、测角、测速”分别由哪些模拟电路、显示器和地面计算机承担，不能把现代雷达框图倒投到所有历史系统。
- 若要把 V-2、火控计算机、舰载雷达或具体惯导加入展项，必须分别建立 source map；不能只凭“当时没有现代计算机”做泛化。
- core-rope 若做机制动画，需要进一步读取 MIT/NASA 原始逻辑图和制造资料，确认地址选择与 sense-line 组织后再画。
- differential analyzer 若从理想 integrator 进入真实几何，继续遵循现有 `research/differential-analyzer.md` 的来源边界。
- FPGA retro-computing（包括 MiSTer）若进入正文，需要进一步建立具体 core 的 source map，区分 cycle/timing-faithful reconstruction、functional compatibility 与纯软件 emulation，不能把“FPGA 实现”自动等同于“原机精确复原”。

---

## Sources


### H/E1 — Zynq / FPGA / Amaranth

- AMD, *Zynq-7000 SoC Technical Reference Manual (UG585) — PS–PL AXI Interfaces*:  
  <https://docs.amd.com/r/en-US/ug585-zynq-7000-SoC-TRM/PS-PL-AXI-Interfaces>

- AMD, *Zynq-7000 SoC Technical Reference Manual (UG585) — AXI_HP Interfaces*:  
  <https://docs.amd.com/r/en-US/ug585-zynq-7000-SoC-TRM/AXI_HP-Interfaces>

- AMD, *Zynq-7000 SoC Technical Reference Manual (UG585) — AXI_ACP Interface*:  
  <https://docs.amd.com/r/en-US/ug585-zynq-7000-SoC-TRM/AXI_ACP-Interface>

- Amaranth HDL, *Introduction*:  
  <https://amaranth-lang.org/docs/amaranth/v0.5.0/intro.html>

- Excessive Motion, *controller-software* repository:  
  <https://github.com/ExcessiveMotion/controller-software>

- Excessive Overkill, *controller-software* fork referenced by the video:  
  <https://github.com/ExcessiveOverkill/controller-software>

### H/E1 — Contemporary demonstration

- Excessive Overkill, FPGA controller video referenced 2026-10-01:  
  <https://www.youtube.com/watch?v=d3nuepnbmC4>

### H/E1–E2 — Ferroelectric RAM / F-RAM

- Infineon, *FM25V02A — 256 Kbit (32K × 8) Serial (SPI) F-RAM*:  
  <https://www.infineon.com/part/FM25V02A-G>

- Infineon, *FM25V02A datasheet — Data Retention and Endurance*:  
  <https://www.infineon.com/assets/row/public/documents/10/49/infineon-fm25v02a-256-kbit-32k-8-serial-spi-f-ram-datasheet-en.pdf>

- Park et al., *Revival of Ferroelectric Memories Based on Emerging Fluorite-Structured Ferroelectrics*, Advanced Materials (2023):  
  <https://onlinelibrary.wiley.com/doi/10.1002/adma.202204904>

- OSHWHub, user-supplied contemporary FRAM storage project:  
  <https://oshwhub.com/fangs233/project_blcrwqhk>

直接支持：

- 1T1C FeRAM 以铁电电容两种极化状态保存二进制信息；
- 传统 1T1C FeRAM 读取是破坏性的，需要 restore / rewrite；
- FM25V02A 为 256-Kbit SPI F-RAM，官方给出 `10^14` 次读写耐久；
- FM25V02A 数据表给出 65 °C 下 151 年、85 °C 下 10 年的数据保持规格；
- “151 年”“100 万亿次”属于具体器件及其规定条件，不是整个 FRAM 类别的无条件性质。

不直接支持：

- “永久存储”“无限擦写”的字面含义；
- 所有 FRAM 都使用完全相同的微观晶格模型；
- 所有 FRAM 都具备 radiation-hard / space-grade 能力；
- FRAM 在容量、成本或密度上普遍优于 NAND Flash。

### H/E1–E2 — Apollo Guidance Computer

- NASA, *Apollo News Reference — Guidance, Navigation and Control*:  
  <https://www.nasa.gov/wp-content/uploads/static/history/alsj/LM08_Guidance-Navigation-Control_ppGN1-48.pdf>

- MIT News, *To the moon, by way of MIT*:  
  <https://news.mit.edu/2009/apollo-tt0603>

- MIT News, *Behind the scenes of the Apollo mission at MIT*:  
  <https://news.mit.edu/2019/behind-scenes-apollo-mission-0718>

### H/E1–E2 — Mechanical analog computation

- Smithsonian / National Museum of American History, *Mechanical Integrators and Differential Analyzers*:  
  <https://americanhistory.si.edu/collections/object-groups/mechanical-integrators>

- Smithsonian, *Differential Analyzer Parts and Documentation*:  
  <https://www.si.edu/spotlight/mechanical-integrators/differential-analyzers>

### H/E1–E2 — Mercury tracking and ground computation

- NASA, *Project Mercury: A Chronology*, November 1, 1960 entry on Goddard IBM 7090 operations:  
  <https://www.nasa.gov/history/SP-4001/p2b.htm>

- NASA SP-4203, discussion of Mercury tracking and data acquisition:  
  <https://ntrs.nasa.gov/api/citations/19880016045/downloads/19880016045.pdf>

---

## Bottom line

这个仓库原本就在问：

> **数字在哪里？谁提供算法步骤？什么部件动了？**

“比特之前的计算”只是把这个问题扩大一步：

> **如果没有 CPU、RAM 和软件，数学关系究竟可以住在哪里？**

答案可能是：

- 一个齿轮比；
- 一条凸轮曲线；
- 一根轴的角度；
- 一个轮盘与滚轮的接触点；
- 一段电路的频率响应；
- 一个雷达回波的时间差；
- 一个磁芯的磁化方向；
- 一根导线到底穿没穿过磁芯。

现代芯片没有发明“计算”。

它最惊人的地方，是把过去分散在**材料、几何、运动、电磁场、线路拓扑和操作者动作**里的计算，逐渐压缩进了通用、可重编程的数字机器里。
