# Multiplication mechanisms: repeated addition, stepped drum, pinwheel, and direct multiplication

**Checked: 2026-09-02**

## Question

What changes mechanically when multiplication stops being “repeat an addition and shift place value” and begins to encode part of the multiplication table in the machine itself?

This note deliberately compares **operator algorithms** as well as internal actuators.

## Claim types

- arithmetic decomposition and repository operation traces: **M/P**;
- historical machine/mechanism claims: **H**;
- simplified `stepped-drum` and `pinwheel` code in this repository: **P**, not geometric reconstruction.

See `docs/EVIDENCE_POLICY.md`.

## 1. Repeated addition is an operator algorithm

For a typical manual calculating machine, a multiplication such as:

```text
314 × 27
```

can be decomposed as:

```text
314 added 7 times at units position
shift carriage one decimal place
314 added 2 times at tens position
```

The key point is that **place-value shift** changes what the same accumulator contribution means. A carriage shift is therefore not a cosmetic movement; it is part of the algorithm.

Smithsonian's general calculating-machine overview describes this repeated-crank / carriage-shift workflow for early stepped-drum and pinwheel machines:

<https://www.si.edu/spotlight/calculating-machines>

Claim type: **H/M**.

Evidence: Smithsonian institutional synthesis, **E2** for the historical operator pattern.

## 2. Stepped drum: digit value becomes engagement count

### Sources

- Smithsonian, *Stepped Drum Calculating Machines*: <https://www.si.edu/spotlight/calculating-machines/stepped-drum-calculating-machines>
- Smithsonian, Thomas Arithmometer object: <https://www.si.edu/object/nmah_690692>

The Smithsonian describes Thomas-style arithmometers as using cylindrical stepped drums whose teeth vary in length. Moving a setting lever to a digit determines how many teeth participate in the transfer during a crank.

At the functional level:

```text
set digit d
→ expose / engage an effective d-step transfer
→ crank
→ accumulator changes by contribution proportional to d
```

A multiplication still requires repeated cranks according to multiplier digits and carriage shifts between decimal places.

Claim type: **H**.

Evidence: museum object + institutional mechanism overview, **E1–E2**. Carry is separately revision-sensitive: [`stepped-drum-carry-source-map.md`](stepped-drum-carry-source-map.md) records Thomas 1865's H/E1 successive cylinder phasing and simultaneous-load failure without treating those details as universal stepped-drum geometry.

### Repository abstraction

`src/mechanisms/stepped-drum/` models the **effective engagement count** and resulting contribution. It does not claim tooth profile, shaft placement, timing, or Thomas/Leibniz geometry.

Claim type: **P**.

## 3. Pinwheel: digit value becomes number of active pins

### Sources

- Smithsonian, *Pinwheel Calculating Machines*: <https://www.si.edu/spotlight/calculating-machines/pinwheel-calculating-machines>
- Smithsonian, Original Odhner machine: <https://www.si.edu/object/nmah_690753>
- W. T. Odhner, US 514,725 (1894): <https://patents.google.com/patent/US514725A/en>

Smithsonian describes the pinwheel family as using wheels with retractable pins. Setting a digit releases a corresponding number of pins, and crank rotation transfers a contribution to the calculating mechanism.

Odhner's patent is useful primary evidence for the family because it describes adjustable pins on calculating wheels and their setting/registration mechanisms.

Functionally:

```text
set digit d
→ make d pins effective
→ crank
→ d effective contacts contribute to the register
```

Again, this does **not** by itself eliminate repeated-addition multiplication at the operator level.

Claim type: **H**.

Evidence:

- patent: **E1** for the described design;
- museum overview/object: **E1–E2** for surviving family examples and synthesis.

### Repository abstraction

`src/mechanisms/pinwheel/` models the number of effective pins/teeth and resulting contribution. It does not claim that its geometry is an Odhner reconstruction.

Claim type: **P**.

