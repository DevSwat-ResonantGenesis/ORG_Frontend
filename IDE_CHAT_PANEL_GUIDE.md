# 💬 IDE Chat Panel - Complete Guide

## 📍 Location
**Right side panel** of the IDE (resizable, default width: 350px)

---

## 🎯 **Purpose**

The Resonant Chat Panel is your **AI coding assistant** integrated directly into the IDE. It understands your project context and can help you with code-related tasks.

---

## ✨ **Key Features**

### 1. **Project-Aware AI Assistant**
- Understands your current project structure
- Knows which file you're editing
- Can read and analyze your code
- Provides context-aware suggestions

### 2. **File Operations**
- **Check files**: "What files are in my project?"
- **Read files**: "Read the main.js file"
- **Edit files**: "Add error handling to the API endpoint"
- **Create files**: "Create a new component called UserCard"
- **Modify code**: "Refactor this function to use async/await"

### 3. **Code Intelligence**
- Explains code functionality
- Suggests improvements
- Finds bugs and issues
- Generates code snippets
- Answers questions about your codebase

### 4. **Agent Modes**
Choose different AI agents for specific tasks:

- **Default Agent**: General coding assistance
- **Code Assistant**: Focused on code generation and editing
- **Debugger**: Helps find and fix bugs
- **Documentation**: Generates documentation and comments
- **Refactor**: Specialized in code refactoring

---

## 🚀 **How to Use**

### **Basic Usage**

1. **Open the Chat Panel**
   - Click the chat icon in the sidebar (if hidden)
   - Or use the "AI" view button
   - Panel appears on the right side

2. **Ask Questions**
   - Type your question in the input box
   - Press Enter or click Send
   - AI responds with helpful information

3. **Get Code Help**
   - Ask about the current file: "What does this function do?"
   - Request changes: "Add error handling here"
   - Get explanations: "Explain this code"

### **Example Queries**

#### **File Operations**
```
"List all files in my project"
"Read the package.json file"
"Show me the main component"
```

#### **Code Understanding**
```
"What does the login function do?"
"Explain this React component"
"Where is the API endpoint defined?"
```

#### **Code Generation**
```
"Create a new utility function to format dates"
"Add a loading spinner component"
"Generate a test file for this component"
```

#### **Code Modification**
```
"Add error handling to the fetch call"
"Refactor this to use async/await"
"Add TypeScript types to this function"
```

#### **Debugging**
```
"Why is this function returning undefined?"
"Find the bug in this code"
"Check for potential errors"
```

---

## 🔧 **Advanced Features**

### **1. Context Awareness**
The chat panel automatically includes:
- **Current file**: The file you're editing
- **Project structure**: All files in your project
- **File content**: First 2000 characters of current file

### **2. Provider Selection**
- Choose AI provider (Auto, ChatGPT, Claude, Gemini)
- Auto mode selects the best provider automatically
- Each provider has different strengths

### **3. Photo Upload**
- Upload screenshots or images
- AI can analyze visual code or UI
- Useful for debugging visual issues

### **4. Conversation History**
- Messages saved in localStorage
- Continues previous conversations
- "New Chat" button to start fresh

---

## 💡 **Use Cases**

### **1. Quick Code Help**
```
You: "How do I add error handling to this API call?"
AI: [Provides code with try-catch and error handling]
```

### **2. Code Explanation**
```
You: "What does this useEffect hook do?"
AI: [Explains the hook, dependencies, and side effects]
```

### **3. File Navigation**
```
You: "Where is the user authentication logic?"
AI: "The authentication logic is in src/auth/AuthService.ts"
```

### **4. Code Generation**
```
You: "Create a React component for a user profile card"
AI: [Generates complete component with props and styling]
```

### **5. Bug Finding**
```
You: "Why is my API call failing?"
AI: [Analyzes code, finds missing error handling, suggests fix]
```

### **6. Refactoring**
```
You: "Refactor this to use modern JavaScript"
AI: [Converts to arrow functions, async/await, destructuring]
```

