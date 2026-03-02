/**
 * Owner-Only Internal Agents Control Page
 * Dedicated page showing ALL internal platform agents, teams, RARA types, and autonomous infrastructure.
 * Route: /owner/agents-control
 */

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSessionData } from '../../utils/auth-cookies';

const INTERNAL_AGENTS = [
  { id: 'reasoning', name: 'Reasoning Agent', desc: 'Analysis, logic, problem solving, critical thinking, deduction', category: 'Core', autonomous: true, specializations: { code_analysis: 0.95, system_design: 0.88, debugging: 0.90, logical_reasoning: 0.96 } },
  { id: 'code', name: 'Code Generation Agent', desc: 'Code generation, implementation, syntax, best practices (Python, JS, TS, React)', category: 'Development', autonomous: true, specializations: { python: 0.95, javascript: 0.93, typescript: 0.92, react: 0.90 } },
  { id: 'debug', name: 'Debug Agent', desc: 'Bug finding, error analysis, troubleshooting, root cause analysis', category: 'Development', autonomous: true, specializations: { error_analysis: 0.94, bug_fixing: 0.92, stack_trace: 0.93 } },
  { id: 'review', name: 'Code Review Agent', desc: 'Code review, quality assessment, feedback, best practices enforcement', category: 'Development', autonomous: true, specializations: { code_review: 0.96, quality: 0.93, best_practices: 0.91 } },
  { id: 'test', name: 'Test Generation Agent', desc: 'Creates comprehensive test coverage, unit/integration/e2e tests', category: 'Development', autonomous: true, specializations: { unit_tests: 0.94, integration: 0.90, e2e: 0.87 } },
  { id: 'research', name: 'Research Agent', desc: 'Information gathering, synthesis, web search integration', category: 'Core', autonomous: true, specializations: { research: 0.93, synthesis: 0.90 } },
  { id: 'explain', name: 'Explanation Agent', desc: 'Simplification, teaching, ELI5, beginner-friendly explanations', category: 'Core', autonomous: true, specializations: { beginner_tutorials: 0.98, eli5: 0.96, teaching: 0.92 } },
  { id: 'summary', name: 'Summary Agent', desc: 'Summarization of conversations, documents, and code', category: 'Core', autonomous: true, specializations: { summarization: 0.94 } },
  { id: 'planning', name: 'Planning Agent', desc: 'Actionable plans, roadmaps, project planning', category: 'Core', autonomous: true, specializations: { roadmaps: 0.91, project_planning: 0.89 } },
  { id: 'security', name: 'Security Agent', desc: 'Vulnerability finding, OWASP/CWE, penetration testing advice', category: 'Security', autonomous: true, specializations: { vulnerability: 0.94, owasp: 0.92 } },
  { id: 'architecture', name: 'Architecture Agent', desc: 'System design, scalable patterns, microservices, design decisions', category: 'Architecture', autonomous: true, specializations: { system_design: 0.93, microservices: 0.90 } },
  { id: 'optimization', name: 'Optimization Agent', desc: 'Performance bottlenecks, memory leaks, O(n) complexity analysis', category: 'Performance', autonomous: true, specializations: { performance: 0.93, memory: 0.90 } },
  { id: 'documentation', name: 'Documentation Agent', desc: 'README, API docs, JSDoc/docstrings, OpenAPI specs', category: 'Development', autonomous: true, specializations: { api_docs: 0.94, readme: 0.92 } },
  { id: 'math', name: 'Math Agent', desc: 'Mathematical reasoning, calculations, step-by-step proofs', category: 'Core', autonomous: true, specializations: { math: 0.95, proofs: 0.90 } },
  { id: 'api', name: 'API Design Agent', desc: 'RESTful APIs, GraphQL, OpenAPI, versioning, request/response', category: 'Architecture', autonomous: true, specializations: { rest: 0.94, graphql: 0.88 } },
  { id: 'database', name: 'Database Agent', desc: 'Schema design, optimized queries, SQL/NoSQL, indexing, migrations', category: 'Architecture', autonomous: true, specializations: { sql: 0.93, nosql: 0.88, indexing: 0.91 } },
  { id: 'devops', name: 'DevOps Agent', desc: 'CI/CD, Docker, Kubernetes, Terraform, cloud deployments', category: 'Infrastructure', autonomous: true, specializations: { docker: 0.93, kubernetes: 0.88, terraform: 0.85 } },
  { id: 'migration', name: 'Migration Agent', desc: 'Code migrations, version upgrades, framework transitions, rollbacks', category: 'Development', autonomous: true, specializations: { migrations: 0.91, rollbacks: 0.89 } },
  { id: 'refactor', name: 'Refactor Agent', desc: 'SOLID, DRY, KISS patterns, safe refactoring with before/after', category: 'Development', autonomous: true, specializations: { solid: 0.93, dry: 0.91 } },
  { id: 'accessibility', name: 'Accessibility Agent', desc: 'WCAG 2.1 AA/AAA, ARIA, keyboard nav, screen reader, contrast', category: 'Quality', autonomous: true, specializations: { wcag: 0.94, aria: 0.92 } },
  { id: 'i18n', name: 'i18n Agent', desc: 'Translations, locale handling, RTL support, date/number formatting', category: 'Quality', autonomous: true, specializations: { i18n: 0.91, rtl: 0.87 } },
  { id: 'regex', name: 'Regex Agent', desc: 'Create, explain, debug regex patterns (JS, Python, PCRE)', category: 'Utility', autonomous: true, specializations: { regex: 0.96 } },
  { id: 'git', name: 'Git Agent', desc: 'Branching, merge conflicts, rebasing, cherry-picking, hooks', category: 'Utility', autonomous: true, specializations: { git: 0.94 } },
  { id: 'css', name: 'CSS Agent', desc: 'Flexbox, grid, responsive, animations, Tailwind, cross-browser', category: 'Development', autonomous: true, specializations: { css: 0.93, tailwind: 0.90 } },
];

