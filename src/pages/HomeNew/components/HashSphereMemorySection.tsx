import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, Shield, Lock, Zap, Database, Eye, CheckCircle, XCircle } from 'lucide-react';

export const HashSphereMemorySection: React.FC = () => {
  const navigate = useNavigate();

  const capabilities = [
    {
      icon: <Database className="w-6 h-6" />,
      title: 'High-Dimensional Embeddings',
      description: '1536-dim semantic embeddings with deterministic clustering'
    },
    {
      icon: <Lock className="w-6 h-6" />,
      title: 'Encrypted Storage',
      description: 'AES-256-GCM encryption at rest for all memory data'
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Invariant Enforcement',
      description: 'No duplicated identity, no invalid transitions, no silent corruption'
    },
    {
      icon: <Eye className="w-6 h-6" />,
      title: 'Replay & Audit',
      description: 'Full memory state replay and audit trail for compliance'
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: 'Step-Based Evolution',
      description: 'Memory evolves through simulation steps with conservation laws'
    },
    {
      icon: <Brain className="w-6 h-6" />,
      title: 'Stable Identities',
      description: 'Memory graph with persistent, stable node identities'
    }
  ];

  return (
    <section className="relative py-24 overflow-hidden" style={{ background: 'linear-gradient(180deg, #0a0a1a 0%, #0a1a2a 50%, #0a0a1a 100%)' }}>
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/20 border border-cyan-500/30 mb-6">
            <Brain className="w-4 h-4 text-cyan-400" />
            <span className="text-cyan-300 text-sm font-medium">Hash Sphere Memory API</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Invariant-Governed <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">Long-Term Memory</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-4">
            Persistent, encrypted, high-dimensional memory for AI systems, modeled as a state-space universe with conservation laws.
          </p>
          <p className="text-lg text-cyan-400 font-medium max-w-2xl mx-auto">
            "Hash Sphere Memory enforces physical-style conservation laws on AI memory, so state can evolve — but never break."
          </p>
        </div>

        {/* What This Is / Is Not */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16 max-w-4xl mx-auto">
          <div className="p-6 rounded-xl bg-red-500/10 border border-red-500/30">
            <h3 className="text-lg font-semibold text-red-400 mb-4 flex items-center gap-2">
              <XCircle className="w-5 h-5" />
              What This Is NOT
            </h3>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li className="flex items-center gap-2"><span className="text-red-400">x</span> Not a vector database</li>
              <li className="flex items-center gap-2"><span className="text-red-400">x</span> Not prompt history</li>
              <li className="flex items-center gap-2"><span className="text-red-400">x</span> Not "chat memory"</li>
              <li className="flex items-center gap-2"><span className="text-red-400">x</span> Not opaque SaaS retention</li>
            </ul>
            <p className="mt-4 text-xs text-gray-500">This is <strong className="text-white">stateful cognition infrastructure</strong>.</p>
          </div>

          <div className="p-6 rounded-xl bg-cyan-500/10 border border-cyan-500/30">
            <h3 className="text-lg font-semibold text-cyan-400 mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Who This Is For
            </h3>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li className="flex items-center gap-2"><span className="text-cyan-400">+</span> AI agent platforms</li>
              <li className="flex items-center gap-2"><span className="text-cyan-400">+</span> Autonomous workflow systems</li>
              <li className="flex items-center gap-2"><span className="text-cyan-400">+</span> Long-running AI copilots</li>
              <li className="flex items-center gap-2"><span className="text-cyan-400">+</span> Blockchain & DAO tooling</li>
            </ul>
            <p className="mt-4 text-xs text-gray-500">If memory errors can cost you money, reputation, or safety — this API applies.</p>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {capabilities.map((feature, index) => (
            <div
              key={index}
              className="p-6 rounded-xl bg-white/5 border border-white/10 hover:border-cyan-500/50 transition-all group"
            >
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center text-cyan-400 mb-4 group-hover:scale-110 transition-transform">
                {feature.icon}
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-gray-400 text-sm">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Pricing Preview */}
        <div className="text-center">
          <h3 className="text-2xl font-bold text-white mb-8">API Pricing</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
            {/* Starter */}
            <div className="p-5 rounded-xl bg-white/5 border border-white/10">
              <h4 className="text-gray-400 font-medium mb-2">Starter</h4>
              <div className="text-2xl font-bold text-white mb-3">$49<span className="text-sm text-gray-500">/mo</span></div>
              <ul className="text-xs text-gray-400 space-y-1 mb-4">
                <li>100k Memory Units</li>
                <li>Encrypted storage</li>
                <li>Batch simulation</li>
              </ul>
              <button 
                onClick={() => navigate('/hash-sphere-memory-api')}
                className="w-full py-2 rounded-lg bg-white/10 text-white text-sm hover:bg-white/20 transition-colors"
              >
                Get Started
              </button>
            </div>

            {/* Builder */}
            <div className="p-5 rounded-xl bg-gradient-to-b from-emerald-500/20 to-transparent border-2 border-emerald-500/50">
              <div className="text-xs font-bold text-emerald-400 mb-2">RECOMMENDED</div>
              <h4 className="text-emerald-400 font-medium mb-2">Builder</h4>
              <div className="text-2xl font-bold text-white mb-3">$299<span className="text-sm text-gray-500">/mo</span></div>
              <ul className="text-xs text-gray-400 space-y-1 mb-4">
                <li>2M Memory Units</li>
                <li>Real-time invariants</li>
                <li>30-day replay</li>
              </ul>
              <button 
                onClick={() => navigate('/hash-sphere-memory-api?plan=builder')}
                className="w-full py-2 rounded-lg bg-emerald-500 text-black text-sm font-semibold hover:bg-emerald-400 transition-colors"
              >
                Subscribe
              </button>
            </div>

            {/* Scale */}
            <div className="p-5 rounded-xl bg-white/5 border border-amber-500/30">
              <h4 className="text-amber-400 font-medium mb-2">Scale</h4>
              <div className="text-2xl font-bold text-white mb-3">$1,200<span className="text-sm text-gray-500">/mo</span></div>
              <ul className="text-xs text-gray-400 space-y-1 mb-4">
                <li>10M Memory Units</li>
                <li>Custom invariants</li>
                <li>Full audit trail</li>
              </ul>
              <button 
                onClick={() => navigate('/hash-sphere-memory-api?plan=scale')}
                className="w-full py-2 rounded-lg bg-amber-500/20 text-amber-300 text-sm hover:bg-amber-500/30 transition-colors"
              >
                Subscribe
              </button>
            </div>

            {/* Enterprise */}
            <div className="p-5 rounded-xl bg-white/5 border border-purple-500/30">
              <h4 className="text-purple-400 font-medium mb-2">Enterprise</h4>
              <div className="text-2xl font-bold text-white mb-3">$25k+<span className="text-sm text-gray-500">/yr</span></div>
              <ul className="text-xs text-gray-400 space-y-1 mb-4">
                <li>Unlimited Memory</li>
                <li>Dedicated engine</li>
                <li>On-prem / VPC</li>
              </ul>
              <button 
                onClick={() => window.open('mailto:enterprise@dev-swat.com', '_blank')}
                className="w-full py-2 rounded-lg bg-purple-500/20 text-purple-300 text-sm hover:bg-purple-500/30 transition-colors"
              >
                Contact Sales
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HashSphereMemorySection;
