const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_TOKEN = import.meta.env.VITE_API_TOKEN;
const REQUEST_TIMEOUT = 30000;

// =========================================
// BLOCK 1: SEND CHAT MESSAGE
// =========================================

export async function sendChatMessage({
    user_uuid,
    message,
    model,
    chat_id = null,
    externalSignal
}) {

    // BLOCK 1: INPUT VALIDATION
    const cleanUUID = user_uuid?.trim();
    const cleanMessage = message?.trim();
    const cleanModel = model?.trim();
    const cleanChatID = chat_id?.trim();
    if (!cleanUUID) {
        throw new Error("User UUID is required");
    }
    if (!cleanMessage) {
        throw new Error("Message cannot be empty");
    }
    if (!cleanModel) {
        throw new Error("Model is required");
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

    // BLOCK 3: PREPARE REQUEST PAYLOAD
    const payload = {
        user_uuid: cleanUUID,
        model: cleanModel,
        message: cleanMessage
    };
    if (cleanChatID) {
        payload.chat_id = cleanChatID;
    }

    // BLOCK 4: SEND CHAT REQUEST
    try {
        const response = await fetch(`${API_BASE_URL}/chat`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${API_TOKEN}`
            },
            body: JSON.stringify(payload),
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
                        : `Chat request failed (${response.status})`;
            const error = new Error(message);
            error.status = response.status;
            throw error;
        }
        return data;

    } catch (error) {

        // BLOCK 7: NETWORK AND CANCELLATION ERRORS
        if (error.name === "AbortError") {
            throw new Error("Chat request was cancelled");
        }
        if (error.name === "TimeoutError") {
            throw new Error("Chat request timed out");
        }
        if (error instanceof TypeError) {
            throw new Error("Unable to connect to the server");
        }
        throw error;

    } finally {

        // BLOCK 8: CLEANUP
        clearTimeout(timeoutId);
        externalSignal?.removeEventListener(
            "abort",
            abortExternal
        );
    }
}

// =========================================
// BLOCK 2: GET AVAILABLE MODEL
// =========================================

export async function getAvailableModels(externalSignal) {
    if (!API_BASE_URL || !API_TOKEN) {
        throw new Error("API configuration is missing");
    }
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
    try {
        const response = await fetch(`${API_BASE_URL}/models`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${API_TOKEN}`
            },
            signal: controller.signal
        });
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
        if (!response.ok) {
            const message =
                typeof data?.detail === "string" ? data.detail :
                typeof data?.message === "string" ? data.message :
                `Models request failed (${response.status})`;

            const error = new Error(message);
            error.status = response.status;
            throw error;
        }
        if (!data?.success || !Array.isArray(data.models)) {
            throw new Error("Invalid models response from server");
        }
        return data;
    } catch (error) {
        console.error("MODELS API ERROR:", error);
        if (error.name === "AbortError") {
            throw new Error("Models request was cancelled");
        }
        if (error.name === "TimeoutError") {
            throw new Error("Models request timed out");
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
    }
}