
import { useState, useEffect } from "react";

import {
    getAllChats,
    getChatHistory
} from "./ControlPanel/Account/auth";

import {
    getAvailableModels,
    sendChatMessage
} from "./ChatArea/chatApi";

const DEFAULT_MODEL = "openai/gpt-oss-20b";

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

    // BLOCK 4: MESSAGE SENDING STATE
    const [sending, setSending] = useState(false);
    const [sendingError, setSendingError] = useState("");

    // BLOCK 5: MODEL STATES
    const [availableModels, setAvailableModels] = useState([]);
    const [selectedModel, setSelectedModel] = useState(DEFAULT_MODEL);

    const [modelsLoading, setModelsLoading] = useState(false);
    const [modelsError, setModelsError] = useState("");

    // BLOCK 6: FETCH AVAILABLE MODELS
    useEffect(() => {

        const controller = new AbortController();

        const fetchModels = async () => {

            setModelsLoading(true);
            setModelsError("");

            try {

                const response = await getAvailableModels(
                    controller.signal
                );

                if (controller.signal.aborted) return;

                const activeModels = response.models.filter(
                    (model) => model.active
                );

                setAvailableModels(activeModels);

                const defaultModelExists = activeModels.some(
                    (model) => model.id === DEFAULT_MODEL
                );

                if (defaultModelExists) {

                    setSelectedModel(DEFAULT_MODEL);

                } else if (activeModels.length > 0) {

                    setSelectedModel(activeModels[0].id);

                } else {

                    setModelsError("No active models are available.");
                }

            } catch (error) {

                if (controller.signal.aborted) return;

                setModelsError(
                    error.message || "Unable to load available models."
                );

            } finally {

                if (!controller.signal.aborted) {
                    setModelsLoading(false);
                }
            }
        };

        fetchModels();

        return () => {
            controller.abort();
        };

    }, []);

    // BLOCK 7: AUTHENTICATION SUCCESS
    const handleAuthenticated = async (userData) => {

        setUser(userData);

        setConversations([]);
        setSelectedChatId(null);
        setChatHistory([]);

        setChatsError("");
        setHistoryError("");
        setSendingError("");

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

    // BLOCK 8: HANDLE NEW CHAT
    const handleNewChat = () => {

        setSelectedChatId(null);
        setChatHistory([]);

        setHistoryError("");
        setSendingError("");
        setHistoryLoading(false);
        setSending(false);
    };

    // BLOCK 9: HANDLE CONVERSATION SELECTION
    const handleSelectChat = (chatId) => {

        if (chatId === selectedChatId) return;

        setSelectedChatId(chatId);

        setChatHistory([]);
        setHistoryError("");
        setSendingError("");
    };

    // BLOCK 10: FETCH CHAT HISTORY WHEN SELECTION CHANGES
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

    // BLOCK 11: SEND CHAT MESSAGE
    const handleSendMessage = async (message) => {

        if (!user?.user_uuid) {
            setSendingError("Please sign in before sending a message.");
            return false;
        }

        if (sending) {
            return false;
        }

        if (!selectedModel) {
            setSendingError("Please select an available model.");
            return false;
        }

        setSending(true);
        setSendingError("");
        setHistoryError("");

        // Keep the selected conversation captured for this request.
        const currentChatId = selectedChatId;

        try {

            const response = await sendChatMessage({
                user_uuid: user.user_uuid,
                chat_id: currentChatId,
                model: selectedModel,
                message
            });

            // BLOCK 12: NORMALIZE API RESPONSE
            const returnedChatId =
                response.chat_id ||
                response.data?.chat_id ||
                currentChatId;

            const answer =
                response.answer ||
                response.response ||
                response.data?.answer ||
                response.data?.response;

            if (!returnedChatId) {
                throw new Error(
                    "Chat API did not return a conversation ID."
                );
            }

            if (typeof answer !== "string") {
                throw new Error(
                    "Chat API response does not contain a valid answer."
                );
            }

            // BLOCK 13: UPDATE SELECTED CONVERSATION
            if (currentChatId !== returnedChatId) {
                setSelectedChatId(returnedChatId);
            }

            // BLOCK 14: UPDATE CHAT HISTORY
            const newMessage = {
                question: message,
                answer,
                model: response.model || selectedModel,
                created_at: response.created_at || new Date().toISOString()
            };

            setChatHistory((previousHistory) => [
                ...previousHistory,
                newMessage
            ]);

            // BLOCK 15: REFRESH SIDEBAR CONVERSATIONS
            const chatsResponse = await getAllChats(user.user_uuid);

            setConversations(chatsResponse.conversations || []);

            return true;

        } catch (error) {

            setSendingError(
                error.message || "Unable to send your message."
            );

            return false;

        } finally {
            setSending(false);
        }
    };

    // BLOCK 16: SELECTED CONVERSATION DETAILS
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

    // BLOCK 17: EXPOSE APPLICATION STATE
    return {
        user,

        conversations,
        selectedChatId,

        chatsLoading,
        chatsError,

        chatHistory,
        historyLoading,
        historyError,

        sending,
        sendingError,

        availableModels,
        selectedModel,
        setSelectedModel,
        modelsLoading,
        modelsError,

        selectedChatTitle,

        handleAuthenticated,
        handleNewChat,
        handleSelectChat,
        handleSendMessage
    };
}

export default useAppState;
