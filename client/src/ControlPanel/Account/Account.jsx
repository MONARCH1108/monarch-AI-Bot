import { useState } from "react";
import { Button, Input, Alert } from "antd";
import {
    UserOutlined,
    IdcardOutlined,
    CopyOutlined,
    CheckOutlined
} from "@ant-design/icons";
import { signup, login } from "./auth";
import "./Account.css";

function Account({ onAuthenticated }) {
    const [mode, setMode] = useState("login");
    const [username, setUsername] = useState("");
    const [userUUID, setUserUUID] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [copied, setCopied] = useState(false);

    // BLOCK 1: SIGNUP / LOGIN
    const handleSubmit = async (e) => {
        if (e?.preventDefault) e.preventDefault();
        setError("");
        setSuccess("");
        setCopied(false);
        setLoading(true);

        try {
            if (mode === "signup") {
                const response = await signup(username);

                // Extract user details from nested API response
                const createdUser = response.user;
                if (!createdUser?.user_uuid) {
                    throw new Error("Signup succeeded, but UUID was not returned.");
                }
                setUserUUID(createdUser.user_uuid);
                setUsername(createdUser.username);
                setSuccess(
                    "Account created successfully. Copy and save your UUID."
                );
            } else {
                const response = await login(username, userUUID);

                // Extract authenticated user details
                const authenticatedUser = response.user || response;
                setSuccess("Login successful! Welcome to Monarch.");
                onAuthenticated?.(authenticatedUser);
            }
        } catch (err) {
            setError(err.message || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    // BLOCK 2: COPY UUID
    const handleCopyUUID = async () => {
        try {
            await navigator.clipboard.writeText(userUUID);
            setCopied(true);
            setError("");
        } catch {
            setError("Unable to copy UUID. Please copy it manually.");
        }
    };

    // BLOCK 3: MODE SWITCH
    const switchMode = (nextMode) => {
        setMode(nextMode);
        setError("");
        setSuccess("");
        setCopied(false);
    };

    // BLOCK 4: ENTER KEY SHORTCUT
    const handleKeyDown = (event) => {
        if (event.key === "Enter") {
            const canSubmit = username.trim() && (mode === "signup" || userUUID.trim());
            if (canSubmit && !loading) {
                handleSubmit(event);
            }
        }
    };

    return (
        <div className="account-container">

            {/* BLOCK 5: ACCOUNT HEADING */}
            <div className="account-heading">
                <h2>
                    {mode === "signup" ? "Create an Account" : "Welcome Back"}
                </h2>
                <p>
                    {mode === "signup"
                        ? "Create your Monarch guest account to get started."
                        : "Enter your credentials to continue to Monarch."}
                </p>
            </div>

            {/* BLOCK 6: ACCOUNT FORM */}
            <form className="account-form" onSubmit={handleSubmit}>
                <div className="auth-field-group">
                    <label className="auth-field-label" htmlFor="auth-username">
                        Username
                    </label>
                    <Input
                        id="auth-username"
                        prefix={<UserOutlined className="auth-input-icon" />}
                        placeholder="Enter your username"
                        value={username}
                        onChange={(event) => setUsername(event.target.value)}
                        onKeyDown={handleKeyDown}
                        disabled={loading}
                        autoComplete="username"
                    />
                </div>

                {mode === "login" && (
                    <div className="auth-field-group">
                        <label className="auth-field-label" htmlFor="auth-uuid">
                            User UUID
                        </label>
                        <Input
                            id="auth-uuid"
                            prefix={<IdcardOutlined className="auth-input-icon" />}
                            placeholder="Enter your UUID"
                            value={userUUID}
                            onChange={(event) => setUserUUID(event.target.value)}
                            onKeyDown={handleKeyDown}
                            disabled={loading}
                            autoComplete="off"
                        />
                    </div>
                )}

                <Button
                    type="primary"
                    block
                    htmlType="submit"
                    loading={loading}
                    className="auth-submit-btn"
                    disabled={
                        !username.trim() ||
                        (mode === "login" && !userUUID.trim()) ||
                        loading
                    }
                >
                    {mode === "signup" ? "Create Account" : "Login"}
                </Button>

                {mode === "signup" && !userUUID && (
                    <p className="auth-helper-note">
                        A unique 24-hour guest UUID will be automatically generated for your account.
                    </p>
                )}
            </form>

            {/* BLOCK 7: SIGNUP UUID DISPLAY */}
            {mode === "signup" && userUUID && (
                <div className="account-uuid-section">
                    <div className="account-uuid-heading">
                        <IdcardOutlined />
                        <span>Your Account UUID</span>
                    </div>

                    <p>
                        This UUID is required whenever you log in.
                        Save it somewhere safe.
                    </p>

                    <div className="account-uuid-copy">
                        <Input
                            value={userUUID}
                            readOnly
                        />

                        <Button
                            type="primary"
                            icon={
                                copied
                                    ? <CheckOutlined />
                                    : <CopyOutlined />
                            }
                            onClick={handleCopyUUID}
                        >
                            {copied ? "Copied" : "Copy"}
                        </Button>
                    </div>
                </div>
            )}

            {/* BLOCK 8: SUCCESS / ERROR ALERTS */}
            {error && (
                <Alert
                    message={error}
                    type="error"
                    showIcon
                    className="auth-alert"
                />
            )}

            {success && (
                <Alert
                    message={success}
                    type="success"
                    showIcon
                    className="auth-alert"
                />
            )}

            {/* BLOCK 9: BOTTOM MODE SWITCH PROMPT */}
            <div className="auth-switch-prompt">
                {mode === "login" ? (
                    <p>
                        Don't have an account?{" "}
                        <button
                            type="button"
                            className="auth-switch-link"
                            onClick={() => switchMode("signup")}
                            disabled={loading}
                        >
                            Create one
                        </button>
                    </p>
                ) : (
                    <p>
                        Already have an account?{" "}
                        <button
                            type="button"
                            className="auth-switch-link"
                            onClick={() => switchMode("login")}
                            disabled={loading}
                        >
                            Log in
                        </button>
                    </p>
                )}
            </div>

        </div>
    );
}

export default Account;
