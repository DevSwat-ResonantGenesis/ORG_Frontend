"""
ResonantGraph AI Client
Main client class for interacting with the ResonantGraph AI API
"""

import requests
from typing import Optional, Dict, Any, List
from .exceptions import ResonantGraphError, APIError, AuthenticationError, RateLimitError


class ResonantGraph:
    """
    ResonantGraph AI Python Client
    
    Example:
        >>> from resonantgraph import ResonantGraph
        >>> client = ResonantGraph(api_key="your-api-key")
        >>> result = client.validate(
        ...     model_output="Your LLM output",
        ...     policy_pack="compliance-v1"
        ... )
        >>> print(result.compliance_score)
    """
    
    def __init__(
        self,
        api_key: str,
        base_url: str = "https://api.resonantgraph.ai",
        timeout: int = 30
    ):
        """
        Initialize the ResonantGraph client.
        
        Args:
            api_key: Your API key from the dashboard
            base_url: Base URL for the API (default: production)
            timeout: Request timeout in seconds
        """
        self.api_key = api_key
        self.base_url = base_url.rstrip('/')
        self.timeout = timeout
        self.session = requests.Session()
        self.session.headers.update({
            'Authorization': f'Bearer {api_key}',
            'Content-Type': 'application/json',
            'User-Agent': f'ResonantGraph-Python-SDK/{__import__("resonantgraph").__version__}'
        })
    
    def _request(
        self,
        method: str,
        endpoint: str,
        data: Optional[Dict[str, Any]] = None,
        params: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Make an API request with error handling."""
        url = f"{self.base_url}{endpoint}"
        
        try:
            response = self.session.request(
                method=method,
                url=url,
                json=data,
                params=params,
                timeout=self.timeout
            )
            
            if response.status_code == 401:
                raise AuthenticationError("Invalid API key or expired token")
            elif response.status_code == 429:
                raise RateLimitError("Rate limit exceeded. Please wait before retrying.")
            elif response.status_code >= 400:
                error_data = response.json() if response.content else {}
                raise APIError(
                    f"API error {response.status_code}: {error_data.get('detail', 'Unknown error')}",
                    status_code=response.status_code
                )
            
            return response.json()
        except requests.exceptions.RequestException as e:
            raise ResonantGraphError(f"Request failed: {str(e)}")
    
    def validate(
        self,
        model_output: str,
        context: Optional[str] = None,
        policy_pack: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Validate AI-generated content.
        
        Args:
            model_output: The text output from your AI model
            context: Optional context about the content
            policy_pack: Optional policy pack to use for validation
        
        Returns:
            Validation result with validity, risk_score, risk_level, etc.
        
        Example:
            >>> result = client.validate(
            ...     model_output="AI-generated text",
            ...     context="financial statement"
            ... )
            >>> print(f"Validity: {result['validity']}")
            >>> print(f"Risk Level: {result['risk_level']}")
        """
        data = {
            'text': model_output,
        }
        if context:
            data['context'] = context
        
        return self._request('POST', '/public/validate', data=data)
    
    def create_prediction(
        self,
        input_text: str,
        context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Create a prediction and get analysis.
        
        Args:
            input_text: Text to analyze
            context: Optional context dictionary
        
        Returns:
            Prediction result with validity, risk scores, anchors, etc.
        """
        data = {
            'input_text': input_text,
        }
        if context:
            data['context'] = context
        
        return self._request('POST', '/predictions', data=data)
    
    def get_prediction(self, prediction_id: str) -> Dict[str, Any]:
        """
        Get prediction details by ID.
        
        Args:
            prediction_id: UUID of the prediction
        
        Returns:
            Full prediction details
        """
        return self._request('GET', f'/predictions/{prediction_id}')
    
    def list_predictions(
        self,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
        risk_level: Optional[str] = None,
        limit: int = 50,
        offset: int = 0
    ) -> Dict[str, Any]:
        """
        List predictions with optional filters.
        
        Args:
            start_date: ISO date string (e.g., '2025-01-01')
            end_date: ISO date string
            risk_level: Filter by risk level (low, medium, high, critical)
            limit: Number of results (default: 50)
            offset: Pagination offset
        
        Returns:
            Dictionary with 'items' list and pagination info
        """
        params = {'limit': limit, 'offset': offset}
        if start_date:
            params['start_date'] = start_date
        if end_date:
            params['end_date'] = end_date
        if risk_level:
            params['risk_level'] = risk_level
        
        return self._request('GET', '/predictions', params=params)
    
    def get_evidence_graph(self, prediction_id: str) -> Dict[str, Any]:
        """
        Get evidence graph for a prediction.
        
        Args:
            prediction_id: UUID of the prediction
        
        Returns:
            Evidence graph with nodes and edges
        """
        return self._request('GET', f'/evidence/{prediction_id}')
    
    def list_policies(self) -> List[Dict[str, Any]]:
        """
        List all compliance policies.
        
        Returns:
            List of policy objects
        """
        return self._request('GET', '/policies')
    
    def get_compliance_summary(self) -> Dict[str, Any]:
        """
        Get compliance summary statistics.
        
        Returns:
            Compliance summary with violations, scores, etc.
        """
        return self._request('GET', '/compliance/summary')


