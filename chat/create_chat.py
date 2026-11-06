from auth.database import get_db_connection
import psycopg

def create_chat(user_uuid: str):
    try:
        if not user_uuid:
            raise ValueError("User UUID is required")

        with get_db_connection() as connection:
            with connection.cursor() as cursor:
                cursor.execute(
                    """
                    INSERT INTO conversations (user_uuid)
                    VALUES (%s)
                    RETURNING chat_id, user_uuid, title, created_at, updated_at
                    """,
                    (user_uuid,)
                )

                chat = cursor.fetchone()

                return {
                    "success": True,
                    "chat": {
                        "chat_id": str(chat[0]),
                        "user_uuid": str(chat[1]),
                        "title": chat[2],
                        "created_at": chat[3].isoformat(),
                        "updated_at": chat[4].isoformat()
                    }
                }

    except ValueError as e:
        return {"success": False, "error": str(e)}

    except psycopg.Error as e:
        return {"success": False, "error": f"Database error: {e}"}

    except Exception as e:
        return {"success": False, "error": str(e)}

if __name__ == "__main__":
    import json

    test_cases = [
        {
            "test": "Valid UUID",
            "user_uuid": "13a6aaf9-a69a-4b4c-915b-cd80093552dd"
        },
        {
            "test": "Invalid UUID format",
            "user_uuid": "invalid-uuid"
        },
        {
            "test": "Non-existing UUID",
            "user_uuid": "00000000-0000-0000-0000-000000000000"
        },
        {
            "test": "Empty UUID",
            "user_uuid": ""
        }
    ]

    for test in test_cases:
        print(f"\n--- {test['test']} ---")

        response = create_chat(test["user_uuid"])

        print(json.dumps(response, indent=4))