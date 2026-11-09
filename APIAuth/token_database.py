
from uuid import UUID
from psycopg import Error as PsycopgError
from auth.database import get_db_connection


def store_active_token(jti: str):
    """
    Store or replace the currently active JWT identifier.
    Only one active token is maintained.
    """
    try:
        if not isinstance(jti, str) or not jti.strip():
            raise ValueError("JWT ID is required.")

        try:
            jti = UUID(jti)
        except ValueError:
            raise ValueError("Invalid JWT ID format.")

        with get_db_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute(
                    """
                    INSERT INTO api_active_token (id, jti)
                    VALUES (1, %s)
                    ON CONFLICT (id)
                    DO UPDATE SET
                        jti = EXCLUDED.jti,
                        created_at = NOW()
                    RETURNING jti, created_at
                    """,
                    (jti,)
                )

                token = cursor.fetchone()

                return {
                    "success": True,
                    "message": "Active JWT token stored successfully.",
                    "jti": str(token[0]),
                    "created_at": token[1].isoformat()
                }

    except ValueError as e:
        return {"success": False, "error": str(e)}

    except ConnectionError:
        return {
            "success": False,
            "error": "Database connection failed."
        }

    except PsycopgError:
        return {
            "success": False,
            "error": "Database error while storing active JWT token."
        }

    except Exception:
        return {
            "success": False,
            "error": "An unexpected error occurred."
        }


def verify_active_token(jti: str):
    """
    Verify whether the supplied JWT ID matches the active database token.
    """
    try:
        if not isinstance(jti, str) or not jti.strip():
            raise ValueError("JWT ID is required.")

        try:
            jti = UUID(jti)
        except ValueError:
            raise ValueError("Invalid JWT ID format.")

        with get_db_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute(
                    """
                    SELECT jti
                    FROM api_active_token
                    WHERE id = 1 AND jti = %s
                    """,
                    (jti,)
                )

                token = cursor.fetchone()

                if not token:
                    return {
                        "success": False,
                        "error": "Token revoked or no longer valid."
                    }

                return {
                    "success": True,
                    "message": "Active JWT token verified successfully."
                }

    except ValueError as e:
        return {"success": False, "error": str(e)}

    except ConnectionError:
        return {
            "success": False,
            "error": "Database connection failed."
        }

    except PsycopgError:
        return {
            "success": False,
            "error": "Database error during token verification."
        }

    except Exception:
        return {
            "success": False,
            "error": "An unexpected error occurred during token verification."
        }


if __name__ == "__main__":
    import json

    # Test currently active token
    result = verify_active_token(
        "ba329b00-c3c2-41d9-bc40-49e9b50526ec"
    )

    print(json.dumps(result, indent=4))
