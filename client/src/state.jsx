import { useState, useEffect } from "react";
import {
    getAllChats,
    getChatHistory
} from "./ControlPanel/Account/auth";

function useAppState() {

    // BLOCK 1: USER AUTHENTICATION STATE
    const [user, setUser] = useState(null);

    // BLOCK 2: CONVERSATION STATES
    const [conversations, setConversations] = useState([]);
    const [selectedChatId, setSelectedChatId] = useState(null);

    const [chatsLoading, setChatsLoading] = useState(false);
    const [chatsError, setChatsError] = useState("");

    // BLOCK 3: CHAT HISTORY STATES
    const [chatHistory, setChatHistory] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [historyError, setHistoryError] = useState("");

    // BLOCK 4: AUTHENTICATION SUCCESS
    const handleAuthenticated = async (userData) => {
        setUser(userData);
        setConversations([]);
        setSelectedChatId(null);
        setChatHistory([]);
        setChatsError("");
        setHistoryError("");
        setChatsLoading(true);
        try {
            const response = await getAllChats(userData.user_uuid);
            setConversations(response.conversations || []);
        } catch (error) {
            setChatsError(
                error.message || "Unable to load conversations."
            );
        } finally {
            setChatsLoading(false);
        }
    };

    // BLOCK 5: HANDLE CONVERSATION SELECTION
    const handleSelectChat = (chatId) => {
        if (chatId === selectedChatId) return;
        setSelectedChatId(chatId);
    };

    // BLOCK 6: FETCH CHAT HISTORY WHEN SELECTION CHANGES
    useEffect(() => {
        if (!user?.user_uuid || !selectedChatId) {
            setChatHistory([]);
            setHistoryError("");
            setHistoryLoading(false);
            return;
        }
        const controller = new AbortController();
        const fetchHistory = async () => {
            setChatHistory([]);
            setHistoryError("");
            setHistoryLoading(true);
            try {
                const response = await getChatHistory(
                    user.user_uuid,
                    selectedChatId,
                    controller.signal
                );
                if (controller.signal.aborted) return;
                setChatHistory(response.history || []);
            } catch (error) {
                if (controller.signal.aborted) return;
                setHistoryError(
                    error.message ||
                    "Unable to load conversation history."
                );
            } finally {
                if (!controller.signal.aborted) {
                    setHistoryLoading(false);
                }
            }
        };
        fetchHistory();
        return () => {
            controller.abort();
        };

    }, [user?.user_uuid, selectedChatId]);

    // BLOCK 7: SELECTED CONVERSATION DETAILS
    const selectedConversation = conversations.find(
        (chat) => chat.chat_id === selectedChatId
    );
    const selectedChatTitle = selectedConversation?.title || (
        selectedConversation
            ? new Intl.DateTimeFormat("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }).format(new Date(selectedConversation.updated_at))
            : null
    );

    // BLOCK 8: EXPOSE APPLICATION STATE
    return {
        user,
        conversations,
        selectedChatId,
        chatsLoading,
        chatsError,
        chatHistory,
        historyLoading,
        historyError,
        selectedChatTitle,
        handleAuthenticated,
        handleSelectChat
    };
}

export default useAppState;