const INTERNAL_TEAMS = [
  { id: 'code_review_team', name: 'Code Review Team', agents: ['code', 'review', 'test'], workflow: 'sequential', desc: 'Full code review pipeline: generate code, review it, then create tests', triggers: 'full review, review my code, code audit' },
  { id: 'security_audit_team', name: 'Security Audit Team', agents: ['security', 'review', 'architecture'], workflow: 'parallel_merge', desc: 'Comprehensive security analysis from multiple expert perspectives', triggers: 'security audit, vulnerability scan, penetration test' },
  { id: 'architecture_team', name: 'Architecture Team', agents: ['architecture', 'review', 'planning'], workflow: 'sequential', desc: 'System design with review and implementation planning', triggers: 'design system, architect, system design' },
  { id: 'learning_team', name: 'Learning Team', agents: ['explain', 'research', 'summary'], workflow: 'sequential', desc: 'Educational content: explain, research deeper, then summarize', triggers: 'teach me, learn about, tutorial' },
  { id: 'debug_team', name: 'Debug Team', agents: ['debug', 'test', 'review'], workflow: 'sequential', desc: 'Thorough debugging: find bugs, create tests, review fixes', triggers: 'fix everything, debug thoroughly, find all bugs' },
  { id: 'full_stack_team', name: 'Full Stack Team', agents: ['api', 'database', 'code', 'test'], workflow: 'sequential', desc: 'End-to-end feature development: API, database, code, tests', triggers: 'full stack, end to end, complete feature' },
  { id: 'refactor_team', name: 'Refactor Team', agents: ['review', 'refactor', 'test'], workflow: 'sequential', desc: 'Safe refactoring: review current code, refactor, verify with tests', triggers: 'safe refactor, clean and test' },
  { id: 'accessibility_team', name: 'Accessibility Team', agents: ['accessibility', 'review', 'test'], workflow: 'sequential', desc: 'A11y compliance: check accessibility, review, create a11y tests', triggers: 'accessibility audit, a11y check, wcag' },
  { id: 'performance_team', name: 'Performance Team', agents: ['optimization', 'review', 'test'], workflow: 'sequential', desc: 'Performance optimization: analyze, optimize, verify with benchmarks', triggers: 'performance audit, speed optimization, make faster' },
];

const RARA_TYPES = [
  { id: 'task_executor', name: 'Task Executor', desc: 'Executes defined tasks with strict safety boundaries' },
  { id: 'business_operator', name: 'Business Operator', desc: 'Manages business logic, workflows, and automated operations' },
  { id: 'tool_agent', name: 'Tool Agent', desc: 'Interfaces with external tools, APIs, and integrations' },
  { id: 'swarm_member', name: 'Swarm Member', desc: 'Participates in multi-agent swarms for distributed tasks' },
  { id: 'observer_auditor', name: 'Observer / Auditor', desc: 'Monitors agent actions, enforces safety rules, audits compliance' },
];

const INFRA_COMPONENTS = [
  { name: 'AutonomousAgentExecutor', icon: '🧠', desc: 'Wraps any agent type for autonomous decision-making. Tries local/cached decisions first (KB lookup), then falls back to LLM consultation. Backed by Hash Sphere memory.', file: 'chat_service/app/services/autonomous_agent_executor.py' },
  { name: 'AutonomousDaemon', icon: '⚙️', desc: 'Background daemon managing autonomous agent lifecycle, self-triggering, goal updates, and health monitoring.', file: 'agent_engine_service/app/routers_autonomous.py' },
  { name: 'ParallelAgentRuntime', icon: '🔄', desc: 'Enables parallel agent communication, capability registration, and multi-agent coordination for team workflows.', file: 'agent_engine_service/app/parallel_runtime.py' },
  { name: 'AgentCapabilityRegistry', icon: '📊', desc: 'Tracks agent strengths, weaknesses, success rates, specialization scores, and workload for intelligent task routing.', file: 'chat_service/app/services/agent_capability_registry.py' },
];

