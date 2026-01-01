"""
ResonantGraph AI SDK Exceptions
"""


class ResonantGraphError(Exception):
    """Base exception for all ResonantGraph errors."""
    pass


class APIError(ResonantGraphError):
    """Raised when the API returns an error."""
    def __init__(self, message: str, status_code: int = None):
        super().__init__(message)
        self.status_code = status_code


class AuthenticationError(ResonantGraphError):
    """Raised when authentication fails."""
    pass


class RateLimitError(ResonantGraphError):
    """Raised when rate limit is exceeded."""
    pass


