
import { useState } from "react";
import { Layout, Menu, Button, Avatar, Tooltip } from "antd";

import {
    PlusOutlined,
    MessageOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    UserOutlined
} from "@ant-design/icons";

import "./Sidebar.css";
import monarchLogo from "../assets/monarch-logo.png";

const { Sider } = Layout;

// BLOCK 1: FORMAT CONVERSATION DATE
function formatChatDate(dateString) {
    if (!dateString) return "Untitled conversation";

    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
        return "Unknown date";
    }

    return new Intl.DateTimeFormat("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
    }).format(date);
}

function Sidebar({
    user = null,
    conversations = [],
    chatsLoading = false,
    chatsError = "",
    selectedChatId = null,
    onSelectChat,
    onNewChat
}) {
    const [collapsed, setCollapsed] = useState(false);

    // BLOCK 2: SORT CONVERSATIONS
    const sortedConversations = [...conversations].sort(
        (a, b) =>
            new Date(b.updated_at) - new Date(a.updated_at)
    );

    // BLOCK 3: CONVERSATION MENU ITEMS
    const chatItems = sortedConversations.map((chat) => ({
        key: chat.chat_id,
        icon: <MessageOutlined />,
        label: formatChatDate(chat.updated_at)
    }));

    // BLOCK 4: HANDLE CONVERSATION SELECTION
    const handleChatSelection = ({ key }) => {
        onSelectChat?.(key);
    };

    // BLOCK 5: HANDLE NEW CHAT
    const handleNewChat = () => {
        onNewChat?.();
    };

    // BLOCK 6: USER PROFILE DETAILS
    const username = user?.username || "Guest User";
    const accountStatus = user ? "Guest Account" : "Not signed in";

    return (
        <Sider
            motion={true}
            className="sidebar"
            width={250}
            collapsedWidth={80}
            collapsible
            collapsed={collapsed}
            trigger={null}
            theme="dark"
        >
            <div className="sidebar-container">

                {/* BLOCK 1: BRAND HEADER */}
                <div className="sidebar-header">
                    <div className="sidebar-brand">
                        <img
                            src={monarchLogo}
                            alt="Monarch Logo"
                            className="sidebar-logo"
                        />
                    </div>

                    <div className="sidebar-header-actions">
                        <Tooltip
                            title={
                                collapsed
                                    ? "Expand sidebar"
                                    : "Collapse sidebar"
                            }
                        >
                            <Button
                                type="text"
                                icon={
                                    collapsed
                                        ? <MenuUnfoldOutlined />
                                        : <MenuFoldOutlined />
                                }
                                onClick={() => setCollapsed(!collapsed)}
                            />
                        </Tooltip>
                    </div>
                </div>

                {/* BLOCK 2: NEW CHAT */}
                <div className="sidebar-new-chat">
                    <Button
                        block
                        icon={<PlusOutlined />}
                        className="new-chat-button"
                        onClick={handleNewChat}
                    >
                        {!collapsed && "New Chat"}
                    </Button>
                </div>

                {/* BLOCK 3: RECENT CHATS */}
                <div className="sidebar-chat-history">

                    {!collapsed && (
                        <div className="chat-history-heading">
                            RECENT CHATS
                        </div>
                    )}

                    {chatsLoading && !collapsed && (
                        <div className="chat-history-message">
                            Loading conversations...
                        </div>
                    )}

                    {chatsError && !collapsed && (
                        <div className="chat-history-message">
                            {chatsError}
                        </div>
                    )}

                    {!chatsLoading &&
                        !chatsError &&
                        chatItems.length === 0 &&
                        !collapsed && (
                            <div className="chat-history-message">
                                No conversations yet
                            </div>
                        )}

                    <Menu
                        mode="inline"
                        theme="dark"
                        items={chatItems}
                        selectedKeys={
                            selectedChatId ? [selectedChatId] : []
                        }
                        onClick={handleChatSelection}
                    />

                </div>

                {/* BLOCK 4: USER PROFILE */}
                <div className="sidebar-user">

                    <Avatar icon={<UserOutlined />} />

                    {!collapsed && (
                        <div className="sidebar-user-details">
                            <span className="sidebar-user-name">
                                {username}
                            </span>

                            <span className="sidebar-user-status">
                                {accountStatus}
                            </span>
                        </div>
                    )}

                </div>

            </div>
        </Sider>
    );
}

export default Sidebar;
