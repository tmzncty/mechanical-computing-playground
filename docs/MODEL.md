# Mechanism Core Model / 机制核心模型

本文记录当前已经实现的共享机械状态模型（M1.1–M1.4）。它描述可观察、可重放的离散逻辑，不描述动画时长、齿轮几何尺寸，也不声称复原某一台历史机器。

## 1. 五层边界

核心严格区分以下对象：

1. **mathematical value**：例如十进制寄存器代表的数值 `99`；
2. **mechanical representation**：例如从低位到高位排列的轮位置 `[9, 9, 0, 0]`；
3. **operation phase**：一次 crank 中当前执行的阶段；
4. **event**：带顺序号、部件身份和 before/after 值的已发生事实；
5. **visualization**：根据 event 高亮、运动或播放声音的 UI adapter。

只有 state + action transition 可以决定新状态。可视化不计算进位，也不修改核心状态。

```text
explicit state + explicit action
              ↓
pure deterministic transition
              ↓
next state + ordered events + warnings/errors
              ↓
canonical trace / UI adapter / replay
```

## 2. 共享 vocabulary

共享类型位于：

- `src/core/types.ts`
- `src/core/events.ts`

核心标识包括：

- `MechanismId`：机制实例/类别标识；
- `OperationCycleId`：一次可追踪 crank 或操作周期；
- `WheelIdentity`：稳定的 wheel/dial `id`、`index` 与种类；
- `SignedStep` / `SignedRotation`：有方向的离散步进与旋转；
- `TransferRatio`、`CarriageOffset`、`LatchDetentState`；
- `HumanOperation`：人工曲柄、拨轮、设定刻度、移位、锁止操作；
- `WarningCondition` / `ErrorCondition`：与正常事件流分离的警告和错误。

这些类型不包含 Pascaline、Curta 等机器专属历史假设。未被具体机制使用的共享量只是小型数据结构，不承载隐藏行为。

## 3. Event discriminated union

`MechanismEvent` 是以 `type` 区分的联合类型。每个事件都有：

```ts
interface EventBase {
  mechanismId: MechanismId;
  cycleId: OperationCycleId;
  sequence: number;
  phase: OperationPhase;
}
```

当前事件：

| Event | 含义 |
|---|---|
| `CRANK_BEGIN` | 显式人工曲柄操作开始 |
| `WHEEL_STEP` | 指定轮从 `from` 移到 `to` |
| `CARRY_PENDING` | 低位越界，产生发往相邻高位的请求 |
| `CARRY_PROPAGATED` | 请求传递到目标轮 |
| `CARRY_OUT` | 最高位越界，寄存器容量不足 |
| `CRANK_END` | 全部 pending carry 已处理，周期结束 |

`sequence` 从 `0` 连续递增，是 trace 内的权威事件顺序。动画帧率不能改变此顺序。

## 4. Deterministic transition contract

共享接口位于 `src/core/transition.ts`：

```ts
interface TransitionResult<State, Event extends MechanismEvent> {
  state: State;
  events: readonly Event[];
  warnings: readonly WarningCondition[];
  errors: readonly ErrorCondition[];
}

type Transition<State, Action, Event extends MechanismEvent> = (
  state: Readonly<State>,
  action: Readonly<Action>,
) => TransitionResult<State, Event>;
```

约束：

- 输入 state 不被修改；
- 相同 state/action 产生相同 state、events、warnings 和 errors；
- core 中没有 timer、DOM、animation frame、random 或墙上时钟；
- overflow 既有 `CARRY_OUT` 事件，也有结构化 `OVERFLOW` warning；
- reducer 可以只消费 events 重建状态，不重新执行 transition。

当前第一消费者是 `transitionDecimalRegister()`。旧的 `crankPlusOne()` 仅为兼容入口，它委托给同一个 transition，不存在第二套进位实现。

## 5. Decimal register

当前教学寄存器按**低位优先**保存轮位置：

```ts
interface DecimalRegisterState {
  mechanismId: 'decimal-register';
  digits: number[];
}
```

不变量：

