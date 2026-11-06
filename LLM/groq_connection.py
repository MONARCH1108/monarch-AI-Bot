import os
from groq import Groq
from dotenv import load_dotenv
from datetime import datetime, timezone
from groq import APIConnectionError, APIStatusError, AuthenticationError, RateLimitError

load_dotenv()

def format_created_date(timestamp):
    """
    Convert Unix timestamp into a readable UTC date.
    """
    return datetime.fromtimestamp(
        timestamp, tz=timezone.utc
    ).strftime("%d %B %Y")

def get_available_models():
    """
    Fetch all currently available Groq models dynamically
    and return their metadata in JSON-compatible format.
    """
    try:
        api_key = os.getenv("GROQ_API_KEY")
        if not api_key:
            raise ValueError("GROQ_API_KEY is not configured")
        client = Groq(api_key=api_key)
        models = client.models.list()
        return {
            "success": True,
            "total_models": len(models.data),
            "models": [
                {
                    "id": model.id,
                    "owned_by": model.owned_by,
                    "created": format_created_date(model.created),
                    "active": model.active,
                    "context_window": model.context_window,
                    "max_completion_tokens": model.max_completion_tokens,
                }
                for model in models.data
                if getattr(model, "active", True)
            ]
        }
    except ValueError as e:
        return {
            "success": False,
            "error": str(e)
        }
    except AuthenticationError:
        return {
            "success": False,
            "error": "Invalid Groq API key."
        }
    except RateLimitError:
        return {
            "success": False,
            "error": "Groq API rate limit exceeded."
        }
    except APIConnectionError:
        return {
            "success": False,
            "error": "Unable to connect to Groq API."
        }
    except APIStatusError as e:
        return {
            "success": False,
            "error": f"Groq API error: {e.status_code}"
        }
    except Exception:
        return {
            "success": False,
            "error": "An unexpected error occurred while fetching models."
        }

