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
    const handleSubmit = async () => {
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

    return (
        <div className="account-container">

            {/* BLOCK 4: ACCOUNT HEADING */}
            <div className="account-heading">
                <h3>
                    {mode === "signup" ? "Create Account" : "Welcome Back"}
                </h3>

                <p>
                    {mode === "signup"
                        ? "Create your Monarch guest account."
                        : "Enter your account credentials to continue."}
                </p>
            </div>

            {/* BLOCK 5: MODE SWITCH */}
            <div className="account-mode-switch">
                <Button
                    type={mode === "login" ? "primary" : "text"}
                    onClick={() => switchMode("login")}
                    disabled={loading}
                >
                    Login
                </Button>

                <Button
                    type={mode === "signup" ? "primary" : "text"}
                    onClick={() => switchMode("signup")}
                    disabled={loading}
                >
                    Sign Up
                </Button>
            </div>

            {/* BLOCK 6: ACCOUNT FORM */}
            <div className="account-form">
                <Input
                    prefix={<UserOutlined />}
                    placeholder="Username"
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    disabled={loading}
                />

                {mode === "login" && (
                    <Input
                        prefix={<IdcardOutlined />}
                        placeholder="User UUID"
                        value={userUUID}
                        onChange={(event) => setUserUUID(event.target.value)}
                        disabled={loading}
                    />
                )}

                <Button
                    type="primary"
                    block
                    loading={loading}
                    onClick={handleSubmit}
                    disabled={
                        !username.trim() ||
                        (mode === "login" && !userUUID.trim())
                    }
                >
                    {mode === "signup" ? "Create Account" : "Login"}
                </Button>
            </div>

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

            {/* BLOCK 8: SUCCESS / ERROR MESSAGES */}
            {error && (
                <Alert
                    message={error}
                    type="error"
                    showIcon
                />
            )}

            {success && (
                <Alert
                    message={success}
                    type="success"
                    showIcon
                />
            )}

        </div>
    );
}

export default Account;