```text
digits is non-empty
each digit is an integer in 0..9
index 0 is the least-significant wheel
wheel identity is decimal-wheel-<index>
```

当前动作：

```ts
interface CrankAction {
  type: 'CRANK_PLUS_ONE';
  cycleId: OperationCycleId;
}
```

减法尚未实现，因此没有把负数或借位偷偷塞进加法模型。

## 6. Canonical carry cycle

`0099 + 1 → 0100` 的完整事件顺序为：

```text
0  CRANK_BEGIN
1  WHEEL_STEP        wheel=0  9 -> 0
2  CARRY_PENDING     wheel=0 -> wheel=1
3  CARRY_PROPAGATED  wheel=0 -> wheel=1
4  WHEEL_STEP        wheel=1  9 -> 0
5  CARRY_PENDING     wheel=1 -> wheel=2
6  CARRY_PROPAGATED  wheel=1 -> wheel=2
7  WHEEL_STEP        wheel=2  0 -> 1
8  CRANK_END
```

这表明最终数字 `0100` 不是一次不可见的数组加法，而是三个轮 step 与两级进位传播。

参考 fixture：[`fixtures/carry/0099-plus-one.json`](../fixtures/carry/0099-plus-one.json)。

## 7. Stable trace JSON

trace API 位于 `src/core/trace.ts`：

```ts
serializeTrace(trace): string
parseTrace(json): OperationTrace
replayTrace(trace, reducer, transition): State
```

格式标识：

```json
{
  "format": "mechanical-computing-trace",
  "version": 1
}
```

`serializeTrace()` 递归排序 object keys、保留 array/event 顺序并省略 `undefined`，因此同一状态和动作在当前 format version 下产生 byte-for-byte 相同 JSON。`parseTrace()` 检查格式与版本；`replayTrace()` 从 `initialState + events + reducer` 重建 final state，同时用传入的 deterministic transition 从记录的 `initialState + action` 重新导出权威 events、warnings、errors 和 final state。外层 mechanism/cycle 标识也必须与动作导出的事件一致。

transition 只承担动作来源校验；replay 返回的状态仍由 reducer 消费记录事件得到，不需要 UI，也不依赖动画计时。对象成员插入顺序不影响比较，但 event/array 顺序、稀疏槽位和全部 enumerable string/Symbol 字段都保持权威；不会再用有损的 JSON 比较吞掉 `undefined` 扩展。篡改 wheel 的 `from` 前置条件会使 decimal event reducer 拒绝 trace；删掉 crank/carry 控制事件、交换可交换的 wheel steps、伪造 sequence/cycle/action 或 warnings/errors，即使最后数字仍相同，也会被 action-derived 校验拒绝。

## 8. 历史与证据边界

这个 decimal register/carry vocabulary 是证据等级 **D：教学抽象**。它不意味着每台历史机器都具有名为 `CARRY_PENDING` 的零件或完全相同的时序。

具体历史机器必须另行说明：

- 哪些状态来自保留实物或直接测量（A）；
- 哪些来自图纸、手册与忠实复原（B）；
- 哪些史有记载但需要解释（C）；
- 哪些为本项目教学离散化（D）。

软件 event 是可观察教学事实，不应未经来源支持就改写为历史机构的字面名称。

## 9. 验证范围

当前自动测试覆盖：

- 单轮 `0 + 1`、`8 + 1`、`9 + 1`；
- `0009 + 1 → 0010`；
- `0099 + 1 → 0100`；
- `9999 + 1 → 0000`、`CARRY_OUT` 和 `OVERFLOW`；
- 非法 wheel state；
- input state 不变；
- event sequence 连续且稳定；
- 相同 state/action 的 canonical JSON 完全一致；
- trace JSON round trip；
- canonical fixture 字节匹配；
- 完整 crank cycle 的 UI-independent replay；
- action/envelope 与完整 crank/carry 事件、warnings/errors、final state 的一致性；
- 省略/调序/改 sequence、cycle、action 和有损 JSON 会忽略的 enumerable 扩展均 fail closed。