---

## 🎨 **UI Components**

### **Message Display**
- **User messages**: Right-aligned, blue background
- **AI messages**: Left-aligned, dark background
- **Timestamps**: Shows time for each message
- **Auto-scroll**: Automatically scrolls to latest message

### **Input Area**
- **Textarea**: Multi-line input (3 rows)
- **Send button**: Arrow icon, disabled when empty
- **Enter to send**: Press Enter (Shift+Enter for new line)

### **Controls**
- **Provider selector**: Choose AI provider
- **Agent selector**: Choose agent mode
- **Photo upload**: Upload images
- **New Chat**: Start fresh conversation

---

## 🔗 **Integration with IDE**

### **File Context**
When you have a file open:
- Chat knows which file you're editing
- Includes file content in context
- Can reference specific lines

### **Project Awareness**
- Knows all files in your project
- Understands project structure
- Can navigate between files

### **Code Actions**
- Can generate code blocks
- Offers to apply changes
- Suggests file modifications

---

## 📝 **Tips for Best Results**

### **1. Be Specific**
- ✅ Good: "Add error handling to the login function"
- ❌ Vague: "Fix errors"

### **2. Include Context**
- Mention file names when relevant
- Reference specific functions or components
- Describe what you're trying to achieve

### **3. Use Agent Modes**
- **Code Assistant**: For generating new code
- **Debugger**: For finding bugs
- **Refactor**: For improving code structure
- **Documentation**: For adding comments/docs

### **4. Ask Follow-ups**
- "Can you explain that?"
- "Show me an example"
- "What are the alternatives?"

### **5. Iterate**
- Start with a simple question
- Refine based on AI response
- Ask for clarification if needed

---

## 🎯 **Common Workflows**

### **Workflow 1: Understanding Code**
1. Open a file in the editor
2. Ask: "What does this code do?"
3. AI explains the functionality
4. Ask follow-up questions if needed

### **Workflow 2: Adding Features**
1. Describe what you want: "Add a search feature"
2. AI suggests implementation
3. Review the code
4. Ask for modifications if needed

### **Workflow 3: Debugging**
1. Select "Debugger" agent
2. Describe the problem: "This function returns undefined"
3. AI analyzes and finds the issue
4. Apply the suggested fix

### **Workflow 4: Refactoring**
1. Select "Refactor" agent
2. Ask: "Refactor this to use modern patterns"
3. AI provides refactored code
4. Review and apply changes

---

## ⚙️ **Settings & Configuration**

### **Provider Selection**
- **Auto**: Automatically selects best provider
- **ChatGPT**: OpenAI GPT models
- **Claude**: Anthropic Claude
- **Gemini**: Google Gemini

### **Agent Modes**
- **Default**: General purpose
- **Code Assistant**: Code generation
- **Debugger**: Bug finding
- **Documentation**: Docs generation
- **Refactor**: Code improvement

---

## 🆘 **Troubleshooting**

### **Chat Not Responding**
- Check your internet connection
- Verify AI provider is configured
- Try switching providers

### **AI Doesn't Understand**
- Be more specific in your question
- Include file names and context
- Try rephrasing your question

### **Code Not Applying**
- AI provides code suggestions
- You need to manually apply them
- Or use "AI Dev Agent" for automatic changes

---

## 🎉 **Summary**

The IDE Chat Panel is your **AI coding companion** that:
- ✅ Understands your project
- ✅ Helps with code tasks
- ✅ Explains code functionality
- ✅ Generates code snippets
- ✅ Finds bugs and issues
- ✅ Provides coding assistance

**Think of it as having a senior developer sitting next to you, ready to help with any coding question!** 🚀

---

## 📚 **Related Features**

- **AI Dev Agent**: For automatic code changes
- **Code Search**: Find code patterns
- **Git Panel**: Version control
- **Terminal**: Execute commands
- **Debugger**: Step through code

---

**Happy Coding! 💻✨**

