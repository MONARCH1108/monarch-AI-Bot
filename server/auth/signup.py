import uuid
from psycopg.errors import (
    UniqueViolation,
    OperationalError,
    DataError,
    Error as PsycopgError
)
from auth.database import get_db_connection

def signup(username: str):
    """
    Register a new guest user with a unique UUID.
    Usernames are case-sensitive.
    """
    try:
        # Validate username
        if not isinstance(username, str) or not username.strip():
            raise ValueError("Username is required.")
        username = username.strip()
        if len(username) > 50:
            raise ValueError("Username cannot exceed 50 characters.")
        
        # Generate unique UUID
        user_uuid = uuid.uuid4()

        # Insert user into database
        with get_db_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute(
                    """
                    INSERT INTO users (user_uuid, username)
                    VALUES (%s, %s)
                    RETURNING user_uuid, username, created_at
                    """,
                    (user_uuid, username)
                )
                user = cursor.fetchone()
                return {
                    "success": True,
                    "message": "Signup successful.",
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
    except UniqueViolation as e:
        if e.diag.constraint_name == "users_username_key":
            return {
                "success": False,
                "error": "Username already exists. Choose another username."
            }
        return {
            "success": False,
            "error": "A unique identifier conflict occurred. Please try again."
        }
    except OperationalError:
        return {
            "success": False,
            "error": "Database connection failed. Please try again later."
        }
    except DataError:
        return {
            "success": False,
            "error": "Invalid data provided for user registration."
        }
    except PsycopgError:
        return {
            "success": False,
            "error": "A database error occurred during registration."
        }
    except Exception:
        return {
            "success": False,
            "error": "An unexpected error occurred. Please try again."
        }

if __name__ == "__main__":
    import json
    result = signup("monarch")
    print(json.dumps(result, indent=4))