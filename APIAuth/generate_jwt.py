import os
from uuid import uuid4
from datetime import datetime, timezone

import jwt
from dotenv import load_dotenv
from jwt.exceptions import PyJWTError

load_dotenv()

def generate_jwt():
    """
    Generate a signed JWT access token.

    The token has no expiration time.
    Uses HS256 signing algorithm.
    """
    try:
        # Retrieve JWT configuration
        jwt_secret = os.getenv("JWT_SECRET")
        jwt_algorithm = os.getenv("JWT_ALGORITHM", "HS256")

        # Validate configuration
        if not jwt_secret:
            raise ValueError("JWT_SECRET is not configured.")
        if jwt_algorithm != "HS256":
            raise ValueError("Unsupported JWT algorithm.")
        if len(jwt_secret.encode("utf-8")) < 32:
            raise ValueError("JWT_SECRET must contain at least 32 bytes.")
        
        # Prepare JWT payload
        payload = {
            "jti": str(uuid4()),
            "iat": datetime.now(timezone.utc)
        }

        # Generate signed JWT
        token = jwt.encode(
            payload,
            jwt_secret,
            algorithm=jwt_algorithm
        )
        return {
            "success": True,
            "message": "JWT generated successfully.",
            "token": token,
            "token_type": "Bearer"
        }
    except ValueError as e:
        return {
            "success": False,
            "error": str(e)
        }
    except PyJWTError:
        return {
            "success": False,
            "error": "JWT generation failed."
        }
    except Exception:
        return {
            "success": False,
            "error": "An unexpected error occurred during JWT generation."
        }

if __name__ == "__main__":
    import json
    result = generate_jwt()
    print(json.dumps(result, indent=4))