## 4. Why stepped drum vs pinwheel is not yet the full multiplication story

Stepped drums and pinwheels are important actuator differences, but they can expose a surprisingly similar human algorithm:

```text
set multiplicand
→ crank N times for one multiplier digit
→ shift carriage
→ crank M times for next digit
```

If the repository compares only those two, a visitor may learn “two ways to make a variable mechanical digit” but miss a larger architectural question:

> Must the operator supply multiplication by repetition, or can the machine mechanically select the correct multiple in one cycle?

That missing branch is **direct multiplication**.

## 5. Millionaire: a multiplication table becomes mechanism

### Sources

- Smithsonian, *Direct Multiplication Calculating Machines*: <https://www.si.edu/spotlight/calculating-machines/direct-multiplication-calculating-machines>
- Smithsonian, Millionaire mechanism/object: <https://www.si.edu/object/nmah_694168>
- Otto Steiger, US 538,710 (1895), *Multiplying or Dividing Machine*: <https://patents.google.com/patent/US538710A/en>
- Otto Steiger, US 558,913 (1896), calculating-machine improvements: <https://patents.google.com/patent/US558913A/en>

Smithsonian identifies Otto Steiger's Millionaire as a commercially successful direct-multiplication machine: a number and a multiplier digit can be set, and an operating turn produces the corresponding product contribution rather than requiring the operator to crank once per unit of that multiplier digit.

The 1896 Steiger patent is especially important because it describes the essential controlling mechanism as a **mechanical representative of the multiplication table**. The specification discusses recessed control plates corresponding to products.

Claim type: **H**.

Evidence:

- Steiger patents: **E1** for the patented design language;
- Smithsonian surviving-object / institutional description: **E1–E2**.

### 5.1 US 558,913 operator protocol at patent precision

Directly inspected patent facsimile: <https://patents.google.com/patent/US558913A/en>.

- specification p. 1, lines 58–69 describes the essential controlling mechanism as a mechanical representative of the `0×0` through `9×9` multiplication table; paired recessed plates separately represent tens and units;
- p. 2, lines 126–144 distinguishes product-registering from factor-indicating mechanisms and says multiplier lever `D` moves over multiplier scale `A²` to the desired figure; the factor indicator checks successive lever positions;
- p. 5, lines 151–175 sets the multiplicand with the sliding studs and exposes it for checking;
- p. 5, lines 176 onward says that after arranging the multiplicand, the multiplier lever is set to the **first figure at the left of the multiplier**, crank `K` is turned **one complete rotation**, and the process is repeated for each multiplier figure;
- pp. 5–6 describes primary transfer of tens, a one-place relation before secondary transfer of units, and the register carriage/indicator dials;
- p. 9, lines 40–64 says the carriage is shifted during each partial multiplication and explicitly calls starting from the left a convenience: a right-starting arrangement could instead transfer units first and shift one place right before tens.

Thus “one operation per multiplier digit” has an H/E1 **operator-protocol analogue** in this patented design: one complete crank rotation follows each digit selection. The repository's `OPERATION_CYCLE` remains P/M: it is not a claim about elapsed time, effort, production speed, or every Egli revision. The patent itself also prevents one universal digit direction from being inferred—its left-starting arrangement is expressly described as a convenience.

### 5.2 Identified surviving controls and documentation roles

Smithsonian records directly describe these lever-set manual Millionaires:

- `MA.328619` / `nmah_694184`, ca. 1904, ten setting levers;
- `MA.323594` / `nmah_694169`, ca. 1909, eight setting levers;
- `MA.333940` / `nmah_694185`, ca. 1909, ten setting levers.

At catalog/object precision they expose a multiplier control selectable `0–9`, A/M/D/S operation selector, operating crank, set-number/`DIVISOR` windows, multiplier-or-quotient and result-or-dividend registers, zeroing knobs, decimal-marker positions, and a carriage-shift button. The records also identify an operating-instruction/table sheet inside the lid, but no readable sheet image was exposed in the API/catalog during this pass.

