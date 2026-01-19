import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { 
  Atom, Shield, TrendingUp, Zap, Eye, Lock, Check, 
  Copy, ExternalLink, Code, Server, Key, ArrowRight 
} from 'lucide-react';

const StatePhysicsAPI: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const selectedPlan = searchParams.get('plan') || 'free';
  const [copiedEndpoint, setCopiedEndpoint] = useState<string | null>(null);

  const copyToClipboard = (text: string, endpoint: string) => {
    navigator.clipboard.writeText(text);
    setCopiedEndpoint(endpoint);
    setTimeout(() => setCopiedEndpoint(null), 2000);
  };

  const plans = [
    {
      id: 'dev',
      name: 'Dev / Indie',
      price: '$49',
      period: 'per month',
      description: 'For experimentation and indie projects',
      features: [
        '100k Simulation Units/month',
        'Simple bounds invariants (x1)',
        'Batch mode processing',
        'Community support',
        '$0.10 per 1k SU overage'
      ],
      cta: 'Get Started',
      popular: false,
      color: 'gray'
    },
    {
      id: 'startup',
      name: 'Startup',
      price: '$299',
      period: 'per month',
      description: 'For production applications and teams',
      features: [
        '2M Simulation Units/month',
        'All invariants (conservation x2)',
        'Near-real-time mode (x1.5)',
        'Priority support + webhooks',
        '$0.05 per 1k SU overage',
        '99.9% uptime SLA'
      ],
      cta: 'Subscribe',
      popular: true,
      color: 'emerald'
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: '$2k-$10k',
      period: 'per month',
      description: 'For large-scale critical systems',
      features: [
        'Custom SU allocation',
        'Custom invariants (x3-x5)',
        'Hard real-time mode (x3)',
        'Dedicated support + SLA',
        'On-premise / air-gapped',
        'Audit reports & compliance'
      ],
      cta: 'Contact Sales',
      popular: false,
      color: 'purple'
    }
  ];

  const enterpriseLicensing = [
    { customer: 'Small L2 chain', price: '$25k - $50k/yr' },
    { customer: 'Exchange / Custodian', price: '$75k - $250k/yr' },
    { customer: 'Large platform', price: '$250k - $1M+/yr' }
  ];

  const invariantMultipliers = [
    { type: 'Simple bounds (0-100%)', multiplier: 'x1' },
    { type: 'Conservation laws', multiplier: 'x2' },
    { type: 'Cross-entity causality', multiplier: 'x3' },
    { type: 'Temporal / historical', multiplier: 'x5' }
  ];

  const realtimeModes = [
    { mode: 'Batch / Replay', multiplier: 'x1' },
    { mode: 'Near-real-time', multiplier: 'x1.5' },
    { mode: 'Hard real-time', multiplier: 'x3' }
  ];

  const endpoints = [
    {
      method: 'POST',
      path: '/api/generate',
      description: 'Create a new universe with specified number of nodes',
      example: `curl -X POST "https://api.resonantgenesis.com/state-physics/generate" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"num_nodes": 100, "num_edges": 200}'`
    },
    {
      method: 'GET',
      path: '/api/state',
      description: 'Get current state of the universe',
      example: `curl "https://api.resonantgenesis.com/state-physics/state" \\
  -H "Authorization: Bearer YOUR_API_KEY"`
    },
    {
      method: 'POST',
      path: '/api/simulate',
      description: 'Run simulation steps on the universe',
      example: `curl -X POST "https://api.resonantgenesis.com/state-physics/simulate" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"steps": 100}'`
    },
    {
      method: 'GET',
      path: '/api/invariants',
      description: 'Check all conservation laws and get violations',
      example: `curl "https://api.resonantgenesis.com/state-physics/invariants" \\
  -H "Authorization: Bearer YOUR_API_KEY"`
    },
    {
      method: 'POST',
      path: '/api/agents/spawn',
      description: 'Spawn autonomous agents in the universe',
      example: `curl -X POST "https://api.resonantgenesis.com/state-physics/agents/spawn" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"count": 5, "type": "explorer"}'`
    }
  ];

  const useCases = [
    {
      icon: <Shield className="w-8 h-8" />,
      title: 'Fraud Detection',
      description: 'Detect anomalies in financial transactions by monitoring conservation law violations in real-time.'
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: 'Trust Networks',
      description: 'Model and validate trust propagation through social or business networks.'
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: 'Distributed Systems',
      description: 'Monitor microservices health and detect cascading failures before they happen.'
    },
    {
      icon: <Atom className="w-8 h-8" />,
      title: 'AI Agent Swarms',
      description: 'Simulate multi-agent decision making and emergent behaviors.'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a1a] via-[#1a1a2e] to-[#0a0a1a]">
      <Helmet>
        <title>State Physics API - Pricing & Documentation | ResonantGenesis</title>
        <meta name="description" content="Access constraint-governed state-space simulation through our REST API. Build fraud detection, trust networks, and distributed system monitoring." />
      </Helmet>

      {/* Hero */}
      <section className="relative pt-24 pb-16 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/20 border border-purple-500/30 mb-6">
              <Atom className="w-4 h-4 text-purple-400" />
              <span className="text-purple-300 text-sm font-medium">State Physics API</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Build with <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-emerald-400">State Physics</span>
            </h1>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Constraint-governed state-space simulation API. Detect anomalies, validate invariants, 
              and model complex systems with conservation laws.
            </p>
          </div>

          {/* Quick Demo Link */}
          <div className="flex justify-center gap-4 mb-16">
            <button
              onClick={() => window.open(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/state-physics`, '_blank')}
              className="px-6 py-3 rounded-lg bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-all flex items-center gap-2"
            >
              <Eye className="w-5 h-5" />
              Try Interactive Demo
            </button>
            <button
              onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-6 py-3 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold hover:from-emerald-600 hover:to-emerald-700 transition-all flex items-center gap-2"
            >
              <Key className="w-5 h-5" />
              Get API Key
            </button>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-white text-center mb-12">What You Can Build</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {useCases.map((useCase, index) => (
              <div key={index} className="p-6 rounded-xl bg-white/5 border border-white/10 hover:border-purple-500/50 transition-all">
                <div className="text-purple-400 mb-4">{useCase.icon}</div>
                <h3 className="text-lg font-semibold text-white mb-2">{useCase.title}</h3>
                <p className="text-gray-400 text-sm">{useCase.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-16">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-white text-center mb-4">API Pricing</h2>
          <p className="text-gray-400 text-center mb-8 max-w-2xl mx-auto">
            Pricing scales with the complexity and risk of the system you are protecting, not raw compute.
          </p>

          {/* SU Definition */}
          <div className="max-w-3xl mx-auto mb-12 p-6 rounded-xl bg-gradient-to-r from-emerald-500/10 to-purple-500/10 border border-emerald-500/30">
            <h3 className="text-lg font-semibold text-white mb-2">Simulation Unit (SU) Definition</h3>
            <p className="text-gray-300"><span className="text-emerald-400 font-bold">1 SU</span> = 1 simulation step × 1,000 nodes × invariant evaluation</p>
            <p className="text-gray-500 text-sm mt-2">Aligns pricing to state risk surface, not CPU cycles.</p>
          </div>

          {/* Pricing Tiers */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-16">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`relative p-8 rounded-2xl transition-all ${
                  plan.popular 
                    ? 'bg-gradient-to-b from-emerald-500/20 to-transparent border-2 border-emerald-500/50 transform scale-105' 
                    : 'bg-white/5 border border-white/10 hover:border-white/20'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="px-4 py-1 rounded-full bg-emerald-500 text-black text-xs font-bold">
                      RECOMMENDED
                    </span>
                  </div>
                )}

                <div className="text-center mb-6">
                  <h3 className={`text-xl font-semibold mb-2 ${
                    plan.color === 'emerald' ? 'text-emerald-400' : 
                    plan.color === 'purple' ? 'text-purple-400' : 'text-gray-400'
                  }`}>
                    {plan.name}
                  </h3>
                  <div className="text-4xl font-bold text-white mb-1">{plan.price}</div>
                  <div className="text-gray-500 text-sm">{plan.period}</div>
                  <p className="text-gray-400 text-sm mt-3">{plan.description}</p>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3 text-sm">
                      <Check className={`w-5 h-5 flex-shrink-0 ${
                        plan.color === 'emerald' ? 'text-emerald-400' : 
                        plan.color === 'purple' ? 'text-purple-400' : 'text-gray-500'
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
                      navigate('/api-keys?service=state-physics&plan=' + plan.id);
                    }
                  }}
                  className={`w-full py-3 rounded-lg font-semibold transition-all ${
                    plan.popular 
                      ? 'bg-emerald-500 text-black hover:bg-emerald-400' 
                      : plan.color === 'purple'
                        ? 'bg-purple-500/20 text-purple-300 hover:bg-purple-500/30'
                        : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>

          {/* Multipliers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
            <div className="p-6 rounded-xl bg-white/5 border border-white/10">
              <h3 className="text-lg font-semibold text-amber-400 mb-4">Invariant Complexity Multiplier</h3>
              <div className="space-y-3">
                {invariantMultipliers.map((item, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="text-gray-400">{item.type}</span>
                    <span className="text-white font-medium">{item.multiplier}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-6 rounded-xl bg-white/5 border border-white/10">
              <h3 className="text-lg font-semibold text-amber-400 mb-4">Real-Time Mode Premium</h3>
              <div className="space-y-3">
                {realtimeModes.map((item, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="text-gray-400">{item.mode}</span>
                    <span className="text-white font-medium">{item.multiplier}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Enterprise Licensing */}
          <div className="max-w-3xl mx-auto p-6 rounded-xl bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/30">
            <h3 className="text-lg font-semibold text-purple-400 mb-2">Enterprise Licensing (Annual)</h3>
            <p className="text-gray-400 text-sm mb-4">For blockchains, exchanges, AI platforms, DAOs, governments. Priced per system under protection.</p>
            <div className="space-y-3">
              {enterpriseLicensing.map((item, index) => (
                <div key={index} className="flex justify-between text-sm border-b border-white/10 pb-2">
                  <span className="text-gray-300">{item.customer}</span>
                  <span className="text-white font-medium">{item.price}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* API Documentation */}
      <section className="py-16">
        <div className="container mx-auto px-6">
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

          <div className="text-center mt-12">
            <a 
              href="/docs/state-physics" 
              className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors"
            >
              View Full Documentation <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center p-12 rounded-2xl bg-gradient-to-r from-purple-500/20 to-emerald-500/20 border border-purple-500/30">
            <h2 className="text-3xl font-bold text-white mb-4">Ready to Get Started?</h2>
            <p className="text-gray-400 mb-8">
              Create your free API key and start building with State Physics today.
            </p>
            <button
              onClick={() => navigate('/api-keys?service=state-physics')}
              className="px-8 py-4 rounded-lg bg-gradient-to-r from-purple-500 to-emerald-500 text-white font-semibold hover:from-purple-600 hover:to-emerald-600 transition-all shadow-lg"
            >
              Get Your API Key <ArrowRight className="w-5 h-5 inline ml-2" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default StatePhysicsAPI;
