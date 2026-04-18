# Contributing Guide

> [点击查看中文版](#中文)

This guide walks you (and any AI coding tool you use, such as Cursor, Claude
Code, Codex, or Copilot) through the normal development workflow and the
specific steps for adding a new **Bond Pattern** to the fence calculator.

---

## English

### 1. Branch, develop, open a PR

Assumptions: you already cloned the repo and can run the app locally. If
not, follow the setup in [README.md](README.md) first.

#### 1.1 Sync main

Always start from the latest `main`:

```bash
git checkout main
git pull origin main
```

#### 1.2 Create a feature branch

Use a descriptive name. Conventional prefixes we use:

- `feat/...` – a new feature (e.g. `feat/english-bond`)
- `fix/...` – a bug fix
- `docs/...` – docs only
- `refactor/...` – internal refactoring

```bash
git checkout -b feat/english-bond
```

#### 1.3 Develop locally

```bash
cd fence-calculator
npm install         # only needed if dependencies changed
npm run dev         # http://localhost:5173/COMP5703-Project/
```

Keep the dev server running while you work. Vite hot-reloads on save.

Before pushing, make sure the production build also passes:

```bash
npm run build
```

If `build` fails, your PR will not be merged. Fix TypeScript errors first.

#### 1.4 Commit

Make small, focused commits. A good commit message explains **why**, not
just what.

```bash
git add -A
git commit -m "Add English bond pattern"
```

#### 1.5 Push and open a Pull Request

```bash
git push -u origin feat/english-bond
```

GitHub will print a link to open a PR. Or use the GitHub CLI:

```bash
gh pr create --title "Add English bond pattern" --body "..."
```

In the PR description include:
- A one-line summary of what the change does.
- A screenshot or short screen recording of the diagram (if the change is
  visual).
- Anything reviewers should pay special attention to.

#### 1.6 After review

- Address review comments with additional commits on the same branch.
- Once approved, squash-merge into `main`.
- Delete the branch locally and on GitHub after merge:
  ```bash
  git checkout main
  git pull
  git branch -d feat/english-bond
  ```

---

### 2. Adding a new Bond Pattern

The bond system is a plugin registry. You add a new pattern by creating
**one file** and registering it with **one line**. Nothing else in the app
needs to change.

#### 2.1 What you need to know

A **bond pattern** is a function that takes the wall dimensions in
millimetres and returns the list of bricks (with their positions, sizes,
and types) that should be drawn on the wall.

The coordinate system is:

- Origin `(0, 0)` is the **top-left of the wall**.
- `x` increases to the right, `y` increases downward.
- All units are **millimetres**.
- Every bond module owns its own brick/mortar constants (they are not user
  inputs). Stretcher bond uses 230x76mm bricks with 10mm mortar.

Each brick has a `type`:

- `'full'` – a full-length stretcher brick.
- `'half'` – a half brick (queen closer). Typically at wall ends on even
  rows.
- `'adj'` – an adjustment piece (a brick cut to a non-standard length to
  make the row fit the exact wall length). Rendered in a lighter orange so
  a human reader can see where the off-cuts go.

If the wall length does not divide cleanly into full bricks plus mortar
joints, adjustment pieces (and/or dead-zone snapping) must be used so that
every row is exactly `wallL` wide. **Do not** stretch bricks to non-standard
lengths — real bricks are cut with a saw, not stretched.

Read `src/bonds/stretcher.ts` before you start. It is the canonical example
and closely follows Graeme's Excel spreadsheet.

#### 2.2 Files to look at

- `src/bonds/types.ts` – the `BondPattern`, `BondParams`, `BondResult`,
  `BrickData` interfaces you must implement.
- `src/bonds/registry.ts` – where you register your new pattern.
- `src/bonds/stretcher.ts` – the reference implementation. Copy its shape.
- `public/locales/en/translation.json` and
  `public/locales/zh/translation.json` – where you add UI strings.

#### 2.3 Step-by-step: create `english.ts`

Using English Bond as a worked example. Replace names/logic for any other
pattern.

1. **Create the file**

   `src/bonds/english.ts`:

   ```ts
   import type { BondPattern, BondParams, BondResult, BrickData } from './types'

   const BRICK_L = 230
   const BRICK_H = 76
   const HALF_L = 110
   const MORTAR_T = 10

   function generate({ wallL, wallH }: BondParams): BondResult {
     // TODO: implement English bond row layout.
     // English bond alternates:
     //   - stretcher courses (all full stretchers, like stretcher bond odd row)
     //   - header courses (all headers, i.e. bricks laid end-on, width = HALF_L)
     // Use the same "adjustment piece + dead-zone snap" strategy from
     // stretcher.ts so every row is exactly wallL wide.

     const courseH = BRICK_H + MORTAR_T
     const nRows = Math.ceil((wallH + MORTAR_T) / courseH)
     const wallPixH = nRows * courseH - MORTAR_T
     const bricks: BrickData[] = []
     let brickCount = 0

     for (let r = 0; r < nRows; r++) {
       const y = wallPixH - ((r + 1) * courseH - MORTAR_T)
       // ...push bricks for row r into `bricks`, increment brickCount for
       //    non-adjustment pieces...
     }

     return {
       bricks,
       wallW: wallL,   // after any dead-zone snap, this is the actual rendered width
       wallH: wallPixH,
       nRows,
       brickCount,
       adjPieceLength: 0,  // report if you used adjustment pieces
       snapped: false,
     }
   }

   const ENGLISH_ICON = `<svg viewBox="0 0 80 40" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
     <rect width="80" height="40" fill="#c9b89a"/>
     <rect x="1"  y="1"  width="38" height="18" rx="1" fill="#b85530" stroke="#6a2208" stroke-width="0.4"/>
     <rect x="41" y="1"  width="38" height="18" rx="1" fill="#a34525" stroke="#6a2208" stroke-width="0.4"/>
     <rect x="1"  y="21" width="18" height="18" rx="1" fill="#c05838" stroke="#6a2208" stroke-width="0.4"/>
     <rect x="21" y="21" width="18" height="18" rx="1" fill="#9e3f20" stroke="#6a2208" stroke-width="0.4"/>
     <rect x="41" y="21" width="18" height="18" rx="1" fill="#ba5c35" stroke="#6a2208" stroke-width="0.4"/>
     <rect x="61" y="21" width="18" height="18" rx="1" fill="#aa4a2c" stroke="#6a2208" stroke-width="0.4"/>
   </svg>`

   export const englishBond: BondPattern = {
     id: 'english',
     nameKey: 'bond.english',
     descKey: 'bond.englishDesc',
     iconSvg: ENGLISH_ICON,
     generate,
   }
   ```

2. **Register it** in `src/bonds/registry.ts`:

   ```ts
   import { englishBond } from './english'

   // ...existing code...
   registerBond(englishBond)
   ```

3. **Add translation keys.** In both `public/locales/en/translation.json`
   and `public/locales/zh/translation.json`, inside the `"bond"` object,
   add:

   ```json
   "english": "English Bond",
   "englishDesc": "Alternating courses of stretchers and headers. Very strong."
   ```

   (Translate appropriately for `zh`.)

4. **Run the app** with `npm run dev`. Your pattern should appear on the
   Bond Pattern step automatically. Click it; the preview diagram should
   render your layout.

5. **Sanity checks**

   - For a 4000 x 1800 mm wall, every row should be exactly 4000 mm wide
     after any adjustment pieces are added.
   - There should be no visible gaps or overlaps between bricks.
   - Full bricks should always be 230 mm wide (or 110 mm for
     headers/halves). If you are stretching a brick to fill space, you are
     doing it wrong — use adjustment pieces instead.
   - `brickCount` should be the number of **non-adjustment** bricks (used
     in cost calculations later).

#### 2.4 Checklist before opening the PR

- [ ] `npm run build` passes with no TypeScript errors.
- [ ] New pattern appears on the Bond step and the diagram renders
      correctly.
- [ ] Translation keys added for both EN and ZH.
- [ ] Rows are exactly `wallL` wide.
- [ ] No full bricks are stretched to odd lengths — only adjustment pieces
      carry the remainder.
- [ ] Committed to a feature branch (`feat/<pattern>-bond`).
- [ ] PR description includes a screenshot of the new pattern rendering.

---

### 3. For AI coding tools (prompt template)

If you are using Cursor / Claude Code / Copilot / etc., you can paste the
following prompt to ask it to scaffold a new pattern.

**Before you paste:** if you have an Excel/CSV spreadsheet that defines
the pattern (like Graeme's `Stretcher Bond - x,y coordinates V1.xlsx`),
attach it to the chat or place it somewhere the AI can read. The
spreadsheet is the **source of truth** — the AI should derive its layout
logic from it, not guess. If you don't have one yet, the AI will ask for
it.

> Read `fence-calculator/src/bonds/stretcher.ts` and
> `fence-calculator/src/bonds/types.ts` to understand the bond pattern
> interface and the reference implementation.
>
> Before writing any code, ask me whether I have a spreadsheet (xlsx /
> csv / Google Sheets export) that defines this bond. If I do, read it
> first and use its brick x,y coordinates, row formulas, and any
> adjustment-piece rules as the source of truth. If anything is ambiguous
> (e.g. how partial bricks are handled at the ends, how rows align,
> whether piers are included), ask me to clarify before writing code —
> don't guess.
>
> Then create `fence-calculator/src/bonds/<name>.ts` that implements
> `<name>` bond following the same structure as `stretcher.ts`: brick and
> mortar constants at the top, a `generate()` function that returns a
> `BondResult`, an `iconSvg` string, and a named export that matches the
> `BondPattern` interface. Register it in
> `fence-calculator/src/bonds/registry.ts`. Add `bond.<name>` and
> `bond.<name>Desc` translation keys to both
> `fence-calculator/public/locales/en/translation.json` and
> `fence-calculator/public/locales/zh/translation.json`.
>
> Rules:
> - Do not modify any other files.
> - Do not change existing bond constants or the `stretcher.ts` logic.
> - Every row must be exactly `wallL` mm wide — use adjustment pieces
>   and/or dead-zone snapping, never stretch full bricks to non-standard
>   lengths.
> - If the spreadsheet disagrees with the reference implementation, the
>   spreadsheet wins; tell me about the difference in your summary.
>
> When you're done, show me a summary of the new file and run
> `npm run build` to confirm there are no TypeScript errors.

The AI tool should only need to touch four files:
`src/bonds/<name>.ts`, `src/bonds/registry.ts`, and the two translation
JSON files. If it tries to edit anything else (FenceDiagram, pages,
Stepper, FormContext), stop it — that means it misunderstood the
architecture.

---

## 中文

> [Click here for English](#english)

本指南帮助你（以及你使用的 AI 编码工具，例如 Cursor / Claude Code / Codex /
Copilot）完成常规开发流程，以及在本项目中添加一个新的 **砌筑样式 (Bond
Pattern)** 的具体步骤。

### 1. 建分支、开发、提交 PR

前提：你已经克隆了仓库并能在本地运行项目。如果没有，先按
[README.md](README.md) 里的步骤完成环境搭建。

#### 1.1 同步 main

始终从最新的 `main` 开始：

```bash
git checkout main
git pull origin main
```

#### 1.2 创建一个特性分支

使用有意义的名字，项目使用以下前缀约定：

- `feat/...` – 新功能（例如 `feat/english-bond`）
- `fix/...` – bug 修复
- `docs/...` – 仅文档
- `refactor/...` – 内部重构

```bash
git checkout -b feat/english-bond
```

#### 1.3 本地开发

```bash
cd fence-calculator
npm install         # 仅当依赖有变化时运行
npm run dev         # http://localhost:5173/COMP5703-Project/
```

Vite 会在你保存文件时自动热更新。

推送前务必确保生产构建也能通过：

```bash
npm run build
```

如果 `build` 失败，PR 不能合并，请先修 TypeScript 错误。

#### 1.4 提交

小步提交，commit message 说明"为什么"比说明"做了什么"更重要。

```bash
git add -A
git commit -m "Add English bond pattern"
```

#### 1.5 推送并发 PR

```bash
git push -u origin feat/english-bond
```

终端会打印一个 GitHub 链接用于创建 PR，或者使用 GitHub CLI：

```bash
gh pr create --title "Add English bond pattern" --body "..."
```

PR 描述中请包含：

- 一句话说明这次改动做了什么。
- 如果是视觉改动，附上图形的截图或短录屏。
- 希望 reviewer 特别注意的地方。

#### 1.6 评审后

- 根据评论继续在同一分支上追加 commit。
- 获批后使用 squash merge 合入 `main`。
- 合并后删除本地和远程分支：
  ```bash
  git checkout main
  git pull
  git branch -d feat/english-bond
  ```

---

### 2. 添加一个新的砌筑样式

本项目的砌筑样式系统是一个插件注册表。添加新样式只需要**创建一个文件**
并**注册一行**，其它地方都不需要改。

#### 2.1 你需要知道的

一个 **砌筑样式** 就是一个函数：输入墙体长宽（毫米），返回需要绘制在墙上的
砖块列表（每块砖的位置、尺寸、类型）。

坐标系：

- 原点 `(0, 0)` 在**墙的左上角**。
- `x` 向右递增，`y` 向下递增。
- 所有单位都是**毫米**。
- 每个 bond 模块自己管理砖和灰缝的常量（它们不再是用户输入）。顺砖砌法
  使用 230x76mm 的砖，灰缝 10mm。

每块砖有一个 `type`：

- `'full'` – 完整顺砖。
- `'half'` – 半砖（queen closer），通常出现在偶数行的两端。
- `'adj'` – 调整块（adjustment piece，为了让一行刚好等于墙长而切出来的
  非标准长度的砖）。渲染时使用较浅的橘色，便于看出"切砖"出现在哪里。

如果墙长无法被标准砖+灰缝整除，必须用 adjustment piece（必要时配合"死区
吸附"）来让每一行的宽度精确等于 `wallL`。**不要**把整砖拉伸成非标准长度 —
现实中砖是用锯切的，不是拉伸的。

动手前请先读 `src/bonds/stretcher.ts`，那是最权威的样例，逻辑和 Graeme
的 Excel 对齐。

#### 2.2 涉及的文件

- `src/bonds/types.ts` – 你需要实现的 `BondPattern` / `BondParams` /
  `BondResult` / `BrickData` 接口。
- `src/bonds/registry.ts` – 注册新样式的地方。
- `src/bonds/stretcher.ts` – 参考实现，直接照抄它的骨架。
- `public/locales/en/translation.json` 和
  `public/locales/zh/translation.json` – 添加 UI 文案的地方。

#### 2.3 步骤：创建 `english.ts`

以 English Bond 为例。其它样式把名字和逻辑换掉即可。

1. **新建文件** `src/bonds/english.ts`（结构参考英文版或 `stretcher.ts`）。
2. **注册** 在 `src/bonds/registry.ts`：

   ```ts
   import { englishBond } from './english'

   registerBond(englishBond)
   ```

3. **加翻译**：在两个 `translation.json` 的 `"bond"` 对象里加：

   ```json
   "english": "英式砌法",
   "englishDesc": "顺砖行与丁砖行交替排列，非常坚固。"
   ```

   EN 版本写英文即可。

4. 运行 `npm run dev`，你的样式应该自动出现在"砌筑样式"步骤中，点击后
   右侧预览图会用你写的逻辑画出墙体。

5. **自检**

   - 4000 x 1800 mm 墙，每一行加完 adjustment 后应该正好 4000 mm。
   - 砖与砖之间不应有缝或重叠。
   - 标准砖长必须固定（230 mm 或 110 mm），只有 adjustment piece 才是非
     标准长度。
   - `brickCount` 是**不含** adjustment piece 的砖数（后续成本计算要用）。

#### 2.4 发 PR 前的 checklist

- [ ] `npm run build` 无 TypeScript 错误。
- [ ] 新样式出现在 Bond 步骤，预览图正确。
- [ ] 中英文两个翻译 JSON 都加了。
- [ ] 每一行宽度精确等于 `wallL`。
- [ ] 没有把整砖拉成非标准长度。
- [ ] 提交在 `feat/<pattern>-bond` 分支。
- [ ] PR 描述附上预览图截图。

---

### 3. 给 AI 编码工具的提示词（prompt 模板）

使用 Cursor / Claude Code / Copilot 等工具时，可以把下面这段直接贴进去。

**贴之前：** 如果你手头有一份定义该砌法的 Excel / CSV / 表格文件（例如
Graeme 做的 `Stretcher Bond - x,y coordinates V1.xlsx`），请把它一起附
到对话里，或放到 AI 能读到的位置。这个表格是**事实来源**，AI 应该从表格
里推导排布逻辑，而不是自己猜。如果你还没有表格，AI 会主动问你要。

> 请先阅读 `fence-calculator/src/bonds/stretcher.ts` 和
> `fence-calculator/src/bonds/types.ts`，理解 bond pattern 的接口和参考
> 实现。
>
> 在写任何代码之前，先问我：是否有定义该砌法的表格（xlsx / csv /
> Google Sheets 导出均可）。如果有，先读这份表格，把里面砖的 x,y 坐标、
> 行公式、调整块（adjustment piece）规则作为**事实来源**。如果有任何
> 歧义（例如两端缺口怎么处理、上下行如何对齐、是否包含 pier 柱），先问
> 我，**不要猜**。
>
> 之后在 `fence-calculator/src/bonds/<name>.ts` 中实现 `<name>` 砌法，
> 结构完全参照 `stretcher.ts`：文件顶部放砖和灰缝常量、一个返回
> `BondResult` 的 `generate()` 函数、一个 `iconSvg` 字符串，以及一个
> 满足 `BondPattern` 接口的命名导出。在
> `fence-calculator/src/bonds/registry.ts` 中注册它。把 `bond.<name>` 和
> `bond.<name>Desc` 翻译键加到
> `fence-calculator/public/locales/en/translation.json` 和
> `fence-calculator/public/locales/zh/translation.json`。
>
> 规则：
> - 不要改动其它任何文件。
> - 不要改现有 bond 的常量或 `stretcher.ts` 的逻辑。
> - 每一行必须精确等于 `wallL` 毫米 —— 使用 adjustment pieces 或死区
>   吸附（dead-zone snap），绝不拉伸整砖到非标准长度。
> - 如果表格和现有参考实现冲突，以**表格为准**，并在总结里告诉我哪里
>   不一样。
>
> 写完后，给我一份新文件的简要总结，并运行 `npm run build` 确认没有
> TypeScript 错误。

AI 工具理论上只需要动四个文件：`src/bonds/<name>.ts`、
`src/bonds/registry.ts`、以及两个翻译 JSON。如果它想改其它文件
（FenceDiagram、页面、Stepper、FormContext 等），立刻阻止它 —— 说明它误
解了本项目的架构。
