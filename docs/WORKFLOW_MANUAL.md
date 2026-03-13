# ResonantGenesis Workflow Builder — Complete Manual

## Table of Contents
1. [Overview](#overview)
2. [Accessing the Workflow Builder](#accessing-the-workflow-builder)
3. [Creating Your First Workflow](#creating-your-first-workflow)
4. [Node Types Reference](#node-types-reference)
5. [Connecting Nodes](#connecting-nodes)
6. [Using Variables & References](#using-variables--references)
7. [Example: AI Events Scraper Workflow](#example-ai-events-scraper-workflow)
8. [Saving, Running & Publishing](#saving-running--publishing)
9. [Templates](#templates)
10. [Troubleshooting](#troubleshooting)

---

## Overview

The **Visual Workflow Builder** lets you create powerful automations by connecting nodes in a drag-and-drop canvas. Each node performs a specific action (e.g., search the web, call an LLM, send an email), and data flows from one node to the next through connections.

**Key features:**
- Full-screen ReactFlow canvas with zoom, pan, and grid snapping
- 17 node types covering triggers, AI, data, code, and integrations
- Live LLM provider selection (fetched from platform)
- Undo/redo, import/export JSON, templates
- Save to backend and run workflows directly

---

## Accessing the Workflow Builder

There are two ways to access the workflow builder:

### 1. Full-Screen Visual Builder (Recommended)
- **Dashboard → Workflow Builder** card
- **URL:** `/network/workflows/visual`
- Uses ReactFlow with full-screen canvas, minimap, controls, and detailed config panel

### 2. Agents Page Panel Builder
- **Agents page → Workflow tab → Builder view**
- Embedded canvas inside the agents panel
- Click **"Full Builder"** button to open the full-screen version
- Good for quick edits; use full builder for complex workflows

---

## Creating Your First Workflow

### Step 1: Open the Builder
Navigate to **Dashboard → Workflow Builder** or go to `/network/workflows/visual`.

### Step 2: Add Nodes
Click any node from the **left palette** to add it to the canvas. Nodes appear in the center and can be dragged to reposition.

### Step 3: Connect Nodes
- Each node has **input** (left) and **output** (right) handles
- Click and drag from an output handle to an input handle to create a connection
- Data flows left → right through connections

### Step 4: Configure Nodes
- Click any node to open its **configuration panel** on the right
- Fill in the required fields (URL, prompt, query, etc.)
- Use `{{steps.<name>.output}}` to reference output from previous steps

### Step 5: Save and Run
- Click **Save** to persist your workflow
- Click **Run** to execute it
- Use **Export** to download as JSON, **Import** to load from JSON

---

## Node Types Reference

### Triggers

#### 🔔 Webhook Trigger
**Purpose:** Start a workflow when an external service sends an HTTP request to your webhook URL.

| Field | Description |
|-------|-------------|
| Webhook Path | The URL path (e.g., `/my-webhook`) |
| HTTP Method | POST, GET, or PUT |
| Secret | Optional verification secret for HMAC validation |
| Response Mode | `sync` (wait for result) or `async` (return immediately) |

**Use case:** Trigger workflow when a GitHub push happens, a Stripe payment completes, or a form is submitted.

---

### Data Sources

#### 🌐 HTTP Request
**Purpose:** Call any REST API endpoint to fetch or send data.

| Field | Description |
|-------|-------------|
| URL | Full endpoint URL |
| Method | GET, POST, PUT, DELETE, PATCH |
| Headers (JSON) | Request headers as JSON object |
| Body (JSON) | Request body for POST/PUT |
| Timeout (ms) | Maximum wait time |

**Use case:** Fetch data from external APIs, post results to webhooks, integrate with any REST service.

#### 🔎 Web Search
**Purpose:** Search the internet for information using DuckDuckGo, Brave, or Google.

| Field | Description |
|-------|-------------|
| Search Query | What to search for |
| Search Engine | duckduckgo, brave, or google |
| Max Results | Number of results to return |
| Region | Language/region filter |
| Time Range | any, day, week, month, year |

**Use case:** Research topics, find events, gather news, discover URLs for further processing.

#### 🧲 Memory Search
**Purpose:** Search the Hash Sphere semantic memory system for relevant context.

| Field | Description |
|-------|-------------|
| Search Query | Natural language query |
| Namespace | Memory namespace to search in |
| Results Limit | Max results (top_k) |

**Use case:** Retrieve previously stored knowledge, find related documents, RAG pipelines.

---

### AI & Processing

#### 🧠 LLM Call
**Purpose:** Generate text using AI language models. Models are fetched live from the platform's active providers.

| Field | Description |
|-------|-------------|
| Provider | groq, openai, anthropic, or google |
| Model | Live dropdown of available models (e.g., `groq/llama-3.3-70b-versatile`) |
| System Prompt | Instructions for the AI |
| User Message | The input message (supports variable references) |
| Max Tokens | Maximum response length |
| Temperature | Creativity level (0=deterministic, 2=creative) |

**Use case:** Summarize text, analyze data, generate reports, classify content, extract information.

#### 🤖 Run Agent
**Purpose:** Execute an autonomous agent by ID. The agent will perform multi-step reasoning.

| Field | Description |
|-------|-------------|
| Agent ID | Select from your agents or enter UUID |
| Goal | Task description for the agent |
| Max Steps | Maximum reasoning steps |
| Timeout | Maximum execution time (seconds) |

**Use case:** Complex multi-step tasks that need autonomous reasoning.

#### 💻 Run Code
**Purpose:** Execute custom Python or JavaScript code for data processing.

| Field | Description |
|-------|-------------|
| Language | python or javascript |
| Code | Your code (access previous step output via `input_data`) |
| Timeout (ms) | Maximum execution time |

**Use case:** Custom data transformation, calculations, format conversion, API response parsing.

---

### Communication

#### ✉️ Send Email
**Purpose:** Send emails via SMTP, SendGrid, or AWS SES.

| Field | Description |
|-------|-------------|
| To | Recipient email address |
| Subject | Email subject (supports variables) |
| Body | HTML or plain text body |
| From Name | Sender display name |
| Email Provider | platform_smtp, sendgrid, ses, custom_smtp |
| Attach Output As | none, pdf, json, or csv |

**Use case:** Send reports, notifications, alerts, automated responses.

#### 📧 Notification
**Purpose:** Send notifications to Slack, Discord, Telegram, or custom webhooks.

| Field | Description |
|-------|-------------|
| Channel | slack, discord, webhook, telegram |
| Webhook URL | The notification endpoint |
| Message | Notification text (supports variables) |

**Use case:** Team alerts, status updates, monitoring notifications.

---

### Data Transformation

#### 🔄 Transform
**Purpose:** Map, filter, reduce, flatten, sort, or template JSON data.

| Field | Description |
|-------|-------------|
| Operation | map, filter, reduce, flatten, sort, unique, jq, jsonpath, template |
| Expression | The transformation expression |
| Output Key | Name for the output variable |

**Use case:** Reshape API responses, extract specific fields, merge data.

#### 🧹 Filter
**Purpose:** Filter array data by field conditions and deduplicate.

| Field | Description |
|-------|-------------|
| Field Path | Which field to check |
| Operator | equals, contains, gt, lt, regex, is_unique, etc. |
| Value | Comparison value |
| Deduplicate By | Optional field for removing duplicates |

**Use case:** Remove duplicates, filter results by criteria, validate data.

#### 📊 Aggregator
**Purpose:** Merge multiple input streams into one.

| Field | Description |
|-------|-------------|
| Mode | merge, concat, first, last, all, sum, count |
| Wait For | Number of inputs to collect before proceeding |

**Use case:** Combine results from parallel branches, collect loop outputs.

---

### Flow Control

#### 🔀 If/Else (Condition)
**Purpose:** Branch the workflow based on a JavaScript expression.

| Field | Description |
|-------|-------------|
| Expression | JS condition (e.g., `steps.check.output.count > 0`) |
| True Branch Label | Label for the "yes" path |
| False Branch Label | Label for the "no" path |

**Use case:** Route data based on conditions, error handling, validation gates.

#### 🔁 Loop
**Purpose:** Iterate over an array, executing child steps for each item.

| Field | Description |
|-------|-------------|
| Items Array Path | Path to the array (e.g., `steps.search.output.results`) |
| Max Iterations | Safety limit |
| Parallel Execution | Process items in parallel |
| Batch Size | Items per parallel batch |

**Use case:** Process each search result, send individual emails, transform items.

#### ⚡ Parallel
**Purpose:** Run multiple branches simultaneously.

| Field | Description |
|-------|-------------|
| Branches | Number of parallel paths |
| Wait Mode | all, any, or first_success |
| Timeout | Maximum wait time |

**Use case:** Search multiple sources simultaneously, process independent tasks.

#### ⏱️ Delay
**Purpose:** Pause workflow execution for a specified duration.

| Field | Description |
|-------|-------------|
| Duration (seconds) | How long to wait |
| Wait Until | Or specify an ISO datetime |

**Use case:** Rate limiting, scheduled actions, waiting for external processes.

---

### Storage

#### 🗄️ Database
**Purpose:** Query databases directly from the workflow.

| Field | Description |
|-------|-------------|
| Database Type | postgresql, mongodb, redis, elasticsearch |
| Connection String | Database connection URL |
| Query | SQL or database query |
| Parameters | Query parameters as JSON array |

**Use case:** Read/write data, check for existing records, store results.

---

## Connecting Nodes

Nodes are connected by dragging from the **output handle** (right side) of one node to the **input handle** (left side) of another.

**Rules:**
- Data flows left → right
- A node can have multiple outgoing connections (fork)
- A node can have multiple incoming connections (merge)
- Connections are animated to show data flow direction
- Use the **Condition** node to create if/else branches
- Use the **Parallel** node to run branches simultaneously
- Use the **Aggregator** to merge parallel branches back together

---

## Using Variables & References

### Step Output References
Reference output from any previous step using:
```
{{steps.<step_name>.output}}
```

**Examples:**
- `{{steps.search_web.output.results}}` — array of search results
- `{{steps.llm_analyze.output}}` — LLM response text
- `{{steps.fetch_data.output.items[0].name}}` — specific field

### Environment Variables
Reference environment variables using:
```
{{env.<KEY>}}
```

**Examples:**
- `{{env.API_KEY}}` — your API key
- `{{env.SMTP_HOST}}` — SMTP server address

### Input Variables
Reference workflow input parameters:
```
{{input.<key>}}
```

---

## Example: AI Events Scraper Workflow

This workflow scrapes the internet for AI/IT events, filters duplicates, generates a PDF report, and emails it to users.

### Workflow Steps:

1. **🔎 Web Search** (`search_events`)
   - Query: `AI technology conferences events 2026`
   - Engine: duckduckgo
   - Max Results: 50

2. **🧠 LLM Call** (`extract_events`)
   - Model: `groq/llama-3.3-70b-versatile`
   - System Prompt: `You are a data extraction expert. Extract structured event data from search results.`
   - User Message: `Extract all AI/IT events from these search results. For each event return JSON with: name, description, date, time, location, price, registration_url. Results: {{steps.search_events.output}}`

3. **🧹 Filter** (`deduplicate`)
   - Field: `name`
   - Operator: `is_unique`
   - Deduplicate By: `name`

4. **🔄 Transform** (`format_report`)
   - Operation: `template`
   - Expression: Format events into HTML report with event name, description, date, time, location, price, and registration link

5. **🧠 LLM Call** (`generate_pdf_content`)
   - Model: `groq/llama-3.3-70b-versatile`
   - System Prompt: `Generate a beautifully formatted HTML report for PDF conversion.`
   - User Message: `Create a professional HTML report titled "AI Events Report" with the following events: {{steps.format_report.output}}`

6. **✉️ Send Email** (`email_report`)
   - To: `user@example.com`
   - Subject: `AI Events Report — {{steps.generate_pdf_content.output.date}}`
   - Body: `{{steps.generate_pdf_content.output}}`
   - Attach Output As: `pdf`

### How to recreate:
1. Open the Visual Workflow Builder
2. Add nodes in order: Web Search → LLM Call → Filter → Transform → LLM Call → Send Email
3. Connect them left to right
4. Configure each node as described above
5. Save and Run

---

## Saving, Running & Publishing

### Save
Click **Save** in the top bar. Workflows are persisted to the backend API.

### Run
Click **Run** to execute the workflow. The execution engine processes nodes in topological order, passing output from each step to the next.

### Export / Import
- **Export:** Downloads workflow as JSON file
- **Import:** Upload a JSON file to load a workflow

### Validate
Checks that all required fields are filled and connections are valid.

### Publish
Makes the workflow available for others or to the marketplace. Status flow:
`draft` → `validated` → `published`

### Publish to Marketplace
After publishing, you can list your workflow on the ResonantGenesis Marketplace where other users can discover and use it.

---

## Templates

The builder includes pre-built templates:

1. **Data Pipeline** — ETL workflow: extract → transform → validate → load
2. **Customer Support** — Ticket classification → priority routing → auto-reply → resolution
3. **Content Generation** — Research → outline → draft → review → publish
4. **AI Events Scraper** — Search → extract → deduplicate → report → email

Click **"Use Template"** to start with a pre-configured workflow and customize it.

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Canvas is too small | Use the full-screen builder at `/network/workflows/visual` or click "Full Builder" in Agents panel |
| LLM models not showing | Check that providers are online; the dropdown fetches live from `/resonant-chat/providers` |
| Node config not saving | Ensure you click Save; config auto-persists after 500ms of inactivity |
| Workflow won't run | Validate first — all required fields must be filled |
| Variables not resolving | Check step names match exactly: `{{steps.exact_step_name.output}}` |
| Email not sending | Verify email provider is configured in platform settings |
| Webhook not triggering | Ensure webhook path is registered and secret matches |
