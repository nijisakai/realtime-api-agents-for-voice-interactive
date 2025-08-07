# 智能实时对话分析系统

[**中文**](./README_cn.md) | [**English**](./README.md)

[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![OpenAI](https://img.shields.io/badge/OpenAI-Realtime%20API-orange.svg)](https://platform.openai.com/docs/)

## 📚 目录

- [项目介绍](#-项目介绍)
- [核心特性](#-核心特性)
- [快速开始](#️-快速开始)
- [技术规格](#-技术规格)
- [智能体模式](#-智能体模式)
- [架构模式](#️-架构模式)
- [项目信息](#-项目信息)
- [开发团队](#-开发团队)

---

## 🌟 项目介绍

这是一个基于OpenAI Realtime API构建的高级智能实时对话系统，具备先进的辩论分析和无缝人机协作讨论能力。系统能够智能识别对话立场，提取关键观点，生成语境化关键标签，并提供包含动态胜率计算和话题识别的实时辩论分析。

### 🚀 推进人机协作

该系统代表了人机协作智能的突破，实现了人类与AI智能体之间自然、动态的实时讨论。它增强批判性思维，培养高级辩论技能，并提供创新的交互式学习教育平台。AI不仅仅是工具，更是能够参与有意义讨论、建设性地挑战观点、通过复杂对话促进深度学习的智能协作伙伴。

---

## ✨ 核心特性

- **🎯 实时语音处理**: 先进的语音识别技术，支持智能对话捕获和自然语言理解
- **🧠 智能辩论分析**: 自动立场识别、关键观点提取和语境化论证分析
- **🤖 多种AI智能体模式**: 包括辩论主持人和人机对话在内的专业化配置，具备自适应行为
- **📊 动态分析仪表板**: 实时胜率计算、智能关键标签生成和话题识别
- **🔄 高级LLM集成**: 具备上下文感知的全局分析，支持复杂观点修正和对话流理解
- **🎨 优化UI体验**: 高度优化的面板布局、现代化设计和响应式界面

---

## 📋 关于OpenAI Agents SDK

本项目使用[OpenAI Agents SDK](https://github.com/openai/openai-agents-js)，这是一个用于构建、管理和部署高级AI智能体的工具包。SDK提供：

- 定义智能体行为和工具集成的统一接口
- 内置的智能体编排、状态管理和事件处理支持
- 与OpenAI Realtime API的轻松集成，实现低延迟流式交互
- 多智能体协作、移交、工具使用和护栏的可扩展模式

如需完整文档、指南和API参考，请查看官方[OpenAI Agents SDK文档](https://github.com/openai/openai-agents-js#readme)。

**注意**: 如需不使用OpenAI Agents SDK的版本，请查看[without-agents-sdk分支](https://github.com/openai/openai-realtime-agents/tree/without-agents-sdk)。

## 🛠️ 快速开始

### 环境要求

- Node.js 18+
- OpenAI API Key
- 支持WebRTC的现代浏览器

### 安装步骤

1. **克隆项目**
   ```bash
   git clone https://github.com/openai/openai-realtime-agents.git
   cd openai-realtime-agents
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **配置API密钥**
   ```bash
   # 方法1: 添加到环境变量
   export OPENAI_API_KEY=your_openai_api_key_here
   
   # 方法2: 创建.env文件
   cp .env.sample .env
   # 然后在.env文件中添加你的API密钥
   ```

4. **启动服务器**
   ```bash
   npm run dev
   ```

5. **访问应用**
   打开浏览器访问: [http://localhost:3000](http://localhost:3000)

### 使用方式

1. **选择智能体配置**: 从下拉菜单选择"辩论主持人"或"人机对话"模式
2. **连接开始对话**: 点击连接按钮开始实时对话
3. **观察实时分析**: 查看右侧面板的实时辩论分析和观点提取

---

## 💻 技术规格

### 前端技术

- **Next.js 15.4.3**: React框架
- **TypeScript**: 类型安全
- **Tailwind CSS**: 现代化UI样式
- **WebRTC**: 实时音频处理

### AI与分析

- **OpenAI Realtime API**: 低延迟语音交互
- **高级LLM分析管道**: 智能观点提取和分类
- **动态对话状态管理**: 实时跟踪对话流程
- **智能关键标签生成**: 自动提取讨论要点

---

## 🎯 智能体模式

### 辩论主持人模式

- **访问方式**: `http://localhost:3000?agentConfig=debateModerator`
- **功能特点**:
  - 自动立场识别
  - 正反方观点分析
  - 实时胜率计算
  - 深色主题UI，清晰的立场分区

### 人机对话模式

- **访问方式**: `http://localhost:3000?agentConfig=humanAiDebate`
- **功能特点**:
  - 协作式讨论
  - 智能观点挑战
  - 教育引导功能
  - 自适应对话流程

---

## 🏗️ 架构模式

系统展示了两种主要模式：

1. **聊天监督模式**: 基于实时的聊天智能体与用户交互并处理基本任务，而更智能的基于文本的监督模型（如`gpt-4.1`）广泛用于工具调用和更复杂的响应。这种方法提供了简单的入门和高质量的答案，延迟略有增加。

2. **顺序移交模式**: 专门的智能体（由实时API驱动）之间转移用户以处理特定的用户意图。这对于客户服务非常有用，其中用户意图可以由在特定领域表现出色的专业模型按顺序处理。这有助于避免在单个智能体中包含所有指令和工具，这可能会降低性能。

### 详细实现

系统提供了完整的示例实现，包括：
- 用户认证、退货、销售和人工客服升级的复杂智能体图
- 高风险决策的升级机制
- 状态机引导的精确信息收集
- 字符级确认系统

---

## 📚 项目信息

### 项目优势

- **🎯 教育价值**: 提供创新的交互式学习平台，增强批判性思维和辩论技能
- **🤝 协作智能**: 实现真正的人机协作，AI作为智能伙伴而非简单工具
- **⚡ 实时性能**: 低延迟语音处理，流畅的对话体验
- **🧠 智能分析**: 深度语义理解和上下文感知分析
- **🎨 现代设计**: 优化的用户界面，支持多种主题和响应式布局

### 应用场景

- **教育培训**: 辩论技能培训、批判性思维发展
- **学术研究**: 人机交互研究、对话分析
- **商业应用**: 客户服务、咨询服务
- **个人发展**: 沟通技能提升、逻辑思维训练

### 界面导航

- 可在场景下拉菜单中选择智能体场景，并通过智能体下拉菜单自动切换到特定智能体
- 左侧显示对话记录，包括工具调用、工具调用响应和智能体变更。点击展开非消息元素
- 右侧显示事件日志，包含客户端和服务器事件。点击查看完整载荷
- 底部可以断开连接、在自动语音活动检测或按键通话之间切换、关闭音频播放和切换日志

## 👥 开发团队

### 原始贡献者
- Noah MacCallum - [noahmacca](https://x.com/noahmacca)
- Ilan Bigio - [ibigio](https://github.com/ibigio)
- Brian Fioca - [bfioca](https://github.com/bfioca)

### 项目开发者
- **开发者**: 王雅溶
- **机构**: 北京师范大学智慧学习研究院
- **邮箱**: [yarong@bnu.edu.cn](mailto:yarong@bnu.edu.cn)

## 📄 许可证

本项目基于Apache License 2.0开源协议

## 💡 下一步

- 你可以复制这些模板来制作自己的多智能体语音应用！创建新的智能体配置后，将其添加到`src/app/agentConfigs/index.ts`，就可以在UI的"场景"下拉菜单中选择它
- 每个agentConfig可以定义指令、工具和工具逻辑。默认情况下，所有工具调用仅返回`True`，除非你定义了toolLogic，它将运行你的特定工具逻辑并向对话返回对象（例如用于检索的RAG上下文）
- 如需使用customerServiceRetail中显示的约定创建自己的提示的帮助，包括定义状态机，我们在[这里](src/app/agentConfigs/voiceAgentMetaprompt.txt)包含了一个元提示，或者你可以使用我们的[语音智能体元提示GPT](https://chatgpt.com/g/g-678865c9fb5c81918fa28699735dd08e-voice-agent-metaprompt-gpt)

## 🛡️ 输出护栏

在显示到UI之前，会检查助手消息的安全性和合规性。护栏调用现在直接位于`src/app/App.tsx`内：当`response.text.delta`流开始时，我们将消息标记为**IN_PROGRESS**，一旦服务器发出`guardrail_tripped`或`response.done`，我们就将消息分别标记为**FAIL**或**PASS**。如果你想更改审核的触发方式或显示方式，请在`App.tsx`内搜索`guardrail_tripped`并调整那里的逻辑。

## 🤝 贡献

欢迎提交问题或拉取请求，我们会尽力审查。这个仓库的精神是展示新智能体流程的核心逻辑；超出此核心范围的PR可能不会被合并。

## 🙏 致谢

感谢OpenAI团队提供的Realtime API和Agents SDK，使这个项目成为可能。特别感谢所有为开源AI社区做出贡献的开发者们。

---

**基于OpenAI Realtime API构建 • 为人机协作智能而增强 • 版本2.0**