Accession-linked documentation was resolved without conflating roles:

- `MA.319929.03`: undated English Zurich/Fretz Brothers instructions for the four simple rules; identity/catalog description only because pages are not exposed;
- `.04`: Morschhauser leaflet describing/illustrating a manual Millionaire; identity only;
- `.05`: disassembly instructions, not an operator manual;
- `.06`: *American Machinist*, 1 November 1906 article;
- `.07`: later NBS newsletter/obituary, not an operating source.

The Powerhouse `263911` object independently exposes the title **Directions to Follow When the Machine Is to Be Taken Apart**, nine pages plus five figure pages, written by Egli and printed by Fretz Brothers in 1907. Its visible identity confirms a disassembly booklet; it does not establish the multiplication procedure.

### 5.3 Historical/P–M protocol crosswalk

| Claim / step | Source/model | Direct support | Claim/evidence | Repository consequence | Not established |
|---|---|---|---|---|---|
| select multiplier digit | US 558,913, pp. 2, 5 | lever `D` and scale select the desired multiplication-table factor | H/E1 patented design | analogous to `MULTIPLIER_DIGIT_SELECTED` | exact production detent/control-plate geometry |
| one complete operation per digit | US 558,913 p. 5 | complete crank rotation, repeated for every multiplier figure | H/E1 patented protocol | supports the conceptual one-cycle-per-digit contrast | speed, duration, torque, every Egli revision |
| digit direction/place handling | US 558,913 pp. 5, 9 | described form starts left; patent calls this a convenience and describes an alternate right-starting transfer/shift ordering | H/E1 patented alternatives | repository may keep place shift explicit | repository's right-to-left `7`, shift, `2` order as historical production protocol |
| visible controls/registers | NMAH `MA.328619`, `MA.323594`, `MA.333940` | identified object records list controls/windows/registers/shift/zeroing | H/E1 catalog/object precision | public comparison can name historical controls separately | hidden linkage, control timing, universal revision identity |
| instruction/disassembly documents | NMAH `.03`–`.07`; Powerhouse `263911` | document identities/roles; no readable operating pages exposed | H/E1 catalog identity only | preserve operating-sheet content as open | procedure text not inspected |
| `314 × 27`: select 7, operate, shift, select 2, operate | repository deterministic trace | selected multiples `2198`, `628`, shifted contribution `6280`, result `8478` | P/M | tested teaching state/transition/event model | exact historic digit direction, automatic/manual shift semantics, physical timing |
| encoded lookup `0..9` | repository `multiplicationTable` | mathematical table generated in code | P/M informed by patent distinction | explains where table work lives | identity with recess depths, plates, cams or any production control block |

### Why this matters conceptually

The information burden changes.

Repeated-addition machine:

```text
operator knows multiplier digit
operator repeats crank digit times
machine accumulates
```

Direct-multiplication machine:

```text
operator sets multiplier digit once
machine's mechanism selects the corresponding multiple
one main operating cycle transfers it
```

Some of the multiplication table has moved from **operator procedure** into **machine geometry/control state**.

That is exactly the kind of “where does the algorithm live?” question this repository is built to expose.

## 6. Four-way exhibit

The browser comparison now makes the conceptual axes explicit:

```text
314 × 27
```

### A. Pure repeated-addition baseline

Purpose: expose the arithmetic decomposition without claiming a historical machine.

### B. Stepped drum + carriage

Purpose: show variable engagement encoded by stepped geometry.

### C. Pinwheel + carriage

Purpose: show the same digit encoded by a variable number of effective pins.

### D. Direct multiplication / Millionaire-style control

Purpose: show a multiplier digit selecting a pre-encoded multiple rather than determining the number of repeated operating cranks.

The D track is implemented as a functional model, not a geometric Millionaire reconstruction.

