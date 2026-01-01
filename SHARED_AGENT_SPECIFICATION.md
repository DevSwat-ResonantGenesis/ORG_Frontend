# Shared Agent Feature - Complete Specification

## Overview

Shared agents allow users to share their complete agent configuration with others. When imported, users get **ALL settings** from the creator, not just memory. All users using the same agent share the same memory.

## How It Works

### 1. **Agent Hash = Public Identifier**
- Like a wallet address or public key
- Unique identifier for the agent
- Anyone with the hash can import and use the agent
- Generated when agent is shared

### 2. **12-Word Secret = Private Key**
- BIP-39 mnemonic (12 words)
- Used for cross-account access
- Like a private key for crypto wallets
- Only shown once when agent is shared
- Allows creator to access their agent on other accounts

### 3. **Complete Settings Inheritance**
When a user imports a shared agent, they receive **ALL** default settings from the creator:

- ✅ **System Prompt** - Complete prompt configuration
- ✅ **Personality Config** - All personality settings
- ✅ **Memory Config** - Retention, thresholds, search settings
- ✅ **Anchor Config** - Anchor management settings
- ✅ **Patch Configurations** - All 23 patches with their settings
- ✅ **Restrictions** - Forbidden words, restricted topics, filters
- ✅ **System Weights** - Hash Sphere/RAG/Memory percentages
- ✅ **API Keys** - (Not shared, user creates their own)
- ✅ **Everything else** - All agent configuration

### 4. **Shared Memory**
- All users using the same `agent_hash` share the same memory
- Memory anchors are shared
- Chat history is shared (optional, can be per-user)
- RAG embeddings are shared
- Hash Sphere data is shared

### 5. **Edit Permissions**
- **Owner (Creator)**: Can edit everything
- **Imported Users**: Can view all settings but **cannot edit** anything
- Imported agents are **read-only** for non-owners

## Backend Implementation Requirements

### Database Schema Updates

```sql
-- Add to agents table
ALTER TABLE agents ADD COLUMN owner_id UUID REFERENCES users(id);
ALTER TABLE agents ADD COLUMN is_shared BOOLEAN DEFAULT FALSE;
ALTER TABLE agents ADD COLUMN is_public BOOLEAN DEFAULT FALSE;
ALTER TABLE agents ADD COLUMN is_imported BOOLEAN DEFAULT FALSE;
ALTER TABLE agents ADD COLUMN share_secret TEXT; -- BIP-39 mnemonic (encrypted)
ALTER TABLE agents ADD COLUMN original_agent_id UUID REFERENCES agents(id); -- For imported agents
```

### API Endpoints

#### 1. Generate Agent Hash
```
POST /settings/agents/{agent_id}/hash
Response: {
  "agent_hash": "0x1234...",
  "share_secret": "word1 word2 ... word12" // Only on first generation
}
```

#### 2. Share Agent (Make Public)
```
POST /settings/agents/{agent_id}/share
Body: {
  "is_public": true
}
Response: {
  "agent_hash": "0x1234...",
  "share_secret": "word1 word2 ... word12"
}
```

#### 3. Import Shared Agent
```
POST /settings/agents/import
Body: {
  "agent_hash": "0x1234..."
}
Response: {
  "id": "new-agent-id",
  "name": "Imported: Original Name",
  "agent_hash": "0x1234...", // Same as original
  "is_imported": true,
  "owner_id": "original-owner-id",
  "original_agent_id": "original-agent-id",
  // All settings copied from original
  "system_prompt": "...",
  "personality_config": {...},
  "memory_config": {...},
  "anchor_config": {...},
  "patch_config": {...},
  "restrictions": {...},
  "system_weights": {...}
}
```

#### 4. List Shared Agents
```
GET /settings/agents/shared
Response: [
  {
    "id": "...",
    "name": "...",
    "agent_hash": "...",
    "is_imported": true,
    "owner_id": "...",
    // ... all settings
  }
]
```

### Memory Sharing Logic

When storing/retrieving memory:

```python
# Use agent_hash as part of the key
memory_key = f"{agent_hash}:{user_id}"  # Optional: per-user memory
# OR
memory_key = f"{agent_hash}"  # Shared memory for all users

# For shared agents, use agent_hash instead of agent_id
if agent.is_imported or agent.is_shared:
    memory_key = agent.agent_hash
else:
    memory_key = agent.id
```

### Permission Checks

```python
def can_edit_agent(agent: Agent, user_id: str) -> bool:
    """Check if user can edit agent"""
    if agent.is_imported:
        return False  # Imported agents are read-only
    if agent.owner_id == user_id:
        return True  # Owner can always edit
    return False  # Others cannot edit
```

### BIP-39 Secret Generation

```python
from mnemonic import Mnemonic

def generate_share_secret() -> str:
    """Generate 12-word BIP-39 mnemonic"""
    mnemo = Mnemonic("english")
    return mnemo.generate(strength=128)  # 12 words

# Encrypt before storing
def encrypt_secret(secret: str, key: str) -> str:
    from cryptography.fernet import Fernet
    f = Fernet(key)
    return f.encrypt(secret.encode()).decode()
```

## Frontend Implementation

### Components Created

1. **AgentSharePanel.tsx** - Share agent UI
2. **SharedAgentImport.tsx** - Import shared agent UI
3. **AgentEditor.tsx** - Updated with read-only mode for imported agents
4. **AgentList.tsx** - Shows imported badge and disables edit/delete

### Features

- ✅ Generate agent hash
- ✅ Display 12-word secret
- ✅ Copy hash/secret to clipboard
- ✅ Import by hash
- ✅ Read-only mode for imported agents
- ✅ Visual indicators (badges, disabled buttons)
- ✅ All settings inherited on import

## User Flow

### Sharing an Agent

1. User creates and configures an agent
2. User goes to "Share" tab
3. Clicks "Share Agent" or "Generate Hash"
4. System generates:
   - Agent hash (public identifier)
   - 12-word secret (private key, shown once)
5. User copies hash and shares it
6. User saves secret securely for cross-account access

### Importing an Agent

1. User receives agent hash from creator
2. User goes to "Import" tab
3. Pastes agent hash
4. Clicks "Import Agent"
5. System:
   - Fetches original agent by hash
   - Copies ALL settings
   - Creates new agent with `is_imported=true`
   - Links to original via `original_agent_id`
   - Uses same `agent_hash` for memory sharing
6. Agent appears in user's list with "Imported" badge
7. User can use agent but cannot edit

### Using Shared Agent

1. User selects imported agent
2. All settings are from creator (read-only)
3. Memory is shared with all users using same hash
4. User can chat, but cannot modify agent
5. Only creator can update agent (all users see updates)

## Security Considerations

1. **Share Secret Encryption**: Store encrypted in database
2. **Hash Validation**: Validate hash format before import
3. **Permission Checks**: Always check ownership before edits
4. **Memory Isolation**: Ensure proper memory key generation
5. **Rate Limiting**: Limit import/share operations

## Testing Checklist

- [ ] Generate agent hash
- [ ] Share agent (make public)
- [ ] Import agent by hash
- [ ] Verify all settings are copied
- [ ] Verify memory is shared
- [ ] Verify read-only mode works
- [ ] Verify owner can still edit
- [ ] Verify non-owner cannot edit
- [ ] Test 12-word secret generation
- [ ] Test cross-account access with secret

