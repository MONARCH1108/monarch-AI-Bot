const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_TOKEN = import.meta.env.VITE_API_TOKEN;

const REQUEST_TIMEOUT = 15000;

// Prevent simultaneous duplicate signup requests
const pendingSignups = new Map();
const pendingLogins = new Map();

export async function signup(username, externalSignal) {
    // BLOCK 1: INPUT VALIDATION
    const cleanUsername = username?.trim();

    if (!cleanUsername) {
        throw new Error("Username is required");
    }
    if (!API_BASE_URL || !API_TOKEN) {
        throw new Error("API configuration is missing");
    }
    // BLOCK 2: DUPLICATE REQUEST PROTECTION
    if (pendingSignups.has(cleanUsername)) {
        throw new Error("Signup request is already in progress");
    }
    // BLOCK 3: REQUEST CONTROLLER
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
        controller.abort(
            new DOMException("Request timed out", "TimeoutError")
        );
    }, REQUEST_TIMEOUT);
    const abortExternal = () => {
        controller.abort(externalSignal.reason);
    };
    if (externalSignal?.aborted) {
        clearTimeout(timeoutId);
        throw externalSignal.reason ??
            new DOMException("Request cancelled", "AbortError");
    }
    externalSignal?.addEventListener("abort", abortExternal, {
        once: true
    });

    // BLOCK 4: SIGNUP REQUEST
    const requestPromise = (async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/signup`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${API_TOKEN}`
                },
                body: JSON.stringify({
                    username: cleanUsername
                }),
                signal: controller.signal
            });

            // BLOCK 5: SAFE RESPONSE PARSING
            const contentType = response.headers.get("content-type") || "";
            let data;
            if (contentType.includes("application/json")) {
                try {
                    data = await response.json();
                } catch {
                    throw new Error("Server returned invalid JSON");
                }
            } else {
                data = await response.text();
            }

            // BLOCK 6: HTTP ERROR HANDLING
            if (!response.ok) {
                const message =
                    typeof data?.detail === "string"
                        ? data.detail
                        : typeof data?.message === "string"
                            ? data.message
                            : `Signup failed (${response.status})`;
                const error = new Error(message);
                error.status = response.status;
                throw error;
            }
            return data;

        } catch (error) {
            // BLOCK 7: NETWORK AND CANCELLATION ERRORS
            if (error.name === "AbortError") {
                throw new Error("Signup request was cancelled");
            }
            if (error.name === "TimeoutError") {
                throw new Error("Signup request timed out");
            }
            if (error instanceof TypeError) {
                throw new Error("Unable to connect to the server");
            }
            throw error;
        } finally {
            clearTimeout(timeoutId);
            externalSignal?.removeEventListener(
                "abort",
                abortExternal
            );
            pendingSignups.delete(cleanUsername);
        }
    })();
    pendingSignups.set(cleanUsername, requestPromise);
    return requestPromise;
}

