from uuid import UUID
from psycopg.errors import OperationalError, DataError, Error as PsycopgError
from auth.database import get_db_connection


def login(username: str, user_uuid: str):
    """
    Authenticate an existing user using username and UUID.
    Login is permitted only within 24 hours of signup.
    """
    try:
        if not isinstance(username, str) or not username.strip():
            raise ValueError("Username is required.")
        if not isinstance(user_uuid, str) or not user_uuid.strip():
            raise ValueError("User UUID is required.")
        username = username.strip()
        try:
            user_uuid = UUID(user_uuid)
        except ValueError:
            raise ValueError("Invalid UUID format.")
        with get_db_connection() as conn:
            with conn.cursor() as cursor:

                cursor.execute(
                    """
                    SELECT
                        user_uuid,
                        username,
                        created_at,
                        (created_at > NOW() - INTERVAL '24 hours') AS is_valid
                    FROM users
                    WHERE username = %s AND user_uuid = %s
                    """,
                    (username, user_uuid)
                )
                user = cursor.fetchone()
                if not user:
                    return {
                        "success": False,
                        "error": "Invalid username or UUID."
                    }
                if not user[3]:
                    return {
                        "success": False,
                        "error": "Account expired. The 24-hour signup period has ended."
                    }
                return {
                    "success": True,
                    "message": "Login successful.",
                    "user": {
                        "user_uuid": str(user[0]),
                        "username": user[1],
                        "created_at": user[2].isoformat()
                    }
                }
    except ValueError as e:
        return {
            "success": False,
            "error": str(e)
        }
    except ConnectionError:
        return {
            "success": False,
            "error": "Database connection failed. Please try again later."
        }
    except PsycopgError:
        return {
            "success": False,
            "error": "A database error occurred during login."
        }
    except Exception:
        return {
            "success": False,
            "error": "An unexpected error occurred. Please try again."
        }

if __name__ == "__main__":
    import json
    result = login(
        username="Monarch_user",
        user_uuid="13a6aaf9-a69a-4b4c-915b-cd80093552dd"
    )
    print(json.dumps(result, indent=4))