import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { isAuthenticated } from '../../utils/auth-cookies';
import {
  FileCode,
  Zap,
  Copy,
  ArrowRight,
  Search,
  Filter,
  Star,
  Download,
  Eye,
  Code,
  Database,
  Bot,
  FileText,
  Shield,
  Sparkles,
  CheckCircle,
} from 'lucide-react';

interface AgentTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: React.ReactNode;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
  downloads: number;
  rating: number;
  manifest: object;
  code: string;
}

const TEMPLATES: AgentTemplate[] = [
  {
    id: 'basic-responder',
    name: 'Basic Responder',
    description: 'Simple agent that responds to messages. Perfect starting point for learning agent development.',
    category: 'starter',
    icon: <Bot size={24} />,
    difficulty: 'beginner',
    tags: ['starter', 'hello-world', 'simple'],
    downloads: 1250,
    rating: 4.8,
    manifest: {
      "$schema": "https://dev-swat.com/schemas/agent-manifest-v1.json",
      "version": "1.0.0",
      "agent": {
        "name": "My Agent",
        "version": "1.0.0",
        "description": "A simple agent that responds to messages",
        "author": { "name": "Your Name" },
        "tags": ["starter"]
      },
      "code": {
        "runtime": "python",
        "entrypoint": "main.py"
      },
      "capabilities": {
        "tools": ["memory.read", "memory.write"]
      },
      "governance": { "category": "utility" },
      "trust": { "tier": 1 }
    },
    code: `"""
Basic Responder Agent
A simple template to get started with agent development.
"""

def handle(input_data: dict, context) -> dict:
    """
    Main entry point for the agent.
    
    Args:
        input_data: Input from the user/caller
        context: Execution context with memory access
    
    Returns:
        Response dictionary
    """
    message = input_data.get("message", "").lower()
    
    if "hello" in message:
        return {
            "response": "Hello! I'm your new agent. How can I help?",
            "status": "success"
        }
    
    if "help" in message:
        return {
            "response": "I can respond to greetings and help requests.",
            "commands": ["hello", "help"],
            "status": "success"
        }
    
    return {
        "response": f"You said: {input_data.get('message', 'nothing')}",
        "status": "success"
    }
`,
  },
  {
    id: 'data-processor',
    name: 'Data Processor',
    description: 'Template for processing and transforming data. Includes input validation and structured output.',
    category: 'data',
    icon: <Database size={24} />,
    difficulty: 'intermediate',
    tags: ['data', 'processing', 'transform'],
    downloads: 890,
    rating: 4.6,
    manifest: {
      "$schema": "https://dev-swat.com/schemas/agent-manifest-v1.json",
      "version": "1.0.0",
      "agent": {
        "name": "Data Processor",
        "version": "1.0.0",
        "description": "Processes and transforms data",
        "tags": ["data", "processing"]
      },
      "code": { "runtime": "python", "entrypoint": "main.py" },
      "capabilities": { "tools": ["memory.read", "memory.write"] },
      "governance": { "category": "data" },
      "trust": { "tier": 1 }
    },
    code: `"""
Data Processor Agent
Template for data processing and transformation.
"""
from typing import Any, Dict, List

def handle(input_data: dict, context) -> dict:
    """Process and transform input data."""
    
    # Validate input
    data = input_data.get("data")
    operation = input_data.get("operation", "identity")
    
    if data is None:
        return {"error": "Missing 'data' field", "success": False}
    
    # Process based on operation
    result = process_data(data, operation)
    
    return {
        "success": True,
        "operation": operation,
        "input_type": type(data).__name__,
        "output": result,
        "metadata": {
            "processed_at": __import__("datetime").datetime.utcnow().isoformat()
        }
    }

def process_data(data: Any, operation: str) -> Any:
    """Apply transformation to data."""
    
    if operation == "identity":
        return data
    
    if operation == "uppercase" and isinstance(data, str):
        return data.upper()
    
    if operation == "lowercase" and isinstance(data, str):
        return data.lower()
    
    if operation == "reverse" and isinstance(data, (str, list)):
        return data[::-1]
    
    if operation == "sort" and isinstance(data, list):
        return sorted(data)
    
    if operation == "unique" and isinstance(data, list):
        return list(set(data))
    
    if operation == "count":
        return len(data) if hasattr(data, "__len__") else 1
    
    return data
`,
  },
  {
    id: 'api-connector',
    name: 'API Connector',
    description: 'Template for agents that connect to external APIs. Includes error handling and rate limiting.',
    category: 'integration',
    icon: <Zap size={24} />,
    difficulty: 'intermediate',
    tags: ['api', 'integration', 'http'],
    downloads: 720,
    rating: 4.5,
    manifest: {
      "$schema": "https://dev-swat.com/schemas/agent-manifest-v1.json",
      "version": "1.0.0",
      "agent": {
        "name": "API Connector",
        "version": "1.0.0",
        "description": "Connects to external APIs",
        "tags": ["api", "integration"]
      },
      "code": { "runtime": "python", "entrypoint": "main.py" },
      "capabilities": { "tools": ["http.get", "http.post", "memory.read"] },
      "governance": { "category": "integration" },
      "trust": { "tier": 2 }
    },
    code: `"""
API Connector Agent
Template for connecting to external APIs.
"""
import json
from typing import Dict, Any, Optional

# Note: In production, use the context.http methods provided by the runtime
# This is a template showing the structure

def handle(input_data: dict, context) -> dict:
    """Connect to an external API and return results."""
    
    endpoint = input_data.get("endpoint")
    method = input_data.get("method", "GET").upper()
    payload = input_data.get("payload")
    headers = input_data.get("headers", {})
    
    if not endpoint:
        return {"error": "Missing 'endpoint' field", "success": False}
    
    try:
        # Simulate API call (replace with actual HTTP call)
        result = make_api_call(endpoint, method, payload, headers)
        
        return {
            "success": True,
            "endpoint": endpoint,
            "method": method,
            "response": result,
            "metadata": {
                "cached": False,
                "timestamp": __import__("datetime").datetime.utcnow().isoformat()
            }
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "endpoint": endpoint
        }

def make_api_call(
    endpoint: str,
    method: str,
    payload: Optional[Dict],
    headers: Dict[str, str]
) -> Dict[str, Any]:
    """Make an API call. Replace with actual implementation."""
    
    # Placeholder - in production, use context.http.get/post
    return {
        "status": 200,
        "data": {"message": "API call simulated", "endpoint": endpoint}
    }
`,
  },
  {
    id: 'text-analyzer',
    name: 'Text Analyzer',
    description: 'NLP template for text analysis. Includes sentiment, keywords, and summary extraction.',
    category: 'analysis',
    icon: <FileText size={24} />,
    difficulty: 'intermediate',
    tags: ['nlp', 'text', 'analysis', 'sentiment'],
    downloads: 1100,
    rating: 4.7,
    manifest: {
      "$schema": "https://dev-swat.com/schemas/agent-manifest-v1.json",
      "version": "1.0.0",
      "agent": {
        "name": "Text Analyzer",
        "version": "1.0.0",
        "description": "Analyzes text content",
        "tags": ["nlp", "analysis"]
      },
      "code": { "runtime": "python", "entrypoint": "main.py" },
      "capabilities": { "tools": ["memory.read", "memory.write"] },
      "governance": { "category": "analysis" },
      "trust": { "tier": 1 }
    },
    code: `"""
Text Analyzer Agent
Template for NLP and text analysis.
"""
import re
from collections import Counter
from typing import Dict, List

def handle(input_data: dict, context) -> dict:
    """Analyze text content."""
    
    text = input_data.get("text", "")
    
    if not text:
        return {"error": "Missing 'text' field", "success": False}
    
    analysis = analyze_text(text)
    
    return {
        "success": True,
        "analysis": analysis,
        "metadata": {
            "agent": "text-analyzer",
            "version": "1.0.0"
        }
    }

def analyze_text(text: str) -> Dict:
    """Perform text analysis."""
    
    # Basic stats
    words = text.split()
    sentences = re.split(r'[.!?]+', text)
    sentences = [s.strip() for s in sentences if s.strip()]
    
    # Word frequency
    word_freq = Counter(w.lower() for w in words if len(w) > 3)
    top_words = word_freq.most_common(5)
    
    # Simple sentiment (replace with ML model in production)
    positive_words = {"good", "great", "excellent", "amazing", "love", "best"}
    negative_words = {"bad", "terrible", "awful", "hate", "worst", "poor"}
    
    words_lower = set(w.lower() for w in words)
    pos_count = len(words_lower & positive_words)
    neg_count = len(words_lower & negative_words)
    
    if pos_count > neg_count:
        sentiment = "positive"
    elif neg_count > pos_count:
        sentiment = "negative"
    else:
        sentiment = "neutral"
    
    return {
        "word_count": len(words),
        "sentence_count": len(sentences),
        "avg_word_length": sum(len(w) for w in words) / max(len(words), 1),
        "top_keywords": [w for w, _ in top_words],
        "sentiment": sentiment,
        "readability": "easy" if len(words) / max(len(sentences), 1) < 15 else "moderate"
    }
`,
  },
  {
    id: 'secure-validator',
    name: 'Secure Validator',
    description: 'Security-focused template with input validation, sanitization, and audit logging.',
    category: 'security',
    icon: <Shield size={24} />,
    difficulty: 'advanced',
    tags: ['security', 'validation', 'audit'],
    downloads: 450,
    rating: 4.9,
    manifest: {
      "$schema": "https://dev-swat.com/schemas/agent-manifest-v1.json",
      "version": "1.0.0",
      "agent": {
        "name": "Secure Validator",
        "version": "1.0.0",
        "description": "Security-focused validation agent",
        "tags": ["security", "validation"]
      },
      "code": { "runtime": "python", "entrypoint": "main.py" },
      "capabilities": { "tools": ["memory.read", "memory.write"] },
      "governance": { "category": "security" },
      "trust": { "tier": 1 }
    },
    code: `"""
Secure Validator Agent
Template with security best practices.
"""
import re
import hashlib
from typing import Dict, Any, List, Optional
from datetime import datetime

def handle(input_data: dict, context) -> dict:
    """Validate and sanitize input data."""
    
    # Audit log entry
    audit_entry = create_audit_entry(input_data, context)
    
    # Validate input
    validation_result = validate_input(input_data)
    
    if not validation_result["valid"]:
        return {
            "success": False,
            "errors": validation_result["errors"],
            "audit_id": audit_entry["id"]
        }
    
    # Sanitize input
    sanitized = sanitize_input(input_data.get("data", {}))
    
    return {
        "success": True,
        "sanitized_data": sanitized,
        "validation": validation_result,
        "audit_id": audit_entry["id"]
    }

def validate_input(input_data: dict) -> Dict[str, Any]:
    """Validate input against security rules."""
    
    errors = []
    data = input_data.get("data", {})
    
    # Check for required fields
    required = input_data.get("required_fields", [])
    for field in required:
        if field not in data:
            errors.append(f"Missing required field: {field}")
    
    # Check for SQL injection patterns
    sql_pattern = re.compile(r"(union|select|insert|update|delete|drop|;|--)", re.I)
    for key, value in data.items():
        if isinstance(value, str) and sql_pattern.search(value):
            errors.append(f"Potential SQL injection in field: {key}")
    
    # Check for XSS patterns
    xss_pattern = re.compile(r"<script|javascript:|on\\w+=", re.I)
    for key, value in data.items():
        if isinstance(value, str) and xss_pattern.search(value):
            errors.append(f"Potential XSS in field: {key}")
    
    return {
        "valid": len(errors) == 0,
        "errors": errors,
        "checked_fields": len(data)
    }

def sanitize_input(data: dict) -> dict:
    """Sanitize input data."""
    
    sanitized = {}
    for key, value in data.items():
        if isinstance(value, str):
            # Remove potential dangerous characters
            clean = re.sub(r'[<>"\\';&]', '', value)
            sanitized[key] = clean.strip()
        else:
            sanitized[key] = value
    
    return sanitized

def create_audit_entry(input_data: dict, context) -> dict:
    """Create an audit log entry."""
    
    timestamp = datetime.utcnow().isoformat()
    data_hash = hashlib.sha256(str(input_data).encode()).hexdigest()[:16]
    
    return {
        "id": f"audit-{data_hash}",
        "timestamp": timestamp,
        "user": getattr(context, "user_dsid", "unknown"),
        "action": "validate"
    }
`,
  },
  {
    id: 'ai-assistant',
    name: 'AI Assistant',
    description: 'Template for building AI-powered assistants with conversation memory and tool use.',
    category: 'ai',
    icon: <Sparkles size={24} />,
    difficulty: 'advanced',
    tags: ['ai', 'assistant', 'conversation', 'memory'],
    downloads: 680,
    rating: 4.8,
    manifest: {
      "$schema": "https://dev-swat.com/schemas/agent-manifest-v1.json",
      "version": "1.0.0",
      "agent": {
        "name": "AI Assistant",
        "version": "1.0.0",
        "description": "AI-powered assistant with memory",
        "tags": ["ai", "assistant"]
      },
      "code": { "runtime": "python", "entrypoint": "main.py" },
      "capabilities": { "tools": ["memory.read", "memory.write", "llm.complete"] },
      "governance": { "category": "ai" },
      "trust": { "tier": 2 }
    },
    code: `"""
AI Assistant Agent
Template for AI-powered assistants.
"""
from typing import Dict, List, Any, Optional
from datetime import datetime

def handle(input_data: dict, context) -> dict:
    """Handle user interaction with AI assistance."""
    
    message = input_data.get("message", "")
    conversation_id = input_data.get("conversation_id", "default")
    
    if not message:
        return {"error": "Missing 'message' field", "success": False}
    
    # Load conversation history from memory
    history = load_conversation(context, conversation_id)
    
    # Add user message
    history.append({"role": "user", "content": message})
    
    # Generate response (replace with actual LLM call)
    response = generate_response(message, history)
    
    # Add assistant response
    history.append({"role": "assistant", "content": response})
    
    # Save updated history
    save_conversation(context, conversation_id, history)
    
    return {
        "success": True,
        "response": response,
        "conversation_id": conversation_id,
        "turn_count": len(history) // 2,
        "metadata": {
            "timestamp": datetime.utcnow().isoformat(),
            "model": "template-v1"
        }
    }

def load_conversation(context, conversation_id: str) -> List[Dict]:
    """Load conversation history from memory."""
    
    memory = getattr(context, "memory", {})
    key = f"conversation:{conversation_id}"
    return memory.get(key, [])

def save_conversation(context, conversation_id: str, history: List[Dict]):
    """Save conversation history to memory."""
    
    # Keep last 20 turns to prevent memory overflow
    trimmed = history[-40:] if len(history) > 40 else history
    
    memory = getattr(context, "memory", {})
    key = f"conversation:{conversation_id}"
    memory[key] = trimmed

def generate_response(message: str, history: List[Dict]) -> str:
    """Generate AI response. Replace with actual LLM integration."""
    
    # Simple pattern matching (replace with LLM in production)
    message_lower = message.lower()
    
    if "hello" in message_lower or "hi" in message_lower:
        return "Hello! I'm your AI assistant. How can I help you today?"
    
    if "help" in message_lower:
        return "I can assist with questions, tasks, and conversations. What would you like to know?"
    
    if "thank" in message_lower:
        return "You're welcome! Is there anything else I can help with?"
    
    if "bye" in message_lower or "goodbye" in message_lower:
        return "Goodbye! Feel free to come back anytime."
    
    # Default response
    return f"I understand you're asking about: {message}. In production, this would be handled by an LLM."
`,
  },
  {
    id: 'research-assistant',
    name: 'Research Assistant',
    description: 'AI-powered research agent that searches, summarizes, and synthesizes information from multiple sources.',
    category: 'ai',
    icon: <Search size={24} />,
    difficulty: 'intermediate',
    tags: ['research', 'search', 'summary', 'ai'],
    downloads: 1450,
    rating: 4.9,
    manifest: {
      "$schema": "https://dev-swat.com/schemas/agent-manifest-v1.json",
      "version": "1.0.0",
      "agent": {
        "name": "Research Assistant",
        "version": "1.0.0",
        "description": "AI-powered research and summarization agent",
        "tags": ["research", "ai"]
      },
      "code": { "runtime": "python", "entrypoint": "main.py" },
      "capabilities": { "tools": ["web.search", "memory.read", "memory.write", "llm.complete"] },
      "governance": { "category": "research" },
      "trust": { "tier": 2 }
    },
    code: `"""
Research Assistant Agent
AI-powered research, search, and summarization.
"""
from typing import Dict, List, Any
from datetime import datetime

def handle(input_data: dict, context) -> dict:
    """Research a topic and provide summarized findings."""
    
    query = input_data.get("query", "")
    depth = input_data.get("depth", "standard")  # quick, standard, deep
    
    if not query:
        return {"error": "Missing 'query' field", "success": False}
    
    # Perform research
    findings = research_topic(query, depth, context)
    
    # Generate summary
    summary = synthesize_findings(findings)
    
    return {
        "success": True,
        "query": query,
        "summary": summary,
        "sources": findings.get("sources", []),
        "key_points": findings.get("key_points", []),
        "metadata": {
            "depth": depth,
            "source_count": len(findings.get("sources", [])),
            "timestamp": datetime.utcnow().isoformat()
        }
    }

def research_topic(query: str, depth: str, context) -> Dict[str, Any]:
    """Research a topic using available tools."""
    
    # Simulate web search results
    sources = [
        {"title": f"Source 1 for {query}", "url": "https://example.com/1", "relevance": 0.95},
        {"title": f"Source 2 for {query}", "url": "https://example.com/2", "relevance": 0.87},
        {"title": f"Source 3 for {query}", "url": "https://example.com/3", "relevance": 0.82},
    ]
    
    key_points = [
        f"Key finding 1 about {query}",
        f"Key finding 2 about {query}",
        f"Important consideration regarding {query}",
    ]
    
    return {
        "sources": sources,
        "key_points": key_points,
        "raw_data": f"Research data for: {query}"
    }

def synthesize_findings(findings: Dict[str, Any]) -> str:
    """Synthesize research findings into a summary."""
    
    key_points = findings.get("key_points", [])
    source_count = len(findings.get("sources", []))
    
    summary = f"Based on analysis of {source_count} sources:\\n\\n"
    for i, point in enumerate(key_points, 1):
        summary += f"{i}. {point}\\n"
    
    return summary
`,
  },
  {
    id: 'code-helper',
    name: 'Code Helper',
    description: 'Development assistant that helps write, review, and debug code across multiple languages.',
    category: 'development',
    icon: <Code size={24} />,
    difficulty: 'intermediate',
    tags: ['code', 'development', 'debugging', 'review'],
    downloads: 2100,
    rating: 4.8,
    manifest: {
      "$schema": "https://dev-swat.com/schemas/agent-manifest-v1.json",
      "version": "1.0.0",
      "agent": {
        "name": "Code Helper",
        "version": "1.0.0",
        "description": "Development assistant for coding tasks",
        "tags": ["code", "development"]
      },
      "code": { "runtime": "python", "entrypoint": "main.py" },
      "capabilities": { "tools": ["code.execute", "memory.read", "memory.write", "llm.complete"] },
      "governance": { "category": "development" },
      "trust": { "tier": 2 }
    },
    code: `"""
Code Helper Agent
Development assistant for coding tasks.
"""
from typing import Dict, Any, Optional
import re

def handle(input_data: dict, context) -> dict:
    """Handle coding assistance requests."""
    
    action = input_data.get("action", "help")
    code = input_data.get("code", "")
    language = input_data.get("language", "python")
    description = input_data.get("description", "")
    
    if action == "review":
        return review_code(code, language)
    elif action == "debug":
        error = input_data.get("error", "")
        return debug_code(code, error, language)
    elif action == "generate":
        return generate_code(description, language)
    elif action == "explain":
        return explain_code(code, language)
    else:
        return {
            "success": True,
            "message": "Available actions: review, debug, generate, explain",
            "usage": {
                "review": "Review code for issues and improvements",
                "debug": "Help debug code with an error",
                "generate": "Generate code from description",
                "explain": "Explain what code does"
            }
        }

def review_code(code: str, language: str) -> Dict[str, Any]:
    """Review code for issues and improvements."""
    
    issues = []
    suggestions = []
    
    # Basic checks
    if len(code) > 500:
        suggestions.append("Consider breaking this into smaller functions")
    
    if "TODO" in code or "FIXME" in code:
        issues.append("Contains TODO/FIXME comments that need attention")
    
    # Language-specific checks
    if language == "python":
        if "import *" in code:
            issues.append("Avoid wildcard imports")
        if not code.strip().startswith('"""') and "def " in code:
            suggestions.append("Add docstrings to functions")
    
    return {
        "success": True,
        "action": "review",
        "issues": issues,
        "suggestions": suggestions,
        "score": max(0, 100 - len(issues) * 10 - len(suggestions) * 5)
    }

def debug_code(code: str, error: str, language: str) -> Dict[str, Any]:
    """Help debug code with an error."""
    
    suggestions = []
    
    if "NameError" in error:
        suggestions.append("Check if the variable is defined before use")
    elif "TypeError" in error:
        suggestions.append("Check the types of your variables")
    elif "SyntaxError" in error:
        suggestions.append("Check for missing brackets, quotes, or colons")
    elif "IndentationError" in error:
        suggestions.append("Check your indentation - use consistent spaces or tabs")
    else:
        suggestions.append("Review the error message and stack trace carefully")
    
    return {
        "success": True,
        "action": "debug",
        "error_type": error.split(":")[0] if ":" in error else "Unknown",
        "suggestions": suggestions,
        "next_steps": ["Add print statements to trace execution", "Check variable values"]
    }

def generate_code(description: str, language: str) -> Dict[str, Any]:
    """Generate code from description."""
    
    # Placeholder - in production, use LLM
    template = f'''# Generated code for: {description}
# Language: {language}

def main():
    """Main function."""
    # TODO: Implement {description}
    pass

if __name__ == "__main__":
    main()
'''
    
    return {
        "success": True,
        "action": "generate",
        "code": template,
        "language": language,
        "note": "This is a template. Implement the TODO section."
    }

def explain_code(code: str, language: str) -> Dict[str, Any]:
    """Explain what code does."""
    
    # Basic analysis
    lines = code.strip().split("\\n")
    functions = [l for l in lines if l.strip().startswith("def ")]
    classes = [l for l in lines if l.strip().startswith("class ")]
    imports = [l for l in lines if l.strip().startswith("import ") or l.strip().startswith("from ")]
    
    return {
        "success": True,
        "action": "explain",
        "summary": f"Code with {len(lines)} lines, {len(functions)} functions, {len(classes)} classes",
        "structure": {
            "total_lines": len(lines),
            "functions": len(functions),
            "classes": len(classes),
            "imports": len(imports)
        },
        "explanation": "In production, this would provide a detailed explanation using an LLM."
    }
`,
  },
  {
    id: 'data-analyst',
    name: 'Data Analyst',
    description: 'Analyzes datasets, generates insights, and creates visualizations from structured data.',
    category: 'data',
    icon: <Database size={24} />,
    difficulty: 'advanced',
    tags: ['data', 'analytics', 'visualization', 'insights'],
    downloads: 980,
    rating: 4.7,
    manifest: {
      "$schema": "https://dev-swat.com/schemas/agent-manifest-v1.json",
      "version": "1.0.0",
      "agent": {
        "name": "Data Analyst",
        "version": "1.0.0",
        "description": "Data analysis and insights generation",
        "tags": ["data", "analytics"]
      },
      "code": { "runtime": "python", "entrypoint": "main.py" },
      "capabilities": { "tools": ["data.query", "memory.read", "memory.write"] },
      "governance": { "category": "analytics" },
      "trust": { "tier": 2 }
    },
    code: `"""
Data Analyst Agent
Analyzes data and generates insights.
"""
from typing import Dict, List, Any, Optional
from datetime import datetime
import statistics

def handle(input_data: dict, context) -> dict:
    """Analyze data and generate insights."""
    
    data = input_data.get("data", [])
    analysis_type = input_data.get("analysis", "summary")
    
    if not data:
        return {"error": "Missing 'data' field", "success": False}
    
    if analysis_type == "summary":
        result = generate_summary(data)
    elif analysis_type == "trends":
        result = analyze_trends(data)
    elif analysis_type == "outliers":
        result = detect_outliers(data)
    elif analysis_type == "correlation":
        result = analyze_correlation(data)
    else:
        result = generate_summary(data)
    
    return {
        "success": True,
        "analysis_type": analysis_type,
        "results": result,
        "metadata": {
            "record_count": len(data),
            "timestamp": datetime.utcnow().isoformat()
        }
    }

def generate_summary(data: List[Any]) -> Dict[str, Any]:
    """Generate statistical summary of data."""
    
    if not data:
        return {"error": "No data provided"}
    
    # Handle numeric data
    if all(isinstance(x, (int, float)) for x in data):
        return {
            "count": len(data),
            "sum": sum(data),
            "mean": statistics.mean(data),
            "median": statistics.median(data),
            "min": min(data),
            "max": max(data),
            "std_dev": statistics.stdev(data) if len(data) > 1 else 0
        }
    
    # Handle mixed data
    return {
        "count": len(data),
        "types": list(set(type(x).__name__ for x in data)),
        "unique_values": len(set(str(x) for x in data))
    }

def analyze_trends(data: List[Any]) -> Dict[str, Any]:
    """Analyze trends in sequential data."""
    
    if len(data) < 2:
        return {"trend": "insufficient_data"}
    
    if all(isinstance(x, (int, float)) for x in data):
        first_half = statistics.mean(data[:len(data)//2])
        second_half = statistics.mean(data[len(data)//2:])
        
        if second_half > first_half * 1.05:
            trend = "increasing"
        elif second_half < first_half * 0.95:
            trend = "decreasing"
        else:
            trend = "stable"
        
        return {
            "trend": trend,
            "change_percent": ((second_half - first_half) / first_half) * 100 if first_half else 0
        }
    
    return {"trend": "non_numeric_data"}

def detect_outliers(data: List[Any]) -> Dict[str, Any]:
    """Detect outliers using IQR method."""
    
    if not all(isinstance(x, (int, float)) for x in data):
        return {"error": "Outlier detection requires numeric data"}
    
    sorted_data = sorted(data)
    q1 = sorted_data[len(sorted_data)//4]
    q3 = sorted_data[3*len(sorted_data)//4]
    iqr = q3 - q1
    
    lower_bound = q1 - 1.5 * iqr
    upper_bound = q3 + 1.5 * iqr
    
    outliers = [x for x in data if x < lower_bound or x > upper_bound]
    
    return {
        "outliers": outliers,
        "outlier_count": len(outliers),
        "bounds": {"lower": lower_bound, "upper": upper_bound}
    }

def analyze_correlation(data: List[Dict]) -> Dict[str, Any]:
    """Analyze correlation between fields."""
    
    if not data or not isinstance(data[0], dict):
        return {"error": "Correlation requires list of dictionaries"}
    
    # Placeholder for correlation analysis
    return {
        "note": "Correlation analysis requires paired numeric fields",
        "fields_found": list(data[0].keys()) if data else []
    }
`,
  },
];