export async function login(username, user_uuid, externalSignal) {
    // BLOCK 1: INPUT VALIDATION
    const cleanUsername = username?.trim();
    const cleanUUID = user_uuid?.trim();

    if (!cleanUsername) {
        throw new Error("Username is required");
    }
    if (!cleanUUID) {
        throw new Error("User UUID is required");
    }
    if (!API_BASE_URL || !API_TOKEN) {
        throw new Error("API configuration is missing");
    }

    // BLOCK 2: DUPLICATE REQUEST PROTECTION
    if (pendingLogins.has(cleanUsername)) {
        throw new Error("Login request is already in progress");
    }

    // BLOCK 3: REQUEST CONTROLLER
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
        controller.abort(
            new DOMException("Request timed out", "TimeoutError")
        );
    }, REQUEST_TIMEOUT);
    const abortExternal = () => {
        controller.abort(externalSignal.reason);
    };
    if (externalSignal?.aborted) {
        clearTimeout(timeoutId);
        throw externalSignal.reason ??
            new DOMException("Request cancelled", "AbortError");
    }
    externalSignal?.addEventListener("abort", abortExternal, {
        once: true
    });

    // BLOCK 4: LOGIN REQUEST
    const requestPromise = (async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${API_TOKEN}`
                },
                body: JSON.stringify({
                    username: cleanUsername,
                    user_uuid: cleanUUID
                }),
                signal: controller.signal
            });

            // BLOCK 5: SAFE RESPONSE PARSING
            const contentType = response.headers.get("content-type") || "";
            let data;
            if (contentType.includes("application/json")) {
                try {
                    data = await response.json();
                } catch {
                    throw new Error("Server returned invalid JSON");
                }
            } else {
                data = await response.text();
            }

            // BLOCK 6: HTTP ERROR HANDLING
            if (!response.ok) {
                const message =
                    typeof data?.detail === "string"
                        ? data.detail
                        : typeof data?.message === "string"
                            ? data.message
                            : `Login failed (${response.status})`;
                const error = new Error(message);
                error.status = response.status;
                throw error;
            }
            return data;

        } catch (error) {
            // BLOCK 7: NETWORK AND CANCELLATION ERRORS
            if (error.name === "AbortError") {
                throw new Error("Login request was cancelled");
            }
            if (error.name === "TimeoutError") {
                throw new Error("Login request timed out");
            }
            if (error instanceof TypeError) {
                throw new Error("Unable to connect to the server");
            }
            throw error;

        } finally {
            clearTimeout(timeoutId);
            externalSignal?.removeEventListener(
                "abort",
                abortExternal
            );
            pendingLogins.delete(cleanUsername);
        }
    })();
    pendingLogins.set(cleanUsername, requestPromise);
    return requestPromise;
}


// =========================================
// BLOCK 3: FETCH ALL USER CONVERSATIONS
// =========================================

const pendingChatRequests = new Map();

export async function getAllChats(user_uuid, externalSignal) {

    // BLOCK 1: INPUT VALIDATION
    const cleanUUID = user_uuid?.trim();

    if (!cleanUUID) {
        throw new Error("User UUID is required");
    }

    if (!API_BASE_URL || !API_TOKEN) {
        throw new Error("API configuration is missing");
    }

    // BLOCK 2: DUPLICATE REQUEST PROTECTION
    if (pendingChatRequests.has(cleanUUID)) {
        throw new Error("Chat list request is already in progress");
    }

    // BLOCK 3: REQUEST CONTROLLER
    const controller = new AbortController();

    const timeoutId = setTimeout(() => {
        controller.abort(
            new DOMException("Request timed out", "TimeoutError")
        );
    }, REQUEST_TIMEOUT);

    const abortExternal = () => {
        controller.abort(externalSignal.reason);
    };

    if (externalSignal?.aborted) {
        clearTimeout(timeoutId);

        throw externalSignal.reason ??
            new DOMException("Request cancelled", "AbortError");
    }

    externalSignal?.addEventListener("abort", abortExternal, {
        once: true
    });

    // BLOCK 4: FETCH ALL CHATS REQUEST
    const requestPromise = (async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/chats`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${API_TOKEN}`
                },
                body: JSON.stringify({
                    user_uuid: cleanUUID
                }),
                signal: controller.signal
            });

            // BLOCK 5: SAFE RESPONSE PARSING
            const contentType = response.headers.get("content-type") || "";

            let data;

            if (contentType.includes("application/json")) {
                try {
                    data = await response.json();
                } catch {
                    throw new Error("Server returned invalid JSON");
                }
            } else {
                data = await response.text();
            }

            // BLOCK 6: HTTP ERROR HANDLING
            if (!response.ok) {
                const message =
                    typeof data?.detail === "string"
                        ? data.detail
                        : typeof data?.message === "string"
                            ? data.message
                            : `Unable to fetch chats (${response.status})`;

                const error = new Error(message);
                error.status = response.status;

                throw error;
            }

            return data;

        } catch (error) {
            // BLOCK 7: NETWORK AND CANCELLATION ERRORS
            if (error.name === "AbortError") {
                throw new Error("Chat list request was cancelled");
            }

            if (error.name === "TimeoutError") {
                throw new Error("Chat list request timed out");
            }

            if (error instanceof TypeError) {
                throw new Error("Unable to connect to the server");
            }

            throw error;

        } finally {
            clearTimeout(timeoutId);

            externalSignal?.removeEventListener(
                "abort",
                abortExternal
            );

            pendingChatRequests.delete(cleanUUID);
        }
    })();

    pendingChatRequests.set(cleanUUID, requestPromise);

    return requestPromise;
}


// =========================================
// BLOCK 4: FETCH SELECTED CHAT HISTORY
// =========================================

export async function getChatHistory(user_uuid, chat_id, externalSignal) {

    // BLOCK 1: INPUT VALIDATION
    const cleanUUID = user_uuid?.trim();
    const cleanChatID = chat_id?.trim();
    if (!cleanUUID) {
        throw new Error("User UUID is required");
    }

    if (!cleanChatID) {
        throw new Error("Chat ID is required");
    }

    if (!API_BASE_URL || !API_TOKEN) {
        throw new Error("API configuration is missing");
    }

    // BLOCK 2: REQUEST CONTROLLER
    const controller = new AbortController();

    const timeoutId = setTimeout(() => {
        controller.abort(
            new DOMException("Request timed out", "TimeoutError")
        );
    }, REQUEST_TIMEOUT);

    const abortExternal = () => {
        controller.abort(externalSignal.reason);
    };

    if (externalSignal?.aborted) {
        clearTimeout(timeoutId);

        throw externalSignal.reason ??
            new DOMException("Request cancelled", "AbortError");
    }

    externalSignal?.addEventListener("abort", abortExternal, {
        once: true
    });

    // BLOCK 3: FETCH CHAT HISTORY REQUEST
    try {
        const response = await fetch(`${API_BASE_URL}/chat/history`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${API_TOKEN}`
            },
            body: JSON.stringify({
                user_uuid: cleanUUID,
                chat_id: cleanChatID
            }),
            signal: controller.signal
        });

        // BLOCK 4: SAFE RESPONSE PARSING
        const contentType = response.headers.get("content-type") || "";

        let data;

        if (contentType.includes("application/json")) {
            try {
                data = await response.json();
            } catch {
                throw new Error("Server returned invalid JSON");
            }
        } else {
            data = await response.text();
        }

        // BLOCK 5: HTTP ERROR HANDLING
        if (!response.ok) {
            const message =
                typeof data?.detail === "string"
                    ? data.detail
                    : typeof data?.message === "string"
                        ? data.message
                        : `Unable to fetch chat history (${response.status})`;

            const error = new Error(message);
            error.status = response.status;

            throw error;
        }

        return data;

    } catch (error) {

        // BLOCK 6: NETWORK AND CANCELLATION ERRORS
        if (error.name === "AbortError") {
            throw new Error("Chat history request was cancelled");
        }

        if (error.name === "TimeoutError") {
            throw new Error("Chat history request timed out");
        }

        if (error instanceof TypeError) {
            throw new Error("Unable to connect to the server");
        }

        throw error;

    } finally {

        // BLOCK 7: CLEANUP
        clearTimeout(timeoutId);

        externalSignal?.removeEventListener(
            "abort",
            abortExternal
        );
    }
}
