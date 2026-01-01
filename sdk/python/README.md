# ResonantGraph AI Python SDK

Official Python SDK for the ResonantGraph AI Platform.

## Installation

```bash
pip install resonantgraph
```

Or from source:

```bash
git clone https://github.com/resonantgraph/resonantgraph-python-sdk
cd resonantgraph-python-sdk
pip install -e .
```

## Quick Start

```python
from resonantgraph import ResonantGraph

# Initialize client
client = ResonantGraph(api_key="your-api-key")

# Validate AI output
result = client.validate(
    model_output="Your AI-generated text",
    context="financial statement"
)

print(f"Validity: {result['validity']}")
print(f"Risk Level: {result['risk_level']}")
print(f"Detected Issues: {result['detected_issues']}")
```

## API Reference

### Client Initialization

```python
client = ResonantGraph(
    api_key="your-api-key",
    base_url="https://api.resonantgraph.ai",  # Optional
    timeout=30  # Optional
)
```

### Methods

#### `validate(model_output, context=None, policy_pack=None)`

Validate AI-generated content.

**Parameters:**
- `model_output` (str): The text output from your AI model
- `context` (str, optional): Context about the content
- `policy_pack` (str, optional): Policy pack to use

**Returns:** Validation result dictionary

#### `create_prediction(input_text, context=None)`

Create a prediction and get analysis.

**Parameters:**
- `input_text` (str): Text to analyze
- `context` (dict, optional): Context dictionary

**Returns:** Prediction result dictionary

#### `get_prediction(prediction_id)`

Get prediction details by ID.

#### `list_predictions(start_date=None, end_date=None, risk_level=None, limit=50, offset=0)`

List predictions with optional filters.

#### `get_evidence_graph(prediction_id)`

Get evidence graph for a prediction.

#### `list_policies()`

List all compliance policies.

#### `get_compliance_summary()`

Get compliance summary statistics.

## Error Handling

```python
from resonantgraph import ResonantGraph, APIError, AuthenticationError, RateLimitError

try:
    result = client.validate(model_output="text")
except AuthenticationError:
    print("Invalid API key")
except RateLimitError:
    print("Rate limit exceeded")
except APIError as e:
    print(f"API error: {e}")
```

## Documentation

Full documentation available at: https://docs.resonantgraph.ai

## License

MIT License


