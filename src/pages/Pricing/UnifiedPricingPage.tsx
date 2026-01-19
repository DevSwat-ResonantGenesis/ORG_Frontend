import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Brain, Atom } from 'lucide-react';

  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');

  // Platform Plans - from pricing.ts
  const platformPlans = [
    {
      name: 'Developer',
      badge: 'Free Forever',
      description: 'For solo builders exploring ResonantGenesis',
      price: { monthly: 0, yearly: 0 },
      credits: '10,000 credits/month',
      features: [
        '10,000 credits/month',
        'Unlimited agents (billed by credits)',
        '10 compute hours/month',
        'Manual kill switch, 5 invariants',
        'Community support',
      ],
      cta: 'Get Started Free',
      highlighted: false,
    },
    {
      name: 'Plus',
      badge: 'Professional',
      description: 'For serious builders and teams',
      price: { monthly: 49, yearly: 490 },
      credits: '75,000 credits/month',
      features: [
        '75,000 credits/month',
        'Rollover up to 37.5K credits',
        'Unlimited agents with autonomous mode',
        'Agent teams enabled',
        '100 compute hours/month',
        'Hash Sphere Memory: 1 Universe',
        'Email + Slack support',
      ],
      cta: 'Start Plus Plan',
      highlighted: true,
    },
    {
      name: 'Enterprise',
      badge: 'Custom',
      description: 'For organizations running AI as critical infrastructure',
      price: { monthly: null, yearly: null },
      credits: 'Custom credits',
      features: [
        'Custom credits (tailored)',
        'Unlimited agents with full autonomous mode',
        'Agent team hierarchies',
        'Unlimited compute hours',
        'Hash Sphere Memory: Multi Universe',
        'SLA-backed kill switch',
        'Dedicated support + SLA',
      ],
      cta: 'Contact Sales',
      highlighted: false,
    },
  ];

  // API Products
  const apiProducts = [
    {
      name: 'Hash Sphere Memory API',
      icon: <Brain className="w-6 h-6" />,
      description: 'Invariant-governed long-term memory for AI systems',
      color: 'cyan',
      plans: [
        { name: 'Starter', price: '$49', period: '/mo', units: '100k MU/month' },
        { name: 'Builder', price: '$299', period: '/mo', units: '2M MU/month', highlighted: true },
        { name: 'Scale', price: '$1,200', period: '/mo', units: '10M MU/month' },
        { name: 'Enterprise', price: '$25k+', period: '/yr', units: 'Unlimited' },
      ],
    },
    {
      name: 'State Physics API',
      icon: <Atom className="w-6 h-6" />,
      description: 'Real-time anomaly detection and invariant enforcement',
      color: 'purple',
      plans: [
        { name: 'Dev', price: '$49', period: '/mo', units: '100k SU/month' },
        { name: 'Startup', price: '$299', period: '/mo', units: '2M SU/month', highlighted: true },
        { name: 'Enterprise', price: '$2k+', period: '/mo', units: 'Custom' },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Simple, transparent pricing
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Choose the plan that's right for you. Add API subscriptions as needed.
          </p>

          {/* Billing Toggle */}
          <div className="mt-10 flex items-center justify-center gap-4">
            <span className={`text-sm font-medium ${billingPeriod === 'monthly' ? 'text-white' : 'text-gray-500'}`}>
              Monthly
            </span>
            <button
              onClick={() => setBillingPeriod(billingPeriod === 'monthly' ? 'yearly' : 'monthly')}
              className="relative w-14 h-7 bg-gray-700 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-gray-900"
            >
              <span
                className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${
                  billingPeriod === 'yearly' ? 'translate-x-7' : ''
                }`}
              />
            </button>
            <span className={`text-sm font-medium ${billingPeriod === 'yearly' ? 'text-white' : 'text-gray-500'}`}>
              Yearly
              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-400">
                Save 17%
              </span>
            </span>
          </div>
        </div>

        {/* Platform Plans */}
        <div className="mb-20">
          <h2 className="text-2xl font-bold text-white mb-8 text-center">Platform Plans</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {platformPlans.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-2xl p-8 ${
                  plan.highlighted
                    ? 'bg-gradient-to-b from-emerald-500/20 to-emerald-500/5 border-2 border-emerald-500 ring-1 ring-emerald-500/50'
                    : 'bg-white/5 border border-white/10'
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center px-4 py-1 rounded-full text-sm font-semibold bg-emerald-500 text-black">
                      Recommended
                    </span>
                  </div>
                )}

                <div className="mb-4">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">{plan.badge}</span>
                  <h3 className={`text-2xl font-bold mt-1 ${plan.highlighted ? 'text-emerald-400' : 'text-white'}`}>
                    {plan.name}
                  </h3>
                  <p className="mt-2 text-sm text-gray-400">{plan.description}</p>
                </div>

                <div className="mb-6">
                  {plan.price.monthly !== null ? (
                    <>
                      <span className="text-4xl font-bold text-white">
                        ${billingPeriod === 'monthly' ? plan.price.monthly : Math.round(plan.price.yearly / 12)}
                      </span>
                      <span className="text-gray-400 ml-2">/month</span>
                      {billingPeriod === 'yearly' && plan.price.yearly > 0 && (
                        <div className="text-sm text-gray-500 mt-1">
                          ${plan.price.yearly} billed yearly
                        </div>
                      )}
                    </>
                  ) : (
                    <span className="text-4xl font-bold text-white">Custom</span>
                  )}
                </div>

                <div className="text-sm text-emerald-400 font-medium mb-4">{plan.credits}</div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => {
                    if (plan.name === 'Enterprise') {
                      window.open('mailto:enterprise@resonantgenesis.com');
                    } else {
                      navigate('/signup');
                    }
                  }}
                  className={`w-full py-3 px-4 rounded-lg font-semibold transition-all ${
                    plan.highlighted
                      ? 'bg-emerald-500 text-black hover:bg-emerald-400'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* API Subscriptions */}
        <div className="mb-20">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-white mb-2">API Subscriptions</h2>
            <p className="text-gray-400">Add specialized APIs to any platform plan</p>
          </div>

          <div className="space-y-8">
            {apiProducts.map((api) => (
              <div
                key={api.name}
                className="rounded-2xl bg-white/5 border border-white/10 p-8"
              >
                <div className="flex items-start gap-4 mb-6">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    api.color === 'cyan' ? 'bg-cyan-500/20 text-cyan-400' : 'bg-purple-500/20 text-purple-400'
                  }`}>
                    {api.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">{api.name}</h3>
                    <p className="text-gray-400 text-sm">{api.description}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {api.plans.map((plan, idx) => (
                    <div
                      key={idx}
                      className={`p-4 rounded-xl ${
                        plan.highlighted
                          ? `border-2 ${api.color === 'cyan' ? 'border-cyan-500 bg-cyan-500/10' : 'border-purple-500 bg-purple-500/10'}`
                          : 'border border-white/10 bg-white/5'
                      }`}
                    >
                      {plan.highlighted && (
                        <div className={`text-xs font-bold mb-1 ${api.color === 'cyan' ? 'text-cyan-400' : 'text-purple-400'}`}>
                          POPULAR
                        </div>
                      )}
                      <div className="text-sm font-medium text-gray-300">{plan.name}</div>
                      <div className="text-2xl font-bold text-white mt-1">
                        {plan.price}<span className="text-sm text-gray-500">{plan.period}</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">{plan.units}</div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => navigate('/api-keys')}
                  className={`mt-6 px-6 py-2 rounded-lg font-medium transition-all ${
                    api.color === 'cyan'
                      ? 'bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30'
                      : 'bg-purple-500/20 text-purple-400 hover:bg-purple-500/30'
                  }`}
                >
                  Subscribe to {api.name}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Contact */}
        <div className="text-center py-12 px-8 rounded-2xl bg-gradient-to-r from-purple-500/10 via-emerald-500/10 to-cyan-500/10 border border-white/10">
          <h3 className="text-2xl font-bold text-white mb-3">Need a custom solution?</h3>
          <p className="text-gray-400 mb-6 max-w-md mx-auto">
            Enterprise plans include dedicated support, custom SLAs, and on-premise deployment.
          </p>
          <button
            onClick={() => window.open('mailto:sales@resonantgenesis.com')}
            className="px-8 py-3 rounded-xl bg-white text-black font-semibold hover:bg-gray-100 transition-colors"
          >
            Contact Sales
          </button>
        </div>
      </div>
    </div>
  );
};

export default UnifiedPricingPage;
