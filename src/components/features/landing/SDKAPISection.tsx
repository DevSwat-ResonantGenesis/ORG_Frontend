import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { ParallaxSection } from './ParallaxSection';import { goToContact, goToHelp } from '@/utils/navigation';

import './sdkApiSection.css';

export const SDKAPISection: React.FC = () => {
  const navigate = useNavigate();

  const sdks = [
    {
      name: 'Python SDK',
      icon: '🐍',
      description: 'Comprehensive Python library for integrating ResonantGenesis into your ML pipelines.',
      features: [
        'Simple API for evidence graph generation',
        'Policy validation and compliance checking',
        'Real-time monitoring and alerting',
        'Full type hints and documentation',
        'Async/await support'
      ],
      codeExample: `from resonantgraph import ResonantGenesis

client = ResonantGenesis(api_key="your-key")
result = client.validate(
    model_output="Your LLM output",
    policy_pack="compliance-v1"
)
print(result.compliance_score)`,
      color: '#3B82F6'
    },
    {
      name: 'JavaScript/TypeScript SDK',
      icon: '⚡',
      description: 'Modern TypeScript SDK for Node.js and browser environments.',
      features: [
        'TypeScript-first with full type safety',
        'Browser and Node.js support',
        'Promise-based async operations',
        'Built-in error handling',
        'React hooks included'
      ],
      codeExample: `import { ResonantGenesis } from '@resonantgraph/sdk';

const client = new ResonantGenesis({
  apiKey: 'your-key'
});

const result = await client.validate({
  modelOutput: 'Your LLM output',
  policyPack: 'compliance-v1'
});

console.log(result.complianceScore);`,
      color: '#F59E0B'
    },
    {
      name: 'REST API',
      icon: '🌐',
      description: 'RESTful API for any language or platform. Full OpenAPI specification available.',
      features: [
        'Standard HTTP/REST endpoints',
        'OpenAPI 3.0 specification',
        'JSON request/response format',
        'Rate limiting and authentication',
        'Webhook support for real-time events'
      ],
      codeExample: `curl -X POST https://api.resonantgraph.ai/v1/validate \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model_output": "Your LLM output",
    "policy_pack": "compliance-v1"
  }'`,
      color: '#10B981'
    }
  ];

  return (
    <ParallaxSection graphicsVariant="section" graphicsIntensity="subtle">
      <section id="sdk" className="sdk-api-section">
        <div className="page-container">
          <div className="sdk-api-header">
            <h2 className="section-title-large">SDK & API</h2>
            <p className="section-subtitle">
              Integrate ResonantGenesis into your stack with our comprehensive SDKs and REST API.
            </p>
          </div>

          <div className="sdk-api-grid">
            {sdks.map((sdk, index) => (
              <div
                key={sdk.name}
                className={`sdk-api-card ${sdk.name === 'REST API' ? 'rest-api-horizontal' : ''}`}
                style={{ borderColor: sdk.color }}
              >
                <div className="sdk-api-header-card">
                  <div className="sdk-icon">{sdk.icon}</div>
                  <h3 className="sdk-name">{sdk.name}</h3>
                </div>
                <p className="sdk-description">{sdk.description}</p>

                {sdk.name === 'REST API' ? (
                  <div className="rest-api-content">
                    <div className="rest-api-left">
                      <div className="sdk-features">
                        {sdk.features.map((feature, idx) => (
                          <div key={idx} className="sdk-feature-item">
                            ✓ {feature}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="rest-api-right">
                      <div className="sdk-code-example">
                        <div className="code-example-header">
                          <span>Example</span>
                        </div>
                        <pre className="code-block">
                          <code>{sdk.codeExample}</code>
                        </pre>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="sdk-features">
                      {sdk.features.map((feature, idx) => (
                        <div key={idx} className="sdk-feature-item">
                          ✓ {feature}
                        </div>
                      ))}
                    </div>

                    <div className="sdk-code-example">
                      <div className="code-example-header">
                        <span>Example</span>
                      </div>
                      <pre className="code-block">
                        <code>{sdk.codeExample}</code>
                      </pre>
                    </div>
                  </>
                )}

                <div className="sdk-actions">
                  <Button
                    variant="tertiary"
                    onClick={() => goToHelp(navigate)}
                    style={{ width: '100%' }}
                  >
                    View Documentation
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="sdk-api-cta">
            <p className="cta-text">
              Need help getting started? Check out our{' '}
              <a href="/help" onClick={(e) => { e.preventDefault(); goToHelp(navigate); }}>
                API documentation
              </a>{' '}
              or{' '}
              <a href="/contact" onClick={(e) => { e.preventDefault(); goToContact(navigate); }}>
                contact our team
              </a>.
            </p>
          </div>
        </div>
      </section>
    </ParallaxSection>
  );
};