const CATEGORIES = [
  { id: 'all', name: 'All Templates', count: TEMPLATES.length },
  { id: 'starter', name: 'Starter', count: TEMPLATES.filter(t => t.category === 'starter').length },
  { id: 'data', name: 'Data', count: TEMPLATES.filter(t => t.category === 'data').length },
  { id: 'integration', name: 'Integration', count: TEMPLATES.filter(t => t.category === 'integration').length },
  { id: 'analysis', name: 'Analysis', count: TEMPLATES.filter(t => t.category === 'analysis').length },
  { id: 'security', name: 'Security', count: TEMPLATES.filter(t => t.category === 'security').length },
  { id: 'ai', name: 'AI', count: TEMPLATES.filter(t => t.category === 'ai').length },
];

const styles: Record<string, React.CSSProperties> = {
  container: {
    height: '100%',
    maxHeight: 'calc(100vh - 56px)',
    background: 'linear-gradient(180deg, #0a0a0f 0%, #12121a 100%)',
    color: '#fff',
    padding: '0.5rem 1rem',
    overflowY: 'auto',
    overflowX: 'hidden',
  },
  header: {
    marginBottom: '0.5rem',
  },
  title: {
    fontSize: '1.1rem',
    fontWeight: '600',
    marginBottom: '0.25rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  subtitle: {
    color: '#666',
    fontSize: '0.7rem',
    display: 'block',
  },
  controls: {
    display: 'flex',
    gap: '0.5rem',
    marginBottom: '0.5rem',
    flexWrap: 'wrap',
  },
  searchBox: {
    flex: 1,
    minWidth: '150px',
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    padding: '0',
    background: 'transparent',
    border: 'none',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
  },
  searchInput: {
    flex: 1,
    background: 'none',
    border: 'none',
    color: '#aaa',
    fontSize: '0.75rem',
    outline: 'none',
    padding: '0.2rem 0',
  },
  categoryTabs: {
    display: 'flex',
    gap: '0.25rem',
  },
  categoryTab: {
    padding: '0.25rem 0.5rem',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '4px',
    color: '#888',
    fontSize: '0.7rem',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  categoryTabActive: {
    background: 'rgba(99,102,241,0.2)',
    borderColor: 'rgba(99,102,241,0.3)',
    color: '#6366f1',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
    gap: '1.5rem',
  },
  card: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '12px',
    overflow: 'hidden',
    transition: 'all 0.2s',
    cursor: 'pointer',
  },
  cardHeader: {
    padding: '1.25rem',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '1rem',
  },
  cardIcon: {
    width: '48px',
    height: '48px',
    borderRadius: '10px',
    background: 'linear-gradient(135deg, rgba(99,102,241,0.2) 0%, rgba(139,92,246,0.2) 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#6366f1',
  },
  cardTitle: {
    fontSize: '1rem',
    fontWeight: '600',
    marginBottom: '0.25rem',
  },
  cardCategory: {
    fontSize: '0.7rem',
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  cardBody: {
    padding: '1.25rem',
  },
  cardDescription: {
    fontSize: '0.8rem',
    color: '#aaa',
    lineHeight: '1.5',
    marginBottom: '1rem',
  },
  cardTags: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.5rem',
    marginBottom: '1rem',
  },
  tag: {
    padding: '0.25rem 0.5rem',
    background: 'rgba(255,255,255,0.05)',
    borderRadius: '4px',
    fontSize: '0.7rem',
    color: '#888',
  },
  cardFooter: {
    padding: '1rem 1.25rem',
    borderTop: '1px solid rgba(255,255,255,0.05)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardStats: {
    display: 'flex',
    gap: '1rem',
    fontSize: '0.75rem',
    color: '#666',
  },
  stat: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
  },
  useButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem 1rem',
    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    border: 'none',
    borderRadius: '6px',
    color: '#fff',
    fontSize: '0.8rem',
    fontWeight: '500',
    cursor: 'pointer',
  },
  difficultyBadge: {
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
    fontSize: '0.65rem',
    fontWeight: '500',
    textTransform: 'uppercase',
  },
  beginnerBadge: {
    background: 'rgba(16,185,129,0.2)',
    color: '#10b981',
  },
  intermediateBadge: {
    background: 'rgba(251,191,36,0.2)',
    color: '#fbbf24',
  },
  advancedBadge: {
    background: 'rgba(239,68,68,0.2)',
    color: '#ef4444',
  },
  modal: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '2rem',
  },
  modalContent: {
    background: '#1a1a24',
    borderRadius: '16px',
    width: '100%',
    maxWidth: '900px',
    maxHeight: '90vh',
    overflow: 'auto',
  },
  modalHeader: {
    padding: '1.5rem',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalBody: {
    padding: '1.5rem',
  },
  codeBlock: {
    background: 'rgba(0,0,0,0.3)',
    borderRadius: '8px',
    padding: '1rem',
    fontFamily: 'monospace',
    fontSize: '0.75rem',
    color: '#10b981',
    overflow: 'auto',
    maxHeight: '400px',
  },
  tabBar: {
    display: 'flex',
    gap: '0.5rem',
    marginBottom: '1rem',
  },
  tab: {
    padding: '0.5rem 1rem',
    background: 'rgba(255,255,255,0.05)',
    border: 'none',
    borderRadius: '6px',
    color: '#888',
    fontSize: '0.8rem',
    cursor: 'pointer',
  },
  tabActive: {
    background: 'rgba(99,102,241,0.2)',
    color: '#6366f1',
  },
};

