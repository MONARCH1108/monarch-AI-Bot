import os
from groq import Groq
from groq import APIConnectionError, APIStatusError, AuthenticationError, RateLimitError
from LLM.prompt import SYSTEM_PROMPT
from dotenv import load_dotenv

load_dotenv()

def groq_chat(model: str, message: str):
    """
    Generate an LLM response using Groq.

    Args:
        model: Groq model ID.
        message: User's input message.

    Returns:
        JSON-compatible response dictionary.
    """
    try:
        api_key = os.getenv("GROQ_API_KEY")
        if not api_key:
            raise ValueError("GROQ_API_KEY is not configured")
        if not model or not message:
            raise ValueError("Model and message are required")
        client = Groq(api_key=api_key)
        response = client.chat.completions.create(
            model=model,
            messages=[
                {
                    "role": "system",
                    "content": SYSTEM_PROMPT
                },
                {
                    "role": "user",
                    "content": message
                }
            ]
        )
        return {
            "success": True,
            "model": response.model,
            "message": response.choices[0].message.content,
            "usage": {
                "prompt_tokens": response.usage.prompt_tokens,
                "completion_tokens": response.usage.completion_tokens,
                "total_tokens": response.usage.total_tokens
            }
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
            "error": "An unexpected error occurred during chat completion."
        }


if __name__ == "__main__":

    result = groq_chat(
        model="openai/gpt-oss-20b",
        message="What is artificial intelligence? in 2lines"
    )

    import json
    print(json.dumps(result, indent=4))
