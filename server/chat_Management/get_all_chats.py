from uuid import UUID
from auth.database import get_db_connection
import psycopg

def get_all_chats(user_uuid: str):
    try:
        if not user_uuid:
            raise ValueError("User UUID is required.")
        try:
            user_uuid = str(UUID(user_uuid))
        except ValueError:
            raise ValueError("Invalid user UUID format.")
        with get_db_connection() as connection:
            with connection.cursor() as cursor:
                cursor.execute(
                    """
                    SELECT
                        chat_id,
                        title,
                        created_at,
                        updated_at
                    FROM conversations
                    WHERE user_uuid = %s
                    ORDER BY updated_at DESC
                    """,
                    (user_uuid,)
                )
                conversations = cursor.fetchall()
                chats = [
                    {
                        "chat_id": str(row[0]),
                        "title": row[1],
                        "created_at": row[2].isoformat(),
                        "updated_at": row[3].isoformat()
                    }
                    for row in conversations
                ]
                return {
                    "success": True,
                    "user_uuid": user_uuid,
                    "total_conversations": len(chats),
                    "conversations": chats
                }
    except ValueError as e:
        return {
            "success": False,
            "error": str(e)
        }
    except psycopg.Error as e:
        return {
            "success": False,
            "error": f"Database error: {e}"
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }

if __name__ == "__main__":
    import json
    response = get_all_chats(
        user_uuid="842445ef-0b38-4300-b224-1f9f686dfa2f"
    )
    print(json.dumps(response, indent=4))
