from auth.database import get_db_connection
import psycopg

def get_chat_history(user_uuid: str, chat_id: str):
    try:
        if not user_uuid:
            raise ValueError("User UUID is required")
        if not chat_id:
            raise ValueError("Chat ID is required")
        with get_db_connection() as connection:
            with connection.cursor() as cursor:
                cursor.execute(
                    """
                    SELECT question, answer, model, created_at
                    FROM messages
                    WHERE user_uuid = %s
                    AND chat_id = %s
                    ORDER BY created_at ASC
                    """,
                    (user_uuid, chat_id)
                )
                messages = cursor.fetchall()
                history = [
                    {
                        "question": row[0],
                        "answer": row[1],
                        "model": row[2],
                        "created_at": row[3].isoformat()
                    }
                    for row in messages
                ]
                return {
                    "success": True,
                    "chat_id": chat_id,
                    "user_uuid": user_uuid,
                    "total_messages": len(history),
                    "history": history
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
            "test": "Existing conversation",
            "user_uuid": "13a6aaf9-a69a-4b4c-915b-cd80093552dd",
            "chat_id": "REPLACE_WITH_EXISTING_CHAT_UUID"
        },
        {
            "test": "Empty user UUID",
            "user_uuid": "",
            "chat_id": "REPLACE_WITH_EXISTING_CHAT_UUID"
        },
        {
            "test": "Empty chat ID",
            "user_uuid": "13a6aaf9-a69a-4b4c-915b-cd80093552dd",
            "chat_id": ""
        }
    ]
    for test in test_cases:
        print(f"\n--- {test['test']} ---")
        response = get_chat_history(
            user_uuid=test["user_uuid"],
            chat_id=test["chat_id"]
        )
        print(json.dumps(response, indent=4))