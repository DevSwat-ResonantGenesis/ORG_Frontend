/**
 * Pricing Page - Display subscription plans and pricing
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, X, Zap, Star, Building2, ChevronDown } from 'lucide-react';
import { fetchPlans } from '../../api/pricing';
import { isAuthenticated } from '@/utils/auth-cookies';

const PricingPage: React.FC = () => {
  const navigate = useNavigate();
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [annual, setAnnual] = useState(true);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const isLoggedIn = isAuthenticated();

  useEffect(() => {
    async function loadPricing() {
      try {
        const data = await fetchPlans();
        if (data) {
          const transformedPlans = [
            {
              name: data.developer?.name || 'Developer',
              price: data.developer?.price || { monthly: 0, yearly: 0 },
              description: 'For solo builders exploring ResonantGenesis',
              icon: Zap,
              features: [
                `${data.developer?.credits?.included?.toLocaleString() || '10,000'} credits/month`,
                'Up to 3 agents (no autonomous mode)',
                '10 compute hours/month',
                '100 MB storage',
                'Manual kill switch, 5 invariants',
                'Community support',
              ],
              cta: 'Get Started Free',
              popular: false,
              isCustom: false,
            },
            {
              name: data.plus?.name || 'Plus',
              price: data.plus?.price || { monthly: 49, yearly: 490 },
              description: 'For serious builders and teams',
              icon: Star,
              features: [
                `${data.plus?.credits?.included?.toLocaleString() || '75,000'} credits/month`,
                `Rollover up to ${((data.plus?.credits?.rollover_limit || 37500) / 1000).toFixed(1)}K credits`,
                'Unlimited agents with autonomous mode',
                'Individual account (no teams)',
                '100 compute hours/month',
                'Hash Sphere Memory: 1 Universe',
                'Email + Slack support',
              ],
              cta: 'Start Plus Plan',
              popular: true,
              isCustom: false,
            },
            {
              name: data.enterprise?.name || 'Enterprise',
              price: { monthly: 0, yearly: 0 },
              description: 'For organizations running AI as critical infrastructure',
              icon: Building2,
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
              popular: false,
              isCustom: true,
            },
          ];
          setPlans(transformedPlans);
        }
      } catch (error) {
        console.error('Failed to load pricing:', error);
      } finally {
        setLoading(false);
      }
    }
    loadPricing();
  }, []);

  if (loading) {
    return <div>Loading pricing...</div>;
  }

  interface FeatureComparisonItem {
    name: string;
    developer: boolean | string;
    plus: boolean | string;
    enterprise: boolean | string;
  }

  const featureComparison: FeatureComparisonItem[] = [
    { name: 'Credits/Month', developer: '10,000', plus: '75,000', enterprise: 'Custom' },
    { name: 'Agents', developer: 'Unlimited', plus: 'Unlimited', enterprise: 'Unlimited' },
    { name: 'Autonomous Mode', developer: false, plus: true, enterprise: true },
    { name: 'Team Features', developer: false, plus: false, enterprise: true },
    { name: 'Compute Hours/Month', developer: '10', plus: '100', enterprise: 'Unlimited' },
    { name: 'Hash Sphere Memory', developer: false, plus: true, enterprise: true },
    { name: 'Code Visualizer', developer: false, plus: true, enterprise: true },
    { name: 'SSO/SAML', developer: false, plus: false, enterprise: true },
    { name: 'SLA Guarantee', developer: false, plus: false, enterprise: true },
    { name: 'On-premise Option', developer: false, plus: false, enterprise: true },
  ];

  const faqs = [
    {
      question: 'Can I change plans at any time?',
      answer: 'Yes! You can upgrade or downgrade your plan at any time. When upgrading, you\'ll be charged the prorated difference. When downgrading, the change takes effect at the end of your billing cycle.',
    },
    {
      question: 'What happens if I exceed my limits?',
      answer: 'We\'ll notify you when you\'re approaching your limits. You can either upgrade your plan or purchase additional credits. We never cut off access without warning.',
    },
    {
      question: 'Is there a free tier?',
      answer: 'Yes! The Developer plan is completely free with 10,000 credits per month. No credit card required.',
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards (Visa, Mastercard, American Express) and can arrange invoicing for Enterprise customers.',
    },
    {
      question: 'Can I get a refund?',
      answer: 'We offer a 30-day money-back guarantee for all paid plans. If you\'re not satisfied, contact us for a full refund.',
    },
    {
      question: 'Do you offer discounts for startups or non-profits?',
      answer: 'Yes! We offer special pricing for startups, non-profits, and educational institutions. Contact us to learn more.',
    },
  ];

  const handlePlanSelect = (planName: string) => {
    if (isLoggedIn) {
      if (planName === 'Enterprise') {
        navigate('/contact?subject=enterprise');
      } else {
        navigate('/billing');
      }
    } else {
      if (planName === 'Enterprise') {
        window.location.href = '/contact?subject=enterprise';
      } else if (planName === 'Developer') {
        window.location.href = '/signup';
      } else {
        window.location.href = `/signup?plan=${planName.toLowerCase()}&billing=${annual ? 'yearly' : 'monthly'}`;
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-purple-900/50 to-transparent py-16 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-400 mb-8">
            Start free, scale as you grow. No hidden fees.
          </p>
          
          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4">
            <span className={`text-sm font-medium ${!annual ? 'text-white' : 'text-gray-500'}`}>Monthly</span>
            <button
              onClick={() => setAnnual(!annual)}
              className={`relative w-14 h-7 rounded-full transition-colors ${annual ? 'bg-emerald-500' : 'bg-gray-600'}`}
            >
              <span className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${annual ? 'translate-x-7' : ''}`} />
            </button>
            <span className={`text-sm font-medium ${annual ? 'text-white' : 'text-gray-500'}`}>
              Annual
              <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-400">
                Save 17%
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-6xl mx-auto px-4 -mt-4 mb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => {
            const Icon = plan.icon;
            return (
              <div
                key={plan.name}
                className={`relative rounded-2xl p-8 ${
                  plan.popular
                    ? 'bg-gradient-to-b from-emerald-500/20 to-emerald-500/5 border-2 border-emerald-500 ring-1 ring-emerald-500/50'
                    : 'bg-white/5 border border-white/10'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="px-4 py-1 rounded-full text-sm font-semibold bg-emerald-500 text-black">
                      Recommended
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    plan.popular ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/10 text-gray-400'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className={`text-xl font-bold ${plan.popular ? 'text-emerald-400' : 'text-white'}`}>
                      {plan.name}
                    </h3>
                  </div>
                </div>

                <p className="text-sm text-gray-400 mb-6">{plan.description}</p>

                <div className="mb-6">
                  {plan.isCustom ? (
                    <span className="text-4xl font-bold text-white">Custom</span>
                  ) : (
                    <>
                      <span className="text-4xl font-bold text-white">
                        ${annual ? plan.price.yearly : plan.price.monthly}
                      </span>
                      <span className="text-gray-400 ml-2">/{annual ? 'year' : 'month'}</span>
                      {annual && plan.price.monthly > 0 && (
                        <div className="text-sm text-gray-500 mt-1">
                          ${Math.round(plan.price.yearly / 12)}/month billed annually
                        </div>
                      )}
                    </>
                  )}
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handlePlanSelect(plan.name)}
                  className={`w-full py-3 px-4 rounded-lg font-semibold transition-all ${
                    plan.popular
                      ? 'bg-emerald-500 text-black hover:bg-emerald-400'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  {plan.cta}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Feature Comparison */}
      <div className="bg-white/5 py-16">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-white text-center mb-2">Compare Plans</h2>
          <p className="text-gray-400 text-center mb-8">See which plan is right for you</p>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-4 px-4 text-gray-400 font-medium">Feature</th>
                  <th className="text-center py-4 px-4 text-gray-400 font-medium">Developer</th>
                  <th className="text-center py-4 px-4 text-emerald-400 font-medium">Plus</th>
                  <th className="text-center py-4 px-4 text-gray-400 font-medium">Enterprise</th>
                </tr>
              </thead>
              <tbody>
                {featureComparison.map((feature, i) => (
                  <tr key={feature.name} className={`border-b border-white/5 ${i % 2 === 0 ? 'bg-white/[0.02]' : ''}`}>
                    <td className="py-3 px-4 text-gray-300">{feature.name}</td>
                    {(['developer', 'plus', 'enterprise'] as const).map((plan) => (
                      <td key={plan} className="text-center py-3 px-4">
                        {typeof feature[plan] === 'boolean' ? (
                          feature[plan] ? (
                            <Check className="w-5 h-5 text-emerald-400 mx-auto" />
                          ) : (
                            <X className="w-5 h-5 text-gray-600 mx-auto" />
                          )
                        ) : (
                          <span className="text-gray-300">{feature[plan]}</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="max-w-3xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-white text-center mb-8">Frequently Asked Questions</h2>
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div key={i} className="rounded-lg bg-white/5 border border-white/10 overflow-hidden">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between p-4 text-left"
              >
                <span className="font-medium text-white">{faq.question}</span>
                <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
              </button>
              {openFaq === i && (
                <div className="px-4 pb-4 text-gray-400">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-purple-900/50 via-emerald-900/30 to-purple-900/50 py-16 text-center">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-white mb-4">
            {isLoggedIn ? 'Manage Your Subscription' : 'Ready to get started?'}
          </h2>
          <p className="text-gray-400 mb-8">
            {isLoggedIn 
              ? 'Upgrade your plan or manage billing in your account'
              : 'Join thousands of developers building with Resonant Genesis'
            }
          </p>
          <button
            onClick={() => navigate(isLoggedIn ? '/billing' : '/signup')}
            className="px-8 py-3 rounded-xl bg-white text-black font-semibold hover:bg-gray-100 transition-colors"
          >
            {isLoggedIn ? 'Go to Billing' : 'Get Started Free'}
          </button>
        </div>
      </div>
    </div>
  );
}
