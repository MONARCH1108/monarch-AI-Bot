import os
import hmac
from dotenv import load_dotenv

load_dotenv()

def verify_basic_auth(username: str, password: str):
    """
    Verify Basic Auth credentials against backend environment variables.
    """
    try:
        # Validate input
        if not isinstance(username, str) or not username:
            raise ValueError("Username is required.")
        if not isinstance(password, str) or not password:
            raise ValueError("Password is required.")
        
        # Retrieve credentials from environment
        stored_username = os.getenv("API_AUTH_USERNAME")
        stored_password = os.getenv("API_AUTH_PASSWORD")
        if not stored_username or not stored_password:
            raise ValueError("Basic Auth credentials are not configured.")

        # Secure credential comparison
        username_valid = hmac.compare_digest(
            username.encode("utf-8"),
            stored_username.encode("utf-8")
        )
        password_valid = hmac.compare_digest(
            password.encode("utf-8"),
            stored_password.encode("utf-8")
        )
        if not (username_valid and password_valid):
            return {
                "success": False,
                "error": "Invalid Basic Auth credentials."
            }
        return {
            "success": True,
            "message": "Basic Auth verification successful."
        }
    except ValueError as e:
        return {
            "success": False,
            "error": str(e)
        }
    except Exception:
        return {
            "success": False,
            "error": "An unexpected error occurred during Basic Auth verification."
        }


if __name__ == "__main__":
    import json
    result = verify_basic_auth(
        username=os.getenv("API_AUTH_USERNAME", ""),
        password=os.getenv("API_AUTH_PASSWORD", "")
    )

    print(json.dumps(result, indent=4))
