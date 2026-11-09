import os
import jwt
from dotenv import load_dotenv
from jwt.exceptions import (
    ExpiredSignatureError,
    InvalidSignatureError,
    InvalidTokenError,
    PyJWTError
)

load_dotenv()

def verify_jwt(token: str):
    """
    Verify a JWT's signature and validity.

    No expiration check is required because generated tokens
    intentionally do not contain an exp claim.
    """
    try:
        # Validate token input
        if not isinstance(token, str) or not token.strip():
            raise ValueError("JWT token is required.")
        jwt_secret = os.getenv("JWT_SECRET")
        jwt_algorithm = os.getenv("JWT_ALGORITHM", "HS256")
        if not jwt_secret:
            raise ValueError("JWT_SECRET is not configured.")
        if jwt_algorithm != "HS256":
            raise ValueError("Unsupported JWT algorithm.")
        if len(jwt_secret.encode("utf-8")) < 32:
            raise ValueError("JWT_SECRET must contain at least 32 bytes.")

        # Verify token signature and decode payload
        payload = jwt.decode(
            token.strip(),
            jwt_secret,
            algorithms=[jwt_algorithm],
            options={
                "require": ["jti", "iat"]
            }
        )
        return {
            "success": True,
            "message": "JWT verified successfully.",
            "payload": payload
        }

    except ValueError as e:
        return {
            "success": False,
            "error": str(e)
        }
    except ExpiredSignatureError:
        return {
            "success": False,
            "error": "JWT has expired."
        }
    except InvalidSignatureError:
        return {
            "success": False,
            "error": "Invalid JWT signature."
        }
    except InvalidTokenError:
        return {
            "success": False,
            "error": "Invalid JWT token."
        }
    except PyJWTError:
        return {
            "success": False,
            "error": "JWT verification failed."
        }
    except Exception:
        return {
            "success": False,
            "error": "An unexpected error occurred during JWT verification."
        }


if __name__ == "__main__":
    import json
    from APIAuth.generate_jwt import generate_jwt
    generated = generate_jwt()
    if generated["success"]:
        result = verify_jwt(generated["token"])
    else:
        result = generated

    print(json.dumps(result, indent=4))
