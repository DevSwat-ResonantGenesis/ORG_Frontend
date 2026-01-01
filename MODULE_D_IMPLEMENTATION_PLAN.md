# ⭐ MODULE D: MULTI-AGENT TEAMS - Implementation Plan

## 🎯 Overview

Implement a multi-agent collaboration system where multiple AI agents work together inside the IDE, similar to:
- OpenAI Swarm
- Cognition's Devin swarm
- Microsoft AutoGen
- Google MILO

---

## 🏗️ Architecture

### Agent Types (Roles)

1. **Code Analyst** - Analyzes code structure and patterns
2. **Architect** - Designs solutions and proposes changes
3. **Coder** - Implements code changes
4. **Test Writer** - Generates tests
5. **Debugger** - Finds and fixes bugs
6. **Memory Manager** - Manages context and memory
7. **Dependency Resolver** - Resolves dependencies
8. **Documentation Writer** - Writes documentation
9. **CI Pipeline Agent** - Manages CI/CD workflows
10. **Coordinator** - Routes messages and coordinates team

### Agent Graph Structure

```json
{
  "agents": [
    {
      "name": "architect",
      "type": "architect",
      "tools": ["code_graph", "search"],
      "llm_provider": "claude",
      "system_prompt": "..."
    },
    {
      "name": "coder",
      "type": "coder",
      "tools": ["fs.write", "diff"],
      "llm_provider": "gpt-4",
      "system_prompt": "..."
    },
    {
      "name": "tester",
      "type": "test_writer",
      "tools": ["run_tests"],
      "llm_provider": "gpt-4",
      "system_prompt": "..."
    }
  ],
  "workflow": {
    "type": "sequential", // or "parallel", "branching"
    "steps": [
      {
        "agent": "architect",
        "action": "design"
      },
      {
        "agent": "coder",
        "action": "implement",
        "depends_on": ["architect"]
      },
      {
        "agent": "tester",
        "action": "validate",
        "depends_on": ["coder"]
      }
    ]
  }
}
```

---

## 📋 Implementation Phases

### Phase 1: Database Models (Agent Teams & Coordination)

**Files to Create:**
- `models/governance/agent_team.py` - Agent team model
- `models/governance/agent_coordination.py` - Agent message routing
- `models/governance/agent_workflow.py` - Workflow execution state

**Database Tables:**
1. `agent_teams` - Teams of agents
2. `agent_team_members` - Agents in teams
3. `agent_conversations` - Messages between agents
4. `agent_workflows` - Active workflow executions
5. `agent_workflow_steps` - Steps in workflows

---

### Phase 2: Backend Services (Agent Coordination Engine)

**Files to Create:**
- `services/agent_team/team_coordinator.py` - Coordinates agent interactions
- `services/agent_team/message_router.py` - Routes messages between agents
- `services/agent_team/workflow_executor.py` - Executes workflows

**Key Functions:**
- `create_team()` - Create agent team
- `route_message()` - Route message to appropriate agent
- `execute_workflow()` - Execute multi-step workflow
- `get_agent_response()` - Get response from agent
- `coordinator.act()` - Coordinator decides which agent should handle message

---

### Phase 3: Backend API (Agent Teams)

**Files to Create:**
- `routers/agent_teams.py` - API endpoints for teams

**Endpoints:**
- `POST /agent-teams` - Create team
- `GET /agent-teams` - List teams
- `GET /agent-teams/{id}` - Get team details
- `POST /agent-teams/{id}/execute` - Execute workflow
- `POST /agent-teams/{id}/message` - Send message to team
- `GET /agent-teams/{id}/conversation` - Get conversation history

---

### Phase 4: Frontend API Client

**Files to Create:**
- `src/api/agentTeams.ts` - TypeScript API client

**Functions:**
- `createAgentTeam()`
- `listAgentTeams()`
- `getAgentTeam()`
- `executeWorkflow()`
- `sendTeamMessage()`
- `getConversationHistory()`

---

### Phase 5: Frontend UI Components

