# 🎯 Chat Provider & Agent Selection Guide

## 📊 **Overview**

The IDE chat has **two selection controls** that affect how your messages are processed:

1. **Provider Selector** - Chooses which AI model to use
2. **Agent Selector** - Chooses the specialized behavior/personality

---

## 🤖 **1. Provider Selector**

### **What It Does**
Selects which **AI provider/model** will process your chat message.

### **Available Providers**

| Provider | Model | Best For | Speed | Quality |
|----------|-------|----------|-------|---------|
| **Auto** | Automatically picks best | General use | ⚡ Fast | ⭐⭐⭐⭐⭐ |
| **OpenAI** | GPT-4, GPT-3.5 | Complex reasoning | 🐢 Slower | ⭐⭐⭐⭐⭐ |
| **Groq** | Llama, Mixtral | Fast responses | ⚡⚡⚡ Very Fast | ⭐⭐⭐⭐ |
| **Anthropic** | Claude | Long context | 🐢 Slower | ⭐⭐⭐⭐⭐ |
| **Gemini** | Gemini Pro | Multimodal | ⚡ Fast | ⭐⭐⭐⭐ |
| **Mistral** | Mistral Large | Code generation | ⚡ Fast | ⭐⭐⭐⭐ |
| **Cohere** | Command R+ | Summarization | ⚡ Fast | ⭐⭐⭐ |

### **How It Affects Chat**

**Provider = Which AI Brain to Use**

- **Different models** = Different strengths
- **Different providers** = Different response styles
- **Auto mode** = System picks best for your question

### **Example**

```
Question: "Explain this React hook"

OpenAI (GPT-4):     [Detailed, technical explanation]
Groq (Llama):       [Fast, concise answer]
Anthropic (Claude): [Very detailed, well-structured]
Auto:               [Picks best based on question type]
```

### **When to Change Provider**

- **Use Auto**: Most of the time (smartest choice)
- **Use OpenAI**: Need highest quality, complex reasoning
- **Use Groq**: Need fast answers, simple questions
- **Use Anthropic**: Need very detailed explanations
- **Use Gemini**: Working with images or multimodal content

---

## 🎭 **2. Agent Selector**

### **What It Does**
Selects a **specialized agent** that modifies how the AI responds to your question.

### **Available Agents (Built-In)**

These are **pre-configured agents** with specific behaviors:

#### **1. Default Agent** 🎯
- **Purpose**: General-purpose assistant
- **Behavior**: Balanced responses, answers any question
- **Best For**: General questions, learning, explanations
- **Example**: "What is React?" → General explanation

#### **2. Code Assistant** 💻
- **Purpose**: Specialized for coding help
- **Behavior**: Focuses on code examples, syntax, best practices
- **Best For**: Writing code, debugging, code reviews
- **Example**: "How do I add error handling?" → Shows code examples

#### **3. Debugger** 🐛
- **Purpose**: Specialized for finding and fixing bugs
- **Behavior**: Analyzes errors, suggests fixes, explains issues
- **Best For**: Error messages, debugging, troubleshooting
- **Example**: "Why is this error happening?" → Analyzes error, suggests fix

#### **4. Documentation** 📚
- **Purpose**: Specialized for creating and explaining documentation
- **Behavior**: Focuses on clear explanations, documentation style
- **Best For**: Writing docs, explaining concepts, teaching
- **Example**: "Explain this function" → Documentation-style explanation

#### **5. Refactor** 🔧
- **Purpose**: Specialized for code refactoring
- **Behavior**: Suggests improvements, cleaner code, patterns
- **Best For**: Improving code, refactoring, code quality
- **Example**: "How can I improve this code?" → Refactoring suggestions

### **How Agents Work**

**Agent = Specialized Personality/Behavior**

- **Same AI model** (from Provider)
- **Different behavior** (from Agent)
- **Agent modifies** how the AI responds

### **Example: Same Question, Different Agents**

```
Question: "What does this function do?"

Default Agent:
→ General explanation of what the function does

Code Assistant:
→ Explanation + code examples + usage patterns

Debugger:
→ Explanation + potential issues + error handling

Documentation:
→ Clear, structured documentation-style explanation

Refactor:
→ Explanation + suggestions for improvement
```

### **Why Built-In Agents?**

These agents are **pre-configured** to give you:
- ✅ **Consistent behavior** - Same agent = same style
- ✅ **Specialized responses** - Right tool for the job
- ✅ **Better results** - Optimized prompts for each task
- ✅ **No setup needed** - Ready to use immediately

### **Custom Agents vs Built-In**

**Built-In Agents** (what you see):
- Pre-configured by the system
- Optimized for common tasks
- Ready to use immediately
- Consistent behavior

**Custom Agents** (if you create them):
- Your own configurations
- Custom behaviors/prompts
- Saved in your account
- Personal preferences

**Note**: The IDE chat currently shows **built-in agents** for immediate use. Custom agents would be created separately in the Resonant Chat system.

---

## 🔄 **How They Work Together**

### **Provider + Agent = Complete Behavior**

```
Provider (Which AI) + Agent (How to Respond) = Your Result
```

### **Example Combinations**

| Provider | Agent | Result |
|---------|-------|--------|
| OpenAI | Code Assistant | High-quality code examples |
| Groq | Default | Fast general answers |
| Anthropic | Documentation | Detailed documentation |
| Auto | Debugger | Best AI for debugging |

---

## 💡 **Best Practices**

### **For General Questions**
- **Provider**: Auto
- **Agent**: Default

### **For Coding Help**
- **Provider**: Auto or OpenAI
- **Agent**: Code Assistant

### **For Debugging**
- **Provider**: Auto
- **Agent**: Debugger

### **For Learning**
- **Provider**: Anthropic or OpenAI
- **Agent**: Documentation

### **For Code Improvement**
- **Provider**: Auto
- **Agent**: Refactor

---

## 🎯 **Quick Reference**

### **Provider Selector**
- **Location**: Top of chat input area
- **Purpose**: Choose AI model
- **Default**: Auto (recommended)
- **When to change**: Need specific model features

### **Agent Selector**
- **Location**: Next to provider selector
- **Purpose**: Choose response style
- **Default**: Default Agent
- **When to change**: Need specialized behavior

---

## ❓ **FAQ**

### **Q: Do I need to change providers?**
**A**: Usually no. "Auto" picks the best provider automatically.

### **Q: What's the difference between agents?**
**A**: Agents change **how** the AI responds, not **which** AI responds.

### **Q: Can I create my own agents?**
**A**: Built-in agents are ready to use. Custom agents would be created in the Resonant Chat system separately.

### **Q: Do agents work with all providers?**
**A**: Yes! Agents modify the prompt, so they work with any provider.

### **Q: Which combination is best?**
**A**: **Auto + Code Assistant** is great for most coding tasks.

---

## 🚀 **Try It Now**

1. **Ask a question** with Default Agent
2. **Switch to Code Assistant** and ask the same question
3. **See the difference** in response style!

**Example:**
```
Question: "How do I add authentication?"

Default Agent: [General explanation]
Code Assistant: [Code examples + implementation]
Debugger: [Security considerations + error handling]
```

---

**Remember:**
- **Provider** = Which AI brain
- **Agent** = How it responds
- **Auto + Code Assistant** = Great default for coding! 🎯