export default function AgentTemplatesPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [selectedTemplate, setSelectedTemplate] = useState<AgentTemplate | null>(null);
  const [viewTab, setViewTab] = useState<'code' | 'manifest'>('code');
  const [copied, setCopied] = useState(false);

  // Redirect to signup if not logged in
  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/signup', { replace: true });
    }
  }, [navigate]);

  const filteredTemplates = TEMPLATES.filter(t => {
    if (category !== 'all' && t.category !== category) return false;
    if (search && !t.name.toLowerCase().includes(search.toLowerCase()) &&
        !t.description.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  function copyCode() {
    if (selectedTemplate) {
      navigator.clipboard.writeText(selectedTemplate.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  function useTemplate() {
    if (selectedTemplate) {
      // Navigate to publish page with pre-filled data
      const params = new URLSearchParams({
        template: selectedTemplate.id,
        name: selectedTemplate.name,
      });
      navigate(`/network/publish?${params.toString()}`);
    }
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>
          <FileCode size={28} color="#6366f1" />
          Agent Templates
        </h1>
        <p style={styles.subtitle}>
          Start building faster with pre-built agent templates
        </p>
      </div>

      {/* Controls */}
      <div style={styles.controls}>
        <div style={styles.searchBox}>
          <Search size={18} color="#666" />
          <input
            style={styles.searchInput}
            placeholder="Search templates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div style={styles.categoryTabs}>
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              style={{
                ...styles.categoryTab,
                ...(category === cat.id ? styles.categoryTabActive : {}),
              }}
              onClick={() => setCategory(cat.id)}
            >
              {cat.name} ({cat.count})
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div style={styles.grid}>
        {filteredTemplates.map(template => (
          <div
            key={template.id}
            style={styles.card}
            onClick={() => setSelectedTemplate(template)}
          >
            <div style={styles.cardHeader}>
              <div style={styles.cardIcon}>{template.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={styles.cardTitle}>{template.name}</div>
                <div style={styles.cardCategory}>{template.category}</div>
              </div>
              <span style={{
                ...styles.difficultyBadge,
                ...(template.difficulty === 'beginner' ? styles.beginnerBadge :
                    template.difficulty === 'intermediate' ? styles.intermediateBadge :
                    styles.advancedBadge),
              }}>
                {template.difficulty}
              </span>
            </div>
            <div style={styles.cardBody}>
              <p style={styles.cardDescription}>{template.description}</p>
              <div style={styles.cardTags}>
                {template.tags.slice(0, 3).map(tag => (
                  <span key={tag} style={styles.tag}>{tag}</span>
                ))}
              </div>
            </div>
            <div style={styles.cardFooter}>
              <div style={styles.cardStats}>
                <span style={styles.stat}>
                  <Download size={12} />
                  {template.downloads}
                </span>
                <span style={styles.stat}>
                  <Star size={12} color="#fbbf24" />
                  {template.rating}
                </span>
              </div>
              <button
                style={styles.useButton}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedTemplate(template);
                }}
              >
                <Eye size={14} />
                Preview
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {selectedTemplate && (
        <div style={styles.modal} onClick={() => setSelectedTemplate(null)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={styles.cardIcon}>{selectedTemplate.icon}</div>
                <div>
                  <div style={{ fontSize: '1.25rem', fontWeight: '600' }}>{selectedTemplate.name}</div>
                  <div style={{ color: '#888', fontSize: '0.8rem' }}>{selectedTemplate.description}</div>
                </div>
              </div>
              <button
                style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer' }}
                onClick={() => setSelectedTemplate(null)}
              >
                ✕
              </button>
            </div>
            <div style={styles.modalBody}>
              <div style={styles.tabBar}>
                <button
                  style={{ ...styles.tab, ...(viewTab === 'code' ? styles.tabActive : {}) }}
                  onClick={() => setViewTab('code')}
                >
                  <Code size={14} style={{ verticalAlign: 'middle', marginRight: '0.25rem' }} />
                  Code
                </button>
                <button
                  style={{ ...styles.tab, ...(viewTab === 'manifest' ? styles.tabActive : {}) }}
                  onClick={() => setViewTab('manifest')}
                >
                  <FileText size={14} style={{ verticalAlign: 'middle', marginRight: '0.25rem' }} />
                  Manifest
                </button>
              </div>

              <pre style={styles.codeBlock}>
                {viewTab === 'code' 
                  ? selectedTemplate.code 
                  : JSON.stringify(selectedTemplate.manifest, null, 2)}
              </pre>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button style={{ ...styles.useButton, flex: 1 }} onClick={useTemplate}>
                  <ArrowRight size={16} />
                  Use This Template
                </button>
                <button
                  style={{ ...styles.useButton, background: 'rgba(255,255,255,0.1)', flex: 1 }}
                  onClick={copyCode}
                >
                  {copied ? <CheckCircle size={16} /> : <Copy size={16} />}
                  {copied ? 'Copied!' : 'Copy Code'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