**Files to Create:**
- `src/pages/AgentTeams/AgentTeamsPage.tsx` - Team management page
- `src/components/AgentTeams/TeamBuilder.tsx` - Visual team builder
- `src/components/AgentTeams/WorkflowExecutor.tsx` - Execute workflows
- `src/components/AgentTeams/ConversationView.tsx` - View agent conversations
- `src/components/AgentTeams/AgentCard.tsx` - Individual agent card

**Features:**
- Visual agent graph builder
- Drag-and-drop team creation
- Real-time conversation view
- Workflow execution progress
- Agent status indicators

---

### Phase 6: Integration with IDE

**Integration Points:**
- Add "Agent Team" option in IDE toolbar
- Integrate with code generation
- Show agent suggestions in IDE
- Display agent workflow results

---

## 🎨 Agent Types & Configurations

### Code Analyst
```json
{
  "type": "code_analyst",
  "system_prompt": "You are a code analyst. Analyze code structure, patterns, and quality.",
  "tools": ["code_graph", "code_search", "ast_parser"],
  "llm_provider": "claude-3-5-sonnet",
  "temperature": 0.3
}
```

### Architect
```json
{
  "type": "architect",
  "system_prompt": "You are a software architect. Design solutions and propose changes.",
  "tools": ["code_graph", "dependency_analyzer"],
  "llm_provider": "claude-3-5-sonnet",
  "temperature": 0.7
}
```

### Coder
```json
{
  "type": "coder",
  "system_prompt": "You are a code implementer. Write clean, efficient code.",
  "tools": ["fs.write", "diff", "code_search"],
  "llm_provider": "gpt-4",
  "temperature": 0.5
}
```

### Test Writer
```json
{
  "type": "test_writer",
  "system_prompt": "You are a test writer. Create comprehensive tests.",
  "tools": ["run_tests", "code_search"],
  "llm_provider": "gpt-4",
  "temperature": 0.3
}
```

---

## 🔄 Workflow Examples

### Example 1: Sequential Workflow (Refactor)
```
User Request: "Refactor this function to use async/await"

1. Architect → Designs refactoring approach
2. Coder → Implements refactoring
3. Test Writer → Updates tests
4. Debugger → Validates changes
5. Coordinator → Merges or rejects
```

### Example 2: Parallel Workflow (Multi-file Changes)
```
User Request: "Update all API endpoints to use new auth"

1. Architect → Designs changes (parallel with)
2. Code Analyst → Analyzes impact
   ↓
3. Coder → Implements changes (per file, parallel)
4. Test Writer → Updates tests (per file)
5. Coordinator → Merges all changes
```

---

## 📊 Database Schema

### agent_teams
- id (UUID)
- org_id (UUID)
- name (string)
- description (text)
- workflow_config (JSONB)
- created_by (UUID)
- created_at, updated_at

### agent_team_members
- id (UUID)
- team_id (UUID)
- agent_id (UUID) - Reference to agents table
- role (string) - "architect", "coder", etc.
- config (JSONB) - Role-specific config
- order (int) - Order in workflow

### agent_conversations
- id (UUID)
- team_id (UUID)
- workflow_execution_id (UUID)
- from_agent_id (UUID)
- to_agent_id (UUID)
- message (text)
- metadata (JSONB)
- created_at

### agent_workflows
- id (UUID)
- team_id (UUID)
- user_id (UUID)
- project_id (UUID)
- status (string) - "pending", "running", "completed", "failed"
- current_step (int)
- result (JSONB)
- error (text)
- created_at, updated_at

---

## 🚀 Implementation Order

1. **Database Models** - Create all tables
2. **Coordinator Service** - Core coordination logic
3. **Backend API** - REST endpoints
4. **Frontend API Client** - TypeScript client
5. **UI Components** - Team builder and executor
6. **Integration** - Connect with IDE

---

## 🎯 Success Criteria

- ✅ Create agent teams with multiple agents
- ✅ Execute sequential workflows (A → B → C)
- ✅ Execute parallel workflows (A, B → C)
- ✅ Route messages between agents
- ✅ View conversation history
- ✅ Integrate with code generation

---

**Ready to start implementation!** 🚀