const categoryColors: Record<string, string> = {
  Core: '#8b5cf6', Development: '#3b82f6', Security: '#ef4444', Architecture: '#f59e0b',
  Performance: '#10b981', Quality: '#06b6d4', Infrastructure: '#ec4899', Utility: '#64748b',
};

const AgentsControlPage: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const session = getSessionData();
    if (!session?.is_superuser) {
      navigate('/dashboard');
    }
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: '#0a0e17', color: '#e2e8f0', padding: '24px' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 700, margin: 0, color: '#f1f5f9' }}>
              🤖 Internal Agents Control Center
            </h1>
            <p style={{ color: '#64748b', fontSize: '13px', margin: '4px 0 0' }}>
              All {INTERNAL_AGENTS.length} agents · {INTERNAL_TEAMS.length} teams · {RARA_TYPES.length} RARA types · {INFRA_COMPONENTS.length} infrastructure components
            </p>
          </div>
          <button
            onClick={() => navigate('/owner-dashboard')}
            style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid rgba(148,163,184,0.3)', background: 'rgba(148,163,184,0.1)', color: '#94a3b8', fontSize: '13px', cursor: 'pointer' }}
          >
            ← Back to Dashboard
          </button>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '32px' }}>
          <div style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.25)', borderRadius: '10px', padding: '20px', textAlign: 'center' }}>
            <div style={{ fontSize: '28px', fontWeight: 700, color: '#93c5fd' }}>{INTERNAL_AGENTS.length}</div>
            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>Individual Agents</div>
          </div>
          <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: '10px', padding: '20px', textAlign: 'center' }}>
            <div style={{ fontSize: '28px', fontWeight: 700, color: '#6ee7b7' }}>{INTERNAL_TEAMS.length}</div>
            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>Multi-Agent Teams</div>
          </div>
          <div style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: '10px', padding: '20px', textAlign: 'center' }}>
            <div style={{ fontSize: '28px', fontWeight: 700, color: '#fbbf24' }}>{RARA_TYPES.length}</div>
            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>RARA Agent Types</div>
          </div>
          <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '10px', padding: '20px', textAlign: 'center' }}>
            <div style={{ fontSize: '28px', fontWeight: 700, color: '#fca5a5' }}>{INTERNAL_AGENTS.filter(a => a.autonomous).length}</div>
            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>Autonomous-Capable</div>
          </div>
        </div>

        {/* Section 1: Individual Agent Types Table */}
        <div style={{ background: 'rgba(30,41,59,0.5)', border: '1px solid rgba(148,163,184,0.1)', borderRadius: '12px', padding: '24px', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '16px', color: '#f1f5f9', margin: '0 0 16px', fontWeight: 700 }}>
            🧠 Individual Agent Types ({INTERNAL_AGENTS.length})
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 400, marginLeft: '8px' }}>Source: agent_engine.py _get_agent_prompts</span>
          </h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid rgba(148,163,184,0.2)' }}>
                  <th style={{ textAlign: 'left', padding: '10px 8px', color: '#94a3b8', fontWeight: 600 }}>Agent Type</th>
                  <th style={{ textAlign: 'left', padding: '10px 8px', color: '#94a3b8', fontWeight: 600 }}>Category</th>
                  <th style={{ textAlign: 'left', padding: '10px 8px', color: '#94a3b8', fontWeight: 600 }}>Description</th>
                  <th style={{ textAlign: 'center', padding: '10px 8px', color: '#94a3b8', fontWeight: 600 }}>Autonomous</th>
                  <th style={{ textAlign: 'left', padding: '10px 8px', color: '#94a3b8', fontWeight: 600 }}>Specializations</th>
                </tr>
              </thead>
              <tbody>
                {INTERNAL_AGENTS.map((agent, idx) => (
                  <tr key={agent.id} style={{ borderBottom: '1px solid rgba(148,163,184,0.08)', background: idx % 2 === 0 ? 'transparent' : 'rgba(148,163,184,0.03)' }}>
                    <td style={{ padding: '10px 8px', color: '#e2e8f0', fontWeight: 600, whiteSpace: 'nowrap' }}>{agent.name}</td>
                    <td style={{ padding: '10px 8px' }}>
                      <span style={{ padding: '3px 10px', borderRadius: '4px', background: `${categoryColors[agent.category] || '#64748b'}22`, color: categoryColors[agent.category] || '#94a3b8', fontSize: '10px', fontWeight: 600 }}>{agent.category}</span>
                    </td>
                    <td style={{ padding: '10px 8px', color: '#94a3b8', maxWidth: '320px' }}>{agent.desc}</td>
                    <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                      <span style={{ color: agent.autonomous ? '#10b981' : '#475569', fontSize: '14px' }}>{agent.autonomous ? '✅' : '—'}</span>
                    </td>
                    <td style={{ padding: '10px 8px' }}>
                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                        {Object.entries(agent.specializations).slice(0, 3).map(([k, v]) => (
                          <span key={k} style={{ padding: '2px 6px', borderRadius: '3px', background: 'rgba(139,92,246,0.12)', color: '#a78bfa', fontSize: '9px' }}>
                            {k.replace(/_/g, ' ')} {(v * 100).toFixed(0)}%
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 2: Multi-Agent Teams */}
        <div style={{ background: 'rgba(30,41,59,0.5)', border: '1px solid rgba(148,163,184,0.1)', borderRadius: '12px', padding: '24px', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '16px', color: '#f1f5f9', margin: '0 0 16px', fontWeight: 700 }}>
            👥 Multi-Agent Teams ({INTERNAL_TEAMS.length})
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 400, marginLeft: '8px' }}>Source: team_engine.py INTERNAL_TEAMS</span>
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '16px' }}>
            {INTERNAL_TEAMS.map(team => (
              <div key={team.id} style={{ background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(148,163,184,0.12)', borderRadius: '10px', padding: '18px' }}>
                <h3 style={{ margin: '0 0 8px', fontSize: '14px', color: '#f1f5f9', fontWeight: 700 }}>{team.name}</h3>
                <p style={{ color: '#94a3b8', fontSize: '12px', margin: '0 0 12px', lineHeight: 1.5 }}>{team.desc}</p>
                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '10px' }}>
                  {team.agents.map((a, i) => (
                    <React.Fragment key={a}>
                      <span style={{ padding: '3px 8px', borderRadius: '5px', background: 'rgba(59,130,246,0.18)', color: '#93c5fd', fontSize: '11px', fontWeight: 600 }}>{a}</span>
                      {i < team.agents.length - 1 && <span style={{ color: '#475569', fontSize: '12px' }}>→</span>}
                    </React.Fragment>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span style={{ padding: '3px 8px', borderRadius: '5px', background: team.workflow === 'parallel_merge' ? 'rgba(245,158,11,0.15)' : 'rgba(16,185,129,0.15)', color: team.workflow === 'parallel_merge' ? '#fbbf24' : '#6ee7b7', fontSize: '10px', fontWeight: 600 }}>
                    {team.workflow === 'parallel_merge' ? '⚡ Parallel Merge' : '📋 Sequential'}
                  </span>
                </div>
                <div style={{ marginTop: '8px', fontSize: '10px', color: '#475569' }}>Triggers: <span style={{ color: '#64748b' }}>{team.triggers}</span></div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 3: RARA Agent Types */}
        <div style={{ background: 'rgba(30,41,59,0.5)', border: '1px solid rgba(148,163,184,0.1)', borderRadius: '12px', padding: '24px', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '16px', color: '#f1f5f9', margin: '0 0 16px', fontWeight: 700 }}>
            🔷 RARA Agent Types ({RARA_TYPES.length})
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 400, marginLeft: '8px' }}>Source: agent_factory_invariants.py AgentType</span>
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '12px' }}>
            {RARA_TYPES.map(rt => (
              <div key={rt.id} style={{ background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(148,163,184,0.12)', borderRadius: '10px', padding: '18px' }}>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#f1f5f9', marginBottom: '6px' }}>{rt.name}</div>
                <div style={{ fontSize: '12px', color: '#94a3b8', lineHeight: 1.5 }}>{rt.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 4: Autonomous Infrastructure */}
        <div style={{ background: 'rgba(30,41,59,0.5)', border: '1px solid rgba(148,163,184,0.1)', borderRadius: '12px', padding: '24px' }}>
          <h2 style={{ fontSize: '16px', color: '#f1f5f9', margin: '0 0 16px', fontWeight: 700 }}>
            ⚡ Autonomous Infrastructure ({INFRA_COMPONENTS.length})
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
            {INFRA_COMPONENTS.map(comp => (
              <div key={comp.name} style={{ background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(148,163,184,0.12)', borderRadius: '10px', padding: '18px' }}>
                <h3 style={{ margin: '0 0 8px', fontSize: '14px', color: '#f1f5f9', fontWeight: 700 }}>{comp.icon} {comp.name}</h3>
                <p style={{ color: '#94a3b8', fontSize: '12px', margin: '0 0 10px', lineHeight: 1.5 }}>{comp.desc}</p>
                <div style={{ fontSize: '10px', color: '#475569' }}>File: <code style={{ color: '#64748b' }}>{comp.file}</code></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentsControlPage;
