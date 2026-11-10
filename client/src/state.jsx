
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
const SESSION_STORAGE_KEY = "monarch_ai_session";

// BLOCK 1: READ SAVED SESSION
const getSavedSession = () => {

    try {
        const savedSession = localStorage.getItem(SESSION_STORAGE_KEY);

        if (!savedSession) return {};

        const parsedSession = JSON.parse(savedSession);

        return {
            user: parsedSession.user || null,
            selectedChatId: parsedSession.selectedChatId || null,
            selectedModel: parsedSession.selectedModel || DEFAULT_MODEL
        };

    } catch (error) {
        console.error("Unable to restore saved session:", error);
        return {};
    }
};

// BLOCK 2: CHECK AUTHENTICATION ERRORS
const isAuthenticationError = (error) => {
    return error.status === 401 || error.status === 403;
};

function useAppState() {

    // BLOCK 3: INITIALIZE SAVED SESSION
    const [initialSession] = useState(getSavedSession);

    // BLOCK 4: USER AUTHENTICATION STATE
    const [user, setUser] = useState(initialSession.user);

    // BLOCK 5: CONVERSATION STATES
    const [conversations, setConversations] = useState([]);

    const [selectedChatId, setSelectedChatId] = useState(
        initialSession.selectedChatId
    );

    const [chatsLoading, setChatsLoading] = useState(false);
    const [chatsError, setChatsError] = useState("");

    // BLOCK 6: CHAT HISTORY STATES
    const [chatHistory, setChatHistory] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [historyError, setHistoryError] = useState("");

    // BLOCK 7: MESSAGE SENDING STATE
    const [sending, setSending] = useState(false);
    const [sendingError, setSendingError] = useState("");

    // BLOCK 8: MODEL STATES
    const [availableModels, setAvailableModels] = useState([]);

    const [selectedModel, setSelectedModel] = useState(
        initialSession.selectedModel
    );

    const [modelsLoading, setModelsLoading] = useState(false);
    const [modelsError, setModelsError] = useState("");

    // BLOCK 9: PERSIST APPLICATION SESSION
    useEffect(() => {

        if (!user) {
            localStorage.removeItem(SESSION_STORAGE_KEY);
            return;
        }

        const session = {
            user,
            selectedChatId,
            selectedModel
        };

        try {
            localStorage.setItem(
                SESSION_STORAGE_KEY,
                JSON.stringify(session)
            );
        } catch (error) {
            console.error("Unable to save session:", error);
        }

    }, [user, selectedChatId, selectedModel]);

    // BLOCK 10: FETCH AVAILABLE MODELS
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

                // Keep every model returned by the API.
                const allModels = response.models || [];

                setAvailableModels(allModels);

                const selectedModelExists = allModels.some(
                    (model) => model.id === selectedModel
                );

                if (!selectedModelExists) {

                    const defaultModelExists = allModels.some(
                        (model) => model.id === DEFAULT_MODEL
                    );

                    if (defaultModelExists) {
                        setSelectedModel(DEFAULT_MODEL);
                    } else if (allModels.length > 0) {
                        setSelectedModel(allModels[0].id);
                    } else {
                        setModelsError("No models are available.");
                    }
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

    // BLOCK 11: CLEAR EXPIRED SESSION
    const handleSessionExpired = () => {

        localStorage.removeItem(SESSION_STORAGE_KEY);

        setUser(null);

        setConversations([]);
        setSelectedChatId(null);
        setChatHistory([]);

        setChatsError("");
        setHistoryError("");
        setSendingError("");

        setChatsLoading(false);
        setHistoryLoading(false);
        setSending(false);
    };

    // BLOCK 12: AUTHENTICATION SUCCESS
    const handleAuthenticated = (userData) => {

        setUser(userData);

        setConversations([]);
        setSelectedChatId(null);
        setChatHistory([]);

        setChatsError("");
        setHistoryError("");
        setSendingError("");

        setChatsLoading(false);
        setHistoryLoading(false);
        setSending(false);
    };
 
    // BLOCK 13: RESTORE / FETCH CONVERSATIONS
    useEffect(() => {

        if (!user?.user_uuid) {
            setConversations([]);
            setChatsLoading(false);
            return;
        }

        const controller = new AbortController();

        const fetchChats = async () => {

            setChatsLoading(true);
            setChatsError("");

            try {

                const response = await getAllChats(
                    user.user_uuid,
                    controller.signal
                );

                if (controller.signal.aborted) return;

                setConversations(response.conversations || []);

            } catch (error) {

                if (controller.signal.aborted) return;

                if (isAuthenticationError(error)) {
                    handleSessionExpired();
                    return;
                }

                setChatsError(
                    error.message || "Unable to load conversations."
                );

            } finally {

                if (!controller.signal.aborted) {
                    setChatsLoading(false);
                }
            }
        };

        // Allow StrictMode's initial cleanup to finish
        // before starting the API request.
        const requestTimer = setTimeout(() => {
            if (!controller.signal.aborted) {
                fetchChats();
            }
        }, 0);

        return () => {
            clearTimeout(requestTimer);
            controller.abort();
        };

    }, [user?.user_uuid]);


    // BLOCK 14: HANDLE NEW CHAT
    const handleNewChat = () => {

        setSelectedChatId(null);
        setChatHistory([]);

        setHistoryError("");
        setSendingError("");
        setHistoryLoading(false);
    };

    // BLOCK 15: HANDLE CONVERSATION SELECTION
    const handleSelectChat = (chatId) => {

        if (chatId === selectedChatId) return;

        setSelectedChatId(chatId);

        setChatHistory([]);
        setHistoryError("");
        setSendingError("");
    };

    // BLOCK 16: FETCH CHAT HISTORY WHEN SELECTION CHANGES
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

                if (isAuthenticationError(error)) {
                    handleSessionExpired();
                    return;
                }

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

    // BLOCK 17: SEND CHAT MESSAGE
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

        // Capture the current conversation and model.
        const currentChatId = selectedChatId;
        const currentModel = selectedModel;
        const currentUser = user;

        try {

            const response = await sendChatMessage({
                user_uuid: currentUser.user_uuid,
                chat_id: currentChatId,
                model: currentModel,
                message
            });

            // BLOCK 18: NORMALIZE API RESPONSE
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

            // BLOCK 19: UPDATE SELECTED CONVERSATION
            if (currentChatId !== returnedChatId) {
                setSelectedChatId(returnedChatId);
            }

            // BLOCK 20: UPDATE CHAT HISTORY
            const newMessage = {
                question: message,
                answer,
                model: response.model || currentModel,
                created_at: response.created_at || new Date().toISOString()
            };

            setChatHistory((previousHistory) => [
                ...previousHistory,
                newMessage
            ]);

            // BLOCK 21: REFRESH SIDEBAR CONVERSATIONS
            const chatsResponse = await getAllChats(
                currentUser.user_uuid
            );

            setConversations(chatsResponse.conversations || []);

            return true;

        } catch (error) {

            if (isAuthenticationError(error)) {
                handleSessionExpired();
                return false;
            }

            setSendingError(
                error.message || "Unable to send your message."
            );

            return false;

        } finally {
            setSending(false);
        }
    };

    // BLOCK 22: LOGOUT
    const handleLogout = () => {

        // Remove the persisted session immediately.
        localStorage.removeItem(SESSION_STORAGE_KEY);

        setUser(null);

        setConversations([]);
        setSelectedChatId(null);
        setChatHistory([]);

        setChatsError("");
        setHistoryError("");
        setSendingError("");

        setChatsLoading(false);
        setHistoryLoading(false);
        setSending(false);

        // Reset model selection.
        setSelectedModel(DEFAULT_MODEL);
    };

    // BLOCK 23: SELECTED CONVERSATION DETAILS
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

    // BLOCK 24: EXPOSE APPLICATION STATE
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
        handleSendMessage,
        handleLogout
    };
}

export default useAppState;
