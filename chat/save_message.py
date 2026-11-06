from auth.database import get_db_connection
import psycopg

def save_message(
    user_uuid: str,
    chat_id: str,
    question: str,
    answer: str,
    model: str
):
    try:
        if not user_uuid:
            raise ValueError("User UUID is required")
        if not chat_id:
            raise ValueError("Chat ID is required")
        if not question:
            raise ValueError("Question is required")
        if not answer:
            raise ValueError("Answer is required")
        if not model:
            raise ValueError("Model is required")
        with get_db_connection() as connection:
            with connection.cursor() as cursor:
                cursor.execute(
                    """
                    INSERT INTO messages (
                        user_uuid,
                        chat_id,
                        question,
                        answer,
                        model
                    )
                    VALUES (%s, %s, %s, %s, %s)
                    RETURNING message_id, user_uuid, chat_id,
                              question, answer, model, created_at
                    """,
                    (user_uuid, chat_id, question, answer, model)
                )

                message = cursor.fetchone()

                cursor.execute(
                    """
                    UPDATE conversations
                    SET updated_at = NOW()
                    WHERE chat_id = %s
                    AND user_uuid = %s
                    """,
                    (chat_id, user_uuid)
                )

                return {
                    "success": True,
                    "message": {
                        "message_id": str(message[0]),
                        "user_uuid": str(message[1]),
                        "chat_id": str(message[2]),
                        "question": message[3],
                        "answer": message[4],
                        "model": message[5],
                        "created_at": message[6].isoformat()
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
    response = save_message(
        user_uuid="13a6aaf9-a69a-4b4c-915b-cd80093552dd",
        chat_id="68eb0baf-d8ce-4ee5-8df4-d078b1a831bd",
        question="What is artificial intelligence?",
        answer="Artificial intelligence is the simulation of human intelligence by machines.",
        model="openai/gpt-oss-20b"
    )
    print(json.dumps(response, indent=4))