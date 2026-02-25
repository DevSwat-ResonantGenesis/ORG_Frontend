# Sessions

Guide to session management and conversation handling in ResonantGenesis.

## Overview

Sessions enable:
- **Conversation context** - Maintain state across messages
- **Memory persistence** - Store session data
- **Multi-turn interactions** - Complex conversations
- **User tracking** - Associate sessions with users

---

## Creating Sessions

### Via API

POST /api/v1/sessions
{
  "agent_id": "agent_abc123",
  "user_id": "user_xyz789",
  "metadata": {
    "source": "web",
    "language": "en"
  }
}

Response:
{
  "session_id": "sess_123456",
  "agent_id": "agent_abc123",
  "created_at": "2026-02-21T10:00:00Z"
}

---

## Session Messages

### Send Message

POST /api/v1/sessions/{id}/messages
{
  "content": "Hello, how can you help me?",
  "role": "user"
}

Response:
{
  "message_id": "msg_abc123",
  "content": "I can help you with...",
  "role": "assistant"
}

### Get History

GET /api/v1/sessions/{id}/messages

---

## Session Context

### Accessing in Agent

def handle(input_data, context):
    session = context.session
    
    # Get session ID
    session_id = session.id
    
    # Get message history
    history = session.messages
    
    # Store session data
    session.set("user_preference", "dark_mode")
    
    # Retrieve session data
    pref = session.get("user_preference")
    
    return {"response": "..."}

---

## Session Lifecycle

### States

| State | Description |
|-------|-------------|
| active | Session in use |
| idle | No recent activity |
| expired | Session timed out |
| closed | Explicitly ended |

### Timeouts

- Idle timeout: 30 minutes
- Max duration: 24 hours
- Configurable per agent

---

## Session Storage

### Data Stored

- Message history
- Session variables
- User context
- Agent state

### Retention

- Active: In memory + Redis
- Completed: PostgreSQL
- Archived: 30 days

---

## Multi-Agent Sessions

### Handoff

def handle(input_data, context):
    if needs_specialist(input_data):
        return context.session.handoff(
            agent_id="specialist_agent",
            context={"reason": "technical_question"}
        )
    return {"response": "..."}

---

## Best Practices

1. Use sessions for multi-turn conversations
2. Store minimal session data
3. Handle session expiry gracefully
4. Clear sensitive data on close
5. Monitor session metrics

---

*Sessions documentation by Agent 5*
