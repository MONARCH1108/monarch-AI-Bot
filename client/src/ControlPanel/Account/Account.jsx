import { useState } from "react";
import { Button, Input, Alert } from "antd";
import { UserOutlined, IdcardOutlined } from "@ant-design/icons";
import { signup, login } from "./auth";
import "./Account.css";

function Account({ onAuthenticated }) {
    const [mode, setMode] = useState("login");
    const [username, setUsername] = useState("");
    const [userUUID, setUserUUID] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleSubmit = async () => {
        setError("");
        setSuccess("");
        setLoading(true);
        try {
            let response;
            if (mode === "signup") {
                response = await signup(username);
                setSuccess("Account created successfully. Save your UUID to log in.");
                setUserUUID(response.user_uuid || "");
            } else {
                response = await login(username, userUUID);
                onAuthenticated?.(response);
            }
        } catch (err) {
            setError(err.message || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    const switchMode = (nextMode) => {
        setMode(nextMode);
        setError("");
        setSuccess("");
    };
    return (
        <div className="account-container">
            <div className="account-heading">
                <h3>{mode === "signup" ? "Create Account" : "Welcome Back"}</h3>
                <p>
                    {mode === "signup"
                        ? "Create your Monarch guest account."
                        : "Enter your account credentials to continue."}
                </p>
            </div>
            <div className="account-mode-switch">
                <Button
                    type={mode === "login" ? "primary" : "text"}
                    onClick={() => switchMode("login")}
                >
                    Login
                </Button>

                <Button
                    type={mode === "signup" ? "primary" : "text"}
                    onClick={() => switchMode("signup")}
                >
                    Sign Up
                </Button>
            </div>

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
                    disabled={!username.trim() || (mode === "login" && !userUUID.trim())}
                >
                    {mode === "signup" ? "Create Account" : "Login"}
                </Button>

            </div>

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
