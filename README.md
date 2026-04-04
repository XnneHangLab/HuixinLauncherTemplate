# 绘心

<p align="center">
  <img src="./src/assets/brand/huixin-logo.svg" alt="绘心 Logo" width="120" />
</p>

绘心是基于 XnneHangLab 启动器模板沉淀出的品牌方向，面向更有温度、可长期陪伴的 AI 产品形态。

当前仓库依然是一个可复用的桌面启动器模板仓库，当前界面风格参考绘世启动器，后续可以继续扩展为绘心-voice 等子产品。

## 适用场景

- 语音产品启动器
- 角色 / 陪伴型 AI 桌面入口
- 模型、资源、环境检查的一体化桌面壳
- XnneHangLab 系列桌面项目的统一模板

## 技术栈

- Tauri 2
- React 18
- Vite 5
- TypeScript
- Vitest + React Testing Library

## 当前能力

- 仿绘世风格的桌面启动器壳层
- 完整侧边栏导航
- 首页复刻
- 设置页复刻
- Tauri 窗口控制接线
- 前端测试、构建、Rust 检查链路

## 开发运行

安装依赖：

```bash
npm install
```

前端开发：

```bash
npm run dev
```

桌面开发：

```bash
npm run tauri dev
```

测试：

```bash
npm run test -- --run
```

构建：

```bash
npm run build
```

Rust 侧检查：

```bash
cargo check --manifest-path src-tauri/Cargo.toml
```

## 项目结构

```text
src/
  app/
  components/
  data/
  layouts/
  pages/
  services/
  styles/
src-tauri/
```

## 后续扩展方向

- 绘心-voice
- 模型管理和下载入口
- 环境检查与诊断
- 启动流程与进程管理
- 更完整的品牌视觉系统
