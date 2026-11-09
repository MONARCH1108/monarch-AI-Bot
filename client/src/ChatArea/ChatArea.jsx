import { useState } from "react";
import {
    Avatar,
    Button,
    Input,
    Tooltip
} from "antd";
import {
    RobotOutlined,
    UserOutlined,
    CodeOutlined,
    BulbOutlined,
    FileTextOutlined,
    ReadOutlined,
    PlusOutlined,
    PaperClipOutlined,
    SendOutlined
} from "@ant-design/icons";
import "./ChatArea.css";
const { TextArea } = Input;

function ChatArea({
    chatTitle = null,
    messages = [],
    loading = false,
    error = "",
    onSend
}) {
    const [message, setMessage] = useState("");

    // BLOCK 1: HANDLE MESSAGE INPUT
    const handleMessageChange = (event) => {
        setMessage(event.target.value);
    };

    // BLOCK 2: HANDLE MESSAGE SUBMISSION
    const handleSendMessage = () => {
        const cleanMessage = message.trim();
        if (!cleanMessage || !onSend) return;
        onSend(cleanMessage);
        setMessage("");
    };

    // BLOCK 3: HANDLE ENTER KEY
    const handleKeyDown = (event) => {
        if (
            event.key === "Enter" &&
            !event.shiftKey
        ) {
            event.preventDefault();
            handleSendMessage();
        }
    };

    // BLOCK 4: SUGGESTION CARDS
    const suggestions = [
        {
            icon: <CodeOutlined />,
            title: "Code & Development",
            description: "Build, debug and understand code"
        },
        {
            icon: <BulbOutlined />,
            title: "Brainstorm Ideas",
            description: "Explore ideas and creative solutions"
        },
        {
            icon: <FileTextOutlined />,
            title: "Writing & Analysis",
            description: "Create, improve and analyse content"
        },
        {
            icon: <ReadOutlined />,
            title: "Learn Something",
            description: "Understand complex topics"
        }
    ];

    // BLOCK 5: CHAT EMPTY STATE
    const showWelcomeScreen =
        !chatTitle && messages.length === 0;
    return (
        <div className="chat-area">

            {/* BLOCK 1: CHAT HEADER */}
            <header className="chat-header">
                <div className="chat-header-info">
                    <div className="chat-header-icon">
                        <RobotOutlined />
                    </div>

                    <div className="chat-header-details">
                        <span className="chat-header-title">
                            {chatTitle || "Monarch AI"}
                        </span>

                        <span className="chat-header-status">
                            <span className="status-indicator" />
                            AI Assistant
                        </span>
                    </div>
                </div>
            </header>

            {/* BLOCK 2: CHAT MESSAGE CONTAINER */}
            <main className="chat-content">
                {showWelcomeScreen ? (

                    /* BLOCK 3: WELCOME SCREEN */
                    <div className="chat-welcome">
                        <div className="welcome-icon">
                            <RobotOutlined />
                        </div>
                        <h1>
                            How can I help you today?
                        </h1>
                        <p className="welcome-description">
                            Ask questions, explore ideas, or work
                            through a problem with Monarch AI.
                        </p>
                        <div className="suggestion-grid">
                            {suggestions.map((item) => (
                                <div
                                    className="suggestion-card"
                                    key={item.title}
                                >
                                    <div className="suggestion-icon">
                                        {item.icon}
                                    </div>

                                    <div className="suggestion-content">
                                        <span className="suggestion-title">
                                            {item.title}
                                        </span>

                                        <span className="suggestion-description">
                                            {item.description}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                ) : (

                    /* BLOCK 4: CONVERSATION MESSAGES */
                    <div className="chat-messages">
                        {loading && (
                            <div className="chat-loading">
                                Loading conversation...
                            </div>
                        )}

                        {!loading && error && (
                            <div className="chat-error">
                                {error}
                            </div>
                        )}

                        {!loading &&
                            !error &&
                            messages.length === 0 && (
                                <div className="chat-loading">
                                    No messages in this conversation yet.
                                </div>
                            )}

                        {!loading &&
                            !error &&
                            messages.map((item, index) => (
                                <div
                                    className="message-pair"
                                    key={`${item.created_at || "message"}-${index}`}
                                >

                                    {/* USER MESSAGE */}
                                    <div className="message-row user-message">
                                        <div className="message-body">
                                            <div className="message-role">
                                                You
                                            </div>
                                            <div className="message-text">
                                                {item.question}
                                            </div>
                                        </div>

                                        <Avatar
                                            className="message-avatar user-avatar"
                                            icon={<UserOutlined />}
                                        />
                                    </div>

                                    {/* AI RESPONSE */}
                                    <div className="message-row assistant-message">
                                        <Avatar
                                            className="message-avatar assistant-avatar"
                                            icon={<RobotOutlined />}
                                        />
                                        <div className="message-body">
                                            <div className="message-role">
                                                Monarch AI
                                            </div>
                                            <div className="message-text">
                                                {item.answer}
                                            </div>
                                            {item.model && (
                                                <div className="message-model">
                                                    {item.model}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                </div>
                            ))}

                    </div>
                )}

            </main>

            {/* BLOCK 5: MESSAGE COMPOSER */}
            <footer className="chat-footer">
                <div className="message-composer">
                    <TextArea
                        className="message-input"
                        placeholder="Message Monarch AI..."
                        autoSize={{
                            minRows: 1,
                            maxRows: 5
                        }}
                        value={message}
                        onChange={handleMessageChange}
                        onKeyDown={handleKeyDown}
                    />
                    <div className="composer-actions">
                        <div className="composer-tools">
                            <Tooltip title="Add attachment">
                                <Button
                                    type="text"
                                    icon={<PaperClipOutlined />}
                                    disabled
                                />
                            </Tooltip>
                            <Tooltip title="More options">
                                <Button
                                    type="text"
                                    icon={<PlusOutlined />}
                                    disabled
                                />
                            </Tooltip>
                        </div>
                        <Tooltip title="Send message">
                            <Button
                                type="primary"
                                className="send-button"
                                icon={<SendOutlined />}
                                onClick={handleSendMessage}
                                disabled={
                                    !message.trim() || !onSend
                                }
                            />
                        </Tooltip>
                    </div>
                </div>
                <p className="chat-disclaimer">
                    Monarch AI can make mistakes. Verify important information.
                </p>
            </footer>
        </div>
    );
}

export default ChatArea;
