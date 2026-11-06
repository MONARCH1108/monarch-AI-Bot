from uuid import UUID
from chat.get_history import get_chat_history

def chat_history(user_uuid: str, chat_id: str):
    try:
        if not user_uuid:
            raise ValueError("User UUID is required.")
        if not chat_id:
            raise ValueError("Chat ID is required.")
        try:
            user_uuid = str(UUID(user_uuid))
        except ValueError:
            raise ValueError("Invalid user UUID format.")
        try:
            chat_id = str(UUID(chat_id))
        except ValueError:
            raise ValueError("Invalid chat ID format.")
        response = get_chat_history(
            user_uuid=user_uuid,
            chat_id=chat_id
        )
        return response
    except ValueError as e:
        return {
            "success": False,
            "error": str(e)
        }
    except Exception:
        return {
            "success": False,
            "error": "An unexpected error occurred while retrieving chat history."
        }

if __name__ == "__main__":
    import json
    result = chat_history(
        user_uuid="13a6aaf9-a69a-4b4c-915b-cd80093552dd",
        chat_id="f2157002-8565-4a9d-8528-016e785ad36f"
    )
    print(json.dumps(result, indent=4))
