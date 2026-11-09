import os
from groq import Groq
from groq import APIConnectionError, APIStatusError, AuthenticationError, RateLimitError
from LLM.prompt import SYSTEM_PROMPT
from dotenv import load_dotenv

load_dotenv()

def groq_chat(model: str, message: str, history: list = None):
    """
    Generate an LLM response using Groq with optional conversation history.

    Args:
        model: Groq model ID.
        message: User's latest input message.
        history: Previous question-answer pairs.

    Returns:
        JSON-compatible response dictionary.
    """
    try:
        api_key = os.getenv("GROQ_API_KEY")
        if not api_key:
            raise ValueError("GROQ_API_KEY is not configured")
        if not model or not message:
            raise ValueError("Model and message are required")
        if history is None:
            history = []
        if not isinstance(history, list):
            raise ValueError("History must be a list")
        messages = [
            {
                "role": "system",
                "content": SYSTEM_PROMPT
            }
        ]
        for item in history:
            if not isinstance(item, dict):
                raise ValueError("Each history item must be a dictionary")
            question = item.get("question")
            answer = item.get("answer")
            if not isinstance(question, str) or not isinstance(answer, str):
                raise ValueError("Each history item must contain a valid question and answer")
            messages.extend([
                {
                    "role": "user",
                    "content": question
                },
                {
                    "role": "assistant",
                    "content": answer
                }
            ])
        messages.append({
            "role": "user",
            "content": message
        })
        client = Groq(api_key=api_key)
        response = client.chat.completions.create(
            model=model,
            messages=messages
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
    import json
    test_history = [
        {
            "question": "What is Python?",
            "answer": "Python is a high-level programming language."
        },
        {
            "question": "Where is it used?",
            "answer": "Python is used in AI, automation, web development and data science."
        }
    ]
    result = groq_chat(
        model="openai/gpt-oss-20b",
        message="How is it used in AI?",
        history=test_history
    )

    print(json.dumps(result, indent=4))
