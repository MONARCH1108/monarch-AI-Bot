from uuid import UUID

import psycopg

from auth.database import get_db_connection
from chat.create_chat import create_chat
from chat.get_history import get_chat_history
from chat.save_message import save_message
from LLM.groq_chat import groq_chat


def chat_service(
    user_uuid: str,
    model: str,
    message: str,
    chat_id: str = None
):
    try:
        # 1. Validate inputs
        if not user_uuid:
            raise ValueError("User UUID is required")

        if not model or not model.strip():
            raise ValueError("Model is required")

        if not message or not message.strip():
            raise ValueError("Message is required")

        try:
            user_uuid = str(UUID(user_uuid))
        except ValueError:
            raise ValueError("Invalid user UUID format.")

        # 2. Validate user and 24-hour eligibility
        with get_db_connection() as connection:
            with connection.cursor() as cursor:
                cursor.execute(
                    """
                    SELECT
                        (created_at > NOW() - INTERVAL '24 hours')
                    FROM users
                    WHERE user_uuid = %s
                    """,
                    (user_uuid,)
                )

                user = cursor.fetchone()

                if not user:
                    return {
                        "success": False,
                        "error": "User not found."
                    }

                if not user[0]:
                    return {
                        "success": False,
                        "error": "Account expired. The 24-hour signup period has ended."
                    }

                # 3. Verify existing conversation ownership
                if chat_id is not None:
                    try:
                        chat_id = str(UUID(chat_id))
                    except ValueError:
                        raise ValueError("Invalid chat ID format.")

                    cursor.execute(
                        """
                        SELECT chat_id
                        FROM conversations
                        WHERE chat_id = %s
                        AND user_uuid = %s
                        """,
                        (chat_id, user_uuid)
                    )

                    conversation = cursor.fetchone()

                    if not conversation:
                        return {
                            "success": False,
                            "error": "Conversation not found or does not belong to this user."
                        }

        # 4. Create a new conversation if chat_id is not provided
        if chat_id is None:
            chat_response = create_chat(user_uuid)

            if not chat_response["success"]:
                return chat_response

            chat_id = chat_response["chat"]["chat_id"]

        # 5. Retrieve conversation history
        history_response = get_chat_history(
            user_uuid=user_uuid,
            chat_id=chat_id
        )

        if not history_response["success"]:
            return history_response

        history = history_response["history"]

        # 6. Generate response using Groq
        llm_response = groq_chat(
            model=model,
            message=message,
            history=history
        )

        if not llm_response["success"]:
            return llm_response

        answer = llm_response["message"]
        actual_model = llm_response["model"]

        # 7. Save the new question-answer pair
        save_response = save_message(
            user_uuid=user_uuid,
            chat_id=chat_id,
            question=message,
            answer=answer,
            model=actual_model
        )

        if not save_response["success"]:
            return save_response

        # 8. Return the complete response
        return {
            "success": True,
            "user_uuid": user_uuid,
            "chat_id": chat_id,
            "question": message,
            "answer": answer,
            "model": actual_model,
            "usage": llm_response["usage"]
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
            "error": f"Unexpected error: {e}"
        }


if __name__ == "__main__":
    import json

    response = chat_service(
        user_uuid="13a6aaf9-a69a-4b4c-915b-cd80093552dd",
        model="openai/gpt-oss-20b",
        message="can you give an example?",
        chat_id="f2157002-8565-4a9d-8528-016e785ad36f"
    )

    print(json.dumps(response, indent=4))
