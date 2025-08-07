# Advanced Intelligent Real-Time Conversation System

[**中文**](./README_cn.md) | [**English**](./README.md)

[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![OpenAI](https://img.shields.io/badge/OpenAI-Realtime%20API-orange.svg)](https://platform.openai.com/docs/)

## 📚 Table of Contents

- [Introduction](#introduction)
- [Key Features](#key-features)
- [Quick Start](#quick-start)
- [Technical Specifications](#technical-specifications)
- [Agent Modes](#agent-modes)
- [Architecture Patterns](#architecture-patterns)
- [Project Information](#project-information)
- [Development Team](#development-team)

---

## 🌟 Introduction

This is an advanced intelligent real-time conversation system built on OpenAI's Realtime API, featuring sophisticated debate analysis and seamless human-AI collaborative discussion capabilities. The system intelligently identifies conversation positions, extracts key viewpoints, generates contextual key tags, and provides comprehensive real-time debate analysis with dynamic win rate calculations and topic identification.

### 🚀 Advancing Human-AI Collaboration

This system represents a breakthrough in human-AI collaborative intelligence, enabling natural, dynamic real-time discussions between humans and AI agents. It enhances critical thinking, develops advanced debate skills, and provides an innovative educational platform for interactive learning. The AI functions not merely as a tool, but as an intelligent collaborative partner capable of engaging in meaningful discussions, challenging perspectives constructively, and facilitating deep learning through sophisticated dialogue.

---

## ✨ Key Features

- **🎯 Real-time Voice Processing**: Advanced speech recognition with intelligent conversation capture and natural language understanding
- **🧠 Intelligent Debate Analysis**: Automatic position identification, key viewpoint extraction, and contextual argument analysis
- **🤖 Multiple AI Agent Modes**: Specialized configurations including Debate Moderator and Human-AI Conversation with adaptive behaviors
- **📊 Dynamic Analysis Dashboard**: Real-time win rate calculations, intelligent key tag generation, and topic identification
- **🔄 Advanced LLM Integration**: Context-aware global analysis with sophisticated viewpoint correction and conversation flow understanding
- **🎨 Optimized UI Experience**: Height-optimized panels, modern design, and responsive layout for seamless interaction

---

## 📋 About the OpenAI Agents SDK

This project uses the [OpenAI Agents SDK](https://github.com/openai/openai-agents-js), a toolkit for building, managing, and deploying advanced AI agents. The SDK provides:

- A unified interface for defining agent behaviors and tool integrations
- Built-in support for agent orchestration, state management, and event handling
- Easy integration with the OpenAI Realtime API for low-latency, streaming interactions
- Extensible patterns for multi-agent collaboration, handoffs, tool use, and guardrails

For full documentation, guides, and API references, see the official [OpenAI Agents SDK Documentation](https://github.com/openai/openai-agents-js#readme).

**NOTE:** For a version that does not use the OpenAI Agents SDK, see the [branch without-agents-sdk](https://github.com/openai/openai-realtime-agents/tree/without-agents-sdk).

## 🛠️ Quick Start

### Requirements

- Node.js 18+
- OpenAI API Key
- Modern browser with WebRTC support

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/openai/openai-realtime-agents.git
   cd openai-realtime-agents
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure API Key**

   ```bash
   # Method 1: Add to environment
   export OPENAI_API_KEY=your_openai_api_key_here
   
   # Method 2: Create .env file
   cp .env.sample .env
   # Then add your API key to .env file
   ```

4. **Start the server**

   ```bash
   npm run dev
   ```

5. **Access the application**

   Open your browser to: [http://localhost:3000](http://localhost:3000)

### How to Use

1. **Select Agent Configuration**: Choose "Debate Moderator" or "Human-AI Conversation" from the dropdown
2. **Connect and Start**: Click connect to start real-time conversation
3. **Monitor Analysis**: Watch the real-time analysis and viewpoint extraction on the right panel

---

## 💻 Technical Specifications

### Frontend Technology

- **Next.js 15.4.3**: React Framework
- **TypeScript**: Type safety
- **Tailwind CSS**: Modern UI styling
- **WebRTC**: Real-time audio processing

### AI & Analysis

- **OpenAI Realtime API**: Low-latency voice interaction
- **Advanced LLM Analysis Pipeline**: Intelligent viewpoint extraction and classification
- **Dynamic Conversation State Management**: Real-time conversation flow tracking
- **Intelligent Key Tag Generation**: Automatic discussion point extraction

---

## 🎯 Agent Modes

### Debate Moderator Mode

- **Access**: `http://localhost:3000?agentConfig=debateModerator`
- **Features**:
  - Automatic position identification
  - Pro/con argument analysis
  - Real-time win rate calculation
  - Dark theme UI with clear position zones

### Human-AI Conversation Mode

- **Access**: `http://localhost:3000?agentConfig=humanAiDebate`
- **Features**:
  - Collaborative discussion
  - Intelligent perspective challenging
  - Educational guidance capabilities
  - Adaptive conversation flow

---

## 🏗️ Architecture Patterns

There are two main patterns demonstrated:

1. **Chat-Supervisor**: A realtime-based chat agent interacts with the user and handles basic tasks, while a more intelligent, text-based supervisor model (e.g., `gpt-4.1`) is used extensively for tool calls and more complex responses. This approach provides an easy onramp and high-quality answers, with a small increase in latency.

2. **Sequential Handoff**: Specialized agents (powered by realtime api) transfer the user between them to handle specific user intents. This is great for customer service, where user intents can be handled sequentially by specialist models that excel in a specific domains. This helps avoid the model having all instructions and tools in a single agent, which can degrade performance.

### Setup

- This is a Next.js typescript app. Install dependencies with `npm i`
- Add your `OPENAI_API_KEY` to your env. Either add it to your `.bash_profile` or equivalent, or copy `.env.sample` to `.env` and add it there
- Start the server with `npm run dev`
- Open your browser to [http://localhost:3000](http://localhost:3000). It should default to the `chatSupervisor` Agent Config
- You can change examples via the "Scenario" dropdown in the top right

### Detailed Implementation

The system provides complete example implementations, including:

- Complex agent graph with user authentication, returns, sales, and human agent for escalations
- Escalation mechanisms for high-stakes decisions
- State machine-guided precise information collection
- Character-level confirmation systems

---

## 📚 Project Information

### Project Advantages

- **🎯 Educational Value**: Provides innovative interactive learning platform, enhancing critical thinking and debate skills
- **🤝 Collaborative Intelligence**: Achieves genuine human-AI collaboration, with AI as intelligent partner rather than simple tool
- **⚡ Real-time Performance**: Low-latency voice processing with smooth conversation experience
- **🧠 Intelligent Analysis**: Deep semantic understanding and context-aware analysis
- **🎨 Modern Design**: Optimized user interface with multiple themes and responsive layout

### Use Cases

- **Educational Training**: Debate skills, critical thinking development
- **Academic Research**: Human-computer interaction, conversation analysis
- **Business Applications**: Customer service, consulting
- **Personal Development**: Communication skills, logical thinking training

### UI Navigation

- You can select agent scenarios in the Scenario dropdown, and automatically switch to a specific agent with the Agent dropdown
- The conversation transcript is on the left, including tool calls, tool call responses, and agent changes. Click to expand non-message elements
- The event log is on the right, showing both client and server events. Click to see the full payload
- On the bottom, you can disconnect, toggle between automated voice-activity detection or PTT, turn off audio playback, and toggle logs

## 👥 Development Team

### Original Contributors

- Noah MacCallum - [noahmacca](https://x.com/noahmacca)
- Ilan Bigio - [ibigio](https://github.com/ibigio)
- Brian Fioca - [bfioca](https://github.com/bfioca)

### Project Developer

- **Developer**: Yarong Wang
- **Institution**: Smart Learning Institute of Beijing Normal University
- **Email**: [yarong@bnu.edu.cn](mailto:yarong@bnu.edu.cn)

## 📄 License

This project is licensed under the Apache License 2.0

## 💡 Next Steps

- You can copy these templates to make your own multi-agent voice app! Once you make a new agent set config, add it to `src/app/agentConfigs/index.ts` and you should be able to select it in the UI in the "Scenario" dropdown menu
- Each agentConfig can define instructions, tools, and toolLogic. By default all tool calls simply return `True`, unless you define the toolLogic, which will run your specific tool logic and return an object to the conversation (e.g. for retrieved RAG context)

## 🛡️ Output Guardrails

Assistant messages are checked for safety and compliance before they are shown in the UI. The guardrail call now lives directly inside `src/app/App.tsx`: when a `response.text.delta` stream starts we mark the message as **IN_PROGRESS**, and once the server emits `guardrail_tripped` or `response.done` we mark the message as **FAIL** or **PASS** respectively.

## 🤝 Pull Requests

Feel free to open an issue or pull request and we'll do our best to review it. The spirit of this repo is to demonstrate the core logic for new agentic flows; PRs that go beyond this core scope will likely not be merged.

## 🙏 Acknowledgments

Thanks to the OpenAI team for providing the Realtime API and Agents SDK that made this project possible. Special thanks to all developers contributing to the open source AI community.

---

**Built with OpenAI Realtime API • Enhanced for Human-AI Collaborative Intelligence • v2.0**