## 7. Comparison dimensions

For each architecture, record:

| Dimension | Question |
|---|---|
| Input state | How are multiplicand and multiplier digit entered? |
| Digit encoding | Lever position, tooth engagement, active pins, control plate? |
| Main operation | What does one crank/cycle physically request? |
| Repetition | Who/what supplies repeated addition? |
| Place value | How is decimal position shifted? |
| Accumulator | Where is the running result stored? |
| Revolution count | Is operator repetition recorded? |
| Pre-encoded knowledge | How much arithmetic is embodied in the mechanism? |
| Human protocol | What must the operator remember and sequence? |
| Error surface | Wrong setting, wrong crank count, wrong carriage position, invalid mode? |

This makes “mechanism comparison” more useful than merely counting cranks.

## 8. What not to claim yet

The current repository does not yet justify claims about:

- exact stepped-drum tooth profiles for a particular Arithmometer revision;
- exact Odhner pin geometry/timing for a particular serial/model;
- Millionaire control-plate geometry as rendered in a future UI, exact production correspondence to the patent's paired recess plates, or one universal multiplier-digit direction/carriage protocol;
- comparative torque, speed, wear, or reliability from the simplified state models;
- which architecture is universally “better.”

Those require model-specific primary sources and, for performance claims, engineering evidence.

## 9. Implementation status

As of 2026-09-01, `src/mechanisms/direct-multiplier/` implements a bounded functional model with explicit digit selection, operation cycles, carriage shifts, accumulator state, human-operation counts, and deterministic replay. The multiplication exhibit exposes the `314 × 27` trace one event or one operating cycle at a time.

Replay validates event order and derived arithmetic rather than trusting serialized event fields. Tests cover zero digits, decimal positioning, unsafe arithmetic, deterministic replay, and tampered event data.

The next research decision is whether a control-plate visualization would add explanatory value. It must not be drawn as Millionaire geometry until exact patent figures, object revision, and reconstruction choices are mapped.

### 9.1 Fixed setting versus repeated turns — implementation update, 2026-09-08

The repeated-crank lesson now exposes the relationship already described in §§1–4 without adding a new historical claim. The former comparison passed multiplier digits `7/2` to actuator descriptors and labelled seven active pins as the setting for `314 × 27`. Settings now describe the multiplicand's units/tens/hundreds digits `4/1/3` at a separate `settingColumn`; the initial carriage offset is zero for every setting column. One stepped-drum descriptor denotes one actuation, not `digit` separate crank turns.

The visitor requests seven complete turns from the fixed 314 setting, producing `314, 628, 942, 1256, 1570, 1884, 2198`. A separate carriage action preserves the amount and seven-turn count while changing the alignment map from `4 + 10 + 300` to `40 + 100 + 3000`. Two further turns produce `5338, 8478`. The summaries derive nine turns and one shift from these same deterministic requests; the direct path still selects multiplier digits 7 and 2 in its two operation cycles.

Claim **P/M**: `CRANK_COMPLETED`, contribution maps, event snapshots and guided button availability are a bounded teaching representation. They are not a claimed sequence of physical contacts, carry timing/geometry, historical locking behavior, operator speed or model-specific production protocol. A complete turn is not implemented as 314 separate `+1` crank requests or relabelled key strokes. The guide deliberately restricts this one exercise; it does not establish that a real machine would prevent a premature shift or additional turn. Reset is a teaching operation.

The existing Smithsonian family/object, Odhner patent and Steiger page-level source boundaries remain unchanged. This is an implementation of an already mapped relationship, not a fresh facsimile inspection or a geometry extension.

## Project decision

The strongest multiplication story is no longer “stepped drum versus pinwheel.” It is:

> **How much of multiplication is performed by repeated human operation, how much is encoded in a variable actuator, and how much is pre-encoded in the machine's control geometry?**

That is a mechanism-level increment not supplied by another cosmetic calculator emulator.
