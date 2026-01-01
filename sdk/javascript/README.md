# ResonantGraph AI JavaScript/TypeScript SDK

Official JavaScript/TypeScript SDK for the ResonantGraph AI Platform.

## Installation

```bash
npm install @resonantgraph/sdk
```

Or with yarn:

```bash
yarn add @resonantgraph/sdk
```

## Quick Start

```typescript
import { ResonantGraph } from '@resonantgraph/sdk';

// Initialize client
const client = new ResonantGraph({
  apiKey: 'your-api-key'
});

// Validate AI output
const result = await client.validate({
  model_output: 'Your AI-generated text',
  context: 'financial statement'
});

console.log(`Validity: ${result.validity}`);
console.log(`Risk Level: ${result.risk_level}`);
console.log(`Detected Issues: ${result.detected_issues}`);
```

## Browser Usage

```html
<script type="module">
  import { ResonantGraph } from 'https://cdn.jsdelivr.net/npm/@resonantgraph/sdk@latest/dist/index.js';
  
  const client = new ResonantGraph({
    apiKey: 'your-api-key'
  });
  
  const result = await client.validate({
    model_output: 'Your text'
  });
</script>
```

## API Reference

### Client Initialization

```typescript
const client = new ResonantGraph({
  apiKey: 'your-api-key',
  baseUrl: 'https://api.resonantgraph.ai', // Optional
  timeout: 30000 // Optional, milliseconds
});
```

### Methods

#### `validate(options)`

Validate AI-generated content.

**Parameters:**
- `options.model_output` (string): The text output from your AI model
- `options.context` (string, optional): Context about the content
- `options.policy_pack` (string, optional): Policy pack to use

**Returns:** Promise<ValidationResult>

#### `createPrediction(options)`

Create a prediction and get analysis.

**Parameters:**
- `options.input_text` (string): Text to analyze
- `options.context` (object, optional): Context dictionary

**Returns:** Promise<Prediction>

#### `getPrediction(predictionId)`

Get prediction details by ID.

#### `listPredictions(options?)`

List predictions with optional filters.

#### `getEvidenceGraph(predictionId)`

Get evidence graph for a prediction.

#### `listPolicies()`

List all compliance policies.

#### `getComplianceSummary()`

Get compliance summary statistics.

## Error Handling

```typescript
import { ResonantGraph, APIError, AuthenticationError, RateLimitError } from '@resonantgraph/sdk';

try {
  const result = await client.validate({ model_output: 'text' });
} catch (error) {
  if (error instanceof AuthenticationError) {
    console.error('Invalid API key');
  } else if (error instanceof RateLimitError) {
    console.error('Rate limit exceeded');
  } else if (error instanceof APIError) {
    console.error(`API error: ${error.message}`);
  }
}
```

## TypeScript Support

Full TypeScript types are included. No additional type definitions needed.

## Documentation

Full documentation available at: https://docs.resonantgraph.ai

## License

MIT License


