import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { 
  Brain, Shield, Lock, Zap, Eye, Database, Check, 
  Copy, ExternalLink, Code, Server, Key, ArrowRight,
  AlertTriangle, CheckCircle, XCircle
} from 'lucide-react';

const HashSphereMemoryAPI: React.FC = () => {
  const navigate = useNavigate();
  const [copiedEndpoint, setCopiedEndpoint] = useState<string | null>(null);

  const copyToClipboard = (text: string, endpoint: string) => {
    navigator.clipboard.writeText(text);
    setCopiedEndpoint(endpoint);
    setTimeout(() => setCopiedEndpoint(null), 2000);
  };

  const plans = [
    {
      id: 'starter',
      name: 'Starter',
      price: '$49',
      period: 'per month',
      description: 'For individual developers and early experiments',
      features: [
        '100,000 Memory Units/month',
        '1536-dim embeddings',
        'Encrypted storage (AES-256-GCM)',
        'Batch simulation',
        'Standard invariants',
        'No real-time enforcement',
        'Shared infrastructure'
      ],
      cta: 'Get Started',
      popular: false,
      color: 'gray'
    },
    {
      id: 'builder',
      name: 'Builder',
      price: '$299',
      period: 'per month',
      description: 'For AI startups running persistent agents',
      features: [
        '2,000,000 Memory Units/month',
        'Real-time invariant checks',
        'Memory clustering & entropy metrics',
        'Memory replay (last 30 days)',
        'API keys per project',
        '$0.05 per 1k MU overage'
      ],
      cta: 'Subscribe',
      popular: true,
      color: 'emerald'
    },
    {
      id: 'scale',
      name: 'Scale',
      price: '$1,200',
      period: 'per month',
      description: 'For platforms where memory correctness matters',
      features: [
        '10,000,000 Memory Units/month',
        'Hard real-time enforcement',
        'Custom invariant definitions',
        'Full replay & audit trail',
        'Priority execution'
      ],
      cta: 'Subscribe',
      popular: false,
      color: 'amber'
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: '$25k-$250k',
      period: 'per year',
      description: 'For blockchains, autonomous platforms, regulated systems',
      features: [
        'Unlimited Memory Units (contract-bounded)',
        'Dedicated invariant engine',
        'On-prem / VPC / air-gapped options',
        'SLA + incident guarantees',
        'Custom physics models',
        'Compliance & audit exports'
      ],
      cta: 'Contact Sales',
      popular: false,
      color: 'purple'
    }
  ];

  const capabilities = [
    'High-dimensional semantic embeddings (1536-dim default)',
    'Deterministic memory clustering',
    'Encrypted memory at rest (AES-256-GCM)',
    'Memory graph with stable identities',
    'Step-based memory evolution (simulation)',
    'Invariant enforcement (violations = explicit signal)',
    'Replay & audit of memory state',
    'API-first (no UI dependency)'
  ];

  const notThis = [
    'Not a vector database',
    'Not prompt history',
    'Not "chat memory"',
    'Not opaque SaaS retention'
  ];

  const forWho = [
    'AI agent platforms',
    'Autonomous workflow systems',
    'Long-running AI copilots',
    'Blockchain & DAO tooling',
    'Security-sensitive AI products'
  ];

  const endpoints = [
    {
      method: 'POST',
      path: '/api/memory/write',
      description: 'Write a memory entry with semantic embedding',
      example: `curl -X POST "https://api.resonantgenesis.com/hash-sphere/memory/write" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"content": "User prefers dark mode", "metadata": {"source": "settings"}}'`
    },
    {
      method: 'GET',
      path: '/api/memory/query',
      description: 'Query memories by semantic similarity',
      example: `curl "https://api.resonantgenesis.com/hash-sphere/memory/query?q=user+preferences&limit=10" \\
  -H "Authorization: Bearer YOUR_API_KEY"`
    },
    {
      method: 'POST',
      path: '/api/memory/evolve',
      description: 'Evolve memory state with invariant checks',
      example: `curl -X POST "https://api.resonantgenesis.com/hash-sphere/memory/evolve" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"steps": 1, "validate_invariants": true}'`
    },
    {
      method: 'GET',
      path: '/api/invariants/check',
      description: 'Check all invariants on current memory state',
      example: `curl "https://api.resonantgenesis.com/hash-sphere/invariants/check" \\
  -H "Authorization: Bearer YOUR_API_KEY"`
    },
    {
      method: 'GET',
      path: '/api/memory/replay',
      description: 'Replay memory state from a specific timestamp',
      example: `curl "https://api.resonantgenesis.com/hash-sphere/memory/replay?from=2024-01-01T00:00:00Z" \\
  -H "Authorization: Bearer YOUR_API_KEY"`
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-900 to-black text-white">
      <Helmet>
        <title>Hash Sphere Memory API | Resonant Genesis</title>
        <meta name="description" content="Invariant-governed long-term memory and state simulation for AI systems" />
      </Helmet>

      {/* Hero */}
      <section className="pt-20 pb-16 px-6">
        <div className="container mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/20 border border-cyan-500/30 mb-6">
            <Brain className="w-4 h-4 text-cyan-400" />
            <span className="text-cyan-300 text-sm font-medium">Hash Sphere Memory API</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Invariant-Governed <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">Long-Term Memory</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-4">
            Persistent, encrypted, high-dimensional memory for AI systems, modeled as a state-space universe with conservation laws.
          </p>
          <p className="text-lg text-cyan-400 font-medium max-w-2xl mx-auto mb-8">
            "Hash Sphere Memory enforces physical-style conservation laws on AI memory, so state can evolve — but never break."
          </p>
          <div className="flex justify-center gap-4">
            <button
              onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-6 py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-semibold hover:from-cyan-600 hover:to-purple-600 transition-all flex items-center gap-2"
            >
              <Key className="w-5 h-5" />
              Get API Key
            </button>
            <button
              onClick={() => document.getElementById('docs')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-6 py-3 rounded-lg bg-white/10 text-white font-semibold hover:bg-white/20 transition-all flex items-center gap-2"
            >
              <Code className="w-5 h-5" />
              View Docs
            </button>
          </div>
        </div>
      </section>

      {/* What This Is */}
      <section className="py-16 px-6">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Core Capabilities */}
            <div className="p-8 rounded-2xl bg-white/5 border border-white/10">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-cyan-400" />
                Core Capabilities
              </h2>
              <ul className="space-y-3">
                {capabilities.map((cap, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-gray-300">
                    <Check className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                    {cap}
                  </li>
                ))}
              </ul>
            </div>

            {/* What This Is NOT + Who It's For */}
            <div className="space-y-6">
              <div className="p-6 rounded-xl bg-red-500/10 border border-red-500/30">
                <h3 className="text-lg font-semibold text-red-400 mb-4 flex items-center gap-2">
                  <XCircle className="w-5 h-5" />
                  What This Is NOT
                </h3>
                <ul className="space-y-2">
                  {notThis.map((item, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-gray-400">
                      <span className="text-red-400">✕</span>
                      {item}
                    </li>
                  ))}
                </ul>
                <p className="mt-4 text-sm text-gray-500">This is <strong className="text-white">stateful cognition infrastructure</strong>.</p>
              </div>

              <div className="p-6 rounded-xl bg-cyan-500/10 border border-cyan-500/30">
                <h3 className="text-lg font-semibold text-cyan-400 mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Who This Is For
                </h3>
                <ul className="space-y-2">
                  {forWho.map((item, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-gray-300">
                      <span className="text-cyan-400">+</span>
                      {item}
                    </li>
                  ))}
                </ul>
                <p className="mt-4 text-sm text-gray-500">If memory errors can cost you money, reputation, or safety — this API applies.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Memory Unit Definition */}
      <section className="py-8 px-6">
        <div className="container mx-auto">
          <div className="max-w-3xl mx-auto p-6 rounded-xl bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/30">
            <h3 className="text-lg font-semibold text-white mb-2">What Is a "Memory Unit"?</h3>
            <p className="text-gray-300">
              <span className="text-cyan-400 font-bold">1 Memory Unit</span> = one memory write or evolution step × invariant evaluation × clustering update
            </p>
            <p className="text-gray-500 text-sm mt-2">This aligns billing to <strong>semantic impact</strong>, not raw compute.</p>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-16 px-6">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-4">Public Pricing</h2>
          <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">
            Pricing scales by <strong className="text-white">memory risk surface</strong>, not token count.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`relative p-6 rounded-2xl transition-all ${
                  plan.popular 
                    ? 'bg-gradient-to-b from-emerald-500/20 to-transparent border-2 border-emerald-500/50' 
                    : 'bg-white/5 border border-white/10 hover:border-white/20'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="px-3 py-1 rounded-full bg-emerald-500 text-black text-xs font-bold">
                      RECOMMENDED
                    </span>
                  </div>
                )}

                <div className="text-center mb-4">
                  <h3 className={`text-lg font-semibold mb-1 ${
                    plan.color === 'emerald' ? 'text-emerald-400' : 
                    plan.color === 'purple' ? 'text-purple-400' : 
                    plan.color === 'amber' ? 'text-amber-400' : 'text-gray-400'
                  }`}>
                    {plan.name}
                  </h3>
                  <div className="text-3xl font-bold text-white">{plan.price}</div>
                  <div className="text-gray-500 text-sm">{plan.period}</div>
                  <p className="text-gray-400 text-xs mt-2">{plan.description}</p>
                </div>

                <ul className="space-y-2 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <Check className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
                        plan.color === 'emerald' ? 'text-emerald-400' : 
                        plan.color === 'purple' ? 'text-purple-400' : 
                        plan.color === 'amber' ? 'text-amber-400' : 'text-gray-500'
                      }`} />
                      <span className="text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => {
                    if (plan.id === 'enterprise') {
                      window.open('mailto:enterprise@resonantgenesis.com', '_blank');
                    } else {
                      navigate('/api-keys?service=hash-sphere-memory&plan=' + plan.id);
                    }
                  }}
                  className={`w-full py-2.5 rounded-lg font-semibold transition-all text-sm ${
                    plan.popular 
                      ? 'bg-emerald-500 text-black hover:bg-emerald-400' 
                      : plan.color === 'purple'
                        ? 'bg-purple-500/20 text-purple-300 hover:bg-purple-500/30'
                        : plan.color === 'amber'
                          ? 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30'
                          : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* API Documentation */}
      <section id="docs" className="py-16 px-6">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-4">API Endpoints</h2>
          <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">
            Simple REST API with JSON responses. Get started in minutes.
          </p>

          <div className="max-w-4xl mx-auto space-y-6">
            {endpoints.map((endpoint, index) => (
              <div key={index} className="rounded-xl bg-white/5 border border-white/10 overflow-hidden">
                <div className="p-4 border-b border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      endpoint.method === 'GET' ? 'bg-blue-500/20 text-blue-400' : 'bg-emerald-500/20 text-emerald-400'
                    }`}>
                      {endpoint.method}
                    </span>
                    <code className="text-white font-mono">{endpoint.path}</code>
                  </div>
                  <span className="text-gray-400 text-sm">{endpoint.description}</span>
                </div>
                <div className="p-4 bg-black/30 relative">
                  <pre className="text-sm text-gray-300 font-mono overflow-x-auto whitespace-pre-wrap">
                    {endpoint.example}
                  </pre>
                  <button
                    onClick={() => copyToClipboard(endpoint.example, endpoint.path)}
                    className="absolute top-4 right-4 p-2 rounded bg-white/10 hover:bg-white/20 transition-colors"
                  >
                    {copiedEndpoint === endpoint.path ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Copy className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6">
        <div className="container mx-auto">
          <div className="max-w-3xl mx-auto text-center p-12 rounded-2xl bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/30">
            <h2 className="text-3xl font-bold text-white mb-4">Ready to Get Started?</h2>
            <p className="text-gray-400 mb-8">
              Create your API key and start building with invariant-governed memory today.
            </p>
            <button
              onClick={() => navigate('/api-keys?service=hash-sphere-memory')}
              className="px-8 py-4 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-semibold hover:from-cyan-600 hover:to-purple-600 transition-all shadow-lg"
            >
              Get Your API Key <ArrowRight className="w-5 h-5 inline ml-2" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HashSphereMemoryAPI;
