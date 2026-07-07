import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Atom, Shield, TrendingUp, Zap, Eye, Lock } from 'lucide-react';
import { ENV } from '../../../config/env';

export const StatePhysicsSection: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Conservation Laws',
      description: 'Enforce invariants like mass conservation, trust bounds, and causality across your entire system.'
    },
    {
      icon: <Eye className="w-6 h-6" />,
      title: 'Real-time Visualization',
      description: '3D visualization of nodes, edges, and state transitions with interactive controls.'
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: 'Anomaly Detection',
      description: 'Instantly detect when something breaks the rules - fraud, bugs, or attacks.'
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: 'Physics Simulation',
      description: 'Model complex systems with gravity, repulsion, and entropy parameters.'
    },
    {
      icon: <Lock className="w-6 h-6" />,
      title: 'Trust Networks',
      description: 'Visualize and validate trust propagation through your network.'
    },
    {
      icon: <Atom className="w-6 h-6" />,
      title: 'Agent Swarms',
      description: 'Simulate autonomous agents making decisions in your state space.'
    }
  ];

  return (
    <section className="relative py-24 overflow-hidden" style={{ background: 'linear-gradient(180deg, #0a0a1a 0%, #1a1a2e 50%, #0a0a1a 100%)' }}>
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/20 border border-purple-500/30 mb-6">
            <Atom className="w-4 h-4 text-purple-400" />
            <span className="text-purple-300 text-sm font-medium">State Physics Engine</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Constraint-Governed <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-emerald-400">State-Space</span> Universe
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Visualize and validate complex distributed systems by treating them as physical universes with conservation laws. 
            Detect anomalies, understand emergence, and ensure your system never breaks the rules.
          </p>
        </div>

        {/* 3D Preview / Demo Area */}
        <div className="relative mb-16">
          <div 
            className="relative rounded-2xl overflow-hidden border border-purple-500/30 bg-black/50 backdrop-blur-sm"
            style={{ height: '400px' }}
          >
            {/* Embedded iframe preview or static image */}
            <iframe
              src={`${ENV.apiUrl}/api/state-physics`}
              className="w-full h-full border-0"
              title="State Physics Preview"
              style={{ pointerEvents: 'none' }}
            />
            
            {/* Overlay with CTA */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent flex items-end justify-center pb-8">
              <div className="text-center">
                <p className="text-gray-300 mb-4">Experience the full interactive demo</p>
                <div className="flex gap-4 justify-center">
                  <button
                    onClick={() => window.open(`${ENV.apiUrl}/api/state-physics`, '_blank')}
                    className="px-6 py-3 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 text-white font-semibold hover:from-purple-600 hover:to-purple-700 transition-all shadow-lg shadow-purple-500/30"
                  >
                    🎮 Try Demo
                  </button>
                  <button
                    onClick={() => navigate('/state-physics-api')}
                    className="px-6 py-3 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-lg shadow-emerald-500/30"
                  >
                    🚀 Get API Access
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {features.map((feature, index) => (
            <div
              key={index}
              className="p-6 rounded-xl bg-white/5 border border-white/10 hover:border-purple-500/50 transition-all group"
            >
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500/20 to-emerald-500/20 flex items-center justify-center text-purple-400 mb-4 group-hover:scale-110 transition-transform">
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {/* Free */}
            <div className="p-6 rounded-xl bg-white/5 border border-white/10">
              <h4 className="text-gray-400 font-medium mb-2">Free</h4>
              <div className="text-3xl font-bold text-white mb-4">$0<span className="text-sm text-gray-500">/mo</span></div>
              <ul className="text-sm text-gray-400 space-y-2 mb-6">
                <li>100 API calls/day</li>
                <li>50 nodes max</li>
                <li>Basic invariants</li>
              </ul>
              <button 
                onClick={() => navigate('/state-physics-api')}
                className="w-full py-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
              >
                Get Started
              </button>
            </div>

            {/* Pro */}
            <div className="p-6 rounded-xl bg-gradient-to-b from-emerald-500/20 to-transparent border-2 border-emerald-500/50 transform scale-105">
              <div className="text-xs font-bold text-emerald-400 mb-2">POPULAR</div>
              <h4 className="text-emerald-400 font-medium mb-2">Pro</h4>
              <div className="text-3xl font-bold text-white mb-4">$49<span className="text-sm text-gray-500">/mo</span></div>
              <ul className="text-sm text-gray-400 space-y-2 mb-6">
                <li>10,000 API calls/day</li>
                <li>1,000 nodes</li>
                <li>All conservation laws</li>
                <li>Priority support</li>
              </ul>
              <button 
                onClick={() => navigate('/state-physics-api?plan=pro')}
                className="w-full py-2 rounded-lg bg-emerald-500 text-black font-semibold hover:bg-emerald-400 transition-colors"
              >
                Subscribe
              </button>
            </div>

            {/* Enterprise */}
            <div className="p-6 rounded-xl bg-white/5 border border-purple-500/30">
              <h4 className="text-purple-400 font-medium mb-2">Enterprise</h4>
              <div className="text-3xl font-bold text-white mb-4">Custom</div>
              <ul className="text-sm text-gray-400 space-y-2 mb-6">
                <li>Unlimited calls</li>
                <li>Unlimited nodes</li>
                <li>Custom invariants</li>
                <li>Dedicated support</li>
              </ul>
              <button 
                onClick={() => window.open('mailto:enterprise@resonant.dev-swat.com', '_blank')}
                className="w-full py-2 rounded-lg bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 transition-colors"
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

export default StatePhysicsSection;
